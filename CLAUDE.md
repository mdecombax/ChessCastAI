# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

**Backend** (depuis `backend/`) :
```bash
npm run dev      # Démarre le serveur avec --watch (rechargement auto, port 3001)
npm start        # Démarre en production
node test-cast.js  # Test manuel du pipeline de génération
```

**Frontend** (depuis `frontend/`) :
```bash
npm run dev      # Vite dev server (port 5173)
npm run build    # Build de production
npm run preview  # Prévisualiser le build
```

## Architecture

Pipeline complet : Chess.com PGN → Analyse Stockfish → Commentaire Claude → Synthèse vocale ElevenLabs

```
backend/
├── server.js          # Point d'entrée Express (port 3001)
├── routes/            # Une route par domaine : games, analyze, cast, audio
├── services/
│   ├── chesscom.js    # Client Chess.com API
│   ├── analysis.js    # Analyse Stockfish (chess.js + stockfish NNUE)
│   ├── llm.js         # Appels Claude via Anthropic SDK
│   └── elevenlabs.js  # Synthèse TTS (MP3 → ArrayBuffer)
└── test-cast.js       # Script de test manuel

frontend/
├── src/
│   ├── App.jsx        # Gestionnaire d'état central (hooks useState)
│   ├── api.js         # Client API (toutes les requêtes vers le backend)
│   └── components/    # UsernameInput, GameList, CastPlayer, AnalysisPanel, CastButton
└── vite.config.js     # Proxy /api → http://localhost:3001
```

## Variables d'environnement

Fichier `backend/.env` (voir `.env.example`) :
```
ANTHROPIC_API_KEY=
ELEVENLABS_API_KEY=
ELEVENLABS_VOICE_ID=
CHESSCOM_BASE_URL=https://api.chess.com/pub
PORT=3001
```

## Détails d'implémentation clés

**Analyse Stockfish** : Utilise `stockfish-18-lite-single.js` (NNUE 11MB) lancé via `child_process.spawn()`. Protocole UCI. Timeout global : 3 minutes. Classification des coups : blunder (≥200cp perdu), mistake (≥100cp), inaccuracy (≥50cp).

**Prompt Claude** : Commentaire sportif français passionné + pédagogie échiquéenne. Contraintes audio strictes : nombres en toutes lettres, pas de caractères spéciaux `{}[]<>#*_`, ponctuation pour le rythme. Modèle : `claude-sonnet-4-6`, max 2048 tokens (~400-450 mots).

**Gestion d'état frontend** : Tout l'état vit dans `App.jsx`. `window.debug` expose l'état complet pour inspection console. `localStorage` persiste le dernier `castText` généré.

**Styling** : Uniquement des objets de styles inline, aucun fichier CSS ni framework CSS.

**API endpoints** :
- `GET /api/games/:username` → 10 dernières parties Chess.com
- `POST /api/analyze` → Annotations Stockfish (corps : `{ pgn }`)
- `POST /api/cast` → Commentaire Claude (corps : `{ pgn, annotations }`)
- `POST /api/audio` → MP3 ElevenLabs (corps : `{ text }`)
