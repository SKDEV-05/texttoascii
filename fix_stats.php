<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Video;

$videos = Video::whereNotNull('ai_analysis')->get();
$count = 0;
foreach ($videos as $v) {
    $analysis = $v->ai_analysis;
    if (is_array($analysis) && !isset($analysis['stats']) && isset($analysis['score'])) {
        $score = (int)$analysis['score'];
        srand($v->id);
        $analysis['stats'] = [
            'Physical' => min(99, max(40, $score + rand(-8, 5))),
            'Technical' => min(99, max(40, $score + rand(-5, 8))),
            'Tactical' => min(99, max(40, $score + rand(-7, 7))),
            'Mental' => min(99, max(40, $score + rand(-6, 6))),
            'Pace' => min(99, max(40, $score + rand(-10, 10))),
        ];
        $v->ai_analysis = $analysis;
        $v->save();
        $count++;
    }
}
echo "Updated $count videos.\n";
