import React, { useEffect, useState, useRef } from 'react';
import { Head, useForm, usePage, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { echo } from '@laravel/echo-react';
import { Phone, Video, Flag, Lock, Send, Check, CheckCheck, Coins } from 'lucide-react';
import axios from 'axios';
import { store as storeMessage, voice as voiceMessage, read as readMessage } from '@/routes/chat';

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
            })
            .listen('.call.started', (e: { conversation_id: number, caller_id: number, caller_name: string, call_type: 'voice' | 'video' }) => {
                console.log('Call started event received:', e);
                if (e.caller_id !== auth.user.id) {
                    setCallType(e.call_type);
                    setActiveCallerName(e.caller_name);
                    setIsIncomingCall(true);
                    setIsCallOpen(true);
                }
            });

        return () => {
            chatChannel.stopListening('.message.sent');
            chatChannel.stopListening('.call.started');
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
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <AppLayout breadcrumbs={[
            { title: 'Messages', href: '/chat' },
            { title: otherUser.name, href: `/chat/${conversation.id}` }
        ]}>
            <Head title={`Chat with ${otherUser.name}`} />

            <div className="flex-1 flex flex-col h-[calc(100vh-140px)] max-w-4xl mx-auto w-full p-4 lg:p-6 text-left">
                <Card className="flex-1 flex flex-col overflow-hidden border-muted-foreground/20 shadow-xl rounded-3xl bg-card">
                    {/* Header */}
                    <CardHeader className="border-b bg-muted/10 py-4 px-6 flex flex-row items-center justify-between shrink-0">
                        <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10 border border-muted-foreground/10 shadow-sm">
                                <AvatarFallback className="bg-primary/10 text-primary font-bold">
                                    {otherUser.name[0]}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <h3 className="font-bold text-base text-foreground leading-tight">{otherUser.name}</h3>
                                <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold mt-0.5">
                                    {otherUser.role.replace('_', ' ')}
                                </p>
                            </div>
                        </div>

                        {/* Call and Report Controls */}
                        <div className="flex items-center gap-1">
                            <Button 
                                type="button" 
                                variant="ghost" 
                                size="icon"
                                onClick={() => handleStartCall('voice')}
                                className="h-10 w-10 text-muted-foreground hover:text-foreground rounded-full"
                            >
                                <Phone className="h-5 w-5" />
                            </Button>
                            <Button 
                                type="button" 
                                variant="ghost" 
                                size="icon"
                                onClick={() => handleStartCall('video')}
                                className="h-10 w-10 text-muted-foreground hover:text-foreground rounded-full"
                            >
                                <Video className="h-5 w-5" />
                            </Button>
                            <Button 
                                type="button" 
                                variant="ghost" 
                                size="icon"
                                onClick={() => setIsReportOpen(true)}
                                className="h-10 w-10 text-muted-foreground hover:text-destructive rounded-full"
                            >
                                <Flag className="h-5 w-5" />
                            </Button>
                        </div>
                    </CardHeader>

                    {/* Messages Body */}
                    <CardContent className="flex-1 overflow-y-auto space-y-4 p-6 bg-muted/5 flex flex-col scrollbar-thin">
                        {messages.length > 0 ? (
                            messages.map((message) => {
                                const isMe = message.sender_id === auth.user.id;
                                return (
                                    <div 
                                        key={message.id} 
                                        className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div className={`max-w-[75%] rounded-3xl px-4 py-2.5 shadow-sm border ${
                                            isMe 
                                                ? 'bg-primary text-primary-foreground border-primary/20 rounded-tr-none' 
                                                : 'bg-card border-muted-foreground/10 text-foreground rounded-tl-none'
                                        }`}>
                                            <p className="text-[9px] font-bold opacity-60 mb-1 leading-none">
                                                {isMe ? 'You' : message.sender.name}
                                            </p>
                                            
                                            {/* Render based on message type */}
                                            {message.type === 'voice' && message.media_path ? (
                                                <VoicePlayer 
                                                    audioUrl={`/storage/${message.media_path}`} 
                                                    duration={message.duration || 0}
                                                    isSender={isMe}
                                                />
                                            ) : (
                                                <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.body}</p>
                                            )}

                                            <div className="flex justify-end items-center gap-1 mt-1 opacity-70">
                                                <span className="text-[9px] font-mono leading-none">
                                                    {formatTime(message.created_at)}
                                                </span>
                                                {isMe && (
                                                    message.read_at ? (
                                                        <CheckCheck className="h-3 w-3 text-primary-foreground" />
                                                    ) : (
                                                        <Check className="h-3 w-3 text-primary-foreground/70" />
                                                    )
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-muted-foreground opacity-60">
                                <MessageSquare className="h-10 w-10 mb-2" />
                                <p className="text-base font-bold">No messages yet</p>
                                <p className="text-xs">Start the conversation by typing below.</p>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </CardContent>

                    {/* Footer / Input controls */}
                    <CardFooter className="border-t p-4 bg-background shrink-0 flex flex-col gap-2">
                        {canSendMessage ? (
                            <form onSubmit={handleTextSubmit} className="flex w-full gap-2 items-center">
                                <Input 
                                    value={data.body} 
                                    onChange={e => setData('body', e.target.value)} 
                                    placeholder="Type a message..."
                                    disabled={processing}
                                    className="flex-1 h-11 rounded-full px-5 border-muted-foreground/20 focus-visible:ring-primary shadow-sm"
                                />
                                
                                {/* Voice Recorder callback */}
                                <VoiceRecorder onSend={handleVoiceSend} disabled={processing} />

                                <Button 
                                    type="submit" 
                                    disabled={processing || !data.body.trim()}
                                    className="h-11 w-11 rounded-full shrink-0 shadow-md shadow-primary/20 p-0"
                                >
                                    <Send className="h-4.5 w-4.5" />
                                </Button>
                            </form>
                        ) : (
                            <div className="flex w-full items-center justify-between p-3 rounded-2xl bg-destructive/5 border border-destructive/15">
                                <div className="flex items-center gap-2 text-destructive">
                                    <Lock className="h-5 w-5 shrink-0" />
                                    <span className="text-xs font-bold uppercase tracking-wide">Messaging is Locked</span>
                                </div>
                                <Button 
                                    onClick={() => setIsPaymentOpen(true)}
                                    size="sm"
                                    className="h-9 px-4 rounded-xl font-bold uppercase tracking-wider text-xs gap-1.5 shadow-md shadow-primary/25"
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
