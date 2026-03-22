import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { T } from '../../theme.js';

// durée en secondes pour remplir à ~90%
const DURATIONS = { analyze: 50, cast: 20, audio: 15 };

export default function ProgressBar({ step, status, error }) {
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef(null);
  const startRef = useRef(null);

  useEffect(() => {
    if (status === 'active') {
      setProgress(0);
      startRef.current = Date.now();
      const targetDuration = (DURATIONS[step] ?? 30) * 1000;

      intervalRef.current = setInterval(() => {
        const elapsed = Date.now() - startRef.current;
        // Courbe qui monte vite puis ralentit (log), plafonne à 90%
        const pct = Math.min(0.9, 1 - Math.exp(-elapsed / targetDuration * 2.3));
        setProgress(pct);
      }, 80);
    } else if (status === 'done') {
      clearInterval(intervalRef.current);
      setProgress(1);
    } else if (status === 'error') {
      clearInterval(intervalRef.current);
    } else {
      clearInterval(intervalRef.current);
      setProgress(0);
    }
    return () => clearInterval(intervalRef.current);
  }, [status, step]);

  if (status === 'idle' || status === 'error') return null;

  return (
    <div style={{
      height: 3,
      background: 'rgba(255,255,255,0.04)',
      borderRadius: 2,
      overflow: 'hidden',
      marginTop: 10,
    }}>
      <motion.div
        style={{
          height: '100%',
          background: status === 'done'
            ? `linear-gradient(90deg, ${T.success}, rgba(45,138,78,0.6))`
            : `linear-gradient(90deg, ${T.gold}, rgba(212,175,55,0.4))`,
          borderRadius: 2,
          boxShadow: status === 'done'
            ? '0 0 8px rgba(45,138,78,0.4)'
            : '0 0 8px rgba(212,175,55,0.3)',
        }}
        animate={{ width: `${Math.round(progress * 100)}%` }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
      />
    </div>
  );
}
