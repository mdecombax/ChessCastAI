import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { T } from '../../theme.js';
import PremiumInput from '../ui/PremiumInput.jsx';
import { useLang } from '../../LanguageContext.jsx';

// Échiquier décoratif en arrière-plan
function ChessboardBg() {
  const squares = [];
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const dark = (r + c) % 2 === 1;
      if (!dark) continue;
      squares.push(
        <div
          key={`${r}-${c}`}
          style={{
            position: 'absolute',
            left: `${c * 12.5}%`,
            top: `${r * 12.5}%`,
            width: '12.5%',
            height: '12.5%',
            background: 'rgba(212,175,55,0.03)',
          }}
        />
      );
    }
  }
  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      pointerEvents: 'none',
      zIndex: 0,
      overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%) rotate(15deg)',
        width: '140vmax',
        height: '140vmax',
        opacity: 0.6,
      }}>
        {squares}
      </div>
      {/* Radial gradient overlay pour concentrer l'attention au centre */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'radial-gradient(ellipse 70% 60% at 50% 50%, transparent 0%, #080b11 100%)',
      }} />
    </div>
  );
}

// Couronne d'échecs SVG flottante
function ChessKing() {
  return (
    <motion.div
      animate={{ y: [0, -12, 0] }}
      transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
      style={{ marginBottom: 32, display: 'inline-block' }}
    >
      <svg width="56" height="56" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="kg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#d4af37" />
            <stop offset="100%" stopColor="#8b6914" />
          </linearGradient>
        </defs>
        {/* Corps du roi */}
        <rect x="20" y="38" width="24" height="14" rx="3" fill="url(#kg)" opacity="0.9" />
        <rect x="16" y="34" width="32" height="8" rx="2" fill="url(#kg)" opacity="0.8" />
        {/* Couronne */}
        <path d="M18 34 L18 20 L26 28 L32 14 L38 28 L46 20 L46 34 Z" fill="url(#kg)" opacity="0.9" />
        {/* Croix au sommet */}
        <rect x="29" y="8" width="6" height="10" rx="2" fill="url(#kg)" />
        <rect x="26" y="11" width="12" height="4" rx="2" fill="url(#kg)" />
        {/* Brillance */}
        <rect x="22" y="40" width="6" height="10" rx="1" fill="rgba(255,255,255,0.12)" />
      </svg>
    </motion.div>
  );
}

export default function WelcomeScene({ onSubmit, loading, error }) {
  const [value, setValue] = useState('');
  const { t } = useLang();

  const containerVariants = {
    initial: {},
    animate: { transition: { staggerChildren: 0.08 } },
  };

  const itemVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] } },
  };

  return (
    <div style={{
      minHeight: '100dvh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 24px',
      position: 'relative',
    }}>
      <ChessboardBg />

      {/* Halo central */}
      <div style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 600,
        height: 600,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(212,175,55,0.04) 0%, transparent 70%)',
        pointerEvents: 'none',
        zIndex: 0,
      }} />

      <motion.div
        variants={containerVariants}
        initial="initial"
        animate="animate"
        style={{
          position: 'relative',
          zIndex: 1,
          width: '100%',
          maxWidth: 480,
          textAlign: 'center',
        }}
      >
        <motion.div variants={itemVariants}>
          <ChessKing />
        </motion.div>

        <motion.h1
          variants={itemVariants}
          style={{
            fontFamily: T.fontDisplay,
            fontSize: 'clamp(36px, 8vw, 52px)',
            fontWeight: 700,
            color: T.textPrimary,
            letterSpacing: '-0.02em',
            lineHeight: 1.1,
            marginBottom: 12,
          }}
        >
          AutoCast{' '}
          <span style={{
            background: `linear-gradient(135deg, ${T.gold} 0%, #8b6914 100%)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            Chess
          </span>
        </motion.h1>

        <motion.p
          variants={itemVariants}
          style={{
            fontFamily: T.fontBody,
            fontSize: 16,
            color: T.textSecondary,
            marginBottom: 48,
            lineHeight: 1.6,
            fontWeight: 300,
            letterSpacing: '0.01em',
          }}
        >
          {t.welcome_subtitle}
          <br />
          <span style={{ color: T.textMuted, fontSize: 14 }}>
            {t.welcome_tech}
          </span>
        </motion.p>

        <motion.div variants={itemVariants}>
          <PremiumInput
            value={value}
            onChange={setValue}
            onSubmit={onSubmit}
            placeholder={t.welcome_placeholder}
            loading={loading}
            autoFocus
          />
        </motion.div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              marginTop: 16,
              padding: '12px 16px',
              background: T.errorBg,
              border: `1px solid ${T.errorBorder}`,
              borderRadius: T.r12,
              color: T.error,
              fontSize: 14,
              fontFamily: T.fontBody,
              textAlign: 'left',
            }}
          >
            {error}
          </motion.div>
        )}

        {/* Ligne décorative dorée */}
        <motion.div
          variants={itemVariants}
          style={{
            marginTop: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12,
          }}
        >
          <div style={{ flex: 1, height: 1, background: T.border }} />
          <span style={{ color: T.textMuted, fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', fontFamily: T.fontBody }}>
            {t.welcome_divider}
          </span>
          <div style={{ flex: 1, height: 1, background: T.border }} />
        </motion.div>
      </motion.div>
    </div>
  );
}
