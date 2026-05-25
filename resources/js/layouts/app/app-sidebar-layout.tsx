import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { AppSidebar } from '@/components/app-sidebar';
import { AppSidebarHeader } from '@/components/app-sidebar-header';
import type { AppLayoutProps } from '@/types';
import { useState } from 'react';

export default function AppSidebarLayout({
    children,
    breadcrumbs = [],
    hideHeader = false,
    contentClassName = '',
}: AppLayoutProps & { hideHeader?: boolean; contentClassName?: string }) {
    const [variant, setVariantState] = useState<'sidebar' | 'floating' | 'inset'>(
        () => (localStorage.getItem('layout_variant') as any) || 'sidebar'
    );
    const [collapsible, setCollapsibleState] = useState<'icon' | 'offcanvas' | 'none'>(
        () => (localStorage.getItem('layout_collapsible') as any) || 'icon'
    );
    const [side, setSideState] = useState<'left' | 'right'>(
        () => (localStorage.getItem('layout_side') as any) || 'left'
    );

    const setVariant = (v: 'sidebar' | 'floating' | 'inset') => {
        localStorage.setItem('layout_variant', v);
        setVariantState(v);
    };

    const setCollapsible = (c: 'icon' | 'offcanvas' | 'none') => {
        localStorage.setItem('layout_collapsible', c);
        setCollapsibleState(c);
    };

    const setSide = (s: 'left' | 'right') => {
        localStorage.setItem('layout_side', s);
        setSideState(s);
    };

    return (
        <AppShell>
            {side === 'left' && <AppSidebar variant={variant} collapsible={collapsible} side={side} />}
            <AppContent variant="sidebar" className={`overflow-x-hidden ${contentClassName}`}>
                {!hideHeader && (
                    <AppSidebarHeader 
                        breadcrumbs={breadcrumbs} 
                        layoutCustomizer={{
                            variant,
                            setVariant,
                            collapsible,
                            setCollapsible,
                            side,
                            setSide
                        }}
                    />
                )}
                {children}
            </AppContent>
            {side === 'right' && <AppSidebar variant={variant} collapsible={collapsible} side={side} />}
        </AppShell>
    );
}
