import React from 'react';
import gkAvatar from '@/assets/charcteres/Mamoru Endou (gardien).png';
import defAvatar from '@/assets/charcteres/Ichirouta Kazemaru (deffence).png';
import midAvatar from '@/assets/charcteres/Yuuto Kidou (milieu).png';
import attAvatar from '@/assets/charcteres/YShuuya Gouenji (Attack).png';

interface PitchAvatarProps {
    position: string;
    gender?: 'male' | 'female' | 'other';
    size?: 'sm' | 'md' | 'lg';
}

export default function PitchAvatar({ position, size = 'md' }: PitchAvatarProps) {
    const getCharacterImage = (pos: string) => {
        const p = pos.toUpperCase();
        if (p === 'GK') {
            return gkAvatar;
        }
        if (['CB', 'LB', 'RB'].includes(p)) {
            return defAvatar;
        }
        if (['CDM', 'CM', 'CAM', 'AMF', 'CMD'].includes(p)) {
            return midAvatar;
        }
        if (['LW', 'RW', 'ST', 'CF'].includes(p)) {
            return attAvatar;
        }
        return midAvatar;
    };

    const sizeMap = {
        sm: { container: 'h-12 w-12', font: 'text-[8px]' },
        md: { container: 'h-24 w-24', font: 'text-[10px]' },
        lg: { container: 'h-40 w-40', font: 'text-[14px]' },
    };

    const currentSize = sizeMap[size];
    const characterImage = getCharacterImage(position);

    return (
        <div className={`relative flex flex-col items-center justify-center ${currentSize.container} transition-all duration-300 hover:scale-105 group`}>
            {/* Outer Glow / Pulse ring */}
            <div className="absolute inset-0 rounded-full bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 scale-102 blur-xs" />
            
            {/* Image Wrapper */}
            <div className="absolute inset-0 rounded-full border-3 border-card shadow-lg bg-gradient-to-b from-primary/10 to-teal-500/5 overflow-hidden transition-all duration-300 group-hover:border-primary/40 group-hover:shadow-primary/10">
                <img 
                    src={characterImage} 
                    alt={`${position} Character`}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-108"
                />
            </div>
            
            {/* Position Badge */}
            <div className={`absolute -bottom-2 z-20 flex h-6 w-14 items-center justify-center rounded-full bg-gradient-to-r from-zinc-950 to-neutral-900 border border-muted-foreground/30 font-bold text-white uppercase tracking-wider shadow-md select-none transition-colors group-hover:border-primary/50 group-hover:from-neutral-900 group-hover:to-zinc-950 ${currentSize.font}`}>
                {position}
            </div>
        </div>
    );
}

