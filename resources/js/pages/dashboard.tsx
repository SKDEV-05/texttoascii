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
import { Trophy, Plus, Users, Search, Wallet, UserCheck, Video, Coins, Star, ArrowUpRight, Trash2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import InputError from '@/components/input-error';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

// --- Chart Dummy Data ---
const positionData = [
    { name: 'ST', value: 340 },
    { name: 'CM', value: 280 },
    { name: 'CB', value: 210 },
    { name: 'LW/RW', value: 190 },
    { name: 'GK', value: 100 },
];

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

const topScoreData = [
    { name: 'Y. En-Nesyri', score: 92, potential: 96 },
    { name: 'B. El Khannouss', score: 88, potential: 95 },
    { name: 'A. Ounahi', score: 85, potential: 91 },
    { name: 'I. Saibari', score: 83, potential: 89 },
    { name: 'C. Riad', score: 81, potential: 88 },
];

function ScoutPositionChart() {
    return (
        <ResponsiveContainer width="100%" height="100%">
            <PieChart>
                <Pie
                    data={positionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                >
                    {positionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                </Pie>
                <RechartsTooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    itemStyle={{ fontWeight: 'bold' }}
                />
            </PieChart>
        </ResponsiveContainer>
    );
}

function ScoutScoreChart() {
    return (
        <ResponsiveContainer width="100%" height="100%">
            <BarChart
                data={topScoreData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted-foreground)/0.2)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 'bold' }} tickMargin={10} stroke="hsl(var(--muted-foreground))" />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" domain={[60, 100]} />
                <RechartsTooltip 
                    cursor={{ fill: 'hsl(var(--muted-foreground)/0.1)' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="score" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Current Score" barSize={32} />
                <Bar dataKey="potential" fill="hsl(var(--primary)/0.3)" radius={[4, 4, 0, 0]} name="Potential" barSize={32} />
            </BarChart>
        </ResponsiveContainer>
    );
}

const COUNTRIES = [
    "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", "Armenia", "Australia", "Austria",
    "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan",
    "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi", "Cabo Verde", "Cambodia",
    "Cameroon", "Canada", "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros", "Congo", "Costa Rica",
    "Croatia", "Cuba", "Cyprus", "Czech Republic", "Denmark", "Djibouti", "Dominica", "Dominican Republic", "Ecuador", "Egypt",
    "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini", "Ethiopia", "Fiji", "Finland", "France", "Gabon",
    "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana",
    "Haiti", "Honduras", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Italy",
    "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Kuwait", "Kyrgyzstan", "Laos",
    "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Madagascar", "Malawi",
    "Malaysia", "Maldives", "Mali", "Malta", "Mauritania", "Mauritius", "Mexico", "Moldova", "Monaco", "Mongolia",
    "Montenegro", "Morocco", "Mozambique", "Myanmar", "Namibia", "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger",
    "Nigeria", "North Korea", "North Macedonia", "Norway", "Oman", "Pakistan", "Palestine", "Panama", "Paraguay", "Peru",
    "Philippines", "Poland", "Portugal", "Qatar", "Romania", "Russia", "Rwanda", "Saudi Arabia", "Senegal", "Serbia",
    "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Somalia", "South Africa", "South Korea", "South Sudan", "Spain",
    "Sri Lanka", "Sudan", "Sweden", "Switzerland", "Syria", "Taiwan", "Tajikistan", "Tanzania", "Thailand", "Tunisia",
    "Turkey", "Turkmenistan", "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States", "Uruguay", "Uzbekistan", "Venezuela",
    "Vietnam", "Yemen", "Zambia", "Zimbabwe"
];

export default function Dashboard() {
    const { auth } = usePage<any>().props;
    const user = auth.user;
    const [isAddTalentOpen, setIsAddTalentOpen] = useState(false);

    const childForm = useForm({
        talents: [
            {
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
            }
        ]
    });

    const addTalentProfile = () => {
        childForm.setData('talents', [
            ...childForm.data.talents,
            {
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
            }
        ]);
    };

    const removeTalentProfile = (index: number) => {
        if (childForm.data.talents.length > 1) {
            childForm.setData('talents', childForm.data.talents.filter((_, i) => i !== index));
        }
    };

    const updateTalentField = (index: number, field: string, value: any) => {
        const updated = [...childForm.data.talents];
        updated[index] = {
            ...updated[index],
            [field]: value
        };
        childForm.setData('talents', updated);
    };

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

    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.05
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 12 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Dashboard', href: '/dashboard' }]}>
            <div className="flex h-full flex-1 flex-col gap-6 p-6 lg:p-10 text-left animate-fade-in">
                <Head title="Dashboard" />
            
            {/* Render based on user role */}
            {user.role === 'parent' ? (
                // 1. Parent Dashboard
                <div className="space-y-8">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div className="relative pl-0 md:pl-4">
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-full hidden md:block shadow-[0_0_10px_rgba(var(--primary),0.5)]"></div>
                            <h1 className="text-3xl font-black italic uppercase tracking-tight bg-gradient-to-r from-foreground via-foreground/95 to-primary/80 bg-clip-text text-transparent">
                                PARENT DASHBOARD
                            </h1>
                            <p className="text-muted-foreground/80 text-sm font-medium mt-0.5">Manage your children's talent profiles and track their progress.</p>
                        </div>
                        
                        <Dialog open={isAddTalentOpen} onOpenChange={setIsAddTalentOpen}>
                            <DialogTrigger asChild>
                                <Button className="h-12 px-6 rounded-xl font-bold uppercase tracking-wider shadow-lg shadow-primary/15 hover:shadow-primary/30 transition-all hover:scale-102 active:scale-98 cursor-pointer">
                                    <Plus className="mr-2 h-5 w-5" /> Add Talent Profiles
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[620px] max-h-[85vh] overflow-y-auto rounded-3xl border border-muted-foreground/15 shadow-2xl bg-card">
                                <DialogHeader>
                                    <DialogTitle className="text-2xl font-black italic uppercase text-foreground">ADD TALENT PROFILES</DialogTitle>
                                    <p className="text-xs text-muted-foreground/85 font-medium mt-1">Create profiles for your children. You can add one or multiple talents at once.</p>
                                </DialogHeader>
                                <form onSubmit={handleAddChild} className="space-y-6 py-4 text-left">
                                    <div className="space-y-6 max-h-[50vh] overflow-y-auto pr-1">
                                        <AnimatePresence initial={false}>
                                            {childForm.data.talents.map((talent, index) => (
                                                <motion.div
                                                    key={index}
                                                    initial={{ opacity: 0, y: 15 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: -15 }}
                                                    transition={{ duration: 0.2 }}
                                                    className="p-5 rounded-2xl border border-muted-foreground/15 bg-muted/5 relative space-y-4 shadow-sm"
                                                >
                                                    <div className="flex justify-between items-center pb-2 border-b border-muted-foreground/10">
                                                        <span className="text-xs font-black uppercase tracking-widest text-primary">
                                                            Talent Profile #{index + 1}
                                                        </span>
                                                        {childForm.data.talents.length > 1 && (
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => removeTalentProfile(index)}
                                                                className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive rounded-lg transition-colors cursor-pointer"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        )}
                                                    </div>

                                                    <div className="grid gap-2">
                                                        <Label htmlFor={`display_name-${index}`} className="text-[10px] font-black uppercase tracking-widest opacity-80">Display Name</Label>
                                                        <Input
                                                            id={`display_name-${index}`}
                                                            placeholder="Child's display name"
                                                            value={talent.display_name}
                                                            onChange={e => updateTalentField(index, 'display_name', e.target.value)}
                                                            className="h-11 rounded-xl border-muted-foreground/15 focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary bg-card font-bold"
                                                            required
                                                        />
                                                        <InputError message={childForm.errors[`talents.${index}.display_name` as any]} />
                                                    </div>

                                                    <div className="grid gap-4 sm:grid-cols-2">
                                                        <div className="grid gap-2">
                                                            <Label htmlFor={`date_of_birth-${index}`} className="text-[10px] font-black uppercase tracking-widest opacity-80">Date of Birth</Label>
                                                            <Input
                                                                id={`date_of_birth-${index}`}
                                                                type="date"
                                                                value={talent.date_of_birth}
                                                                onChange={e => updateTalentField(index, 'date_of_birth', e.target.value)}
                                                                className="h-11 rounded-xl border-muted-foreground/15 focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary bg-card"
                                                                required
                                                            />
                                                            <InputError message={childForm.errors[`talents.${index}.date_of_birth` as any]} />
                                                        </div>
                                                        <div className="grid gap-2">
                                                            <Label htmlFor={`nationality-${index}`} className="text-[10px] font-black uppercase tracking-widest opacity-80">Nationality</Label>
                                                            <select
                                                                id={`nationality-${index}`}
                                                                value={talent.nationality}
                                                                onChange={e => updateTalentField(index, 'nationality', e.target.value)}
                                                                className="flex h-11 w-full rounded-xl border border-muted-foreground/15 bg-card px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary"
                                                                required
                                                            >
                                                                <option value="">Select Nationality</option>
                                                                {COUNTRIES.map(c => (
                                                                    <option key={c} value={c}>{c}</option>
                                                                ))}
                                                            </select>
                                                            <InputError message={childForm.errors[`talents.${index}.nationality` as any]} />
                                                        </div>
                                                    </div>

                                                    <div className="grid gap-4 sm:grid-cols-2">
                                                        <div className="grid gap-2">
                                                            <Label htmlFor={`city-${index}`} className="text-[10px] font-black uppercase tracking-widest opacity-80">City</Label>
                                                            <Input
                                                                id={`city-${index}`}
                                                                placeholder="e.g. Paris"
                                                                value={talent.city}
                                                                onChange={e => updateTalentField(index, 'city', e.target.value)}
                                                                className="h-11 rounded-xl border-muted-foreground/15 focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary bg-card"
                                                            />
                                                            <InputError message={childForm.errors[`talents.${index}.city` as any]} />
                                                        </div>
                                                        <div className="grid gap-2">
                                                            <Label htmlFor={`country-${index}`} className="text-[10px] font-black uppercase tracking-widest opacity-80">Country</Label>
                                                            <Input
                                                                id={`country-${index}`}
                                                                placeholder="e.g. France"
                                                                value={talent.country}
                                                                onChange={e => updateTalentField(index, 'country', e.target.value)}
                                                                className="h-11 rounded-xl border-muted-foreground/15 focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary bg-card"
                                                            />
                                                            <InputError message={childForm.errors[`talents.${index}.country` as any]} />
                                                        </div>
                                                    </div>

                                                    <div className="grid gap-4 sm:grid-cols-3">
                                                        <div className="grid gap-2">
                                                            <Label htmlFor={`position-${index}`} className="text-[10px] font-black uppercase tracking-widest opacity-80">Position</Label>
                                                            <select
                                                                id={`position-${index}`}
                                                                value={talent.position}
                                                                onChange={e => updateTalentField(index, 'position', e.target.value)}
                                                                className="flex h-11 w-full rounded-xl border border-muted-foreground/15 bg-card px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary"
                                                            >
                                                                {['GK', 'CB', 'LB', 'RB', 'CDM', 'CM', 'CAM', 'LW', 'RW', 'ST', 'AMF', 'CMD', 'CF'].map(pos => (
                                                                    <option key={pos} value={pos}>{pos}</option>
                                                                ))}
                                                            </select>
                                                            <InputError message={childForm.errors[`talents.${index}.position` as any]} />
                                                        </div>
                                                        <div className="grid gap-2">
                                                            <Label htmlFor={`dominant_foot-${index}`} className="text-[10px] font-black uppercase tracking-widest opacity-80">Dominant Foot</Label>
                                                            <select
                                                                id={`dominant_foot-${index}`}
                                                                value={talent.dominant_foot}
                                                                onChange={e => updateTalentField(index, 'dominant_foot', e.target.value)}
                                                                className="flex h-11 w-full rounded-xl border border-muted-foreground/15 bg-card px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary"
                                                            >
                                                                <option value="left">Left</option>
                                                                <option value="right">Right</option>
                                                                <option value="both">Both</option>
                                                            </select>
                                                            <InputError message={childForm.errors[`talents.${index}.dominant_foot` as any]} />
                                                        </div>
                                                        <div className="grid gap-2">
                                                            <Label htmlFor={`height_cm-${index}`} className="text-[10px] font-black uppercase tracking-widest opacity-80">Height (cm)</Label>
                                                            <Input
                                                                id={`height_cm-${index}`}
                                                                type="number"
                                                                placeholder="e.g. 165"
                                                                value={talent.height_cm}
                                                                onChange={e => updateTalentField(index, 'height_cm', e.target.value)}
                                                                className="h-11 rounded-xl border-muted-foreground/15 focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary bg-card font-bold"
                                                                required
                                                            />
                                                            <InputError message={childForm.errors[`talents.${index}.height_cm` as any]} />
                                                        </div>
                                                    </div>

                                                    <div className="grid gap-4 sm:grid-cols-2">
                                                        <div className="grid gap-2 col-span-2">
                                                            <Label htmlFor={`weight_kg-${index}`} className="text-[10px] font-black uppercase tracking-widest opacity-80">Weight (kg)</Label>
                                                            <Input
                                                                id={`weight_kg-${index}`}
                                                                type="number"
                                                                placeholder="e.g. 55"
                                                                value={talent.weight_kg}
                                                                onChange={e => updateTalentField(index, 'weight_kg', e.target.value)}
                                                                className="h-11 rounded-xl border-muted-foreground/15 focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary bg-card font-bold"
                                                                required
                                                            />
                                                            <InputError message={childForm.errors[`talents.${index}.weight_kg` as any]} />
                                                        </div>
                                                    </div>

                                                    <div className="grid gap-2">
                                                        <Label htmlFor={`bio-${index}`} className="text-[10px] font-black uppercase tracking-widest opacity-80">Bio</Label>
                                                        <Textarea
                                                            id={`bio-${index}`}
                                                            placeholder="Write something about your child's skills..."
                                                            value={talent.bio}
                                                            onChange={e => updateTalentField(index, 'bio', e.target.value)}
                                                            className="min-h-[80px] rounded-xl border-muted-foreground/15 focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary bg-card"
                                                        />
                                                        <InputError message={childForm.errors[`talents.${index}.bio` as any]} />
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </AnimatePresence>
                                    </div>

                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={addTalentProfile}
                                        className="w-full h-11 border-2 border-dashed border-primary/30 hover:border-primary text-primary hover:bg-primary/5 rounded-xl font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                                    >
                                        <Plus className="h-4 w-4" /> Add Another Profile
                                    </Button>

                                    <div className="pt-2">
                                        <Button
                                            type="submit"
                                            className="w-full h-12 rounded-xl font-bold uppercase tracking-wider shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all hover:scale-101 active:scale-99 cursor-pointer"
                                            disabled={childForm.processing}
                                        >
                                            {childForm.processing ? 'Saving...' : `Save ${childForm.data.talents.length} Profile${childForm.data.talents.length > 1 ? 's' : ''}`}
                                        </Button>
                                    </div>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>

                    {/* Children Grid */}
                    {user.managed_talents && user.managed_talents.length > 0 ? (
                        <motion.div 
                            className="grid gap-6 md:grid-cols-3"
                            variants={containerVariants}
                            initial="hidden"
                            animate="show"
                        >
                            {user.managed_talents.map((talent: any) => (
                                <motion.div key={talent.id} variants={itemVariants}>
                                    <Card className="border border-muted-foreground/15 bg-card/80 backdrop-blur-xs shadow-md hover:shadow-2xl hover:scale-102 hover:border-primary/25 transition-all duration-300 flex flex-col justify-between rounded-3xl overflow-hidden text-left h-full">
                                        <div className="p-8 flex flex-col items-center border-b border-muted-foreground/10 bg-muted/15 relative">
                                            <div className="absolute top-4 right-4">
                                                <Star className="h-4.5 w-4.5 text-primary/40 hover:text-primary transition-colors cursor-pointer" />
                                            </div>
                                            <PitchAvatar 
                                                position={talent.talent_profile?.position || 'GK'} 
                                                gender={talent.gender}
                                                size="lg" 
                                            />
                                            <h2 className="mt-4 text-xl font-extrabold tracking-tight text-foreground">{talent.talent_profile?.display_name || talent.name}</h2>
                                            <div className="mt-1.5 flex gap-2 items-center">
                                                <Badge className="px-2 py-0.5 text-[9px] font-black uppercase tracking-widest bg-primary/10 text-primary border border-primary/20 leading-none">
                                                    {talent.talent_profile?.position}
                                                </Badge>
                                                <span className="text-xs text-muted-foreground/85 font-semibold">
                                                    • {talent.talent_profile?.nationality}
                                                </span>
                                            </div>
                                        </div>
                                        <CardContent className="p-6 space-y-4">
                                            <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-muted-foreground">
                                                <div className="text-left">
                                                    <p className="text-[10px] text-muted-foreground/70 uppercase tracking-widest">Video Count</p>
                                                    <div className="flex items-center gap-1 mt-0.5">
                                                        <Video className="h-4 w-4 text-primary" />
                                                        <p className="text-lg font-black text-foreground">{talent.videos_count}</p>
                                                    </div>
                                                </div>
                                                <div className="text-left">
                                                    <p className="text-[10px] text-muted-foreground/70 uppercase tracking-widest">Height / Weight</p>
                                                    <p className="text-sm font-bold text-foreground mt-1">
                                                        {talent.talent_profile?.height_cm}cm / {talent.talent_profile?.weight_kg}kg
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex gap-2 pt-2">
                                                <Button asChild className="flex-1 h-10 rounded-xl font-bold text-xs hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-200" variant="outline">
                                                    <a href={`/talents/${talent.id}`} className="flex items-center justify-center gap-1">
                                                        View Profile <ArrowUpRight className="h-3.5 w-3.5" />
                                                    </a>
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))}
                        </motion.div>
                    ) : (
                        <div className="text-center py-20 opacity-75 space-y-4 max-w-md mx-auto">
                            <div className="p-4 rounded-full bg-muted/30 border border-muted-foreground/5 inline-block">
                                <Users className="h-12 w-12 text-muted-foreground/60" />
                            </div>
                            <div className="space-y-1">
                                <p className="text-lg font-bold text-foreground">You haven't added any child profiles yet.</p>
                                <p className="text-sm text-muted-foreground/80 leading-relaxed">Create a profile for your child to start sharing their videos with clubs and scouts.</p>
                            </div>
                        </div>
                    )}
                </div>
            ) : user.role === 'scout' || user.role === 'club' || user.role === 'scout_club' ? (
                // 2. Scout Dashboard with Recharts Analytics
                <div className="space-y-8">
                    <div className="relative pl-0 md:pl-4">
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-full hidden md:block shadow-[0_0_10px_rgba(var(--primary),0.5)]"></div>
                        <h1 className="text-3xl font-black italic uppercase tracking-tight bg-gradient-to-r from-foreground via-foreground/95 to-primary/80 bg-clip-text text-transparent">
                            SCOUT ANALYTICS
                        </h1>
                        <p className="text-muted-foreground/80 text-sm font-medium mt-0.5">Explore platform metrics and discover top AI-rated talents.</p>
                    </div>

                    {/* Analytics KPI Row */}
                    <div className="grid gap-4 md:grid-cols-4">
                        <Card className="border border-muted-foreground/15 p-6 shadow-md bg-card/75 backdrop-blur-xs rounded-3xl flex flex-col justify-between">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Total Talents</h3>
                                <Users className="h-5 w-5 text-primary" />
                            </div>
                            <p className="text-3xl font-black text-foreground mt-4">1,248</p>
                            <p className="text-xs text-green-500 font-bold mt-1">+12% this month</p>
                        </Card>
                        <Card className="border border-muted-foreground/15 p-6 shadow-md bg-card/75 backdrop-blur-xs rounded-3xl flex flex-col justify-between">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest">AI Analyses</h3>
                                <Video className="h-5 w-5 text-primary" />
                            </div>
                            <p className="text-3xl font-black text-foreground mt-4">5,892</p>
                            <p className="text-xs text-green-500 font-bold mt-1">+24% this month</p>
                        </Card>
                        <Card className="border border-muted-foreground/15 p-6 shadow-md bg-card/75 backdrop-blur-xs rounded-3xl flex flex-col justify-between">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Avg AI Score</h3>
                                <Star className="h-5 w-5 text-primary" />
                            </div>
                            <p className="text-3xl font-black text-foreground mt-4">76.4</p>
                            <p className="text-xs text-muted-foreground font-bold mt-1">Platform average</p>
                        </Card>
                        <Card className="border border-muted-foreground/15 p-6 shadow-md bg-card/75 backdrop-blur-xs rounded-3xl flex flex-col justify-between">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Wallet Balance</h3>
                                <Wallet className="h-5 w-5 text-primary" />
                            </div>
                            <p className="text-3xl font-black text-foreground mt-4">${Number(user.wallet_balance).toFixed(2)}</p>
                            <Link href="/wallet" className="text-xs text-primary font-bold mt-1 hover:underline">Manage Wallet</Link>
                        </Card>
                    </div>

                    {/* Charts Row */}
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {/* Position Distribution */}
                        <Card className="border border-muted-foreground/15 p-6 shadow-md bg-card/75 backdrop-blur-xs rounded-3xl lg:col-span-1">
                            <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-6">Talents By Position</h3>
                            <div className="h-[250px] w-full">
                                <ScoutPositionChart />
                            </div>
                        </Card>

                        {/* Top Scorers Overview */}
                        <Card className="border border-muted-foreground/15 p-6 shadow-md bg-card/75 backdrop-blur-xs rounded-3xl lg:col-span-2">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Top AI Rated Talents</h3>
                                <Button asChild variant="outline" size="sm" className="h-8 rounded-lg text-xs font-bold cursor-pointer">
                                    <Link href="/talents">View All</Link>
                                </Button>
                            </div>
                            <div className="h-[250px] w-full">
                                <ScoutScoreChart />
                            </div>
                        </Card>
                    </div>
                </div>
            ) : (
                // 3. Player/Talent Dashboard
                <div className="grid gap-6 md:grid-cols-3">
                    {/* Player Card */}
                    <Card className="flex flex-col items-center justify-center border border-muted-foreground/15 bg-gradient-to-br from-card to-muted/10 p-10 shadow-lg hover:shadow-2xl transition-all duration-300 rounded-3xl relative overflow-hidden group">
                        <div className="absolute -top-10 -left-10 w-24 h-24 bg-primary/5 rounded-full blur-xl group-hover:bg-primary/10 transition-all duration-500" />
                        <PitchAvatar 
                            position={user.talent_profile?.position || 'GK'} 
                            gender={user.gender}
                            size="lg" 
                        />
                        <div className="mt-6 text-center">
                            <h2 className="text-2xl font-extrabold tracking-tight text-foreground">{user.talent_profile?.display_name || user.name}</h2>
                            <div className="mt-2.5 flex items-center justify-center gap-2 select-none">
                                <Badge className="px-3 py-0.5 text-[10px] font-black uppercase tracking-widest bg-primary/10 text-primary border border-primary/20 leading-none">
                                    {user.role?.replace('_', ' ')}
                                </Badge>
                                <span className="text-muted-foreground/60">•</span>
                                <span className="text-xs font-bold text-muted-foreground/80 uppercase tracking-wider font-mono">
                                    {user.talent_profile?.position || 'No Position'}
                                </span>
                            </div>
                        </div>
                    </Card>
                    
                    {/* Stats and Activity */}
                    <div className="col-span-2 space-y-6">
                        <Card className="border border-muted-foreground/15 bg-card/80 backdrop-blur-xs p-8 shadow-md rounded-3xl">
                            <h3 className="mb-6 text-xl font-bold tracking-tight uppercase text-foreground">Performance Overview</h3>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="rounded-2xl bg-muted/30 p-6 border border-muted-foreground/10 transition-all hover:bg-muted/50 text-left">
                                    <p className="text-[10px] font-bold text-muted-foreground/75 uppercase tracking-wider">Video Uploads</p>
                                    <div className="mt-2 flex items-baseline gap-2">
                                        <p className="text-4xl font-black text-primary">{user.videos_count || 0}</p>
                                        <p className="text-sm font-medium text-muted-foreground/85">/ 5 free</p>
                                    </div>
                                    <div className="mt-4 h-2 w-full bg-muted-foreground/15 rounded-full overflow-hidden">
                                        <div className="h-full bg-primary shadow-[0_0_8px_rgba(var(--primary),0.4)]" style={{ width: `${Math.min(((user.videos_count || 0) / 5) * 100, 100)}%` }} />
                                    </div>
                                </div>
                                <div className="rounded-2xl bg-muted/30 p-6 border border-muted-foreground/10 transition-all hover:bg-muted/50 text-left flex flex-col justify-between gap-4">
                                    <div>
                                        <p className="text-[10px] font-bold text-muted-foreground/75 uppercase tracking-wider">Upgrade Status</p>
                                        <p className="text-lg font-black text-foreground mt-2">Unlimited Uploads</p>
                                    </div>
                                    <Button 
                                        onClick={handleBuyPro}
                                        className="h-10 text-xs rounded-xl font-black uppercase tracking-wider w-full shadow-lg shadow-primary/15 hover:shadow-primary/25 hover:scale-101 active:scale-99 transition-all cursor-pointer border-0"
                                    >
                                        Buy Pro ($30)
                                    </Button>
                                </div>
                            </div>
                        </Card>

                        <Card className="border border-muted-foreground/15 bg-card/80 backdrop-blur-xs p-8 shadow-md rounded-3xl">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold tracking-tight uppercase text-foreground">Recent Activity</h3>
                                <Button variant="ghost" size="sm" className="text-xs font-bold text-primary hover:text-primary hover:bg-primary/5 rounded-lg cursor-pointer">
                                    View All
                                </Button>
                            </div>
                            <div className="flex flex-col items-center justify-center py-10 text-center space-y-4 opacity-75">
                                <div className="p-3 bg-muted rounded-full border border-muted-foreground/5">
                                    <Trophy className="h-6 w-6 text-muted-foreground/60" />
                                </div>
                                <p className="text-sm font-medium text-muted-foreground/80">No activity yet. Start by uploading a video!</p>
                            </div>
                        </Card>
                    </div>
                </div>
            )}
        </div>
        </AppLayout>
    );
}
