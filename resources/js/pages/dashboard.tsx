import PitchAvatar from '@/components/pitch-avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { type User } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { Trophy } from 'lucide-react';

export default function Dashboard() {
    const { auth } = usePage<{ auth: { user: User } }>().props;
    const user = auth.user;

    return (
        <div className="flex h-full flex-1 flex-col gap-6 p-6 lg:p-10">
            <Head title="Dashboard" />
            
            <div className="grid gap-6 md:grid-cols-3">
                {/* Player Card */}
                <Card className="flex flex-col items-center justify-center border-muted-foreground/20 bg-card p-10 shadow-lg hover:shadow-xl transition-shadow">
                    <PitchAvatar 
                        position={user.talent_profile?.position || 'GK'} 
                        gender={user.gender as any}
                        size="lg" 
                    />
                    <div className="mt-6 text-center">
                        <h2 className="text-2xl font-extrabold tracking-tight">{user.talent_profile?.display_name || user.name}</h2>
                        <div className="mt-2 flex items-center justify-center gap-2">
                            <Badge variant="secondary" className="px-3 py-0.5 text-[10px] font-bold uppercase tracking-widest bg-primary/10 text-primary border-primary/20">
                                {user.role?.replace('_', ' ')}
                            </Badge>
                            <span className="text-muted-foreground">•</span>
                            <span className="text-sm font-semibold text-muted-foreground uppercase tracking-tighter">
                                {user.talent_profile?.position || 'No Position'}
                            </span>
                        </div>
                    </div>
                </Card>
                
                {/* Stats and Activity */}
                <div className="col-span-2 space-y-6">
                    <Card className="border-muted-foreground/20 bg-card p-8 shadow-sm">
                        <h3 className="mb-6 text-xl font-bold tracking-tight">Performance Overview</h3>
                        <div className="grid grid-cols-2 gap-6">
                            <div className="rounded-2xl bg-muted/30 p-6 border border-muted-foreground/10 transition-colors hover:bg-muted/50">
                                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Video Uploads</p>
                                <div className="mt-2 flex items-baseline gap-2">
                                    <p className="text-4xl font-black text-primary">0</p>
                                    <p className="text-sm font-medium text-muted-foreground">/ 5 free</p>
                                </div>
                                <div className="mt-4 h-2 w-full bg-muted-foreground/10 rounded-full overflow-hidden">
                                    <div className="h-full bg-primary w-0" />
                                </div>
                            </div>
                            <div className="rounded-2xl bg-muted/30 p-6 border border-muted-foreground/10 transition-colors hover:bg-muted/50">
                                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Profile Views</p>
                                <div className="mt-2">
                                    <p className="text-4xl font-black">0</p>
                                </div>
                                <p className="mt-1 text-[10px] font-medium text-green-500">+0% this week</p>
                            </div>
                        </div>
                    </Card>

                    <Card className="border-muted-foreground/20 bg-card p-8 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold tracking-tight">Recent Activity</h3>
                            <Button variant="ghost" size="sm" className="text-xs font-bold text-primary hover:text-primary hover:bg-primary/5">
                                View All
                            </Button>
                        </div>
                        <div className="flex flex-col items-center justify-center py-10 text-center space-y-3 opacity-50">
                            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                                <Trophy className="h-6 w-6 text-muted-foreground" />
                            </div>
                            <p className="text-sm font-medium">No activity yet. Start by uploading a video!</p>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
