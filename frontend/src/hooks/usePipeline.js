import { useState, useCallback } from 'react';
import { fetchAnalysis, fetchCast, fetchAudio } from '../api.js';

const IDLE = { analyze: 'idle', cast: 'idle', audio: 'idle' };
const NO_ERR = { analyze: '', cast: '', audio: '' };

export default function usePipeline() {
  const [annotations, setAnnotations] = useState(null);
  const [castText, setCastText] = useState('');
  const [audioUrl, setAudioUrl] = useState('');
  const [stepStatus, setStepStatus] = useState(IDLE);
  const [stepError, setStepError] = useState(NO_ERR);

  function reset() {
    setAnnotations(null);
    setCastText('');
    setAudioUrl('');
    setStepStatus(IDLE);
    setStepError(NO_ERR);
  }

  const runFullPipeline = useCallback(async (game, onComplete) => {
    if (!game) return;
    reset();

    // Étape 1 : Analyse Stockfish
    setStepStatus({ analyze: 'active', cast: 'idle', audio: 'idle' });
    let analysisData = null;
    try {
      const data = await fetchAnalysis(game.pgn);
      analysisData = data.annotations ?? null;
      setAnnotations(analysisData);
      setStepStatus({ analyze: 'done', cast: 'idle', audio: 'idle' });
    } catch (err) {
      setStepStatus({ analyze: 'error', cast: 'idle', audio: 'idle' });
      setStepError(e => ({ ...e, analyze: err.message }));
      return;
    }

    // Étape 2 : Commentaire Claude
    setStepStatus({ analyze: 'done', cast: 'active', audio: 'idle' });
    let text = '';
    try {
      const data = await fetchCast(game.pgn, analysisData);
      if (data.annotations) setAnnotations(data.annotations);
      text = data.text;
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
      const blob = await fetchAudio(text);
      const url = URL.createObjectURL(blob);
      setAudioUrl(url);
      setStepStatus({ analyze: 'done', cast: 'done', audio: 'done' });
      if (onComplete) onComplete(url, text, analysisData);
    } catch (err) {
      setStepStatus({ analyze: 'done', cast: 'done', audio: 'error' });
      setStepError(e => ({ ...e, audio: err.message }));
    }
  }, []);

  return {
    annotations,
    castText,
    audioUrl,
    stepStatus,
    stepError,
    reset,
    runFullPipeline,
  };
}
