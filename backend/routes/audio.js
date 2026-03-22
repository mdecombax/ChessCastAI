import { Router } from 'express';
import { textToAudioWithTimestamps } from '../services/elevenlabs.js';

const router = Router();

// POST /api/audio — body: { text, segments }
// Retourne JSON : { audio_base64, segmentTimings: [{ startMove, startTime, endTime }] }
router.post('/', async (req, res, next) => {
  try {
    const { text, segments } = req.body;
    if (!text) return res.status(400).json({ error: 'Text is required' });

    const { audioBuffer, alignment } = await textToAudioWithTimestamps(text);

    // Calculer les timings de chaque segment en mappant les offsets de caractères
    let segmentTimings = [];
    if (segments && Array.isArray(segments) && alignment) {
      const charStarts = alignment.character_start_times_seconds ?? [];
      const charEnds = alignment.character_end_times_seconds ?? [];
      const totalDuration = charEnds.length > 0 ? charEnds[charEnds.length - 1] : 0;

      // Reconstruire le texte complet (même logique que côté pipeline)
      const fullText = segments.map(s => s.text).join(' ');

      // Pour chaque segment, trouver l'offset de caractère dans le texte complet
      let charOffset = 0;
      segmentTimings = segments.map((seg, idx) => {
        const segStart = charOffset;
        charOffset += seg.text.length + (idx < segments.length - 1 ? 1 : 0); // +1 pour l'espace

        // Trouver le temps correspondant à cet offset dans l'alignment
        const startTime = charStarts[Math.min(segStart, charStarts.length - 1)] ?? 0;
        const endTime = idx < segments.length - 1
          ? (charStarts[Math.min(charOffset, charStarts.length - 1)] ?? totalDuration)
          : totalDuration;

        return {
          startMove: seg.startMove,
          text: seg.text,
          startTime,
          endTime,
        };
      });
    }

    const audio_base64 = audioBuffer.toString('base64');
    res.json({ audio_base64, segmentTimings });
  } catch (err) {
    next(err);
  }
});

export default router;
