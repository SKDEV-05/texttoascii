import { Head, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { saveInstitutionDetails } from '@/actions/App/Http/Controllers/OnboardingController';
import { useEffect, useState } from 'react';
import { Building2, Globe, MapPin } from 'lucide-react';

interface Props {
    types: string[];
}

export default function InstitutionDetails({ types }: Props) {
    const [countries, setCountries] = useState<string[]>([]);

    const { data, setData, post, processing, errors } = useForm({
        institution_name: '',
        country: '',
        city: '',
        type: '',
        website: '',
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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(saveInstitutionDetails.url());
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-background p-6 lg:p-10 font-sans">
            <Head title="Institution Details" />
            <Card className="w-full max-w-xl border-muted-foreground/10 shadow-2xl rounded-[2rem] overflow-hidden">
                <div className="h-3 bg-primary w-full" />
                <CardHeader className="p-10 text-center">
                    <CardTitle className="text-3xl font-black italic uppercase tracking-tight">Organization Profile</CardTitle>
                    <CardDescription className="text-base font-medium mt-2">Set up your club or agency to start discovering talent.</CardDescription>
                </CardHeader>
                <CardContent className="p-10 pt-0">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="institution_name" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Organization Name</Label>
                            <div className="relative">
                                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input 
                                    id="institution_name" 
                                    className="h-12 pl-11 rounded-xl border-muted-foreground/20 bg-muted/5 focus:bg-background transition-colors font-bold"
                                    value={data.institution_name} 
                                    onChange={e => setData('institution_name', e.target.value)} 
                                    placeholder="e.g. Real Madrid CF or Scout Agency"
                                />
                            </div>
                            {errors.institution_name && <p className="text-[10px] text-destructive font-bold ml-1">{errors.institution_name}</p>}
                        </div>

                        <div className="grid gap-6 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="type" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Organization Type</Label>
                                <Select onValueChange={value => setData('type', value)}>
                                    <SelectTrigger className="h-12 rounded-xl border-muted-foreground/20 bg-muted/5 font-bold">
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {types.map(type => (
                                            <SelectItem key={type} value={type} className="font-bold">
                                                {type.replace('_', ' ').charAt(0).toUpperCase() + type.replace('_', ' ').slice(1)}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.type && <p className="text-[10px] text-destructive font-bold ml-1">{errors.type}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="website" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Website (Optional)</Label>
                                <div className="relative">
                                    <Globe className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input 
                                        id="website" 
                                        type="url"
                                        className="h-12 pl-11 rounded-xl border-muted-foreground/20 bg-muted/5 focus:bg-background transition-colors font-bold"
                                        value={data.website} 
                                        onChange={e => setData('website', e.target.value)} 
                                        placeholder="https://example.com"
                                    />
                                </div>
                                {errors.website && <p className="text-[10px] text-destructive font-bold ml-1">{errors.website}</p>}
                            </div>
                        </div>

                        <div className="grid gap-6 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="country" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Country</Label>
                                <Select onValueChange={value => setData('country', value)} value={data.country}>
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
                                {errors.country && <p className="text-[10px] text-destructive font-bold ml-1">{errors.country}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="city" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">City / Town</Label>
                                <div className="relative">
                                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input 
                                        id="city" 
                                        className="h-12 pl-11 rounded-xl border-muted-foreground/20 bg-muted/5 focus:bg-background transition-colors font-bold"
                                        value={data.city} 
                                        onChange={e => setData('city', e.target.value)} 
                                        placeholder="e.g. Madrid"
                                    />
                                </div>
                                {errors.city && <p className="text-[10px] text-destructive font-bold ml-1">{errors.city}</p>}
                            </div>
                        </div>

                        <Button type="submit" className="w-full h-14 rounded-2xl font-black italic uppercase tracking-[0.1em] text-lg shadow-xl shadow-primary/20 hover:scale-[1.02] transition-transform mt-4" disabled={processing}>
                            FINISH SETUP & EXPLORE
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}

