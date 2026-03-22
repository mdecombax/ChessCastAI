import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { T } from '../../theme.js';

export default function GlassCard({
  children,
  style,
  onClick,
  hoverable = false,
  active = false,
  padding = '24px',
}) {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [hovered, setHovered] = useState(false);

  function handleMouseMove(e) {
    if (!hoverable) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) / rect.width;
    const dy = (e.clientY - cy) / rect.height;
    setTilt({ x: dy * -4, y: dx * 4 });
  }

  function handleMouseLeave() {
    setTilt({ x: 0, y: 0 });
    setHovered(false);
  }

  const baseStyle = {
    background: active
      ? T.surfaceHigh
      : hovered && hoverable
      ? T.surfaceHigh
      : T.surface,
    border: `1px solid ${active ? T.borderActive : hovered && hoverable ? T.borderHover : T.border}`,
    borderRadius: T.r16,
    padding,
    backdropFilter: T.glassBlur,
    WebkitBackdropFilter: T.glassBlur,
    boxShadow: active
      ? T.shadowGold
      : hovered && hoverable
      ? T.shadowCardHover
      : T.shadowCard,
    transition: T.transition,
    cursor: onClick ? 'pointer' : 'default',
    transform: hoverable
      ? `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) translateY(${hovered ? -3 : 0}px)`
      : undefined,
    ...style,
  };

  return (
    <div
      style={baseStyle}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </div>
  );
}
