import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import type { BreadcrumbItem } from '@/types';
import { useState, useEffect } from 'react';
import { usePage, router } from '@inertiajs/react';
import { echo } from '@laravel/echo-react';
import CallModal from '@/pages/chat/components/call-modal';

export default function AppLayout({
    breadcrumbs = [],
    children,
    hideHeader = false,
    contentClassName = '',
}: {
    breadcrumbs?: BreadcrumbItem[];
    children: React.ReactNode;
    hideHeader?: boolean;
    contentClassName?: string;
}) {
    const page = usePage();
    const { auth } = page.props as any;
    const currentUrl = page.url;
    const echoInstance = echo();

    const [isCallOpen, setIsCallOpen] = useState(false);
    const [callType, setCallType] = useState<'voice' | 'video'>('voice');
    const [isIncomingCall, setIsIncomingCall] = useState(false);
    const [activeCallerName, setActiveCallerName] = useState('');
    const [conversationId, setConversationId] = useState<number | null>(null);

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

    useEffect(() => {
        if (!echoInstance || !auth?.user) return;

        const userChannel = echoInstance.private(`App.Models.User.${auth.user.id}`)
            .listen('.call.started', (e: { conversation_id: number, caller_id: number, caller_name: string, call_type: 'voice' | 'video' }) => {
                console.log('Global call started event received:', e);
                if (e.caller_id !== auth.user.id) {
                    setConversationId(e.conversation_id);
                    setCallType(e.call_type);
                    setActiveCallerName(e.caller_name);
                    setIsIncomingCall(true);
                    setIsCallOpen(true);
                }
            })
            .listen('.message.sent', (e: { message: any }) => {
                console.log('Global message received:', e);
                if (e.message.sender_id !== auth.user.id) {
                    const isViewingThisChat = currentUrl === `/chat/${e.message.conversation_id}` || currentUrl.startsWith(`/chat/${e.message.conversation_id}?`);
                    const isViewingChatIndex = currentUrl === '/chat' || currentUrl.startsWith('/chat?');

                    if (!isViewingThisChat) {
                        if (!isViewingChatIndex) {
                            playNotificationSound();
                        }
                        // Always reload auth props to update the sidebar unread badge
                        router.reload({ only: ['auth'] });
                    }
                }
            });

        return () => {
            userChannel.stopListening('.call.started');
            userChannel.stopListening('.message.sent');
        };
    }, [echoInstance, auth?.user?.id, currentUrl]);

    return (
        <AppSidebarLayout breadcrumbs={breadcrumbs} hideHeader={hideHeader} contentClassName={contentClassName}>
            {children}
            {isCallOpen && conversationId !== null && (
                <CallModal
                    isOpen={isCallOpen}
                    onClose={() => setIsCallOpen(false)}
                    conversationId={conversationId}
                    callType={callType}
                    isIncoming={isIncomingCall}
                    recipientName={activeCallerName}
                    echo={echoInstance}
                    currentUserId={auth.user.id}
                />
            )}
        </AppSidebarLayout>
    );
}
