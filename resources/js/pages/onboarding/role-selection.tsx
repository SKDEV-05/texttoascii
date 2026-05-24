import { Head, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Users, ShieldCheck, Trophy } from 'lucide-react';
import { selectRole } from '@/actions/App/Http/Controllers/OnboardingController';

export default function RoleSelection() {
    const { data, setData, post, processing } = useForm({
        role: '',
    });

    const roles = [
        {
            id: 'talent',
            title: 'Talent',
            description: 'I am a player looking to showcase my skills.',
            icon: User,
        },
        {
            id: 'parent',
            title: 'Parent',
            description: 'I am a parent managing a talent profile.',
            icon: Users,
        },
        {
            id: 'scout_club',
            title: 'Scout / Club',
            description: 'I am looking for new talents for my team or agency.',
            icon: ShieldCheck,
        },
    ];

    const handleSubmit = (roleId: string) => {
        setData('role', roleId);
        post(selectRole.url(), {
            onBefore: () => setData('role', roleId),
        });
    };

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6 lg:p-10 font-sans">
            <Head title="Select Your Role" />
            <div className="w-full max-w-5xl space-y-12 text-center">
                <div className="space-y-4">
                    <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-primary/10 text-primary mb-2">
                        <Trophy className="h-8 w-8" />
                    </div>
                    <h1 className="text-4xl font-black tracking-tight lg:text-5xl italic uppercase">Welcome to BayanMawhibtik</h1>
                    <p className="mx-auto max-w-2xl text-lg text-muted-foreground font-medium">
                        Your professional football journey starts here. Please select your profile type to continue.
                    </p>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                    {roles.map((role) => {
                        const Icon = role.icon;
                        const isSelected = data.role === role.id;
                        return (
                            <Card 
                                key={role.id} 
                                className={`group cursor-pointer transition-all duration-300 border-2 rounded-3xl overflow-hidden text-left ${isSelected ? 'border-primary shadow-2xl scale-105 bg-primary/5' : 'border-muted-foreground/10 hover:border-primary/50 hover:shadow-xl hover:-translate-y-1'}`}
                                onClick={() => !processing && handleSubmit(role.id)}
                            >
                                <CardHeader className="p-8">
                                    <div className={`mb-6 flex h-14 w-14 items-center justify-center rounded-2xl transition-colors ${isSelected ? 'bg-primary text-white' : 'bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white'}`}>
                                        <Icon className="h-7 w-7" />
                                    </div>
                                    <CardTitle className="text-2xl font-black italic uppercase tracking-tight">{role.title}</CardTitle>
                                    <CardDescription className="text-sm font-medium leading-relaxed mt-2">{role.description}</CardDescription>
                                </CardHeader>
                                <CardContent className="p-8 pt-0">
                                    <Button 
                                        className={`w-full h-12 rounded-xl font-bold uppercase tracking-widest text-xs transition-all ${isSelected ? 'bg-primary' : 'bg-transparent border-2 border-primary text-primary group-hover:bg-primary group-hover:text-white'}`}
                                        variant={isSelected ? 'default' : 'outline'}
                                        disabled={processing}
                                    >
                                        Select {role.title}
                                    </Button>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
