import { useState, useRef, useEffect } from 'react';
import { usePage } from '@inertiajs/react';
import { MessageSquare, X, Send, Bot, User, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import axios from 'axios';

interface ChatMessage {
    sender: 'bot' | 'user';
    text: string;
    talents?: any[];
}

export default function GlobalChatbot() {
    const { 
        auth, 
        talent, 
        stats, 
        canSeeContactInfo, 
        scoutingReport, 
        valueEstimation, 
        highlights 
    } = usePage<any>().props;

    const user = auth?.user;
    const [isOpen, setIsOpen] = useState(false);
    
    // Dynamic welcome message based on page context
    const getWelcomeMessage = () => {
        if (talent) {
            return `Bonjour ! 👋 Je suis Scout IA, votre assistant intelligent. Je vois que vous visitez le profil de **${talent.display_name}**.\n\nJe suis à votre disposition pour analyser ses performances, ses points forts, sa valeur marchande estimée ou ses rapports d'analyse vidéo !`;
        }
        return 'Bonjour ! 👋 Je suis Scout IA, votre assistant intelligent EndoTalent. Comment puis-je vous aider aujourd\'hui ?';
    };

    const [messages, setMessages] = useState<ChatMessage[]>([]);

    // Reset messages or set welcome message when context changes
    useEffect(() => {
        setMessages([
            { sender: 'bot', text: getWelcomeMessage() }
        ]);
    }, [talent?.id]); // Re-run if we navigate to a different talent

    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isTyping]);

    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 300);
        }
    }, [isOpen]);

    const getReplyText = (text: string): string => {
        const lower = text.toLowerCase().trim();
        
        // ─── CASE A: USER IS VIEWING A TALENT PROFILE ───
        if (talent) {
            const name = talent.display_name;
            
            // Who is this / name / presentation
            if (
                lower.includes('qui est') || 
                lower.includes('présente') || 
                lower.includes('presentation') || 
                lower.includes('présentation') ||
                (lower.includes('ce joueur') || lower.includes('cette joueuse') || lower.includes('le talent'))
            ) {
                return `👤 Vous visitez le profil de **${name}**.\n\n• **Poste** : ${talent.position}${talent.secondary_position ? ` (${talent.secondary_position})` : ''}\n• **Âge** : ${talent.age ? `${talent.age} ans` : 'Non renseigné'}\n• **Nationalité** : ${talent.nationality}\n• **Ville/Pays** : ${talent.city || ''}, ${talent.country || ''}\n• **Pied fort** : ${talent.dominant_foot === 'left' ? 'Gaucher' : talent.dominant_foot === 'right' ? 'Droitier' : 'Ambidextre'}\n• **Talent Score** : ${talent.talent_score}/100 (${talent.level})`;
            }
            
            // Position
            if (lower.includes('poste') || lower.includes('position') || lower.includes('joue ou') || lower.includes('joue où')) {
                return `⚽ **${name}** évolue principalement au poste de **${talent.position}**.${talent.secondary_position ? ` Il peut également jouer en tant de **${talent.secondary_position}**.` : ''}`;
            }
            
            // Stats / visibility
            if (lower.includes('stat') || lower.includes('vue') || lower.includes('like') || lower.includes('follower') || lower.includes('abonné') || lower.includes('popularité') || lower.includes('visite')) {
                return `📊 **Statistiques de visibilité pour ${name}** :\n\n• **Abonnés** : ${stats?.followers ?? 0}\n• **Vues cumulées** : ${stats?.total_views ?? 0}\n• **Likes reçus** : ${stats?.total_likes ?? 0}\n• **Vidéos dans le portfolio** : ${stats?.videos_count ?? 0}\n• **Scouts intéressés** : ${stats?.scouts_interested ?? 0}`;
            }
            
            // Physique / Attributes
            if (lower.includes('taille') || lower.includes('poids') || lower.includes('physique') || lower.includes('grand') || lower.includes('pied') || lower.includes('droitier') || lower.includes('gaucher') || lower.includes('hauteur')) {
                return `📏 **Caractéristiques physiques de ${name}** :\n\n• **Taille** : ${talent.height_cm ? `${talent.height_cm} cm` : 'Non renseignée'}\n• **Poids** : ${talent.weight_kg ? `${talent.weight_kg} kg` : 'Non renseigné'}\n• **Pied fort** : ${talent.dominant_foot === 'left' ? 'Gaucher' : talent.dominant_foot === 'right' ? 'Droitier' : 'Ambidextre'}`;
            }
            
            // Age
            if (lower.includes('age') || lower.includes('âge') || lower.includes('naissance') || lower.includes('ans')) {
                return `📅 **${name}** a **${talent.age ? `${talent.age} ans` : 'un âge non renseigné'}** (né le ${talent.date_of_birth || 'non renseigné'}).`;
            }
            
            // Score / level
            if (lower.includes('score') || lower.includes('talent score') || lower.includes('niveau')) {
                return `⭐ **Talent Score de ${name}** : **${talent.talent_score}/100**\n\nCe score le classe dans la catégorie **${talent.level}**. Il est calculé en analysant son activité, les interactions sur ses vidéos, et les évaluations IA.`;
            }

            // ─── PREMIUM GATE CHECKS ───
            const lockedMsg = `🔒 **Scouting Premium Verrouillé** :\nLes informations de scouting avancées (points forts, axes d'amélioration, style de jeu, estimation de valeur et rapports d'analyse vidéo IA) de **${name}** sont réservées aux recruteurs ayant débloqué ce profil.\n\nVous pouvez débloquer son profil complet pour **50 Crédits** directement sur sa page pour débloquer ces informations.`;

            // Pros / Strengths
            if (lower.includes('fort') || lower.includes('force') || lower.includes('qualité') || lower.includes('atout') || lower.includes('pros') || lower.includes('bon en') || lower.includes('avantage')) {
                if (!canSeeContactInfo) return lockedMsg;
                if (!scoutingReport || !scoutingReport.pros || scoutingReport.pros.length === 0) {
                    return `Aucun point fort spécifique n'est encore enregistré pour ${name}.`;
                }
                return `💪 **Points forts identifiés pour ${name}** :\n\n${scoutingReport.pros.map((p: string) => `• **${p}**`).join('\n')}`;
            }
            
            // Cons / Weaknesses
            if (lower.includes('faible') || lower.includes('faiblesse') || lower.includes('améliorer') || lower.includes('cons') || lower.includes('défaut') || lower.includes('manque')) {
                if (!canSeeContactInfo) return lockedMsg;
                if (!scoutingReport || !scoutingReport.cons || scoutingReport.cons.length === 0) {
                    return `Aucun axe d'amélioration spécifique n'a été signalé pour ${name}.`;
                }
                return `⚠️ **Axes d'amélioration pour ${name}** :\n\n${scoutingReport.cons.map((c: string) => `• **${c}**`).join('\n')}`;
            }
            
            // Comparable / Style of play
            if (lower.includes('comparable') || lower.includes('ressemble') || lower.includes('style de jeu') || lower.includes('similaire') || lower.includes('joueur type') || lower.includes('comparer')) {
                if (!canSeeContactInfo) return lockedMsg;
                return `⚽ **Style de jeu & Comparaison** :\n\nLe style de jeu de **${name}** est comparable à celui de **${scoutingReport?.comparable || 'non défini'}**.\n\nCette comparaison est établie selon son poste, ses attributs physiques et ses séquences de jeu analysées par l'IA.`;
            }
            
            // Value / Price
            if (lower.includes('valeur') || lower.includes('prix') || lower.includes('marché') || lower.includes('combien') || lower.includes('estimation') || lower.includes('coûte') || lower.includes('coute') || lower.includes('argent') || lower.includes('budget')) {
                if (!canSeeContactInfo) return lockedMsg;
                return `💰 **Estimateur de Valeur Marchande (IA)** :\n\n• **Fourchette estimée** : **${valueEstimation?.min?.toLocaleString() || 0} DH - ${valueEstimation?.max?.toLocaleString() || 0} DH**\n• **Tendance** : 📈 En Hausse (+${valueEstimation?.trend || 0}% ce mois-ci)\n\n*Note : Cette estimation est générée par notre IA en croisant son Talent Score, son âge, son poste et l'intérêt actuel du marché.*`;
            }
            
            // Video Analysis / Reports
            if (lower.includes('analyse') || lower.includes('rapport') || lower.includes('vidéo') || lower.includes('video') || lower.includes('highlight') || lower.includes('performance')) {
                if (!canSeeContactInfo) return lockedMsg;
                const readyVids = highlights?.filter((v: any) => v.status === 'ready' && v.ai_analysis) || [];
                const processingVids = highlights?.filter((v: any) => v.status === 'processing') || [];
                
                let result = `🎥 **Rapports d'Analyse Vidéo IA pour ${name}** :\n\n`;
                
                if (readyVids.length === 0 && processingVids.length === 0) {
                    return `Aucune analyse vidéo IA n'est disponible ou en cours pour ${name} actuellement.`;
                }
                
                if (readyVids.length > 0) {
                    result += readyVids.map((v: any) => `• **${v.title}** (Score IA: ${v.ai_analysis.score}/100) :\n  _${v.ai_analysis.summary}_`).join('\n\n');
                }
                
                if (processingVids.length > 0) {
                    if (readyVids.length > 0) result += '\n\n';
                    result += `⏳ **En cours d'analyse (${processingVids.length})** :\n`;
                    result += processingVids.map((v: any) => `• ${v.title} (Traitement de l'IA en cours...)`).join('\n');
                }
                
                return result;
            }
        }
        
        // ─── CASE B: GENERIC PLATFORM BOT RESPONSES ───
        if (lower.includes('bonjour') || lower.includes('salut') || lower.includes('hello') || lower.includes('hi')) {
            return `Bonjour${user ? ` ${user.name}` : ''} ! 😊 Je suis ravi de vous aider. Vous pouvez me poser des questions sur :\n\n• **La plateforme** EndoTalent\n• **Votre profil** et comment l'améliorer\n• **Le scouting** et les opportunités\n• **Les fonctionnalités** disponibles`;
        } else if (lower.includes('profil') || lower.includes('profile') || lower.includes('améliorer')) {
            return '📊 Pour un profil optimal, je vous recommande :\n\n1. **Ajoutez des vidéos** de qualité montrant vos meilleures actions\n2. **Complétez toutes les infos** (taille, poids, pied fort)\n3. **Soyez actif** — plus vous publiez, plus votre Talent Score augmente\n4. **Partagez votre profil** avec des recruteurs et clubs\n\nUn profil complet reçoit **3x plus de visites** de scouts !';
        } else if (lower.includes('scout') || lower.includes('recruteur') || lower.includes('club')) {
            return '🔍 **Le Scouting sur EndoTalent** :\n\n• Les scouts et clubs peuvent **rechercher** des talents par position, ville, et caractéristiques\n• Ils peuvent **débloquer vos coordonnées** pour vous contacter directement\n• Votre **Talent Score** est visible par tous les recruteurs\n• Plus votre score est élevé, plus vous apparaissez en haut des résultats !';
        } else if (lower.includes('vidéo') || lower.includes('video') || lower.includes('upload')) {
            return '🎬 **Conseils pour vos vidéos** :\n\n• Filmez en **qualité HD** (1080p minimum)\n• Montrez vos **meilleures actions** (dribbles, passes, tirs)\n• Durée idéale : **30 à 90 secondes**\n• Ajoutez un **titre accrocheur** et une description détaillée\n• Les comptes gratuits peuvent poster **5 vidéos**, passez à Pro pour plus !';
        } else if (lower.includes('wallet') || lower.includes('portefeuille') || lower.includes('argent') || lower.includes('payer')) {
            return '💰 **Votre Wallet EndoTalent** :\n\n• Les scouts paient pour **débloquer vos coordonnées**\n• Vous recevez **90%** du montant payé\n• Consultez votre solde et historique dans la section **Wallet**\n• Les transferts sont instantanés et sécurisés';
        } else if (lower.includes('score') || lower.includes('niveau') || lower.includes('talent score')) {
            return '⭐ **Talent Score** — Votre indicateur de performance :\n\n• **0-29** : Débutant\n• **30-49** : Intermédiaire\n• **50-69** : Avancé\n• **70-84** : Elite\n• **85-100** : Exceptionnel\n\nIl est calculé automatiquement selon vos vidéos, followers, likes et intérêt des scouts.';
        } else if (lower.includes('contact') || lower.includes('message') || lower.includes('chat')) {
            return '💬 **Messagerie EndoTalent** :\n\n• Envoyez des messages à d\'autres utilisateurs via la section **Messages**\n• Les scouts doivent **payer ou s\'abonner** pour envoyer des messages\n• Vous recevez des **notifications** en temps réel\n• Les appels vocaux et vidéo sont aussi disponibles !';
        } else if (lower.includes('merci') || lower.includes('thank')) {
            return 'De rien ! 🙏 N\'hésitez pas si vous avez d\'autres questions. Bonne chance dans votre parcours sportif ! ⚽🌟';
        } else {
            return `Excellente question ! 🤔 Voici ce que je peux vous dire :\n\nEndoTalent est une plateforme de **scouting sportif** qui connecte les jeunes talents avec les clubs et recruteurs professionnels.\n\nVoulez-vous en savoir plus sur :\n• 📊 Votre **profil** et Talent Score\n• 🎬 Comment **publier des vidéos**\n• 🔍 Le processus de **scouting**\n• 💰 Le système de **wallet**`;
        }
    };

    const handleSendMsg = async (textToSend: string) => {
        const text = textToSend.trim();
        if (!text) return;

        setMessages(prev => [...prev, { sender: 'user', text }]);
        setIsTyping(true);

        try {
            const contextPrefix = talent ? `[Contexte: Je regarde le profil de ${talent.display_name}. Poste: ${talent.position}.] ` : '';
            const response = await axios.post('/api/copilot', { message: contextPrefix + text });
            
            setIsTyping(false);
            if (response.data && response.data.answer) {
                setMessages(prev => [...prev, { 
                    sender: 'bot', 
                    text: response.data.answer,
                    talents: response.data.talents 
                }]);
            } else {
                setMessages(prev => [...prev, { sender: 'bot', text: 'Désolé, je n\'ai pas pu comprendre votre requête.' }]);
            }
        } catch (error) {
            console.error(error);
            setIsTyping(false);
            setMessages(prev => [...prev, { sender: 'bot', text: 'Une erreur de connexion est survenue avec Scout IA.' }]);
        }
    };

    const handleSend = () => {
        if (!input.trim()) return;
        handleSendMsg(input);
        setInput('');
    };

    // Adapt quick suggestions to page context
    const getSuggestions = () => {
        if (talent) {
            return ['Style de jeu', 'Points forts', 'Valeur marchande', 'Statistiques'];
        }
        return ['Mon profil', 'Talent Score', 'Vidéos', 'Scouting'];
    };

    return (
        <>
            {/* Floating Action Button */}
            <AnimatePresence>
                {!isOpen && (
                    <motion.button
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setIsOpen(true)}
                        className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-gradient-to-br from-primary to-emerald-500 text-white shadow-2xl shadow-primary/30 flex items-center justify-center hover:shadow-primary/50 transition-shadow"
                    >
                        <Bot className="h-7 w-7" />
                        {/* Pulse ring */}
                        <span className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
                    </motion.button>
                )}
            </AnimatePresence>

            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                        className="fixed bottom-6 right-6 z-50 w-[380px] h-[520px] rounded-3xl border border-border/50 bg-card shadow-2xl flex flex-col overflow-hidden"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-primary/10 via-emerald-500/5 to-transparent border-b border-border/30">
                            <div className="flex items-center gap-3">
                                <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary to-emerald-500 flex items-center justify-center shadow-lg shadow-primary/20">
                                    <Bot className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-black uppercase tracking-tight">Scout IA</h3>
                                    <div className="flex items-center gap-1.5">
                                        <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                        <span className="text-[10px] font-bold text-muted-foreground">En ligne</span>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="h-8 w-8 rounded-xl bg-muted/50 hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-all"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-3">
                            {messages.map((msg, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    {msg.sender === 'bot' && (
                                        <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-primary/20 to-emerald-500/20 flex items-center justify-center shrink-0 mt-0.5">
                                            <Sparkles className="h-3.5 w-3.5 text-primary" />
                                        </div>
                                    )}
                                    <div
                                        className={`max-w-[75%] px-3.5 py-2.5 text-xs leading-relaxed rounded-2xl whitespace-pre-line ${
                                            msg.sender === 'user'
                                                ? 'bg-primary text-primary-foreground rounded-br-md'
                                                : 'bg-muted/60 text-foreground border border-border/30 rounded-bl-md'
                                        }`}
                                    >
                                        {msg.text.split('\n').map((line, li) => (
                                            <span key={li}>
                                                {line.split(/\*\*(.*?)\*\*/g).map((part, pi) =>
                                                    pi % 2 === 1 ? <strong key={pi}>{part}</strong> : part
                                                )}
                                                {li < msg.text.split('\n').length - 1 && <br />}
                                            </span>
                                        ))}

                                        {/* Render matched talents if any */}
                                        {msg.talents && msg.talents.length > 0 && (
                                            <div className="mt-3 flex flex-col gap-2">
                                                {msg.talents.map((t: any, idx: number) => (
                                                    <a key={idx} href={`/talents/${t.id}`} className="flex items-center gap-2 p-2 rounded-lg bg-background border border-border/50 hover:border-primary/50 transition-colors">
                                                        <div className="h-8 w-8 rounded-full overflow-hidden bg-muted">
                                                            {t.photo ? (
                                                                <img src={t.photo} alt={t.name} className="h-full w-full object-cover" />
                                                            ) : (
                                                                <div className="h-full w-full flex items-center justify-center bg-primary/10 text-primary font-bold text-xs">
                                                                    {t.name.substring(0, 2).toUpperCase()}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="flex-1 overflow-hidden">
                                                            <div className="font-bold text-[11px] truncate">{t.name}</div>
                                                            <div className="text-[10px] text-muted-foreground">{t.position} {t.overall_score ? `• Score: ${t.overall_score}` : ''}</div>
                                                        </div>
                                                    </a>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    {msg.sender === 'user' && (
                                        <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                                            <User className="h-3.5 w-3.5 text-primary" />
                                        </div>
                                    )}
                                </motion.div>
                            ))}
                            {isTyping && (
                                <div className="flex gap-2.5">
                                    <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-primary/20 to-emerald-500/20 flex items-center justify-center shrink-0">
                                        <Sparkles className="h-3.5 w-3.5 text-primary" />
                                    </div>
                                    <div className="bg-muted/60 border border-border/30 rounded-2xl rounded-bl-md px-4 py-3 flex gap-1.5">
                                        <span className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: '0ms' }} />
                                        <span className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: '150ms' }} />
                                        <span className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: '300ms' }} />
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Quick Suggestions */}
                        {messages.length <= 1 && (
                            <div className="px-4 pb-2 flex gap-2 flex-wrap">
                                {getSuggestions().map((suggestion) => (
                                    <button
                                        key={suggestion}
                                        onClick={() => handleSendMsg(suggestion)}
                                        className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide rounded-full bg-primary/5 text-primary border border-primary/15 hover:bg-primary/10 transition-all"
                                    >
                                        {suggestion}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Input */}
                        <div className="px-4 py-3 border-t border-border/30 bg-muted/20">
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    handleSend();
                                }}
                                className="flex gap-2"
                            >
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Posez votre question..."
                                    className="flex-1 h-10 px-4 rounded-xl bg-background border border-border/50 text-xs text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all"
                                />
                                <button
                                    type="submit"
                                    disabled={!input.trim() || isTyping}
                                    className="h-10 w-10 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md shadow-primary/20"
                                >
                                    <Send className="h-4 w-4" />
                                </button>
                            </form>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
