import { Link, router } from '@inertiajs/react';
import { LogOut, Settings, Moon, Sun, Monitor } from 'lucide-react';
import {
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuPortal,
} from '@/components/ui/dropdown-menu';
import { UserInfo } from '@/components/user-info';
import { useMobileNavigation } from '@/hooks/use-mobile-navigation';
import { useAppearance } from '@/hooks/use-appearance';
import { logout } from '@/routes';
import { edit } from '@/routes/profile';
import type { User } from '@/types';

type Props = {
    user: User;
};

export function UserMenuContent({ user }: Props) {
    const cleanup = useMobileNavigation();
    const { appearance, updateAppearance } = useAppearance();

    const handleLogout = () => {
        cleanup();
        router.flushAll();
    };

    return (
        <>
            <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <UserInfo user={user} showEmail={true} />
                </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
                <DropdownMenuSub>
                    <DropdownMenuSubTrigger className="cursor-pointer">
                        {appearance === 'light' && <Sun className="mr-2" />}
                        {appearance === 'dark' && <Moon className="mr-2" />}
                        {appearance === 'system' && <Monitor className="mr-2" />}
                        Theme
                    </DropdownMenuSubTrigger>
                    <DropdownMenuPortal>
                        <DropdownMenuSubContent>
                            <DropdownMenuItem onClick={() => updateAppearance('light')} className="cursor-pointer">
                                <Sun className="mr-2 h-4 w-4" /> Light
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => updateAppearance('dark')} className="cursor-pointer">
                                <Moon className="mr-2 h-4 w-4" /> Dark
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => updateAppearance('system')} className="cursor-pointer">
                                <Monitor className="mr-2 h-4 w-4" /> System
                            </DropdownMenuItem>
                        </DropdownMenuSubContent>
                    </DropdownMenuPortal>
                </DropdownMenuSub>
                <DropdownMenuItem asChild>
                    <Link
                        className="block w-full cursor-pointer"
                        href={edit()}
                        prefetch
                        onClick={cleanup}
                    >
                        <Settings className="mr-2" />
                        Settings
                    </Link>
                </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
                <Link
                    className="block w-full cursor-pointer"
                    href={logout()}
                    as="button"
                    onClick={handleLogout}
                    data-test="logout-button"
                >
                    <LogOut className="mr-2" />
                    Log out
                </Link>
            </DropdownMenuItem>
        </>
    );
}
