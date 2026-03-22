import React from 'react';
import { motion } from 'framer-motion';
import { T } from '../../theme.js';
import AudioPlayer from '../ui/AudioPlayer.jsx';
import AnalysisDrawer from '../AnalysisDrawer.jsx';
import CommentaryDrawer from '../CommentaryDrawer.jsx';
import PremiumButton from '../ui/PremiumButton.jsx';

export default function PlayerScene({ audioUrl, castText, annotations, game, onRestart }) {
  const whiteName = game?.white?.username ?? '?';
  const blackName = game?.black?.username ?? '?';

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
      padding: '40px 24px 48px',
      maxWidth: 560,
      margin: '0 auto',
      width: '100%',
    }}>

      <motion.div
        variants={containerVariants}
        initial="initial"
        animate="animate"
        style={{ display: 'flex', flexDirection: 'column', gap: 32, flex: 1 }}
      >
        {/* En-tête */}
        <motion.div variants={itemVariants}>
          <div style={{ fontSize: 11, color: T.textMuted, fontFamily: T.fontBody, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 6 }}>
            Cast prêt
          </div>
          <h1 style={{
            fontFamily: T.fontDisplay,
            fontSize: 'clamp(22px, 5vw, 30px)',
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

        {/* Player audio */}
        <motion.div
          variants={itemVariants}
          style={{
            background: T.surface,
            border: `1px solid ${T.border}`,
            borderRadius: T.r20,
            padding: '32px 28px',
            boxShadow: T.shadowCard,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Halo doré subtil en arrière-plan */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 300,
            height: 120,
            background: 'radial-gradient(ellipse, rgba(212,175,55,0.06) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />
          <AudioPlayer src={audioUrl} />
        </motion.div>

        {/* Drawers */}
        <motion.div variants={itemVariants} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <AnalysisDrawer annotations={annotations} game={game} />
          <CommentaryDrawer text={castText} />
        </motion.div>

        {/* Nouvelle partie */}
        <motion.div
          variants={itemVariants}
          style={{ marginTop: 'auto', display: 'flex', justifyContent: 'center', paddingTop: 16 }}
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
