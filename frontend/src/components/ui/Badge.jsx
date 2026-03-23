import React from 'react';
import { T } from '../../theme.js';
import { useLang } from '../../LanguageContext.jsx';

const CLASS_CONFIG = {
  blunder:    { label: '??', color: '#ef4444', bg: 'rgba(239,68,68,0.08)',   border: 'rgba(239,68,68,0.25)' },
  mistake:    { label: '?',  color: '#f97316', bg: 'rgba(249,115,22,0.08)', border: 'rgba(249,115,22,0.25)' },
  inaccuracy: { label: '?!', color: '#eab308', bg: 'rgba(234,179,8,0.08)',  border: 'rgba(234,179,8,0.25)' },
  best:       { label: '!!', color: T.success, bg: T.successBg,             border: T.successBorder },
};

export function ResultBadge({ result }) {
  const { t } = useLang();
  const RESULT_CONFIG = {
    win:  { label: t.result_win,  color: T.success,  bg: T.successBg,  border: T.successBorder },
    loss: { label: t.result_loss, color: T.error,    bg: T.errorBg,    border: T.errorBorder },
    draw: { label: t.result_draw, color: T.textGold, bg: T.goldGlow,   border: T.borderActive },
  };
  const cfg = RESULT_CONFIG[result] ?? { label: result, color: T.textSecondary, bg: 'transparent', border: T.border };
  return (
    <span style={{
      display: 'inline-block',
      padding: '2px 10px',
      borderRadius: 20,
      background: cfg.bg,
      border: `1px solid ${cfg.border}`,
      color: cfg.color,
      fontSize: 11,
      fontWeight: 600,
      letterSpacing: '0.04em',
      textTransform: 'uppercase',
      fontFamily: T.fontBody,
    }}>
      {cfg.label}
    </span>
  );
}

export function ClassBadge({ classification }) {
  const cfg = CLASS_CONFIG[classification];
  if (!cfg) return null;
  return (
    <span style={{
      display: 'inline-block',
      padding: '1px 7px',
      borderRadius: 4,
      background: cfg.bg,
      border: `1px solid ${cfg.border}`,
      color: cfg.color,
      fontSize: 11,
      fontWeight: 700,
      fontFamily: T.fontCode,
      marginLeft: 6,
    }}>
      {cfg.label}
    </span>
  );
}

export function ClassChip({ count, classification }) {
  const cfg = CLASS_CONFIG[classification];
  const { t } = useLang();
  if (!cfg || count === 0) return null;
  const labels = { blunder: t.badge_blunder, mistake: t.badge_mistake, inaccuracy: t.badge_inaccuracy, best: t.badge_best };
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 5,
      padding: '3px 10px',
      borderRadius: 20,
      background: cfg.bg,
      border: `1px solid ${cfg.border}`,
      color: cfg.color,
      fontSize: 12,
      fontWeight: 600,
      fontFamily: T.fontBody,
    }}>
      <span style={{ fontFamily: T.fontCode }}>{cfg.label}</span>
      <span>{count}</span>
      <span style={{ opacity: 0.7 }}>{labels[classification]}{count > 1 ? 's' : ''}</span>
    </span>
  );
}
