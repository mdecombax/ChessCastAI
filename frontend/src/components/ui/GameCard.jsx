import React from 'react';
import { motion } from 'framer-motion';
import { T } from '../../theme.js';
import { ResultBadge } from './Badge.jsx';

function formatDate(ts) {
  if (!ts) return '';
  return new Date(ts * 1000).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
}

function TimeControlIcon({ timeClass }) {
  const icons = { bullet: '⚡', blitz: '🔥', rapid: '⏱', daily: '📅' };
  return <span style={{ fontSize: 12 }}>{icons[timeClass] ?? '♟'}</span>;
}

export default function GameCard({ game, selected, onClick }) {
  const white = game.white?.username ?? '?';
  const black = game.black?.username ?? '?';
  const whiteResult = game.white?.result;
  const result = whiteResult === 'win' ? 'win' : whiteResult === 'checkmated' || whiteResult === 'resigned' || whiteResult === 'timeout' || whiteResult === 'abandoned' ? 'loss' : 'draw';

  return (
    <motion.div
      onClick={onClick}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.99 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        padding: '16px 20px',
        background: selected ? T.surfaceHigh : T.surface,
        border: `1px solid ${selected ? T.borderActive : T.border}`,
        borderRadius: T.r12,
        cursor: 'pointer',
        transition: T.transition,
        boxShadow: selected ? T.shadowGold : T.shadowCard,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Accent latéral quand sélectionné */}
      {selected && (
        <div style={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: 3,
          background: `linear-gradient(to bottom, ${T.gold}, rgba(212,175,55,0.3))`,
          borderRadius: '3px 0 0 3px',
        }} />
      )}

      {/* Couleur du joueur */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 3,
        flexShrink: 0,
      }}>
        <div style={{
          width: 10,
          height: 10,
          borderRadius: '50%',
          background: '#e8e6e1',
          border: `1px solid rgba(255,255,255,0.3)`,
        }} />
        <div style={{
          width: 10,
          height: 10,
          borderRadius: '50%',
          background: '#1a1a1a',
          border: `1px solid ${T.border}`,
        }} />
      </div>

      {/* Joueurs */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontFamily: T.fontBody,
          fontWeight: 600,
          fontSize: 15,
          color: T.textPrimary,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}>
          {white} <span style={{ color: T.textMuted, fontWeight: 400 }}>vs</span> {black}
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          marginTop: 4,
          fontSize: 12,
          color: T.textSecondary,
          fontFamily: T.fontBody,
        }}>
          <TimeControlIcon timeClass={game.time_class} />
          <span style={{ textTransform: 'capitalize' }}>{game.time_class}</span>
          <span style={{ color: T.textMuted }}>·</span>
          <span>{formatDate(game.end_time)}</span>
        </div>
      </div>

      {/* Résultat */}
      <div style={{ flexShrink: 0 }}>
        <ResultBadge result={result} />
      </div>
    </motion.div>
  );
}
