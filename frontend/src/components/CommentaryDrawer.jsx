import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { T } from '../theme.js';
import { useLang } from '../LanguageContext.jsx';

export default function CommentaryDrawer({ text }) {
  const [open, setOpen] = useState(false);
  const { t } = useLang();

  if (!text) return null;

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
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          {t.read_commentary}
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
              padding: '24px',
              background: T.surface,
            }}>
              <p style={{
                fontFamily: T.fontDisplay,
                fontSize: 15,
                color: T.textSecondary,
                lineHeight: 1.8,
                whiteSpace: 'pre-wrap',
                fontStyle: 'italic',
                margin: 0,
              }}>
                {text}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
