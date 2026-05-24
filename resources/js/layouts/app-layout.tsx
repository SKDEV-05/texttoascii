import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import type { BreadcrumbItem } from '@/types';

export default function AppLayout({
    breadcrumbs = [],
    children,
    hideHeader = false,
    contentClassName = '',
}: {
    breadcrumbs?: BreadcrumbItem[];
    children: React.ReactNode;
    hideHeader?: boolean;
    contentClassName?: string;
}) {
    return (
        <AppSidebarLayout breadcrumbs={breadcrumbs} hideHeader={hideHeader} contentClassName={contentClassName}>
            {children}
        </AppSidebarLayout>
    );
}
