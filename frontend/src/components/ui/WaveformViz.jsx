import React, { useEffect, useRef, useState } from 'react';
import { T } from '../../theme.js';

const BAR_COUNT = 36;

function randomHeights() {
  return Array.from({ length: BAR_COUNT }, () => 20 + Math.random() * 60);
}

export default function WaveformViz({ isPlaying, progress = 0 }) {
  const [heights, setHeights] = useState(randomHeights);
  const intervalRef = useRef(null);
  const frameRef = useRef(null);

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setHeights(prev => prev.map((h, i) => {
          const wave = Math.sin(Date.now() / 300 + i * 0.4) * 20;
          const noise = (Math.random() - 0.5) * 15;
          return Math.max(8, Math.min(80, h + wave + noise));
        }));
      }, 120);
    } else {
      clearInterval(intervalRef.current);
      // Retour vers hauteurs moyennes
      setHeights(prev => prev.map(h => {
        const target = 24 + Math.sin(prev.indexOf(h)) * 8;
        return h + (target - h) * 0.2;
      }));
    }
    return () => clearInterval(intervalRef.current);
  }, [isPlaying]);

  return (
    <div style={{
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'center',
      gap: 3,
      height: 80,
      padding: '0 8px',
    }}>
      {heights.map((h, i) => {
        const barProgress = i / BAR_COUNT;
        const isPast = barProgress <= progress;
        return (
          <div
            key={i}
            style={{
              width: 3,
              height: h,
              borderRadius: 2,
              background: isPast
                ? `linear-gradient(to top, ${T.gold}, rgba(212,175,55,0.4))`
                : 'rgba(255,255,255,0.08)',
              transition: 'height 0.12s ease, background 0.3s ease',
              flexShrink: 0,
            }}
          />
        );
      })}
    </div>
  );
}
