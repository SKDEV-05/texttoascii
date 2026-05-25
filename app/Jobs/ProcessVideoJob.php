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
            $ffmpeg = FFMpeg::fromDisk('local')
                ->open($this->video->file_path);

            // Detect orientation
            $dimensions = $ffmpeg->getVideoStream()->getDimensions();
            $orientation = $dimensions->getHeight() > $dimensions->getWidth() ? 'vertical' : 'cinema';

            // Transcode
            $ffmpeg->export()
                ->toDisk('s3')
                ->inFormat($lowBitrateFormat)
                ->save($tempPath);

            // Generate thumbnail
            $ffmpeg->getFrameFromSeconds(1)
                ->export()
                ->toDisk('s3')
                ->save($thumbnailPath);

            $this->video->update([
                'file_path' => $tempPath,
                'thumbnail_path' => $thumbnailPath,
                'orientation' => $orientation,
                'status' => 'ready',
                'duration_seconds' => $ffmpeg->getDurationInSeconds(),
            ]);

            // Clean up original local file if it's different
            if (Storage::disk('local')->exists($this->video->file_path)) {
                Storage::disk('local')->delete($this->video->file_path);
            }

        } catch (\Exception $e) {
            $this->video->update(['status' => 'failed']);
            throw $e;
        }
    }
}
