import { Head } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Phone, Mail, MessageSquare, Lock } from 'lucide-react';
import PitchAvatar from '@/components/pitch-avatar';

interface Props {
    talent: {
        id: number;
        display_name: string;
        position: string;
        bio: string;
        user: {
            name: string;
            email: string;
            phone?: string;
        };
    };
    canSeeContactInfo: boolean;
}

export default function TalentShow({ talent, canSeeContactInfo }: Props) {
    return (
        <div className="container mx-auto py-10 px-6">
            <Head title={talent.display_name} />
            <div className="grid gap-8 md:grid-cols-3">
                <Card className="md:col-span-1 border-muted-foreground/20 shadow-xl overflow-hidden bg-card">
                    <div className="h-32 bg-primary/10 w-full" />
                    <CardContent className="pt-0 -mt-16 text-center pb-8">
                        <div className="inline-block p-1 bg-background rounded-full">
                            <PitchAvatar 
                                position={talent.position} 
                                size="lg" 
                            />
                        </div>
                        <h2 className="mt-6 text-3xl font-black tracking-tight">{talent.display_name}</h2>
                        <p className="text-primary font-bold uppercase tracking-[0.2em] text-xs mt-1">{talent.position}</p>
                        
                        <div className="mt-8 flex justify-center gap-3 px-6">
                            <Button variant="outline" className="flex-1 h-11 rounded-xl border-muted-foreground/20">
                                <MessageSquare className="mr-2 h-4 w-4" /> Message
                            </Button>
                            <Button className="flex-1 h-11 rounded-xl shadow-lg shadow-primary/20">Follow</Button>
                        </div>
                    </CardContent>
                </Card>

                <Card className="md:col-span-2 border-muted-foreground/20 shadow-sm p-8 bg-card">
                    <div className="space-y-10">
                        <section>
                            <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4">Biography</h3>
                            <p className="text-lg leading-relaxed font-medium">
                                {talent.bio || 'This talent hasn\'t added a biography yet.'}
                            </p>
                        </section>
                        
                        <section className="pt-8 border-t border-muted-foreground/10">
                            <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-6">Contact Information</h3>
                            {canSeeContactInfo ? (
                                <div className="grid gap-6 sm:grid-cols-2">
                                    <div className="flex items-center gap-4 p-4 rounded-2xl bg-muted/30 border border-muted-foreground/5">
                                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                            <Mail className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Email Address</p>
                                            <p className="font-bold">{talent.user.email}</p>
                                        </div>
                                    </div>
                                    {talent.user.phone && (
                                        <div className="flex items-center gap-4 p-4 rounded-2xl bg-muted/30 border border-muted-foreground/5">
                                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                                <Phone className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Phone Number</p>
                                                <p className="font-bold">{talent.user.phone}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="rounded-3xl border-2 border-dashed border-muted-foreground/20 p-12 text-center bg-muted/10 transition-all hover:bg-muted/20">
                                    <Lock className="mx-auto h-12 w-12 text-muted-foreground opacity-30 mb-4" />
                                    <p className="text-xl font-bold">Contact info is locked</p>
                                    <p className="mt-2 text-muted-foreground max-w-sm mx-auto">Subscribe to our Scout Premium plan to unlock direct contact details and call this talent.</p>
                                    <Button className="mt-8 h-12 px-8 rounded-xl font-bold shadow-lg shadow-primary/20">
                                        View Subscription Plans
                                    </Button>
                                </div>
                            )}
                        </section>
                    </div>
                </Card>
            </div>
        </div>
    );
}
