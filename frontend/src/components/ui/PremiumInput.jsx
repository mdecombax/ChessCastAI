import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { T } from '../../theme.js';

export default function PremiumInput({
  value,
  onChange,
  onSubmit,
  placeholder = '',
  disabled = false,
  autoFocus = false,
  loading = false,
}) {
  const [focused, setFocused] = useState(false);
  const inputRef = useRef(null);

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !disabled && !loading && value.trim()) {
      onSubmit?.(value.trim());
    }
  }

  function handleSubmit() {
    if (!disabled && !loading && value.trim()) {
      onSubmit?.(value.trim());
    }
  }

  return (
    <div style={{ position: 'relative' }}>
      {/* Glow ambient */}
      <motion.div
        animate={{ opacity: focused ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        style={{
          position: 'absolute',
          inset: -1,
          borderRadius: T.r16,
          background: 'transparent',
          boxShadow: `0 0 0 1px ${T.borderActive}, 0 0 32px rgba(212,175,55,0.1)`,
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      <div
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          background: T.surface,
          border: `1px solid ${focused ? T.borderActive : T.border}`,
          borderRadius: T.r16,
          padding: '0 8px 0 24px',
          transition: T.transition,
          zIndex: 1,
        }}
      >
        {/* Icône chess pion */}
        <span style={{ fontSize: 18, opacity: 0.4, marginRight: 4, flexShrink: 0 }}>♟</span>

        <input
          ref={inputRef}
          value={value}
          onChange={e => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          disabled={disabled || loading}
          autoFocus={autoFocus}
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: T.textPrimary,
            fontSize: 18,
            fontFamily: T.fontBody,
            fontWeight: 400,
            padding: '18px 8px',
            '::placeholder': { color: T.textMuted },
          }}
        />

        {/* Bouton submit */}
        <motion.button
          onClick={handleSubmit}
          disabled={disabled || loading || !value.trim()}
          style={{
            flexShrink: 0,
            width: 44,
            height: 44,
            borderRadius: T.r12,
            border: 'none',
            background: disabled || loading || !value.trim()
              ? 'rgba(212,175,55,0.06)'
              : 'linear-gradient(135deg, #d4af37 0%, #b8941e 100%)',
            color: disabled || loading || !value.trim() ? T.textMuted : '#080b11',
            cursor: disabled || loading || !value.trim() ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: T.transition,
            fontSize: 18,
            margin: '4px 0',
          }}
          whileHover={!disabled && !loading && value.trim() ? { scale: 1.05 } : {}}
          whileTap={!disabled && !loading && value.trim() ? { scale: 0.95 } : {}}
        >
          {loading ? (
            <LoadingDots />
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          )}
        </motion.button>
      </div>
    </div>
  );
}

function LoadingDots() {
  return (
    <span style={{ display: 'flex', gap: 3 }}>
      {[0, 1, 2].map(i => (
        <motion.span
          key={i}
          style={{ width: 4, height: 4, borderRadius: '50%', background: 'currentColor', display: 'block' }}
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1, repeat: Infinity, delay: i * 0.15 }}
        />
      ))}
    </span>
  );
}
