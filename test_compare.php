<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$request = Illuminate\Http\Request::create('/talents/compare', 'GET');
$controller = app()->make('App\Http\Controllers\TalentController');
$response = $controller->compare($request);

$props = $response->toResponse($request)->getOriginalContent()->getData();
$talents = $props['page']['props']['talents'];

foreach ($talents as $t) {
    echo "Talent ID: {$t['id']}, Name: {$t['name']}\n";
    echo "Overall Stats: " . json_encode($t['overall_stats']) . "\n\n";
}
