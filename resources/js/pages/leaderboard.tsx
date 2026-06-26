import React from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { Trophy, Medal, Star, Flame, ChevronRight } from 'lucide-react';

interface Talent {
    id: number;
    name: string;
    position: string;
    nationality: string;
    photo: string | null;
    overall_score: number;
    level: string;
    videos_count: number;
}

interface Props {
    leaderboard: Talent[];
}

export default function Leaderboard({ leaderboard }: Props) {
    const fadeUp = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } }
    };

    const topThree = leaderboard.slice(0, 3);
    const rest = leaderboard.slice(3);

    return (
        <AppLayout>
            <Head title="Golden Boy Leaderboard" />

            <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 space-y-8">
                {/* Header section */}
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-yellow-500/20 via-zinc-900 to-yellow-900/40 border border-yellow-500/30 p-8 text-center shadow-2xl"
                >
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-2xl h-full bg-gradient-to-b from-yellow-500/10 to-transparent blur-3xl pointer-events-none" />
                    <Trophy className="h-16 w-16 text-yellow-500 mx-auto mb-4 drop-shadow-[0_0_15px_rgba(234,179,8,0.5)]" />
                    <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-white mb-2">
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-yellow-500 to-yellow-600">Golden Boy</span> Leaderboard
                    </h1>
                    <p className="text-zinc-400 max-w-xl mx-auto font-medium">
                        Le classement officiel des meilleurs talents de la plateforme, généré par notre IA en fonction de leurs performances vidéo et de leur impact.
                    </p>
                </motion.div>

                {/* Top 3 Podium */}
                {topThree.length > 0 && (
                    <div className="flex flex-col md:flex-row justify-center items-end gap-6 pt-10 pb-4">
                        {/* 2nd Place */}
                        {topThree[1] && (
                            <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                                className="w-full md:w-1/3 flex flex-col items-center order-2 md:order-1">
                                <Trophy className="h-8 w-8 text-zinc-300 mb-2" />
                                <Link href={`/talents/${topThree[1].id}`} className="relative group w-full">
                                    <div className="absolute -inset-1 rounded-2xl bg-gradient-to-b from-zinc-300/40 to-transparent blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <div className="relative flex flex-col items-center p-6 rounded-2xl bg-gradient-to-b from-zinc-800 to-zinc-950 border border-zinc-700 hover:border-zinc-500 transition-colors">
                                        <div className="h-24 w-24 rounded-full overflow-hidden border-4 border-zinc-300 mb-4 bg-zinc-800 flex items-center justify-center">
                                            {topThree[1].photo ? <img src={topThree[1].photo} className="w-full h-full object-cover" /> : <UserInitial name={topThree[1].name} />}
                                        </div>
                                        <h3 className="font-bold text-lg text-white truncate w-full text-center">{topThree[1].name}</h3>
                                        <p className="text-sm text-zinc-400">{topThree[1].position}</p>
                                        <div className="mt-4 px-4 py-2 rounded-xl bg-zinc-300/10 border border-zinc-300/20 text-zinc-300 font-black text-xl">
                                            {topThree[1].overall_score} <span className="text-xs text-zinc-500 font-normal">IA</span>
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>
                        )}

                        {/* 1st Place */}
                        {topThree[0] && (
                            <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                                className="w-full md:w-1/3 flex flex-col items-center order-1 md:order-2 z-10 -mt-8">
                                <Trophy className="h-12 w-12 text-yellow-500 mb-2 drop-shadow-[0_0_15px_rgba(234,179,8,0.8)]" />
                                <Link href={`/talents/${topThree[0].id}`} className="relative group w-full">
                                    <div className="absolute -inset-1 rounded-2xl bg-gradient-to-b from-yellow-500/60 to-transparent blur-lg opacity-50 group-hover:opacity-100 transition-opacity" />
                                    <div className="relative flex flex-col items-center p-8 rounded-2xl bg-gradient-to-b from-zinc-800 to-zinc-950 border border-yellow-500/50 hover:border-yellow-400 transition-colors shadow-2xl">
                                        <div className="absolute top-0 right-0 p-2"><Flame className="h-6 w-6 text-orange-500 animate-pulse" /></div>
                                        <div className="h-32 w-32 rounded-full overflow-hidden border-4 border-yellow-500 mb-4 bg-zinc-800 flex items-center justify-center relative">
                                            {topThree[0].photo ? <img src={topThree[0].photo} className="w-full h-full object-cover" /> : <UserInitial name={topThree[0].name} />}
                                        </div>
                                        <h3 className="font-black text-xl text-yellow-400 truncate w-full text-center">{topThree[0].name}</h3>
                                        <p className="text-sm text-yellow-500/70 font-bold">{topThree[0].position}</p>
                                        <div className="mt-4 px-6 py-2 rounded-xl bg-yellow-500/10 border border-yellow-500/30 text-yellow-500 font-black text-3xl shadow-[0_0_20px_rgba(234,179,8,0.2)]">
                                            {topThree[0].overall_score} <span className="text-sm text-yellow-500/50 font-normal">IA</span>
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>
                        )}

                        {/* 3rd Place */}
                        {topThree[2] && (
                            <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                                className="w-full md:w-1/3 flex flex-col items-center order-3">
                                <Trophy className="h-8 w-8 text-amber-600 mb-2" />
                                <Link href={`/talents/${topThree[2].id}`} className="relative group w-full">
                                    <div className="absolute -inset-1 rounded-2xl bg-gradient-to-b from-amber-600/40 to-transparent blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <div className="relative flex flex-col items-center p-6 rounded-2xl bg-gradient-to-b from-zinc-800 to-zinc-950 border border-amber-600/50 hover:border-amber-500 transition-colors">
                                        <div className="h-24 w-24 rounded-full overflow-hidden border-4 border-amber-600 mb-4 bg-zinc-800 flex items-center justify-center">
                                            {topThree[2].photo ? <img src={topThree[2].photo} className="w-full h-full object-cover" /> : <UserInitial name={topThree[2].name} />}
                                        </div>
                                        <h3 className="font-bold text-lg text-white truncate w-full text-center">{topThree[2].name}</h3>
                                        <p className="text-sm text-zinc-400">{topThree[2].position}</p>
                                        <div className="mt-4 px-4 py-2 rounded-xl bg-amber-600/10 border border-amber-600/20 text-amber-500 font-black text-xl">
                                            {topThree[2].overall_score} <span className="text-xs text-amber-600/50 font-normal">IA</span>
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>
                        )}
                    </div>
                )}

                {/* Rest of the leaderboard */}
                {rest.length > 0 && (
                    <motion.div variants={fadeUp} initial="hidden" animate="show" className="bg-card rounded-2xl border border-muted-foreground/10 overflow-hidden shadow-xl">
                        <div className="px-6 py-4 border-b border-muted-foreground/10 bg-muted/30">
                            <h2 className="text-lg font-black uppercase tracking-wider text-foreground flex items-center gap-2">
                                <Star className="h-5 w-5 text-primary" /> Top 100 Elite
                            </h2>
                        </div>
                        <div className="divide-y divide-muted-foreground/5">
                            {rest.map((talent, index) => (
                                <Link 
                                    key={talent.id} 
                                    href={`/talents/${talent.id}`}
                                    className="flex items-center gap-4 px-6 py-4 hover:bg-muted/40 transition-colors group"
                                >
                                    <div className="w-8 text-center font-bold text-muted-foreground group-hover:text-primary transition-colors">
                                        {index + 4}
                                    </div>
                                    <div className="h-12 w-12 rounded-full overflow-hidden bg-muted border border-border">
                                        {talent.photo ? (
                                            <img src={talent.photo} className="w-full h-full object-cover" />
                                        ) : (
                                            <UserInitial name={talent.name} />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-base font-bold text-foreground truncate group-hover:text-primary transition-colors">
                                            {talent.name}
                                        </h3>
                                        <p className="text-xs text-muted-foreground flex items-center gap-2">
                                            <span className="font-semibold text-foreground/80">{talent.position}</span>
                                            <span>•</span>
                                            <span>{talent.nationality}</span>
                                        </p>
                                    </div>
                                    <div className="text-right flex items-center gap-4">
                                        <div className="hidden sm:block text-xs text-muted-foreground">
                                            <span className="font-bold text-foreground">{talent.videos_count}</span> vidéos
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <span className="text-sm font-black text-primary bg-primary/10 px-3 py-1 rounded-lg border border-primary/20">
                                                {talent.overall_score} <span className="text-[10px] text-primary/60 font-normal">IA</span>
                                            </span>
                                        </div>
                                        <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </motion.div>
                )}

                {leaderboard.length === 0 && (
                    <div className="text-center py-20 bg-card rounded-3xl border border-muted-foreground/10">
                        <Trophy className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
                        <h3 className="text-xl font-bold text-foreground">Aucun talent classé</h3>
                        <p className="text-muted-foreground mt-2">Le classement s'actualise dès qu'un profil reçoit des évaluations IA.</p>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}

function UserInitial({ name }: { name: string }) {
    return (
        <div className="w-full h-full bg-zinc-800 text-zinc-400 flex items-center justify-center font-bold text-xl uppercase">
            {name.substring(0, 2)}
        </div>
    );
}
