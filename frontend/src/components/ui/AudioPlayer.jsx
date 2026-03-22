import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { T } from '../../theme.js';
import useAudioPlayer from '../../hooks/useAudioPlayer.js';
import WaveformViz from './WaveformViz.jsx';

function formatTime(s) {
  if (!s || isNaN(s)) return '0:00';
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

function PlayIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <polygon points="5 3 19 12 5 21 5 3" />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <rect x="6" y="4" width="4" height="16" rx="1" />
      <rect x="14" y="4" width="4" height="16" rx="1" />
    </svg>
  );
}

export default function AudioPlayer({ src }) {
  const { audioRef, isPlaying, currentTime, duration, progress, toggle, seek } = useAudioPlayer(src);
  const trackRef = useRef(null);

  function handleTrackClick(e) {
    const rect = trackRef.current.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    seek(Math.max(0, Math.min(1, pct)));
  }

  return (
    <div style={{ width: '100%' }}>
      {/* Audio élément caché */}
      <audio ref={audioRef} style={{ display: 'none' }} />

      {/* Waveform */}
      <WaveformViz isPlaying={isPlaying} progress={progress} />

      {/* Seek bar */}
      <div
        ref={trackRef}
        onClick={handleTrackClick}
        style={{
          height: 4,
          background: 'rgba(255,255,255,0.06)',
          borderRadius: 2,
          marginTop: 16,
          cursor: 'pointer',
          position: 'relative',
          overflow: 'visible',
        }}
      >
        <div style={{
          position: 'absolute',
          left: 0,
          top: 0,
          height: '100%',
          width: `${progress * 100}%`,
          background: `linear-gradient(90deg, ${T.gold}, rgba(212,175,55,0.5))`,
          borderRadius: 2,
          boxShadow: '0 0 6px rgba(212,175,55,0.3)',
          transition: 'width 0.1s linear',
        }} />
        {/* Thumb */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: `${progress * 100}%`,
          transform: 'translate(-50%, -50%)',
          width: 12,
          height: 12,
          borderRadius: '50%',
          background: T.textPrimary,
          boxShadow: '0 0 0 2px rgba(212,175,55,0.3)',
          transition: 'left 0.1s linear',
        }} />
      </div>

      {/* Temps */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        marginTop: 8,
        fontSize: 12,
        color: T.textSecondary,
        fontFamily: T.fontCode,
      }}>
        <span>{formatTime(currentTime)}</span>
        <span>{formatTime(duration)}</span>
      </div>

      {/* Bouton play/pause */}
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 24 }}>
        <motion.button
          onClick={toggle}
          whileHover={{ scale: 1.05, boxShadow: T.shadowGoldStrong }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          style={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #d4af37 0%, #b8941e 100%)',
            border: 'none',
            color: '#080b11',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: T.shadowGold,
            outline: 'none',
          }}
        >
          {isPlaying ? <PauseIcon /> : <PlayIcon />}
        </motion.button>
      </div>
    </div>
  );
}
