import React from 'react';
import { useForm } from '@inertiajs/react';
import { AlertTriangle, Flag } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { store } from '@/routes/reports';

interface ReportDialogProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    reportedUserId: number;
    conversationId?: number;
    recipientName: string;
}

export default function ReportDialog({ isOpen, onOpenChange, reportedUserId, conversationId, recipientName }: ReportDialogProps) {
    const { data, setData, post, processing, reset, errors } = useForm({
        reported_id: reportedUserId,
        conversation_id: conversationId || '',
        reason: 'spam',
        description: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(store().url, {
            onSuccess: () => {
                reset();
                onOpenChange(false);
            }
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[420px] rounded-3xl border-muted-foreground/20 shadow-2xl p-6 text-left">
                <DialogHeader className="flex flex-col items-start gap-2">
                    <div className="h-10 w-10 bg-destructive/10 rounded-xl flex items-center justify-center text-destructive">
                        <Flag className="h-5 w-5" />
                    </div>
                    <DialogTitle className="text-xl font-black italic uppercase tracking-tight">Report {recipientName}</DialogTitle>
                    <DialogDescription className="text-sm text-muted-foreground">
                        Help us keep the community safe. Please select a reason for reporting this user.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="reason" className="text-xs font-bold uppercase tracking-widest opacity-70">Reason</Label>
                        <select
                            id="reason"
                            value={data.reason}
                            onChange={e => setData('reason', e.target.value)}
                            className="flex h-11 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        >
                            <option value="spam">Spam / Advertising</option>
                            <option value="harassment">Harassment / Bullying</option>
                            <option value="inappropriate">Inappropriate Media / Language</option>
                            <option value="fake_profile">Fake Profile / Impersonation</option>
                            <option value="other">Other Reason</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description" className="text-xs font-bold uppercase tracking-widest opacity-70">Additional Details</Label>
                        <Textarea
                            id="description"
                            placeholder="Please provide any extra context to help us review this report..."
                            value={data.description}
                            onChange={e => setData('description', e.target.value)}
                            className="min-h-[100px] rounded-xl"
                        />
                        {errors.description && <p className="text-xs text-destructive">{errors.description}</p>}
                    </div>

                    <DialogFooter className="pt-2 flex gap-2 sm:justify-end">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => onOpenChange(false)}
                            className="rounded-xl font-bold"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="destructive"
                            disabled={processing}
                            className="rounded-xl font-bold uppercase tracking-wider px-6"
                        >
                            {processing ? 'Submitting...' : 'Submit Report'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
