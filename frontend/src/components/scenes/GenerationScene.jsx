import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { T } from '../../theme.js';
import ProgressBar from '../ui/ProgressBar.jsx';
import PremiumButton from '../ui/PremiumButton.jsx';

const STEPS = [
  {
    key: 'analyze',
    label: 'Analyse Stockfish',
    sublabel: 'Classification de chaque coup',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
    doneLabel: 'Analyse terminée',
  },
  {
    key: 'cast',
    label: 'Rédaction du commentaire',
    sublabel: 'Narration sportive par Claude',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
      </svg>
    ),
    doneLabel: 'Commentaire rédigé',
  },
  {
    key: 'audio',
    label: 'Synthèse vocale',
    sublabel: 'Voix par ElevenLabs',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
        <path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" y1="19" x2="12" y2="23" /><line x1="8" y1="23" x2="16" y2="23" />
      </svg>
    ),
    doneLabel: 'Audio prêt',
  },
];

function StepItem({ step, status, error, index }) {
  const isActive = status === 'active';
  const isDone = status === 'done';
  const isError = status === 'error';
  const isPending = status === 'idle';

  const color = isError ? T.error : isDone ? T.success : isActive ? T.gold : T.textMuted;
  const bgDot = isError ? T.errorBg : isDone ? T.successBg : isActive ? T.goldGlow : 'transparent';
  const borderDot = isError ? T.errorBorder : isDone ? T.successBorder : isActive ? T.borderActive : T.border;

  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      style={{
        display: 'flex',
        gap: 16,
        alignItems: 'flex-start',
      }}
    >
      {/* Colonne gauche : dot + ligne */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
        <motion.div
          animate={isActive ? {
            boxShadow: [`0 0 0 0 rgba(212,175,55,0)`, `0 0 0 6px rgba(212,175,55,0.15)`, `0 0 0 0 rgba(212,175,55,0)`],
          } : {}}
          transition={{ duration: 2, repeat: Infinity }}
          style={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            background: bgDot,
            border: `1px solid ${borderDot}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color,
            transition: T.transition,
          }}
        >
          {isDone ? (
            <motion.div
              initial={{ scale: 0, rotate: -30 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </motion.div>
          ) : isError ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          ) : (
            step.icon
          )}
        </motion.div>

        {/* Ligne verticale (sauf dernier) */}
        {index < STEPS.length - 1 && (
          <div style={{
            width: 1,
            flex: 1,
            minHeight: 24,
            background: isDone
              ? `linear-gradient(to bottom, ${T.success}, rgba(45,138,78,0.1))`
              : `linear-gradient(to bottom, ${T.border}, transparent)`,
            marginTop: 4,
            transition: T.transition,
          }} />
        )}
      </div>

      {/* Contenu */}
      <div style={{ flex: 1, paddingBottom: index < STEPS.length - 1 ? 28 : 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 2 }}>
          <span style={{
            fontFamily: T.fontBody,
            fontWeight: 600,
            fontSize: 15,
            color: isPending ? T.textMuted : T.textPrimary,
            transition: T.transition,
          }}>
            {isDone ? step.doneLabel : step.label}
          </span>
          {isActive && (
            <motion.span
              style={{
                fontSize: 11,
                color: T.textGold,
                fontFamily: T.fontBody,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                fontWeight: 500,
              }}
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              en cours
            </motion.span>
          )}
        </div>

        {!isDone && !isError && (
          <div style={{ fontSize: 13, color: T.textSecondary, fontFamily: T.fontBody, marginBottom: 6 }}>
            {step.sublabel}
          </div>
        )}

        <ProgressBar step={step.key} status={status} />

        {isError && error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            style={{
              marginTop: 8,
              padding: '8px 12px',
              background: T.errorBg,
              border: `1px solid ${T.errorBorder}`,
              borderRadius: T.r8,
              color: T.error,
              fontSize: 13,
              fontFamily: T.fontBody,
            }}
          >
            {error}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

export default function GenerationScene({ game, pipeline, onComplete, onBack }) {
  const { stepStatus, stepError, runFullPipeline } = pipeline;
  const hasRun = useRef(false);

  useEffect(() => {
    if (!hasRun.current && game) {
      hasRun.current = true;
      runFullPipeline(game, onComplete);
    }
  }, [game, runFullPipeline, onComplete]);

  const hasError = Object.values(stepStatus).includes('error');
  const whiteName = game?.white?.username ?? '?';
  const blackName = game?.black?.username ?? '?';

  return (
    <div style={{
      minHeight: '100dvh',
      display: 'flex',
      flexDirection: 'column',
      padding: '40px 24px',
      maxWidth: 560,
      margin: '0 auto',
      width: '100%',
    }}>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{ marginBottom: 48 }}
      >
        <div style={{ fontSize: 12, color: T.textMuted, fontFamily: T.fontBody, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>
          Génération en cours
        </div>
        <h2 style={{
          fontFamily: T.fontDisplay,
          fontSize: 26,
          fontWeight: 600,
          color: T.textPrimary,
          letterSpacing: '-0.01em',
          lineHeight: 1.2,
        }}>
          {whiteName} <span style={{ color: T.textMuted, fontWeight: 400, fontStyle: 'italic', fontSize: 20 }}>vs</span> {blackName}
        </h2>
      </motion.div>

      {/* Timeline */}
      <div style={{ flex: 1 }}>
        {STEPS.map((step, i) => (
          <StepItem
            key={step.key}
            step={step}
            status={stepStatus[step.key]}
            error={stepError[step.key]}
            index={i}
          />
        ))}
      </div>

      {/* Bouton retry en cas d'erreur */}
      <AnimatePresence>
        {hasError && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            style={{ marginTop: 32, display: 'flex', gap: 12 }}
          >
            <PremiumButton variant="ghost" onClick={onBack} style={{ flex: 1 }}>
              ← Retour
            </PremiumButton>
            <PremiumButton
              onClick={() => { hasRun.current = false; runFullPipeline(game, onComplete); }}
              style={{ flex: 1 }}
            >
              Réessayer
            </PremiumButton>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
