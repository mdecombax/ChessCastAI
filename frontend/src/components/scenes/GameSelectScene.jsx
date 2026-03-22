import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { T } from '../../theme.js';
import GameCard from '../ui/GameCard.jsx';
import PremiumButton from '../ui/PremiumButton.jsx';

function SkeletonCard() {
  return (
    <motion.div
      animate={{ opacity: [0.4, 0.7, 0.4] }}
      transition={{ duration: 1.5, repeat: Infinity }}
      style={{
        height: 72,
        background: T.surface,
        border: `1px solid ${T.border}`,
        borderRadius: T.r12,
      }}
    />
  );
}

export default function GameSelectScene({ username, games, selectedGame, onSelect, onLaunch, onBack }) {
  const loading = games.length === 0;

  return (
    <div style={{
      minHeight: '100dvh',
      display: 'flex',
      flexDirection: 'column',
      padding: '32px 24px',
      maxWidth: 600,
      margin: '0 auto',
      width: '100%',
    }}>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          marginBottom: 40,
        }}
      >
        <button
          onClick={onBack}
          style={{
            background: 'transparent',
            border: `1px solid ${T.border}`,
            borderRadius: T.r8,
            color: T.textSecondary,
            cursor: 'pointer',
            padding: '8px 10px',
            display: 'flex',
            alignItems: 'center',
            transition: T.transition,
            flexShrink: 0,
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
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>

        <div>
          <div style={{ fontFamily: T.fontBody, fontSize: 12, color: T.textMuted, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 2 }}>
            Parties de
          </div>
          <div style={{ fontFamily: T.fontDisplay, fontSize: 22, color: T.textPrimary, fontWeight: 600 }}>
            {username}
          </div>
        </div>
      </motion.div>

      {/* Liste */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8, overflow: 'auto', marginBottom: 24 }}>
        {loading ? (
          <>
            {[0, 1, 2, 4, 5].map(i => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.05 }}
              >
                <SkeletonCard />
              </motion.div>
            ))}
          </>
        ) : (
          <>
            <motion.div
              style={{ fontSize: 12, color: T.textMuted, fontFamily: T.fontBody, marginBottom: 8, letterSpacing: '0.08em', textTransform: 'uppercase' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              {games.length} dernières parties
            </motion.div>
            {games.map((game, i) => (
              <motion.div
                key={game.url ?? i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04, duration: 0.3 }}
              >
                <GameCard
                  game={game}
                  selected={selectedGame?.url === game.url}
                  onClick={() => onSelect(game)}
                />
              </motion.div>
            ))}
          </>
        )}
      </div>

      {/* Bouton lancement */}
      <AnimatePresence>
        {selectedGame && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          >
            <div style={{
              background: T.surface,
              border: `1px solid ${T.border}`,
              borderRadius: T.r16,
              padding: '16px 20px',
              display: 'flex',
              alignItems: 'center',
              gap: 16,
            }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, color: T.textMuted, fontFamily: T.fontBody, marginBottom: 2, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                  Partie sélectionnée
                </div>
                <div style={{ fontSize: 14, color: T.textPrimary, fontFamily: T.fontBody, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {selectedGame.white?.username} vs {selectedGame.black?.username}
                </div>
              </div>
              <PremiumButton onClick={onLaunch} size="md">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
                Lancer le cast
              </PremiumButton>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
