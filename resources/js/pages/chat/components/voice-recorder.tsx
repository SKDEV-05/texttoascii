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
                <div className="flex items-center gap-3 bg-destructive/10 px-4 py-1.5 rounded-full border border-destructive/20 animate-pulse">
                    <span className="w-2.5 h-2.5 bg-red-600 rounded-full animate-ping" />
                    <span className="text-sm font-semibold text-red-600">{formatTime(recordingTime)}</span>
                    
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={cancelRecording}
                        className="h-8 w-8 text-muted-foreground hover:text-foreground rounded-full"
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>

                    <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        onClick={stopRecording}
                        className="h-8 w-8 rounded-full"
                    >
                        <Square className="h-4 w-4 fill-white" />
                    </Button>
                </div>
            ) : (
                <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    disabled={disabled}
                    onClick={startRecording}
                    className="h-11 w-11 rounded-full shrink-0 border-muted-foreground/20 hover:bg-muted"
                >
                    <Mic className="h-5 w-5 text-muted-foreground" />
                </Button>
            )}
        </div>
    );
}
