import { Head, router, Link, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Phone, Mail, Lock, Eye, MessageSquare, MapPin, Ruler,
    Scale, Footprints, Trophy, Star, TrendingUp, Users,
    Heart, Video, Target, Shield,
    CheckCircle, ChevronRight, Share2, Download, Crown,
    Activity, Award, Settings, Play, Globe,
    Brain, Zap, BarChart3, Sparkles, ChevronDown, ChevronUp,
    Calendar, Flame, Trash2,
} from 'lucide-react';

import PitchAvatar from '@/components/pitch-avatar';
import MediaPipeVideoPlayer from '@/components/mediapipe-video-player';
import AppLayout from '@/layouts/app-layout';
import { start } from '@/routes/chat';
import { unlock } from '@/routes/talents';
import { RadarChart } from '@/components/radar-chart';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface AiAnalysis {
    score?: number;
    strengths?: string[];
    weaknesses?: string[];
    summary?: string;
    comparable_player?: string;
    recommendations?: string[];
    timestamps?: { time: string; description: string; }[];
}

interface Highlight {
    id?: number;
    title: string;
    description?: string;
    file_path: string;
    thumbnail_path?: string;
    views: number;
    likes: number;
    status?: 'pending' | 'processing' | 'ready' | 'failed';
    ai_analysis?: AiAnalysis | null;
}

interface TopVideo {
    id: number;
    title: string;
    file_path: string;
    likes_count: number;
    comments_count: number;
    views: number;
}

interface Props {
    isEditable?: boolean;
    talent: {
        id: number;
        display_name: string;
        position: string;
        secondary_position?: string;
        bio: string;
        nationality: string;
        city?: string;
        country?: string;
        dominant_foot: string;
        height_cm: number;
        weight_kg: number;
        age?: number;
        date_of_birth?: string;
        talent_score: number;
        level: string;
        user: {
            id: number;
            name: string;
            email: string;
            phone?: string;
            gender?: string;
            avatar_path?: string;
        };
    };
    stats: {
        followers: number;
        total_views: number;
        total_likes: number;
        videos_count: number;
        scouts_interested: number;
        profile_visits: number;
        favorites: number;
        requests_received: number;
    };
    topVideos: TopVideo[];
    canSeeContactInfo: boolean;
    skills: Record<string, number>;
    radarData: Record<string, number>;
    averageRadarData: Record<string, number>;
    scoutingReport: {
        pros: string[];
        cons: string[];
        comparable: string;
    };
    valueEstimation: {
        min: number;
        max: number;
        trend: number;
    };
    aiMatches: Array<{ name: string; pct: number }>;
    pitchVideo: string;
    highlights: Highlight[];
}

// ─── Animation Variants ───────────────────────────────────────────────────────

