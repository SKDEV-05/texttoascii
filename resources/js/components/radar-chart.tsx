import React, { useState, useEffect } from 'react';

export function RadarChart({ 
    values, 
    averageValues, 
    compareValues,
    colors = { primary: 'hsl(var(--primary))', compare: 'hsl(var(--destructive))' }
}: { 
    values: Record<string, number>; 
    averageValues?: Record<string, number>;
    compareValues?: Record<string, number>;
    colors?: { primary: string; compare: string };
}) {
    const keys = Object.keys(values);
    const n = keys.length;
    if (n === 0) return null;
    
    const cx = 100, cy = 100, r = 78;
    const angleStep = (2 * Math.PI) / n;

    const pt = (val: number, i: number) => {
        const angle = i * angleStep - Math.PI / 2;
        const scale = Math.max(0, Math.min(100, val)) / 100;
        return { x: cx + r * scale * Math.cos(angle), y: cy + r * scale * Math.sin(angle) };
    };

    const gridPts = (level: number) => keys.map((_, i) => {
        const angle = i * angleStep - Math.PI / 2;
        return `${cx + r * level * Math.cos(angle)},${cy + r * level * Math.sin(angle)}`;
    }).join(' ');

    const polygon = keys.map((k, i) => pt(values[k], i)).map(p => `${p.x},${p.y}`).join(' ');
    const avgPolygon = averageValues ? keys.map((k, i) => pt(averageValues[k], i)).map(p => `${p.x},${p.y}`).join(' ') : '';
    const comparePolygon = compareValues ? keys.map((k, i) => pt(compareValues[k], i)).map(p => `${p.x},${p.y}`).join(' ') : '';

    const [animated, setAnimated] = useState(false);
    useEffect(() => { const t = setTimeout(() => setAnimated(true), 100); return () => clearTimeout(t); }, []);
    
    const zeroPolygon = keys.map(() => `${cx},${cy}`).join(' ');

    return (
        <svg viewBox="0 0 200 200" className="w-full max-w-[300px] mx-auto overflow-visible">
            <defs>
                <radialGradient id="radarGradPrimary" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor={colors.primary} stopOpacity="0.3" />
                    <stop offset="100%" stopColor={colors.primary} stopOpacity="0.04" />
                </radialGradient>
                <radialGradient id="radarGradCompare" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor={colors.compare} stopOpacity="0.3" />
                    <stop offset="100%" stopColor={colors.compare} stopOpacity="0.04" />
                </radialGradient>
            </defs>
            
            {/* Grid */}
            {[0.25, 0.5, 0.75, 1].map((l, li) => (
                <polygon key={li} points={gridPts(l)} fill="none"
                    stroke="currentColor" strokeWidth={li === 3 ? '0.8' : '0.4'}
                    className="text-muted-foreground/20" />
            ))}
            
            {/* Axes */}
            {keys.map((_, i) => {
                const angle = i * angleStep - Math.PI / 2;
                return <line key={i} x1={cx} y1={cy} x2={cx + r * Math.cos(angle)} y2={cy + r * Math.sin(angle)}
                    stroke="currentColor" strokeWidth="0.4" className="text-muted-foreground/15" />;
            })}
            
            {/* Average Polygon */}
            {averageValues && avgPolygon && (
                <polygon points={animated ? avgPolygon : zeroPolygon}
                    fill="none" stroke="currentColor" strokeWidth="1.2" strokeDasharray="3,2"
                    className="text-amber-400/50"
                    style={{ transition: 'points 1.1s cubic-bezier(0.22,1,0.36,1)' }} />
            )}
            
            {/* Primary Polygon */}
            <polygon points={animated ? polygon : zeroPolygon}
                fill="url(#radarGradPrimary)" stroke={colors.primary} strokeWidth="1.8" strokeLinejoin="round"
                style={{ transition: 'points 1.1s cubic-bezier(0.22,1,0.36,1)' }} />
                
            {/* Compare Polygon */}
            {compareValues && comparePolygon && (
                <polygon points={animated ? comparePolygon : zeroPolygon}
                    fill="url(#radarGradCompare)" stroke={colors.compare} strokeWidth="1.8" strokeLinejoin="round"
                    style={{ transition: 'points 1.1s cubic-bezier(0.22,1,0.36,1)' }} />
            )}
            
            {/* Labels */}
            {keys.map((k, i) => {
                const angle = i * angleStep - Math.PI / 2;
                const lx = cx + (r + 18) * Math.cos(angle);
                const ly = cy + (r + 18) * Math.sin(angle);
                return (
                    <text key={k} x={lx} y={ly} textAnchor="middle" dominantBaseline="central"
                        className="fill-muted-foreground" fontSize="7.5" fontWeight="700">
                        {k}
                    </text>
                );
            })}
        </svg>
    );
}
