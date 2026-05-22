import { Trophy } from 'lucide-react';
import type { SVGAttributes } from 'react';

export default function AppLogoIcon(props: SVGAttributes<SVGElement>) {
    return (
        <Trophy {...(props as any)} />
    );
}
