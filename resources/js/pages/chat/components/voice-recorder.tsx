import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Trash2, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface VoiceRecorderProps {
    onSend: (audioBlob: Blob, duration: number) => void;
    disabled?: boolean;
}

export default function VoiceRecorder({ onSend, disabled }: VoiceRecorderProps) {
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, []);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            audioChunksRef.current = [];
            
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
                if (audioBlob.size > 0 && recordingTime > 0) {
                    onSend(audioBlob, recordingTime);
                }
                
                // Stop all tracks to release mic
                stream.getTracks().forEach(track => track.stop());
                setRecordingTime(0);
            };

            mediaRecorder.start();
            setIsRecording(true);
            setRecordingTime(0);

            timerRef.current = setInterval(() => {
                setRecordingTime((prev) => prev + 1);
            }, 1000);
        } catch (err) {
            console.error('Error accessing microphone:', err);
            alert('Could not access microphone. Please check permissions.');
        }
    };

    const stopRecording = () => {
        if (!mediaRecorderRef.current) return;
        
        if (timerRef.current) {
            clearInterval(timerRef.current);
        }

        mediaRecorderRef.current.stop();
        setIsRecording(false);
    };

    const cancelRecording = () => {
        if (!mediaRecorderRef.current) return;

        if (timerRef.current) {
            clearInterval(timerRef.current);
        }

        mediaRecorderRef.current.onstop = () => {
            // Do nothing on stop when cancelled
            if (mediaRecorderRef.current) {
                const stream = mediaRecorderRef.current.stream;
                stream.getTracks().forEach(track => track.stop());
            }
            setRecordingTime(0);
        };

        mediaRecorderRef.current.stop();
        setIsRecording(false);
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    return (
        <div className="flex items-center gap-2">
            {isRecording ? (
                <div className="flex items-center gap-3 bg-destructive/10 px-4 py-1.5 rounded-full border border-destructive/20 animate-fade-in shadow-2xs">
                    <div className="flex items-center gap-1 select-none">
                        <span className="w-2 h-2 bg-red-600 rounded-full animate-pulse" />
                        
                        {/* Audio Waveform Micro-Visualizer */}
                        <div className="flex items-end gap-[2px] h-3.5 px-0.5">
                            <span className="w-[1.5px] h-2 bg-red-600 rounded-full animate-[pulse_0.6s_infinite_alternate]" />
                            <span className="w-[1.5px] h-3.5 bg-red-600 rounded-full animate-[pulse_0.8s_infinite_alternate]" />
                            <span className="w-[1.5px] h-1.5 bg-red-600 rounded-full animate-[pulse_0.5s_infinite_alternate]" />
                            <span className="w-[1.5px] h-2.5 bg-red-600 rounded-full animate-[pulse_0.7s_infinite_alternate]" />
                        </div>
                    </div>
                    
                    <span className="text-sm font-bold text-red-600 font-mono leading-none">{formatTime(recordingTime)}</span>
                    
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={cancelRecording}
                        className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full transition-all duration-200 active:scale-90 cursor-pointer"
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>

                    <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        onClick={stopRecording}
                        className="h-8 w-8 rounded-full shadow-md shadow-destructive/20 transition-transform active:scale-90 cursor-pointer"
                    >
                        <Square className="h-3.5 w-3.5 fill-white border-0" />
                    </Button>
                </div>
            ) : (
                <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    disabled={disabled}
                    onClick={startRecording}
                    className="h-11 w-11 rounded-full shrink-0 border border-muted-foreground/15 hover:border-primary/50 hover:bg-primary/5 text-muted-foreground hover:text-primary transition-all duration-300 hover:scale-103 active:scale-97 cursor-pointer"
                >
                    <Mic className="h-5 w-5" />
                </Button>
            )}
        </div>
    );
}
