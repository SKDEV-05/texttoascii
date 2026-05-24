import type { SVGAttributes } from 'react';

export default function AppLogoIcon(props: SVGAttributes<SVGElement>) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            {...props}
        >
            {/* Outer ball circle */}
            <circle cx="12" cy="12" r="10" />
            {/* Center pentagon */}
            <polygon points="12 8.5, 15.5 11, 14 15, 10 15, 8.5 11" fill="currentColor" />
            {/* Seams connecting center to outer circle */}
            <line x1="12" y1="8.5" x2="12" y2="2" />
            <line x1="15.5" y1="11" x2="21" y2="9.5" />
            <line x1="14" y1="15" x2="18.5" y2="19.5" />
            <line x1="10" y1="15" x2="5.5" y2="19.5" />
            <line x1="8.5" y1="11" x2="3" y2="9.5" />
        </svg>
    );
}
