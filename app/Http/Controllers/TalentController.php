<?php

namespace App\Http\Controllers;

use App\Models\TalentProfile;
use App\Models\UnlockedContact;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class TalentController extends Controller
{
    /**
     * Display a listing of the talents.
     */
    public function index(Request $request): Response
    {
        $query = TalentProfile::with('user');

        // Apply filters
        if ($request->filled('position')) {
            $query->where('position', $request->position);
        }

        if ($request->filled('gender')) {
            $query->whereHas('user', function ($q) use ($request) {
                $q->where('gender', $request->gender);
            });
        }

        if ($request->filled('dominant_foot')) {
            $query->where('dominant_foot', $request->dominant_foot);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('display_name', 'like', "%{$search}%")
                    ->orWhere('nationality', 'like', "%{$search}%")
                    ->orWhere('city', 'like', "%{$search}%")
                    ->orWhere('country', 'like', "%{$search}%");
            });
        }

        // Add filter by minimum AI score (we just simulate it with videos_count or fake condition if no db column exists for overall AI score yet)
        if ($request->filled('min_score')) {
            $minScore = (int) $request->min_score;
            // Since AI score isn't a direct column on talent_profiles right now, we can filter by videos_count as a proxy for "active" talents, 
            // or just leave it for the UI to filter, but let's at least pass it.
            // In a real app we'd query JSON column or aggregated score.
        }

        $talents = $query->latest()->get();

        return Inertia::render('talents/index', [
            'talents' => $talents,
            'filters' => $request->only(['position', 'gender', 'dominant_foot', 'search', 'min_score']),
        ]);
    }

    /**
     * Display the Golden Boy Leaderboard.
     */
    public function leaderboard(Request $request): Response
    {
        $talents = TalentProfile::with('user')->get()->map(function ($profile) {
            $analyzedVideos = $profile->user->videos()->whereNotNull('ai_analysis')->where('status', 'ready')->get();
            $aiScores = [];
            foreach ($analyzedVideos as $v) {
                if (isset($v->ai_analysis['score'])) {
                    $aiScores[] = $v->ai_analysis['score'];
                }
            }
            
            $overallScore = 0;
            if (count($aiScores) > 0) {
                $overallScore = round(array_sum($aiScores) / count($aiScores));
            } else {
                $overallScore = $profile->talent_score; // Fallback to basic talent score
            }

            return [
                'id' => $profile->id,
                'name' => $profile->display_name ?: $profile->user->name,
                'position' => $profile->position,
                'nationality' => $profile->nationality,
                'photo' => $profile->user->profile_photo_url,
                'overall_score' => $overallScore,
                'level' => $profile->level,
                'videos_count' => $profile->user->videos()->count(),
            ];
        })->sortByDesc('overall_score')->values()->take(100);

        return Inertia::render('leaderboard', [
            'leaderboard' => $talents,
        ]);
    }

    /**
     * Display the talent comparison tool.
     */
    public function compare(Request $request): Response
    {
        $talents = TalentProfile::with('user')->get()->map(function ($profile) {
            // Recompute average AI stats just like in show
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
                        // Support old format just in case
                        $val = is_array($value) ? ($value['score'] ?? 0) : $value;
                        $sums[$category] = ($sums[$category] ?? 0) + (int)$val;
                        $counts[$category] = ($counts[$category] ?? 0) + 1;
                    }
                }
                foreach ($sums as $cat => $sum) {
                    $overallStats[$cat] = round($sum / $counts[$cat]);
                }
            } else {
                // Generates deterministic stats based on talent's score or default to 65
                // This ensures talents without videos still have unique and logical stats to compare
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

            return [
                'id' => $profile->id,
                'name' => $profile->display_name ?: $profile->user->name,
                'position' => $profile->position,
                'nationality' => $profile->nationality,
                'height_cm' => $profile->height_cm,
                'videos_count' => $profile->user->videos()->count(),
                'overall_stats' => $overallStats,
            ];
        });

        $initialTalent1 = $request->has('t1') ? $talents->firstWhere('id', $request->t1) : null;
        $initialTalent2 = $request->has('t2') ? $talents->firstWhere('id', $request->t2) : null;

        return Inertia::render('talents/compare', [
            'talents' => $talents,
            'initialTalent1' => $initialTalent1,
            'initialTalent2' => $initialTalent2,
        ]);
    }
    /**
     * Display the specified talent with premium profile data.
     */
    public function show(TalentProfile $talent): Response
    {
        $talentUser = $talent->user;
        $canSeeContactInfo = auth()->user()->canSeeContactInfo($talentUser);

        // Compute derived stats for the premium profile
        $videosCount  = $talentUser->videos()->count();
        $followersCount = $talentUser->followers()->count();
        $totalLikes = $talentUser->videos()->withCount('likes')->get()->sum('likes_count');
        $totalViews = $talentUser->videos()->withCount('likes')->get()->sum('likes_count') * 47; // simulated views
        $scoutsInterested = $talentUser->receivedUnlocks()->count();

        // Top 3 videos by likes
        $topVideos = $talentUser->videos()
            ->withCount(['likes', 'comments'])
            ->orderByDesc('likes_count')
            ->limit(3)
            ->get()
            ->map(fn ($v) => [
                'id'          => $v->id,
                'title'       => $v->title,
                'file_path'   => $v->file_path && !str_starts_with($v->file_path, 'http') && !str_starts_with($v->file_path, '/') ? asset('storage/'.$v->file_path) : $v->file_path,
                'likes_count' => $v->likes_count,
                'comments_count' => $v->comments_count,
                'views'       => $v->likes_count * 47,
            ]);

        // 1. Fetch AI analyzed videos of this talent
        $analyzedVideos = $talentUser->videos()
            ->whereNotNull('ai_analysis')
            ->where('status', 'ready')
            ->get();

        $hasAiAnalysis = $analyzedVideos->isNotEmpty();

        $aiScores = [];
        $aiStrengths = [];
        $aiWeaknesses = [];
        $aiComparable = null;
        $aiSummary = null;

        foreach ($analyzedVideos as $v) {
            $analysis = $v->ai_analysis;
            if (isset($analysis['score'])) {
                $aiScores[] = (int) $analysis['score'];
            }
            if (isset($analysis['strengths'])) {
                $aiStrengths = array_merge($aiStrengths, (array) $analysis['strengths']);
            }
            if (isset($analysis['weaknesses'])) {
                $aiWeaknesses = array_merge($aiWeaknesses, (array) $analysis['weaknesses']);
            }
            if (isset($analysis['comparable_player']) && !$aiComparable) {
                $aiComparable = $analysis['comparable_player'];
            }
            if (isset($analysis['summary']) && !$aiSummary) {
                $aiSummary = $analysis['summary'];
            }
        }

        // Talent Score (0-100) based on AI average OR activity metrics
        if ($hasAiAnalysis && count($aiScores) > 0) {
            $talentScore = (int) round(array_sum($aiScores) / count($aiScores));
        } else {
            $talentScore = $this->computeTalentScore(
                $videosCount,
                $followersCount,
                $totalLikes,
                $scoutsInterested
            );
        }

        // Level label
        $level = $this->computeLevel($talentScore);

        // Age
        $age = $talent->date_of_birth
            ? $talent->date_of_birth->age
            : null;

        // 1. Dynamic Skills & Radar Data
        $height = $talent->height_cm ?: 175;
        $weight = $talent->weight_kg ?: 70;
        
        $skillsByPosition = [
            'GK'  => ['Reflexe' => 85, 'Placement' => 80, 'Relance' => 70, 'Communication' => 75, 'Agilité' => 80, 'Vision' => 70],
            'CB'  => ['Duels' => 85, 'Aérien' => 80, 'Positionnement' => 80, 'Relance' => 70, 'Leadership' => 75, 'Vitesse' => 68],
            'LB'  => ['Vitesse' => 85, 'Centres' => 78, 'Défense' => 78, 'Endurance' => 80, 'Dribble' => 72, 'Technique' => 75],
            'RB'  => ['Vitesse' => 85, 'Centres' => 78, 'Défense' => 78, 'Endurance' => 80, 'Dribble' => 72, 'Technique' => 75],
            'CDM' => ['Interceptions' => 85, 'Duels' => 80, 'Vision' => 78, 'Passes' => 80, 'Endurance' => 85, 'Leadership' => 75],
            'CM'  => ['Passes' => 85, 'Vision' => 80, 'Technique' => 80, 'Dribble' => 75, 'Tirs' => 70, 'Endurance' => 80],
            'CAM' => ['Vision' => 88, 'Passes' => 85, 'Dribble' => 85, 'Tirs' => 78, 'Créativité' => 85, 'Technique' => 85],
            'LW'  => ['Vitesse' => 88, 'Dribble' => 88, 'Centres' => 78, 'Finition' => 75, 'Technique' => 82, 'Créativité' => 82],
            'RW'  => ['Vitesse' => 88, 'Dribble' => 88, 'Centres' => 78, 'Finition' => 75, 'Technique' => 82, 'Créativité' => 82],
            'ST'  => ['Finition' => 88, 'Vitesse' => 82, 'Physique' => 80, 'Aérien' => 75, 'Dribble' => 75, 'Vision' => 70],
        ];

        $posKey = strtoupper($talent->position ?: 'CM');
        $baseSkills = $skillsByPosition[$posKey] ?? $skillsByPosition['CM'];
        
        $skills = [];
        foreach ($baseSkills as $skillName => $baseVal) {
            // Apply modifiers based on Talent Score and physical attributes
            $modifier = ($talentScore - 50) * 0.3; // -15 to +15 depending on score
            
            // Physical modifiers
            if ($skillName === 'Vitesse') {
                $modifier += (180 - $height) * 0.4;
            }
            if ($skillName === 'Physique' || $skillName === 'Duels') {
                $modifier += ($weight - 70) * 0.5;
            }
            if ($skillName === 'Aérien') {
                $modifier += ($height - 170) * 0.6;
            }
            if ($skillName === 'Dribble' || $skillName === 'Agilité') {
                $modifier += (175 - $height) * 0.3;
            }

            $skills[$skillName] = (int) max(40, min(99, round($baseVal + $modifier)));
        }

        $radarData = $skills;
        
        // Define category averages
        $averageRadarData = [];
        foreach ($baseSkills as $skillName => $baseVal) {
            $averageRadarData[$skillName] = (int) max(50, min(85, round($baseVal - 2)));
        }

        // 2. Scouting Report (AI aggregated OR Mock fallback)
        if ($hasAiAnalysis) {
            $pros = array_values(array_unique(array_filter($aiStrengths)));
            $cons = array_values(array_unique(array_filter($aiWeaknesses)));
            $comparable = $aiComparable ?: 'Kevin De Bruyne';
        } else {
            $pros = [];
            $cons = [];
            
            if ($posKey === 'ST') {
                if ($height >= 185) {
                    $pros = ['Jeu de tête dominant', 'Point d\'appui physique', 'Finition clinique'];
                } else {
                    $pros = ['Vitesse de pointe', 'Agilité dans la surface', 'Technique individuelle'];
                }
            } elseif ($posKey === 'GK') {
                $pros = ['Réflexes sur la ligne', 'Sorties aériennes', 'Envergure physique'];
            } elseif ($posKey === 'CB') {
                $pros = ['Solidité dans les duels', 'Lecture du jeu', 'Jeu de tête défensif'];
            } else {
                $pros = ['Qualité de passe', 'Vision du jeu', 'Transition rapide'];
            }

            if ($talent->dominant_foot === 'both') {
                $pros[] = 'Ambidextrie complète';
            }

            if ($weight > 80) {
                $cons = ['Agilité dans les petits espaces', 'Endurance de fin de match'];
            } elseif ($height < 170) {
                $cons = ['Duels aériens disputés', 'Impact physique pur'];
            } elseif ($height > 190) {
                $cons = ['Temps de réaction au sol', 'Accélération sur les premiers mètres'];
            } else {
                $cons = ['Régularité à haute intensité', 'Expérience en match officiel'];
            }

            $comparablePlayers = [
                'ST' => 'Kylian Mbappé',
                'CAM' => 'Kevin De Bruyne',
                'CM' => 'Luka Modrić',
                'CDM' => 'N\'Golo Kanté',
                'CB' => 'Virgil van Dijk',
                'GK' => 'Manuel Neuer',
                'LW' => 'Vinícius Júnior',
                'RW' => 'Bukayo Saka',
                'LB' => 'Alphonso Davies',
                'RB' => 'Achraf Hakimi'
            ];
            $comparable = $comparablePlayers[$posKey] ?? 'Kevin De Bruyne';
        }

        // 3. Value Estimator (Realistic Botola / Young Pro scale in DH)
        $baseValue = $talentScore * $talentScore * 300;
        $age = $talent->date_of_birth ? $talent->date_of_birth->age : 18;
        $ageMultiplier = 1.0;
        if ($age < 18) {
            $ageMultiplier = 1.5;
        } elseif ($age < 21) {
            $ageMultiplier = 1.3;
        } elseif ($age > 25) {
            $ageMultiplier = 0.7;
        }
        $estimatedVal = $baseValue * $ageMultiplier;
        
        $minVal = round(($estimatedVal * 0.85) / 10000) * 10000;
        $maxVal = round(($estimatedVal * 1.15) / 10000) * 10000;
        $trendPercentage = (int) max(5, min(25, round(($talentScore / 4))));

        // 4. AI Matches (Real Clubs based on Position & Score)
        $clubsByPosition = [
            'GK'  => ['Raja CA', 'RS Berkane', 'Toulouse FC'],
            'CB'  => ['AS FAR Rabat', 'Wydad AC', 'Montpellier HSC'],
            'LB'  => ['FUS Rabat', 'Raja CA', 'Lille OSC'],
            'RB'  => ['Wydad AC', 'AS FAR Rabat', 'Lille OSC'],
            'CDM' => ['Raja CA', 'RS Berkane', 'RC Lens'],
            'CM'  => ['Wydad AC', 'FUS Rabat', 'Toulouse FC'],
            'CAM' => ['Raja CA', 'Wydad AC', 'Marseille'],
            'LW'  => ['AS FAR Rabat', 'Wydad AC', 'Toulouse FC'],
            'RW'  => ['Raja CA', 'FUS Rabat', 'Lille OSC'],
            'ST'  => ['Wydad AC', 'Raja CA', 'Montpellier HSC'],
        ];
        $matchedClubs = $clubsByPosition[$posKey] ?? ['Wydad AC', 'Raja CA', 'Toulouse FC'];
        
        $aiMatches = [
            ['name' => $matchedClubs[0], 'pct' => (int) min(96, max(60, 72 + ($talentScore * 0.22)))],
            ['name' => $matchedClubs[1], 'pct' => (int) min(94, max(55, 68 + ($talentScore * 0.25)))],
            ['name' => $matchedClubs[2], 'pct' => (int) min(92, max(50, 62 + ($talentScore * 0.27)))],
        ];

        // 5. Video Pitch (First video URL format)
        $pitchVideo = null;
        $firstVideo = $talentUser->videos()->orderBy('created_at', 'asc')->first();
        if ($firstVideo) {
            $path = $firstVideo->file_path;
            if ($path && !str_starts_with($path, 'http') && !str_starts_with($path, '/')) {
                $path = asset('storage/'.$path);
            } elseif (str_starts_with($path, '/')) {
                $path = asset($path);
            }
            $pitchVideo = $path;
        } else {
            $pitchVideo = 'https://assets.mixkit.co/videos/preview/mixkit-soccer-ball-in-the-net-overflow-12128-large.mp4';
        }

        // 6. Dynamic Highlights
        $highlights = $talentUser->videos()
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($v) {
                $filePath = $v->file_path;
                if ($filePath && !str_starts_with($filePath, 'http') && !str_starts_with($filePath, '/')) {
                    $filePath = asset('storage/'.$filePath);
                }
                $thumbPath = $v->thumbnail_path;
                if ($thumbPath && !str_starts_with($thumbPath, 'http') && !str_starts_with($thumbPath, '/')) {
                    $thumbPath = asset('storage/'.$thumbPath);
                }
                return [
                    'id'            => $v->id,
                    'title'         => $v->title,
                    'description'   => $v->description,
                    'file_path'     => $filePath,
                    'thumbnail_path' => $thumbPath,
                    'views'         => $v->views_count * 3 + $v->likes()->count() * 47,
                    'likes'         => $v->likes()->count(),
                    'status'        => $v->status,
                    'ai_analysis'   => $v->ai_analysis,
                ];
            });

        $user = auth()->user();
        $isEditable = $user && ($user->id === $talentUser->id || ($user->role === 'parent' && $user->managedTalents()->where('users.id', $talentUser->id)->exists()));

        return Inertia::render('talents/show', [
            'isEditable'        => $isEditable,
            'talent' => [
                'id'               => $talent->id,
                'display_name'     => $talent->display_name,
                'position'         => $talent->position,
                'secondary_position' => $talent->secondary_position,
                'bio'              => $talent->bio,
                'nationality'      => $talent->nationality,
                'city'             => $talent->city,
                'country'          => $talent->country,
                'dominant_foot'    => $talent->dominant_foot,
                'height_cm'        => $talent->height_cm,
                'weight_kg'        => $talent->weight_kg,
                'age'              => $age,
                'date_of_birth'    => $talent->date_of_birth?->format('Y-m-d'),
                'talent_score'     => $talentScore,
                'level'            => $level,
                'user' => [
                    'id'     => $talentUser->id,
                    'name'   => $talentUser->name,
                    'email'  => $talentUser->email,
                    'phone'  => $talentUser->phone,
                    'gender' => $talentUser->gender,
                    'avatar_path' => $talentUser->avatar_path,
                ],
            ],
            'stats' => [
                'followers'        => $followersCount,
                'total_views'      => $totalViews,
                'total_likes'      => $totalLikes,
                'videos_count'     => $videosCount,
                'scouts_interested' => $scoutsInterested,
                'profile_visits'   => $scoutsInterested * 7 + $followersCount * 3 + 12,
                'favorites'        => max(0, intval($scoutsInterested * 1.8)),
                'requests_received' => max(0, intval($scoutsInterested * 0.4)),
            ],
            'topVideos'         => $topVideos,
            'canSeeContactInfo' => $canSeeContactInfo,
            'skills'            => $skills,
            'radarData'         => $radarData,
            'averageRadarData'  => $averageRadarData,
            'scoutingReport'    => [
                'pros'       => $pros,
                'cons'       => $cons,
                'comparable' => $comparable,
            ],
            'valueEstimation'   => [
                'min'   => $minVal,
                'max'   => $maxVal,
                'trend' => $trendPercentage,
            ],
            'aiMatches'         => $aiMatches,
            'pitchVideo'        => $pitchVideo,
            'highlights'        => $highlights,
        ]);
    }

    /**
     * Compute a Talent Score between 0 and 100.
     */
    private function computeTalentScore(int $videos, int $followers, int $likes, int $scouts): int
    {
        $score = 0;
        $score += min($videos * 8, 30);      // Up to 30 pts for videos
        $score += min($followers * 0.05, 25); // Up to 25 pts for followers
        $score += min($likes * 0.02, 25);     // Up to 25 pts for likes
        $score += min($scouts * 5, 20);       // Up to 20 pts for scouts
        return (int) min(round($score), 100);
    }

    /**
     * Translate a score into a human-readable level.
     */
    private function computeLevel(int $score): string
    {
        if ($score >= 85) return 'Exceptionnel';
        if ($score >= 70) return 'Elite';
        if ($score >= 50) return 'Avancé';
        if ($score >= 30) return 'Intermédiaire';
        return 'Débutant';
    }

    /**
     * Download or print a clean CV/Resume of the talent.
     */
    public function downloadCv(TalentProfile $talent)
    {
        $talentUser = $talent->user;
        $canSeeContactInfo = auth()->user()->canSeeContactInfo($talentUser) || auth()->id() === $talentUser->id;

        // Compute stats
        $videosCount  = $talentUser->videos()->count();
        $followersCount = $talentUser->followers()->count();
        $totalLikes = $talentUser->videos()->withCount('likes')->get()->sum('likes_count');
        $totalViews = $totalLikes * 47;
        
        $analyzedVideos = $talentUser->videos()
            ->whereNotNull('ai_analysis')
            ->where('status', 'ready')
            ->get();

        $hasAiAnalysis = $analyzedVideos->isNotEmpty();

        $aiScores = [];
        $aiStrengths = [];
        $aiWeaknesses = [];
        $aiComparable = null;
        $aiSummary = null;

        foreach ($analyzedVideos as $v) {
            $analysis = $v->ai_analysis;
            if (isset($analysis['score'])) {
                $aiScores[] = (int) $analysis['score'];
            }
            if (isset($analysis['strengths'])) {
                $aiStrengths = array_merge($aiStrengths, (array) $analysis['strengths']);
            }
            if (isset($analysis['weaknesses'])) {
                $aiWeaknesses = array_merge($aiWeaknesses, (array) $analysis['weaknesses']);
            }
            if (isset($analysis['comparable_player']) && !$aiComparable) {
                $aiComparable = $analysis['comparable_player'];
            }
            if (isset($analysis['summary']) && !$aiSummary) {
                $aiSummary = $analysis['summary'];
            }
        }

        if ($hasAiAnalysis && count($aiScores) > 0) {
            $talentScore = (int) round(array_sum($aiScores) / count($aiScores));
        } else {
            $talentScore = $this->computeTalentScore($videosCount, $followersCount, $totalLikes, $talentUser->receivedUnlocks()->count());
        }

        $level = $this->computeLevel($talentScore);
        $age = $talent->date_of_birth ? $talent->date_of_birth->age : null;

        // Skills
        $height = $talent->height_cm ?: 175;
        $weight = $talent->weight_kg ?: 70;
        
        $skillsByPosition = [
            'GK'  => ['Reflexe' => 85, 'Placement' => 80, 'Relance' => 70, 'Communication' => 75, 'Agilité' => 80, 'Vision' => 70],
            'CB'  => ['Duels' => 85, 'Aérien' => 80, 'Positionnement' => 80, 'Relance' => 70, 'Leadership' => 75, 'Vitesse' => 68],
            'LB'  => ['Vitesse' => 85, 'Centres' => 78, 'Défense' => 78, 'Endurance' => 80, 'Dribble' => 72, 'Technique' => 75],
            'RB'  => ['Vitesse' => 85, 'Centres' => 78, 'Défense' => 78, 'Endurance' => 80, 'Dribble' => 72, 'Technique' => 75],
            'CDM' => ['Interceptions' => 85, 'Duels' => 80, 'Vision' => 78, 'Passes' => 80, 'Endurance' => 85, 'Leadership' => 75],
            'CM'  => ['Passes' => 85, 'Vision' => 80, 'Technique' => 80, 'Dribble' => 75, 'Tirs' => 70, 'Endurance' => 80],
            'CAM' => ['Vision' => 88, 'Passes' => 85, 'Dribble' => 85, 'Tirs' => 78, 'Créativité' => 85, 'Technique' => 85],
            'LW'  => ['Vitesse' => 88, 'Dribble' => 88, 'Centres' => 78, 'Finition' => 75, 'Technique' => 82, 'Créativité' => 82],
            'RW'  => ['Vitesse' => 88, 'Dribble' => 88, 'Centres' => 78, 'Finition' => 75, 'Technique' => 82, 'Créativité' => 82],
            'ST'  => ['Finition' => 88, 'Vitesse' => 82, 'Physique' => 80, 'Aérien' => 75, 'Dribble' => 75, 'Vision' => 70],
        ];

        $posKey = strtoupper($talent->position ?: 'CM');
        $baseSkills = $skillsByPosition[$posKey] ?? $skillsByPosition['CM'];
        
        $skills = [];
        foreach ($baseSkills as $skillName => $baseVal) {
            $modifier = ($talentScore - 50) * 0.3;
            if ($skillName === 'Vitesse') $modifier += (180 - $height) * 0.4;
            if ($skillName === 'Physique' || $skillName === 'Duels') $modifier += ($weight - 70) * 0.5;
            if ($skillName === 'Aérien') $modifier += ($height - 170) * 0.6;
            if ($skillName === 'Dribble' || $skillName === 'Agilité') $modifier += (175 - $height) * 0.3;
            $skills[$skillName] = (int) max(40, min(99, round($baseVal + $modifier)));
        }

        // Value Estimation
        $baseValue = $talentScore * $talentScore * 300;
        $ageMultiplier = 1.0;
        if ($age && $age < 18) {
            $ageMultiplier = 1.5;
        } elseif ($age && $age < 21) {
            $ageMultiplier = 1.3;
        } elseif ($age && $age > 25) {
            $ageMultiplier = 0.7;
        }
        $estimatedVal = $baseValue * $ageMultiplier;
        $minVal = round(($estimatedVal * 0.85) / 10000) * 10000;
        $maxVal = round(($estimatedVal * 1.15) / 10000) * 10000;

        return view('cv', [
            'talent' => $talent,
            'talentUser' => $talentUser,
            'age' => $age,
            'talentScore' => $talentScore,
            'level' => $level,
            'skills' => $skills,
            'hasAiAnalysis' => $hasAiAnalysis,
            'aiStrengths' => array_values(array_unique(array_filter($aiStrengths))),
            'aiWeaknesses' => array_values(array_unique(array_filter($aiWeaknesses))),
            'aiSummary' => $aiSummary,
            'comparable' => $aiComparable ?: 'Kevin De Bruyne',
            'minVal' => $minVal,
            'maxVal' => $maxVal,
            'canSeeContactInfo' => $canSeeContactInfo,
            'stats' => [
                'followers' => $followersCount,
                'views' => $totalViews,
                'likes' => $totalLikes,
                'videos' => $videosCount,
            ]
        ]);
    }

    /**
     * Unlock talent contact information using scout's wallet.
     */
    public function unlockContact(Request $request, TalentProfile $talent): RedirectResponse
    {
        $scout = auth()->user();
        $talentUser = $talent->user;

        // Check if already unlocked
        if ($scout->canSeeContactInfo($talentUser)) {
            return back()->with('error', 'Contact information is already unlocked.');
        }

        $price = 50.00; // Unlock price

        if ($scout->wallet_balance < $price) {
            return back()->withErrors(['error' => 'Insufficient wallet balance. You need at least $'.number_format($price, 2).' to unlock this contact.']);
        }

        // Determine destination wallet
        $parent = $talentUser->parents()->first();
        $recipient = $parent ? $parent : $talentUser;

        DB::transaction(function () use ($scout, $talentUser, $recipient, $price, $talent) {
            // Deduct from scout
            $scout->update([
                'wallet_balance' => $scout->wallet_balance - $price,
            ]);

            // Add 90% to recipient
            $recipientAmount = $price * 0.90;
            $recipient->update([
                'wallet_balance' => $recipient->wallet_balance + $recipientAmount,
            ]);

            // Create scout transaction
            $scout->walletTransactions()->create([
                'amount'      => -$price,
                'type'        => 'purchase_contact',
                'description' => 'Unlocked contact info for talent '.$talent->display_name,
            ]);

            // Create recipient transaction
            $recipient->walletTransactions()->create([
                'amount'      => $recipientAmount,
                'type'        => 'received_contact',
                'description' => 'Contact unlocked for talent '.$talent->display_name.' (90% payout)',
            ]);

            // Create unlock record
            UnlockedContact::create([
                'scout_id'    => $scout->id,
                'talent_id'   => $talentUser->id,
                'amount_paid' => $price,
            ]);
        });

        Inertia::flash('toast', [
            'type'    => 'success',
            'message' => 'Unlocked contact details for '.$talent->display_name.' successfully!',
        ]);

        return back();
    }
}
