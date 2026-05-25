import { Head, Link, useForm, usePage, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { useRef, useEffect, useState } from 'react';
import { Heart, MessageCircle, Share2, Plus, Upload, Film, AlertTriangle, X, Maximize2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface Comment {
    id: number;
    parent_id?: number | null;
    comment: string;
    created_at: string;
    user: {
        name: string;
        avatar_path: string;
    };
    replies?: Comment[];
}

const formatRelativeDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
    const compareDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

    if (compareDate.getTime() === today.getTime()) {
        return 'Today';
    } else if (compareDate.getTime() === yesterday.getTime()) {
        return 'Yesterday';
    } else {
        return date.toLocaleDateString();
    }
};

interface Video {
    id: number;
    user_id: number;
    title: string;
    description: string;
    file_path: string;
    likes_count: number;
    comments_count: number;
    is_liked: boolean;
    is_followed: boolean;
    user: {
        name: string;
        avatar_path: string;
    };
    talent_profile: {
        display_name: string;
        position: string;
    };
    comments: Comment[];
}

interface Props {
    videos: Video[];
}

export default function VideoFeed({ videos }: Props) {
    const { auth } = usePage<any>().props;
    const user = auth?.user;
    const containerRef = useRef<HTMLDivElement>(null);
    const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
    const [isUploadOpen, setIsUploadOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(0);
    const [openCommentsVideoId, setOpenCommentsVideoId] = useState<number | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { data: uploadData, setData: setUploadData, post: postUpload, processing: uploadProcessing, errors: uploadErrors, reset: resetUpload } = useForm({
        title: '',
        description: '',
        video: null as File | null,
        talent_profile_id: '',
    });

    const [replyTo, setReplyTo] = useState<{ id: number; name: string } | null>(null);

    const { data: commentData, setData: setCommentData, post: postComment, processing: commentProcessing, reset: resetComment } = useForm({
        comment: '',
        parent_id: null as number | null,
    });

    const canUpload = user && (user.role === 'talent' || user.role === 'parent');

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setUploadData('video', file);
        }
    };

    const handleUploadSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        postUpload('/videos', {
            onSuccess: () => {
                resetUpload();
                setIsUploadOpen(false);
            }
        });
    };

    const handleReplyClick = (comment: Comment) => {
        setReplyTo({ id: comment.id, name: comment.user.name });
        setCommentData('parent_id', comment.id);
    };

    const handleCancelReply = () => {
        setReplyTo(null);
        setCommentData('parent_id', null);
    };

    const handleCommentSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!openCommentsVideoId) return;

        postComment(`/videos/${openCommentsVideoId}/comments`, {
            preserveScroll: true,
            onSuccess: () => {
                resetComment('comment', 'parent_id');
                setReplyTo(null);
            }
        });
    };

    const handleToggleLike = (video: Video) => {
        if (!user) {
            router.get('/login');
            return;
        }

        router.post(`/videos/${video.id}/like`, {}, {
            preserveScroll: true,
        });
    };

    const handleFollowToggle = (video: Video) => {
        if (!user) {
            router.get('/login');
            return;
        }

        router.post(`/users/${video.user_id}/follow`, {}, {
            preserveScroll: true,
        });
    };

    const handleOpenComments = (videoId: number) => {
        if (openCommentsVideoId === videoId) {
            setOpenCommentsVideoId(null);
        } else {
            setOpenCommentsVideoId(videoId);
        }
    };

    // Keyboard Arrow Key Navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                if (activeIndex < videos.length - 1) {
                    const nextIndex = activeIndex + 1;
                    itemRefs.current[nextIndex]?.scrollIntoView({ behavior: 'smooth' });
                }
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                if (activeIndex > 0) {
                    const prevIndex = activeIndex - 1;
                    itemRefs.current[prevIndex]?.scrollIntoView({ behavior: 'smooth' });
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [videos, activeIndex]);

    const activeVideo = videos.find(v => v.id === openCommentsVideoId);

    return (
        <AppLayout hideHeader={true} contentClassName="md:peer-data-[variant=inset]:m-0 md:peer-data-[variant=inset]:rounded-none bg-white">
            <div className="relative h-screen w-full bg-white flex overflow-hidden">
                <Head title="Video Feed" />
                
                {/* Vertical snapping feed */}
                <div 
                    ref={containerRef}
                    className="flex-1 h-full snap-y snap-mandatory overflow-y-scroll scrollbar-hide flex flex-col bg-white"
                >
                    {videos.length > 0 ? (
                        videos.map((video, index) => (
                            <div 
                                key={video.id} 
                                ref={el => { itemRefs.current[index] = el; }}
                                className="w-full h-full snap-start shrink-0"
                            >
                                <VideoItem 
                                    video={video} 
                                    index={index}
                                    onVisible={setActiveIndex}
                                    onOpenComments={handleOpenComments}
                                    onToggleLike={handleToggleLike}
                                    onFollowToggle={handleFollowToggle}
                                    isCommentsOpen={openCommentsVideoId === video.id}
                                    user={user}
                                />
                            </div>
                        ))
                    ) : (
                        <div className="flex h-full w-full flex-col items-center justify-center text-zinc-900 gap-6 px-6 bg-white">
                            <div className="p-6 rounded-3xl bg-white border border-zinc-200 text-center max-w-sm space-y-4 shadow-md">
                                <Film className="h-12 w-12 text-primary mx-auto opacity-70 animate-pulse" />
                                <h3 className="text-xl font-bold uppercase tracking-tight">No Videos Yet</h3>
                                <p className="text-xs text-zinc-500 font-medium">
                                    Be the first to upload and showcase football skills to scouts and clubs!
                                </p>
                                {canUpload && (
                                    <Button 
                                        onClick={() => setIsUploadOpen(true)} 
                                        className="w-full h-11 rounded-xl font-bold uppercase tracking-wider mt-2 shadow-lg shadow-primary/20"
                                    >
                                        <Plus className="mr-2 h-4 w-4" /> Upload Video
                                    </Button>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Right side Comments Sidebar Drawer */}
                {activeVideo && (
                    <div className="w-[380px] h-full bg-white border-l border-zinc-200 flex flex-col text-zinc-900 z-40 transition-all duration-300">
                        {/* Drawer Header */}
                        <div className="flex items-center justify-between p-4 border-b border-zinc-200">
                            <h3 className="font-extrabold text-sm uppercase tracking-tight">
                                Comments ({activeVideo.comments?.length || 0})
                            </h3>
                            <button 
                                onClick={() => setOpenCommentsVideoId(null)}
                                className="p-1 rounded-full hover:bg-zinc-100 text-zinc-400 hover:text-zinc-600 transition-all"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Drawer Comments List */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {activeVideo.comments && activeVideo.comments.length > 0 ? (
                                activeVideo.comments.map((comment) => (
                                    <div key={comment.id} className="space-y-3">
                                        <div className="flex items-start gap-3 text-left">
                                            <Avatar className="h-8 w-8 border border-primary/20 shrink-0">
                                                <AvatarImage src={comment.user?.avatar_path} />
                                                <AvatarFallback className="bg-primary text-white text-xs font-bold uppercase">
                                                    {comment.user?.name?.[0] || 'U'}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1 space-y-1">
                                                <div className="flex items-center justify-between">
                                                    <span className="font-bold text-xs text-zinc-900">@{comment.user?.name}</span>
                                                    <span className="text-[9px] text-zinc-500">
                                                        {formatRelativeDate(comment.created_at)}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-zinc-700 leading-relaxed">{comment.comment}</p>
                                                {user && (
                                                    <button
                                                        onClick={() => handleReplyClick(comment)}
                                                        className="text-[10px] font-black uppercase tracking-wider text-primary hover:text-primary/80 pt-1"
                                                    >
                                                        Reply
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        {/* Nested Replies */}
                                        {comment.replies && comment.replies.length > 0 && (
                                            <div className="pl-6 space-y-3 border-l-2 border-zinc-100 ml-4">
                                                {comment.replies.map((reply) => (
                                                    <div key={reply.id} className="flex items-start gap-3 text-left">
                                                        <Avatar className="h-7 w-7 border border-primary/10 shrink-0">
                                                            <AvatarImage src={reply.user?.avatar_path} />
                                                            <AvatarFallback className="bg-zinc-200 text-zinc-700 text-[10px] font-bold uppercase">
                                                                {reply.user?.name?.[0] || 'U'}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div className="flex-1 space-y-0.5">
                                                            <div className="flex items-center justify-between">
                                                                <span className="font-bold text-[11px] text-zinc-800">@{reply.user?.name}</span>
                                                                <span className="text-[8px] text-zinc-500">
                                                                    {formatRelativeDate(reply.created_at)}
                                                                </span>
                                                            </div>
                                                            <p className="text-xs text-zinc-600 leading-relaxed">{reply.comment}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-zinc-500 gap-2 py-20">
                                    <MessageCircle className="h-8 w-8 opacity-50" />
                                    <p className="text-xs font-medium">No comments yet. Be the first!</p>
                                </div>
                            )}
                        </div>

                        {/* Drawer Bottom Input bar */}
                        <div className="p-4 border-t border-zinc-200 bg-zinc-50">
                            {user ? (
                                <div className="space-y-2">
                                    {replyTo && (
                                        <div className="flex items-center justify-between bg-primary/10 border border-primary/20 px-3 py-1.5 rounded-lg">
                                            <span className="text-[10px] font-bold text-primary uppercase">
                                                Replying to @{replyTo.name}
                                            </span>
                                            <button 
                                                onClick={handleCancelReply}
                                                className="p-0.5 rounded-full hover:bg-primary/20 text-primary transition-all"
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                        </div>
                                    )}
                                    <form onSubmit={handleCommentSubmit} className="flex gap-2">
                                        <Input
                                            type="text"
                                            placeholder="Add comment..."
                                            value={commentData.comment}
                                            onChange={e => setCommentData('comment', e.target.value)}
                                            className="bg-white border-zinc-200 rounded-xl h-10 text-xs focus-visible:ring-primary text-zinc-900 placeholder:text-zinc-400 flex-1"
                                            required
                                        />
                                        <Button 
                                            type="submit" 
                                            disabled={commentProcessing}
                                            className="bg-primary hover:bg-primary/90 text-white rounded-xl h-10 font-bold px-4 text-xs uppercase"
                                        >
                                            Post
                                        </Button>
                                    </form>
                                </div>
                            ) : (
                                <Link href="/login" className="block w-full">
                                    <Button className="w-full bg-primary hover:bg-primary/90 text-white font-extrabold rounded-xl uppercase tracking-wider h-11 text-xs shadow-lg shadow-primary/20">
                                        Log in to comment
                                    </Button>
                                </Link>
                            )}
                        </div>
                    </div>
                )}

                {/* Floating Add Button for Talents/Parents */}
                {canUpload && (
                    <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
                        <DialogTrigger asChild>
                            <Button 
                                className="absolute bottom-10 right-10 h-16 w-16 rounded-full shadow-2xl z-30 bg-primary hover:bg-primary/90 hover:scale-110 transition-transform ring-4 ring-black/50"
                                size="icon"
                            >
                                <Plus className="h-10 w-10 text-white" />
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px] border-muted-foreground/20 rounded-3xl z-50">
                            <DialogHeader>
                                <DialogTitle className="text-2xl font-black italic uppercase">UPLOAD TALENT VIDEO</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleUploadSubmit} className="space-y-4 py-4 text-left">
                                {uploadErrors.error && (
                                    <div className="p-3 rounded-xl bg-destructive/10 text-destructive text-xs font-bold flex items-center gap-2">
                                        <AlertTriangle className="h-4 w-4" /> {uploadErrors.error}
                                    </div>
                                )}

                                <div 
                                    onClick={handleUploadClick}
                                    className="flex flex-col items-center justify-center border-2 border-dashed border-primary/30 rounded-2xl p-8 bg-primary/5 cursor-pointer hover:bg-primary/10 transition-all group"
                                >
                                    <input 
                                        type="file" 
                                        ref={fileInputRef} 
                                        onChange={handleFileChange} 
                                        accept="video/*" 
                                        className="hidden" 
                                    />
                                    <Upload className="h-10 w-10 text-primary mb-3 group-hover:scale-110 transition-transform" />
                                    <p className="text-xs font-bold text-primary uppercase tracking-tighter">
                                        {uploadData.video ? uploadData.video.name : 'Select video file'}
                                    </p>
                                    <p className="text-[9px] text-muted-foreground mt-1">MP4, MOV or WebM, up to 100MB</p>
                                    {uploadErrors.video && <p className="text-xs text-destructive font-bold mt-1">{uploadErrors.video}</p>}
                                </div>

                                {user.role === 'parent' && (
                                    <div className="grid gap-2">
                                        <Label htmlFor="talent_profile_id" className="text-xs font-bold uppercase tracking-widest opacity-70">Select Child Profile</Label>
                                        <select
                                            id="talent_profile_id"
                                            value={uploadData.talent_profile_id}
                                            onChange={e => setUploadData('talent_profile_id', e.target.value)}
                                            className="flex h-11 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none"
                                            required
                                        >
                                            <option value="">Choose child profile...</option>
                                            {user.managed_talents?.map((talent: any) => (
                                                <option key={talent.talent_profile?.id} value={talent.talent_profile?.id}>
                                                    {talent.talent_profile?.display_name || talent.name}
                                                </option>
                                            ))}
                                        </select>
                                        {uploadErrors.talent_profile_id && (
                                            <p className="text-xs text-destructive font-bold">{uploadErrors.talent_profile_id}</p>
                                        )}
                                    </div>
                                )}

                                <div className="grid gap-2">
                                    <Label htmlFor="title" className="text-xs font-bold uppercase tracking-widest opacity-70">Title</Label>
                                    <Input 
                                        id="title" 
                                        placeholder="Amazing goal at training" 
                                        value={uploadData.title}
                                        onChange={e => setUploadData('title', e.target.value)}
                                        className="h-11 rounded-xl"
                                        required
                                    />
                                    {uploadErrors.title && <p className="text-xs text-destructive font-bold">{uploadErrors.title}</p>}
                                </div>
                                
                                <div className="grid gap-2">
                                    <Label htmlFor="description" className="text-xs font-bold uppercase tracking-widest opacity-70">Description</Label>
                                    <Textarea 
                                        id="description" 
                                        placeholder="Describe your talent's action..." 
                                        value={uploadData.description}
                                        onChange={e => setUploadData('description', e.target.value)}
                                        className="min-h-[80px] rounded-xl"
                                    />
                                    {uploadErrors.description && <p className="text-xs text-destructive font-bold">{uploadErrors.description}</p>}
                                </div>

                                <Button 
                                    type="submit" 
                                    className="w-full h-12 rounded-xl font-bold text-base shadow-lg shadow-primary/20 mt-2"
                                    disabled={uploadProcessing}
                                >
                                    POST VIDEO
                                </Button>
                            </form>
                        </DialogContent>
                    </Dialog>
                )}
            </div>
        </AppLayout>
    );
}

function VideoItem({ 
    video, 
    index, 
    onVisible, 
    onOpenComments, 
    onToggleLike,
    onFollowToggle,
    isCommentsOpen, 
    user 
}: { 
    video: Video; 
    index: number; 
    onVisible: (index: number) => void; 
    onOpenComments: (videoId: number) => void; 
    onToggleLike: (video: Video) => void;
    onFollowToggle: (video: Video) => void;
    isCommentsOpen: boolean; 
    user: any; 
}) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isLandscape, setIsLandscape] = useState(video.orientation === 'horizontal');

    useEffect(() => {
        const options = {
            root: null,
            rootMargin: '0px',
            threshold: 0.5,
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    if (!isFullscreen) {
                        videoRef.current?.play().catch(() => {});
                        setIsPlaying(true);
                    }
                    onVisible(index);
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
    }, [index, isFullscreen]);

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

    const toggleFullscreen = () => {
        if (videoRef.current) {
            if (!isFullscreen) {
                videoRef.current.pause();
                setIsPlaying(false);
            } else {
                // Resume playing the normal feed when closing fullscreen
                setTimeout(() => {
                    videoRef.current?.play().catch(() => {});
                    setIsPlaying(true);
                }, 100);
            }
        }
        setIsFullscreen(!isFullscreen);
    };

    const handleLoadedMetadata = () => {
        if (videoRef.current) {
            // Automatically detect if the video aspect ratio is landscape/horizontal
            const isHorizontal = videoRef.current.videoWidth > videoRef.current.videoHeight;
            setIsLandscape(isHorizontal);
        }
    };

    return (
        <div className={`relative h-full w-full bg-white flex items-center p-4 transition-all duration-300 ${isCommentsOpen ? 'justify-start md:pl-24 pl-4' : 'justify-center'}`}>
            {/* Flex container holding the player and the buttons side-by-side */}
            <div className="flex items-end h-full max-h-[85vh] gap-4">
                {/* Aspect container for the video player card aspect-[9/16] */}
                <div className="relative h-full aspect-[9/16] overflow-hidden rounded-3xl border border-zinc-200 shadow-xl bg-black flex items-center justify-center">
                    <video
                        ref={videoRef}
                        src={video.file_path}
                        className="w-full h-full object-cover cursor-pointer"
                        loop
                        playsInline
                        onClick={togglePlay}
                        onLoadedMetadata={handleLoadedMetadata}
                    />
                    
                    {/* Bottom left info overlay - styled like TikTok */}
                    <div className="absolute bottom-0 left-0 right-0 p-5 text-white bg-gradient-to-t from-black/90 via-black/25 to-transparent flex flex-col gap-1.5 text-left pointer-events-none">
                        <div className="pointer-events-auto">
                            <p className="font-bold text-base">@{video.talent_profile?.display_name || video.user?.name}</p>
                            <p className="text-[10px] text-zinc-300 font-bold tracking-tighter uppercase leading-none mt-1">
                                {video.talent_profile?.position}
                            </p>
                        </div>
                        <p className="font-bold text-sm pointer-events-auto leading-snug mt-1">{video.title}</p>
                        <p className="text-xs text-zinc-300 pointer-events-auto leading-normal line-clamp-2">{video.description}</p>
                    </div>

                    {/* Play/Pause Overlay indicator */}
                    {!isPlaying && (
                        <div 
                            className="absolute inset-0 flex items-center justify-center bg-black/30 pointer-events-none cursor-pointer"
                            onClick={togglePlay}
                        >
                            <div className="h-14 w-14 rounded-full bg-black/50 flex items-center justify-center backdrop-blur-sm animate-pulse">
                                <Plus className="h-8 w-8 text-white rotate-45" />
                            </div>
                        </div>
                    )}
                </div>

                {/* Right side controls stacked vertically OUTSIDE the video card, matching TikTok web layout */}
                <div className="flex flex-col items-center gap-4 pb-4 select-none">
                    {/* User profile with follow badge */}
                    <div className="relative flex flex-col items-center mb-2">
                        <Avatar className="h-12 w-12 border border-zinc-200 shadow-sm">
                            <AvatarImage src={video.user?.avatar_path} />
                            <AvatarFallback className="bg-zinc-100 text-zinc-700 font-bold text-sm uppercase">
                                {video.talent_profile?.display_name?.[0] || 'T'}
                            </AvatarFallback>
                        </Avatar>
                        {/* Hide follow button on own videos */}
                        {(!user || user.id !== video.user_id) && (
                            <button
                                onClick={() => onFollowToggle(video)}
                                className={`absolute -bottom-1.5 rounded-full p-0.5 shadow-md hover:scale-110 transition-all ${
                                    video.is_followed
                                        ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                                        : 'bg-primary hover:bg-primary/90 text-white'
                                }`}
                                title={video.is_followed ? 'Unfollow' : 'Follow'}
                            >
                                {video.is_followed
                                    ? <span className="text-[9px] font-black px-1">✓</span>
                                    : <Plus className="h-3.5 w-3.5 stroke-[3]" />
                                }
                            </button>
                        )}
                    </div>

                    {/* Like button */}
                    <button 
                        onClick={() => onToggleLike(video)}
                        className="flex flex-col items-center gap-1 group"
                    >
                        <div className={`h-11 w-11 rounded-full flex items-center justify-center transition-all shadow-sm ${video.is_liked ? 'bg-primary text-white scale-110' : 'bg-zinc-100 text-zinc-800 hover:bg-zinc-200'}`}>
                            <Heart className={`h-5.5 w-5.5 ${video.is_liked ? 'fill-current' : ''}`} />
                        </div>
                        <span className="text-xs font-bold text-zinc-500">{video.likes_count || 0}</span>
                    </button>

                    {/* Comment button */}
                    <button 
                        onClick={() => onOpenComments(video.id)}
                        className="flex flex-col items-center gap-1 group"
                    >
                        <div className={`h-11 w-11 rounded-full flex items-center justify-center transition-all shadow-sm ${isCommentsOpen ? 'bg-zinc-900 text-white scale-110' : 'bg-zinc-100 text-zinc-800 hover:bg-zinc-200'}`}>
                            <MessageCircle className="h-5.5 w-5.5" />
                        </div>
                        <span className="text-xs font-bold text-zinc-500">{video.comments_count || 0}</span>
                    </button>

                    {/* Share button */}
                    <button className="flex flex-col items-center gap-1 group">
                        <div className="h-11 w-11 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-800 hover:bg-zinc-200 transition-all shadow-sm">
                            <Share2 className="h-5.5 w-5.5" />
                        </div>
                        <span className="text-xs font-bold text-zinc-500">Share</span>
                    </button>

                    {/* Fullscreen Maximize button */}
                    <button 
                        onClick={toggleFullscreen}
                        className="flex flex-col items-center gap-1 group"
                        title="Fullscreen"
                    >
                        <div className="h-11 w-11 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-800 hover:bg-zinc-200 transition-all shadow-sm">
                            <Maximize2 className="h-5.5 w-5.5 text-zinc-850" />
                        </div>
                        <span className="text-xs font-bold text-zinc-500">Full</span>
                    </button>
                </div>
            </div>

            {/* Custom Fullscreen Overlay with Animation */}
            {isFullscreen && (
                <div className="fixed inset-0 bg-black/95 z-[999] flex items-center justify-center p-4 backdrop-blur-md transition-all duration-300">
                    {/* Close button */}
                    <button 
                        onClick={toggleFullscreen}
                        className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 text-white hover:text-zinc-200 rounded-full transition-all border border-white/10 z-50 shadow-lg"
                    >
                        <X className="h-6 w-6" />
                    </button>
                    
                    {/* Fullscreen Video Player */}
                    <div className={`relative max-w-full max-h-full flex items-center justify-center transition-all duration-500 ease-out transform scale-100 opacity-100 ${
                        isLandscape ? 'w-full max-w-4xl aspect-video' : 'h-full max-h-[90vh] aspect-[9/16]'
                    }`}>
                        <video
                            src={video.file_path}
                            className="w-full h-full object-contain rounded-2xl shadow-2xl border border-white/5"
                            autoPlay
                            loop
                            playsInline
                            controls
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
