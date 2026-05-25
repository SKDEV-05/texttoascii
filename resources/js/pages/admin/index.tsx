import { Head, router, useForm, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { useState } from 'react';
import { Shield, Users, AlertTriangle, Wallet, Trash2, ArrowUpRight, ArrowDownLeft, Gift, CheckCircle, XCircle } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

interface User {
    id: number;
    name: string;
    email: string;
    phone: string;
    role: string;
    wallet_balance: number;
    avatar_path?: string;
    talent_profile?: {
        display_name: string;
        position: string;
    };
}

interface Report {
    id: number;
    reporter_id: number;
    reported_id: number;
    reason: string;
    description: string;
    status: string;
    created_at: string;
    reporter: User;
    reported: User;
}

interface Transaction {
    id: number;
    user_id: number;
    amount: number;
    type: string;
    description: string;
    created_at: string;
    user: User;
}

interface Props {
    users: User[];
    reports: Report[];
    transactions: Transaction[];
}

const formatRelativeDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
    const compareDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

    if (compareDate.getTime() === today.getTime()) {
        return 'Today';
    } else if (compareDate.getTime() === yesterday.getTime()) {
        return 'Yesterday';
    } else {
        return date.toLocaleDateString();
    }
};

export default function AdminDashboard({ users, reports, transactions }: Props) {
    const [activeTab, setActiveTab] = useState<'users' | 'reports' | 'transactions'>('users');
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);

    const { data: walletData, setData: setWalletData, post: postWallet, processing: walletProcessing, errors: walletErrors, reset: resetWallet } = useForm({
        action: 'adjust',
        amount: '',
        description: '',
    });

    const handleOpenWalletModal = (user: User) => {
        setSelectedUser(user);
        setIsWalletModalOpen(true);
        resetWallet();
    };

    const handleWalletSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedUser) return;

        postWallet(`/admin/users/${selectedUser.id}/wallet`, {
            onSuccess: () => {
                setIsWalletModalOpen(false);
                setSelectedUser(null);
                resetWallet();
            },
        });
    };

    const handleApply10PercentBonus = (user: User) => {
        if (confirm(`Are you sure you want to apply a 10% bonus of $${(user.wallet_balance * 0.1).toFixed(2)} to ${user.name}'s wallet?`)) {
            router.post(`/admin/users/${user.id}/wallet`, {
                action: 'bonus10',
            }, {
                preserveScroll: true,
            });
        }
    };

    const handleDeleteUser = (user: User) => {
        if (confirm(`WARNING: Are you absolutely sure you want to delete the account for ${user.name}? This will permanently remove all their profile details, videos, comments, and messages.`)) {
            router.delete(`/admin/users/${user.id}`, {
                preserveScroll: true,
            });
        }
    };

    const handleResolveReport = (report: Report) => {
        if (confirm('Mark this report as resolved?')) {
            router.post(`/admin/reports/${report.id}/resolve`, {}, {
                preserveScroll: true,
            });
        }
    };

    const handleDeleteReport = (report: Report) => {
        if (confirm('Are you sure you want to delete/dismiss this report?')) {
            router.delete(`/admin/reports/${report.id}`, {
                preserveScroll: true,
            });
        }
    };

    return (
        <AppLayout>
            <Head title="Admin Panel" />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
                    <div>
                        <div className="flex items-center gap-2 text-primary font-bold uppercase tracking-wider text-xs mb-1">
                            <Shield className="h-4 w-4" /> Admin Controls
                        </div>
                        <h1 className="text-3xl font-black italic tracking-tight uppercase text-zinc-900 dark:text-zinc-50">
                            SYSTEM ADMINISTRATION
                        </h1>
                        <p className="text-zinc-500 text-xs mt-1">
                            Manage user accounts, monitor security reports, and adjust user wallets.
                        </p>
                    </div>
                </div>

                {/* Dashboard Stats Row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
                    <Card className="border-zinc-200 shadow-sm bg-gradient-to-br from-white to-zinc-50 dark:from-zinc-900 dark:to-zinc-950">
                        <CardHeader className="pb-2">
                            <CardDescription className="text-xs font-black uppercase text-zinc-400">Total Registered Users</CardDescription>
                            <CardTitle className="text-3xl font-black italic text-primary">{users.length}</CardTitle>
                        </CardHeader>
                    </Card>
                    <Card className="border-zinc-200 shadow-sm bg-gradient-to-br from-white to-zinc-50 dark:from-zinc-900 dark:to-zinc-950">
                        <CardHeader className="pb-2">
                            <CardDescription className="text-xs font-black uppercase text-zinc-400">Active Pending Reports</CardDescription>
                            <CardTitle className="text-3xl font-black italic text-amber-500">
                                {reports.filter(r => r.status === 'pending').length}
                            </CardTitle>
                        </CardHeader>
                    </Card>
                    <Card className="border-zinc-200 shadow-sm bg-gradient-to-br from-white to-zinc-50 dark:from-zinc-900 dark:to-zinc-950">
                        <CardHeader className="pb-2">
                            <CardDescription className="text-xs font-black uppercase text-zinc-400">Total System Transactions</CardDescription>
                            <CardTitle className="text-3xl font-black italic text-emerald-500">{transactions.length}</CardTitle>
                        </CardHeader>
                    </Card>
                </div>

                {/* Tabs Selection */}
                <div className="flex border-b border-zinc-250 mb-6 select-none overflow-x-auto gap-2">
                    <button
                        onClick={() => setActiveTab('users')}
                        className={`flex items-center gap-2 py-3 px-4 font-black uppercase tracking-tight text-xs border-b-2 transition-all ${
                            activeTab === 'users'
                                ? 'border-primary text-primary'
                                : 'border-transparent text-zinc-500 hover:text-zinc-800'
                        }`}
                    >
                        <Users className="h-4 w-4" /> Users Management ({users.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('reports')}
                        className={`flex items-center gap-2 py-3 px-4 font-black uppercase tracking-tight text-xs border-b-2 transition-all ${
                            activeTab === 'reports'
                                ? 'border-amber-500 text-amber-500'
                                : 'border-transparent text-zinc-500 hover:text-zinc-800'
                        }`}
                    >
                        <AlertTriangle className="h-4 w-4" /> Safety Reports ({reports.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('transactions')}
                        className={`flex items-center gap-2 py-3 px-4 font-black uppercase tracking-tight text-xs border-b-2 transition-all ${
                            activeTab === 'transactions'
                                ? 'border-emerald-500 text-emerald-500'
                                : 'border-transparent text-zinc-500 hover:text-zinc-800'
                        }`}
                    >
                        <Wallet className="h-4 w-4" /> Wallet History ({transactions.length})
                    </button>
                </div>

                {/* Users Tab View */}
                {activeTab === 'users' && (
                    <div className="bg-white border border-zinc-200 rounded-3xl overflow-hidden shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-zinc-50 border-b border-zinc-150 text-[10px] font-black uppercase tracking-widest text-zinc-400">
                                        <th className="py-4 px-6">User Info</th>
                                        <th className="py-4 px-6">Phone Number</th>
                                        <th className="py-4 px-6">Role</th>
                                        <th className="py-4 px-6 text-right">Wallet Balance</th>
                                        <th className="py-4 px-6 text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-100 text-xs">
                                    {users.map((u) => (
                                        <tr key={u.id} className="hover:bg-zinc-50/50 transition-colors">
                                            <td className="py-4 px-6">
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="h-9 w-9 border border-zinc-200 shrink-0">
                                                        <AvatarImage src={u.avatar_path} />
                                                        <AvatarFallback className="bg-primary text-white font-extrabold text-sm uppercase">
                                                            {u.name[0]}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <span className="font-bold text-zinc-900 block">{u.name}</span>
                                                        <span className="text-[11px] text-zinc-400 block">{u.email}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <span className="font-mono text-zinc-800 font-semibold">{u.phone || 'N/A'}</span>
                                            </td>
                                            <td className="py-4 px-6">
                                                <Badge
                                                    variant="secondary"
                                                    className={`uppercase text-[9px] font-black tracking-wider px-2 py-0.5 rounded-full ${
                                                        u.role === 'admin'
                                                            ? 'bg-rose-50 text-rose-600 border-rose-100'
                                                            : u.role === 'scout_club'
                                                            ? 'bg-blue-50 text-blue-600 border-blue-100'
                                                            : u.role === 'talent'
                                                            ? 'bg-amber-50 text-amber-600 border-amber-100'
                                                            : 'bg-zinc-50 text-zinc-600 border-zinc-100'
                                                    }`}
                                                >
                                                    {u.role.replace('_', ' ')}
                                                </Badge>
                                            </td>
                                            <td className="py-4 px-6 text-right font-bold text-zinc-950 text-[13px]">
                                                ${parseFloat(u.wallet_balance as any).toFixed(2)}
                                            </td>
                                            <td className="py-4 px-6 text-center">
                                                <div className="flex items-center justify-center gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="h-8 rounded-lg text-[10px] font-bold uppercase tracking-wider"
                                                        onClick={() => handleOpenWalletModal(u)}
                                                    >
                                                        Adjust Wallet
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="h-8 rounded-lg text-[10px] font-bold uppercase tracking-wider text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border-emerald-200"
                                                        onClick={() => handleApply10PercentBonus(u)}
                                                        disabled={u.wallet_balance <= 0}
                                                        title="Add 10% Bonus"
                                                    >
                                                        <Gift className="h-3.5 w-3.5 mr-1" /> +10% Bonus
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="h-8 rounded-lg text-[10px] font-bold uppercase tracking-wider text-destructive hover:text-white hover:bg-destructive border-destructive/20"
                                                        onClick={() => handleDeleteUser(u)}
                                                        disabled={u.role === 'admin'}
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Reports Tab View */}
                {activeTab === 'reports' && (
                    <div className="space-y-4">
                        {reports.length > 0 ? (
                            reports.map((report) => (
                                <Card key={report.id} className="border-zinc-200 shadow-sm overflow-hidden text-left">
                                    <div className="p-5 flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                                        <div className="space-y-3 flex-1">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <Badge className={`uppercase text-[9px] font-black tracking-wider ${
                                                    report.status === 'pending'
                                                        ? 'bg-amber-500 text-white hover:bg-amber-600'
                                                        : 'bg-emerald-500 text-white hover:bg-emerald-600'
                                                }`}>
                                                    {report.status}
                                                </Badge>
                                                <span className="text-[10px] text-zinc-400 font-bold uppercase">
                                                    Reason: {report.reason.replace('_', ' ')}
                                                </span>
                                                <span className="text-[10px] text-zinc-300 dark:text-zinc-700">•</span>
                                                <span className="text-[10px] text-zinc-400 font-bold">
                                                    Submitted: {formatRelativeDate(report.created_at)}
                                                </span>
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div className="bg-zinc-50 p-3 rounded-2xl border border-zinc-100">
                                                    <span className="text-[9px] font-black uppercase text-zinc-400 tracking-wider block mb-1">Reporter</span>
                                                    <div className="flex items-center gap-2">
                                                        <Avatar className="h-6 w-6">
                                                            <AvatarImage src={report.reporter?.avatar_path} />
                                                            <AvatarFallback className="bg-zinc-200 text-zinc-800 text-[10px] font-bold">
                                                                {report.reporter?.name[0]}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div>
                                                            <span className="font-bold text-zinc-950 block text-[11px] leading-tight">
                                                                {report.reporter?.name}
                                                            </span>
                                                            <span className="text-[9px] text-zinc-500 block leading-tight">
                                                                {report.reporter?.email}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="bg-zinc-50 p-3 rounded-2xl border border-zinc-100">
                                                    <span className="text-[9px] font-black uppercase text-zinc-400 tracking-wider block mb-1">Reported Offender</span>
                                                    <div className="flex items-center gap-2">
                                                        <Avatar className="h-6 w-6">
                                                            <AvatarImage src={report.reported?.avatar_path} />
                                                            <AvatarFallback className="bg-zinc-200 text-zinc-800 text-[10px] font-bold">
                                                                {report.reported?.name[0]}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div>
                                                            <span className="font-bold text-zinc-950 block text-[11px] leading-tight">
                                                                {report.reported?.name}
                                                            </span>
                                                            <span className="text-[9px] text-zinc-500 block leading-tight">
                                                                {report.reported?.email}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="bg-zinc-50/50 p-3.5 rounded-2xl border border-zinc-100">
                                                <span className="text-[9px] font-black uppercase text-zinc-400 tracking-wider block mb-1">Details & Description</span>
                                                <p className="text-zinc-700 leading-relaxed text-xs">{report.description || 'No description provided.'}</p>
                                            </div>
                                        </div>

                                        <div className="flex flex-row md:flex-col gap-2 shrink-0 justify-end md:justify-start">
                                            {report.status === 'pending' && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleResolveReport(report)}
                                                    className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 hover:bg-emerald-100 border-emerald-200 h-9"
                                                >
                                                    <CheckCircle className="h-4 w-4 mr-1" /> Mark Resolved
                                                </Button>
                                            )}
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleDeleteUser(report.reported)}
                                                className="text-[10px] font-bold uppercase tracking-wider text-destructive bg-destructive/5 hover:bg-destructive hover:text-white border-destructive/20 h-9"
                                                disabled={report.reported?.role === 'admin'}
                                            >
                                                <Trash2 className="h-4 w-4 mr-1" /> Delete Offender Account
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleDeleteReport(report)}
                                                className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 hover:bg-zinc-100 h-9"
                                            >
                                                <XCircle className="h-4 w-4 mr-1" /> Dismiss Report
                                            </Button>
                                        </div>
                                    </div>
                                </Card>
                            ))
                        ) : (
                            <div className="flex flex-col items-center justify-center p-16 bg-white border border-zinc-200 rounded-3xl text-zinc-500 text-center space-y-3">
                                <AlertTriangle className="h-10 w-10 text-zinc-300" />
                                <h3 className="font-extrabold uppercase tracking-tight text-zinc-800 text-sm">No Safety Reports</h3>
                                <p className="text-xs text-zinc-400">All registered users are in good standing.</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Wallet History Tab View */}
                {activeTab === 'transactions' && (
                    <div className="bg-white border border-zinc-200 rounded-3xl overflow-hidden shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-zinc-50 border-b border-zinc-150 text-[10px] font-black uppercase tracking-widest text-zinc-400">
                                        <th className="py-4 px-6">User</th>
                                        <th className="py-4 px-6">Amount</th>
                                        <th className="py-4 px-6">Type</th>
                                        <th className="py-4 px-6">Description</th>
                                        <th className="py-4 px-6 text-right">Date</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-100 text-xs">
                                    {transactions.map((tx) => (
                                        <tr key={tx.id} className="hover:bg-zinc-50/50 transition-colors">
                                            <td className="py-4 px-6">
                                                {tx.user ? (
                                                    <div className="flex items-center gap-2">
                                                        <Avatar className="h-6 w-6">
                                                            <AvatarImage src={tx.user.avatar_path} />
                                                            <AvatarFallback className="bg-primary text-white font-extrabold text-[10px] uppercase">
                                                                {tx.user.name[0]}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <span className="font-bold text-zinc-900">{tx.user.name}</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-zinc-400 italic">Deleted User</span>
                                                )}
                                            </td>
                                            <td className={`py-4 px-6 font-bold text-[13px] ${tx.amount >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                                {tx.amount >= 0 ? '+' : ''}${tx.amount.toFixed(2)}
                                            </td>
                                            <td className="py-4 px-6">
                                                <Badge
                                                    variant="outline"
                                                    className={`uppercase text-[9px] font-black tracking-wider px-2 py-0.5 rounded-full ${
                                                        tx.type === 'bonus'
                                                            ? 'bg-purple-50 text-purple-600 border-purple-100'
                                                            : tx.amount >= 0
                                                            ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                                            : 'bg-rose-50 text-rose-600 border-rose-100'
                                                    }`}
                                                >
                                                    {tx.type}
                                                </Badge>
                                            </td>
                                            <td className="py-4 px-6 text-zinc-600">
                                                {tx.description}
                                            </td>
                                            <td className="py-4 px-6 text-right text-zinc-400 font-bold">
                                                {formatRelativeDate(tx.created_at)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* Adjust Wallet Dialog Modal */}
            <Dialog open={isWalletModalOpen} onOpenChange={setIsWalletModalOpen}>
                <DialogContent className="sm:max-w-[400px] border-zinc-200 rounded-3xl z-50">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-black italic uppercase text-left">
                            ADJUST USER WALLET
                        </DialogTitle>
                    </DialogHeader>
                    {selectedUser && (
                        <form onSubmit={handleWalletSubmit} className="space-y-4 py-4 text-left">
                            <div className="flex items-center gap-3 bg-zinc-50 p-3 rounded-2xl border border-zinc-150">
                                <Avatar className="h-10 w-10">
                                    <AvatarImage src={selectedUser.avatar_path} />
                                    <AvatarFallback className="bg-primary text-white font-extrabold">
                                        {selectedUser.name[0]}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <span className="font-bold text-zinc-950 block">{selectedUser.name}</span>
                                    <span className="text-[10px] text-zinc-400 block font-semibold">
                                        Current Balance: ${parseFloat(selectedUser.wallet_balance as any).toFixed(2)}
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="amount" className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                                    Adjustment Amount ($)
                                </Label>
                                <Input
                                    id="amount"
                                    type="number"
                                    step="0.01"
                                    placeholder="Use positive for topup, negative to deduct"
                                    value={walletData.amount}
                                    onChange={(e) => setWalletData('amount', e.target.value)}
                                    className="h-11 rounded-xl"
                                    required
                                />
                                {walletErrors.amount && (
                                    <p className="text-xs text-destructive font-semibold">{walletErrors.amount}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description" className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                                    Transaction Description
                                </Label>
                                <Input
                                    id="description"
                                    type="text"
                                    placeholder="e.g. Compensation, Manual Adjustment"
                                    value={walletData.description}
                                    onChange={(e) => setWalletData('description', e.target.value)}
                                    className="h-11 rounded-xl"
                                    required
                                />
                                {walletErrors.description && (
                                    <p className="text-xs text-destructive font-semibold">{walletErrors.description}</p>
                                )}
                            </div>

                            <div className="flex gap-3 pt-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="w-1/2 h-11 rounded-xl font-bold uppercase text-xs"
                                    onClick={() => {
                                        setIsWalletModalOpen(false);
                                        setSelectedUser(null);
                                    }}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    className="w-1/2 h-11 rounded-xl font-bold uppercase text-xs shadow-md shadow-primary/20"
                                    disabled={walletProcessing}
                                >
                                    Apply Adjustment
                                </Button>
                            </div>
                        </form>
                    )}
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
