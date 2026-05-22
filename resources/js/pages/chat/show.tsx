import React, { useEffect, useState } from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useEcho } from '@laravel/echo-react';

interface Message {
    id: number;
    body: string;
    sender_id: number;
    sender: {
        name: string;
    };
    created_at: string;
}

interface Conversation {
    id: number;
    initiator: { name: string };
    recipient: { name: string };
}

interface Props {
    conversation: Conversation;
    messages: Message[];
    canSendMessage: boolean;
}

export default function ChatShow({ conversation, messages: initialMessages, canSendMessage }: Props) {
    const { auth } = usePage().props as any;
    const [messages, setMessages] = useState<Message[]>(initialMessages);
    const echo = useEcho();

    const { data, setData, post, processing, reset } = useForm({
        body: '',
    });

    useEffect(() => {
        if (!echo) return;

        const channel = echo.private(`chat.${conversation.id}`)
            .listen('.message.sent', (e: { message: Message }) => {
                setMessages((prev) => [...prev, e.message]);
            });

        return () => {
            channel.stopListening('.message.sent');
        };
    }, [echo, conversation.id]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('chat.store', conversation.id), {
            onSuccess: () => {
                reset('body');
            },
        });
    };

    useEffect(() => {
        setMessages(initialMessages);
    }, [initialMessages]);

    const otherUser = auth.user.id === (conversation as any).initiator_id 
        ? conversation.recipient 
        : conversation.initiator;

    return (
        <div className="container mx-auto py-8 px-4 h-full">
            <Head title={`Chat with ${otherUser.name}`} />
            <Card className="flex flex-col h-[calc(100vh-160px)] border-muted-foreground/20 shadow-sm">
                <CardHeader className="border-b bg-muted/5 py-4">
                    <CardTitle className="text-lg font-bold">Chat with {otherUser.name}</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 overflow-y-auto space-y-4 p-6 bg-muted/10">
                    {messages.map((message) => (
                        <div 
                            key={message.id} 
                            className={`flex ${message.sender_id === auth.user.id ? 'justify-end' : 'justify-start'}`}
                        >
                            <div className={`max-w-[70%] rounded-2xl px-4 py-2 shadow-sm ${
                                message.sender_id === auth.user.id 
                                    ? 'bg-primary text-primary-foreground rounded-tr-none' 
                                    : 'bg-card border border-border rounded-tl-none'
                            }`}>
                                <p className="text-[10px] font-bold opacity-70 mb-1">{message.sender.name}</p>
                                <p className="text-sm">{message.body}</p>
                            </div>
                        </div>
                    ))}
                </CardContent>
                <CardFooter className="border-t p-4 bg-background">
                    <form onSubmit={handleSubmit} className="flex w-full gap-3">
                        <Input 
                            value={data.body} 
                            onChange={e => setData('body', e.target.value)} 
                            placeholder="Type a message..."
                            disabled={!canSendMessage || processing}
                            className="flex-1 h-11 rounded-full px-6 border-muted-foreground/20"
                        />
                        <Button 
                            type="submit" 
                            disabled={!canSendMessage || processing || !data.body.trim()}
                            className="h-11 w-11 rounded-full shrink-0"
                        >
                            Send
                        </Button>
                    </form>
                </CardFooter>
            </Card>
            {!canSendMessage && (
                <div className="mt-4 p-4 rounded-lg bg-destructive/10 text-destructive text-center text-sm font-medium border border-destructive/20">
                    You have reached your free message limit. Please subscribe to continue.
                </div>
            )}
        </div>
    );
}
