<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\TalentProfile;

$profiles = TalentProfile::with('user')->get();
$controller = app()->make('App\Http\Controllers\TalentController');
$res = [];
foreach ($profiles as $profile) {
    // Mimic exactly what's inside the compare controller method mapping
    $analyzedVideos = $profile->user->videos()->whereNotNull('ai_analysis')->where('status', 'ready')->get();
    $aiStatsList = [];
    foreach ($analyzedVideos as $v) {
        if (isset($v->ai_analysis['stats']) && is_array($v->ai_analysis['stats'])) {
            $aiStatsList[] = $v->ai_analysis['stats'];
        }
    }

    $overallStats = [];
    if (count($aiStatsList) > 0) {
        $sums = [];
        $counts = [];
        foreach ($aiStatsList as $stats) {
            foreach ($stats as $category => $value) {
                $val = is_array($value) ? ($value['score'] ?? 0) : $value;
                $sums[$category] = ($sums[$category] ?? 0) + (int)$val;
                $counts[$category] = ($counts[$category] ?? 0) + 1;
            }
        }
        foreach ($sums as $cat => $sum) {
            $overallStats[$cat] = round($sum / $counts[$cat]);
        }
    } else {
        $base = $profile->talent_score ?: 65;
        srand($profile->id);
        $overallStats = [
            'Physical' => min(99, max(40, $base + rand(-8, 5))),
            'Technical' => min(99, max(40, $base + rand(-5, 8))),
            'Tactical' => min(99, max(40, $base + rand(-7, 7))),
            'Mental' => min(99, max(40, $base + rand(-6, 6))),
            'Pace' => min(99, max(40, $base + rand(-10, 10))),
        ];
    }
    $res[] = ['id' => $profile->id, 'overall_stats' => $overallStats];
}
echo json_encode($res, JSON_PRETTY_PRINT);
