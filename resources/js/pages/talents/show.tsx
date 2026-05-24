import { Head, router, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Phone, Mail, MessageSquare, Lock, Eye, Footprints, Scale, Compass, Trophy } from 'lucide-react';
import PitchAvatar from '@/components/pitch-avatar';
import AppLayout from '@/layouts/app-layout';

interface Props {
    talent: {
        id: number;
        display_name: string;
        position: string;
        bio: string;
        nationality: string;
        dominant_foot: string;
        height_cm: number;
        weight_kg: number;
        user: {
            id: number;
            name: string;
            email: string;
            phone?: string;
        };
    };
    canSeeContactInfo: boolean;
}

export default function TalentShow({ talent, canSeeContactInfo }: Props) {
    const handleUnlock = () => {
        router.post(`/talents/${talent.id}/unlock`, {}, {
            preserveScroll: true,
        });
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Find Talents', href: '/talents' }, { title: talent.display_name, href: `/talents/${talent.id}` }]}>
            <div className="container mx-auto py-10 px-6 text-left max-w-6xl">
                <Head title={talent.display_name} />
                <div className="grid gap-8 md:grid-cols-3">
                    
                    {/* Left Column: Avatar & Card */}
                    <Card className="md:col-span-1 border-muted-foreground/20 shadow-xl overflow-hidden bg-card flex flex-col justify-between">
                        <div>
                            <div className="h-32 bg-primary/15 w-full" />
                            <CardContent className="pt-0 -mt-16 text-center pb-8 flex flex-col items-center">
                                <div className="inline-block p-1 bg-background rounded-full border-2 border-primary/20">
                                    <PitchAvatar 
                                        position={talent.position} 
                                        size="lg" 
                                    />
                                </div>
                                <h2 className="mt-6 text-3xl font-extrabold tracking-tight">{talent.display_name}</h2>
                                <p className="text-primary font-black uppercase tracking-[0.2em] text-xs mt-1">{talent.position}</p>
                                
                                <div className="grid grid-cols-2 gap-4 text-xs font-semibold py-4 border-t border-muted-foreground/10 text-muted-foreground text-left w-full mt-6">
                                    <div className="flex items-center gap-1.5">
                                        <Footprints className="h-4 w-4 text-primary" />
                                        <span>Foot: <strong className="text-foreground capitalize">{talent.dominant_foot}</strong></span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Scale className="h-4 w-4 text-primary" />
                                        <span>Height: <strong className="text-foreground">{talent.height_cm}cm</strong></span>
                                    </div>
                                    <div className="flex items-center gap-1.5 col-span-2">
                                        <Compass className="h-4 w-4 text-primary" />
                                        <span>Weight: <strong className="text-foreground">{talent.weight_kg}kg</strong></span>
                                    </div>
                                </div>
                            </CardContent>
                        </div>
                    </Card>

                    {/* Right Column: Bio & Contact */}
                    <Card className="md:col-span-2 border-muted-foreground/20 shadow-sm p-8 bg-card">
                        <div className="space-y-10">
                            
                            {/* Biography */}
                            <section>
                                <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4">Biography</h3>
                                <p className="text-lg leading-relaxed font-semibold">
                                    {talent.bio || 'This talent hasn\'t added a biography yet.'}
                                </p>
                            </section>
                            
                            {/* Contact Info */}
                            <section className="pt-8 border-t border-muted-foreground/10">
                                <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-6">Contact Information</h3>
                                {canSeeContactInfo ? (
                                    <div className="grid gap-6 sm:grid-cols-2">
                                        <div className="flex items-center gap-4 p-4 rounded-2xl bg-muted/30 border border-muted-foreground/5">
                                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                                <Mail className="h-5 w-5" />
                                            </div>
                                            <div className="text-left">
                                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Email Address</p>
                                                <p className="font-bold">{talent.user.email}</p>
                                            </div>
                                        </div>
                                        {talent.user.phone && (
                                            <div className="flex items-center gap-4 p-4 rounded-2xl bg-muted/30 border border-muted-foreground/5">
                                                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                                    <Phone className="h-5 w-5" />
                                                </div>
                                                <div className="text-left">
                                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Phone Number</p>
                                                    <p className="font-bold">{talent.user.phone}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="rounded-3xl border-2 border-dashed border-muted-foreground/20 p-12 text-center bg-muted/10 space-y-6">
                                        <Lock className="mx-auto h-12 w-12 text-muted-foreground opacity-30" />
                                        <div className="space-y-2">
                                            <p className="text-xl font-extrabold uppercase">Contact info is locked</p>
                                            <p className="text-muted-foreground max-w-md mx-auto text-sm">
                                                To view direct contact details (email/phone) for this talent, you can unlock it using your wallet credits.
                                            </p>
                                        </div>
                                        
                                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-md mx-auto pt-4">
                                            <Button 
                                                onClick={handleUnlock}
                                                className="w-full sm:w-auto h-12 px-8 rounded-xl font-bold shadow-lg shadow-primary/20"
                                            >
                                                Unlock for 50 Credits
                                            </Button>
                                            <span className="text-xs text-muted-foreground font-semibold">or</span>
                                            <Link href="/wallet" className="text-primary hover:underline font-bold text-sm">
                                                Top Up Wallet
                                            </Link>
                                        </div>
                                    </div>
                                )}
                            </section>
                        </div>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
