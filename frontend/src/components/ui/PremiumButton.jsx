import React from 'react';
import { motion } from 'framer-motion';
import { T } from '../../theme.js';

export default function PremiumButton({
  children,
  onClick,
  disabled = false,
  variant = 'gold', // gold | ghost | danger
  size = 'md', // sm | md | lg
  style,
  fullWidth = false,
}) {
  const sizes = {
    sm: { padding: '8px 16px', fontSize: 13, borderRadius: T.r8 },
    md: { padding: '12px 28px', fontSize: 15, borderRadius: T.r12 },
    lg: { padding: '16px 40px', fontSize: 16, borderRadius: T.r12 },
  };

  const variants = {
    gold: {
      background: disabled
        ? 'rgba(212,175,55,0.06)'
        : 'linear-gradient(135deg, #d4af37 0%, #b8941e 100%)',
      color: disabled ? T.textMuted : '#080b11',
      border: `1px solid ${disabled ? T.border : 'rgba(212,175,55,0.5)'}`,
      boxShadow: disabled ? 'none' : T.shadowGold,
    },
    ghost: {
      background: 'transparent',
      color: disabled ? T.textMuted : T.textSecondary,
      border: `1px solid ${disabled ? T.border : T.borderHover}`,
      boxShadow: 'none',
    },
    danger: {
      background: 'transparent',
      color: disabled ? T.textMuted : T.error,
      border: `1px solid ${disabled ? T.border : T.errorBorder}`,
      boxShadow: 'none',
    },
  };

  const baseStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    fontFamily: T.fontBody,
    fontWeight: 600,
    letterSpacing: '0.02em',
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: T.transition,
    outline: 'none',
    whiteSpace: 'nowrap',
    width: fullWidth ? '100%' : undefined,
    ...sizes[size],
    ...variants[variant],
    ...style,
  };

  return (
    <motion.button
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      style={baseStyle}
      whileHover={disabled ? {} : { scale: 1.02, boxShadow: T.shadowGoldStrong }}
      whileTap={disabled ? {} : { scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
    >
      {children}
    </motion.button>
  );
}
