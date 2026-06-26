<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use App\Models\Video;

class GeminiService
{
    /**
     * Analyze video frames with player context using Gemini 1.5 Flash Vision API.
     *
     * @param Video $video
     * @param array $framePaths
     * @return array|null
     */
    public function analyzeVideoFrames(Video $video, array $framePaths): ?array
    {
        $apiKey = env('GEMINI_API_KEY');

        if (!$apiKey) {
            Log::warning('Gemini API key is not set in .env. Falling back to mock analysis.');
            return $this->getMockAnalysis($video);
        }

        $url = "https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=" . $apiKey;

        // Retrieve player/talent profile context
        $talent = $video->talentProfile;
        $name = $talent->display_name ?? $video->user->name;
        $position = $talent->position ?? 'CM';
        $foot = $talent->dominant_foot ?? 'both';
        $height = $talent->height_cm ? $talent->height_cm . ' cm' : '—';
        $weight = $talent->weight_kg ? $talent->weight_kg . ' kg' : '—';
        $bio = $talent->bio ?? '—';

        // Custom context prompt for a professional football scout
        $prompt = "You are a professional football (soccer) scout. Analyze these key frames extracted from a talent's highlight video.\n";
        $prompt .= "Here is the context of the player:\n";
        $prompt .= "- Name: {$name}\n";
        $prompt .= "- Position: {$position}\n";
        $prompt .= "- Dominant Foot: " . ($foot === 'R' ? 'Right' : ($foot === 'L' ? 'Left' : 'Both')) . "\n";
        $prompt .= "- Height: {$height}, Weight: {$weight}\n";
        $prompt .= "- Player Bio/Profile: {$bio}\n\n";
        
        $prompt .= "Perform a technical scouting analysis on the action visible in the frames.\n";
        $prompt .= "Your response MUST be in French and formatted in strict JSON using the following schema:\n";
        $prompt .= "{\n";
        $prompt .= "  \"score\": (an integer between 40 and 99 representing the potential/quality of the play/action),\n";
        $prompt .= "  \"stats\": {\n";
        $prompt .= "      \"Physical\": (integer 40-99),\n";
        $prompt .= "      \"Technical\": (integer 40-99),\n";
        $prompt .= "      \"Tactical\": (integer 40-99),\n";
        $prompt .= "      \"Mental\": (integer 40-99),\n";
        $prompt .= "      \"Pace\": (integer 40-99)\n";
        $prompt .= "  },\n";
        $prompt .= "  \"strengths\": [\"Strength 1 (short, 2-3 words)\", \"Strength 2 (short, 2-3 words)\"],\n";
        $prompt .= "  \"weaknesses\": [\"Weakness 1 (short, 2-3 words)\", \"Weakness 2 (short, 2-3 words)\"],\n";
        $prompt .= "  \"comparable_player\": \"Name of a world-class professional player with a similar style\",\n";
        $prompt .= "  \"summary\": \"A short professional scouting summary of 3-4 sentences in French describing what the player does well and what could be improved based on the images.\",\n";
        $prompt .= "  \"recommendations\": [\"Recommendation 1\", \"Recommendation 2\"],\n";
        $prompt .= "  \"timestamps\": [\n";
        $prompt .= "    { \"time\": \"00:15\", \"description\": \"Courte description d'une belle action (ex: Superbe dribble)\" }\n";
        $prompt .= "  ]\n";
        $prompt .= "}\n";
        $prompt .= "Make sure the JSON response contains ONLY the JSON object, without any markdown formatting or backticks.";

        // Build the contents block
        $parts = [
            ['text' => $prompt]
        ];

        // Attach each frame as base64 inlineData
        foreach ($framePaths as $path) {
            if (file_exists($path)) {
                $mimeType = 'image/jpeg';
                $base64Data = base64_encode(file_get_contents($path));
                $parts[] = [
                    'inlineData' => [
                        'mimeType' => $mimeType,
                        'data' => $base64Data
                    ]
                ];
            }
        }

        try {
            $response = Http::withoutVerifying()->timeout(30)->post($url, [
                'contents' => [
                    [
                        'parts' => $parts
                    ]
                ]
            ]);

            if ($response->successful()) {
                $body = $response->json();
                $text = $body['candidates'][0]['content']['parts'][0]['text'] ?? '{}';
                
                // Clean markdown block wrappers if Gemini ignored the instruction
                $cleanJson = trim($text);
                if (str_starts_with($cleanJson, '```json')) {
                    $cleanJson = substr($cleanJson, 7);
                }
                if (str_starts_with($cleanJson, '```')) {
                    $cleanJson = substr($cleanJson, 3);
                }
                if (str_ends_with($cleanJson, '```')) {
                    $cleanJson = substr($cleanJson, 0, -3);
                }
                $cleanJson = trim($cleanJson);

                $decoded = json_decode($cleanJson, true);
                if (is_array($decoded) && isset($decoded['score'])) {
                    return $decoded;
                }
            }

            Log::error('Gemini API call failed: ' . $response->body());
        } catch (\Exception $e) {
            Log::error('Error calling Gemini API: ' . $e->getMessage());
        }

        // Return fallback mock data if API call failed
        return $this->getMockAnalysis($video);
    }

    /**
     * Fallback mock analysis when API key is missing or calls fail.
     */
    private function getMockAnalysis(Video $video): array
    {
        $talent = $video->talentProfile;
        $position = strtoupper($talent->position ?? 'CM');

        $strengths = ['Vitesse de pointe', 'Dribbles courts', 'Agilité'];
        $weaknesses = ['Jeu de tête', 'Repli défensif'];
        $comparable = 'Luka Modrić';

        if ($position === 'GK') {
            $strengths = ['Réflexes sur la ligne', 'Sorties aériennes', 'Dégagements'];
            $weaknesses = ['Jeu au pied', 'Relance courte'];
            $comparable = 'Manuel Neuer';
        } elseif (in_array($position, ['CB', 'LB', 'RB'])) {
            $strengths = ['Interceptions tactiques', 'Solidité physique', 'Tacles glissés'];
            $weaknesses = ['Prise de risque offensive', 'Vitesse sur 100m'];
            $comparable = 'Virgil van Dijk';
        } elseif ($position === 'ST' || $position === 'CF') {
            $strengths = ['Finition clinique', 'Appels en profondeur', 'Dribbles explosifs'];
            $weaknesses = ['Duels de la tête', 'Pressing haut'];
            $comparable = 'Kylian Mbappé';
        }

        return [
            'score' => rand(74, 88),
            'strengths' => $strengths,
            'weaknesses' => $weaknesses,
            'comparable_player' => $comparable,
            'summary' => "Le joueur " . ($talent->display_name ?? 'du profil') . " a montré sur cette action une bonne maîtrise technique ainsi qu'une excellente coordination. Son aptitude physique lui permet de faire la différence dans les duels individuels, bien qu'il doive encore travailler son endurance et son jeu collectif.",
            'recommendations' => [
                "Travailler l'endurance et le pressing de transition.",
                "Améliorer l'efficacité dans la finition pied faible."
            ]
        ];
    }
}
