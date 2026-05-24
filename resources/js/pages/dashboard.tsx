import PitchAvatar from '@/components/pitch-avatar';
import AppLayout from '@/layouts/app-layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { usePage, useForm, Head, router } from '@inertiajs/react';
import { Trophy, Plus, Users, Search, Wallet, UserCheck, Video } from 'lucide-react';
import { useState } from 'react';

export default function Dashboard() {
    const { auth } = usePage<any>().props;
    const user = auth.user;
    const [isAddTalentOpen, setIsAddTalentOpen] = useState(false);

    const childForm = useForm({
        display_name: '',
        date_of_birth: '',
        nationality: '',
        city: '',
        country: '',
        dominant_foot: 'right',
        height_cm: '',
        weight_kg: '',
        position: 'ST',
        bio: '',
    });

    const handleAddChild = (e: React.FormEvent) => {
        e.preventDefault();
        childForm.post('/parent/talents', {
            onSuccess: () => {
                childForm.reset();
                setIsAddTalentOpen(false);
            }
        });
    };

    const handleBuyPro = () => {
        router.post('/subscription/buy-pro', {}, {
            preserveScroll: true,
        });
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Dashboard', href: '/dashboard' }]}>
            <div className="flex h-full flex-1 flex-col gap-6 p-6 lg:p-10 text-left">
                <Head title="Dashboard" />
            
            {/* Render based on user role */}
            {user.role === 'parent' ? (
                // 1. Parent Dashboard
                <div className="space-y-8">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h1 className="text-3xl font-black italic uppercase tracking-tight">PARENT DASHBOARD</h1>
                            <p className="text-muted-foreground text-sm font-medium">Manage your children's talent profiles and track their progress.</p>
                        </div>
                        
                        <Dialog open={isAddTalentOpen} onOpenChange={setIsAddTalentOpen}>
                            <DialogTrigger asChild>
                                <Button className="h-12 px-6 rounded-xl font-bold uppercase tracking-wider shadow-lg shadow-primary/20">
                                    <Plus className="mr-2 h-5 w-5" /> Add Child Profile
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[500px] max-h-[85vh] overflow-y-auto rounded-3xl border-muted-foreground/20">
                                <DialogHeader>
                                    <DialogTitle className="text-2xl font-black italic uppercase">CREATE CHILD PROFILE</DialogTitle>
                                </DialogHeader>
                                <form onSubmit={handleAddChild} className="space-y-4 py-4 text-left">
                                    <div className="grid gap-2">
                                        <Label htmlFor="display_name" className="text-xs font-bold uppercase tracking-widest opacity-70">Display Name</Label>
                                        <Input
                                            id="display_name"
                                            placeholder="Child's display name"
                                            value={childForm.data.display_name}
                                            onChange={e => childForm.setData('display_name', e.target.value)}
                                            className="h-11 rounded-xl"
                                            required
                                        />
                                    </div>
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div className="grid gap-2">
                                            <Label htmlFor="date_of_birth" className="text-xs font-bold uppercase tracking-widest opacity-70">Date of Birth</Label>
                                            <Input
                                                id="date_of_birth"
                                                type="date"
                                                value={childForm.data.date_of_birth}
                                                onChange={e => childForm.setData('date_of_birth', e.target.value)}
                                                className="h-11 rounded-xl"
                                                required
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="nationality" className="text-xs font-bold uppercase tracking-widest opacity-70">Nationality</Label>
                                            <Input
                                                id="nationality"
                                                placeholder="e.g. France"
                                                value={childForm.data.nationality}
                                                onChange={e => childForm.setData('nationality', e.target.value)}
                                                className="h-11 rounded-xl"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div className="grid gap-2">
                                            <Label htmlFor="city" className="text-xs font-bold uppercase tracking-widest opacity-70">City</Label>
                                            <Input
                                                id="city"
                                                placeholder="e.g. Paris"
                                                value={childForm.data.city}
                                                onChange={e => childForm.setData('city', e.target.value)}
                                                className="h-11 rounded-xl"
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="country" className="text-xs font-bold uppercase tracking-widest opacity-70">Country</Label>
                                            <Input
                                                id="country"
                                                placeholder="e.g. France"
                                                value={childForm.data.country}
                                                onChange={e => childForm.setData('country', e.target.value)}
                                                className="h-11 rounded-xl"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid gap-4 sm:grid-cols-3">
                                        <div className="grid gap-2">
                                            <Label htmlFor="position" className="text-xs font-bold uppercase tracking-widest opacity-70">Position</Label>
                                            <select
                                                id="position"
                                                value={childForm.data.position}
                                                onChange={e => childForm.setData('position', e.target.value)}
                                                className="flex h-11 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                            >
                                                {['GK', 'CB', 'LB', 'RB', 'CDM', 'CM', 'CAM', 'LW', 'RW', 'ST'].map(pos => (
                                                    <option key={pos} value={pos}>{pos}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="dominant_foot" className="text-xs font-bold uppercase tracking-widest opacity-70">Dominant Foot</Label>
                                            <select
                                                id="dominant_foot"
                                                value={childForm.data.dominant_foot}
                                                onChange={e => childForm.setData('dominant_foot', e.target.value)}
                                                className="flex h-11 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                            >
                                                <option value="left">Left</option>
                                                <option value="right">Right</option>
                                                <option value="both">Both</option>
                                            </select>
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="height_cm" className="text-xs font-bold uppercase tracking-widest opacity-70">Height (cm)</Label>
                                            <Input
                                                id="height_cm"
                                                type="number"
                                                placeholder="e.g. 165"
                                                value={childForm.data.height_cm}
                                                onChange={e => childForm.setData('height_cm', e.target.value)}
                                                className="h-11 rounded-xl"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div className="grid gap-2 col-span-2">
                                            <Label htmlFor="weight_kg" className="text-xs font-bold uppercase tracking-widest opacity-70">Weight (kg)</Label>
                                            <Input
                                                id="weight_kg"
                                                type="number"
                                                placeholder="e.g. 55"
                                                value={childForm.data.weight_kg}
                                                onChange={e => childForm.setData('weight_kg', e.target.value)}
                                                className="h-11 rounded-xl"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="bio" className="text-xs font-bold uppercase tracking-widest opacity-70">Bio</Label>
                                        <Textarea
                                            id="bio"
                                            placeholder="Write something about your child's skills..."
                                            value={childForm.data.bio}
                                            onChange={e => childForm.setData('bio', e.target.value)}
                                            className="min-h-[80px] rounded-xl"
                                        />
                                    </div>
                                    <Button
                                        type="submit"
                                        className="w-full h-12 rounded-xl font-bold uppercase tracking-wider shadow-lg shadow-primary/20 mt-2"
                                        disabled={childForm.processing}
                                    >
                                        Save Profile
                                    </Button>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>

                    {/* Children Grid */}
                    <div className="grid gap-6 md:grid-cols-3">
                        {user.managed_talents && user.managed_talents.length > 0 ? (
                            user.managed_talents.map((talent: any) => (
                                <Card key={talent.id} className="border-muted-foreground/20 bg-card shadow-lg hover:shadow-xl transition-shadow flex flex-col justify-between rounded-3xl overflow-hidden text-left">
                                    <div className="p-8 flex flex-col items-center border-b border-muted-foreground/10 bg-muted/20">
                                        <PitchAvatar 
                                            position={talent.talent_profile?.position || 'GK'} 
                                            gender={talent.gender}
                                            size="lg" 
                                        />
                                        <h2 className="mt-4 text-xl font-extrabold tracking-tight">{talent.talent_profile?.display_name || talent.name}</h2>
                                        <div className="mt-1 flex gap-2 items-center">
                                            <Badge className="px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest bg-primary/10 text-primary border border-primary/20">
                                                {talent.talent_profile?.position}
                                            </Badge>
                                            <span className="text-xs text-muted-foreground font-semibold">
                                                • {talent.talent_profile?.nationality}
                                            </span>
                                        </div>
                                    </div>
                                    <CardContent className="p-6 space-y-4">
                                        <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-muted-foreground">
                                            <div className="text-left">
                                                <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Video Count</p>
                                                <p className="text-lg font-black text-foreground mt-0.5">{talent.videos_count}</p>
                                            </div>
                                            <div className="text-left">
                                                <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Height / Weight</p>
                                                <p className="text-sm font-bold text-foreground mt-1">
                                                    {talent.talent_profile?.height_cm}cm / {talent.talent_profile?.weight_kg}kg
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button asChild className="flex-1 h-10 rounded-xl font-bold text-xs" variant="outline">
                                                <a href={`/talents/${talent.id}`}>View Profile</a>
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        ) : (
                            <div className="col-span-3 text-center py-20 opacity-55 space-y-3">
                                <Users className="h-12 w-12 mx-auto text-muted-foreground" />
                                <p className="text-lg font-bold">You haven't added any child profiles yet.</p>
                                <p className="text-sm text-muted-foreground max-w-sm mx-auto">Create a profile for your child to start sharing their videos with clubs and scouts.</p>
                            </div>
                        )}
                    </div>
                </div>
            ) : user.role === 'scout' || user.role === 'club' || user.role === 'scout_club' ? (
                // 2. Scout Dashboard
                <div className="space-y-8">
                    <div>
                        <h1 className="text-3xl font-black italic uppercase tracking-tight">SCOUT PORTAL</h1>
                        <p className="text-muted-foreground text-sm font-medium">Discover new football stars and unlock their direct contact details.</p>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">
                        {/* Search Card */}
                        <Card className="border-muted-foreground/20 p-8 shadow-sm flex flex-col justify-between">
                            <div className="space-y-3">
                                <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                                    <Search className="h-5 w-5" />
                                </div>
                                <h3 className="text-xl font-bold tracking-tight uppercase">Talent Search</h3>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    Browse through our database of player profiles, filter by position, height, foot, and locate the talent you need.
                                </p>
                            </div>
                            <Button asChild className="h-12 rounded-xl font-bold uppercase tracking-wider mt-6">
                                <a href="/talents">Open Directory</a>
                            </Button>
                        </Card>

                        {/* Wallet Card */}
                        <Card className="border-muted-foreground/20 p-8 shadow-sm flex flex-col justify-between">
                            <div className="space-y-3">
                                <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                                    <Wallet className="h-5 w-5" />
                                </div>
                                <h3 className="text-xl font-bold tracking-tight uppercase">My Wallet Balance</h3>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    Keep your wallet credited to instantly unlock direct email and phone numbers for your top talent choices.
                                </p>
                            </div>
                            <div className="mt-6 flex items-center justify-between gap-4">
                                <div>
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Available Credits</p>
                                    <p className="text-3xl font-black text-primary mt-1">${Number(user.wallet_balance).toFixed(2)}</p>
                                </div>
                                <Button asChild variant="outline" className="h-12 rounded-xl font-bold border-muted-foreground/20">
                                    <a href="/wallet">Manage Wallet</a>
                                </Button>
                            </div>
                        </Card>
                    </div>
                </div>
            ) : (
                // 3. Player/Talent Dashboard
                <div className="grid gap-6 md:grid-cols-3">
                    {/* Player Card */}
                    <Card className="flex flex-col items-center justify-center border-muted-foreground/20 bg-card p-10 shadow-lg hover:shadow-xl transition-shadow rounded-3xl">
                        <PitchAvatar 
                            position={user.talent_profile?.position || 'GK'} 
                            gender={user.gender}
                            size="lg" 
                        />
                        <div className="mt-6 text-center">
                            <h2 className="text-2xl font-extrabold tracking-tight">{user.talent_profile?.display_name || user.name}</h2>
                            <div className="mt-2 flex items-center justify-center gap-2">
                                <Badge className="px-3 py-0.5 text-[10px] font-bold uppercase tracking-widest bg-primary/10 text-primary border border-primary/20">
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
                        <Card className="border-muted-foreground/20 bg-card p-8 shadow-sm rounded-3xl">
                            <h3 className="mb-6 text-xl font-bold tracking-tight uppercase">Performance Overview</h3>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="rounded-2xl bg-muted/30 p-6 border border-muted-foreground/10 transition-colors hover:bg-muted/50 text-left">
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Video Uploads</p>
                                    <div className="mt-2 flex items-baseline gap-2">
                                        <p className="text-4xl font-black text-primary">{user.videos_count || 0}</p>
                                        <p className="text-sm font-medium text-muted-foreground">/ 5 free</p>
                                    </div>
                                    <div className="mt-4 h-2 w-full bg-muted-foreground/10 rounded-full overflow-hidden">
                                        <div className="h-full bg-primary" style={{ width: `${Math.min(((user.videos_count || 0) / 5) * 100, 100)}%` }} />
                                    </div>
                                </div>
                                <div className="rounded-2xl bg-muted/30 p-6 border border-muted-foreground/10 transition-colors hover:bg-muted/50 text-left flex flex-col justify-between">
                                    <div>
                                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Upgrade Status</p>
                                        <p className="text-lg font-black mt-2">Unlimited Uploads</p>
                                    </div>
                                    <Button 
                                        onClick={handleBuyPro}
                                        className="h-10 text-xs rounded-xl font-bold uppercase tracking-wider w-full shadow-lg shadow-primary/20"
                                    >
                                        Buy Pro ($30)
                                    </Button>
                                </div>
                            </div>
                        </Card>

                        <Card className="border-muted-foreground/20 bg-card p-8 shadow-sm rounded-3xl">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold tracking-tight uppercase">Recent Activity</h3>
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
            )}
        </div>
        </AppLayout>
    );
}
