import { Router } from 'express';
import { generateCast } from '../services/llm.js';
import { analyzePGN, formatAnnotationsForPrompt } from '../services/analysis.js';

const router = Router();

// POST /api/cast — body: { pgn }
router.post('/', async (req, res, next) => {
  try {
    const { pgn, annotations: existingAnnotations } = req.body;
    if (!pgn) return res.status(400).json({ error: 'PGN is required' });

    // Étape 1 : Utiliser les annotations pré-calculées ou lancer l'analyse
    let annotations = existingAnnotations ?? null;
    let fens = null;
    let annotationsText = null;
    try {
      if (!annotations) {
        const result = await analyzePGN(pgn);
        annotations = result.annotations;
        fens = result.fens;
      }
      annotationsText = formatAnnotationsForPrompt(annotations);
      if (annotationsText) {
        console.log('[cast] Analyse Lichess réussie, annotations transmises au LLM');
      } else {
        console.log('[cast] Analyse Lichess indisponible, commentaire sans annotations');
      }
    } catch (analysisErr) {
      console.warn('[cast] Analyse Lichess échouée :', analysisErr.message);
    }

    // Étape 2 : Génération du commentaire avec Claude
    const { segments, text } = await generateCast(pgn, annotationsText);
    res.json({ segments, text, annotations, fens });
  } catch (err) {
    next(err);
  }
});

export default router;
