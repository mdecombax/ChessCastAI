const BASE = '/api';

export async function fetchGames(username) {
  const res = await fetch(`${BASE}/games/${encodeURIComponent(username)}`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function fetchAnalysis(pgn) {
  const res = await fetch(`${BASE}/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ pgn }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function fetchCast(pgn, annotations = null) {
  const res = await fetch(`${BASE}/cast`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ pgn, annotations }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function fetchAudio(text) {
  const res = await fetch(`${BASE}/audio`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.blob();
}
