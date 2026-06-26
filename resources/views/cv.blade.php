<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CV EndoTalent - {{ $talentUser->name }}</title>
    <!-- Google Fonts -->
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700;900&display=swap" rel="stylesheet">
    <style>
        :root {
            --primary: #22c55e;
            --primary-dark: #16a34a;
            --dark: #0f172a;
            --gray: #64748b;
            --light-gray: #f8fafc;
            --border: #e2e8f0;
        }
        
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        body {
            font-family: 'Outfit', sans-serif;
            color: var(--dark);
            background: #ffffff;
            line-height: 1.5;
            padding: 40px;
        }

        .cv-container {
            max-width: 900px;
            margin: 0 auto;
            border: 1px solid var(--border);
            border-radius: 24px;
            padding: 40px;
            background: #ffffff;
            box-shadow: 0 10px 30px rgba(0,0,0,0.03);
        }

        /* Header */
        .cv-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            border-bottom: 2px solid var(--border);
            padding-bottom: 30px;
            margin-bottom: 30px;
        }

        .brand-section {
            text-align: right;
        }

        .brand-name {
            font-size: 20px;
            font-weight: 900;
            color: var(--primary);
            text-transform: uppercase;
            letter-spacing: 2px;
        }

        .brand-sub {
            font-size: 10px;
            font-weight: 700;
            text-transform: uppercase;
            color: var(--gray);
            letter-spacing: 1px;
            margin-top: 2px;
        }

        .player-title h1 {
            font-size: 32px;
            font-weight: 900;
            text-transform: uppercase;
            letter-spacing: -0.5px;
            line-height: 1.1;
        }

        .player-subtitle {
            display: flex;
            gap: 12px;
            align-items: center;
            margin-top: 8px;
            font-weight: 600;
            font-size: 13px;
        }

        .badge {
            background: rgba(34, 197, 94, 0.1);
            color: var(--primary-dark);
            padding: 3px 10px;
            border-radius: 8px;
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 1px;
        }

        .player-meta {
            color: var(--gray);
            font-size: 12px;
        }

        /* Two Column Grid */
        .cv-grid {
            display: grid;
            grid-template-columns: 1fr 1.8fr;
            gap: 40px;
        }

        /* Left Side */
        .side-col {
            display: flex;
            flex-direction: column;
            gap: 30px;
        }

        /* Right Side */
        .main-col {
            display: flex;
            flex-direction: column;
            gap: 30px;
        }

        .section-title {
            font-size: 12px;
            font-weight: 900;
            text-transform: uppercase;
            letter-spacing: 1.5px;
            color: var(--gray);
            margin-bottom: 15px;
            border-left: 3px solid var(--primary);
            padding-left: 10px;
        }

        /* Info Card */
        .info-card {
            background: var(--light-gray);
            padding: 20px;
            border-radius: 16px;
            border: 1px solid var(--border);
        }

        .info-item {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid rgba(0,0,0,0.04);
            font-size: 13px;
        }

        .info-item:last-child {
            border-bottom: none;
            padding-bottom: 0;
        }

        .info-label {
            color: var(--gray);
            font-weight: 600;
        }

        .info-value {
            font-weight: 700;
        }

        /* Skills */
        .skill-item {
            margin-bottom: 12px;
        }

        .skill-header {
            display: flex;
            justify-content: space-between;
            font-size: 12px;
            font-weight: 700;
            margin-bottom: 4px;
        }

        .skill-bar-bg {
            height: 8px;
            background: var(--border);
            border-radius: 4px;
            overflow: hidden;
        }

        .skill-bar-fill {
            height: 100%;
            background: linear-gradient(90deg, var(--primary), var(--primary-dark));
            border-radius: 4px;
        }

        /* AI Section */
        .ai-banner {
            background: linear-gradient(135deg, rgba(34, 197, 94, 0.06), rgba(22, 163, 74, 0.02));
            border: 1px solid rgba(34, 197, 94, 0.2);
            padding: 24px;
            border-radius: 20px;
            position: relative;
        }

        .ai-badge {
            background: var(--primary);
            color: white;
            font-size: 9px;
            font-weight: 900;
            text-transform: uppercase;
            padding: 2px 8px;
            border-radius: 6px;
            display: inline-block;
            margin-bottom: 12px;
            letter-spacing: 1px;
        }

        .ai-score-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
        }

        .ai-score-label {
            font-weight: 700;
            font-size: 14px;
        }

        .ai-score-value {
            font-size: 28px;
            font-weight: 900;
            color: var(--primary-dark);
        }

        .ai-summary {
            font-size: 13px;
            color: #334155;
            line-height: 1.6;
            margin-bottom: 15px;
        }

        .pros-cons-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-top: 15px;
        }

        .tag-list {
            display: flex;
            flex-wrap: wrap;
            gap: 6px;
            margin-top: 8px;
        }

        .tag-pro {
            background: rgba(34, 197, 94, 0.08);
            color: var(--primary-dark);
            font-size: 10px;
            font-weight: 700;
            padding: 2px 8px;
            border-radius: 6px;
            border: 1px solid rgba(34, 197, 94, 0.15);
            text-transform: uppercase;
        }

        .tag-con {
            background: rgba(239, 68, 68, 0.08);
            color: #ef4444;
            font-size: 10px;
            font-weight: 700;
            padding: 2px 8px;
            border-radius: 6px;
            border: 1px solid rgba(239, 68, 68, 0.15);
            text-transform: uppercase;
        }

        .comparable-box {
            background: #ffffff;
            border: 1px solid var(--border);
            padding: 12px 16px;
            border-radius: 12px;
            margin-top: 15px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .comparable-label {
            font-size: 11px;
            color: var(--gray);
            font-weight: 600;
            text-transform: uppercase;
        }

        .comparable-value {
            font-weight: 700;
            font-size: 13px;
        }

        /* Valuation Box */
        .value-box {
            background: var(--light-gray);
            border: 1px solid var(--border);
            padding: 20px;
            border-radius: 16px;
            text-align: center;
        }

        .value-title {
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
            color: var(--gray);
            letter-spacing: 1px;
        }

        .value-amount {
            font-size: 24px;
            font-weight: 900;
            color: var(--primary-dark);
            margin-top: 5px;
        }

        /* Contact Details */
        .contact-box {
            border-top: 2px solid var(--border);
            padding-top: 25px;
            margin-top: 20px;
        }

        .contact-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
        }

        .contact-locked {
            background: #fffbeb;
            border: 1px solid #fef3c7;
            color: #b45309;
            padding: 12px;
            border-radius: 12px;
            font-size: 11px;
            text-align: center;
            font-weight: 600;
        }

        /* Print Utilities */
        .print-btn {
            position: fixed;
            bottom: 30px;
            right: 30px;
            background: var(--primary);
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 12px;
            font-weight: 700;
            cursor: pointer;
            box-shadow: 0 4px 14px rgba(34,197,94,0.4);
            display: flex;
            align-items: center;
            gap: 8px;
            z-index: 100;
            font-family: inherit;
        }

        .print-btn:hover {
            background: var(--primary-dark);
        }

        @media print {
            body {
                padding: 0;
            }
            .cv-container {
                border: none;
                box-shadow: none;
                padding: 0;
            }
            .print-btn {
                display: none;
            }
        }
    </style>
