import { Router } from 'express';
import { analyzePGN } from '../services/analysis.js';

const router = Router();

// POST /api/analyze — body: { pgn }
router.post('/', async (req, res, next) => {
  try {
    const { pgn } = req.body;
    if (!pgn) return res.status(400).json({ error: 'PGN is required' });
    const { annotations, fens } = await analyzePGN(pgn);
    res.json({ annotations, fens });
  } catch (err) {
    next(err);
  }
});

export default router;
