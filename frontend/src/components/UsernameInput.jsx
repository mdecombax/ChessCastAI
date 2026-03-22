import React, { useState } from 'react';

export default function UsernameInput({ onSubmit, loading }) {
  const [value, setValue] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) return;
    onSubmit(trimmed);
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
      <input
        type="text"
        placeholder="Pseudo Chess.com"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        disabled={loading}
        style={{ flex: 1, padding: '8px 12px', fontSize: 16 }}
      />
      <button type="submit" disabled={loading || !value.trim()}>
        {loading ? 'Chargement...' : 'Chercher les parties'}
      </button>
    </form>
  );
}
