import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { T } from '../theme.js';
import { ClassChip, ClassBadge } from './ui/Badge.jsx';

const CLASS_CONFIG = {
  blunder:    { color: '#ef4444', border: 'rgba(239,68,68,0.25)',   bg: 'rgba(239,68,68,0.05)' },
  mistake:    { color: '#f97316', border: 'rgba(249,115,22,0.25)',  bg: 'rgba(249,115,22,0.05)' },
  inaccuracy: { color: '#eab308', border: 'rgba(234,179,8,0.25)',   bg: 'rgba(234,179,8,0.05)' },
  best:       { color: T.success, border: T.successBorder,          bg: T.successBg },
};

function countBy(annotations, color, cls) {
  return annotations.filter(a => a.color === color && a.classification === cls).length;
}

function PlayerSummary({ label, annotations, color }) {
  return (
    <div style={{ flex: 1 }}>
      <div style={{ fontFamily: T.fontBody, fontWeight: 500, fontSize: 13, color: T.textSecondary, marginBottom: 8 }}>
        {label}
      </div>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {['blunder', 'mistake', 'inaccuracy'].map(cls => {
          const count = countBy(annotations, color, cls);
          return count > 0 ? <ClassChip key={cls} count={count} classification={cls} /> : null;
        })}
        {['blunder', 'mistake', 'inaccuracy'].every(cls => countBy(annotations, color, cls) === 0) && (
          <span style={{ fontSize: 12, color: T.textMuted, fontFamily: T.fontBody }}>Aucune erreur</span>
        )}
      </div>
    </div>
  );
}

export default function AnalysisDrawer({ annotations, game }) {
  const [open, setOpen] = useState(false);

  if (!annotations || annotations.length === 0) return null;

  const keyMoves = annotations.filter(a => a.classification !== 'normal');
  const whiteName = game?.white?.username ?? 'Blanc';
  const blackName = game?.black?.username ?? 'Noir';

  return (
    <div>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'transparent',
          border: `1px solid ${T.border}`,
          borderRadius: T.r12,
          padding: '14px 20px',
          cursor: 'pointer',
          color: T.textSecondary,
          fontFamily: T.fontBody,
          fontSize: 14,
          fontWeight: 500,
          transition: T.transition,
        }}
        onMouseEnter={e => {
          e.currentTarget.style.borderColor = T.borderHover;
          e.currentTarget.style.color = T.textPrimary;
        }}
        onMouseLeave={e => {
          e.currentTarget.style.borderColor = T.border;
          e.currentTarget.style.color = T.textSecondary;
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
          </svg>
          Analyse Stockfish
        </span>
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </motion.span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{
              border: `1px solid ${T.border}`,
              borderTop: 'none',
              borderRadius: `0 0 ${T.r12}px ${T.r12}px`,
              padding: '20px',
              background: T.surface,
            }}>
              {/* Résumé joueurs */}
              <div style={{ display: 'flex', gap: 24, marginBottom: keyMoves.length > 0 ? 20 : 0 }}>
                <PlayerSummary label={`♙ ${whiteName}`} annotations={annotations} color="blanc" />
                <PlayerSummary label={`♟ ${blackName}`} annotations={annotations} color="noir" />
              </div>

              {/* Moments clés */}
              {keyMoves.length > 0 && (
                <>
                  <div style={{ height: 1, background: T.border, marginBottom: 16 }} />
                  <div style={{ fontSize: 11, color: T.textMuted, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12, fontFamily: T.fontBody }}>
                    Moments clés
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {keyMoves.map((m, i) => {
                      const cfg = CLASS_CONFIG[m.classification];
                      return (
                        <div key={i} style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 10,
                          padding: '8px 12px',
                          background: cfg?.bg ?? 'transparent',
                          borderLeft: `2px solid ${cfg?.color ?? T.border}`,
                          borderRadius: `0 ${T.r8}px ${T.r8}px 0`,
                          fontSize: 13,
                        }}>
                          <span style={{ color: T.textMuted, fontFamily: T.fontCode, minWidth: 40, fontSize: 12 }}>
                            {m.color === 'blanc' ? `${m.moveNumber}.` : `${m.moveNumber}…`}
                          </span>
                          <span style={{ fontFamily: T.fontCode, fontWeight: 500, color: T.textPrimary, minWidth: 60 }}>
                            {m.san}
                            <ClassBadge classification={m.classification} />
                          </span>
                          {m.evalDrop !== undefined && m.classification !== 'best' && (
                            <span style={{ color: T.textSecondary, fontSize: 12, fontFamily: T.fontCode }}>
                              {m.evalDrop > 9000 ? 'mat' : `−${m.evalDrop} cp`}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
