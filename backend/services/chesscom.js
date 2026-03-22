import axios from 'axios';

const BASE_URL = process.env.CHESSCOM_BASE_URL || 'https://api.chess.com/pub';
const HEADERS = { 'User-Agent': 'AutoCastChess/1.0' };

export async function getRecentGames(username) {
  const archivesUrl = `${BASE_URL}/player/${username}/games/archives`;
  const { data: archivesData } = await axios.get(archivesUrl, { headers: HEADERS });

  const archives = archivesData.archives;
  if (!archives || archives.length === 0) {
    throw Object.assign(new Error('No game archives found for this user'), { status: 404 });
  }

  const latestArchiveUrl = archives[archives.length - 1];
  const { data: gamesData } = await axios.get(latestArchiveUrl, { headers: HEADERS });

  const games = (gamesData.games || []).slice(-10).map((game) => ({
    url: game.url,
    pgn: game.pgn,
    timeClass: game.time_class,
    white: game.white?.username,
    black: game.black?.username,
    result: game.white?.result,
    endTime: game.end_time,
  }));

  return games;
}
