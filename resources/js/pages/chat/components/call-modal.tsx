import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Phone, Video, PhoneOff, Mic, MicOff, VideoOff, Clock } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import axios from 'axios';
import { start as startCall, signal as signalCall } from '@/routes/call';

interface CallModalProps {
    isOpen: boolean;
    onClose: () => void;
    conversationId: number;
    callType: 'voice' | 'video';
    isIncoming: boolean;
    recipientName: string;
    echo: any;
    currentUserId: number;
}

export default function CallModal({
    isOpen,
    onClose,
    conversationId,
    callType,
    isIncoming,
    recipientName,
    echo,
    currentUserId
}: CallModalProps) {
    const [callState, setCallState] = useState<'ringing' | 'connecting' | 'active' | 'ended'>(
        isIncoming ? 'ringing' : 'connecting'
    );
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(callType === 'voice');
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
    const [callDuration, setCallDuration] = useState(0);

    const pcRef = useRef<RTCPeerConnection | null>(null);
    const localVideoRef = useRef<HTMLVideoElement | null>(null);
    const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
    const remoteAudioRef = useRef<HTMLAudioElement | null>(null);
    const localStreamRef = useRef<MediaStream | null>(null);
    const callTimerRef = useRef<any>(null);
    const callActiveRef = useRef(false);

    // ICE candidate queue
    const isRemoteDescriptionSetRef = useRef<boolean>(false);
    const remoteCandidatesQueueRef = useRef<any[]>([]);

    // Ringtone refs
    const audioCtxRef = useRef<AudioContext | null>(null);
    const ringtoneOscRef = useRef<OscillatorNode | null>(null);
    const ringtoneIntervalRef = useRef<any>(null);

    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const stopRingtone = () => {
        if (ringtoneIntervalRef.current) {
            clearInterval(ringtoneIntervalRef.current);
            ringtoneIntervalRef.current = null;
        }
        if (ringtoneOscRef.current) {
            try { ringtoneOscRef.current.stop(); } catch (e) {}
            ringtoneOscRef.current = null;
        }
        if (audioCtxRef.current) {
            try { audioCtxRef.current.close(); } catch (e) {}
            audioCtxRef.current = null;
        }
    };

    const startCallTimer = () => {
        if (callTimerRef.current) return;
        setCallDuration(0);
        callTimerRef.current = setInterval(() => {
            setCallDuration(prev => prev + 1);
        }, 1000);
    };

    const stopCallTimer = () => {
        if (callTimerRef.current) {
            clearInterval(callTimerRef.current);
            callTimerRef.current = null;
        }
    };

    const markCallActive = () => {
        if (!callActiveRef.current) {
            callActiveRef.current = true;
            console.log('[Call] >>> ACTIVE');
            setCallState('active');
            stopRingtone();
            startCallTimer();
        }
    };

    const playRingtone = (incoming: boolean) => {
        try {
            stopRingtone();
            const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
            audioCtxRef.current = ctx;
            const osc = ctx.createOscillator();
            ringtoneOscRef.current = osc;
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.type = 'sine';

            if (incoming) {
                osc.frequency.setValueAtTime(440, ctx.currentTime);
                gain.gain.setValueAtTime(0.3, ctx.currentTime);
                osc.start();
                let toggle = true;
                ringtoneIntervalRef.current = setInterval(() => {
                    if (ctx.state === 'closed') return;
                    gain.gain.setValueAtTime(toggle ? 0.3 : 0, ctx.currentTime);
                    toggle = !toggle;
                }, 1000);
            } else {
                osc.frequency.setValueAtTime(350, ctx.currentTime);
                gain.gain.setValueAtTime(0.15, ctx.currentTime);
                osc.start();
                let toggle = true;
                ringtoneIntervalRef.current = setInterval(() => {
                    if (ctx.state === 'closed') return;
                    gain.gain.setValueAtTime(toggle ? 0.15 : 0, ctx.currentTime);
                    toggle = !toggle;
                }, 1500);
            }
        } catch (e) {
            console.error('[Call] Ringtone error:', e);
        }
    };

    const sendSignal = (type: string, data: any) => {
        console.log('[Call] Sending signal:', type);
        axios.post(signalCall(conversationId).url, { type, data })
            .then(() => console.log('[Call] Signal sent OK:', type))
            .catch(err => console.error('[Call] Signal FAILED:', type, err.response?.status, err.response?.data));
    };

    const setupPeerConnection = (stream: MediaStream): RTCPeerConnection => {
        const pc = new RTCPeerConnection({
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:stun1.l.google.com:19302' }
            ]
        });
        pcRef.current = pc;

        stream.getTracks().forEach(track => pc.addTrack(track, stream));

        pc.ontrack = (event) => {
            console.log('[Call] ontrack:', event.track.kind, 'streams:', event.streams.length);
            if (event.streams && event.streams[0]) {
                setRemoteStream(event.streams[0]);
            } else {
                setRemoteStream(prev => {
                    const s = prev || new MediaStream();
                    s.addTrack(event.track);
                    return s;
                });
            }
            markCallActive();
        };

        pc.onicecandidate = (event) => {
            if (event.candidate) {
                sendSignal('candidate', event.candidate);
            }
        };

        pc.onconnectionstatechange = () => {
            console.log('[Call] connState:', pc.connectionState);
            if (pc.connectionState === 'connected') markCallActive();
            if (pc.connectionState === 'failed') endCall(false);
        };

        pc.oniceconnectionstatechange = () => {
            console.log('[Call] iceState:', pc.iceConnectionState);
            if (pc.iceConnectionState === 'connected' || pc.iceConnectionState === 'completed') markCallActive();
        };

        return pc;
    };

    // --- Signal handler (called from useEffect listener) ---
    const onSignal = async (type: string, data: any) => {
        console.log('[Call] onSignal:', type);

        if (type === 'accept') {
            stopRingtone();
            // Caller starts WebRTC after receiver accepts
            if (!isIncoming) {
                console.log('[Call] Receiver accepted, starting WebRTC...');
                try {
                    const stream = await navigator.mediaDevices.getUserMedia({
                        audio: true,
                        video: callType === 'video'
                    });
                    setLocalStream(stream);
                    localStreamRef.current = stream;
                    const pc = setupPeerConnection(stream);
                    const offer = await pc.createOffer();
                    await pc.setLocalDescription(offer);
                    sendSignal('offer', offer);
                    console.log('[Call] Offer sent');
                } catch (err) {
                    console.error('[Call] getUserMedia error:', err);
                    endCall(true);
                }
            }
        } else if (type === 'offer') {
            const pc = pcRef.current;
            if (!pc) {
                console.error('[Call] No PC for offer!');
                return;
            }
            try {
                let sdp = data.sdp;
                if (sdp && !sdp.endsWith('\n')) {
                    sdp += '\r\n';
                }
                await pc.setRemoteDescription(new RTCSessionDescription({
                    type: data.type || 'offer',
                    sdp: sdp
                }));
                isRemoteDescriptionSetRef.current = true;
                console.log('[Call] Remote offer set, flushing', remoteCandidatesQueueRef.current.length, 'queued candidates');
                // Flush queued candidates
                for (const c of remoteCandidatesQueueRef.current) {
                    try { await pc.addIceCandidate(new RTCIceCandidate(c)); } catch (e) {}
                }
                remoteCandidatesQueueRef.current = [];
                const answer = await pc.createAnswer();
                await pc.setLocalDescription(answer);
                sendSignal('answer', answer);
                console.log('[Call] Answer sent');
            } catch (e) {
                console.error('[Call] Offer handling error:', e);
            }
        } else if (type === 'answer') {
            const pc = pcRef.current;
            if (!pc) return;
            try {
                let sdp = data.sdp;
                if (sdp && !sdp.endsWith('\n')) {
                    sdp += '\r\n';
                }
                await pc.setRemoteDescription(new RTCSessionDescription({
                    type: data.type || 'answer',
                    sdp: sdp
                }));
                isRemoteDescriptionSetRef.current = true;
                console.log('[Call] Remote answer set, flushing', remoteCandidatesQueueRef.current.length, 'queued candidates');
                for (const c of remoteCandidatesQueueRef.current) {
                    try { await pc.addIceCandidate(new RTCIceCandidate(c)); } catch (e) {}
                }
                remoteCandidatesQueueRef.current = [];
            } catch (e) {
                console.error('[Call] Answer handling error:', e);
            }
        } else if (type === 'candidate') {
            const pc = pcRef.current;
            if (!pc || !isRemoteDescriptionSetRef.current) {
                console.log('[Call] Queueing ICE candidate');
                remoteCandidatesQueueRef.current.push(data);
            } else {
                try {
                    await pc.addIceCandidate(new RTCIceCandidate(data));
                } catch (e) {
                    console.error('[Call] ICE candidate error:', e);
                }
            }
        } else if (type === 'decline' || type === 'hangup') {
            endCall(false);
        }
    };

    // --- Main setup effect ---
    useEffect(() => {
        if (!isOpen || !echo) return;

        // Listen for call signals on the PRIVATE chat channel (already authenticated)
        const chatChannel = echo.private(`chat.${conversationId}`);
        const signalHandler = (e: { type: string, data: any, from_user_id: number }) => {
            console.log('[Call] Received signal event:', e.type, 'from:', e.from_user_id);
            if (e.from_user_id === currentUserId) return;
            onSignal(e.type, e.data);
        };
        chatChannel.listen('.call.signal', signalHandler);
        console.log('[Call] Listening on private chat channel for signals');

        // Start ringing
        if (isIncoming) {
            playRingtone(true);
        } else {
            axios.post(startCall(conversationId).url, { call_type: callType })
                .then(() => console.log('[Call] Call started OK'))
                .catch((error) => {
                    console.error('[Call] Start call failed:', error.response?.data);
                    alert(error.response?.data?.error || 'Failed to start call');
                    onClose();
                });
            playRingtone(false);
        }

        return () => {
            chatChannel.stopListening('.call.signal');
            cleanupCall();
        };
    }, [isOpen, conversationId, echo]);

    // Attach streams to video/audio elements
    useEffect(() => {
        if (localVideoRef.current && localStream) {
            localVideoRef.current.srcObject = localStream;
        }
    }, [localStream, callState, isVideoOff]);

    useEffect(() => {
        if (remoteStream) {
            if (remoteVideoRef.current) remoteVideoRef.current.srcObject = remoteStream;
            if (remoteAudioRef.current) remoteAudioRef.current.srcObject = remoteStream;
        }
    }, [remoteStream, callState]);

    // --- Accept (receiver clicks green button) ---
    const handleAccept = async () => {
        setCallState('connecting');
        stopRingtone();
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: true,
                video: callType === 'video'
            });
            setLocalStream(stream);
            localStreamRef.current = stream;
            setupPeerConnection(stream);
            // Tell caller we're ready
            sendSignal('accept', {});
            console.log('[Call] Accepted, waiting for offer...');
        } catch (err) {
            console.error('[Call] Accept error:', err);
            alert('Microphone/Camera permission denied.');
            endCall(true);
        }
    };

    const handleDecline = () => {
        sendSignal('decline', {});
        endCall(true);
    };

    const handleHangUp = () => {
        sendSignal('hangup', {});
        endCall(true);
    };

    const endCall = (locallyInitiated: boolean) => {
        setCallState('ended');
        stopCallTimer();
        cleanupCall();
        setTimeout(() => onClose(), 1200);
    };

    const cleanupCall = () => {
        stopRingtone();
        stopCallTimer();
        callActiveRef.current = false;
        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(t => t.stop());
            localStreamRef.current = null;
        }
        if (pcRef.current) {
            pcRef.current.close();
            pcRef.current = null;
        }
        isRemoteDescriptionSetRef.current = false;
        remoteCandidatesQueueRef.current = [];
        setLocalStream(null);
        setRemoteStream(null);
    };

    const toggleMute = () => {
        if (localStreamRef.current) {
            const t = localStreamRef.current.getAudioTracks()[0];
            if (t) { t.enabled = !t.enabled; setIsMuted(!t.enabled); }
        }
    };

    const toggleVideo = () => {
        if (localStreamRef.current && callType === 'video') {
            const t = localStreamRef.current.getVideoTracks()[0];
            if (t) { t.enabled = !t.enabled; setIsVideoOff(!t.enabled); }
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={() => {}}>
            <DialogContent className="max-w-md w-full h-[550px] p-0 rounded-3xl overflow-hidden border border-muted-foreground/20 bg-slate-950 text-white flex flex-col justify-between">
                
                <DialogTitle className="sr-only">Call with {recipientName}</DialogTitle>

                {/* Hidden audio element for remote audio playback */}
                <audio ref={remoteAudioRef} autoPlay playsInline />

                {/* Upper Status */}
                <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-4">
                    <div className="relative">
                        <div className={`h-24 w-24 rounded-full flex items-center justify-center border-2 ring-4 ${
                            callState === 'active'
                                ? 'bg-emerald-500/10 border-emerald-500 ring-emerald-500/20'
                                : 'bg-primary/10 border-primary ring-primary/20 animate-pulse'
                        }`}>
                            {callType === 'video' ? (
                                <Video className={`h-10 w-10 ${callState === 'active' ? 'text-emerald-500' : 'text-primary'}`} />
                            ) : (
                                <Phone className={`h-10 w-10 ${callState === 'active' ? 'text-emerald-500' : 'text-primary'}`} />
                            )}
                        </div>
                    </div>
                    
                    <div>
                        <h3 className="text-2xl font-black tracking-tight">{recipientName}</h3>
                        <p className={`text-xs uppercase tracking-widest mt-1 ${
                            callState === 'active' ? 'text-emerald-400' : 'text-muted-foreground'
                        }`}>
                            {callState === 'ringing' && 'Incoming Call...'}
                            {callState === 'connecting' && 'Connecting...'}
                            {callState === 'active' && (
                                <span className="flex items-center justify-center gap-1.5">
                                    <Clock className="h-3 w-3" />
                                    {formatDuration(callDuration)}
                                </span>
                            )}
                            {callState === 'ended' && `Call Ended · ${formatDuration(callDuration)}`}
                        </p>
                    </div>
                </div>

                {/* Video overlay */}
                {callType === 'video' && callState === 'active' && (
                    <div className="absolute inset-0 bg-black flex flex-col justify-end overflow-hidden z-10">
                        <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
                        {!isVideoOff && (
                            <div className="absolute top-4 right-4 w-28 h-40 bg-slate-900 border-2 border-primary rounded-xl overflow-hidden shadow-2xl">
                                <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                            </div>
                        )}
                        <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-sm px-4 py-2 rounded-full z-20 flex items-center gap-3">
                            <span className="text-xs font-bold text-white leading-none">{recipientName}</span>
                            <span className="text-xs text-emerald-400 font-mono flex items-center gap-1 leading-none border-l border-white/20 pl-3">
                                <Clock className="h-3.5 w-3.5" />
                                {formatDuration(callDuration)}
                            </span>
                        </div>
                    </div>
                )}

                {/* Controls */}
                <div className="relative p-8 bg-slate-900/90 backdrop-blur-md flex flex-col items-center gap-6 border-t border-white/5 z-20">
                    {callState === 'ringing' ? (
                        <div className="flex justify-center gap-10 w-full">
                            <Button onClick={handleDecline} variant="destructive" size="lg"
                                className="h-14 w-14 rounded-full flex items-center justify-center p-0 shadow-lg shadow-red-500/20">
                                <PhoneOff className="h-6 w-6" />
                            </Button>
                            <Button onClick={handleAccept}
                                className="bg-emerald-600 hover:bg-emerald-700 h-14 w-14 rounded-full flex items-center justify-center p-0 shadow-lg shadow-emerald-500/20">
                                <Phone className="h-6 w-6" />
                            </Button>
                        </div>
                    ) : (
                        <div className="flex justify-center items-center gap-6 w-full">
                            <Button onClick={toggleMute} variant={isMuted ? 'destructive' : 'secondary'} size="icon"
                                className="h-12 w-12 rounded-full border border-white/10">
                                {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                            </Button>
                            <Button onClick={handleHangUp} variant="destructive" size="lg"
                                className="h-14 w-14 rounded-full flex items-center justify-center p-0 shadow-lg shadow-red-500/30">
                                <PhoneOff className="h-6 w-6" />
                            </Button>
                            {callType === 'video' && (
                                <Button onClick={toggleVideo} variant={isVideoOff ? 'destructive' : 'secondary'} size="icon"
                                    className="h-12 w-12 rounded-full border border-white/10">
                                    {isVideoOff ? <VideoOff className="h-5 w-5" /> : <Video className="h-5 w-5" />}
                                </Button>
                            )}
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
