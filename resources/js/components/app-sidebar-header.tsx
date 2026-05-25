import { Breadcrumbs } from '@/components/breadcrumbs';
import type { BreadcrumbItem as BreadcrumbItemType } from '@/types';
import { SidebarTrigger } from '@/components/ui/sidebar';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Settings2 } from 'lucide-react';

interface LayoutCustomizerProps {
    variant: 'sidebar' | 'floating' | 'inset';
    setVariant: (v: 'sidebar' | 'floating' | 'inset') => void;
    collapsible: 'icon' | 'offcanvas' | 'none';
    setCollapsible: (c: 'icon' | 'offcanvas' | 'none') => void;
    side: 'left' | 'right';
    setSide: (s: 'left' | 'right') => void;
}

export function AppSidebarHeader({
    breadcrumbs = [],
    layoutCustomizer,
}: {
    breadcrumbs?: BreadcrumbItemType[];
    layoutCustomizer?: LayoutCustomizerProps;
}) {
    return (
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-sidebar-border/50 px-6 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 md:px-4 w-full">
            <div className="flex items-center gap-2">
                <SidebarTrigger className="-ml-1 h-9 w-9 hover:bg-zinc-100 rounded-full" />
                <Breadcrumbs breadcrumbs={breadcrumbs} />
            </div>

            {layoutCustomizer && (
                <Sheet>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-10 w-10 hover:bg-zinc-100 rounded-full shrink-0 border border-zinc-200 bg-white shadow-sm transition-all hover:scale-105 active:scale-95">
                            <Settings2 className="h-5 w-5 text-zinc-600 animate-hover-spin" />
                            <span className="sr-only">Customize Layout</span>
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="right" className="w-[340px] sm:w-[400px] rounded-l-3xl border-l border-zinc-200/80 shadow-2xl bg-white p-6 text-left flex flex-col justify-between z-50">
                        <div className="space-y-6">
                            <SheetHeader className="space-y-1">
                                <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-2">
                                    <Settings2 className="h-5 w-5" />
                                </div>
                                <SheetTitle className="text-2xl font-black italic uppercase tracking-tight text-zinc-950">
                                    Workspace Layout
                                </SheetTitle>
                                <SheetDescription className="text-zinc-500 text-xs font-medium">
                                    Customize your EndoTalent sidebar positions, style variants, and responsive collapse modes.
                                </SheetDescription>
                            </SheetHeader>

                            <hr className="border-zinc-100" />

                            {/* Sidebar Position section */}
                            <div className="space-y-3">
                                <label className="text-[11px] font-black uppercase tracking-widest text-zinc-400">
                                    Sidebar Position
                                </label>
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        onClick={() => layoutCustomizer.setSide('left')}
                                        className={`flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all cursor-pointer ${
                                            layoutCustomizer.side === 'left'
                                                ? 'border-primary bg-primary/5 text-primary'
                                                : 'border-zinc-150 hover:border-zinc-300 text-zinc-600 hover:bg-zinc-50'
                                        }`}
                                    >
                                        {/* Visual Left Sidebar schema */}
                                        <div className="h-10 w-16 border border-current rounded-md p-0.5 flex gap-0.5 mb-2 opacity-80">
                                            <div className="w-1.5 h-full bg-current rounded-sm" />
                                            <div className="flex-1 h-full border border-dashed border-current/45 rounded-sm" />
                                        </div>
                                        <span className="text-xs font-extrabold uppercase tracking-wider">Left Side</span>
                                    </button>

                                    <button
                                        onClick={() => layoutCustomizer.setSide('right')}
                                        className={`flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all cursor-pointer ${
                                            layoutCustomizer.side === 'right'
                                                ? 'border-primary bg-primary/5 text-primary'
                                                : 'border-zinc-150 hover:border-zinc-300 text-zinc-600 hover:bg-zinc-50'
                                        }`}
                                    >
                                        {/* Visual Right Sidebar schema */}
                                        <div className="h-10 w-16 border border-current rounded-md p-0.5 flex gap-0.5 mb-2 opacity-80">
                                            <div className="flex-1 h-full border border-dashed border-current/45 rounded-sm" />
                                            <div className="w-1.5 h-full bg-current rounded-sm" />
                                        </div>
                                        <span className="text-xs font-extrabold uppercase tracking-wider">Right Side</span>
                                    </button>
                                </div>
                            </div>

                            {/* Sidebar Style Section */}
                            <div className="space-y-3">
                                <label className="text-[11px] font-black uppercase tracking-widest text-zinc-400">
                                    Sidebar Style
                                </label>
                                <div className="grid grid-cols-3 gap-2">
                                    <button
                                        onClick={() => layoutCustomizer.setVariant('sidebar')}
                                        className={`flex flex-col items-center justify-center p-2 rounded-xl border-2 transition-all text-center cursor-pointer ${
                                            layoutCustomizer.variant === 'sidebar'
                                                ? 'border-primary bg-primary/5 text-primary'
                                                : 'border-zinc-150 hover:border-zinc-300 text-zinc-600 hover:bg-zinc-50'
                                        }`}
                                    >
                                        <div className="h-8 w-12 border border-current rounded-md flex gap-0.5 mb-1.5 opacity-80 p-0.5">
                                            <div className="w-1.5 h-full bg-current rounded-sm" />
                                            <div className="flex-1 h-full bg-zinc-200/50 rounded-sm" />
                                        </div>
                                        <span className="text-[9px] font-black uppercase tracking-tight">Default</span>
                                    </button>

                                    <button
                                        onClick={() => layoutCustomizer.setVariant('floating')}
                                        className={`flex flex-col items-center justify-center p-2 rounded-xl border-2 transition-all text-center cursor-pointer ${
                                            layoutCustomizer.variant === 'floating'
                                                ? 'border-primary bg-primary/5 text-primary'
                                                : 'border-zinc-150 hover:border-zinc-300 text-zinc-600 hover:bg-zinc-50'
                                        }`}
                                    >
                                        <div className="h-8 w-12 border border-current rounded-md flex gap-0.5 mb-1.5 opacity-80 p-0.5 items-center justify-between">
                                            <div className="w-1.5 h-[80%] bg-current rounded-sm ml-0.5" />
                                            <div className="flex-1 h-[80%] bg-zinc-200/50 rounded-sm mx-0.5" />
                                        </div>
                                        <span className="text-[9px] font-black uppercase tracking-tight">Floating</span>
                                    </button>

                                    <button
                                        onClick={() => layoutCustomizer.setVariant('inset')}
                                        className={`flex flex-col items-center justify-center p-2 rounded-xl border-2 transition-all text-center cursor-pointer ${
                                            layoutCustomizer.variant === 'inset'
                                                ? 'border-primary bg-primary/5 text-primary'
                                                : 'border-zinc-150 hover:border-zinc-300 text-zinc-600 hover:bg-zinc-50'
                                        }`}
                                    >
                                        <div className="h-8 w-12 border border-current rounded-md flex gap-0.5 mb-1.5 opacity-80 p-0.5 items-stretch">
                                            <div className="w-1.5 h-full bg-current rounded-sm" />
                                            <div className="flex-1 h-[90%] border border-current rounded-sm m-0.5 bg-zinc-200/50" />
                                        </div>
                                        <span className="text-[9px] font-black uppercase tracking-tight">Inset</span>
                                    </button>
                                </div>
                            </div>

                            {/* Collapse Behavior Section */}
                            <div className="space-y-3">
                                <label className="text-[11px] font-black uppercase tracking-widest text-zinc-400">
                                    Sidebar Collapse Mode
                                </label>
                                <div className="grid grid-cols-3 gap-2">
                                    <button
                                        onClick={() => layoutCustomizer.setCollapsible('icon')}
                                        className={`flex flex-col items-center justify-center p-2 rounded-xl border-2 transition-all text-center cursor-pointer ${
                                            layoutCustomizer.collapsible === 'icon'
                                                ? 'border-primary bg-primary/5 text-primary'
                                                : 'border-zinc-150 hover:border-zinc-300 text-zinc-600 hover:bg-zinc-50'
                                        }`}
                                    >
                                        <span className="text-[10px] font-black uppercase tracking-tight">Icons</span>
                                    </button>

                                    <button
                                        onClick={() => layoutCustomizer.setCollapsible('offcanvas')}
                                        className={`flex flex-col items-center justify-center p-2 rounded-xl border-2 transition-all text-center cursor-pointer ${
                                            layoutCustomizer.collapsible === 'offcanvas'
                                                ? 'border-primary bg-primary/5 text-primary'
                                                : 'border-zinc-150 hover:border-zinc-300 text-zinc-600 hover:bg-zinc-50'
                                        }`}
                                    >
                                        <span className="text-[10px] font-black uppercase tracking-tight">Hidden</span>
                                    </button>

                                    <button
                                        onClick={() => layoutCustomizer.setCollapsible('none')}
                                        className={`flex flex-col items-center justify-center p-2 rounded-xl border-2 transition-all text-center cursor-pointer ${
                                            layoutCustomizer.collapsible === 'none'
                                                ? 'border-primary bg-primary/5 text-primary'
                                                : 'border-zinc-150 hover:border-zinc-300 text-zinc-600 hover:bg-zinc-50'
                                        }`}
                                    >
                                        <span className="text-[10px] font-black uppercase tracking-tight">Always Open</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-zinc-100 mt-auto text-center">
                            <span className="text-[10px] font-bold text-zinc-400">
                                EndoTalent Customizer v2.0
                            </span>
                        </div>
                    </SheetContent>
                </Sheet>
            )}
        </header>
    );
}
