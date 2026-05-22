import { Head, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { saveTalentDetails } from '@/actions/App/Http/Controllers/OnboardingController';
import { useEffect, useState } from 'react';
import { MapPin, Navigation } from 'lucide-react';

interface Props {
    positions: string[];
    dominant_feet: string[];
}

export default function TalentDetails({ positions, dominant_feet }: Props) {
    const [countries, setCountries] = useState<string[]>([]);
    const [isLoadingLocation, setIsLoadingLocation] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        display_name: '',
        date_of_birth: '',
        nationality: '',
        city: '',
        country: '',
        latitude: '',
        longitude: '',
        dominant_foot: '',
        height_cm: '',
        weight_kg: '',
        position: '',
        bio: '',
    });

    useEffect(() => {
        fetch('https://restcountries.com/v3.1/all?fields=name')
            .then(res => res.json())
            .then(data => {
                const names = data.map((c: any) => c.name.common).sort();
                setCountries(names);
            })
            .catch(err => console.error('Failed to fetch countries', err));
    }, []);

    const handleGetLocation = () => {
        setIsLoadingLocation(true);
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    setData(prev => ({
                        ...prev,
                        latitude: latitude.toString(),
                        longitude: longitude.toString(),
                    }));

                    // Optional: Reverse geocoding to get city/country
                    fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`)
                        .then(res => res.json())
                        .then(data => {
                            if (data.address) {
                                setData(prev => ({
                                    ...prev,
                                    city: data.address.city || data.address.town || data.address.village || '',
                                    country: data.address.country || '',
                                    nationality: data.address.country || prev.nationality,
                                }));
                            }
                            setIsLoadingLocation(false);
                        })
                        .catch(() => setIsLoadingLocation(false));
                },
                () => setIsLoadingLocation(false)
            );
        } else {
            setIsLoadingLocation(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(saveTalentDetails.url());
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-background p-6 lg:p-10 font-sans">
            <Head title="Talent Details" />
            <Card className="w-full max-w-xl border-muted-foreground/10 shadow-2xl rounded-[2rem] overflow-hidden">
                <div className="h-3 bg-primary w-full" />
                <CardHeader className="p-10 text-center">
                    <CardTitle className="text-3xl font-black italic uppercase tracking-tight">Complete Your Profile</CardTitle>
                    <CardDescription className="text-base font-medium mt-2">Let the world know who you are as a player.</CardDescription>
                </CardHeader>
                <CardContent className="p-10 pt-0">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid gap-6 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="display_name" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Display Name</Label>
                                <Input 
                                    id="display_name" 
                                    className="h-12 rounded-xl border-muted-foreground/20 bg-muted/5 focus:bg-background transition-colors font-bold"
                                    value={data.display_name} 
                                    onChange={e => setData('display_name', e.target.value)} 
                                    placeholder="e.g. Cristiano Jr."
                                />
                                {errors.display_name && <p className="text-[10px] text-destructive font-bold ml-1">{errors.display_name}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="date_of_birth" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Date of Birth</Label>
                                <Input 
                                    id="date_of_birth" 
                                    type="date" 
                                    className="h-12 rounded-xl border-muted-foreground/20 bg-muted/5 focus:bg-background transition-colors font-bold"
                                    value={data.date_of_birth} 
                                    onChange={e => setData('date_of_birth', e.target.value)} 
                                />
                                {errors.date_of_birth && <p className="text-[10px] text-destructive font-bold ml-1">{errors.date_of_birth}</p>}
                            </div>
                        </div>

                        <div className="grid gap-6 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="nationality" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Nationality</Label>
                                <Select onValueChange={value => setData('nationality', value)} value={data.nationality}>
                                    <SelectTrigger className="h-12 rounded-xl border-muted-foreground/20 bg-muted/5 font-bold">
                                        <SelectValue placeholder="Select Country" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {countries.map(country => (
                                            <SelectItem key={country} value={country} className="font-bold">
                                                {country}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.nationality && <p className="text-[10px] text-destructive font-bold ml-1">{errors.nationality}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="dominant_foot" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Dominant Foot</Label>
                                <Select onValueChange={value => setData('dominant_foot', value)}>
                                    <SelectTrigger className="h-12 rounded-xl border-muted-foreground/20 bg-muted/5 font-bold">
                                        <SelectValue placeholder="Select foot" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {dominant_feet.map(foot => (
                                            <SelectItem key={foot} value={foot} className="font-bold">
                                                {foot.charAt(0).toUpperCase() + foot.slice(1)}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.dominant_foot && <p className="text-[10px] text-destructive font-bold ml-1">{errors.dominant_foot}</p>}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Live Location (Town/City)</Label>
                            <div className="flex gap-3">
                                <div className="relative flex-1">
                                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input 
                                        className="h-12 pl-11 rounded-xl border-muted-foreground/20 bg-muted/5 focus:bg-background transition-colors font-bold"
                                        value={data.city} 
                                        onChange={e => setData('city', e.target.value)} 
                                        placeholder="Detect or type city..."
                                    />
                                </div>
                                <Button 
                                    type="button" 
                                    variant="outline" 
                                    size="icon" 
                                    className={`h-12 w-12 rounded-xl border-muted-foreground/20 transition-all ${isLoadingLocation ? 'bg-primary/10' : 'hover:bg-primary/5 hover:border-primary/50'}`}
                                    onClick={handleGetLocation}
                                    disabled={isLoadingLocation}
                                >
                                    <Navigation className={`h-5 w-5 text-primary ${isLoadingLocation ? 'animate-pulse' : ''}`} />
                                </Button>
                            </div>
                            {errors.city && <p className="text-[10px] text-destructive font-bold ml-1">{errors.city}</p>}
                        </div>

                        <div className="grid gap-4 md:grid-cols-3">
                            <div className="space-y-1">
                                <Label htmlFor="height_cm" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Height (cm)</Label>
                                <Input 
                                    id="height_cm" 
                                    type="number" 
                                    className="h-11 rounded-xl border-muted-foreground/20 font-bold"
                                    value={data.height_cm} 
                                    onChange={e => setData('height_cm', e.target.value)} 
                                    placeholder="180"
                                />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="weight_kg" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Weight (kg)</Label>
                                <Input 
                                    id="weight_kg" 
                                    type="number" 
                                    className="h-11 rounded-xl border-muted-foreground/20 font-bold"
                                    value={data.weight_kg} 
                                    onChange={e => setData('weight_kg', e.target.value)} 
                                    placeholder="75"
                                />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="position" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Position</Label>
                                <Select onValueChange={value => setData('position', value)}>
                                    <SelectTrigger className="h-11 rounded-xl border-muted-foreground/20 font-black italic uppercase text-[10px]">
                                        <SelectValue placeholder="POS" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {positions.map(pos => (
                                            <SelectItem key={pos} value={pos} className="font-black italic">
                                                {pos}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="bio" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Player Biography</Label>
                            <Textarea 
                                id="bio" 
                                value={data.bio} 
                                onChange={e => setData('bio', e.target.value)} 
                                placeholder="Tell scouts about your strengths, journey and achievements..."
                                className="min-h-[120px] rounded-2xl border-muted-foreground/20 bg-muted/5 focus:bg-background transition-colors font-medium text-sm p-4"
                            />
                            {errors.bio && <p className="text-[10px] text-destructive font-bold ml-1">{errors.bio}</p>}
                        </div>

                        <Button type="submit" className="w-full h-14 rounded-2xl font-black italic uppercase tracking-[0.1em] text-lg shadow-xl shadow-primary/20 hover:scale-[1.02] transition-transform" disabled={processing}>
                            SAVE PROFILE & START
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}

