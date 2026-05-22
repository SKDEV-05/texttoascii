import { Head, Link, usePage } from '@inertiajs/react';
import { dashboard, login, register } from '@/routes';
import { type User } from '@/types';
import { Play, Trophy, Users, ShieldCheck } from 'lucide-react';

export default function Welcome() {
    const { auth } = usePage<{ auth: { user: User } }>().props;

    return (
        <div className="min-h-screen bg-background font-sans antialiased">
            <Head title="Welcome to BayanMawhibtik" />
            
            {/* Navigation */}
            <nav className="fixed top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
                <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-2">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                            <Trophy className="h-6 w-6" />
                        </div>
                        <span className="text-xl font-bold tracking-tight">BayanMawhibtik</span>
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
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="text-center">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-xs font-black uppercase tracking-[0.2em] mb-8 animate-bounce">
                            <Trophy className="h-3 w-3" /> The Scouting Revolution is Here
                        </div>
                        <h1 className="text-5xl font-black tracking-tighter sm:text-7xl lg:text-8xl italic uppercase leading-[0.9]">
                            Showcase Your <span className="text-primary drop-shadow-[0_0_15px_rgba(34,197,94,0.3)]">Talent</span><br />
                            Reach Your <span className="text-primary drop-shadow-[0_0_15px_rgba(34,197,94,0.3)]">Dreams</span>.
                        </h1>
                        <p className="mx-auto mt-8 max-w-2xl text-lg text-muted-foreground sm:text-xl font-medium">
                            The elite platform where football talents meet professional opportunities. 
                            Build your digital scouting profile and get noticed by top clubs worldwide.
                        </p>
                        <div className="mt-12 flex flex-wrap justify-center gap-6">
                            <Link
                                href={register()}
                                className="group relative overflow-hidden rounded-2xl bg-primary px-10 py-5 text-xl font-black italic uppercase tracking-wider text-primary-foreground transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(34,197,94,0.4)]"
                            >
                                <span className="relative z-10">Join the Elite</span>
                                <div className="absolute inset-0 bg-white/10 translate-y-full transition-transform group-hover:translate-y-0" />
                            </Link>
                            <button className="flex items-center gap-3 rounded-2xl border-2 border-primary/20 bg-background px-10 py-5 text-xl font-black italic uppercase tracking-wider transition-all hover:bg-primary/5 hover:border-primary">
                                <Play className="h-6 w-6 fill-current text-primary" /> Watch Demo
                            </button>
                        </div>
                    </div>
                </div>
                
                {/* Modern Grid Background */}
                <div className="absolute inset-0 z-0 opacity-5 [mask-image:radial-gradient(ellipse_at_center,white,transparent)]">
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px]" />
                </div>
                
                {/* Background Decorations */}
                <div className="absolute -top-24 -left-24 h-[500px] w-[500px] rounded-full bg-primary/10 blur-[120px] animate-pulse" />
                <div className="absolute top-1/2 -right-24 h-[600px] w-[600px] -translate-y-1/2 rounded-full bg-primary/15 blur-[150px] animate-pulse delay-700" />
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
                        © {new Date().getFullYear()} BayanMawhibtik. All rights reserved.
                    </p>
                </div>
            </footer>
        </div>
    );
}
