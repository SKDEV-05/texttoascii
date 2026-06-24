import { usePage, Link, router } from '@inertiajs/react';
import { ChevronsUpDown, Sun, Moon, Monitor, Settings, LogOut, Users, Wallet, History } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { UserInfo } from '@/components/user-info';
import { useAppearance } from '@/hooks/use-appearance';
import { logout } from '@/routes';
import { edit } from '@/routes/profile';
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

export function NavUser({ isSlim = false }: { isSlim?: boolean }) {
    const { auth } = usePage<any>().props;
    const user = auth?.user;
    const { appearance, updateAppearance } = useAppearance();

    if (!user) {
        return null;
    }

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <Dialog>
                    <DialogTrigger asChild>
                        <SidebarMenuButton
                            size="lg"
                            className="group text-sidebar-accent-foreground flex justify-center items-center w-full"
                            data-test="sidebar-menu-button"
                        >
                            <UserInfo user={user} isSlim={isSlim} />
                            {!isSlim && <ChevronsUpDown className="ml-auto size-4" />}
                        </SidebarMenuButton>
                    </DialogTrigger>
                    <DialogContent className="max-w-md border-muted-foreground/20 rounded-3xl bg-card text-foreground shadow-2xl p-6 text-left" dir="ltr">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-black italic uppercase tracking-tight flex items-center gap-2">
                                <UserInfo user={user} showEmail={true} />
                            </DialogTitle>
                        </DialogHeader>
                        
                        <div className="mt-6 space-y-6">
                            {/* Profile Stats Grid */}
                            <div className="grid grid-cols-2 gap-4 bg-muted/40 p-4 rounded-2xl border border-border/50 text-center">
                                <div className="space-y-1">
                                    <div className="flex items-center justify-center gap-1.5 text-muted-foreground">
                                        <Users className="h-4 w-4" />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Followers</span>
                                    </div>
                                    <p className="text-2xl font-black">{user.followers_count || 0}</p>
                                </div>
                                <div className="space-y-1 border-l border-border/50">
                                    <div className="flex items-center justify-center gap-1.5 text-muted-foreground">
                                        <Wallet className="h-4 w-4" />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Wallet</span>
                                    </div>
                                    <p className="text-2xl font-black text-primary">${Number(user.wallet_balance || 0).toFixed(2)}</p>
                                </div>
                            </div>

                            {/* Mini Transactions List */}
                            <div className="space-y-3">
                                <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                                    <History className="h-4 w-4" /> Mini Transaction History
                                </h4>
                                {user.recent_transactions && user.recent_transactions.length > 0 ? (
                                    <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                                        {user.recent_transactions.map((tx: any) => {
                                            const isCredit = Number(tx.amount) > 0;
                                            return (
                                                <div key={tx.id} className="flex justify-between items-center p-3 rounded-2xl bg-muted/30 border border-border/30 text-xs">
                                                    <div className="text-left space-y-0.5 min-w-0 flex-1 pr-3">
                                                        <p className="font-bold uppercase tracking-tight line-clamp-1">{tx.description}</p>
                                                        <p className="text-[10px] text-muted-foreground font-semibold">{formatRelativeDate(tx.created_at)}</p>
                                                    </div>
                                                    <span className={`font-black text-xs shrink-0 ${isCredit ? 'text-green-500' : 'text-red-500'}`}>
                                                        {isCredit ? '+' : ''}${Math.abs(Number(tx.amount)).toFixed(2)}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <p className="text-xs text-muted-foreground/60 font-semibold pl-1">No transaction history found.</p>
                                )}
                            </div>

                            {/* Theme Customization */}
                            <div className="space-y-3">
                                <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground">Theme Mode</h4>
                                <div className="grid grid-cols-3 gap-2">
                                    <Button
                                        variant={appearance === 'light' ? 'default' : 'outline'}
                                        onClick={() => updateAppearance('light')}
                                        className="h-10 text-xs font-bold rounded-xl gap-2 cursor-pointer"
                                    >
                                        <Sun className="h-4 w-4" /> Light
                                    </Button>
                                    <Button
                                        variant={appearance === 'dark' ? 'default' : 'outline'}
                                        onClick={() => updateAppearance('dark')}
                                        className="h-10 text-xs font-bold rounded-xl gap-2 cursor-pointer"
                                    >
                                        <Moon className="h-4 w-4" /> Dark
                                    </Button>
                                    <Button
                                        variant={appearance === 'system' ? 'default' : 'outline'}
                                        onClick={() => updateAppearance('system')}
                                        className="h-10 text-xs font-bold rounded-xl gap-2 cursor-pointer"
                                    >
                                        <Monitor className="h-4 w-4" /> System
                                    </Button>
                                </div>
                            </div>

                            {/* Actions Group */}
                            <div className="flex gap-3 pt-4 border-t border-border/50">
                                <Link
                                    href={edit()}
                                    className="flex-1 h-11 text-xs font-black uppercase tracking-wider rounded-xl border border-input bg-background hover:bg-accent hover:text-accent-foreground flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                                >
                                    <Settings className="h-4 w-4" /> Settings
                                </Link>
                                <Link
                                    href={logout()}
                                    as="button"
                                    onClick={() => router.flushAll()}
                                    className="flex-1 h-11 text-xs font-black uppercase tracking-wider rounded-xl bg-destructive text-white hover:bg-destructive/90 flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                                >
                                    <LogOut className="h-4 w-4" /> Log out
                                </Link>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </SidebarMenuItem>
        </SidebarMenu>
    );
}
