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
        <div className={`flex items-center gap-3 py-2 px-3.5 rounded-2xl w-60 md:w-72 transition-all duration-300 ${
            isSender 
                ? 'bg-primary-foreground/15 text-primary-foreground shadow-2xs border border-primary-foreground/5' 
                : 'bg-muted/60 text-foreground border border-muted-foreground/15 shadow-2xs hover:bg-muted/70'
        }`}>
            <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={togglePlay}
                className={`h-9 w-9 rounded-full shrink-0 transition-transform active:scale-90 ${
                    isSender 
                        ? 'hover:bg-primary-foreground/25 text-primary-foreground' 
                        : 'hover:bg-muted-foreground/10 text-foreground'
                }`}
            >
                {isPlaying ? (
                    <Pause className="h-4 w-4 fill-current animate-fade-in" />
                ) : (
                    <Play className="h-4 w-4 fill-current animate-fade-in" />
                )}
            </Button>

            <div className="flex-1 space-y-1 select-none">
                <input
                    type="range"
                    min={0}
                    max={duration || 100}
                    step={0.1}
                    value={currentTime}
                    onChange={(e) => handleSeek(parseFloat(e.target.value))}
                    className={`w-full h-1 rounded-lg appearance-none cursor-pointer outline-none transition-all [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2.5 [&::-webkit-slider-thumb]:h-2.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:transition-transform hover:[&::-webkit-slider-thumb]:scale-120 [&::-moz-range-thumb]:w-2.5 [&::-moz-range-thumb]:h-2.5 [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:transition-transform hover:[&::-moz-range-thumb]:scale-120 ${
                        isSender 
                            ? 'bg-primary-foreground/35 [&::-webkit-slider-thumb]:bg-primary-foreground [&::-moz-range-thumb]:bg-primary-foreground' 
                            : 'bg-muted-foreground/35 [&::-webkit-slider-thumb]:bg-primary [&::-moz-range-thumb]:bg-primary'
                    }`}
                />
                <div className="flex justify-between text-[9px] opacity-80 font-mono tracking-tight leading-none">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                </div>
            </div>

            <Volume2 className="h-4 w-4 shrink-0 opacity-70 transition-opacity hover:opacity-100" />
        </div>
    );
}
