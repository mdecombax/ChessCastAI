import React, { useState } from 'react';
import UsernameInput from './components/UsernameInput.jsx';
import GameList from './components/GameList.jsx';
import Pipeline from './components/Pipeline.jsx';
import { fetchGames, fetchAnalysis, fetchCast, fetchAudio } from './api.js';

export default function App() {
  const [games, setGames] = useState([]);
  const [loadingGames, setLoadingGames] = useState(false);
  const [gamesError, setGamesError] = useState('');
  const [selectedGame, setSelectedGame] = useState(null);

  const [annotations, setAnnotations] = useState(null);
  const [castText, setCastText] = useState('');
  const [audioUrl, setAudioUrl] = useState('');
  const [stepStatus, setStepStatus] = useState({ analyze: 'idle', cast: 'idle', audio: 'idle' });
  const [stepError, setStepError] = useState({ analyze: '', cast: '', audio: '' });

  if (typeof window !== 'undefined') {
    window.debug = { games, selectedGame, annotations, castText, audioUrl, stepStatus };
  }

  function resetPipeline() {
    setAnnotations(null);
    setCastText('');
    setAudioUrl('');
    setStepStatus({ analyze: 'idle', cast: 'idle', audio: 'idle' });
    setStepError({ analyze: '', cast: '', audio: '' });
  }

  async function handleFetchGames(username) {
    setGamesError('');
    setGames([]);
    setSelectedGame(null);
    resetPipeline();
    setLoadingGames(true);
    try {
      const data = await fetchGames(username);
      setGames(data.games || []);
    } catch (err) {
      setGamesError(`Impossible de charger les parties : ${err.message}`);
    } finally {
      setLoadingGames(false);
    }
  }

  function handleSelectGame(game) {
    setSelectedGame(game);
    resetPipeline();
  }

  async function handleAnalyze() {
    if (!selectedGame) return;
    setStepStatus(s => ({ ...s, analyze: 'active' }));
    setStepError(s => ({ ...s, analyze: '' }));
    try {
      const data = await fetchAnalysis(selectedGame.pgn);
      setAnnotations(data.annotations ?? null);
      setStepStatus(s => ({ ...s, analyze: 'done' }));
    } catch (err) {
      setStepStatus(s => ({ ...s, analyze: 'error' }));
      setStepError(s => ({ ...s, analyze: err.message }));
    }
  }

  async function handleCast() {
    if (!selectedGame) return;
    setCastText('');
    setAudioUrl('');
    setStepStatus(s => ({ ...s, cast: 'active' }));
    setStepError(s => ({ ...s, cast: '' }));
    try {
      const data = await fetchCast(selectedGame.pgn, annotations);
      if (data.annotations) setAnnotations(data.annotations);
      setCastText(data.text);
      localStorage.setItem('castText', data.text);
      setStepStatus(s => ({ ...s, cast: 'done' }));
    } catch (err) {
      setStepStatus(s => ({ ...s, cast: 'error' }));
      setStepError(s => ({ ...s, cast: err.message }));
    }
  }

  async function handleAudio() {
    if (!castText) return;
    setAudioUrl('');
    setStepStatus(s => ({ ...s, audio: 'active' }));
    setStepError(s => ({ ...s, audio: '' }));
    try {
      const blob = await fetchAudio(castText);
      setAudioUrl(URL.createObjectURL(blob));
      setStepStatus(s => ({ ...s, audio: 'done' }));
    } catch (err) {
      setStepStatus(s => ({ ...s, audio: 'error' }));
      setStepError(s => ({ ...s, audio: err.message }));
    }
  }

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: 24, fontFamily: 'sans-serif' }}>
      <h1>AutoCastChess ♟️</h1>
      <p>Commentaire audio généré par IA pour tes parties Chess.com.</p>

      <UsernameInput onSubmit={handleFetchGames} loading={loadingGames} />

      {gamesError && <p style={{ color: 'red' }}>{gamesError}</p>}

      {games.length > 0 && (
        <GameList
          games={games}
          selected={selectedGame}
          onSelect={handleSelectGame}
        />
      )}

      {selectedGame && (
        <Pipeline
          stepStatus={stepStatus}
          stepError={stepError}
          annotations={annotations}
          game={selectedGame}
          castText={castText}
          audioUrl={audioUrl}
          onAnalyze={handleAnalyze}
          onCast={handleCast}
          onAudio={handleAudio}
        />
      )}
    </div>
  );
}
