export const translations = {
  fr: {
    // WelcomeScene
    welcome_subtitle: 'Commentaire audio IA pour tes parties.',
    welcome_tech: 'Analyse Stockfish · Narration Claude · Voix ElevenLabs',
    welcome_placeholder: 'Pseudo Chess.com',
    welcome_divider: 'Partie après partie',

    // GameSelectScene
    games_of: 'Parties de',
    last_games: n => `${n} dernières parties`,
    selected_game: 'Partie sélectionnée',
    launch_cast: 'Lancer le cast',

    // GenerationScene
    generating: 'Génération en cours',
    in_progress: 'en cours',
    step_analyze_label: 'Analyse Stockfish',
    step_analyze_sublabel: 'Classification de chaque coup',
    step_analyze_done: 'Analyse terminée',
    step_cast_label: 'Rédaction du commentaire',
    step_cast_sublabel: 'Narration sportive par Claude',
    step_cast_done: 'Commentaire rédigé',
    step_audio_label: 'Synthèse vocale',
    step_audio_sublabel: 'Voix par ElevenLabs',
    step_audio_done: 'Audio prêt',
    back: '← Retour',
    retry: 'Réessayer',

    // PlayerScene
    press_play: 'Appuyez sur lecture…',
    prev_move_title: 'Coup précédent (←)',
    next_move_title: 'Coup suivant (→)',
    new_game: 'Nouvelle partie',

    // ChessboardSync
    initial_position: 'Position initiale',
    move_white: n => `Coup ${n} — blancs`,
    move_black: n => `Coup ${n} — noirs`,

    // AnalysisDrawer
    stockfish_analysis: 'Analyse Stockfish',
    no_errors: 'Aucune erreur',
    key_moments: 'Moments clés',
    white_fallback: 'Blanc',
    black_fallback: 'Noir',
    mate: 'mat',

    // CommentaryDrawer
    read_commentary: 'Lire le commentaire',

    // Badge labels
    badge_blunder: 'Blunder',
    badge_mistake: 'Erreur',
    badge_inaccuracy: 'Imprécision',
    badge_best: 'Excellent',

    // ResultBadge
    result_win: 'Victoire',
    result_loss: 'Défaite',
    result_draw: 'Nulle',

    // App errors
    load_error: err => `Impossible de charger les parties : ${err}`,
  },

  es: {
    // WelcomeScene
    welcome_subtitle: 'Comentario de audio IA para tus partidas.',
    welcome_tech: 'Análisis Stockfish · Narración Claude · Voz ElevenLabs',
    welcome_placeholder: 'Usuario Chess.com',
    welcome_divider: 'Partida tras partida',

    // GameSelectScene
    games_of: 'Partidas de',
    last_games: n => `${n} últimas partidas`,
    selected_game: 'Partida seleccionada',
    launch_cast: 'Iniciar cast',

    // GenerationScene
    generating: 'Generación en curso',
    in_progress: 'en curso',
    step_analyze_label: 'Análisis Stockfish',
    step_analyze_sublabel: 'Clasificación de cada jugada',
    step_analyze_done: 'Análisis completado',
    step_cast_label: 'Redacción del comentario',
    step_cast_sublabel: 'Narración deportiva por Claude',
    step_cast_done: 'Comentario redactado',
    step_audio_label: 'Síntesis de voz',
    step_audio_sublabel: 'Voz por ElevenLabs',
    step_audio_done: 'Audio listo',
    back: '← Volver',
    retry: 'Reintentar',

    // PlayerScene
    press_play: 'Pulse reproducir…',
    prev_move_title: 'Jugada anterior (←)',
    next_move_title: 'Jugada siguiente (→)',
    new_game: 'Nueva partida',

    // ChessboardSync
    initial_position: 'Posición inicial',
    move_white: n => `Jugada ${n} — blancas`,
    move_black: n => `Jugada ${n} — negras`,

    // AnalysisDrawer
    stockfish_analysis: 'Análisis Stockfish',
    no_errors: 'Sin errores',
    key_moments: 'Momentos clave',
    white_fallback: 'Blancas',
    black_fallback: 'Negras',
    mate: 'mate',

    // CommentaryDrawer
    read_commentary: 'Leer el comentario',

    // Badge labels
    badge_blunder: 'Blunder',
    badge_mistake: 'Error',
    badge_inaccuracy: 'Imprecisión',
    badge_best: 'Excelente',

    // ResultBadge
    result_win: 'Victoria',
    result_loss: 'Derrota',
    result_draw: 'Tablas',

    // App errors
    load_error: err => `No se pudieron cargar las partidas: ${err}`,
  },
};
