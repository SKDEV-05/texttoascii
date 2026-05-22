import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface Conversation {
    id: number;
    initiator: { name: string };
    recipient: { name: string };
    latest_message?: {
        body: string;
        created_at: string;
    };
}

interface Props {
    conversations: Conversation[];
}

export default function ChatIndex({ conversations, auth }: any) {
    return (
        <div className="container mx-auto py-8 px-4">
            <Head title="Messages" />
            <Card className="border-muted-foreground/20 shadow-sm">
                    <CardHeader>
                        <CardTitle>Your Conversations</CardTitle>
                    </CardHeader>
                    <CardContent className="divide-y">
                        {conversations.length > 0 ? (
                            conversations.map((conversation: any) => {
                                const otherUser = auth.user.id === conversation.initiator_id 
                                    ? conversation.recipient 
                                    : conversation.initiator;

                                return (
                                    <Link 
                                        key={conversation.id} 
                                        href={route('chat.show', conversation.id)}
                                        className="flex items-center gap-4 p-4 hover:bg-muted transition-colors"
                                    >
                                        <Avatar>
                                            <AvatarFallback>{otherUser.name[0]}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold truncate">{otherUser.name}</p>
                                            <p className="text-sm text-muted-foreground truncate">
                                                {conversation.latest_message?.body || 'No messages yet.'}
                                            </p>
                                        </div>
                                    </Link>
                                );
                            })
                        ) : (
                            <div className="p-8 text-center text-muted-foreground">
                                No conversations yet.
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
    );
}
