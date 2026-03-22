import { Router } from 'express';
import { getRecentGames } from '../services/chesscom.js';

const router = Router();

// GET /api/games/:username
router.get('/:username', async (req, res, next) => {
  try {
    const { username } = req.params;
    if (!username) return res.status(400).json({ error: 'Username is required' });
    const games = await getRecentGames(username);
    res.json({ games });
  } catch (err) {
    next(err);
  }
});

export default router;
