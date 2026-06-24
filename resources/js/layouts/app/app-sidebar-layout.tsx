import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { AppSidebar } from '@/components/app-sidebar';
import { AppSidebarHeader } from '@/components/app-sidebar-header';
import type { AppLayoutProps } from '@/types';

export default function AppSidebarLayout({
    children,
    breadcrumbs = [],
    hideHeader = false,
    contentClassName = '',
}: AppLayoutProps & { hideHeader?: boolean; contentClassName?: string }) {
    return (
        <AppShell>
            <AppSidebar variant="sidebar" collapsible="icon" side="left" />
            <AppContent variant="sidebar" className={`overflow-x-hidden ${contentClassName}`}>
                {!hideHeader && (
                    <AppSidebarHeader 
                        breadcrumbs={breadcrumbs} 
                    />
                )}
                {children}
            </AppContent>
        </AppShell>
    );
}
