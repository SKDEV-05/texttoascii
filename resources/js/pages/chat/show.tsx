import React, { useEffect, useState, useRef } from 'react';
import { Head, useForm, usePage, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { echo } from '@laravel/echo-react';
import { Phone, Video, Flag, Lock, Send, Check, CheckCheck, Coins } from 'lucide-react';
import axios from 'axios';
import { store as storeMessage, voice as voiceMessage, read as readMessage } from '@/routes/chat';
import { motion } from 'framer-motion';

// Subcomponents
import VoiceRecorder from './components/voice-recorder';
import VoicePlayer from './components/voice-player';
import CallModal from './components/call-modal';
import ReportDialog from './components/report-dialog';
import PaymentDialog from './components/payment-dialog';

interface Message {
    id: number;
    body: string;
    sender_id: number;
    sender: {
        name: string;
    };
    type: string;
    media_path?: string;
    duration?: number;
    read_at: string | null;
    created_at: string;
}

interface Conversation {
    id: number;
    initiator_id: number;
    recipient_id: number;
    is_paid: boolean;
    initiator: { id: number; name: string; role: string };
    recipient: { id: number; name: string; role: string };
}

interface Props {
    conversation: Conversation;
    messages: Message[];
    canSendMessage: boolean;
}

export default function ChatShow({ conversation, messages: initialMessages, canSendMessage }: Props) {
    const { auth } = usePage().props as any;
    const [messages, setMessages] = useState<Message[]>(initialMessages);
    const echoInstance = echo();

    // Dialog & Call states
    const [isPaymentOpen, setIsPaymentOpen] = useState(false);
    const [isReportOpen, setIsReportOpen] = useState(false);
    
    const [isCallOpen, setIsCallOpen] = useState(false);
    const [callType, setCallType] = useState<'voice' | 'video'>('voice');
    const [isIncomingCall, setIsIncomingCall] = useState(false);
    const [activeCallerName, setActiveCallerName] = useState('');

    const messagesEndRef = useRef<HTMLDivElement | null>(null);

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

    const { data, setData, post, processing, reset } = useForm({
        body: '',
    });

    // Auto mark read on load
    useEffect(() => {
        axios.post(readMessage(conversation.id).url);
    }, [conversation.id]);

    // WebSocket / Broadcast listeners
    useEffect(() => {
        if (!echoInstance) return;

        // Listen for new messages
        const chatChannel = echoInstance.private(`chat.${conversation.id}`)
            .listen('.message.sent', (e: { message: Message }) => {
                setMessages((prev) => {
                    // Prevent duplicate messages
                    if (prev.some(m => m.id === e.message.id)) return prev;
                    return [...prev, e.message];
                });

                // Auto mark as read if message is from the other user
                if (e.message.sender_id !== auth.user.id) {
                    playNotificationSound();
                    axios.post(readMessage(conversation.id).url);
                }
            });

        return () => {
            chatChannel.stopListening('.message.sent');
        };
    }, [echoInstance, conversation.id]);

    // Sync initial messages from Inertia
    useEffect(() => {
        setMessages(initialMessages);
        scrollToBottom();
    }, [initialMessages]);

    // Scroll to bottom helper
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleTextSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!canSendMessage) {
            setIsPaymentOpen(true);
            return;
        }

        post(storeMessage(conversation.id).url, {
            onSuccess: () => {
                reset('body');
            },
        });
    };

    const handleVoiceSend = (audioBlob: Blob, duration: number) => {
        if (!canSendMessage) {
            setIsPaymentOpen(true);
            return;
        }

        const formData = new FormData();
        formData.append('audio', audioBlob, 'voice.wav');
        formData.append('duration', duration.toString());

        router.post(voiceMessage(conversation.id).url, formData, {
            preserveScroll: true,
            onSuccess: () => {
                console.log('Voice message sent successfully');
            }
        });
    };

    const handleStartCall = (type: 'voice' | 'video') => {
        if (!canSendMessage) {
            setIsPaymentOpen(true);
            return;
        }
        setCallType(type);
        setIsIncomingCall(false);
        setIsCallOpen(true);
    };

    const otherUser = auth.user.id === conversation.initiator_id 
        ? conversation.recipient 
        : conversation.initiator;

    const formatTime = (dateString: string) => {
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
        <AppLayout breadcrumbs={[
            { title: 'Messages', href: '/chat' },
            { title: otherUser.name, href: `/chat/${conversation.id}` }
        ]}>
            <Head title={`Chat with ${otherUser.name}`} />

            <div className="flex-1 flex flex-col h-[calc(100vh-140px)] max-w-4xl mx-auto w-full p-4 lg:p-6 text-left animate-fade-in">
                <Card className="flex-1 flex flex-col overflow-hidden border border-muted-foreground/15 shadow-2xl rounded-3xl bg-card/85 backdrop-blur-xs transition-all duration-300">
                    {/* Header */}
                    <CardHeader className="border-b border-muted-foreground/10 bg-muted/15 py-4 px-6 flex flex-row items-center justify-between shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <Avatar className="h-10 w-10 border border-muted-foreground/10 shadow-xs transition-transform duration-300 hover:scale-105">
                                    <AvatarImage src={otherUser.avatar_path} />
                                    <AvatarFallback className="bg-primary/10 text-primary font-bold">
                                        {otherUser.name[0]}
                                    </AvatarFallback>
                                </Avatar>
                                <span className="absolute bottom-0 right-0 h-3 w-3 bg-emerald-500 border-2 border-card rounded-full shadow-xs" />
                            </div>
                            <div>
                                <h3 className="font-extrabold text-base text-foreground leading-tight">{otherUser.name}</h3>
                                <span className="inline-flex items-center mt-1.5 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-primary/10 text-primary border border-primary/20 leading-none select-none">
                                    {otherUser.role.replace('_', ' ')}
                                </span>
                            </div>
                        </div>

                        {/* Call and Report Controls */}
                        <div className="flex items-center gap-1.5">
                            <Button 
                                type="button" 
                                variant="ghost" 
                                size="icon"
                                onClick={() => handleStartCall('voice')}
                                className="h-10 w-10 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-full transition-all duration-200 active:scale-95 cursor-pointer"
                            >
                                <Phone className="h-4.5 w-4.5" />
                            </Button>
                            <Button 
                                type="button" 
                                variant="ghost" 
                                size="icon"
                                onClick={() => handleStartCall('video')}
                                className="h-10 w-10 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-full transition-all duration-200 active:scale-95 cursor-pointer"
                            >
                                <Video className="h-4.5 w-4.5" />
                            </Button>
                            <Button 
                                type="button" 
                                variant="ghost" 
                                size="icon"
                                onClick={() => setIsReportOpen(true)}
                                className="h-10 w-10 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full transition-all duration-200 active:scale-95 cursor-pointer"
                            >
                                <Flag className="h-4.5 w-4.5" />
                            </Button>
                        </div>
                    </CardHeader>

                    {/* Messages Body */}
                    <CardContent className="flex-1 overflow-y-auto p-6 bg-muted/3 flex flex-col gap-4 scrollbar-thin">
                        {messages.length > 0 ? (
                            <motion.div 
                                className="flex flex-col gap-3 flex-1 justify-end"
                                initial="hidden"
                                animate="show"
                                variants={{
                                    hidden: { opacity: 0 },
                                    show: {
                                        opacity: 1,
                                        transition: {
                                            staggerChildren: 0.02
                                        }
                                    }
                                }}
                            >
                                {messages.map((message) => {
                                    const isMe = message.sender_id === auth.user.id;
                                    return (
                                        <motion.div 
                                            key={message.id} 
                                            className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                                            variants={{
                                                hidden: { opacity: 0, y: 12, scale: 0.98 },
                                                show: { opacity: 1, y: 0, scale: 1 }
                                            }}
                                            transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                                        >
                                            <div className={`max-w-[78%] rounded-2xl px-4 py-2.5 shadow-xs transition-all ${
                                                isMe 
                                                    ? 'bg-gradient-to-br from-primary via-primary/95 to-primary/90 text-primary-foreground shadow-sm shadow-primary/10 rounded-tr-none' 
                                                    : 'bg-card border border-muted-foreground/10 text-foreground rounded-tl-none shadow-2xs'
                                            }`}>
                                                <p className="text-[9px] font-extrabold tracking-wide uppercase opacity-75 mb-1 leading-none select-none">
                                                    {isMe ? 'You' : message.sender.name}
                                                </p>
                                                
                                                {/* Render based on message type */}
                                                <div className="my-1.5">
                                                    {message.type === 'voice' && message.media_path ? (
                                                        <VoicePlayer 
                                                            audioUrl={`/storage/${message.media_path}`} 
                                                            duration={message.duration || 0}
                                                            isSender={isMe}
                                                        />
                                                    ) : (
                                                        <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{message.body}</p>
                                                    )}
                                                </div>

                                                <div className="flex justify-end items-center gap-1.5 mt-1 opacity-70">
                                                    <span className="text-[9px] font-mono leading-none select-none">
                                                        {formatTime(message.created_at)}
                                                    </span>
                                                    {isMe && (
                                                        message.read_at ? (
                                                            <CheckCheck className="h-3 w-3 text-primary-foreground" />
                                                        ) : (
                                                            <Check className="h-3 w-3 text-primary-foreground/75" />
                                                        )
                                                    )}
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </motion.div>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-muted-foreground/80 h-full space-y-4 opacity-75">
                                <div className="p-4 rounded-full bg-muted/30 border border-muted-foreground/5">
                                    <MessageSquare className="h-10 w-10 text-muted-foreground/60" />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-lg font-bold text-foreground">No messages yet</p>
                                    <p className="text-sm text-muted-foreground/80">Start the conversation by typing below.</p>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </CardContent>

                    {/* Footer / Input controls */}
                    <CardFooter className="border-t border-muted-foreground/10 p-4 bg-card shrink-0 flex flex-col gap-2 relative z-10">
                        {canSendMessage ? (
                            <form onSubmit={handleTextSubmit} className="flex w-full gap-2 items-center">
                                <Input 
                                    value={data.body} 
                                    onChange={e => setData('body', e.target.value)} 
                                    placeholder="Type a message..."
                                    disabled={processing}
                                    className="flex-1 h-11 rounded-full px-5 border border-muted-foreground/15 bg-muted/20 focus-visible:ring-1 focus-visible:ring-primary/45 focus-visible:border-primary shadow-xs transition-all placeholder:text-muted-foreground/50"
                                />
                                
                                {/* Voice Recorder callback */}
                                <VoiceRecorder onSend={handleVoiceSend} disabled={processing} />

                                <Button 
                                    type="submit" 
                                    disabled={processing || !data.body.trim()}
                                    className="h-11 w-11 rounded-full shrink-0 shadow-md shadow-primary/20 hover:shadow-primary/30 transition-all hover:scale-103 active:scale-97 p-0 cursor-pointer"
                                >
                                    <Send className="h-4.5 w-4.5" />
                                </Button>
                            </form>
                        ) : (
                            <div className="flex w-full flex-col sm:flex-row items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-amber-500/5 via-amber-500/10 to-amber-500/5 border border-amber-500/20 shadow-md gap-3 animate-fade-in">
                                <div className="flex items-center gap-3 text-amber-600 dark:text-amber-500">
                                    <div className="p-2.5 rounded-full bg-amber-500/10 border border-amber-500/20 relative">
                                        <Lock className="h-4.5 w-4.5 shrink-0 animate-pulse" />
                                        <span className="absolute inset-0 rounded-full bg-amber-500/5 animate-ping" />
                                    </div>
                                    <div className="text-left">
                                        <span className="text-xs font-black uppercase tracking-widest block">Messaging is Locked</span>
                                        <span className="text-[10px] text-muted-foreground/80 font-medium">To start active discussions, unlock this secure channel.</span>
                                    </div>
                                </div>
                                <Button 
                                    onClick={() => setIsPaymentOpen(true)}
                                    size="sm"
                                    className="w-full sm:w-auto h-9 px-5 rounded-xl font-black uppercase tracking-wider text-xs gap-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-md shadow-amber-500/20 hover:shadow-amber-500/35 transition-all hover:scale-102 active:scale-98 cursor-pointer border-0"
                                >
                                    <Coins className="h-3.5 w-3.5" /> Unlock Chat
                                </Button>
                            </div>
                        )}
                    </CardFooter>
                </Card>
            </div>

            {/* Modals & Dialogs */}
            <PaymentDialog
                isOpen={isPaymentOpen}
                onOpenChange={setIsPaymentOpen}
                conversationId={conversation.id}
                walletBalance={Number(auth.user.wallet_balance)}
                recipientName={otherUser.name}
            />

            <ReportDialog
                isOpen={isReportOpen}
                onOpenChange={setIsReportOpen}
                reportedUserId={otherUser.id}
                conversationId={conversation.id}
                recipientName={otherUser.name}
            />

            {isCallOpen && (
                <CallModal
                    isOpen={isCallOpen}
                    onClose={() => setIsCallOpen(false)}
                    conversationId={conversation.id}
                    callType={callType}
                    isIncoming={isIncomingCall}
                    recipientName={isIncomingCall ? activeCallerName : otherUser.name}
                    echo={echoInstance}
                    currentUserId={auth.user.id}
                />
            )}
        </AppLayout>
    );
}

// Inline fallback if Lucide doesn't export MessageSquare inside file
function MessageSquare(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
    );
}
