<?php

namespace App\Jobs;

use App\Models\Video;
use FFMpeg\Format\Video\X264;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Storage;
use ProtoneMedia\LaravelFFMpeg\Support\FFMpeg;

class ProcessVideoJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Create a new job instance.
     */
    public function __construct(public Video $video) {}

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        $this->video->update(['status' => 'processing']);

        $lowBitrateFormat = (new X264('libmp3lame', 'libx264'))->setKiloBitrate(1000);

        $tempPath = 'temp/'.$this->video->id.'.mp4';
        $thumbnailPath = 'thumbnails/'.$this->video->id.'.jpg';

        try {
            $ffmpeg = FFMpeg::fromDisk('public')
                ->open($this->video->file_path);

            $duration = $ffmpeg->getDurationInSeconds() ?: 5;

            // Detect orientation
            $dimensions = $ffmpeg->getVideoStream()->getDimensions();
            $orientation = $dimensions->getHeight() > $dimensions->getWidth() ? 'vertical' : 'cinema';

            // Transcode
            $ffmpeg->export()
                ->toDisk('public')
                ->inFormat($lowBitrateFormat)
                ->save($tempPath);

            // Generate thumbnail (use fresh instance)
            $ffmpegThumb = FFMpeg::fromDisk('public')->open($this->video->file_path);
            $ffmpegThumb->getFrameFromSeconds(1)
                ->export()
                ->toDisk('public')
                ->save($thumbnailPath);

            // Extract frames for Gemini Vision analysis
            $sec1 = max(1, (int)($duration * 0.25));
            $sec2 = max(2, (int)($duration * 0.60));

            $frameLocal1 = 'frame1_'.$this->video->id.'.jpg';
            $frameLocal2 = 'frame2_'.$this->video->id.'.jpg';

            try {
                $ffmpegFrame1 = FFMpeg::fromDisk('public')->open($this->video->file_path);
                $ffmpegFrame1->getFrameFromSeconds($sec1)->export()->toDisk('local')->save($frameLocal1);

                $ffmpegFrame2 = FFMpeg::fromDisk('public')->open($this->video->file_path);
                $ffmpegFrame2->getFrameFromSeconds($sec2)->export()->toDisk('local')->save($frameLocal2);

                $path1 = Storage::disk('local')->path($frameLocal1);
                $path2 = Storage::disk('local')->path($frameLocal2);

                $gemini = new \App\Services\GeminiService();
                $aiAnalysis = $gemini->analyzeVideoFrames($this->video, [$path1, $path2]);
            } catch (\Exception $ex) {
                \Illuminate\Support\Facades\Log::error('Frame extraction / AI analysis failed: ' . $ex->getMessage());
                $aiAnalysis = null;
            }

            // Clean up temporary frames
            Storage::disk('local')->delete($frameLocal1);
            Storage::disk('local')->delete($frameLocal2);

            $oldFilePath = $this->video->file_path;

            $this->video->update([
                'file_path' => $tempPath,
                'thumbnail_path' => $thumbnailPath,
                'orientation' => $orientation,
                'status' => 'ready',
                'duration_seconds' => $duration,
                'ai_analysis' => $aiAnalysis,
            ]);

            // Clean up original public file if it's different
            if ($oldFilePath !== $tempPath && Storage::disk('public')->exists($oldFilePath)) {
                Storage::disk('public')->delete($oldFilePath);
            }

        } catch (\Exception $e) {
            $this->video->update(['status' => 'failed']);
            throw $e;
        }
    }
}
