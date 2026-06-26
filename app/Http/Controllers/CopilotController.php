<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use App\Models\TalentProfile;

class CopilotController extends Controller
{
    public function ask(Request $request)
    {
        $request->validate([
            'message' => 'required|string|max:1000',
        ]);

        $query = $request->input('message');
        $apiKey = env('GEMINI_API_KEY');

        if (!$apiKey) {
            return response()->json([
                'answer' => "Je suis désolé, mais la clé d'API Gemini n'est pas configurée. Veuillez l'ajouter à votre fichier .env pour que je puisse vous aider.",
                'talents' => []
            ]);
        }

        $url = "https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=" . $apiKey;

        $prompt = "Tu es 'Scout IA', un assistant intelligent expert en recrutement de football sur la plateforme EndoTalent. Ton but est d'aider les recruteurs à trouver des talents ou à répondre à leurs questions.\n";
        $prompt .= "Un recruteur te demande : \"{$query}\"\n\n";
        $prompt .= "Ta réponse DOIT être en format JSON strict, sans bloc de code (pas de ```json), avec cette structure :\n";
        $prompt .= "{\n";
        $prompt .= "  \"answer\": \"Ta réponse naturelle et professionnelle au recruteur en Markdown.\",\n";
        $prompt .= "  \"filters\": {\n";
        $prompt .= "     \"position\": \"(Optionnel) Le poste recherché (ex: GK, CB, LB, RB, CDM, CM, CAM, LW, RW, ST). Met null si non spécifié.\",\n";
        $prompt .= "     \"dominant_foot\": \"(Optionnel) left, right, ou both. Met null si non spécifié.\",\n";
        $prompt .= "     \"min_score\": \"(Optionnel) Le score IA minimum recherché (entier, ex: 80). Met null si non spécifié.\"\n";
        $prompt .= "  }\n";
        $prompt .= "}\n";

        try {
            $response = Http::withoutVerifying()->timeout(30)->post($url, [
                'contents' => [
                    [
                        'parts' => [
                            ['text' => $prompt]
                        ]
                    ]
                ]
            ]);

            if ($response->successful()) {
                $body = $response->json();
                $text = $body['candidates'][0]['content']['parts'][0]['text'] ?? '{}';
                
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

                $data = json_decode($cleanJson, true);
                
                if (!$data || !isset($data['answer'])) {
                    throw new \Exception("Invalid JSON format from Gemini");
                }

                $talentsData = [];
                $filters = $data['filters'] ?? [];

                // Si l'IA a détecté une recherche de talents
                if (!empty($filters['position']) || !empty($filters['dominant_foot']) || !empty($filters['min_score'])) {
                    $dbQuery = TalentProfile::with('user');

                    if (!empty($filters['position'])) {
                        $dbQuery->where('position', strtoupper($filters['position']));
                    }

                    if (!empty($filters['dominant_foot'])) {
                        $foot = strtolower($filters['dominant_foot']);
                        if (in_array($foot, ['left', 'right', 'both'])) {
                            $dbQuery->where('dominant_foot', $foot);
                        }
                    }

                    $talents = $dbQuery->get();

                    foreach ($talents as $profile) {
                        // Calcul du score IA moyen
                        $analyzedVideos = $profile->user->videos()->whereNotNull('ai_analysis')->where('status', 'ready')->get();
                        $aiScores = [];
                        foreach ($analyzedVideos as $v) {
                            if (isset($v->ai_analysis['scores']) && is_array($v->ai_analysis['scores'])) {
                                $aiScores[] = $v->ai_analysis['scores'];
                            }
                        }

                        $overallScore = 0;
                        if (count($aiScores) > 0) {
                            $sum = 0;
                            $count = 0;
                            foreach ($aiScores as $scores) {
                                foreach ($scores as $cat => $val) {
                                    $sum += (int)($val['score'] ?? 0);
                                    $count++;
                                }
                            }
                            $overallScore = $count > 0 ? round($sum / $count) : 0;
                        }

                        // Filtre par min_score après avoir calculé la moyenne
                        if (!empty($filters['min_score'])) {
                            if ($overallScore < (int)$filters['min_score']) {
                                continue;
                            }
                        }

                        $talentsData[] = [
                            'id' => $profile->id,
                            'name' => $profile->display_name ?: $profile->user->name,
                            'position' => $profile->position,
                            'overall_score' => $overallScore > 0 ? $overallScore : null,
                            'photo' => $profile->user->profile_photo_url
                        ];
                    }

                    if (count($talentsData) > 0) {
                        $data['answer'] .= "\n\n**J'ai trouvé " . count($talentsData) . " talent(s) correspondant à vos critères :**";
                    } else {
                        $data['answer'] .= "\n\n*Malheureusement, je n'ai trouvé aucun talent correspondant exactement à ces critères dans la base de données actuelle.*";
                    }
                }

                return response()->json([
                    'answer' => $data['answer'],
                    'talents' => $talentsData
                ]);
            }

            throw new \Exception("Gemini API Error");

        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error("Copilot Error: " . $e->getMessage());
            return response()->json([
                'answer' => "Une erreur s'est produite lors de la communication avec l'intelligence artificielle.",
                'talents' => []
            ], 500);
        }
    }
}
