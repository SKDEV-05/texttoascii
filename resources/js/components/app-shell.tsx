import type { ReactNode } from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';

type Props = {
    children: ReactNode;
};

export function AppShell({ children }: Props) {
    return (
        <SidebarProvider defaultOpen={false} style={{ '--sidebar-width': '16rem', '--sidebar-width-icon': '5.5rem' } as React.CSSProperties}>
            {children}
        </SidebarProvider>
    );
}
