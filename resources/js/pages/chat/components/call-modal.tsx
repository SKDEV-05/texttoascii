import React, { useEffect, useState, useRef } from 'react';
import { Phone, Video, PhoneOff, Mic, MicOff, VideoOff, Volume2 } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { router } from '@inertiajs/react';
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

    const pcRef = useRef<RTCPeerConnection | null>(null);
    const localVideoRef = useRef<HTMLVideoElement | null>(null);
    const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
    const localStreamRef = useRef<MediaStream | null>(null);
    const presenceChannelRef = useRef<any>(null);

    // Audio elements for ringtones
    const ringtoneRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        if (!isOpen) return;

        // Initialize presence channel for WebRTC signaling
        if (echo) {
            presenceChannelRef.current = echo.join(`call.${conversationId}`)
                .here((users: any[]) => {
                    console.log('Joined call channel. Users here:', users);
                    // If we are the caller and we are the only one in the room, wait for recipient to join
                    if (!isIncoming && users.length > 1) {
                        startWebRTCCall();
                    }
                })
                .joining((user: any) => {
                    console.log('User joined call room:', user);
                    if (!isIncoming && user.id !== currentUserId) {
                        startWebRTCCall();
                    }
                })
                .leaving((user: any) => {
                    console.log('User left call room:', user);
                    if (user.id !== currentUserId) {
                        endCall(false);
                    }
                })
                .listen('.call.signal', (e: { type: string, data: any, from_user_id: number }) => {
                    if (e.from_user_id === currentUserId) return;
                    handleSignalingData(e.type, e.data);
                });
        }

        // Start ringing sound if incoming
        if (isIncoming) {
            playRingtone(true);
        } else {
            // Initiate the call notification on web.php route
            axios.post(startCall(conversationId).url, { call_type: callType })
                .catch((error) => {
                    const message = error.response?.data?.error || 'Failed to start call';
                    alert(message);
                    onClose();
                });
            playRingtone(false); // Play outgoing call signal
        }

        return () => {
            cleanupCall();
        };
    }, [isOpen, conversationId, echo]);

    // Update video element sources when stream changes
    useEffect(() => {
        if (localVideoRef.current && localStream) {
            localVideoRef.current.srcObject = localStream;
        }
    }, [localStream]);

    useEffect(() => {
        if (remoteVideoRef.current && remoteStream) {
            remoteVideoRef.current.srcObject = remoteStream;
        }
    }, [remoteStream]);

    const playRingtone = (incoming: boolean) => {
        // Simple synthetic sound using AudioContext if no file is present
        try {
            const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.type = 'sine';
            
            if (incoming) {
                // Repeating ring
                osc.frequency.setValueAtTime(440, ctx.currentTime); // A4
                gain.gain.setValueAtTime(0.3, ctx.currentTime);
                osc.start();
                // Custom pulsing
                let toggle = true;
                const interval = setInterval(() => {
                    if (!isOpen) {
                        clearInterval(interval);
                        osc.stop();
                        return;
                    }
                    gain.gain.setValueAtTime(toggle ? 0.3 : 0, ctx.currentTime);
                    toggle = !toggle;
                }, 1000);
            } else {
                // Outgoing pulse
                osc.frequency.setValueAtTime(350, ctx.currentTime);
                gain.gain.setValueAtTime(0.15, ctx.currentTime);
                osc.start();
                let toggle = true;
                const interval = setInterval(() => {
                    if (!isOpen) {
                        clearInterval(interval);
                        osc.stop();
                        return;
                    }
                    gain.gain.setValueAtTime(toggle ? 0.15 : 0, ctx.currentTime);
                    toggle = !toggle;
                }, 1500);
            }
        } catch (e) {
            console.error('AudioContext ringtone error:', e);
        }
    };

    const startWebRTCCall = async () => {
        setCallState('connecting');
        try {
            const constraints = {
                audio: true,
                video: callType === 'video'
            };
            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            setLocalStream(stream);
            localStreamRef.current = stream;

            const configuration = {
                iceServers: [
                    { urls: 'stun:stun.l.google.com:19302' },
                    { urls: 'stun:stun1.l.google.com:19302' }
                ]
            };

            const pc = new RTCPeerConnection(configuration);
            pcRef.current = pc;

            // Add local tracks to PeerConnection
            stream.getTracks().forEach((track) => {
                pc.addTrack(track, stream);
            });

            // Track remote media
            pc.ontrack = (event) => {
                console.log('Received remote stream:', event.streams[0]);
                setRemoteStream(event.streams[0]);
                setCallState('active');
            };

            pc.onicecandidate = (event) => {
                if (event.candidate) {
                    sendSignalingData('candidate', event.candidate);
                }
            };

            // Caller creates offer
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            sendSignalingData('offer', offer);
        } catch (err) {
            console.error('WebRTC local media error:', err);
            alert('Could not start video/audio capture.');
            endCall(true);
        }
    };

    const handleAccept = async () => {
        setCallState('connecting');
        try {
            const constraints = {
                audio: true,
                video: callType === 'video'
            };
            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            setLocalStream(stream);
            localStreamRef.current = stream;

            const configuration = {
                iceServers: [
                    { urls: 'stun:stun.l.google.com:19302' },
                    { urls: 'stun:stun1.l.google.com:19302' }
                ]
            };

            const pc = new RTCPeerConnection(configuration);
            pcRef.current = pc;

            stream.getTracks().forEach((track) => {
                pc.addTrack(track, stream);
            });

            pc.ontrack = (event) => {
                console.log('Received remote stream:', event.streams[0]);
                setRemoteStream(event.streams[0]);
                setCallState('active');
            };

            pc.onicecandidate = (event) => {
                if (event.candidate) {
                    sendSignalingData('candidate', event.candidate);
                }
            };
        } catch (err) {
            console.error('Error accepting call:', err);
            alert('Microphone/Camera permission denied.');
            endCall(true);
        }
    };

    const handleSignalingData = async (type: string, data: any) => {
        const pc = pcRef.current;

        if (type === 'offer') {
            if (!pc) return;
            await pc.setRemoteDescription(new RTCSessionDescription(data));
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            sendSignalingData('answer', answer);
        } else if (type === 'answer') {
            if (!pc) return;
            await pc.setRemoteDescription(new RTCSessionDescription(data));
        } else if (type === 'candidate') {
            if (!pc) return;
            try {
                await pc.addIceCandidate(new RTCIceCandidate(data));
            } catch (e) {
                console.error('Error adding remote ICE candidate:', e);
            }
        } else if (type === 'decline' || type === 'hangup') {
            endCall(false);
        }
    };

    const sendSignalingData = (type: string, data: any) => {
        axios.post(signalCall(conversationId).url, {
            type,
            data
        });
    };

    const handleDecline = () => {
        sendSignalingData('decline', {});
        endCall(true);
    };

    const handleHangUp = () => {
        sendSignalingData('hangup', {});
        endCall(true);
    };

    const endCall = (locallyInitiated: boolean) => {
        setCallState('ended');
        cleanupCall();
        setTimeout(() => {
            onClose();
        }, 1000);
    };

    const cleanupCall = () => {
        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach((track) => track.stop());
        }
        if (pcRef.current) {
            pcRef.current.close();
            pcRef.current = null;
        }
        if (echo && presenceChannelRef.current) {
            echo.leave(`call.${conversationId}`);
            presenceChannelRef.current = null;
        }
        setLocalStream(null);
        setRemoteStream(null);
    };

    const toggleMute = () => {
        if (localStreamRef.current) {
            const audioTrack = localStreamRef.current.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = !audioTrack.enabled;
                setIsMuted(!audioTrack.enabled);
            }
        }
    };

    const toggleVideo = () => {
        if (localStreamRef.current && callType === 'video') {
            const videoTrack = localStreamRef.current.getVideoTracks()[0];
            if (videoTrack) {
                videoTrack.enabled = !videoTrack.enabled;
                setIsVideoOff(!videoTrack.enabled);
            }
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={() => {}}>
            <DialogContent className="max-w-md w-full h-[550px] p-0 rounded-3xl overflow-hidden border border-muted-foreground/20 bg-slate-950 text-white flex flex-col justify-between">
                
                {/* Upper Status/User info */}
                <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-4">
                    <div className="relative">
                        <div className="h-24 w-24 bg-primary/10 rounded-full flex items-center justify-center border-2 border-primary ring-4 ring-primary/20 animate-pulse">
                            {callType === 'video' ? (
                                <Video className="h-10 w-10 text-primary" />
                            ) : (
                                <Phone className="h-10 w-10 text-primary" />
                            )}
                        </div>
                    </div>
                    
                    <div>
                        <h3 className="text-2xl font-black tracking-tight">{recipientName}</h3>
                        <p className="text-xs text-muted-foreground uppercase tracking-widest mt-1">
                            {callState === 'ringing' && 'Incoming Call...'}
                            {callState === 'connecting' && 'Connecting...'}
                            {callState === 'active' && 'Active Call'}
                            {callState === 'ended' && 'Call Ended'}
                        </p>
                    </div>
                </div>

                {/* Video Streams section if video call and active */}
                {callType === 'video' && callState === 'active' && (
                    <div className="absolute inset-0 bg-black flex flex-col justify-end overflow-hidden z-10">
                        {/* Remote Video Stream */}
                        <video
                            ref={remoteVideoRef}
                            autoPlay
                            playsInline
                            className="w-full h-full object-cover"
                        />
                        {/* Local Video Picture-in-Picture */}
                        {!isVideoOff && (
                            <div className="absolute top-4 right-4 w-28 h-40 bg-slate-900 border-2 border-primary rounded-xl overflow-hidden shadow-2xl">
                                <video
                                    ref={localVideoRef}
                                    autoPlay
                                    playsInline
                                    muted
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        )}
                    </div>
                )}

                {/* Bottom Control Bar */}
                <div className="p-8 bg-slate-900/90 backdrop-blur-md flex flex-col items-center gap-6 border-t border-white/5 z-20">
                    {callState === 'ringing' ? (
                        <div className="flex justify-center gap-10 w-full">
                            <Button
                                onClick={handleDecline}
                                variant="destructive"
                                size="lg"
                                className="h-14 w-14 rounded-full flex items-center justify-center p-0 shadow-lg shadow-red-500/20"
                            >
                                <PhoneOff className="h-6 w-6" />
                            </Button>
                            <Button
                                onClick={handleAccept}
                                className="bg-emerald-600 hover:bg-emerald-700 h-14 w-14 rounded-full flex items-center justify-center p-0 shadow-lg shadow-emerald-500/20"
                            >
                                <Phone className="h-6 w-6" />
                            </Button>
                        </div>
                    ) : (
                        <div className="flex justify-center items-center gap-6 w-full">
                            {/* Mute Mic */}
                            <Button
                                onClick={toggleMute}
                                variant={isMuted ? 'destructive' : 'secondary'}
                                size="icon"
                                className="h-12 w-12 rounded-full border border-white/10"
                            >
                                {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                            </Button>

                            {/* Hang Up */}
                            <Button
                                onClick={handleHangUp}
                                variant="destructive"
                                size="lg"
                                className="h-14 w-14 rounded-full flex items-center justify-center p-0 shadow-lg shadow-red-500/30"
                            >
                                <PhoneOff className="h-6 w-6" />
                            </Button>

                            {/* Toggle Video */}
                            {callType === 'video' && (
                                <Button
                                    onClick={toggleVideo}
                                    variant={isVideoOff ? 'destructive' : 'secondary'}
                                    size="icon"
                                    className="h-12 w-12 rounded-full border border-white/10"
                                >
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
