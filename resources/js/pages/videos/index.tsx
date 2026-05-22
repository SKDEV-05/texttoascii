import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { useRef, useEffect, useState } from 'react';
import { Heart, MessageCircle, Share2, User, Plus, X, Upload } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface Video {
    id: number;
    title: string;
    description: string;
    file_path: string;
    likes_count: number;
    comments_count: number;
    user: {
        name: string;
        avatar_path: string;
    };
    talent_profile: {
        display_name: string;
        position: string;
    };
}

interface Props {
    videos: Video[];
}

export default function VideoFeed({ videos }: Props) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [isUploadOpen, setIsUploadOpen] = useState(false);

    return (
        <div className="relative h-[calc(100vh-64px)] w-full bg-black">
            <Head title="Video Feed" />
            <div 
                ref={containerRef}
                className="h-full w-full snap-y snap-mandatory overflow-y-scroll scrollbar-hide"
            >
                {videos.length > 0 ? (
                    videos.map((video) => (
                        <VideoItem key={video.id} video={video} />
                    ))
                ) : (
                    <div className="flex h-full flex-col items-center justify-center text-white gap-4">
                        <p className="text-lg font-medium opacity-50">No videos available yet.</p>
                        <Button variant="outline" onClick={() => setIsUploadOpen(true)} className="border-white/20 text-white hover:bg-white/10">
                            <Plus className="mr-2 h-4 w-4" /> Upload First Video
                        </Button>
                    </div>
                )}
            </div>

            {/* Floating Add Button */}
            <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
                <DialogTrigger asChild>
                    <Button 
                        className="absolute bottom-10 right-10 h-16 w-16 rounded-full shadow-2xl z-50 bg-primary hover:bg-primary/90 hover:scale-110 transition-transform ring-4 ring-black/50"
                        size="icon"
                    >
                        <Plus className="h-10 w-10 text-white" />
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px] border-muted-foreground/20">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black italic">UPLOAD TALENT</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-6 py-6">
                        <div className="flex flex-col items-center justify-center border-2 border-dashed border-primary/30 rounded-2xl p-12 bg-primary/5 cursor-pointer hover:bg-primary/10 transition-all group">
                            <Upload className="h-12 w-12 text-primary mb-4 group-hover:scale-110 transition-transform" />
                            <p className="text-sm font-bold text-primary uppercase tracking-tighter">Select vertical video</p>
                            <p className="text-[10px] text-muted-foreground mt-1">MP4 or MOV, up to 100MB</p>
                        </div>
                        <div className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="title" className="text-xs font-bold uppercase tracking-widest opacity-70">Title</Label>
                                <Input id="title" placeholder="Amazing goal at training" className="h-12 rounded-xl" />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="description" className="text-xs font-bold uppercase tracking-widest opacity-70">Description</Label>
                                <Textarea id="description" placeholder="Describe your talent..." className="min-h-[100px] rounded-xl" />
                            </div>
                        </div>
                        <Button className="w-full h-12 rounded-xl font-bold text-lg shadow-lg shadow-primary/20">POST VIDEO</Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}

function VideoItem({ video }: { video: Video }) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLiked, setIsLiked] = useState(false);

    useEffect(() => {
        const options = {
            root: null,
            rootMargin: '0px',
            threshold: 0.5,
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    videoRef.current?.play().catch(() => {});
                    setIsPlaying(true);
                } else {
                    videoRef.current?.pause();
                    setIsPlaying(false);
                }
            });
        }, options);

        if (videoRef.current) {
            observer.observe(videoRef.current);
        }

        return () => observer.disconnect();
    }, []);

    const togglePlay = () => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
            } else {
                videoRef.current.play().catch(() => {});
            }
            setIsPlaying(!isPlaying);
        }
    };

    return (
        <div className="relative h-full w-full snap-start overflow-hidden bg-black flex items-center justify-center">
            <video
                ref={videoRef}
                src={video.file_path}
                className="h-full w-full max-w-[450px] object-cover"
                loop
                playsInline
                onClick={togglePlay}
            />
            
            {/* Overlay content */}
            <div className="absolute bottom-0 left-0 right-0 p-4 pb-24 text-white bg-gradient-to-t from-black/80 via-black/20 to-transparent">
                <div className="mx-auto max-w-[450px] flex items-end justify-between">
                    <div className="flex-1 space-y-2 pr-4">
                        <div className="flex items-center gap-2">
                            <Avatar className="h-10 w-10 border-2 border-primary">
                                <AvatarImage src={video.user.avatar_path} />
                                <AvatarFallback className="bg-primary text-white font-bold">
                                    {video.talent_profile.display_name[0]}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="font-bold">@{video.talent_profile.display_name || video.user.name}</p>
                                <p className="text-[10px] text-gray-300 uppercase font-semibold tracking-tighter">
                                    {video.talent_profile.position}
                                </p>
                            </div>
                        </div>
                        <p className="font-semibold text-sm">{video.title}</p>
                        <p className="text-xs text-gray-200 line-clamp-2">{video.description}</p>
                    </div>

                    <div className="flex flex-col gap-5 items-center">
                        <button 
                            className="flex flex-col items-center gap-1 group"
                            onClick={() => setIsLiked(!isLiked)}
                        >
                            <div className={`h-12 w-12 rounded-full flex items-center justify-center backdrop-blur-md transition-all ${isLiked ? 'bg-primary text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}>
                                <Heart className={`h-6 w-6 ${isLiked ? 'fill-current' : ''}`} />
                            </div>
                            <span className="text-[10px] font-bold">{video.likes_count + (isLiked ? 1 : 0)}</span>
                        </button>
                        
                        <button className="flex flex-col items-center gap-1 group">
                            <div className="h-12 w-12 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-md text-white hover:bg-white/20 transition-all">
                                <MessageCircle className="h-6 w-6" />
                            </div>
                            <span className="text-[10px] font-bold">{video.comments_count}</span>
                        </button>
                        
                        <button className="flex flex-col items-center gap-1 group">
                            <div className="h-12 w-12 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-md text-white hover:bg-white/20 transition-all">
                                <Share2 className="h-6 w-6" />
                            </div>
                            <span className="text-[10px] font-bold">Share</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Play/Pause Indicator Overlay */}
            {!isPlaying && (
                <div 
                    className="absolute inset-0 flex items-center justify-center bg-black/20 pointer-events-none"
                    onClick={togglePlay}
                >
                    <div className="h-20 w-20 rounded-full bg-black/40 flex items-center justify-center backdrop-blur-sm">
                        <Plus className="h-12 w-12 text-white rotate-45" />
                    </div>
                </div>
            )}
        </div>
    );
}
