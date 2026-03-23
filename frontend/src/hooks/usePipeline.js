import { useState, useCallback } from 'react';
import { fetchAnalysis, fetchCast, fetchAudio } from '../api.js';

const IDLE = { analyze: 'idle', cast: 'idle', audio: 'idle' };
const NO_ERR = { analyze: '', cast: '', audio: '' };
const CACHE_KEY = 'autocast_pipeline_cache';

function loadCache() {
  try { return JSON.parse(localStorage.getItem(CACHE_KEY) ?? '{}'); } catch { return {}; }
}

function saveCache(pgnKey, data) {
  try {
    const cache = loadCache();
    cache[pgnKey] = data;
    // Garder seulement les 3 dernières parties en cache
    const keys = Object.keys(cache);
    if (keys.length > 3) delete cache[keys[0]];
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch { /* ignore storage full */ }
}

function pgnKey(pgn) {
  // Clé simple basée sur les 80 premiers caractères du PGN
  return (pgn ?? '').slice(0, 80);
}

export default function usePipeline() {
  const [annotations, setAnnotations] = useState(null);
  const [fens, setFens] = useState(null);
  const [segments, setSegments] = useState(null);
  const [castText, setCastText] = useState('');
  const [audioUrl, setAudioUrl] = useState('');
  const [segmentTimings, setSegmentTimings] = useState(null);
  const [stepStatus, setStepStatus] = useState(IDLE);
  const [stepError, setStepError] = useState(NO_ERR);

  function reset() {
    setAnnotations(null);
    setFens(null);
    setSegments(null);
    setCastText('');
    setAudioUrl('');
    setSegmentTimings(null);
    setStepStatus(IDLE);
    setStepError(NO_ERR);
  }

  const runFullPipeline = useCallback(async (game, onComplete) => {
    if (!game) return;
    reset();

    const key = pgnKey(game.pgn);
    const cache = loadCache();
    const cached = cache[key];

    // Si un résultat est en cache, on saute les étapes LLM et ElevenLabs
    if (cached) {
      console.log('[pipeline] Cache trouvé, restauration sans appels API');
      setStepStatus({ analyze: 'active', cast: 'idle', audio: 'idle' });
      await new Promise(r => setTimeout(r, 300));

      setAnnotations(cached.annotations ?? null);
      setFens(cached.fens ?? null);
      setStepStatus({ analyze: 'done', cast: 'active', audio: 'idle' });
      await new Promise(r => setTimeout(r, 200));

      setSegments(cached.segments ?? null);
      setCastText(cached.text ?? '');
      setStepStatus({ analyze: 'done', cast: 'done', audio: 'active' });
      await new Promise(r => setTimeout(r, 200));

      // Reconvertir le base64 audio en blob URL
      if (cached.audio_base64) {
        try {
          const binary = atob(cached.audio_base64);
          const bytes = new Uint8Array(binary.length);
          for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
          const blob = new Blob([bytes], { type: 'audio/mpeg' });
          const url = URL.createObjectURL(blob);
          setAudioUrl(url);
        } catch (e) {
          console.warn('[pipeline] Erreur restauration audio cache:', e.message);
        }
      }
      setSegmentTimings(cached.segmentTimings ?? null);
      setStepStatus({ analyze: 'done', cast: 'done', audio: 'done' });
      if (onComplete) onComplete();
      return;
    }

    // Étape 1 : Analyse Stockfish
    setStepStatus({ analyze: 'active', cast: 'idle', audio: 'idle' });
    let analysisData = null;
    let fensData = null;
    try {
      const data = await fetchAnalysis(game.pgn);
      analysisData = data.annotations ?? null;
      fensData = data.fens ?? null;
      setAnnotations(analysisData);
      setFens(fensData);
      setStepStatus({ analyze: 'done', cast: 'idle', audio: 'idle' });
    } catch (err) {
      setStepStatus({ analyze: 'error', cast: 'idle', audio: 'idle' });
      setStepError(e => ({ ...e, analyze: err.message }));
      return;
    }

    // Étape 2 : Commentaire Claude
    setStepStatus({ analyze: 'done', cast: 'active', audio: 'idle' });
    let segmentsData = null;
    let text = '';
    try {
      const lang = (() => { try { return localStorage.getItem('lang') || 'fr'; } catch { return 'fr'; } })();
      const data = await fetchCast(game.pgn, analysisData, lang);
      if (data.annotations) setAnnotations(data.annotations);
      if (data.fens) { fensData = data.fens; setFens(data.fens); }
      segmentsData = data.segments ?? null;
      text = data.text ?? '';
      setSegments(segmentsData);
      setCastText(text);
      localStorage.setItem('castText', text);
      setStepStatus({ analyze: 'done', cast: 'done', audio: 'idle' });
    } catch (err) {
      setStepStatus({ analyze: 'done', cast: 'error', audio: 'idle' });
      setStepError(e => ({ ...e, cast: err.message }));
      return;
    }

    // Étape 3 : Audio ElevenLabs
    setStepStatus({ analyze: 'done', cast: 'done', audio: 'active' });
    try {
      const lang = (() => { try { return localStorage.getItem('lang') || 'fr'; } catch { return 'fr'; } })();
      const { audioUrl: url, segmentTimings: timings, audio_base64 } = await fetchAudio(text, segmentsData, lang);
      setAudioUrl(url);
      setSegmentTimings(timings);
      setStepStatus({ analyze: 'done', cast: 'done', audio: 'done' });

      // Sauvegarder en cache
      saveCache(key, {
        annotations: analysisData,
        fens: fensData,
        segments: segmentsData,
        text,
        audio_base64,
        segmentTimings: timings,
      });

      if (onComplete) onComplete();
    } catch (err) {
      setStepStatus({ analyze: 'done', cast: 'done', audio: 'error' });
      setStepError(e => ({ ...e, audio: err.message }));
    }
  }, []);

  // Charger des données mock directement (usage dev uniquement)
  const loadMock = useCallback((data) => {
    setAnnotations(data.annotations ?? null);
    setFens(data.fens ?? null);
    setSegments(data.segments ?? null);
    setCastText(data.text ?? '');
    setAudioUrl(data.audioUrl ?? '');
    setSegmentTimings(data.segmentTimings ?? null);
    setStepStatus({ analyze: 'done', cast: 'done', audio: 'done' });
  }, []);

  return {
    annotations,
    fens,
    segments,
    castText,
    audioUrl,
    segmentTimings,
    stepStatus,
    stepError,
    reset,
    runFullPipeline,
    loadMock,
  };
}