const fadeUp = {
    hidden: { opacity: 0, y: 24 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' as const } },
};

const stagger = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const scaleIn = {
    hidden: { opacity: 0, scale: 0.88 },
    show: { opacity: 1, scale: 1, transition: { duration: 0.45, ease: 'easeOut' as const } },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getLevelStars(level: string): number {
    const map: Record<string, number> = {
        'Debutant': 1, 'Intermediaire': 2, 'Avance': 3, 'Elite': 4, 'Exceptionnel': 5,
        'Débutant': 1, 'Intermédiaire': 2, 'Avancé': 3,
    };
    return map[level] ?? 1;
}

function getLevelColor(level: string): string {
    const map: Record<string, string> = {
        'Débutant': 'text-muted-foreground', 'Debutant': 'text-muted-foreground',
        'Intermédiaire': 'text-blue-500', 'Intermediaire': 'text-blue-500',
        'Avancé': 'text-primary', 'Avance': 'text-primary',
        'Elite': 'text-amber-400',
        'Exceptionnel': 'text-rose-400',
    };
    return map[level] ?? 'text-muted-foreground';
}

function getLevelGradient(level: string): string {
    const map: Record<string, string> = {
        'Débutant': 'from-gray-500 to-gray-400', 'Debutant': 'from-gray-500 to-gray-400',
        'Intermédiaire': 'from-blue-600 to-blue-400', 'Intermediaire': 'from-blue-600 to-blue-400',
        'Avancé': 'from-primary to-emerald-400', 'Avance': 'from-primary to-emerald-400',
        'Elite': 'from-amber-500 to-yellow-300',
        'Exceptionnel': 'from-rose-500 to-pink-400',
    };
    return map[level] ?? 'from-primary to-emerald-400';
}

function formatNumber(n: number): string {
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
    if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
    return n.toString();
}

// ─── Animated Counter ─────────────────────────────────────────────────────────

function AnimatedCount({ target, delay = 0 }: { target: number; delay?: number }) {
    const [val, setVal] = useState(0);
    useEffect(() => {
        const t = setTimeout(() => {
            const steps = 40;
            const inc = target / steps;
            let cur = 0;
            const id = setInterval(() => {
                cur = Math.min(cur + inc, target);
                setVal(Math.round(cur));
                if (cur >= target) clearInterval(id);
            }, 1200 / steps);
            return () => clearInterval(id);
        }, delay);
        return () => clearTimeout(t);
    }, [target, delay]);
    return <>{formatNumber(val)}</>;
}

// ─── Animated Gauge ───────────────────────────────────────────────────────────

function TalentScoreGauge({ score, level }: { score: number; level: string }) {
    const [animated, setAnimated] = useState(0);
    useEffect(() => {
        const t = setTimeout(() => setAnimated(score), 500);
        return () => clearTimeout(t);
    }, [score]);

    const radius = 60;
    const circumference = 2 * Math.PI * radius;
    const strokeDash = (animated / 100) * circumference;
    const gradient = getLevelGradient(level);

    const getColor = () => {
        if (score >= 85) return '#f43f5e';
        if (score >= 70) return '#f59e0b';
        if (score >= 50) return 'hsl(var(--primary))';
        return '#6b7280';
    };

    return (
        <div className="relative flex items-center justify-center w-44 h-44 mx-auto">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 144 144">
                <circle cx="72" cy="72" r={radius} fill="none" stroke="currentColor" strokeWidth="10"
                    className="text-muted-foreground/10" />
                <circle cx="72" cy="72" r={radius} fill="none" stroke={getColor()} strokeWidth="14"
                    strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={circumference - strokeDash}
                    opacity="0.12" style={{ filter: 'blur(4px)', transition: 'stroke-dashoffset 1.4s cubic-bezier(0.22,1,0.36,1)' }} />
                <circle cx="72" cy="72" r={radius} fill="none" stroke={getColor()} strokeWidth="10"
                    strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={circumference - strokeDash}
                    style={{ transition: 'stroke-dashoffset 1.4s cubic-bezier(0.22,1,0.36,1)' }} />
            </svg>
            <div className="absolute flex flex-col items-center">
                <span className={`text-4xl font-black tracking-tight bg-gradient-to-b ${gradient} bg-clip-text text-transparent`}>
                    {animated}
                </span>
                <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/50">/100</span>
                <span className={`text-[9px] font-black uppercase tracking-widest mt-1 ${getLevelColor(level)}`}>{level}</span>
            </div>
        </div>
    );
}

// ─── Skill Bar ────────────────────────────────────────────────────────────────

function SkillBar({ label, value, average, delay = 0 }: { label: string; value: number; average?: number; delay?: number }) {
    const [width, setWidth] = useState(0);
    useEffect(() => {
        const t = setTimeout(() => setWidth(value), 600 + delay);
        return () => clearTimeout(t);
    }, [value, delay]);

    const getBarColor = (v: number) => {
        if (v >= 85) return 'from-rose-500 to-pink-400';
        if (v >= 75) return 'from-amber-500 to-yellow-400';
        if (v >= 65) return 'from-primary to-emerald-400';
        return 'from-blue-500 to-blue-400';
    };

    return (
        <div className="space-y-1.5">
            <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-foreground/80">{label}</span>
                <span className={`text-xs font-black bg-gradient-to-r ${getBarColor(value)} bg-clip-text text-transparent`}>{value}</span>
            </div>
            <div className="relative h-2.5 rounded-full bg-muted-foreground/10 overflow-hidden">
                <div className={`h-full rounded-full bg-gradient-to-r ${getBarColor(value)}`}
                    style={{ width: `${width}%`, transition: 'width 0.9s cubic-bezier(0.22,1,0.36,1)' }} />
                {average !== undefined && (
                    <div className="absolute top-0 h-full w-0.5 bg-white/40 rounded-full" style={{ left: `${average}%` }} />
                )}
            </div>
            {average !== undefined && (
                <div className="flex justify-end text-[9px] text-muted-foreground/40 font-semibold">
                    Moy: {average}
                </div>
            )}
        </div>
    );
}

// ─── Section Label ────────────────────────────────────────────────────────────

function SectionLabel({ children, icon }: { children: React.ReactNode; icon?: React.ReactNode }) {
    return (
        <div className="flex items-center gap-2 mb-5">
            {icon && <span className="text-primary shrink-0">{icon}</span>}
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 flex-1 flex items-center gap-2">
                <span className="h-px flex-1 bg-gradient-to-l from-muted-foreground/15 to-transparent" />
                {children}
                <span className="h-px flex-1 bg-gradient-to-r from-muted-foreground/15 to-transparent" />
            </h3>
        </div>
    );
}

// ─── AI Analysis Card ─────────────────────────────────────────────────────────

function AiAnalysisCard({ analysis, onSeek }: { analysis: AiAnalysis, onSeek?: (timeStr: string) => void }) {
    return (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <div className="mt-3 p-4 rounded-2xl bg-gradient-to-br from-primary/5 via-card to-emerald-500/5 border border-primary/15 space-y-3">
                {analysis.score !== undefined && (
                    <div className="flex items-center justify-between">
                        <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/70 flex items-center gap-1.5">
                            <Brain className="h-3 w-3 text-primary" /> Score IA Potentiel
                        </span>
                        <div className="flex items-center gap-1.5">
                            <div className="h-1.5 w-16 rounded-full bg-muted-foreground/10 overflow-hidden">
                                <div className="h-full rounded-full bg-gradient-to-r from-primary to-emerald-400"
                                    style={{ width: `${analysis.score}%` }} />
                            </div>
                            <span className="text-sm font-black text-primary">{analysis.score}<span className="text-[9px] text-muted-foreground/50">/100</span></span>
                        </div>
                    </div>
                )}
                {analysis.strengths && analysis.strengths.length > 0 && (
                    <div className="space-y-1">
                        <p className="text-[8px] font-black uppercase tracking-widest text-emerald-400">Forces observées</p>
                        <div className="flex flex-wrap gap-1">
                            {analysis.strengths.map((s: string) => (
                                <span key={s} className="px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[8px] font-black uppercase tracking-wider">
                                    {s}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
                {analysis.weaknesses && analysis.weaknesses.length > 0 && (
                    <div className="space-y-1">
                        <p className="text-[8px] font-black uppercase tracking-widest text-rose-400">Axes d'amelioration</p>
                        <div className="flex flex-wrap gap-1">
                            {analysis.weaknesses.map((w: string) => (
                                <span key={w} className="px-2 py-0.5 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[8px] font-black uppercase tracking-wider">
                                    {w}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
                {analysis.summary && (
                    <div className="p-3 rounded-xl bg-card/60 border border-muted-foreground/8">
                        <p className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/60 mb-1">Resume Scouting IA</p>
                        <p className="text-[10px] leading-relaxed text-foreground/85 font-medium">{analysis.summary}</p>
                    </div>
                )}
                {analysis.comparable_player && (
                    <div className="flex items-center gap-2 pt-2 border-t border-muted-foreground/8">
                        <span className="text-base">⚡</span>
                        <div>
                            <p className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/60">Style comparable</p>
                            <p className="text-xs font-black">{analysis.comparable_player}</p>
                        </div>
                    </div>
                )}
                {analysis.timestamps && analysis.timestamps.length > 0 && (
                    <div className="pt-2 border-t border-muted-foreground/8 space-y-2">
                        <p className="text-[8px] font-black uppercase tracking-widest text-primary/80">Moments Forts (IA Timestamps)</p>
                        <div className="flex flex-col gap-1.5">
                            {analysis.timestamps.map((ts, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => onSeek && onSeek(ts.time)}
                                    className="flex items-start gap-2 p-1.5 rounded-lg hover:bg-primary/10 transition-colors text-left"
                                >
                                    <span className="px-1.5 py-0.5 bg-primary/20 text-primary rounded text-[9px] font-mono font-bold mt-0.5">
                                        {ts.time}
                                    </span>
                                    <span className="text-[10px] text-foreground/80 leading-tight">
                                        {ts.description}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </motion.div>
    );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({ icon, label, value, growth, delay = 0 }: {
    icon: React.ReactNode; label: string; value: number; growth?: string; delay?: number;
}) {
    return (
        <motion.div whileHover={{ y: -4, scale: 1.02 }}
            className="relative overflow-hidden rounded-2xl border border-muted-foreground/8 bg-gradient-to-br from-card to-muted/5 p-4 shadow-sm cursor-default group">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/3 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="flex items-center justify-between mb-3">
                <span className="p-1.5 rounded-lg bg-primary/10 border border-primary/20 text-primary">{icon}</span>
                {growth && growth.startsWith('+') && (
                    <span className="text-[8px] text-emerald-400 font-black uppercase bg-emerald-500/10 px-1.5 py-0.5 rounded-full border border-emerald-500/20">
                        {growth.split(' ')[0]}
                    </span>
                )}
            </div>
            <p className="text-2xl font-black bg-gradient-to-r from-foreground via-foreground/90 to-primary/80 bg-clip-text text-transparent">
                <AnimatedCount target={value} delay={delay} />
            </p>
            <p className="text-[9px] font-bold text-muted-foreground/55 uppercase tracking-wider mt-0.5">{label}</p>
            {growth && (
                <p className="text-[8px] text-muted-foreground/35 font-semibold mt-1 flex items-center gap-0.5">
                    <TrendingUp className="h-2 w-2 text-primary" /> {growth}
                </p>
            )}
        </motion.div>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function TalentShow({
    isEditable = false,
    talent, stats, topVideos, canSeeContactInfo,
    skills, radarData, averageRadarData, scoutingReport,
    valueEstimation, aiMatches, pitchVideo, highlights
}: Props) {
    const { auth } = usePage<any>().props;
    const isOwnProfile = auth?.user?.id === talent.user.id;
    const canEdit = isEditable || isOwnProfile;

    const handleDeleteVideo = (videoId?: number) => {
        if (!videoId) return;
        if (confirm("Voulez-vous vraiment supprimer cette vidéo de votre portfolio ?")) {
            router.delete(`/videos/${videoId}`, {
                preserveScroll: true,
            });
        }
    };

    const [selectedPopVideo, setSelectedPopVideo] = useState<TopVideo | null>(null);
    const [availability, setAvailability] = useState<'available' | 'discussing' | 'unavailable'>('available');
    const [isPlayingPitch, setIsPlayingPitch] = useState(false);
    const [portfolioTab, setPortfolioTab] = useState<'videos' | 'documents'>('videos');
    const [statsPeriod, setStatsPeriod] = useState<'week' | 'month'>('month');
    const [showAverage, setShowAverage] = useState(true);
    const [openAiVideoId, setOpenAiVideoId] = useState<number | null>(null);
    const [aiReportOpen, setAiReportOpen] = useState(true);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [chatInput, setChatInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);

    const stars = getLevelStars(talent.level);
    const levelColor = getLevelColor(talent.level);
    const levelGradient = getLevelGradient(talent.level);

    // Aggregate AI data from all analyzed highlights
    const analyzedHighlights = highlights.filter(h => h.status === 'ready' && h.ai_analysis);
    const hasAiData = analyzedHighlights.length > 0;
    const avgAiScore = hasAiData
        ? Math.round(analyzedHighlights.reduce((acc, h) => acc + (h.ai_analysis?.score ?? 0), 0) / analyzedHighlights.length)
        : null;
    const allStrengths = hasAiData ? [...new Set(analyzedHighlights.flatMap(h => h.ai_analysis?.strengths ?? []))] : [];
    const allWeaknesses = hasAiData ? [...new Set(analyzedHighlights.flatMap(h => h.ai_analysis?.weaknesses ?? []))] : [];
    const bestSummary = analyzedHighlights.find(h => h.ai_analysis?.summary)?.ai_analysis?.summary;
    const comparable = analyzedHighlights.find(h => h.ai_analysis?.comparable_player)?.ai_analysis?.comparable_player ?? scoutingReport.comparable;

    const [chatMessages, setChatMessages] = useState<Array<{ sender: 'bot' | 'user'; text: string }>>([
        { sender: 'bot', text: `Bonjour ! Je suis l'Assistant IA de EndoTalent. Je connais parfaitement le profil de **${talent.display_name}**. Que souhaitez-vous analyser aujourd'hui ?` }
    ]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatMessages]);

    const handleUnlock = () => router.post(unlock(talent.id).url, {}, { preserveScroll: true });

    const handleSendMessage = (text: string) => {
        if (!text.trim()) return;
        setChatMessages(prev => [...prev, { sender: 'user', text }]);
        setChatInput('');
        setIsTyping(true);
        setTimeout(() => {
            const lowerText = text.toLowerCase();
            let reply = '';
            if (lowerText.includes('poste') || lowerText.includes('jeu') || lowerText.includes('joue')) {
                reply = `**${talent.display_name}** evolue au poste de **${talent.position}**${talent.secondary_position ? ` (aussi en ${talent.secondary_position})` : ''}. Niveau : **${talent.level}**.`;
            } else if (lowerText.includes('score') || lowerText.includes('talent') || lowerText.includes('niveau')) {
                reply = `Talent Score : **${talent.talent_score}/100** — **${talent.level}**. ${avgAiScore ? `Score IA (${analyzedHighlights.length} videos) : **${avgAiScore}/100**.` : ''}`;
            } else if (lowerText.includes('ai') || lowerText.includes('analyse') || lowerText.includes('rapport')) {
                reply = hasAiData
                    ? `IA a analyse **${analyzedHighlights.length} video(s)**. Forces : ${allStrengths.slice(0, 3).join(', ')}. Score moyen : **${avgAiScore}/100**.`
                    : `Aucune analyse IA disponible. Les videos sont analysees automatiquement apres upload.`;
            } else if (lowerText.includes('dispo')) {
                const statuses: Record<string, string> = { available: 'Disponible', discussing: 'En discussion', unavailable: 'Non disponible' };
                reply = `Statut actuel : **${statuses[availability]}**. Contactez-le via le chat.`;
            } else if (lowerText.includes('pied') || lowerText.includes('physique') || lowerText.includes('taille')) {
                reply = `Physique : **${talent.height_cm || '—'} cm** / **${talent.weight_kg || '—'} kg**. Pied fort : **${talent.dominant_foot === 'R' ? 'Droit' : talent.dominant_foot === 'L' ? 'Gauche' : talent.dominant_foot}**.`;
            } else if (lowerText.includes('valeur') || lowerText.includes('prix')) {
                reply = `Valeur marchande estimee : **${formatNumber(valueEstimation.min)} - ${formatNumber(valueEstimation.max)} DH**, tendance **+${valueEstimation.trend}%**.`;
            } else if (lowerText.includes('force') || lowerText.includes('qualite')) {
                const pros = allStrengths.length > 0 ? allStrengths : scoutingReport.pros;
                reply = `Forces : **${pros.slice(0, 4).join('**, **')}**. ${comparable ? `Style : **${comparable}**.` : ''}`;
            } else {
                reply = `**${talent.display_name}** (${talent.age || '—'} ans) — **${talent.position}** | Score : **${talent.talent_score}/100** | ${stats.followers} followers | ${stats.videos_count} videos.`;
            }
            setChatMessages(prev => [...prev, { sender: 'bot', text: reply }]);
            setIsTyping(false);
        }, 900 + Math.random() * 300);
    };

    // Dynamic badges based on real data
    const badges = [
        ...(talent.talent_score >= 50 ? [{ label: 'Talent Verifie', icon: '⭐', color: 'bg-primary/10 text-primary border-primary/20' }] : []),
        ...(stats.followers > 20 ? [{ label: 'Talent Tendance', icon: '🔥', color: 'bg-orange-500/10 text-orange-500 border-orange-500/20' }] : []),
        ...(talent.age && talent.age < 20 ? [{ label: 'Prometteur', icon: '🚀', color: 'bg-blue-500/10 text-blue-500 border-blue-500/20' }] : []),
        ...(hasAiData ? [{ label: 'Analyse IA', icon: '🧠', color: 'bg-violet-500/10 text-violet-500 border-violet-500/20' }] : []),
        ...(talent.talent_score >= 70 ? [{ label: 'Talent Elite', icon: '💎', color: 'bg-rose-500/10 text-rose-500 border-rose-500/20' }] : []),
        { label: 'Recompense', icon: '🏆', color: 'bg-amber-500/10 text-amber-500 border-amber-500/20' },
    ];

    return (
        <AppLayout breadcrumbs={[{ title: 'Talents', href: '/talents' }, { title: talent.display_name, href: `/talents/${talent.id}` }]}>
            <Head title={`${talent.display_name} — Profil Talent`} />
            <div className="relative min-h-screen text-left">

                {/* Ambient blobs */}
                <div className="absolute -top-40 -left-40 h-[700px] w-[700px] rounded-full bg-primary/4 blur-[140px] pointer-events-none" />
                <div className="absolute top-1/2 -right-60 h-[600px] w-[600px] rounded-full bg-emerald-500/4 blur-[140px] pointer-events-none" />

                <div className="relative mx-auto max-w-7xl px-4 py-8 lg:px-8 space-y-6">

                    {/* ═══ HERO ═══ */}
                    <motion.div variants={stagger} initial="hidden" animate="show"
                        className="relative overflow-hidden rounded-3xl border border-muted-foreground/10 shadow-2xl bg-card">
                        {/* Cover */}
                        <div className="relative h-48 md:h-60 overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950" />
                            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808005_1px,transparent_1px),linear-gradient(to_bottom,#80808005_1px,transparent_1px)] bg-[size:28px_28px]" />
                            <div className="absolute -top-12 -left-12 w-56 h-56 rounded-full bg-primary/20 blur-3xl" />
                            <div className="absolute -bottom-12 -right-12 w-72 h-72 rounded-full bg-emerald-500/15 blur-3xl" />
                            <span className="absolute right-10 top-1/2 -translate-y-1/2 text-[130px] font-black italic uppercase text-white/12 select-none leading-none">
                                {talent.position}
                            </span>
                            <div className="absolute top-4 left-4">
                                <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r ${levelGradient} shadow-lg text-white text-[9px] font-black uppercase tracking-widest`}>
                                    <Sparkles className="h-3 w-3" /> {talent.level}
                                </div>
                            </div>
                            <div className="absolute top-4 right-4 flex gap-2">
                                <button className="h-9 w-9 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/20 transition-all">
                                    <Share2 className="h-4 w-4" />
                                </button>
                                <button className="h-9 w-9 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/20 transition-all">
                                    <Download className="h-4 w-4" />
                                </button>
                            </div>
                            {hasAiData && (
                                <div className="absolute bottom-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/20 backdrop-blur-sm border border-primary/30 text-primary">
                                    <Brain className="h-3 w-3" />
                                    <span className="text-[9px] font-black uppercase tracking-wider">
                                        Analyse IA · {analyzedHighlights.length} video{analyzedHighlights.length > 1 ? 's' : ''}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Profile info */}
                        <div className="px-6 md:px-10 pb-8">
                            <div className="relative z-10 flex flex-col md:flex-row md:items-end gap-6 -mt-12 md:-mt-10">
                                <motion.div variants={scaleIn} className="relative shrink-0">
                                    <div className={`relative z-10 p-1.5 rounded-[22px] bg-gradient-to-br ${levelGradient} shadow-2xl shadow-primary/20`}>
                                        <div className="rounded-2xl bg-card">
                                            <PitchAvatar position={talent.position} size="lg" />
                                        </div>
                                    </div>
                                    <div className="absolute -bottom-1 -right-1 z-20 h-5 w-5 rounded-full bg-emerald-400 border-2 border-card shadow-lg shadow-emerald-400/40" />
                                </motion.div>

                                <motion.div variants={fadeUp} className="flex-1 space-y-3 pt-4 md:pt-0">
                                    <div>
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <h1 className="text-3xl md:text-4xl font-black italic uppercase tracking-tight leading-none">{talent.display_name}</h1>
                                            <CheckCircle className="h-6 w-6 text-primary shrink-0" fill="hsl(var(--primary) / 0.15)" />
                                        </div>
                                        <div className="flex flex-wrap items-center gap-2.5 mt-2">
                                            <Badge className="px-3 py-0.5 text-[10px] font-black uppercase tracking-[0.15em] bg-primary/10 text-primary border border-primary/20">
                                                {talent.position}
                                            </Badge>
                                            {talent.secondary_position && (
                                                <Badge className="px-3 py-0.5 text-[10px] font-black uppercase bg-muted text-muted-foreground border border-muted-foreground/15">
                                                    {talent.secondary_position}
                                                </Badge>
                                            )}
                                            <span className="text-xs text-muted-foreground font-semibold flex items-center gap-1">
                                                <MapPin className="h-3 w-3 text-primary" />
                                                {[talent.city, talent.country].filter(Boolean).join(', ') || talent.nationality}
                                            </span>
                                            {talent.age && (
                                                <span className="text-xs text-muted-foreground font-semibold flex items-center gap-1">
                                                    <Calendar className="h-3 w-3 text-primary" /> {talent.age} ans
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <div className="flex gap-0.5">
                                            {Array.from({ length: 5 }).map((_, i) => (
                                                <Star key={i} className={`h-4 w-4 ${i < stars ? levelColor + ' fill-current' : 'text-muted-foreground/20'}`} />
                                            ))}
                                        </div>
                                        <span className={`text-xs font-black uppercase tracking-wider ${levelColor}`}>{talent.level}</span>
                                    </div>

                                    <div className="flex flex-wrap gap-1.5">
                                        {(['available', 'discussing', 'unavailable'] as const).map((s) => {
                                            const cfg = {
                                                available: { label: 'Disponible', active: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' },
                                                discussing: { label: 'En discussion', active: 'bg-amber-500/10 text-amber-500 border-amber-500/20' },
                                                unavailable: { label: 'Non disponible', active: 'bg-rose-500/10 text-rose-500 border-rose-500/20' },
                                            }[s];
                                            return (
                                                <button key={s} onClick={() => setAvailability(s)}
                                                    className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border transition-all ${availability === s ? cfg.active : 'bg-muted/30 text-muted-foreground border-muted-foreground/10 hover:border-muted-foreground/25'}`}>
                                                    {s === 'available' ? '🟢' : s === 'discussing' ? '🟡' : '🔴'} {cfg.label}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </motion.div>

                                <motion.div variants={fadeUp} className="flex flex-col gap-2 shrink-0 w-full md:w-auto">
                                    {isOwnProfile ? (
                                        <>
                                            <Link href="/settings/profile" className="w-full">
                                                <Button className="w-full h-12 px-6 rounded-xl font-bold uppercase tracking-wider shadow-lg shadow-primary/20 hover:scale-105 transition-all gap-2">
                                                    <Settings className="h-4 w-4" /> Modifier profil
                                                </Button>
                                            </Link>
                                            <a href={`/talents/${talent.id}/cv`} target="_blank" rel="noopener noreferrer" className="w-full">
                                                <Button variant="outline" className="w-full h-12 px-6 rounded-xl font-bold uppercase tracking-wider border-muted-foreground/15 gap-2">
                                                    <Download className="h-4 w-4 text-primary" /> Telecharger CV
                                                </Button>
                                            </a>
                                        </>
                                    ) : (
                                        <>
                                            <Button onClick={() => router.post(start(talent.user.id).url)}
                                                className="h-12 px-6 rounded-xl font-bold uppercase tracking-wider shadow-lg shadow-primary/20 hover:scale-105 transition-all gap-2">
                                                <MessageSquare className="h-4 w-4" /> Message
                                            </Button>
                                            <div className="flex gap-2">
                                                <Button variant="outline" className="flex-1 h-10 px-4 rounded-xl font-bold border-muted-foreground/15 text-xs gap-2">
                                                    <Trophy className="h-4 w-4 text-primary" /> Favoris
                                                </Button>
                                                <a href={`/talents/${talent.id}/cv`} target="_blank" rel="noopener noreferrer" className="flex-1">
                                                    <Button variant="outline" className="w-full h-10 px-4 rounded-xl font-bold border-muted-foreground/15 text-xs gap-2">
                                                        <Download className="h-4 w-4 text-primary" /> CV
                                                    </Button>
                                                </a>
                                            </div>
                                        </>
                                    )}
                                </motion.div>
                            </div>
                        </div>
                    </motion.div>

                    {/* ═══ AI RAPPORT BANNER ═══ */}
                    {hasAiData && canSeeContactInfo && (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
                            className="relative overflow-hidden rounded-3xl border border-primary/20 shadow-lg">
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-card to-emerald-500/8" />
                            <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-primary/10 blur-3xl" />
                            <div className="relative p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-primary to-emerald-500 flex items-center justify-center shadow-lg shadow-primary/25">
                                            <Brain className="h-5 w-5 text-white" />
                                        </div>
                                        <div>
                                            <h2 className="text-sm font-black uppercase tracking-wider">Rapport IA Complet</h2>
                                            <p className="text-[9px] font-bold text-muted-foreground/60 uppercase tracking-widest">
                                                Base sur {analyzedHighlights.length} video{analyzedHighlights.length > 1 ? 's' : ''} analysee{analyzedHighlights.length > 1 ? 's' : ''} · EndoTalent AI Engine
                                            </p>
                                        </div>
                                    </div>
                                    <button onClick={() => setAiReportOpen(o => !o)}
                                        className="h-8 w-8 rounded-xl bg-card/60 border border-muted-foreground/10 flex items-center justify-center text-muted-foreground hover:text-primary transition-colors">
                                        {aiReportOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                    </button>
                                </div>
                                <AnimatePresence>
                                    {aiReportOpen && (
                                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                                            <div className="grid md:grid-cols-3 gap-4">
                                                <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-card/60 border border-muted-foreground/8">
                                                    <p className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/60 mb-2">Score IA Moyen</p>
                                                    <div className="relative">
                                                        <svg viewBox="0 0 100 100" className="w-28 h-28 -rotate-90">
                                                            <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="8" className="text-muted-foreground/10" />
                                                            <circle cx="50" cy="50" r="40" fill="none" stroke="hsl(var(--primary))" strokeWidth="8" strokeLinecap="round"
                                                                strokeDasharray={`${2 * Math.PI * 40}`}
                                                                strokeDashoffset={`${2 * Math.PI * 40 * (1 - (avgAiScore ?? 0) / 100)}`}
                                                                style={{ transition: 'stroke-dashoffset 1.5s cubic-bezier(0.22,1,0.36,1)' }} />
                                                        </svg>
                                                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                                                            <span className="text-2xl font-black text-primary">{avgAiScore}</span>
                                                            <span className="text-[8px] text-muted-foreground/50 font-bold">/100</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="md:col-span-2 space-y-3">
                                                    {allStrengths.length > 0 && (
                                                        <div className="p-3 rounded-2xl bg-emerald-500/5 border border-emerald-500/15">
                                                            <p className="text-[8px] font-black uppercase tracking-widest text-emerald-400 mb-2 flex items-center gap-1.5">
                                                                <CheckCircle className="h-3 w-3" /> Forces Observees
                                                            </p>
                                                            <div className="flex flex-wrap gap-1.5">
                                                                {allStrengths.map(s => (
                                                                    <span key={s} className="px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[8px] font-black uppercase">
                                                                        {s}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                    {allWeaknesses.length > 0 && (
                                                        <div className="p-3 rounded-2xl bg-rose-500/5 border border-rose-500/15">
                                                            <p className="text-[8px] font-black uppercase tracking-widest text-rose-400 mb-2">Axes d'amelioration</p>
                                                            <div className="flex flex-wrap gap-1.5">
                                                                {allWeaknesses.map(w => (
                                                                    <span key={w} className="px-2 py-0.5 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[8px] font-black uppercase">
                                                                        {w}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                    {bestSummary && (
                                                        <div className="p-3 rounded-2xl bg-card/60 border border-muted-foreground/8">
                                                            <p className="text-[8px] font-black uppercase tracking-widest text-primary mb-1.5">Resume Scouting IA</p>
                                                            <p className="text-xs leading-relaxed text-foreground/85 font-medium">{bestSummary}</p>
                                                        </div>
                                                    )}
                                                    {comparable && (
                                                        <div className="flex items-center gap-3 p-3 rounded-2xl bg-card/60 border border-muted-foreground/8">
                                                            <span className="text-xl">⚡</span>
                                                            <div>
                                                                <p className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/60">Style comparable</p>
                                                                <p className="text-sm font-black">{comparable}</p>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </motion.div>
                    )}

                    {/* ═══ LOCK WALL ═══ */}
                    {!canSeeContactInfo ? (
                        <div className="relative min-h-[600px] rounded-3xl border border-muted-foreground/10 bg-card overflow-hidden">
                            <div className="filter blur-md select-none pointer-events-none opacity-20 p-8 space-y-8">
                                <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                                    {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-24 rounded-2xl bg-muted" />)}
                                </div>
                                <div className="grid gap-6 lg:grid-cols-3">
                                    <div className="space-y-6"><div className="h-64 rounded-3xl bg-muted" /><div className="h-64 rounded-3xl bg-muted" /></div>
                                    <div className="lg:col-span-2 space-y-6"><div className="h-80 rounded-3xl bg-muted" /><div className="h-64 rounded-3xl bg-muted" /></div>
                                </div>
                            </div>
                            <div className="absolute inset-0 z-20 flex items-center justify-center p-6 bg-gradient-to-b from-card/30 via-card/90 to-card">
                                <motion.div initial={{ opacity: 0, y: 30, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                                    className="max-w-md w-full bg-card/95 backdrop-blur-md border border-primary/20 rounded-3xl p-8 text-center shadow-2xl space-y-6">
                                    <div className="mx-auto h-16 w-16 rounded-2xl bg-gradient-to-br from-primary to-emerald-500 flex items-center justify-center text-white shadow-lg">
                                        <Lock className="h-7 w-7 animate-pulse" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <h3 className="text-xl font-black uppercase tracking-tight">Profil Premium Verrouille</h3>
                                        <p className="text-xs text-muted-foreground font-semibold">Debloquez ce profil pour acceder a l'integralite des analyses IA.</p>
                                    </div>
                                    <div className="p-4 rounded-2xl bg-muted/40 border border-muted-foreground/5 text-left space-y-2.5">
                                        {['Rapport de Scouting IA', 'Estimateur de Valeur Marchande IA', 'Videos avec analyse IA', 'Radar de competences', 'Coordonnees de contact'].map(f => (
                                            <div key={f} className="flex items-center gap-2.5 text-xs font-bold text-foreground/80">
                                                <span className="text-primary font-black">✓</span> {f}
                                            </div>
                                        ))}
                                    </div>
                                    <div className="flex flex-col gap-3">
                                        <Button onClick={handleUnlock} className="w-full h-12 rounded-xl font-bold uppercase tracking-wider shadow-lg gap-2">
                                            <Lock className="h-4 w-4" /> Debloquer pour 50 Credits
                                        </Button>
                                        <Button onClick={() => router.post(start(talent.user.id).url)} variant="outline"
                                            className="w-full h-12 rounded-xl font-bold uppercase tracking-wider gap-2">
                                            <MessageSquare className="h-4 w-4 text-primary" /> Contacter (10 Credits)
                                        </Button>
                                    </div>
                                </motion.div>
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* ═══ STATS GRID ═══ */}
                            <motion.div variants={fadeUp} initial="hidden" animate="show"
                                className="rounded-3xl border border-muted-foreground/10 bg-card p-6 shadow-md space-y-5">
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Tableau de Bord</p>
                                        <h2 className="text-xl font-black italic uppercase tracking-tight mt-0.5">Statistiques de Visibilite</h2>
                                    </div>
                                    <div className="flex p-1 rounded-xl bg-muted/40 border border-muted-foreground/8">
                                        {(['week', 'month'] as const).map(p => (
                                            <button key={p} onClick={() => setStatsPeriod(p)}
                                                className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all ${statsPeriod === p ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>
                                                {p === 'week' ? 'Semaine' : 'Mois'}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                                    {[
                                        { icon: <Users className="h-4 w-4" />, label: 'Followers', value: stats.followers, growth: `+${Math.max(1, Math.round(stats.followers * 0.08))} ce mois`, delay: 0 },
                                        { icon: <Eye className="h-4 w-4" />, label: 'Vues totales', value: stats.total_views, growth: undefined, delay: 100 },
                                        { icon: <Heart className="h-4 w-4" />, label: 'Likes', value: stats.total_likes, growth: undefined, delay: 200 },
                                        { icon: <Video className="h-4 w-4" />, label: 'Videos', value: stats.videos_count, growth: undefined, delay: 300 },
                                        { icon: <Shield className="h-4 w-4" />, label: 'Scouts', value: stats.scouts_interested, growth: undefined, delay: 400 },
                                        { icon: <TrendingUp className="h-4 w-4" />, label: 'Visites profil', value: stats.profile_visits, growth: undefined, delay: 500 },
                                    ].map(s => <StatCard key={s.label} {...s} />)}
                                </div>
                            </motion.div>

                            {/* ═══ MAIN GRID ═══ */}
                            <div className="grid gap-6 lg:grid-cols-3">

                                {/* LEFT COLUMN */}
                                <div className="space-y-6">

                                    {/* Talent Score */}
                                    <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}
                                        className="rounded-3xl border border-muted-foreground/10 bg-card/80 p-6 shadow-md text-center space-y-4 overflow-hidden relative">
                                        <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-primary/5 blur-2xl" />
                                        <SectionLabel icon={<BarChart3 className="h-3.5 w-3.5" />}>Talent Score</SectionLabel>
                                        <TalentScoreGauge score={talent.talent_score} level={talent.level} />
                                        {hasAiData && avgAiScore !== null && (
                                            <div className="flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-primary/5 border border-primary/10">
                                                <Brain className="h-3.5 w-3.5 text-primary" />
                                                <span className="text-xs font-bold text-foreground/70">Score IA : <span className="text-primary font-black">{avgAiScore}/100</span></span>
                                            </div>
                                        )}
                                        <div className="grid grid-cols-2 gap-2">
                                            {[
                                                { label: 'Activite', val: Math.min(100, stats.videos_count * 12) },
                                                { label: 'Engagement', val: Math.min(100, Math.round(stats.total_likes / Math.max(1, stats.videos_count) * 3)) },
                                                { label: 'Popularite', val: Math.min(100, stats.followers / 5) },
                                                { label: 'Scouts', val: Math.min(100, stats.scouts_interested * 20) },
                                            ].map((item) => (
                                                <div key={item.label} className="rounded-xl bg-muted/30 p-3 border border-muted-foreground/8">
                                                    <p className="text-[9px] font-bold text-muted-foreground/60 uppercase tracking-widest">{item.label}</p>
                                                    <div className="mt-1.5 h-1.5 rounded-full bg-muted-foreground/10">
                                                        <motion.div className="h-full rounded-full bg-gradient-to-r from-primary to-emerald-400"
                                                            initial={{ width: 0 }} whileInView={{ width: `${Math.max(4, item.val)}%` }}
                                                            viewport={{ once: true }} transition={{ duration: 1 }} />
                                                    </div>
                                                    <p className="text-[9px] font-black text-primary mt-1">{Math.round(item.val)}%</p>
                                                </div>
                                            ))}
                                        </div>
                                    </motion.div>

                                    {/* Carte d'identite */}
                                    <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}
                                        className="rounded-3xl border border-muted-foreground/10 bg-gradient-to-br from-card via-card to-muted/10 p-6 shadow-md space-y-4">
                                        <SectionLabel>Carte d'Identite</SectionLabel>
                                        <div className="grid grid-cols-2 gap-2.5">
                                            {[
                                                { icon: <Footprints className="h-3.5 w-3.5 text-primary" />, label: 'Pied fort', value: talent.dominant_foot === 'R' ? 'Droit' : talent.dominant_foot === 'L' ? 'Gauche' : (talent.dominant_foot || '—') },
                                                { icon: <Ruler className="h-3.5 w-3.5 text-primary" />, label: 'Taille', value: talent.height_cm ? `${talent.height_cm} cm` : '—' },
                                                { icon: <Scale className="h-3.5 w-3.5 text-primary" />, label: 'Poids', value: talent.weight_kg ? `${talent.weight_kg} kg` : '—' },
                                                { icon: <MapPin className="h-3.5 w-3.5 text-primary" />, label: 'Nationalite', value: talent.nationality || '—' },
                                                { icon: <Target className="h-3.5 w-3.5 text-primary" />, label: 'Position', value: talent.position },
                                                { icon: <Activity className="h-3.5 w-3.5 text-primary" />, label: 'Age', value: talent.age ? `${talent.age} ans` : '—' },
                                                { icon: <Globe className="h-3.5 w-3.5 text-primary" />, label: 'Ville', value: [talent.city, talent.country].filter(Boolean).join(', ') || '—' },
                                                { icon: <Video className="h-3.5 w-3.5 text-primary" />, label: 'Videos', value: `${stats.videos_count} publiee${stats.videos_count > 1 ? 's' : ''}` },
                                            ].map((item) => (
                                                <motion.div key={item.label} whileHover={{ scale: 1.02 }}
                                                    className="flex flex-col gap-1 rounded-2xl bg-muted/30 p-3 border border-muted-foreground/8 cursor-default">
                                                    <div className="flex items-center gap-1.5">{item.icon}<span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/55">{item.label}</span></div>
                                                    <span className="text-sm font-black capitalize text-foreground leading-tight">{item.value}</span>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </motion.div>

                                    {/* Badges */}
                                    <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}
                                        className="rounded-3xl border border-muted-foreground/10 bg-card/80 p-6 shadow-md space-y-4">
                                        <SectionLabel icon={<Award className="h-3.5 w-3.5" />}>Badges EndoTalent</SectionLabel>
                                        <div className="grid grid-cols-2 gap-2">
                                            {badges.map((b, i) => (
                                                <motion.div key={b.label}
                                                    initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }}
                                                    viewport={{ once: true }} transition={{ delay: i * 0.08, type: 'spring', stiffness: 200 }}
                                                    whileHover={{ scale: 1.05, y: -2 }}
                                                    className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl border text-center ${b.color}`}>
                                                    <span className="text-xl">{b.icon}</span>
                                                    <span className="text-[8px] font-black uppercase tracking-wider leading-tight">{b.label}</span>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </motion.div>

                                    {/* AI Matching */}
                                    <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}
                                        className="rounded-3xl border border-primary/15 bg-gradient-to-br from-primary/5 to-emerald-500/5 p-6 shadow-md space-y-4">
                                        <SectionLabel icon={<Zap className="h-3.5 w-3.5" />}>IA Matching Clubs</SectionLabel>
                                        <div className="space-y-3">
                                            {aiMatches.map((m, i) => (
                                                <div key={m.name} className="flex items-center gap-3">
                                                    <div className="h-8 w-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-black text-xs">{i + 1}</div>
                                                    <div className="flex-1">
                                                        <div className="flex justify-between mb-1">
                                                            <p className="text-xs font-bold">{m.name}</p>
                                                            <span className="text-xs font-black text-primary">{m.pct}%</span>
                                                        </div>
                                                        <div className="h-1.5 rounded-full bg-muted-foreground/10">
                                                            <motion.div className="h-full rounded-full bg-gradient-to-r from-primary to-emerald-400"
                                                                initial={{ width: 0 }} whileInView={{ width: `${m.pct}%` }}
                                                                viewport={{ once: true }} transition={{ duration: 0.8, delay: i * 0.15 }} />
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <p className="text-[9px] text-center text-muted-foreground/40 italic">Score calcule par notre algorithme IA proprietaire</p>
                                    </motion.div>
                                </div>

                                {/* CENTER + RIGHT COLUMN */}
                                <div className="lg:col-span-2 space-y-6">

                                    {/* Pitch Video */}
                                    <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}
                                        className="rounded-3xl border border-muted-foreground/10 bg-card/80 p-6 shadow-md">
                                        <SectionLabel icon={<Play className="h-3.5 w-3.5" />}>Video Pitch</SectionLabel>
                                        <div className="relative aspect-video rounded-2xl overflow-hidden bg-zinc-950 border border-muted-foreground/10 group">
                                            {isPlayingPitch ? (
                                                <MediaPipeVideoPlayer src={pitchVideo} className="w-full h-full" />
                                            ) : (
                                                <div onClick={() => setIsPlayingPitch(true)} className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer">
                                                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-900/60 to-transparent z-0" />
                                                    <div className="absolute inset-0 opacity-35 bg-[url('https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=1200')] bg-cover bg-center transition-transform duration-700 group-hover:scale-105" />
                                                    <div className="relative z-10 h-16 w-16 rounded-full bg-primary/10 border-2 border-primary/40 flex items-center justify-center text-primary backdrop-blur-md transition-all group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground group-hover:shadow-[0_0_40px_rgba(34,197,94,0.5)]">
                                                        <Play className="h-7 w-7 fill-current translate-x-0.5" />
                                                    </div>
                                                    <div className="absolute bottom-4 left-4 right-4 z-10 text-left">
                                                        <p className="text-[9px] font-black uppercase tracking-widest text-primary mb-1">Presentation</p>
                                                        <h4 className="text-white font-black text-lg group-hover:text-primary transition-colors">Pitch — {talent.display_name}</h4>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>

                                    {/* Bio */}
                                    {talent.bio && (
                                        <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}
                                            className="rounded-3xl border border-muted-foreground/10 bg-card/80 p-6 shadow-md">
                                            <SectionLabel>Biographie</SectionLabel>
                                            <p className="text-sm leading-relaxed font-medium text-foreground/85">{talent.bio}</p>
                                        </motion.div>
                                    )}

                                    {/* Portfolio — masque si aucune video ET aucun doc */}
                                    {(highlights.length > 0) && (
                                    <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}
                                        className="rounded-3xl border border-muted-foreground/10 bg-card/80 p-6 shadow-md">
                                        <SectionLabel icon={<Video className="h-3.5 w-3.5" />}>Portfolio Multimedia</SectionLabel>
                                        <div className="flex gap-2 p-1.5 rounded-2xl bg-muted/30 border border-muted-foreground/8 mb-5">
                                            {([['videos', 'Highlights & IA'], ['documents', 'Certificats']] as const).map(([tab, label]) => (
                                                <button key={tab} onClick={() => setPortfolioTab(tab)}
                                                    className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${portfolioTab === tab ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'}`}>
                                                    {tab === 'videos' ? '🎥 ' : '📜 '}{label}
                                                </button>
                                            ))}
                                        </div>
                                        <AnimatePresence mode="wait">
                                            {portfolioTab === 'videos' && (
                                                <motion.div key="videos" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                                                    className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                    {highlights.length > 0 ? highlights.map((vid, idx) => (
                                                        <motion.div key={vid.id ?? idx}
                                                            initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: idx * 0.05 }}
                                                            className="rounded-2xl border border-muted-foreground/8 bg-muted/10 overflow-hidden flex flex-col">
                                                            <div className="relative aspect-video bg-zinc-950">
                                                                <MediaPipeVideoPlayer id={`video-${vid.id ?? idx}`} src={vid.file_path} className="absolute inset-0 w-full h-full" />
                                                                <div className="absolute top-2 right-2 z-10 flex gap-1.5 items-center">
                                                                    {vid.status === 'ready' && vid.ai_analysis && (
                                                                        <span className="px-2 py-0.5 rounded-full bg-primary/90 text-white text-[8px] font-black uppercase flex items-center gap-1">
                                                                            <Brain className="h-2.5 w-2.5" /> IA
                                                                        </span>
                                                                    )}
                                                                    {vid.status === 'processing' && (
                                                                        <span className="px-2 py-0.5 rounded-full bg-amber-500/90 text-white text-[8px] font-black uppercase animate-pulse">
                                                                            Analyse...
                                                                        </span>
                                                                    )}
                                                                    {canEdit && (
                                                                        <button onClick={() => handleDeleteVideo(vid.id)}
                                                                            className="p-1.5 rounded-lg bg-rose-600/90 hover:bg-rose-700 hover:scale-105 text-white transition-all shadow-md flex items-center justify-center cursor-pointer shrink-0 border border-rose-500/30"
                                                                            title="Supprimer cette vidéo">
                                                                            <Trash2 className="h-3 w-3" />
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <div className="p-4 space-y-3 flex-1">
                                                                <div className="flex justify-between items-start gap-2">
                                                                    <p className="text-xs font-black uppercase text-foreground">{vid.title}</p>
                                                                    <div className="flex items-center gap-1.5 text-[9px] font-bold text-muted-foreground/70 bg-card/60 px-2 py-1 rounded-lg border border-muted-foreground/5 shrink-0">
                                                                        <span>👁️ {formatNumber(vid.views)}</span>
                                                                        <span>❤️ {formatNumber(vid.likes)}</span>
                                                                    </div>
                                                                </div>
                                                                {vid.status === 'processing' && (
                                                                    <div className="p-2.5 rounded-xl bg-amber-500/5 border border-amber-500/15 flex items-center gap-2 text-[9px] font-black uppercase text-amber-500 animate-pulse">
                                                                        <span className="h-2 w-2 rounded-full bg-amber-500 animate-ping" /> Analyse IA en cours...
                                                                    </div>
                                                                )}
                                                                {vid.status === 'failed' && (
                                                                    <div className="p-2.5 rounded-xl bg-rose-500/5 border border-rose-500/15 text-center text-[9px] font-black uppercase text-rose-400">
                                                                        Analyse IA echouee
                                                                    </div>
                                                                )}
                                                                {vid.status === 'ready' && vid.ai_analysis && (
                                                                    <div>
                                                                        <button onClick={() => setOpenAiVideoId(openAiVideoId === (vid.id ?? idx) ? null : (vid.id ?? idx))}
                                                                            className={`w-full h-9 rounded-xl text-[9px] font-black uppercase tracking-wider border transition-all flex items-center justify-center gap-1.5 ${openAiVideoId === (vid.id ?? idx) ? 'bg-primary text-primary-foreground border-primary shadow-md' : 'bg-primary/8 text-primary border-primary/20 hover:bg-primary/15'}`}>
                                                                            <Brain className="h-3.5 w-3.5" />
                                                                            {openAiVideoId === (vid.id ?? idx) ? 'Fermer Rapport IA' : 'Voir Rapport IA'}
                                                                        </button>
                                                                        <AnimatePresence>
                                                                            {openAiVideoId === (vid.id ?? idx) && (
                                                                                <AiAnalysisCard 
                                                                                    analysis={vid.ai_analysis} 
                                                                                    onSeek={(timeStr) => {
                                                                                        const [min, sec] = timeStr.split(':').map(Number);
                                                                                        const timeInSeconds = min * 60 + sec;
                                                                                        const videoEl = document.getElementById(`video-${vid.id ?? idx}`) as HTMLVideoElement;
                                                                                        if (videoEl) {
                                                                                            videoEl.currentTime = timeInSeconds;
                                                                                            videoEl.play();
                                                                                        }
                                                                                    }}
                                                                                />
                                                                            )}
                                                                        </AnimatePresence>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </motion.div>
                                                    )) : (
                                                        <div className="col-span-2 text-center py-14 space-y-3">
                                                            <Video className="h-10 w-10 text-muted-foreground/20 mx-auto" />
                                                            <p className="text-sm text-muted-foreground font-semibold">Aucun highlight disponible.</p>
                                                        </div>
                                                    )}
                                                </motion.div>
                                            )}
                                            {portfolioTab === 'documents' && (
                                                <motion.div key="documents" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                                                    className="space-y-3">
                                                    {[
                                                        { title: "Certificat d'Aptitude Academie Elite", issuer: 'Federation Nationale de Football', date: '2025' },
                                                        { title: 'Attestation de Performance Athletique', issuer: 'Centre de Performance Regional', date: '2024' },
                                                    ].map((doc, idx) => (
                                                        <div key={idx} className="flex items-center justify-between p-4 rounded-2xl bg-muted/30 border border-muted-foreground/8 hover:bg-muted/50 transition-all">
                                                            <div className="flex items-center gap-3">
                                                                <div className="h-11 w-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                                                                    <Crown className="h-5 w-5" />
                                                                </div>
                                                                <div>
                                                                    <h5 className="text-xs font-black uppercase tracking-tight">{doc.title}</h5>
                                                                    <p className="text-[10px] text-muted-foreground font-semibold mt-0.5">{doc.issuer} — {doc.date}</p>
                                                                </div>
                                                            </div>
                                                            <Button variant="outline" className="h-9 px-3 rounded-xl font-bold text-[10px] uppercase gap-1.5">
                                                                <Download className="h-3 w-3" /> Telecharger
                                                            </Button>
                                                        </div>
                                                    ))}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </motion.div>
                                    )}{/* end highlights.length > 0 */}

                                    {/* Scouting + Value */}
                                    <div className="grid md:grid-cols-2 gap-5">
                                        <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}
                                            className="rounded-3xl border border-muted-foreground/10 bg-gradient-to-br from-card to-muted/10 p-6 shadow-md space-y-4">
                                            <SectionLabel>Rapport de Scouting</SectionLabel>
                                            {hasAiData && (
                                                <div className="flex items-center gap-2 p-2 rounded-xl bg-primary/5 border border-primary/10">
                                                    <Brain className="h-3.5 w-3.5 text-primary shrink-0" />
                                                    <p className="text-[9px] font-bold text-primary">Donnees issues de l'analyse IA</p>
                                                </div>
                                            )}
                                            <div className="space-y-3">
                                                <div>
                                                    <p className="text-[8px] font-black uppercase tracking-widest text-emerald-400 mb-1.5">Forces</p>
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {(allStrengths.length > 0 ? allStrengths : scoutingReport.pros).map(pro => (
                                                            <span key={pro} className="px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[8px] font-black uppercase">
                                                                {pro}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div>
                                                    <p className="text-[8px] font-black uppercase tracking-widest text-rose-400 mb-1.5">Axes d'amelioration</p>
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {(allWeaknesses.length > 0 ? allWeaknesses : scoutingReport.cons).map(con => (
                                                            <span key={con} className="px-2 py-0.5 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[8px] font-black uppercase">
                                                                {con}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div className="pt-2 border-t border-muted-foreground/8 flex items-center justify-between">
                                                    <div>
                                                        <p className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/60">Style comparable</p>
                                                        <p className="text-xs font-black mt-0.5">{comparable}</p>
                                                    </div>
                                                    <span className="text-xl">⚡</span>
                                                </div>
                                            </div>
                                        </motion.div>

                                        <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}
                                            className="rounded-3xl border border-muted-foreground/10 bg-gradient-to-br from-card to-muted/10 p-6 shadow-md flex flex-col justify-between space-y-4">
                                            <SectionLabel>Estimateur de Valeur IA</SectionLabel>
                                            <div className="text-center py-2">
                                                <p className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/60">Valeur marchande estimee</p>
                                                <h3 className="text-3xl font-black italic bg-gradient-to-r from-primary via-emerald-400 to-emerald-600 bg-clip-text text-transparent mt-1">
                                                    {formatNumber(valueEstimation.min)} — {formatNumber(valueEstimation.max)} DH
                                                </h3>
                                                <p className="text-[9px] text-zinc-400 font-semibold mt-1">Calcule par notre IA de scouting</p>
                                            </div>
                                            <div className="space-y-2">
                                                <div className="flex justify-between items-center text-[8px] font-bold text-muted-foreground/60 uppercase">
                                                    <span>Tendance</span>
                                                    <span className="text-emerald-400 font-black">+{valueEstimation.trend}% en hausse</span>
                                                </div>
                                                <div className="h-2 rounded-full bg-muted-foreground/10 overflow-hidden">
                                                    <motion.div className="h-full rounded-full bg-gradient-to-r from-primary to-emerald-400"
                                                        initial={{ width: 0 }}
                                                        whileInView={{ width: `${Math.min(100, (talent.talent_score / 100) * 80 + 20)}%` }}
                                                        viewport={{ once: true }} transition={{ duration: 1 }} />
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-2">
                                                <div className="rounded-xl bg-muted/30 p-3 border border-muted-foreground/8 text-center">
                                                    <p className="text-[8px] font-bold text-muted-foreground/60 uppercase">Favoris</p>
                                                    <p className="text-xl font-black">{stats.favorites}</p>
                                                </div>
                                                <div className="rounded-xl bg-muted/30 p-3 border border-muted-foreground/8 text-center">
                                                    <p className="text-[8px] font-bold text-muted-foreground/60 uppercase">Demandes</p>
                                                    <p className="text-xl font-black">{stats.requests_received}</p>
                                                </div>
                                            </div>
                                        </motion.div>
                                    </div>

                                    {/* Skills & Radar */}
                                    <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}
                                        className="rounded-3xl border border-muted-foreground/10 bg-card/80 p-6 shadow-md relative overflow-hidden">
                                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-5">
                                            <SectionLabel icon={<BarChart3 className="h-3.5 w-3.5" />}>Competences & Radar</SectionLabel>
                                            <button onClick={() => setShowAverage(!showAverage)}
                                                disabled={!hasAiData}
                                                className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border transition-all shrink-0 ${showAverage ? 'bg-primary/10 text-primary border-primary/20' : 'bg-muted/30 text-muted-foreground border-muted-foreground/10'} ${!hasAiData ? 'opacity-40 cursor-not-allowed' : ''}`}>
                                                {showAverage ? '🟢 Avec moyenne' : 'Sans moyenne'}
                                            </button>
                                        </div>
                                        <div className={`grid md:grid-cols-2 gap-8 items-center transition-all duration-300 ${!hasAiData ? 'blur-[5px] select-none pointer-events-none opacity-25' : ''}`}>
                                            <div className="space-y-3">
                                                {Object.entries(skills).map(([k, v], i) => (
                                                    <SkillBar key={k} label={k} value={v}
                                                        average={showAverage ? (averageRadarData[k] ?? 70) : undefined}
                                                        delay={i * 70} />
                                                ))}
                                            </div>
                                            <RadarChart values={radarData} averageValues={showAverage ? averageRadarData : undefined} />
                                        </div>

                                        {!hasAiData && (
                                            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 bg-card/20 backdrop-blur-[1px]">
                                                <div className="max-w-xs text-center space-y-3 p-5 rounded-2xl bg-card/95 border border-muted-foreground/10 shadow-xl">
                                                    <Brain className="h-8 w-8 text-primary mx-auto animate-pulse" />
                                                    <h4 className="text-xs font-black uppercase tracking-wider">Radar de competences inactif</h4>
                                                    <p className="text-[10px] text-muted-foreground font-semibold leading-relaxed">
                                                        {canEdit 
                                                            ? "Importez vos videos de match reel pour activer l'analyse de vos competences par notre moteur IA." 
                                                            : "Ce talent n'a pas encore importe de video de match pour generer son radar de competences IA."}
                                                    </p>
                                                    {canEdit && (
                                                        <Button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} size="sm" className="h-8 rounded-lg text-[9px] font-black uppercase tracking-wider">
                                                            Importer une video
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </motion.div>

                                    {/* Top Videos */}
                                    {topVideos.length > 0 && (
                                        <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}
                                            className="rounded-3xl border border-muted-foreground/10 bg-card/80 p-6 shadow-md">
                                            <SectionLabel icon={<Flame className="h-3.5 w-3.5" />}>Videos les plus populaires</SectionLabel>
                                            <div className="space-y-3">
                                                {topVideos.map((video, i) => (
                                                    <motion.div key={video.id}
                                                        initial={{ opacity: 0, x: -16 }} whileInView={{ opacity: 1, x: 0 }}
                                                        viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                                                        className="flex items-center gap-4 p-4 rounded-2xl bg-muted/30 border border-muted-foreground/8 hover:bg-muted/50 transition-colors group">
                                                        <div className={`h-11 w-11 rounded-xl flex items-center justify-center shrink-0 font-black text-sm ${i === 0 ? 'bg-amber-500/10 border border-amber-500/20 text-amber-500' : i === 1 ? 'bg-zinc-400/10 border border-zinc-400/20 text-zinc-400' : 'bg-amber-700/10 border border-amber-700/20 text-amber-700'}`}>
                                                            #{i + 1}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="font-bold text-sm truncate">{video.title}</p>
                                                            <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground font-semibold">
                                                                <span className="flex items-center gap-1"><Eye className="h-3 w-3" /> {formatNumber(video.views)}</span>
                                                                <span className="flex items-center gap-1"><Heart className="h-3 w-3" /> {formatNumber(video.likes_count)}</span>
                                                                <span className="flex items-center gap-1"><MessageSquare className="h-3 w-3" /> {video.comments_count}</span>
                                                            </div>
                                                        </div>
                                                        <button onClick={() => setSelectedPopVideo(video)}
                                                            className="h-9 px-4 rounded-xl font-bold text-xs bg-primary/10 text-primary border border-primary/20 flex items-center gap-1.5 hover:bg-primary hover:text-primary-foreground transition-all group-hover:scale-105 shrink-0 cursor-pointer">
                                                            Voir <ChevronRight className="h-3 w-3" />
                                                        </button>
                                                    </motion.div>
                                                ))}
                                            </div>
                                        </motion.div>
                                    )}

                                    {/* Interet marche */}
                                    <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}
                                        className="rounded-3xl border border-muted-foreground/10 bg-card/80 p-6 shadow-md">
                                        <SectionLabel icon={<TrendingUp className="h-3.5 w-3.5" />}>Interet du Marche</SectionLabel>
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                            {[
                                                { label: 'Visites profil', value: stats.profile_visits, icon: '👁️' },
                                                { label: 'Ajouts favoris', value: stats.favorites, icon: '❤️' },
                                                { label: 'Scouts', value: stats.scouts_interested, icon: '🏛️' },
                                                { label: 'Demandes', value: stats.requests_received, icon: '📩' },
                                            ].map((item) => (
                                                <motion.div key={item.label} whileHover={{ scale: 1.04, y: -2 }}
                                                    className="rounded-2xl bg-muted/30 p-4 border border-muted-foreground/8 text-center cursor-default">
                                                    <div className="text-2xl mb-1.5">{item.icon}</div>
                                                    <p className="text-xl font-black">{formatNumber(item.value)}</p>
                                                    <p className="text-[8px] font-bold text-muted-foreground/55 uppercase tracking-wider mt-0.5">{item.label}</p>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </motion.div>

                                    {/* Contact */}
                                    <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}
                                        className="rounded-3xl border border-muted-foreground/10 bg-card/80 p-6 shadow-md">
                                        <SectionLabel>Coordonnees</SectionLabel>
                                        {canSeeContactInfo ? (
                                            <div className="grid md:grid-cols-2 gap-4">
                                                <div className="flex items-center gap-4 p-4 rounded-2xl bg-muted/30 border border-muted-foreground/8">
                                                    <div className="h-11 w-11 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                                        <Mail className="h-5 w-5" />
                                                    </div>
                                                    <div>
                                                        <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">Email</p>
                                                        <p className="font-bold text-sm">{talent.user.email}</p>
                                                    </div>
                                                </div>
                                                {talent.user.phone && (
                                                    <div className="flex items-center gap-4 p-4 rounded-2xl bg-muted/30 border border-muted-foreground/8">
                                                        <div className="h-11 w-11 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                                            <Phone className="h-5 w-5" />
                                                        </div>
                                                        <div>
                                                            <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">Telephone</p>
                                                            <p className="font-bold text-sm">{talent.user.phone}</p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="rounded-2xl border-2 border-dashed border-muted-foreground/20 p-8 text-center space-y-5 bg-muted/10">
                                                <p className="text-lg font-black uppercase">Contact Protege</p>
                                                <p className="text-xs text-muted-foreground/60 max-w-xs mx-auto">Debloquez le profil pour acceder aux coordonnees completes.</p>
                                                <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-sm mx-auto">
                                                    <Button onClick={handleUnlock} className="flex-1 h-11 rounded-xl font-bold uppercase gap-2">
                                                        <Lock className="h-4 w-4" /> Debloquer (50 Credits)
                                                    </Button>
                                                    <Button onClick={() => router.post(start(talent.user.id).url)} variant="secondary"
                                                        className="flex-1 h-11 rounded-xl font-bold uppercase gap-2">
                                                        <MessageSquare className="h-4 w-4" /> Chat (10 Credits)
                                                    </Button>
                                                </div>
                                            </div>
                                        )}
                                    </motion.div>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* ═══ CHATBOT ═══ */}
                <div className="fixed bottom-6 right-6 z-50">
                    <motion.button onClick={() => setIsChatOpen(!isChatOpen)}
                        whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                        className="h-14 w-14 rounded-full bg-gradient-to-r from-primary to-emerald-500 text-white flex items-center justify-center shadow-xl shadow-primary/30 relative">
                        <motion.div animate={{ rotate: isChatOpen ? 90 : 0 }} transition={{ duration: 0.2 }}>
                            {isChatOpen ? <span className="text-lg font-bold">x</span> : <MessageSquare className="h-6 w-6 fill-current" />}
                        </motion.div>
                        {!isChatOpen && (
                            <span className="absolute -top-1 -right-1 h-4 w-4 bg-rose-500 rounded-full border-2 border-card text-[8px] font-black flex items-center justify-center animate-bounce">!</span>
                        )}
                    </motion.button>
                </div>

                <AnimatePresence>
                    {isChatOpen && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.85, y: 50 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.85, y: 50 }}
                            className="fixed bottom-24 right-6 w-[360px] max-h-[520px] h-[520px] rounded-3xl border border-muted-foreground/15 bg-card/95 backdrop-blur-md shadow-2xl z-50 flex flex-col overflow-hidden text-left">
                            <div className="p-4 bg-gradient-to-r from-zinc-900 to-zinc-950 border-b border-muted-foreground/10 flex items-center justify-between shrink-0">
                                <div className="flex items-center gap-2">
                                    <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary to-emerald-500 flex items-center justify-center">
                                        <Brain className="h-4 w-4 text-white" />
                                    </div>
                                    <div>
                                        <h4 className="text-xs font-black uppercase tracking-wider text-white">Scout Assistant IA</h4>
                                        <div className="flex items-center gap-1 mt-0.5">
                                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                            <p className="text-[8px] text-zinc-400 font-bold">EndoTalent AI · En ligne</p>
                                        </div>
                                    </div>
                                </div>
                                <button onClick={() => setIsChatOpen(false)} className="text-zinc-400 hover:text-white transition-colors h-7 w-7 rounded-lg hover:bg-white/10 flex items-center justify-center">
                                    <span className="text-sm">x</span>
                                </button>
                            </div>
                            <div className="flex-1 p-4 overflow-y-auto space-y-3 scrollbar-none text-xs">
                                {chatMessages.map((msg, i) => (
                                    <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                                        className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[82%] p-3 rounded-2xl text-[11px] leading-relaxed ${msg.sender === 'user' ? 'bg-primary text-primary-foreground rounded-tr-none' : 'bg-muted/50 border border-muted-foreground/8 text-foreground rounded-tl-none'}`}>
                                            {msg.text.split('**').map((part, idx) =>
                                                idx % 2 === 1 ? <strong key={idx} className={`font-black ${msg.sender === 'user' ? '' : 'text-primary'}`}>{part}</strong> : part
                                            )}
                                        </div>
                                    </motion.div>
                                ))}
                                {isTyping && (
                                    <div className="flex justify-start">
                                        <div className="bg-muted/50 border border-muted-foreground/8 p-3 rounded-2xl rounded-tl-none flex items-center gap-1">
                                            <span className="h-1.5 w-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                            <span className="h-1.5 w-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                            <span className="h-1.5 w-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                        </div>
                                    </div>
                                )}
                                <div ref={chatEndRef} />
                            </div>
                            <div className="px-3 py-2 border-t border-muted-foreground/8 flex gap-1.5 overflow-x-auto whitespace-nowrap scrollbar-none shrink-0">
                                {[
                                    { q: `Quel est le poste de ${talent.display_name}?`, label: 'Poste' },
                                    { q: 'Score IA?', label: 'Score IA' },
                                    { q: 'Disponible?', label: 'Dispo' },
                                    { q: 'Valeur marchande?', label: 'Valeur' },
                                    { q: 'Forces?', label: 'Forces' },
                                ].map((chip) => (
                                    <button key={chip.q} onClick={() => handleSendMessage(chip.q)}
                                        className="px-2.5 py-1 rounded-full bg-muted/40 border border-muted-foreground/10 text-[8px] font-black uppercase tracking-wider text-muted-foreground hover:text-primary hover:border-primary/30 hover:bg-primary/5 transition-all">
                                        {chip.label}
                                    </button>
                                ))}
                            </div>
                            <div className="p-3 bg-muted/20 border-t border-muted-foreground/8 flex gap-2 shrink-0">
                                <input type="text" value={chatInput}
                                    onChange={(e) => setChatInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(chatInput)}
                                    placeholder="Posez votre question..."
                                    className="flex-1 bg-muted/50 border border-muted-foreground/10 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-primary/40 text-foreground placeholder:text-muted-foreground/40" />
                                <Button onClick={() => handleSendMessage(chatInput)} className="h-9 px-3 rounded-xl font-bold uppercase text-[9px] tracking-wider gap-1">
                                    <Zap className="h-3 w-3" />
                                </Button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Popular Video Lightbox Modal */}
                <AnimatePresence>
                    {selectedPopVideo && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-zinc-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
                            onClick={() => setSelectedPopVideo(null)}
                        >
                            <motion.div
                                initial={{ scale: 0.95, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.95, opacity: 0 }}
                                className="relative bg-card w-full max-w-3xl rounded-3xl border border-muted-foreground/10 overflow-hidden shadow-2xl"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="p-4 bg-muted/40 border-b border-muted-foreground/8 flex items-center justify-between">
                                    <h3 className="text-sm font-black uppercase tracking-wider">{selectedPopVideo.title}</h3>
                                    <button
                                        onClick={() => setSelectedPopVideo(null)}
                                        className="h-8 w-8 rounded-full bg-muted hover:bg-muted-foreground/10 flex items-center justify-center text-muted-foreground hover:text-foreground transition-all cursor-pointer text-sm font-bold"
                                    >
                                        x
                                    </button>
                                </div>
                                <div className="aspect-video bg-zinc-950">
                                    <MediaPipeVideoPlayer src={selectedPopVideo.file_path} className="w-full h-full" />
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </AppLayout>
    );
}
