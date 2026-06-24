import { Head, useForm, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowUpRight, ArrowDownLeft, PlusCircle, CreditCard, Send, History } from 'lucide-react';
import type { Auth } from '@/types';

interface Transaction {
    id: number;
    amount: number;
    type: string;
    description: string;
    created_at: string;
}

interface Props {
    transactions: Transaction[];
}

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

export default function WalletIndex({ transactions }: Props) {
    const { auth } = usePage<{ auth: Auth }>().props;
    const user = auth.user;
    const isRestrictedRole = user?.role === 'talent' || user?.role === 'parent';

    const topupForm = useForm({
        amount: '',
    });

    const transferForm = useForm({
        email: '',
        amount: '',
    });

    const handleTopup = (amount: number) => {
        topupForm.setData('amount', amount.toString());
        topupForm.post('/wallet/topup', {
            onSuccess: () => topupForm.reset(),
        });
    };

    const handleTransfer = (e: React.FormEvent) => {
        e.preventDefault();
        transferForm.post('/wallet/transfer', {
            onSuccess: () => transferForm.reset(),
        });
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Wallet', href: '/wallet' }]}>
            <Head title="Wallet" />
            <div className="container mx-auto py-10 px-6 space-y-10 max-w-6xl text-left">
                
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-4xl font-black italic uppercase tracking-tight">MY WALLET</h1>
                        <p className="text-muted-foreground text-sm font-medium">Manage and monitor your platform funds.</p>
                    </div>
                </div>

                {/* Main section */}
                <div className="grid gap-8 md:grid-cols-3">
                    
                    {/* Card & Top up */}
                    <div className="md:col-span-1 space-y-6">
                        
                        {/* Virtual Card */}
                        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-indigo-900 text-white p-8 shadow-2xl aspect-[1.58/1] flex flex-col justify-between group transition-all duration-500 hover:scale-[1.02] hover:shadow-primary/20">
                            {/* Card Background Patterns */}
                            <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-white/5 blur-2xl" />
                            <div className="absolute left-10 bottom-0 h-32 w-32 rounded-full bg-primary-foreground/5 blur-xl" />
                            
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-xs font-black uppercase tracking-widest opacity-60">Platform Wallet</p>
                                    <p className="text-2xl font-black italic tracking-tighter uppercase mt-1">EndoTalent</p>
                                </div>
                                <CreditCard className="h-8 w-8 opacity-80" />
                            </div>
                            
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-widest opacity-50">Current Balance</p>
                                <h2 className="text-4xl font-black tracking-tight mt-1">
                                    ${(user as any).wallet_balance ? Number((user as any).wallet_balance).toFixed(2) : '0.00'}
                                </h2>
                            </div>

                            <div className="flex justify-between items-end">
                                <div>
                                    <p className="text-[8px] font-bold uppercase tracking-widest opacity-40">Card Holder</p>
                                    <p className="text-sm font-black tracking-tight mt-0.5">{user.name}</p>
                                </div>
                                <div className="h-6 w-10 bg-white/10 rounded-md backdrop-blur-sm border border-white/20" />
                            </div>
                        </div>

                        {/* Top-Up Panel */}
                        <Card className="border-muted-foreground/20 rounded-3xl bg-card shadow-sm p-6 space-y-4">
                            <h3 className="text-lg font-black uppercase tracking-tight flex items-center gap-2">
                                <PlusCircle className="h-5 w-5 text-primary" /> Top Up Balance
                            </h3>
                            <p className="text-xs text-muted-foreground font-medium">Select a simulated amount to instantly refill your wallet.</p>
                            
                            <div className="grid grid-cols-3 gap-2 pt-2">
                                {[50, 100, 500].map((amt) => (
                                    <Button
                                        key={amt}
                                        onClick={() => handleTopup(amt)}
                                        disabled={topupForm.processing}
                                        className="rounded-xl font-bold h-12 border-muted-foreground/20 hover:scale-105 transition-all text-xs"
                                        variant="outline"
                                    >
                                        +${amt}
                                    </Button>
                                ))}
                            </div>
                        </Card>
                    </div>

                    {/* Transfer & History */}
                    <div className="md:col-span-2 space-y-6">
                        
                        {/* Transfer Credits form */}
                        {!isRestrictedRole && (
                            <Card className="border-muted-foreground/20 rounded-3xl bg-card shadow-sm p-8">
                                <CardHeader className="p-0 mb-6">
                                    <CardTitle className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
                                        <Send className="h-5 w-5 text-primary" /> Send Credits
                                    </CardTitle>
                                    <CardDescription className="font-medium text-xs">
                                        Transfer funds to another user instantly via their registered email address.
                                    </CardDescription>
                                </CardHeader>
                                <form onSubmit={handleTransfer} className="space-y-4">
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div className="grid gap-2 text-left">
                                            <Label htmlFor="email" className="text-xs font-bold uppercase tracking-widest opacity-70">Recipient Email</Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                placeholder="scout@club.com"
                                                value={transferForm.data.email}
                                                onChange={e => transferForm.setData('email', e.target.value)}
                                                className="h-11 rounded-xl"
                                                required
                                            />
                                            {transferForm.errors.email && (
                                                <p className="text-xs text-destructive font-bold">{transferForm.errors.email}</p>
                                            )}
                                        </div>
                                        <div className="grid gap-2 text-left">
                                            <Label htmlFor="amount" className="text-xs font-bold uppercase tracking-widest opacity-70">Amount ($)</Label>
                                            <Input
                                                id="amount"
                                                type="number"
                                                min="1"
                                                placeholder="50"
                                                value={transferForm.data.amount}
                                                onChange={e => transferForm.setData('amount', e.target.value)}
                                                className="h-11 rounded-xl"
                                                required
                                            />
                                            {transferForm.errors.amount && (
                                                <p className="text-xs text-destructive font-bold">{transferForm.errors.amount}</p>
                                            )}
                                        </div>
                                    </div>
                                    <Button 
                                        type="submit" 
                                        className="w-full h-12 rounded-xl font-bold uppercase tracking-wider shadow-lg shadow-primary/20 mt-2"
                                        disabled={transferForm.processing}
                                    >
                                        Confirm Transfer
                                    </Button>
                                </form>
                            </Card>
                        )}

                        {/* Transactions History */}
                        <Card className="border-muted-foreground/20 rounded-3xl bg-card shadow-sm p-8">
                            <CardHeader className="p-0 mb-6">
                                <CardTitle className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
                                    <History className="h-5 w-5 text-primary" /> Transactions History
                                </CardTitle>
                                <CardDescription className="font-medium text-xs">
                                    Track all your wallet activities, including top-ups, transfers, and unlocks.
                                </CardDescription>
                            </CardHeader>
                            
                            <div className="divide-y divide-muted-foreground/10 max-h-[400px] overflow-y-auto pr-2">
                                {transactions.length > 0 ? (
                                    transactions.map((tx) => {
                                        const isCredit = Number(tx.amount) > 0;
                                        return (
                                            <div key={tx.id} className="flex justify-between items-center py-4 first:pt-0 last:pb-0">
                                                <div className="flex gap-4 items-center">
                                                    <div className={`h-10 w-10 rounded-full flex items-center justify-center ${isCredit ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                                                        {isCredit ? <ArrowDownLeft className="h-5 w-5" /> : <ArrowUpRight className="h-5 w-5" />}
                                                    </div>
                                                    <div className="text-left">
                                                        <p className="font-bold text-sm uppercase tracking-tight">{tx.description}</p>
                                                        <p className="text-[10px] text-muted-foreground font-semibold mt-0.5">{formatRelativeDate(tx.created_at)}</p>
                                                    </div>
                                                </div>
                                                <p className={`font-black text-base ${isCredit ? 'text-green-500' : 'text-red-500'}`}>
                                                    {isCredit ? '+' : ''}${Math.abs(Number(tx.amount)).toFixed(2)}
                                                </p>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="text-center py-10 opacity-55 space-y-2">
                                        <History className="h-10 w-10 mx-auto text-muted-foreground" />
                                        <p className="text-sm font-semibold">No transactions available yet.</p>
                                    </div>
                                )}
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
