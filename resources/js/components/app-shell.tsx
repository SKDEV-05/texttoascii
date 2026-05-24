import type { ReactNode } from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';

type Props = {
    children: ReactNode;
};

export function AppShell({ children }: Props) {
    return (
        <SidebarProvider defaultOpen={true} style={{ '--sidebar-width': '19rem' } as React.CSSProperties}>
            {children}
        </SidebarProvider>
    );
}
