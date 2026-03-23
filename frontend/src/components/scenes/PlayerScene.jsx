import React, { useRef, useMemo, useEffect, useState } from 'react';
import { T } from '../../theme.js';
import ChessboardSync from '../ui/ChessboardSync.jsx';
import AnalysisDrawer from '../AnalysisDrawer.jsx';
import CommentaryDrawer from '../CommentaryDrawer.jsx';
import useSyncPlayer from '../../hooks/useSyncPlayer.js';
import useBoardAnnotations from '../../hooks/useBoardAnnotations.js';
import { useLang } from '../../LanguageContext.jsx';

function formatTime(s) {
  if (!isFinite(s) || s < 0) return '0:00';
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

function computeBoardSize() {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  // Espace réservé : header(36) + subtitle(32) + controls(64) + drawers(100) + gaps(48) + padding(36)
  const reserved = 316;
  const fromHeight = Math.max(160, vh - reserved);
  const fromWidth = vw - 32;
  return Math.min(fromWidth, fromHeight, 720);
}

function splitLines(text, maxChars = 60) {
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

export default function PlayerScene({ audioUrl, castText, annotations, game, fens, segments, segmentTimings, username, onRestart }) {
  const whiteName = game?.white?.username ?? '?';
  const blackName = game?.black?.username ?? '?';
  const { t } = useLang();

  const boardOrientation = game?.black?.username?.toLowerCase() === username?.toLowerCase() ? 'black' : 'white';

  const [boardSize, setBoardSize] = useState(computeBoardSize);

  useEffect(() => {
    const onResize = () => setBoardSize(computeBoardSize());
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const {
    audioRef, isPlaying, currentTime, duration, progress, toggle, seek,
    currentFen, currentFenIndex, activeSegment, prevMove, nextMove, isManualNav,
  } = useSyncPlayer({ audioUrl, fens, segmentTimings });

  const { arrows, squareStyles } = useBoardAnnotations({ annotations, currentFenIndex, activeSegment, isManualNav });

  const seekBarRef = useRef(null);

  // Navigation clavier : ← → pour parcourir les coups
  useEffect(() => {
    function onKeyDown(e) {
      const tag = document.activeElement?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      if (e.key === 'ArrowLeft') { e.preventDefault(); prevMove(); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); nextMove(); }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [prevMove, nextMove]);

  useEffect(() => {
    if (document.getElementById('autocast-blink-style')) return;
    const style = document.createElement('style');
    style.id = 'autocast-blink-style';
    style.textContent = '@keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }';
    document.head.appendChild(style);
  }, []);

  const { subtitleLine, isTyping } = useMemo(() => {
    const text = activeSegment?.text ?? '';
    if (!text) return { subtitleLine: '', isTyping: false };
    const segStart = activeSegment?.startTime ?? 0;
    const segEnd = activeSegment?.endTime ?? segStart + 1;
    const segDuration = Math.max(0.01, segEnd - segStart);
    const elapsed = Math.max(0, currentTime - segStart);
    const ratio = Math.min(1, elapsed / segDuration);
    const revealedChars = Math.floor(ratio * text.length);
    const lines = splitLines(text);
    let charPos = 0;
    for (const line of lines) {
      const lineEnd = charPos + line.length;
      if (revealedChars <= lineEnd) {
        const lineReveal = revealedChars - charPos;
        return { subtitleLine: line.slice(0, lineReveal), isTyping: revealedChars < text.length };
      }
      charPos = lineEnd + 1;
    }
    const lastLine = lines[lines.length - 1] ?? '';
    return { subtitleLine: lastLine, isTyping: false };
  }, [currentTime, activeSegment]);

  function handleSeekClick(e) {
    if (!seekBarRef.current) return;
    const rect = seekBarRef.current.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    seek(pct);
  }

  return (
    <div style={{
      minHeight: '100dvh',
      display: 'flex',
      flexDirection: 'column',
      padding: '14px 16px 20px',
      boxSizing: 'border-box',
    }}>
      <audio ref={audioRef} preload="auto" style={{ display: 'none' }} />

      {/* ── Header compact ── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        marginBottom: 10,
        flexShrink: 0,
      }}>
        <span style={{
          fontFamily: T.fontDisplay,
          fontSize: 'clamp(15px, 3.5vw, 22px)',
          fontWeight: 600,
          color: T.textPrimary,
          letterSpacing: '-0.01em',
          lineHeight: 1.2,
        }}>
          {whiteName}
        </span>
        <span style={{
          color: T.textMuted,
          fontFamily: T.fontBody,
          fontSize: 11,
          fontStyle: 'italic',
          flexShrink: 0,
        }}>vs</span>
        <span style={{
          fontFamily: T.fontDisplay,
          fontSize: 'clamp(15px, 3.5vw, 22px)',
          fontWeight: 600,
          color: T.textPrimary,
          letterSpacing: '-0.01em',
          lineHeight: 1.2,
        }}>
          {blackName}
        </span>
      </div>

      {/* ── Échiquier — élément principal ── */}
      <div style={{ display: 'flex', justifyContent: 'center', flexShrink: 0 }}>
        <ChessboardSync
          fen={currentFen}
          moveIndex={currentFenIndex}
          arrows={arrows}
          squareStyles={squareStyles}
          size={boardSize}
          orientation={boardOrientation}
        />
      </div>

      {/* ── Sous-titre d'une ligne ── */}
      <div style={{
        minHeight: 28,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        padding: '0 4px',
        maxWidth: boardSize,
        margin: '8px auto 0',
        width: '100%',
        boxSizing: 'border-box',
      }}>
        <p style={{
          fontFamily: T.fontBody,
          fontSize: 'clamp(12px, 2.8vw, 14px)',
          color: T.textSecondary,
          lineHeight: 1.4,
          margin: 0,
          fontStyle: 'italic',
          textAlign: 'center',
          overflow: 'hidden',
          whiteSpace: 'nowrap',
          textOverflow: 'ellipsis',
          width: '100%',
        }}>
          {subtitleLine || (
            <span style={{ color: T.textMuted, fontStyle: 'normal', fontSize: 12 }}>
              {t.press_play}
            </span>
          )}
          {isTyping && subtitleLine && (
            <span style={{
              display: 'inline-block', width: 2, height: '1em',
              background: T.gold, marginLeft: 2,
              verticalAlign: 'text-bottom',
              animation: 'blink 0.8s step-end infinite',
            }} />
          )}
        </p>
      </div>

      {/* ── Contrôles : play + seekbar + temps ── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        background: T.surface,
        border: `1px solid ${T.border}`,
        borderRadius: T.r16,
        padding: '10px 16px',
        flexShrink: 0,
        maxWidth: boardSize,
        margin: '8px auto 0',
        width: '100%',
        boxSizing: 'border-box',
      }}>
        {/* Bouton coup précédent */}
        <button
          onClick={prevMove}
          title={t.prev_move_title}
          style={{
            width: 32, height: 32, borderRadius: T.r8,
            background: T.surfaceHigh, border: `1px solid ${T.border}`,
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0, transition: T.transition,
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = T.borderHover; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={T.textSecondary} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15,18 9,12 15,6" />
          </svg>
        </button>

        {/* Bouton Play/Pause */}
        <button
          onClick={toggle}
          style={{
            width: 44, height: 44, borderRadius: '50%',
            background: T.gold, border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
            boxShadow: `0 0 16px ${T.goldDim}`,
            transition: 'box-shadow 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.boxShadow = `0 0 24px ${T.goldDim}`; }}
          onMouseLeave={e => { e.currentTarget.style.boxShadow = `0 0 16px ${T.goldDim}`; }}
        >
          {isPlaying ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="#080b11">
              <rect x="6" y="4" width="4" height="16" rx="1" />
              <rect x="14" y="4" width="4" height="16" rx="1" />
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="#080b11">
              <polygon points="5,3 19,12 5,21" />
            </svg>
          )}
        </button>

        {/* Bouton coup suivant */}
        <button
          onClick={nextMove}
          title={t.next_move_title}
          style={{
            width: 32, height: 32, borderRadius: T.r8,
            background: T.surfaceHigh, border: `1px solid ${T.border}`,
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0, transition: T.transition,
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = T.borderHover; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={T.textSecondary} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9,18 15,12 9,6" />
          </svg>
        </button>

        {/* Barre de seek */}
        <div
          ref={seekBarRef}
          onClick={handleSeekClick}
          style={{
            flex: 1, height: 5, background: T.surfaceHigh,
            borderRadius: 3, cursor: 'pointer', position: 'relative',
          }}
        >
          <div style={{
            position: 'absolute', left: 0, top: 0, height: '100%',
            width: `${progress * 100}%`,
            background: `linear-gradient(90deg, ${T.gold}, ${T.goldLight})`,
            borderRadius: 3, transition: 'width 0.1s linear',
          }} />
          <div style={{
            position: 'absolute', top: '50%', left: `${progress * 100}%`,
            transform: 'translate(-50%, -50%)',
            width: 12, height: 12,
            background: T.gold, borderRadius: '50%',
            boxShadow: `0 0 8px ${T.gold}`,
          }} />
        </div>

        {/* Temps */}
        <span style={{
          fontFamily: T.fontCode, fontSize: 12,
          color: T.textSecondary, letterSpacing: '0.04em',
          flexShrink: 0, whiteSpace: 'nowrap',
        }}>
          {formatTime(currentTime)}&nbsp;/&nbsp;{formatTime(duration)}
        </span>
      </div>

      {/* ── Bas : drawers + restart ── */}
      <div style={{
        marginTop: 8,
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
        flexShrink: 0,
        maxWidth: boardSize,
        margin: '8px auto 0',
        width: '100%',
      }}>
        <AnalysisDrawer annotations={annotations} game={game} />
        <CommentaryDrawer text={castText} />

        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 4 }}>
          <button
            onClick={onRestart}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: 'transparent',
              border: `1px solid ${T.border}`,
              borderRadius: T.r8, padding: '7px 16px',
              color: T.textMuted, cursor: 'pointer',
              fontFamily: T.fontBody, fontSize: 12,
              transition: T.transition,
            }}
            onMouseEnter={e => {
              e.currentTarget.style.color = T.textSecondary;
              e.currentTarget.style.borderColor = T.borderHover;
            }}
            onMouseLeave={e => {
              e.currentTarget.style.color = T.textMuted;
              e.currentTarget.style.borderColor = T.border;
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 1 0 .49-3.51" />
            </svg>
            {t.new_game}
          </button>
        </div>
      </div>
    </div>
  );
}
