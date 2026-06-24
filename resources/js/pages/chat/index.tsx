import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Search, MessageSquare, ShieldCheck, CheckCheck, Unlock } from 'lucide-react';
import { useState, useEffect } from 'react';
import { echo } from '@laravel/echo-react';
import { show } from '@/routes/chat';
import { motion } from 'framer-motion';

interface Conversation {
    id: number;
    initiator_id: number;
    recipient_id: number;
    is_paid: boolean;
    initiator: { id: number; name: string; role: string };
    recipient: { id: number; name: string; role: string };
    unread_count?: number;
    latest_message?: {
        body: string;
        type: string;
        created_at: string;
        sender_id: number;
        read_at: string | null;
    };
}

interface Props {
    conversations: Conversation[];
    auth: any;
}

export default function ChatIndex({ conversations, auth }: Props) {
    const [searchQuery, setSearchQuery] = useState('');
    const [conversationsList, setConversationsList] = useState<Conversation[]>(conversations);
    const echoInstance = echo();

    // Sync conversations props changes from Inertia
    useEffect(() => {
        setConversationsList(conversations);
    }, [conversations]);

    // Keyboard shortcut / focus search
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
                e.preventDefault();
                document.getElementById('search-chats')?.focus();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const playNotificationSound = () => {
        try {
            const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
            
            // First chime
            const osc1 = ctx.createOscillator();
            const gain1 = ctx.createGain();
            osc1.connect(gain1);
            gain1.connect(ctx.destination);
            osc1.type = 'sine';
            osc1.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
            gain1.gain.setValueAtTime(0.08, ctx.currentTime);
            gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
            osc1.start();
            osc1.stop(ctx.currentTime + 0.35);
            
            // Second chime (higher pitch)
            setTimeout(() => {
                const osc2 = ctx.createOscillator();
                const gain2 = ctx.createGain();
                osc2.connect(gain2);
                gain2.connect(ctx.destination);
                osc2.type = 'sine';
                osc2.frequency.setValueAtTime(880, ctx.currentTime); // A5
                gain2.gain.setValueAtTime(0.08, ctx.currentTime);
                gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
                osc2.start();
                osc2.stop(ctx.currentTime + 0.35);
            }, 80);
        } catch (e) {
            console.error('AudioContext error playing notification:', e);
        }
    };

    // WebSocket / Broadcast listeners for unread counts
    useEffect(() => {
        if (!echoInstance) return;

        const activeChannels = conversationsList.map((conv) => {
            const channel = echoInstance.private(`chat.${conv.id}`)
                .listen('.message.sent', (e: { message: any }) => {
                    // Only play sound and update count if the message is from the other user
                    if (e.message.sender_id !== auth.user.id) {
                        playNotificationSound();

                        setConversationsList((prevList) => {
                            return prevList.map((c) => {
                                if (c.id === conv.id) {
                                    return {
                                        ...c,
                                        unread_count: (c.unread_count || 0) + 1,
                                        latest_message: {
                                            body: e.message.body,
                                            type: e.message.type,
                                            created_at: e.message.created_at,
                                            sender_id: e.message.sender_id,
                                            read_at: null,
                                        }
                                    };
                                }
                                return c;
                            });
                        });
                    } else {
                        // Update latest message if sent by me in another tab/device
                        setConversationsList((prevList) => {
                            return prevList.map((c) => {
                                if (c.id === conv.id) {
                                    return {
                                        ...c,
                                        latest_message: {
                                            body: e.message.body,
                                            type: e.message.type,
                                            created_at: e.message.created_at,
                                            sender_id: e.message.sender_id,
                                            read_at: null,
                                        }
                                    };
                                }
                                return c;
                            });
                        });
                    }
                });
            return { channel, id: conv.id };
        });

        return () => {
            activeChannels.forEach((ch) => {
                echoInstance.leave(`chat.${ch.id}`);
            });
        };
    }, [echoInstance, conversations]);

    const filteredConversations = conversationsList.filter((conversation) => {
        const otherUser = auth.user.id === conversation.initiator_id 
            ? conversation.recipient 
            : conversation.initiator;
        return otherUser.name.toLowerCase().includes(searchQuery.toLowerCase());
    });

    const formatTime = (dateString?: string) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
        const compareDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

        const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        if (compareDate.getTime() === today.getTime()) {
            return `Today at ${timeStr}`;
        } else if (compareDate.getTime() === yesterday.getTime()) {
            return `Yesterday at ${timeStr}`;
        } else {
            return `${date.toLocaleDateString()} ${timeStr}`;
        }
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Messages', href: '/chat' }]}>
            <Head title="Conversations" />
            
            <div className="flex-1 flex flex-col h-[calc(100vh-140px)] max-w-4xl mx-auto w-full p-4 lg:p-8 text-left">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                    <div className="relative pl-0 md:pl-4">
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-full hidden md:block shadow-[0_0_10px_rgba(var(--primary),0.5)]"></div>
                        <h1 className="text-3xl font-black italic uppercase tracking-tight bg-gradient-to-r from-foreground via-foreground/90 to-primary/80 bg-clip-text text-transparent">
                            MESSAGES
                        </h1>
                        <p className="text-muted-foreground/80 text-sm font-medium mt-0.5">Keep track of your scout talks and player inquiries.</p>
                    </div>
                </div>

                <div className="relative mb-6 group">
                    <Search className="absolute left-4 top-3.5 h-4.5 w-4.5 text-muted-foreground/60 transition-colors duration-200 group-focus-within:text-primary" />
                    <Input
                        id="search-chats"
                        type="text"
                        placeholder="Search conversations..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-11 pr-12 h-12 rounded-2xl border-muted-foreground/15 focus-visible:ring-1 focus-visible:ring-primary/30 focus-visible:border-primary shadow-xs bg-card/85 transition-all duration-300 placeholder:text-muted-foreground/40 hover:border-muted-foreground/25 focus-within:shadow-[0_0_15px_rgba(var(--primary),0.04)]"
                    />
                    <div className="absolute right-4 top-3.5 hidden sm:flex items-center gap-0.5 px-1.5 py-0.5 rounded border border-muted-foreground/20 bg-muted/60 text-[10px] font-mono text-muted-foreground/50 select-none shadow-2xs">
                        <span>/</span>
                    </div>
                </div>

                <Card className="flex-1 flex flex-col overflow-hidden border border-muted-foreground/15 shadow-xl rounded-3xl bg-card/70 backdrop-blur-xs transition-all duration-300">
                    <CardHeader className="border-b border-muted-foreground/10 bg-muted/20 py-4 px-6 flex flex-row items-center justify-between">
                        <CardTitle className="text-lg font-bold flex items-center gap-2 text-foreground tracking-wide">
                            <MessageSquare className="h-5 w-5 text-primary" /> Active Chats
                        </CardTitle>
                    </CardHeader>
                    
                    <CardContent className="flex-1 overflow-y-auto p-0 divide-y divide-muted-foreground/10">
                        {filteredConversations.length > 0 ? (
                            <motion.div 
                                className="divide-y divide-muted-foreground/10"
                                initial="hidden"
                                animate="show"
                                variants={{
                                    hidden: { opacity: 0 },
                                    show: {
                                        opacity: 1,
                                        transition: {
                                            staggerChildren: 0.03
                                        }
                                    }
                                }}
                            >
                                {filteredConversations.map((conversation) => {
                                    const otherUser = auth.user.id === conversation.initiator_id 
                                        ? conversation.recipient 
                                        : conversation.initiator;

                                    const isLatestFromMe = conversation.latest_message?.sender_id === auth.user.id;
                                    const isUnread = !isLatestFromMe && conversation.unread_count && conversation.unread_count > 0;

                                    return (
                                        <motion.div
                                            key={conversation.id}
                                            variants={{
                                                hidden: { opacity: 0, y: 6 },
                                                show: { opacity: 1, y: 0 }
                                            }}
                                            transition={{ type: "spring", stiffness: 260, damping: 20 }}
                                        >
                                            <Link 
                                                href={show(conversation.id).url}
                                                className={`flex items-center gap-4 p-4 lg:p-6 transition-all duration-300 relative overflow-hidden group hover:bg-muted/40 ${
                                                    isUnread ? 'bg-primary/5 hover:bg-primary/8' : ''
                                                }`}
                                            >
                                                {/* Left border active highlight indicator */}
                                                <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-1.5 rounded-r-full bg-primary transition-all duration-300 ${
                                                    isUnread ? 'h-1/2' : 'h-0 group-hover:h-1/3'
                                                }`} />

                                                <div className="relative shrink-0">
                                                    <Avatar className="h-12 w-12 border border-muted-foreground/10 shadow-sm transition-transform duration-300 group-hover:scale-102">
                                                        <AvatarImage src={otherUser.avatar_path} />
                                                        <AvatarFallback className="bg-primary/10 text-primary font-bold text-base">
                                                            {otherUser.name[0]}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    {isUnread && (
                                                        <span className="absolute -top-0.5 -right-0.5 h-3.5 w-3.5 bg-primary border-2 border-card rounded-full animate-pulse shadow-sm shadow-primary/30" />
                                                    )}
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <div className="flex justify-between items-baseline mb-1">
                                                        <h3 className={`font-bold truncate text-base transition-colors duration-200 group-hover:text-primary ${isUnread ? 'text-primary' : 'text-foreground'}`}>
                                                            {otherUser.name}
                                                        </h3>
                                                        <span className="text-[10px] font-semibold text-muted-foreground/80 whitespace-nowrap font-mono">
                                                            {formatTime(conversation.latest_message?.created_at)}
                                                        </span>
                                                    </div>

                                                    <div className="flex justify-between items-center gap-2">
                                                        <p className={`text-sm truncate flex-1 transition-colors duration-200 ${
                                                            isUnread 
                                                                ? 'text-foreground font-semibold' 
                                                                : 'text-muted-foreground/90 group-hover:text-foreground/80'
                                                        }`}>
                                                            {isLatestFromMe && (
                                                                <span className="inline-flex mr-1.5 align-middle text-primary/80">
                                                                    <CheckCheck className="h-4 w-4" />
                                                                </span>
                                                            )}
                                                            {conversation.latest_message ? (
                                                                conversation.latest_message.type === 'voice' 
                                                                    ? '🎤 Voice note' 
                                                                    : conversation.latest_message.body
                                                            ) : (
                                                                <span className="italic text-muted-foreground/60">No messages yet.</span>
                                                            )}
                                                        </p>

                                                        {/* Unread badge or Paid indicator */}
                                                        <div className="flex items-center gap-2 shrink-0">
                                                            {conversation.is_paid && (
                                                                <span className="inline-flex items-center gap-1 text-[9px] bg-gradient-to-r from-emerald-500/10 to-teal-500/10 text-emerald-600 dark:text-emerald-400 px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider scale-95 border border-emerald-500/20 shadow-2xs">
                                                                    <Unlock className="h-2.5 w-2.5" /> Unlocked
                                                                </span>
                                                            )}
                                                            {isUnread && (
                                                                <span className="h-5 min-w-5 px-1.5 bg-primary text-primary-foreground text-[10px] font-black rounded-full flex items-center justify-center shadow-md shadow-primary/25 transition-transform duration-200 group-hover:scale-105">
                                                                    {conversation.unread_count}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </Link>
                                        </motion.div>
                                    );
                                })}
                            </motion.div>
                        ) : (
                            <div className="flex flex-col items-center justify-center p-16 text-center text-muted-foreground h-full space-y-4 opacity-75">
                                <div className="p-4 rounded-full bg-muted/30 border border-muted-foreground/5">
                                    <MessageSquare className="h-10 w-10 text-muted-foreground/60" />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-lg font-bold text-foreground">No active conversations found.</p>
                                    <p className="text-sm text-muted-foreground/80">Select a user profile to start chatting.</p>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
