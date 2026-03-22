import { Router } from 'express';
import { textToAudio } from '../services/elevenlabs.js';

const router = Router();

// POST /api/audio — body: { text } → audio/mpeg
router.post('/', async (req, res, next) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: 'Text is required' });
    const audioBuffer = await textToAudio(text);
    res.set({ 'Content-Type': 'audio/mpeg', 'Content-Length': audioBuffer.length });
    res.send(audioBuffer);
  } catch (err) {
    next(err);
  }
});

export default router;
