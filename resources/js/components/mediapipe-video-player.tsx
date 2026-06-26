import { useState, useRef, useEffect } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import { PoseLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';

interface Props {
    src: string;
    className?: string;
    videoRef?: React.RefObject<HTMLVideoElement>;
    id?: string;
}

export default function MediaPipeVideoPlayer({ src, className = "", videoRef: externalVideoRef, id }: Props) {
    const internalVideoRef = useRef<HTMLVideoElement>(null);
    const videoRef = externalVideoRef || internalVideoRef;
    const canvasRef = useRef<HTMLCanvasElement>(null);
    
    const [isTrackerEnabled, setIsTrackerEnabled] = useState(false);
    const [isLoadingModel, setIsLoadingModel] = useState(false);
    const [modelError, setModelError] = useState<string | null>(null);
    
    const landmarkerRef = useRef<any>(null);
    const requestRef = useRef<number | null>(null);

    // Load MediaPipe Model dynamically from CDN
    const initMediaPipe = async () => {
        if (landmarkerRef.current) return landmarkerRef.current;
        
        setIsLoadingModel(true);
        setModelError(null);
        
        try {
            const filesetResolver = await FilesetResolver.forVisionTasks(
                "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.35/wasm"
            );
            const landmarker = await PoseLandmarker.createFromOptions(filesetResolver, {
                baseOptions: {
                    modelAssetPath: "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task",
                    delegate: "GPU"
                },
                runningMode: "VIDEO",
                outputSegmentationMasks: false
            });
            
            landmarkerRef.current = landmarker;
            setIsLoadingModel(false);
            return landmarker;
        } catch (err: any) {
            console.error("Failed to load MediaPipe Pose model:", err);
            setIsLoadingModel(false);
            setModelError("Impossible de charger le modèle IA.");
            setIsTrackerEnabled(false);
            return null;
        }
    };

    // Tracking loop
    const trackPose = () => {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        const landmarker = landmarkerRef.current;
        
        if (!video || !canvas || !landmarker || !isTrackerEnabled) return;

        if (video.paused || video.ended) {
            requestRef.current = requestAnimationFrame(trackPose);
            return;
        }

        const ctx = canvas.getContext('2d');
        if (ctx) {
            // Ensure canvas fits container size
            if (canvas.width !== video.clientWidth || canvas.height !== video.clientHeight) {
                canvas.width = video.clientWidth;
                canvas.height = video.clientHeight;
            }

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            try {
                // MediaPipe requires strictly monotonically increasing timestamps. 
                // video.currentTime might not change between RAF frames, which would throw an error.
                const timestamp = performance.now();
                const results = landmarker.detectForVideo(video, timestamp);

                if (results && results.landmarks && results.landmarks.length > 0) {
                    const landmarks = results.landmarks[0];
                    const width = canvas.width;
                    const height = canvas.height;

                    // Define joint connections for the skeleton
                    const connections = [
                        [11, 12], [11, 13], [13, 15], [12, 14], [14, 16], // Arms & Shoulders
                        [11, 23], [12, 24], [23, 24], // Torso
                        [23, 25], [24, 26], [25, 27], [26, 28], [27, 29], [28, 30], [29, 31], [30, 32] // Legs & Feet
                    ];

                    // Draw bones (connections) with a premium glowing emerald style
                    ctx.lineWidth = 3;
                    ctx.strokeStyle = 'rgba(16, 185, 129, 0.85)'; // Emerald green
                    ctx.shadowColor = 'rgba(16, 185, 129, 0.6)';
                    ctx.shadowBlur = 8;

                    connections.forEach(([i, j]) => {
                        const p1 = landmarks[i];
                        const p2 = landmarks[j];
                        if (p1 && p2 && p1.visibility > 0.5 && p2.visibility > 0.5) {
                            ctx.beginPath();
                            ctx.moveTo(p1.x * width, p1.y * height);
                            ctx.lineTo(p2.x * width, p2.y * height);
                            ctx.stroke();
                        }
                    });

                    // Draw joints (points)
                    ctx.shadowBlur = 0; // Reset shadow for crisp circles
                    landmarks.forEach((point: any, idx: number) => {
                        // Skip face landmarks (0 to 10) to avoid clutter, focus on skeletal movement (>= 11)
                        if (idx >= 11 && point.visibility > 0.5) {
                            ctx.beginPath();
                            ctx.arc(point.x * width, point.y * height, 5, 0, 2 * Math.PI);
                            ctx.fillStyle = '#34d399'; // Light emerald
                            ctx.fill();
                            ctx.strokeStyle = '#ffffff';
                            ctx.lineWidth = 1.5;
                            ctx.stroke();
                        }
                    });
                }
            } catch (err) {
                // Quietly bypass occasional video frame synchronization exceptions
            }
        }

        requestRef.current = requestAnimationFrame(trackPose);
    };

    // Triggered when tracker state changes
    useEffect(() => {
        if (isTrackerEnabled) {
            initMediaPipe().then((landmarker) => {
                if (landmarker) {
                    requestRef.current = requestAnimationFrame(trackPose);
                }
            });
        } else {
            if (requestRef.current) {
                cancelAnimationFrame(requestRef.current);
                requestRef.current = null;
            }
            // Clear canvas
            const canvas = canvasRef.current;
            if (canvas) {
                const ctx = canvas.getContext('2d');
                ctx?.clearRect(0, 0, canvas.width, canvas.height);
            }
        }

        return () => {
            if (requestRef.current) {
                cancelAnimationFrame(requestRef.current);
            }
        };
    }, [isTrackerEnabled]);

    return (
        <div className={`relative rounded-2xl overflow-hidden bg-zinc-950 border border-muted-foreground/10 group ${className}`}>
            <video
                id={id}
                ref={videoRef}
                src={src}
                controls
                playsInline
                className="w-full h-full object-cover aspect-video"
            />
            
            <canvas
                ref={canvasRef}
                className="absolute inset-0 w-full h-full pointer-events-none"
            />

            {/* Float Overlay Toggle Button */}
            <div className="absolute top-3 right-3 z-20 flex flex-col items-end gap-1.5">
                <button
                    onClick={() => setIsTrackerEnabled(!isTrackerEnabled)}
                    disabled={isLoadingModel}
                    className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 backdrop-blur-md border shadow-lg cursor-pointer ${
                        isTrackerEnabled
                            ? 'bg-primary/95 text-primary-foreground border-primary shadow-primary/25'
                            : 'bg-zinc-900/85 text-zinc-300 border-zinc-700/60 hover:bg-zinc-800'
                    }`}
                >
                    {isLoadingModel ? (
                        <>
                            <Loader2 className="h-3 w-3 animate-spin text-primary" />
                            Chargement Modèle...
                        </>
                    ) : (
                        <>
                            <Sparkles className={`h-3 w-3 ${isTrackerEnabled ? 'text-white' : 'text-primary'}`} />
                            {isTrackerEnabled ? 'Posture IA : ON' : 'Posture IA : OFF'}
                        </>
                    )}
                </button>
                {modelError && (
                    <span className="px-2 py-1 rounded bg-rose-500/90 text-white text-[8px] font-bold">
                        {modelError}
                    </span>
                )}
            </div>
        </div>
    );
}
