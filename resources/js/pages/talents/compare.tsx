import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadarChart } from '@/components/radar-chart';
import PitchAvatar from '@/components/pitch-avatar';
import { ArrowLeft, User, Video, Shield, Activity, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function CompareTalents({ talents, initialTalent1, initialTalent2 }: { talents: any[], initialTalent1?: any, initialTalent2?: any }) {
    const [talent1Id, setTalent1Id] = useState<number | ''>(initialTalent1?.id || '');
    const [talent2Id, setTalent2Id] = useState<number | ''>(initialTalent2?.id || '');

    const talent1 = talents.find(t => t.id === talent1Id);
    const talent2 = talents.find(t => t.id === talent2Id);

    const getStats = (talent: any) => {
        if (!talent) return null;
        
        // Default base stats if none exist
        const defaultStats = {
            'Physical': 65,
            'Technical': 70,
            'Tactical': 60,
            'Mental': 75,
            'Pace': 70
        };

        if (!talent.overall_stats || Object.keys(talent.overall_stats).length === 0) {
            return defaultStats;
        }

        return talent.overall_stats;
    };

    const stats1 = getStats(talent1);
    const stats2 = getStats(talent2);

    return (
        <AppLayout breadcrumbs={[
            { title: 'Talents', href: '/talents' },
            { title: 'Compare', href: '/talents/compare' }
        ]}>
            <Head title="Compare Talents" />
            
            <div className="flex flex-col gap-8 p-6 lg:p-10 animate-fade-in text-left">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <Link href="/talents" className="inline-flex items-center text-sm font-bold text-muted-foreground hover:text-foreground mb-2 transition-colors">
                            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Directory
                        </Link>
                        <h1 className="text-4xl font-black italic uppercase tracking-tight text-foreground">
                            TALENT <span className="text-primary">COMPARISON</span>
                        </h1>
                        <p className="text-muted-foreground font-medium mt-1">
                            Select two talents to compare their AI-generated statistics.
                        </p>
                    </div>
                </div>

                {/* Selection Controls */}
                <div className="grid md:grid-cols-2 gap-8">
                    {/* Select Talent 1 */}
                    <Card className="p-6 bg-card/60 backdrop-blur-sm border-muted-foreground/20 shadow-md rounded-3xl">
                        <label className="text-xs font-black uppercase tracking-widest text-muted-foreground block mb-2">Talent 1</label>
                        <select
                            value={talent1Id}
                            onChange={(e) => setTalent1Id(Number(e.target.value))}
                            className="w-full h-12 px-4 rounded-xl border border-muted-foreground/30 bg-card focus:ring-2 focus:ring-primary focus:border-primary font-bold shadow-sm"
                        >
                            <option value="">Select a talent...</option>
                            {talents.map((t) => (
                                <option key={t.id} value={t.id}>{t.name} ({t.position || 'Unknown'})</option>
                            ))}
                        </select>
                    </Card>

                    {/* Select Talent 2 */}
                    <Card className="p-6 bg-card/60 backdrop-blur-sm border-muted-foreground/20 shadow-md rounded-3xl">
                        <label className="text-xs font-black uppercase tracking-widest text-muted-foreground block mb-2">Talent 2</label>
                        <select
                            value={talent2Id}
                            onChange={(e) => setTalent2Id(Number(e.target.value))}
                            className="w-full h-12 px-4 rounded-xl border border-muted-foreground/30 bg-card focus:ring-2 focus:ring-destructive focus:border-destructive font-bold shadow-sm"
                        >
                            <option value="">Select a talent...</option>
                            {talents.map((t) => (
                                <option key={t.id} value={t.id}>{t.name} ({t.position || 'Unknown'})</option>
                            ))}
                        </select>
                    </Card>
                </div>

                {/* Comparison View */}
                {talent1 && talent2 ? (
                    <div className="grid lg:grid-cols-3 gap-8 items-start">
                        {/* Profile 1 */}
                        <Card className="p-6 bg-card border-primary/20 shadow-lg shadow-primary/5 rounded-3xl text-center relative overflow-hidden flex flex-col items-center">
                            <div className="absolute top-0 inset-x-0 h-1 bg-primary"></div>
                            <PitchAvatar position={talent1.position || 'GK'} size="lg" className="mb-4" />
                            <h2 className="text-2xl font-black text-foreground">{talent1.name}</h2>
                            <Badge className="mt-2 bg-primary/10 text-primary border-primary/20">{talent1.position || 'Player'}</Badge>
                            
                            <div className="mt-6 w-full space-y-4 text-left">
                                <div className="flex justify-between items-center py-2 border-b border-muted-foreground/10">
                                    <span className="text-sm font-semibold text-muted-foreground flex items-center gap-2"><User className="w-4 h-4" /> Nationality</span>
                                    <span className="font-bold">{talent1.nationality || 'N/A'}</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-muted-foreground/10">
                                    <span className="text-sm font-semibold text-muted-foreground flex items-center gap-2"><Activity className="w-4 h-4" /> Height</span>
                                    <span className="font-bold">{talent1.height_cm ? `${talent1.height_cm} cm` : 'N/A'}</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-muted-foreground/10">
                                    <span className="text-sm font-semibold text-muted-foreground flex items-center gap-2"><Video className="w-4 h-4" /> Videos</span>
                                    <span className="font-bold">{talent1.videos_count || 0}</span>
                                </div>
                            </div>
                            
                            <Button asChild className="w-full mt-6 rounded-xl font-bold bg-primary hover:bg-primary/90 text-white">
                                <Link href={`/talents/${talent1.id}`}>View Profile</Link>
                            </Button>
                        </Card>

                        {/* Chart Area */}
                        <div className="flex flex-col items-center justify-center pt-8">
                            <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground mb-8 text-center w-full">
                                AI Stats Comparison
                            </h3>
                            <div className="w-full relative min-h-[300px] flex items-center justify-center">
                                <RadarChart 
                                    values={stats1} 
                                    compareValues={stats2} 
                                    colors={{ primary: 'hsl(var(--primary))', compare: 'hsl(var(--destructive))' }}
                                />
                            </div>
                            
                            <div className="flex items-center gap-8 mt-8">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-primary shadow-[0_0_8px_rgba(var(--primary),0.6)]"></div>
                                    <span className="text-xs font-bold uppercase tracking-wider">{talent1.name}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-destructive shadow-[0_0_8px_rgba(var(--destructive),0.6)]"></div>
                                    <span className="text-xs font-bold uppercase tracking-wider">{talent2.name}</span>
                                </div>
                            </div>
                            
                            {/* Numeric Stats Grid */}
                            <div className="w-full mt-6 space-y-3">
                                {Object.keys(stats1).map((key) => (
                                    <div key={key} className="flex justify-between items-center bg-muted/20 p-2 rounded-lg">
                                        <div className="text-sm font-black text-primary w-8 text-center">{stats1[key]}</div>
                                        <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex-1 text-center">{key}</div>
                                        <div className="text-sm font-black text-destructive w-8 text-center">{stats2[key]}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Profile 2 */}
                        <Card className="p-6 bg-card border-destructive/20 shadow-lg shadow-destructive/5 rounded-3xl text-center relative overflow-hidden flex flex-col items-center">
                            <div className="absolute top-0 inset-x-0 h-1 bg-destructive"></div>
                            <PitchAvatar position={talent2.position || 'GK'} size="lg" className="mb-4" />
                            <h2 className="text-2xl font-black text-foreground">{talent2.name}</h2>
                            <Badge className="mt-2 bg-destructive/10 text-destructive border-destructive/20">{talent2.position || 'Player'}</Badge>
                            
                            <div className="mt-6 w-full space-y-4 text-left">
                                <div className="flex justify-between items-center py-2 border-b border-muted-foreground/10">
                                    <span className="text-sm font-semibold text-muted-foreground flex items-center gap-2"><User className="w-4 h-4" /> Nationality</span>
                                    <span className="font-bold">{talent2.nationality || 'N/A'}</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-muted-foreground/10">
                                    <span className="text-sm font-semibold text-muted-foreground flex items-center gap-2"><Activity className="w-4 h-4" /> Height</span>
                                    <span className="font-bold">{talent2.height_cm ? `${talent2.height_cm} cm` : 'N/A'}</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-muted-foreground/10">
                                    <span className="text-sm font-semibold text-muted-foreground flex items-center gap-2"><Video className="w-4 h-4" /> Videos</span>
                                    <span className="font-bold">{talent2.videos_count || 0}</span>
                                </div>
                            </div>

                            <Button asChild variant="destructive" className="w-full mt-6 rounded-xl font-bold hover:bg-destructive/90">
                                <Link href={`/talents/${talent2.id}`}>View Profile</Link>
                            </Button>
                        </Card>
                    </div>
                ) : (
                    <div className="py-20 flex flex-col items-center justify-center text-muted-foreground/60">
                        <Users className="w-16 h-16 mb-4 opacity-50" />
                        <p className="text-lg font-bold">Select two talents above to compare them.</p>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
