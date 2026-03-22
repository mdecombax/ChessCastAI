import React from 'react';

export default function CastButton({ onClick, loading, disabled, style }) {
  const isDisabled = disabled || loading;
  return (
    <button
      onClick={onClick}
      disabled={isDisabled}
      style={{
        display: 'block',
        padding: '12px 0',
        fontSize: 16,
        fontWeight: 'bold',
        background: isDisabled ? '#aaa' : '#1a73e8',
        color: '#fff',
        border: 'none',
        borderRadius: 8,
        cursor: isDisabled ? 'not-allowed' : 'pointer',
        ...style,
      }}
    >
      {loading ? 'Génération en cours... (~15s)' : 'Générer le cast'}
    </button>
  );
}
