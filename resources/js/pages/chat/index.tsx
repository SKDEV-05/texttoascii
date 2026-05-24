import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Search, MessageSquare, ShieldCheck, CheckCheck } from 'lucide-react';
import { useState, useEffect } from 'react';
import { echo } from '@laravel/echo-react';
import { show } from '@/routes/chat';

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
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Messages', href: '/chat' }]}>
            <Head title="Conversations" />
            
            <div className="flex-1 flex flex-col h-[calc(100vh-140px)] max-w-4xl mx-auto w-full p-4 lg:p-8 text-left">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                    <div>
                        <h1 className="text-3xl font-black italic uppercase tracking-tight">MESSAGES</h1>
                        <p className="text-muted-foreground text-sm font-medium">Keep track of your scout talks and player inquiries.</p>
                    </div>
                </div>

                <div className="relative mb-6">
                    <Search className="absolute left-4 top-3.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="text"
                        placeholder="Search conversations..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-11 h-12 rounded-2xl border-muted-foreground/20 focus-visible:ring-primary shadow-sm bg-card"
                    />
                </div>

                <Card className="flex-1 flex flex-col overflow-hidden border-muted-foreground/20 shadow-lg rounded-3xl bg-card">
                    <CardHeader className="border-b bg-muted/10 py-4 px-6 flex flex-row items-center justify-between">
                        <CardTitle className="text-lg font-bold flex items-center gap-2">
                            <MessageSquare className="h-5 w-5 text-primary" /> Active Chats
                        </CardTitle>
                    </CardHeader>
                    
                    <CardContent className="flex-1 overflow-y-auto p-0 divide-y divide-muted-foreground/10">
                        {filteredConversations.length > 0 ? (
                            filteredConversations.map((conversation) => {
                                const otherUser = auth.user.id === conversation.initiator_id 
                                    ? conversation.recipient 
                                    : conversation.initiator;

                                const isLatestFromMe = conversation.latest_message?.sender_id === auth.user.id;
                                const isUnread = !isLatestFromMe && conversation.unread_count && conversation.unread_count > 0;

                                return (
                                    <Link 
                                        key={conversation.id} 
                                        href={show(conversation.id).url}
                                        className={`flex items-center gap-4 p-4 lg:p-6 hover:bg-muted/50 transition-colors ${
                                            isUnread ? 'bg-primary/5 hover:bg-primary/10' : ''
                                        }`}
                                    >
                                        <Avatar className="h-12 w-12 border border-muted-foreground/10 shadow-sm relative">
                                            <AvatarFallback className="bg-primary/10 text-primary font-bold text-base">
                                                {otherUser.name[0]}
                                            </AvatarFallback>
                                        </Avatar>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-baseline mb-1">
                                                <h3 className={`font-bold truncate text-base ${isUnread ? 'text-primary' : 'text-foreground'}`}>
                                                    {otherUser.name}
                                                </h3>
                                                <span className="text-[10px] font-medium text-muted-foreground whitespace-nowrap">
                                                    {formatTime(conversation.latest_message?.created_at)}
                                                </span>
                                            </div>

                                            <div className="flex justify-between items-center gap-2">
                                                <p className={`text-sm truncate flex-1 ${
                                                    isUnread 
                                                        ? 'text-foreground font-semibold' 
                                                        : 'text-muted-foreground'
                                                }`}>
                                                    {isLatestFromMe && (
                                                        <span className="inline-flex mr-1 align-middle text-primary">
                                                            <CheckCheck className="h-4 w-4" />
                                                        </span>
                                                    )}
                                                    {conversation.latest_message ? (
                                                        conversation.latest_message.type === 'voice' 
                                                            ? '🎤 Voice note' 
                                                            : conversation.latest_message.body
                                                    ) : (
                                                        'No messages yet.'
                                                    )}
                                                </p>

                                                {/* Unread badge or Paid indicator */}
                                                <div className="flex items-center gap-1.5 shrink-0">
                                                    {conversation.is_paid && (
                                                        <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider scale-90 border border-primary/25">
                                                            Unlocked
                                                        </span>
                                                    )}
                                                    {isUnread && (
                                                        <span className="h-5 min-w-5 px-1 bg-primary text-primary-foreground text-[10px] font-black rounded-full flex items-center justify-center shadow-md shadow-primary/20">
                                                            {conversation.unread_count}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })
                        ) : (
                            <div className="flex flex-col items-center justify-center p-16 text-center text-muted-foreground h-full space-y-3 opacity-60">
                                <MessageSquare className="h-12 w-12 text-muted-foreground" />
                                <p className="text-lg font-bold">No active conversations found.</p>
                                <p className="text-sm text-muted-foreground">Select a user profile to start chatting.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
