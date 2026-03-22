import React, { useState, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import usePipeline from './hooks/usePipeline.js';
import { fetchGames } from './api.js';
import SceneManager from './components/SceneManager.jsx';
import WelcomeScene from './components/scenes/WelcomeScene.jsx';
import GameSelectScene from './components/scenes/GameSelectScene.jsx';
import GenerationScene from './components/scenes/GenerationScene.jsx';
import PlayerScene from './components/scenes/PlayerScene.jsx';

export default function App() {
  const [scene, setScene] = useState('welcome'); // welcome | select | generate | player
  const [username, setUsername] = useState('');
  const [games, setGames] = useState([]);
  const [loadingGames, setLoadingGames] = useState(false);
  const [gamesError, setGamesError] = useState('');
  const [selectedGame, setSelectedGame] = useState(null);

  const pipeline = usePipeline();

  if (typeof window !== 'undefined') {
    window.debug = { scene, username, games, selectedGame, pipeline, setScene, setSelectedGame };
  }

  const handleFetchGames = useCallback(async (uname) => {
    setGamesError('');
    setGames([]);
    setSelectedGame(null);
    pipeline.reset();
    setLoadingGames(true);
    try {
      const data = await fetchGames(uname);
      setUsername(uname);
      setGames(data.games || []);
      setScene('select');
    } catch (err) {
      setGamesError(`Impossible de charger les parties : ${err.message}`);
    } finally {
      setLoadingGames(false);
    }
  }, [pipeline]);

  const handleSelectGame = useCallback((game) => {
    setSelectedGame(game);
    pipeline.reset();
  }, [pipeline]);

  const handleLaunchCast = useCallback(() => {
    setScene('generate');
  }, []);

  const handlePipelineComplete = useCallback(() => {
    setScene('player');
  }, []);

  const handleRestart = useCallback(() => {
    setSelectedGame(null);
    pipeline.reset();
    setScene('welcome');
  }, [pipeline]);

  const handleBackToSelect = useCallback(() => {
    pipeline.reset();
    setScene('select');
  }, [pipeline]);

  const sceneProps = {
    welcome: {
      onSubmit: handleFetchGames,
      loading: loadingGames,
      error: gamesError,
    },
    select: {
      username,
      games,
      selectedGame,
      onSelect: handleSelectGame,
      onLaunch: handleLaunchCast,
      onBack: () => setScene('welcome'),
    },
    generate: {
      game: selectedGame,
      pipeline,
      onComplete: handlePipelineComplete,
      onBack: handleBackToSelect,
    },
    player: {
      audioUrl: pipeline.audioUrl,
      castText: pipeline.castText,
      annotations: pipeline.annotations,
      fens: pipeline.fens,
      segments: pipeline.segments,
      segmentTimings: pipeline.segmentTimings,
      game: selectedGame,
      onRestart: handleRestart,
    },
  };

  return (
    <div style={{ minHeight: '100dvh', position: 'relative' }}>
      <AnimatePresence mode="wait">
        {scene === 'welcome' && (
          <SceneManager key="welcome">
            <WelcomeScene {...sceneProps.welcome} />
          </SceneManager>
        )}
        {scene === 'select' && (
          <SceneManager key="select">
            <GameSelectScene {...sceneProps.select} />
          </SceneManager>
        )}
        {scene === 'generate' && (
          <SceneManager key="generate">
            <GenerationScene {...sceneProps.generate} />
          </SceneManager>
        )}
        {scene === 'player' && (
          <SceneManager key="player">
            <PlayerScene {...sceneProps.player} />
          </SceneManager>
        )}
      </AnimatePresence>
    </div>
  );
}
