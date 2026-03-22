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

export async function fetchAudio(text, segments = null) {
  const res = await fetch(`${BASE}/audio`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, segments }),
  });
  if (!res.ok) throw new Error(await res.text());
  const { audio_base64, segmentTimings } = await res.json();
  const binary = atob(audio_base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  const blob = new Blob([bytes], { type: 'audio/mpeg' });
  const audioUrl = URL.createObjectURL(blob);
  return { audioUrl, segmentTimings, audio_base64 };
}
