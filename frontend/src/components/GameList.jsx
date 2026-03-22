import React from 'react';

export default function GameList({ games, selected, onSelect }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <h3>Parties récentes ({games.length})</h3>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {games.map((game, i) => {
          const isSelected = selected?.url === game.url;
          const date = game.endTime
            ? new Date(game.endTime * 1000).toLocaleDateString()
            : 'Unknown date';

          return (
            <li
              key={game.url || i}
              onClick={() => onSelect(game)}
              style={{
                padding: '10px 12px',
                marginBottom: 6,
                border: `2px solid ${isSelected ? '#1a73e8' : '#ddd'}`,
                borderRadius: 6,
                cursor: 'pointer',
                background: isSelected ? '#e8f0fe' : '#fff',
              }}
            >
              <strong>{game.white}</strong> vs <strong>{game.black}</strong>
              {'  '}
              <span style={{ color: '#555', fontSize: 13 }}>
                {game.timeClass} &middot; {date} &middot; {game.result}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
