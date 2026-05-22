import React from 'react';
import { User, UserCircle2 } from 'lucide-react';

interface PitchAvatarProps {
    position: string;
    gender?: 'male' | 'female' | 'other';
    size?: 'sm' | 'md' | 'lg';
}

export default function PitchAvatar({ position, gender = 'male', size = 'md' }: PitchAvatarProps) {
    // Determine kit color based on role/position
    const getKitColor = (pos: string) => {
        const p = pos.toUpperCase();
        if (p === 'GK') return '#f97316'; // Orange
        if (['CB', 'LB', 'RB'].includes(p)) return '#22c55e'; // Green
        if (['CDM', 'CM', 'CAM', 'AMF', 'CMD'].includes(p)) return '#3b82f6'; // Blue
        if (['LW', 'RW', 'ST', 'CF'].includes(p)) return '#ef4444'; // Red
        return '#6b7280'; // Gray
    };

    const sizeMap = {
        sm: { container: 'h-12 w-12', icon: 24, font: 'text-[8px]' },
        md: { container: 'h-24 w-24', icon: 48, font: 'text-[10px]' },
        lg: { container: 'h-40 w-40', icon: 80, font: 'text-[14px]' },
    };

    const currentSize = sizeMap[size];
    const kitColor = getKitColor(position);

    return (
        <div className={`relative flex flex-col items-center justify-center rounded-full border-4 border-white shadow-xl bg-muted/20 ${currentSize.container} transition-transform hover:scale-110`}>
            {/* Jersey SVG Background */}
            <svg 
                viewBox="0 0 100 100" 
                className="absolute inset-0 h-full w-full opacity-90"
                fill={kitColor}
            >
                <path d="M20,30 L35,20 L65,20 L80,30 L80,80 L20,80 Z" />
                <path d="M35,20 L50,30 L65,20" fill="none" stroke="white" strokeWidth="2" />
            </svg>

            {/* Player Icon */}
            <div className="relative z-10 flex flex-col items-center">
                {gender === 'female' ? (
                    <UserCircle2 size={currentSize.icon} className="text-white drop-shadow-md" />
                ) : (
                    <User size={currentSize.icon} className="text-white drop-shadow-md" />
                )}
            </div>
            
            {/* Position Badge */}
            <div className={`absolute -bottom-2 z-20 flex h-6 w-14 items-center justify-center rounded-full bg-black/90 font-bold text-white uppercase tracking-widest shadow-md ${currentSize.font}`}>
                {position}
            </div>
        </div>
    );
}
