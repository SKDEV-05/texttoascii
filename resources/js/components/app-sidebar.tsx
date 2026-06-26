import { Link, usePage } from '@inertiajs/react';
import { LayoutGrid, Video, MessageSquare, Users, Wallet, Shield, Bell, LogIn, UserCircle, Trophy } from 'lucide-react';
import AppLogoIcon from '@/components/app-logo-icon';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    useSidebar,
} from '@/components/ui/sidebar';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

// Date format helper matching wallet history format
const formatRelativeDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
    const compareDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

    const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (compareDate.getTime() === today.getTime()) {
        return `Today at ${timeStr}`;
    } else if (compareDate.getTime() === yesterday.getTime()) {
        return `Yesterday at ${timeStr}`;
    } else {
        return `${date.toLocaleDateString()} ${timeStr}`;
    }
};

export function AppSidebar({
    variant = 'sidebar',
    collapsible = 'icon',
    side = 'left'
}: {
    variant?: 'sidebar' | 'floating' | 'inset';
    collapsible?: 'icon' | 'offcanvas' | 'none';
    side?: 'left' | 'right';
}) {
    const { auth } = usePage<any>().props;
    const user = auth?.user;
    const { isCurrentUrl } = useCurrentUrl();
    const { state } = useSidebar();
    const isCollapsed = state === 'collapsed';

    const mainNavItems = [
        {
            title: 'For You',
            href: '/',
            icon: Video,
        },
        {
            title: 'Profil',
            href: '/talents/profil',
            icon: UserCircle,
            authRequired: true,
            talentOnly: true,
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
            title: 'Leaderboard',
            href: '/leaderboard',
            icon: Trophy,
            authRequired: false,
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
        {
            title: 'Admin Panel',
            href: '/admin',
            icon: Shield,
            authRequired: true,
            adminOnly: true,
        },
    ];

    // Filter items based on auth status and role
    const isScout = user?.role === 'scout_club';
    const isAdmin = user?.role === 'admin';
    const isTalent = user?.role === 'talent';
    const activeNavItems = mainNavItems.filter(item => {
        if (item.authRequired && !user) return false;
        if (item.scoutOnly && !isScout) return false;
        if (item.adminOnly && !isAdmin) return false;
        if (item.talentOnly && !isTalent) return false;
        return true;
    });

    return (
        <Sidebar collapsible={collapsible} variant={variant} side={side} className="border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-[width] duration-200 ease-linear" dir="ltr">
            {/* Header / Logo */}
            <SidebarHeader className="py-6 flex items-center justify-center border-b border-sidebar-border/20">
                <Link href="/" className="flex items-center justify-center select-none gap-3">
                    <AppLogoIcon className="size-10 text-primary shrink-0 transition-transform hover:rotate-12 duration-300" />
                    {!isCollapsed && (
                        <span className="font-black text-[18px] italic tracking-tight text-foreground uppercase transition-all duration-200 overflow-hidden whitespace-nowrap">
                            EndoTalent
                        </span>
                    )}
                </Link>
            </SidebarHeader>

            {/* Sidebar content */}
            <SidebarContent className={`py-6 gap-2.5 flex flex-col ${isCollapsed ? 'items-center' : 'px-4'}`}>
                <TooltipProvider delayDuration={0}>
                    {activeNavItems.map((item) => {
                        const isActive = isCurrentUrl(item.href);
                        
                        if (isCollapsed) {
                            return (
                                <Tooltip key={item.href}>
                                    <TooltipTrigger asChild>
                                        <Link 
                                            href={item.href} 
                                            className={`flex items-center justify-center w-12 h-12 rounded-xl transition-all duration-200 group ${
                                                isActive 
                                                    ? 'text-primary font-extrabold bg-primary/5' 
                                                    : 'text-sidebar-foreground/80 font-bold hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                                            }`}
                                        >
                                            <div className="relative shrink-0 flex items-center justify-center">
                                                <item.icon className={`h-6 w-6 stroke-[2.5] transition-transform group-hover:scale-105 ${isActive ? 'text-primary' : 'text-sidebar-foreground/40 group-hover:text-sidebar-foreground'}`} />
                                                {item.title === 'Messages' && user?.unread_count > 0 && (
                                                    <span className="absolute -top-1 -right-1 h-2.5 w-2.5 bg-primary rounded-full animate-pulse shadow-sm shadow-primary/40" />
                                                )}
                                            </div>
                                        </Link>
                                    </TooltipTrigger>
                                    <TooltipContent side="right">
                                        {item.title}
                                    </TooltipContent>
                                </Tooltip>
                            );
                        }

                        return (
                            <Link 
                                key={item.href}
                                href={item.href} 
                                className={`flex items-center gap-4 py-3 px-4 rounded-xl transition-all duration-200 group ${
                                    isActive 
                                        ? 'text-primary font-extrabold bg-primary/5' 
                                        : 'text-sidebar-foreground/80 font-bold hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                                }`}
                            >
                                <div className="relative shrink-0 flex items-center justify-center">
                                    <item.icon className={`h-6 w-6 stroke-[2.5] transition-transform group-hover:scale-105 ${isActive ? 'text-primary' : 'text-sidebar-foreground/40 group-hover:text-sidebar-foreground'}`} />
                                    {item.title === 'Messages' && user?.unread_count > 0 && (
                                        <span className="absolute -top-1 -right-1 h-2.5 w-2.5 bg-primary rounded-full animate-pulse shadow-sm shadow-primary/40" />
                                    )}
                                </div>
                                <span className="text-[15px] font-bold tracking-tight flex-1 truncate">{item.title}</span>
                                {item.title === 'Messages' && user?.unread_count > 0 && (
                                    <span className="h-5 min-w-5 px-1.5 bg-primary text-primary-foreground text-[10px] font-black rounded-full flex items-center justify-center shadow-md shadow-primary/20 shrink-0">
                                        {user.unread_count}
                                    </span>
                                )}
                            </Link>
                        );
                    })}

                    {/* Notifications Trigger */}
                    {user && (
                        isCollapsed ? (
                            <Tooltip>
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <button className="relative flex items-center justify-center w-12 h-12 rounded-xl transition-all duration-200 text-sidebar-foreground/80 font-bold hover:bg-sidebar-accent hover:text-sidebar-accent-foreground cursor-pointer group">
                                            <Bell className="h-6 w-6 stroke-[2.5] transition-transform group-hover:scale-105 text-sidebar-foreground/40 group-hover:text-sidebar-foreground" />
                                            {(user.unread_count > 0 || (user.recent_transactions && user.recent_transactions.length > 0)) && (
                                                <span className="absolute top-2.5 right-2.5 h-2.5 w-2.5 bg-primary rounded-full animate-pulse shadow-sm shadow-primary/40" />
                                            )}
                                        </button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-md border-muted-foreground/20 rounded-3xl bg-card text-foreground shadow-2xl p-6 text-left" dir="ltr">
                                        <DialogHeader>
                                            <DialogTitle className="text-2xl font-black italic uppercase tracking-tight flex items-center gap-2">
                                                <Bell className="h-6 w-6 text-primary" /> Notifications
                                            </DialogTitle>
                                        </DialogHeader>
                                        <div className="mt-4 space-y-6">
                                            {/* Messages Section */}
                                            <div className="space-y-3">
                                                <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground">Messages</h3>
                                                {user.unread_count > 0 ? (
                                                    <div className="flex justify-between items-center bg-muted/40 p-4 rounded-2xl border border-border/50">
                                                        <div className="flex items-center gap-3">
                                                            <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                                                            <p className="text-sm font-bold">You have {user.unread_count} unread message{user.unread_count > 1 ? 's' : ''}</p>
                                                        </div>
                                                        <Link href="/chat">
                                                            <button className="bg-primary hover:bg-primary/95 text-white font-extrabold text-xs uppercase px-4 py-2 rounded-xl transition-all hover:scale-[1.02] cursor-pointer">
                                                                Open Chat
                                                            </button>
                                                        </Link>
                                                    </div>
                                                ) : (
                                                    <p className="text-xs text-muted-foreground/60 font-semibold pl-1">No new messages.</p>
                                                )}
                                            </div>

                                            {/* Wallet/Transaction Section */}
                                            <div className="space-y-3">
                                                <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground">Recent Transactions</h3>
                                                {user.recent_transactions && user.recent_transactions.length > 0 ? (
                                                    <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
                                                        {user.recent_transactions.map((tx: any) => {
                                                            const isCredit = Number(tx.amount) > 0;
                                                            return (
                                                                <div key={tx.id} className="flex justify-between items-center p-3 rounded-2xl bg-muted/30 border border-border/30">
                                                                    <div className="text-left space-y-0.5">
                                                                        <p className="text-xs font-bold uppercase tracking-tight line-clamp-1">{tx.description}</p>
                                                                        <p className="text-[10px] text-muted-foreground font-semibold">{formatRelativeDate(tx.created_at)}</p>
                                                                    </div>
                                                                    <p className={`font-black text-xs shrink-0 pl-2 ${isCredit ? 'text-green-500' : 'text-red-500'}`}>
                                                                        {isCredit ? '+' : ''}${Math.abs(Number(tx.amount)).toFixed(2)}
                                                                    </p>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                ) : (
                                                    <p className="text-xs text-muted-foreground/60 font-semibold pl-1">No recent transaction notifications.</p>
                                                )}
                                            </div>
                                        </div>
                                    </DialogContent>
                                </Dialog>
                                <TooltipContent side="right">
                                    Notifications
                                </TooltipContent>
                            </Tooltip>
                        ) : (
                            <Dialog>
                                <DialogTrigger asChild>
                                    <button className="flex items-center gap-4 py-3 px-4 rounded-xl transition-all duration-200 text-sidebar-foreground/80 font-bold hover:bg-sidebar-accent hover:text-sidebar-accent-foreground cursor-pointer group w-full text-left">
                                        <div className="relative shrink-0 flex items-center justify-center">
                                            <Bell className="h-6 w-6 stroke-[2.5] transition-transform group-hover:scale-105 text-sidebar-foreground/40 group-hover:text-sidebar-foreground" />
                                            {(user.unread_count > 0 || (user.recent_transactions && user.recent_transactions.length > 0)) && (
                                                <span className="absolute top-0 right-0 h-2 w-2 bg-primary rounded-full animate-pulse" />
                                            )}
                                        </div>
                                        <span className="text-[15px] font-bold tracking-tight flex-1 truncate">Notifications</span>
                                        {(user.unread_count > 0 || (user.recent_transactions && user.recent_transactions.length > 0)) && (
                                            <span className="h-5 min-w-5 px-1.5 bg-primary text-primary-foreground text-[10px] font-black rounded-full flex items-center justify-center">
                                                {(user.unread_count || 0) + (user.recent_transactions?.length || 0)}
                                            </span>
                                        )}
                                    </button>
                                </DialogTrigger>
                                <DialogContent className="max-w-md border-muted-foreground/20 rounded-3xl bg-card text-foreground shadow-2xl p-6 text-left" dir="ltr">
                                    <DialogHeader>
                                        <DialogTitle className="text-2xl font-black italic uppercase tracking-tight flex items-center gap-2">
                                            <Bell className="h-6 w-6 text-primary" /> Notifications
                                        </DialogTitle>
                                    </DialogHeader>
                                    <div className="mt-4 space-y-6">
                                        {/* Messages Section */}
                                        <div className="space-y-3">
                                            <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground">Messages</h3>
                                            {user.unread_count > 0 ? (
                                                <div className="flex justify-between items-center bg-muted/40 p-4 rounded-2xl border border-border/50">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                                                        <p className="text-sm font-bold">You have {user.unread_count} unread message{user.unread_count > 1 ? 's' : ''}</p>
                                                    </div>
                                                    <Link href="/chat">
                                                        <button className="bg-primary hover:bg-primary/95 text-white font-extrabold text-xs uppercase px-4 py-2 rounded-xl transition-all hover:scale-[1.02] cursor-pointer">
                                                            Open Chat
                                                        </button>
                                                    </Link>
                                                </div>
                                            ) : (
                                                <p className="text-xs text-muted-foreground/60 font-semibold pl-1">No new messages.</p>
                                            )}
                                        </div>

                                        {/* Wallet/Transaction Section */}
                                        <div className="space-y-3">
                                            <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground">Recent Transactions</h3>
                                            {user.recent_transactions && user.recent_transactions.length > 0 ? (
                                                <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
                                                    {user.recent_transactions.map((tx: any) => {
                                                        const isCredit = Number(tx.amount) > 0;
                                                        return (
                                                            <div key={tx.id} className="flex justify-between items-center p-3 rounded-2xl bg-muted/30 border border-border/30">
                                                                <div className="text-left space-y-0.5">
                                                                    <p className="text-xs font-bold uppercase tracking-tight line-clamp-1">{tx.description}</p>
                                                                    <p className="text-[10px] text-muted-foreground font-semibold">{formatRelativeDate(tx.created_at)}</p>
                                                                </div>
                                                                <p className={`font-black text-xs shrink-0 pl-2 ${isCredit ? 'text-green-500' : 'text-red-500'}`}>
                                                                    {isCredit ? '+' : ''}${Math.abs(Number(tx.amount)).toFixed(2)}
                                                                </p>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            ) : (
                                                <p className="text-xs text-muted-foreground/60 font-semibold pl-1">No recent transaction notifications.</p>
                                            )}
                                        </div>
                                    </div>
                                </DialogContent>
                            </Dialog>
                        )
                    )}
                </TooltipProvider>
            </SidebarContent>

            {/* Footer */}
            <SidebarFooter className="py-6 flex items-center justify-center border-t border-sidebar-border/20">
                {user ? (
                    <NavUser isSlim={isCollapsed} />
                ) : (
                    isCollapsed ? (
                        <TooltipProvider delayDuration={0}>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Link href="/login" className="flex items-center justify-center w-12 h-12 rounded-xl transition-all duration-200 text-sidebar-foreground/80 font-bold hover:bg-sidebar-accent hover:text-sidebar-accent-foreground cursor-pointer">
                                        <LogIn className="h-6 w-6 stroke-[2.5] text-sidebar-foreground/40 hover:text-sidebar-foreground" />
                                    </Link>
                                </TooltipTrigger>
                                <TooltipContent side="right">
                                    Log In
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    ) : (
                        <div className="px-4 py-4 w-full flex flex-col gap-3 select-none text-left">
                            <p className="text-xs text-muted-foreground font-bold leading-relaxed">
                                Log in to follow talents, like videos, and write comments.
                            </p>
                            <Link href="/login" className="w-full">
                                <Button className="w-full bg-primary hover:bg-primary/90 text-white font-black rounded-xl uppercase tracking-wider h-11 text-xs shadow-md shadow-primary/20 transition-all hover:scale-[1.02]">
                                    Log In
                                </Button>
                            </Link>
                        </div>
                    )
                )}
            </SidebarFooter>
        </Sidebar>
    );
}
