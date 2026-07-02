import { Head, Link, usePage } from '@inertiajs/react';
import { dashboard, login, register } from '@/routes';
import { type User } from '@/types';
import { Play, Trophy, Users, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import AppLogoIcon from '@/components/app-logo-icon';

// Word-by-word stagger animations
const sentence = {
    hidden: { opacity: 1 },
    visible: {
        opacity: 1,
        transition: {
            delay: 0.1,
            staggerChildren: 0.04
        }
    }
};

const letter = {
    hidden: { opacity: 0, y: -40, scale: 0.3, rotate: -15 },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        rotate: 0,
        transition: { 
            type: "spring", 
            damping: 8, 
            stiffness: 120 
        }
    }
};

// Cyclic Typewriter list
const taglines = [
    "The elite platform where football talents meet professional opportunities.",
    "Build your digital scouting profile and get noticed by top clubs worldwide.",
    "Upload your skills, showcase your dominant foot, and get unlocked."
];

function TypewriterEffect() {
    const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
    const [displayedText, setDisplayedText] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);
    
    useEffect(() => {
        const fullText = taglines[currentPhraseIndex];
        let timer: NodeJS.Timeout;
        
        if (isDeleting) {
            timer = setTimeout(() => {
                setDisplayedText(prev => prev.substring(0, prev.length - 1));
            }, 250); // Speed for deletion
        } else {
            timer = setTimeout(() => {
                setDisplayedText(fullText.substring(0, displayedText.length + 1));
            }, 50); // Speed for typing
        }
        
        if (!isDeleting && displayedText === fullText) {
            timer = setTimeout(() => setIsDeleting(true), 2500); // Hold phrase
        } else if (isDeleting && displayedText === '') {
            setIsDeleting(false);
            setCurrentPhraseIndex(prev => (prev + 1) % taglines.length);
        }
        
        return () => clearTimeout(timer);
    }, [displayedText, isDeleting, currentPhraseIndex]);

    return (
        <p className="mx-auto mt-8 max-w-2xl text-lg text-muted-foreground sm:text-xl font-medium min-h-[60px] flex items-center justify-center select-none">
            {displayedText}
            <span className="w-1.5 h-5 bg-primary ml-1.5 inline-block animate-pulse shrink-0 rounded-full" />
        </p>
    );
}

// Particle explosion button wrapper
function AnimatedButton({ children, className, href }: any) {
    const [particles, setParticles] = useState<{ id: number; x: number; y: number }[]>([]);
    
    const triggerExplosion = () => {
        const newParticles = Array.from({ length: 12 }).map((_, i) => ({
            id: Date.now() + i,
            x: (Math.random() - 0.5) * 160,
            y: (Math.random() - 0.5) * 160
        }));
        setParticles(newParticles);
        setTimeout(() => setParticles([]), 700);
    };

    return (
        <div className="relative inline-block z-10">
            {/* Particles burst */}
            <AnimatePresence>
                {particles.map((p) => (
                    <motion.span
                        key={p.id}
                        initial={{ x: 0, y: 0, scale: 1.2, opacity: 1 }}
                        animate={{ x: p.x, y: p.y, scale: 0.2, opacity: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                        className="absolute w-2.5 h-2.5 bg-primary rounded-full pointer-events-none z-0 left-[45%] top-[40%] shadow-[0_0_10px_#22c55e]"
                    />
                ))}
            </AnimatePresence>

            <motion.div
                onHoverStart={triggerExplosion}
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.96 }}
                transition={{ type: "spring", stiffness: 200, damping: 8 }}
            >
                <Link href={href} className={className}>
                    {children}
                </Link>
            </motion.div>
        </div>
    );
}

