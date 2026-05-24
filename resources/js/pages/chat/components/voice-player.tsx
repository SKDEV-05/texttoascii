import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface VoicePlayerProps {
    audioUrl: string;
    duration: number;
    isSender: boolean;
}

export default function VoicePlayer({ audioUrl, duration, isSender }: VoicePlayerProps) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        const audio = new Audio(audioUrl);
        audioRef.current = audio;

        const updateTime = () => {
            setCurrentTime(audio.currentTime);
        };

        const onEnded = () => {
            setIsPlaying(false);
            setCurrentTime(0);
        };

        audio.addEventListener('timeupdate', updateTime);
        audio.addEventListener('ended', onEnded);

        return () => {
            audio.pause();
            audio.removeEventListener('timeupdate', updateTime);
            audio.removeEventListener('ended', onEnded);
        };
    }, [audioUrl]);

    const togglePlay = () => {
        if (!audioRef.current) return;

        if (isPlaying) {
            audioRef.current.pause();
            setIsPlaying(false);
        } else {
            audioRef.current.play().catch(err => console.error("Audio playback error:", err));
            setIsPlaying(true);
        }
    };

    const handleSeek = (value: number) => {
        if (!audioRef.current) return;
        audioRef.current.currentTime = value;
        setCurrentTime(value);
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    return (
        <div className={`flex items-center gap-3 py-2 px-3 rounded-2xl w-60 md:w-72 ${
            isSender 
                ? 'bg-primary-foreground/10 text-primary-foreground' 
                : 'bg-muted/40 text-foreground border border-muted-foreground/10'
        }`}>
            <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={togglePlay}
                className={`h-9 w-9 rounded-full shrink-0 ${
                    isSender 
                        ? 'hover:bg-primary-foreground/20 text-primary-foreground' 
                        : 'hover:bg-muted text-foreground'
                }`}
            >
                {isPlaying ? (
                    <Pause className="h-4 w-4 fill-current" />
                ) : (
                    <Play className="h-4 w-4 fill-current" />
                )}
            </Button>

            <div className="flex-1 space-y-1">
                <input
                    type="range"
                    min={0}
                    max={duration || 100}
                    step={0.1}
                    value={currentTime}
                    onChange={(e) => handleSeek(parseFloat(e.target.value))}
                    className={`w-full h-1 rounded-lg appearance-none cursor-pointer ${
                        isSender 
                            ? 'bg-primary-foreground/30 accent-primary-foreground' 
                            : 'bg-muted-foreground/30 accent-primary'
                    }`}
                />
                <div className="flex justify-between text-[10px] opacity-75 font-mono">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                </div>
            </div>

            <Volume2 className="h-4 w-4 shrink-0 opacity-60" />
        </div>
    );
}
