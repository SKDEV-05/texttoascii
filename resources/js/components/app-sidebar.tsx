import { Link, usePage, router } from '@inertiajs/react';
import { LayoutGrid, Video, MessageSquare, Users, Wallet, Search } from 'lucide-react';
import { useState } from 'react';
import AppLogoIcon from '@/components/app-logo-icon';
import { NavUser } from '@/components/nav-user';
import { Button } from '@/components/ui/button';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
} from '@/components/ui/sidebar';
import { useCurrentUrl } from '@/hooks/use-current-url';

export function AppSidebar() {
    const { auth } = usePage<any>().props;
    const user = auth?.user;
    const { isCurrentUrl } = useCurrentUrl();
    const [searchQuery, setSearchQuery] = useState('');

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.get(`/talents?search=${encodeURIComponent(searchQuery)}`);
        }
    };

    const mainNavItems = [
        {
            title: 'For You',
            href: '/',
            icon: Video,
        },
        {
            title: 'Find Talents',
            href: '/talents',
            icon: Users,
            authRequired: true,
            scoutOnly: true,
        },
        {
            title: 'Messages',
            href: '/chat',
            icon: MessageSquare,
            authRequired: true,
        },
        {
            title: 'Wallet',
            href: '/wallet',
            icon: Wallet,
            authRequired: true,
        },
        {
            title: 'Dashboard',
            href: '/dashboard',
            icon: LayoutGrid,
            authRequired: true,
        },
    ];

    // Filter items based on auth status and role
    const isScout = user?.role === 'scout_club';
    const activeNavItems = mainNavItems.filter(item => {
        if (item.authRequired && !user) return false;
        if (item.scoutOnly && !isScout) return false;
        return true;
    });

    return (
        <Sidebar collapsible="none" className="border-r border-zinc-100 bg-white" dir="ltr">
            {/* Header / Logo */}
            <SidebarHeader className="p-0 flex flex-col">
                <Link href="/" className="flex items-center gap-3 px-6 py-5 select-none">
                    <AppLogoIcon className="size-11 text-primary shrink-0 transition-transform hover:rotate-12 duration-300" />
                    <span className="font-black text-[18px] italic tracking-tight text-zinc-950 uppercase">
                        EndoTalent
                    </span>
                </Link>

                {/* Search Bar — scouts only */}
                {isScout && (
                <form onSubmit={handleSearchSubmit} className="px-4 mb-4 select-none">
                    <div className="relative w-full bg-zinc-100 rounded-full flex items-center px-4 py-2 text-zinc-500 gap-2 border border-transparent focus-within:border-zinc-200 focus-within:bg-white transition-all">
                        <Search className="h-4 w-4 text-zinc-400 shrink-0" />
                        <input
                            type="text"
                            placeholder="Search talents..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-transparent border-none outline-none text-xs font-bold text-zinc-800 placeholder:text-zinc-400 w-full focus:ring-0 p-0"
                        />
                    </div>
                </form>
                )}
            </SidebarHeader>

            {/* Sidebar content */}
            <SidebarContent className="px-2 py-0 gap-1 overflow-y-auto">
                {activeNavItems.map((item) => {
                    const isActive = isCurrentUrl(item.href);
                    return (
                        <Link 
                            key={item.href}
                            href={item.href} 
                            className={`flex items-center gap-4 py-3 px-4 mx-2 rounded-xl transition-all duration-200 group ${
                                isActive 
                                    ? 'text-primary font-extrabold bg-primary/5' 
                                    : 'text-zinc-700 font-bold hover:bg-zinc-50 hover:text-zinc-950'
                            }`}
                        >
                            <item.icon className={`h-6 w-6 stroke-[2.5] transition-transform group-hover:scale-105 ${isActive ? 'text-primary' : 'text-zinc-400 group-hover:text-zinc-700'}`} />
                            <span className="text-[15px] tracking-tight">{item.title}</span>
                        </Link>
                    );
                })}

                {/* Guest Log In Banner */}
                {!user && (
                    <div className="px-4 py-6 mt-4 border-t border-zinc-100 flex flex-col gap-4 select-none">
                        <p className="text-xs text-zinc-500 font-bold leading-relaxed">
                            Log in to follow talents, like videos, and write comments.
                        </p>
                        <Link href="/login" className="w-full">
                            <Button className="w-full bg-primary hover:bg-primary/90 text-white font-black rounded-xl uppercase tracking-wider h-12 text-sm shadow-md shadow-primary/20 transition-all hover:scale-[1.02]">
                                Log In
                            </Button>
                        </Link>
                    </div>
                )}
            </SidebarContent>

            {/* Footer */}
            <SidebarFooter className="p-0 mt-auto">
                {/* User section if logged in */}
                {user ? (
                    <div className="px-2 py-4 border-t border-zinc-100">
                        <NavUser />
                    </div>
                ) : (
                    /* General Footer links matching TikTok */
                    <div className="px-6 py-6 border-t border-zinc-100 flex flex-col gap-2 select-none">
                        <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] font-bold text-zinc-400">
                            <Link href="/about" className="hover:underline">About</Link>
                            <Link href="/newsroom" className="hover:underline">Newsroom</Link>
                            <Link href="/contact" className="hover:underline">Contact</Link>
                            <Link href="/careers" className="hover:underline">Careers</Link>
                        </div>
                        <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] font-bold text-zinc-400 mt-2">
                            <Link href="/terms" className="hover:underline">Terms</Link>
                            <Link href="/privacy" className="hover:underline">Privacy</Link>
                        </div>
                        <span className="text-[10px] font-bold text-zinc-400 mt-4 block">
                            © {new Date().getFullYear()} EndoTalent
                        </span>
                    </div>
                )}
            </SidebarFooter>
        </Sidebar>
    );
}
