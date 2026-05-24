import React from 'react';
import { router } from '@inertiajs/react';
import { Coins, Wallet, Sparkles, ShieldCheck } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { pay } from '@/routes/chat';

interface PaymentDialogProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    conversationId: number;
    walletBalance: number;
    recipientName: string;
}

export default function PaymentDialog({ isOpen, onOpenChange, conversationId, walletBalance, recipientName }: PaymentDialogProps) {
    const cost = 10.00;
    const hasEnoughBalance = walletBalance >= cost;

    const handleUnlock = () => {
        router.post(pay(conversationId).url, {}, {
            onSuccess: () => {
                onOpenChange(false);
            }
        });
    };

    const handleTopUp = () => {
        router.visit(route('wallet.index'));
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[420px] rounded-3xl border-muted-foreground/20 shadow-2xl p-6 overflow-hidden">
                <DialogHeader className="flex flex-col items-center text-center space-y-3">
                    <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center text-primary animate-pulse">
                        <Coins className="h-8 w-8" />
                    </div>
                    <DialogTitle className="text-2xl font-black italic uppercase tracking-tight">Unlock Chat Room</DialogTitle>
                    <DialogDescription className="text-sm text-muted-foreground max-w-[320px]">
                        Scouts require a one-time fee of <strong className="text-foreground">${cost.toFixed(2)}</strong> to initiate messaging & calls with <strong className="text-foreground">{recipientName}</strong>.
                    </DialogDescription>
                </DialogHeader>

                <div className="my-6 bg-muted/40 rounded-2xl p-5 border border-muted-foreground/10 space-y-4">
                    <div className="flex justify-between items-center text-sm font-semibold">
                        <span className="text-muted-foreground flex items-center gap-1.5">
                            <Wallet className="h-4 w-4" /> Wallet Balance
                        </span>
                        <span className={hasEnoughBalance ? 'text-primary' : 'text-destructive'}>
                            ${walletBalance.toFixed(2)}
                        </span>
                    </div>

                    <div className="h-px bg-muted-foreground/10" />

                    <div className="flex justify-between items-center text-sm font-semibold">
                        <span className="text-muted-foreground flex items-center gap-1.5">
                            <Sparkles className="h-4 w-4" /> Unlock Cost
                        </span>
                        <span className="text-foreground">
                            -${cost.toFixed(2)}
                        </span>
                    </div>
                </div>

                <div className="space-y-3 text-center text-[11px] text-muted-foreground flex flex-col items-center">
                    <div className="flex items-center gap-1">
                        <ShieldCheck className="h-3.5 w-3.5 text-primary shrink-0" />
                        <span>90% of your payment goes directly to the talent profile recipient</span>
                    </div>
                </div>

                <DialogFooter className="mt-6 flex flex-col gap-2">
                    {hasEnoughBalance ? (
                        <Button
                            onClick={handleUnlock}
                            className="w-full h-12 rounded-xl font-bold uppercase tracking-wider shadow-lg shadow-primary/20"
                        >
                            Unlock Now for ${cost.toFixed(2)}
                        </Button>
                    ) : (
                        <div className="w-full space-y-2">
                            <Button
                                onClick={handleTopUp}
                                className="w-full h-12 rounded-xl font-bold uppercase tracking-wider"
                                variant="destructive"
                            >
                                Top Up Wallet
                            </Button>
                            <p className="text-xs text-destructive text-center font-medium">
                                You need at least ${cost.toFixed(2)} in your wallet to unlock.
                            </p>
                        </div>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