export default function Welcome() {
    const { auth } = usePage<{ auth: { user: User } }>().props;

    return (
        <div className="min-h-screen bg-background font-sans antialiased overflow-x-hidden relative">
            <Head title="Welcome to EndoTalent" />


            {/* Navigation */}
            <nav className="fixed top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
                <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-3 select-none">
                        <AppLogoIcon className="h-12 w-12" />
                        <span className="text-xl font-bold tracking-tight">EndoTalent</span>
                    </div>
                    
                    <div className="flex items-center gap-4">
                        {auth.user ? (
                            <Link
                                href={dashboard()}
                                className="rounded-full bg-primary px-6 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                            >
                                Dashboard
                            </Link>
                        ) : (
                            <>
                                <Link
                                    href={login()}
                                    className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                                >
                                    Log in
                                </Link>
                                <Link
                                    href={register()}
                                    className="rounded-full bg-primary px-6 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                                >
                                    Join Now
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative overflow-hidden pt-32 pb-24 lg:pt-52 lg:pb-40 bg-white dark:bg-black">
                <div 
                    className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat pointer-events-none"
                    style={{ backgroundImage: "url('/images/first_page/first_page_picture.png')" }}
                />
                
                {/* Overlay to ensure readability in dark/light mode */}
                <div className="absolute inset-0 z-0 bg-white/5 dark:bg-black/75" />

                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="text-center">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-xs font-black uppercase tracking-[0.2em] mb-8 animate-bounce select-none">
                            <Trophy className="h-3 w-3" /> The Scouting Revolution is Here
                        </div>

                        {/* Stagger bouncy letter entrance */}
                        <motion.h1 
                            initial="hidden"
                            animate="visible"
                            variants={sentence}
                            className="text-5xl font-black tracking-tighter sm:text-7xl lg:text-8xl italic uppercase leading-[0.9] flex flex-col items-center justify-center select-none"
                        >
                            <span className="flex flex-wrap justify-center gap-x-2">
                                {"SHOWCASE".split("").map((char, index) => (
                                    <motion.span key={index} variants={letter} className="inline-block">
                                        {char}
                                    </motion.span>
                                ))}
                                <span className="w-1.5" />
                                {"YOUR".split("").map((char, index) => (
                                    <motion.span key={index} variants={letter} className="inline-block">
                                        {char}
                                    </motion.span>
                                ))}
                                <span className="w-1.5" />
                                <span className="text-primary drop-shadow-[0_0_15px_rgba(34,197,94,0.3)]">
                                    {"TALENT".split("").map((char, index) => (
                                        <motion.span key={index} variants={letter} className="inline-block">
                                            {char}
                                        </motion.span>
                                    ))}
                                </span>
                            </span>
                            <span className="flex flex-wrap justify-center gap-x-2 mt-2">
                                {"REACH".split("").map((char, index) => (
                                    <motion.span key={index} variants={letter} className="inline-block">
                                        {char}
                                    </motion.span>
                                ))}
                                <span className="w-1.5" />
                                {"YOUR".split("").map((char, index) => (
                                    <motion.span key={index} variants={letter} className="inline-block">
                                        {char}
                                    </motion.span>
                                ))}
                                <span className="w-1.5" />
                                <span className="text-primary drop-shadow-[0_0_15px_rgba(34,197,94,0.3)]">
                                    {"DREAMS".split("").map((char, index) => (
                                        <motion.span key={index} variants={letter} className="inline-block">
                                            {char}
                                        </motion.span>
                                    ))}
                                </span>
                                <motion.span variants={letter} className="inline-block text-primary">.</motion.span>
                            </span>
                        </motion.h1>

                        {/* Blinking Typewriter Effect */}
                        <TypewriterEffect />

                        <div className="mt-12 flex flex-wrap justify-center gap-6">
                            <AnimatedButton 
                                href={register()}
                                className="group relative overflow-hidden rounded-2xl bg-primary px-10 py-5 text-xl font-black italic uppercase tracking-wider text-primary-foreground transition-all flex items-center justify-center shadow-lg shadow-primary/25 border border-primary"
                            >
                                <span className="relative z-10">Join the Elite</span>
                            </AnimatedButton>
                            
                            <AnimatedButton 
                                href="/videos" 
                                className="flex items-center gap-3 rounded-2xl border-2 border-primary/20 bg-background px-10 py-5 text-xl font-black italic uppercase tracking-wider transition-all hover:border-primary text-foreground"
                            >
                                <Play className="h-6 w-6 fill-current text-primary shrink-0" /> Explore Talents
                            </AnimatedButton>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="bg-muted/50 py-20 lg:py-32">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="grid gap-12 md:grid-cols-3">
                        <div className="flex flex-col items-center text-center">
                            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                                <Users className="h-8 w-8" />
                            </div>
                            <h3 className="text-xl font-bold">For Talents</h3>
                            <p className="mt-4 text-muted-foreground">
                                Create your profile, upload up to 5 free videos, and show the world what you can do.
                            </p>
                        </div>
                        <div className="flex flex-col items-center text-center">
                            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                                <ShieldCheck className="h-8 w-8" />
                            </div>
                            <h3 className="text-xl font-bold">For Scouts & Clubs</h3>
                            <p className="mt-4 text-muted-foreground">
                                Discover emerging talents, filter by position, and communicate directly with players.
                            </p>
                        </div>
                        <div className="flex flex-col items-center text-center">
                            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                                <Trophy className="h-8 w-8" />
                            </div>
                            <h3 className="text-xl font-bold">Get Discovered</h3>
                            <p className="mt-4 text-muted-foreground">
                                Our platform bridges the gap between raw talent and professional opportunities.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t py-12">
                <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
                    <p className="text-sm text-muted-foreground">
                        © {new Date().getFullYear()} EndoTalent. All rights reserved.
                    </p>
                </div>
            </footer>
        </div>
    );
}
