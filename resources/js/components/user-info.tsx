import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useInitials } from '@/hooks/use-initials';
import type { User } from '@/types';

export function UserInfo({
    user,
    showEmail = false,
    isSlim = false,
}: {
    user: User;
    showEmail?: boolean;
    isSlim?: boolean;
}) {
    const getInitials = useInitials();

    return (
        <div className="flex items-center gap-2.5 min-w-0 flex-1 justify-center">
            <div className="relative shrink-0">
                <Avatar className="h-8 w-8 overflow-hidden rounded-full border border-muted-foreground/15 shadow-2xs">
                    <AvatarImage src={user.avatar_path || user.avatar} alt={user.name} />
                    <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                        {getInitials(user.name)}
                    </AvatarFallback>
                </Avatar>
                <span className="absolute bottom-0 right-0 h-2 w-2 bg-emerald-500 border border-card rounded-full" />
            </div>
            {!isSlim && (
                <div className="grid flex-1 text-left text-sm leading-tight min-w-0">
                    <span className="truncate font-semibold text-foreground group-hover:text-primary transition-colors duration-200">{user.name}</span>
                    {showEmail && (
                        <span className="truncate text-[10px] text-muted-foreground font-mono mt-0.5">
                            {user.email}
                        </span>
                    )}
                </div>
            )}
        </div>
    );
}
