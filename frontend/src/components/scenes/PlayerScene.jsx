import React, { useRef, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { T } from '../../theme.js';
import ChessboardSync from '../ui/ChessboardSync.jsx';
import AnalysisDrawer from '../AnalysisDrawer.jsx';
import CommentaryDrawer from '../CommentaryDrawer.jsx';
import PremiumButton from '../ui/PremiumButton.jsx';
import useSyncPlayer from '../../hooks/useSyncPlayer.js';
import useBoardAnnotations from '../../hooks/useBoardAnnotations.js';

function formatTime(s) {
  if (!isFinite(s) || s < 0) return '0:00';
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

export default function PlayerScene({ audioUrl, castText, annotations, game, fens, segments, segmentTimings, onRestart }) {
  const whiteName = game?.white?.username ?? '?';
  const blackName = game?.black?.username ?? '?';

  const {
    audioRef,
    isPlaying,
    currentTime,
    duration,
    progress,
    toggle,
    seek,
    currentFen,
    currentFenIndex,
    activeSegment,
  } = useSyncPlayer({ audioUrl, fens, segmentTimings });

  const { arrows, squareStyles } = useBoardAnnotations({ annotations, currentFenIndex, activeSegment });

  const seekBarRef = useRef(null);

  // Injecter l'animation blink une seule fois
  useEffect(() => {
    if (document.getElementById('autocast-blink-style')) return;
    const style = document.createElement('style');
    style.id = 'autocast-blink-style';
    style.textContent = '@keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }';
    document.head.appendChild(style);
  }, []);

  // Découpe le texte en lignes de ~55 chars (aux coupures de mots)
  function splitLines(text, maxChars = 55) {
    const words = (text ?? '').split(' ');
    const lines = [];
    let cur = '';
    for (const w of words) {
      if (cur && (cur + ' ' + w).length > maxChars) { lines.push(cur); cur = w; }
      else cur = cur ? cur + ' ' + w : w;
    }
    if (cur) lines.push(cur);
    return lines;
  }

  // Sous-titres synchronisés : une seule ligne affichée à la fois
  // dérivée de currentTime → pause = texte gelé, seek = position correcte
  const { subtitleLine, isTyping } = useMemo(() => {
    const text = activeSegment?.text ?? '';
    if (!text) return { subtitleLine: '', isTyping: false };

    const segStart = activeSegment?.startTime ?? 0;
    const segEnd = activeSegment?.endTime ?? segStart + 1;
    const segDuration = Math.max(0.01, segEnd - segStart);
    const elapsed = Math.max(0, currentTime - segStart);
    const ratio = Math.min(1, elapsed / segDuration);
    const revealedChars = Math.floor(ratio * text.length);

    // Trouver sur quelle ligne on se trouve
    const lines = splitLines(text);
    let charPos = 0;
    for (const line of lines) {
      const lineEnd = charPos + line.length;
      if (revealedChars <= lineEnd) {
        // On est sur cette ligne : afficher les chars révélés depuis le début de la ligne
        const lineReveal = revealedChars - charPos;
        return { subtitleLine: line.slice(0, lineReveal), isTyping: revealedChars < text.length };
      }
      charPos = lineEnd + 1; // +1 pour l'espace entre lignes
    }
    // Fin du segment : afficher la dernière ligne complète
    const lastLine = lines[lines.length - 1] ?? '';
    return { subtitleLine: lastLine, isTyping: false };
  }, [currentTime, activeSegment]);

  function handleSeekClick(e) {
    if (!seekBarRef.current) return;
    const rect = seekBarRef.current.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    seek(pct);
  }

  const containerVariants = {
    initial: {},
    animate: { transition: { staggerChildren: 0.1 } },
  };
  const itemVariants = {
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] } },
  };

  return (
    <div style={{
      minHeight: '100dvh',
      display: 'flex',
      flexDirection: 'column',
      padding: '32px 24px 48px',
      maxWidth: 560,
      margin: '0 auto',
      width: '100%',
    }}>
      {/* Audio element caché */}
      <audio ref={audioRef} preload="auto" style={{ display: 'none' }} />

      <motion.div
        variants={containerVariants}
        initial="initial"
        animate="animate"
        style={{ display: 'flex', flexDirection: 'column', gap: 24, flex: 1 }}
      >
        {/* En-tête */}
        <motion.div variants={itemVariants}>
          <div style={{ fontSize: 11, color: T.textMuted, fontFamily: T.fontBody, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 6 }}>
            Cast prêt
          </div>
          <h1 style={{
            fontFamily: T.fontDisplay,
            fontSize: 'clamp(20px, 5vw, 28px)',
            fontWeight: 600,
            color: T.textPrimary,
            letterSpacing: '-0.01em',
            lineHeight: 1.2,
          }}>
            {whiteName}{' '}
            <span style={{ color: T.textMuted, fontWeight: 400, fontStyle: 'italic', fontSize: '0.8em' }}>vs</span>{' '}
            {blackName}
          </h1>
        </motion.div>

        {/* Échiquier */}
        <motion.div variants={itemVariants} style={{ display: 'flex', justifyContent: 'center' }}>
          <ChessboardSync fen={currentFen} moveIndex={currentFenIndex} arrows={arrows} squareStyles={squareStyles} />
        </motion.div>

        {/* Sous-titre du segment actif */}
        <motion.div
          variants={itemVariants}
          style={{
            background: T.surface,
            border: `1px solid ${T.border}`,
            borderRadius: T.r12,
            padding: '14px 18px',
            minHeight: 60,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <p style={{
            fontFamily: T.fontBody,
            fontSize: 14,
            color: T.textSecondary,
            lineHeight: 1.6,
            margin: 0,
            fontStyle: 'italic',
          }}>
            {subtitleLine || (
              <span style={{ color: T.textMuted, fontStyle: 'normal', fontSize: 13 }}>
                Appuyez sur lecture pour démarrer…
              </span>
            )}
            {isTyping && subtitleLine && (
              <span style={{
                display: 'inline-block',
                width: 2,
                height: '1em',
                background: T.gold,
                marginLeft: 2,
                verticalAlign: 'text-bottom',
                animation: 'blink 0.8s step-end infinite',
              }} />
            )}
          </p>
        </motion.div>

        {/* Contrôles audio */}
        <motion.div
          variants={itemVariants}
          style={{
            background: T.surface,
            border: `1px solid ${T.border}`,
            borderRadius: T.r16,
            padding: '20px 24px',
            boxShadow: T.shadowCard,
          }}
        >
          {/* Barre de seek */}
          <div
            ref={seekBarRef}
            onClick={handleSeekClick}
            style={{
              height: 6,
              background: T.surfaceHigh,
              borderRadius: 3,
              cursor: 'pointer',
              position: 'relative',
              marginBottom: 16,
            }}
          >
            <div style={{
              position: 'absolute',
              left: 0,
              top: 0,
              height: '100%',
              width: `${progress * 100}%`,
              background: T.gold,
              borderRadius: 3,
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
              background: T.gold,
              borderRadius: '50%',
              boxShadow: `0 0 8px ${T.gold}`,
            }} />
          </div>

          {/* Bouton + temps */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {/* Bouton play/pause */}
            <button
              onClick={toggle}
              style={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                background: T.gold,
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                boxShadow: `0 0 16px ${T.goldDim}`,
              }}
            >
              {isPlaying ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="#080b11">
                  <rect x="6" y="4" width="4" height="16" rx="1" />
                  <rect x="14" y="4" width="4" height="16" rx="1" />
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="#080b11">
                  <polygon points="5,3 19,12 5,21" />
                </svg>
              )}
            </button>

            {/* Temps */}
            <div style={{
              fontFamily: T.fontCode,
              fontSize: 13,
              color: T.textSecondary,
              letterSpacing: '0.05em',
            }}>
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>
          </div>
        </motion.div>

        {/* Drawers */}
        <motion.div variants={itemVariants} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <AnalysisDrawer annotations={annotations} game={game} />
          <CommentaryDrawer text={castText} />
        </motion.div>

        {/* Nouvelle partie */}
        <motion.div
          variants={itemVariants}
          style={{ marginTop: 'auto', display: 'flex', justifyContent: 'center', paddingTop: 8 }}
        >
          <PremiumButton variant="ghost" onClick={onRestart} size="sm">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 1 0 .49-3.51" />
            </svg>
            Nouvelle partie
          </PremiumButton>
        </motion.div>
      </motion.div>
    </div>
  );
}