</head>
<body>

    <button class="print-btn" onclick="window.print()">
        🖨️ Imprimer / Enregistrer PDF
    </button>

    <div class="cv-container">
        
        <!-- Header -->
        <div class="cv-header">
            <div class="player-title">
                <h1>{{ $talent->display_name }}</h1>
                <div class="player-subtitle">
                    <span class="badge">{{ $talent->position }}</span>
                    @if($talent->secondary_position)
                        <span class="badge" style="background: #e2e8f0; color: #475569;">{{ $talent->secondary_position }}</span>
                    @endif
                    <span class="player-meta">
                        {{ $age ? $age . ' ans' : '' }} | {{ $talent->city }}, {{ $talent->country }}
                    </span>
                </div>
            </div>
            
            <div class="brand-section">
                <div class="brand-name">EndoTalent</div>
                <div class="brand-sub">Rapport Officiel IA</div>
            </div>
        </div>

        <!-- Grid -->
        <div class="cv-grid">
            
            <!-- Left Column -->
            <div class="side-col">
                
                <!-- Carte d'identité -->
                <div>
                    <h3 class="section-title">Profil Joueur</h3>
                    <div class="info-card">
                        <div class="info-item">
                            <span class="info-label">Pied fort</span>
                            <span class="info-value">
                                @if($talent->dominant_foot === 'R') Droit @elseif($talent->dominant_foot === 'L') Gauche @else Both @endif
                            </span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Taille</span>
                            <span class="info-value">{{ $talent->height_cm ? $talent->height_cm . ' cm' : '—' }}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Poids</span>
                            <span class="info-value">{{ $talent->weight_kg ? $talent->weight_kg . ' kg' : '—' }}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Nationalité</span>
                            <span class="info-value">{{ $talent->nationality ?: '—' }}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Niveau global</span>
                            <span class="info-value" style="color: var(--primary-dark);">{{ $level }}</span>
                        </div>
                    </div>
                </div>

                <!-- Stats de visibilité -->
                <div>
                    <h3 class="section-title">Performances Profil</h3>
                    <div class="info-card" style="background: #ffffff;">
                        <div class="info-item">
                            <span class="info-label">Vidéos publiées</span>
                            <span class="info-value">{{ $stats['videos'] }}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Abonnés (Followers)</span>
                            <span class="info-value">{{ number_format($stats['followers']) }}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Appréciations (Likes)</span>
                            <span class="info-value">{{ number_format($stats['likes']) }}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Vues estimées</span>
                            <span class="info-value">{{ number_format($stats['views']) }}</span>
                        </div>
                    </div>
                </div>

                <!-- Estimation de valeur -->
                <div>
                    <h3 class="section-title">Évaluation Marchande</h3>
                    <div class="value-box">
                        <div class="value-title">Valeur Estimée IA</div>
                        <div class="value-amount">
                            {{ number_format($minVal, 0, ',', ' ') }} - {{ number_format($maxVal, 0, ',', ' ') }} DH
                        </div>
                    </div>
                </div>

            </div>

            <!-- Right Column -->
            <div class="main-col">
                
                <!-- AI Scouting Report -->
                <div>
                    <h3 class="section-title">Analyse IA & Scouting</h3>
                    <div class="ai-banner">
                        <div class="ai-badge">Moteur IA EndoTalent</div>
                        
                        <div class="ai-score-row">
                            <span class="ai-score-label">Score IA Potentiel</span>
                            <span class="ai-score-value">{{ $talentScore }}/100</span>
                        </div>

                        <div class="ai-summary">
                            @if($hasAiAnalysis && $aiSummary)
                                {{ $aiSummary }}
                            @else
                                Le joueur {{ $talent->display_name }} a montré une bonne maîtrise technique ainsi qu'une excellente coordination. Son profil athlétique lui permet de faire la différence dans les duels individuels, bien qu'il doive encore travailler son endurance et son jeu collectif pour franchir le palier supérieur.
                            @endif
                        </div>

                        <div class="comparable-box">
                            <span class="comparable-label">Style comparable</span>
                            <span class="comparable-value">{{ $comparable }}</span>
                        </div>

                        <div class="pros-cons-grid">
                            <div>
                                <span class="comparable-label" style="color: var(--primary-dark);">Forces clés</span>
                                <div class="tag-list">
                                    @if(count($aiStrengths) > 0)
                                        @foreach($aiStrengths as $pro)
                                            <span class="tag-pro">{{ $pro }}</span>
                                        @endforeach
                                    @else
                                        <span class="tag-pro">Technique</span>
                                        <span class="tag-pro">Vitesse</span>
                                        <span class="tag-pro">Agilité</span>
                                    @endif
                                </div>
                            </div>
                            <div>
                                <span class="comparable-label" style="color: #ef4444;">Axes d'amélioration</span>
                                <div class="tag-list">
                                    @if(count($aiWeaknesses) > 0)
                                        @foreach($aiWeaknesses as $con)
                                            <span class="tag-con">{{ $con }}</span>
                                        @endforeach
                                    @else
                                        <span class="tag-con">Jeu de tête</span>
                                        <span class="tag-con">Endurance</span>
                                    @endif
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

                <!-- Competences Details -->
                <div>
                    <h3 class="section-title">Notes de Compétences IA</h3>
                    <div class="info-card">
                        @foreach($skills as $name => $value)
                            <div class="skill-item">
                                <div class="skill-header">
                                    <span>{{ $name }}</span>
                                    <span style="color: var(--primary-dark)">{{ $value }}/100</span>
                                </div>
                                <div class="skill-bar-bg">
                                    <div class="skill-bar-fill" style="width: {{ $value }}%"></div>
                                </div>
                            </div>
                        @endforeach
                    </div>
                </div>

            </div>

        </div>

        <!-- Contact Section -->
        <div class="contact-box">
            <h3 class="section-title">Coordonnées de Contact</h3>
            @if($canSeeContactInfo)
                <div class="contact-grid">
                    <div class="info-card">
                        <div class="info-item">
                            <span class="info-label">E-mail</span>
                            <span class="info-value">{{ $talentUser->email }}</span>
                        </div>
                    </div>
                    <div class="info-card">
                        <div class="info-item">
                            <span class="info-label">Téléphone</span>
                            <span class="info-value">{{ $talentUser->phone ?: 'Non renseigné' }}</span>
                        </div>
                    </div>
                </div>
            @else
                <div class="contact-locked">
                    🔒 Les coordonnées de contact de ce joueur sont verrouillées. Veuillez débloquer son profil sur le site EndoTalent pour y accéder.
                </div>
            @endif
        </div>

    </div>

    <script>
        // Trigger browser print dialog automatically after page loads
        window.addEventListener('DOMContentLoaded', () => {
            setTimeout(() => {
                window.print();
            }, 1000);
        });
    </script>
</body>
</html>
