import logoUrl from '@/assets/logo/endo-talent-logo.png';
import type { HTMLAttributes } from 'react';

export default function AppLogoIcon({ className = '', ...props }: HTMLAttributes<HTMLDivElement>) {
    return (
        <div className={`relative overflow-hidden shrink-0 ${className}`} {...props}>
            <img
                src={logoUrl}
                alt="EndoTalent Emblem"
                className="absolute top-0 left-0 w-full h-[138%] object-cover object-top"
            />
        </div>
    );
}

