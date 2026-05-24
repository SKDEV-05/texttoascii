import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, MapPin, Footprints, Scale, Compass, Trophy } from 'lucide-react';
import { useState } from 'react';

interface Talent {
    id: number;
    display_name: string;
    position: string;
    nationality: string;
    city: string;
    country: string;
    dominant_foot: string;
    height_cm: number;
    weight_kg: number;
    user: {
        id: number;
        gender: string;
    };
}

interface Props {
    talents: Talent[];
    filters: {
        position?: string;
        gender?: string;
        dominant_foot?: string;
        search?: string;
    };
}

export default function TalentsIndex({ talents, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [position, setPosition] = useState(filters.position || '');
    const [gender, setGender] = useState(filters.gender || '');
    const [dominantFoot, setDominantFoot] = useState(filters.dominant_foot || '');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        applyFilters();
    };

    const applyFilters = (newParams = {}) => {
        router.get('/talents', {
            search,
            position,
            gender,
            dominant_foot: dominantFoot,
            ...newParams
        }, {
            preserveState: true,
        });
    };

    const clearFilters = () => {
        setSearch('');
        setPosition('');
        setGender('');
        setDominantFoot('');
        router.get('/talents');
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Find Talents', href: '/talents' }]}>
            <Head title="Find Talents" />
            <div className="container mx-auto py-10 px-6 space-y-10 max-w-6xl text-left">
                
                {/* Header */}
                <div>
                    <h1 className="text-4xl font-black italic uppercase tracking-tight">FIND TALENTS</h1>
                    <p className="text-muted-foreground text-sm font-medium">Search and filters scouts and clubs looking for the next star.</p>
                </div>

                {/* Filters */}
                <Card className="border-muted-foreground/20 rounded-3xl bg-card shadow-sm p-6">
                    <form onSubmit={handleSearch} className="space-y-4">
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search by name, nationality or location..."
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    className="pl-9 h-11 rounded-xl"
                                />
                            </div>
                            <Button type="submit" className="h-11 px-6 rounded-xl font-bold">Search</Button>
                        </div>
                        
                        <div className="grid gap-4 sm:grid-cols-4 pt-2">
                            {/* Position filter */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] font-bold uppercase tracking-widest opacity-60">Position</label>
                                <select
                                    value={position}
                                    onChange={e => {
                                        setPosition(e.target.value);
                                        applyFilters({ position: e.target.value });
                                    }}
                                    className="flex h-11 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                >
                                    <option value="">All Positions</option>
                                    {['GK', 'CB', 'LB', 'RB', 'CDM', 'CM', 'CAM', 'LW', 'RW', 'ST'].map(pos => (
                                        <option key={pos} value={pos}>{pos}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Gender filter */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] font-bold uppercase tracking-widest opacity-60">Gender</label>
                                <select
                                    value={gender}
                                    onChange={e => {
                                        setGender(e.target.value);
                                        applyFilters({ gender: e.target.value });
                                    }}
                                    className="flex h-11 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                >
                                    <option value="">All Genders</option>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                </select>
                            </div>

                            {/* Dominant foot filter */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] font-bold uppercase tracking-widest opacity-60">Dominant Foot</label>
                                <select
                                    value={dominantFoot}
                                    onChange={e => {
                                        setDominantFoot(e.target.value);
                                        applyFilters({ dominant_foot: e.target.value });
                                    }}
                                    className="flex h-11 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                >
                                    <option value="">Any Foot</option>
                                    <option value="left">Left</option>
                                    <option value="right">Right</option>
                                    <option value="both">Both</option>
                                </select>
                            </div>

                            <div className="flex items-end">
                                <Button
                                    type="button"
                                    onClick={clearFilters}
                                    variant="outline"
                                    className="w-full h-11 rounded-xl font-bold border-muted-foreground/20"
                                >
                                    Reset Filters
                                </Button>
                            </div>
                        </div>
                    </form>
                </Card>

                {/* Talents Grid */}
                <div className="grid gap-6 md:grid-cols-3">
                    {talents.length > 0 ? (
                        talents.map((talent) => (
                            <Link href={`/talents/${talent.id}`} key={talent.id} className="group hover:-translate-y-1 transition-transform">
                                <Card className="border-muted-foreground/20 rounded-3xl bg-card shadow-sm overflow-hidden flex flex-col justify-between h-full group-hover:shadow-md transition-shadow">
                                    <div className="h-2 bg-primary/20 w-full group-hover:bg-primary transition-colors" />
                                    <CardContent className="p-6 flex flex-col gap-6">
                                        
                                        {/* Display details */}
                                        <div className="flex justify-between items-start gap-2">
                                            <div className="text-left">
                                                <h3 className="text-xl font-extrabold tracking-tight group-hover:text-primary transition-colors">
                                                    {talent.display_name}
                                                </h3>
                                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-semibold mt-1">
                                                    <MapPin className="h-3 w-3 text-primary" />
                                                    {talent.city && talent.country ? `${talent.city}, ${talent.country}` : talent.nationality}
                                                </div>
                                            </div>
                                            
                                            <span className="text-xs font-black uppercase tracking-wider bg-primary/10 text-primary border border-primary/20 px-3 py-1 rounded-full">
                                                {talent.position}
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 text-xs font-semibold py-3 border-y border-muted-foreground/10 text-muted-foreground text-left">
                                            <div className="flex items-center gap-2">
                                                <Footprints className="h-4 w-4 text-primary" />
                                                <span>Foot: <strong className="text-foreground capitalize">{talent.dominant_foot}</strong></span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Scale className="h-4 w-4 text-primary" />
                                                <span>Height: <strong className="text-foreground">{talent.height_cm}cm</strong></span>
                                            </div>
                                            <div className="flex items-center gap-2 col-span-2">
                                                <Compass className="h-4 w-4 text-primary" />
                                                <span>Weight: <strong className="text-foreground">{talent.weight_kg}kg</strong></span>
                                            </div>
                                        </div>

                                        <Button className="w-full h-11 rounded-xl font-bold uppercase tracking-wider group-hover:bg-primary/95">
                                            View Profile
                                        </Button>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))
                    ) : (
                        <div className="col-span-3 text-center py-20 opacity-55 space-y-3">
                            <Trophy className="h-12 w-12 mx-auto text-muted-foreground" />
                            <p className="text-lg font-bold">No talents found matching the criteria.</p>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
