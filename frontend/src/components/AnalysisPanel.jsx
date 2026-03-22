import React from 'react';

const CLASS_CONFIG = {
  blunder:    { label: '??', color: '#c62828', bg: '#ffebee', text: 'Blunder' },
  mistake:    { label: '?',  color: '#e65100', bg: '#fff3e0', text: 'Erreur' },
  inaccuracy: { label: '?!', color: '#f9a825', bg: '#fffde7', text: 'Imprécision' },
  best:       { label: '!!', color: '#2e7d32', bg: '#e8f5e9', text: 'Meilleur coup' },
};

function countBy(annotations, color, classification) {
  return annotations.filter(a => a.color === color && a.classification === classification).length;
}

function PlayerSummary({ label, annotations, color }) {
  const blunders    = countBy(annotations, color, 'blunder');
  const mistakes    = countBy(annotations, color, 'mistake');
  const inaccuracies = countBy(annotations, color, 'inaccuracy');

  return (
    <div style={{ flex: 1 }}>
      <div style={{ fontWeight: 600, marginBottom: 6, fontSize: 14 }}>{label}</div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {blunders > 0 && (
          <Chip count={blunders} cfg={CLASS_CONFIG.blunder} />
        )}
        {mistakes > 0 && (
          <Chip count={mistakes} cfg={CLASS_CONFIG.mistake} />
        )}
        {inaccuracies > 0 && (
          <Chip count={inaccuracies} cfg={CLASS_CONFIG.inaccuracy} />
        )}
        {blunders === 0 && mistakes === 0 && inaccuracies === 0 && (
          <span style={{ fontSize: 13, color: '#666' }}>Aucune erreur</span>
        )}
      </div>
    </div>
  );
}

function Chip({ count, cfg }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      background: cfg.bg, color: cfg.color,
      border: `1px solid ${cfg.color}`,
      borderRadius: 12, padding: '2px 10px', fontSize: 13, fontWeight: 600,
    }}>
      <span>{cfg.label}</span>
      <span>{count} {cfg.text}{count > 1 ? 's' : ''}</span>
    </span>
  );
}

function MoveBadge({ classification }) {
  const cfg = CLASS_CONFIG[classification];
  if (!cfg) return null;
  return (
    <span style={{
      display: 'inline-block',
      background: cfg.bg, color: cfg.color,
      border: `1px solid ${cfg.color}`,
      borderRadius: 4, padding: '1px 7px',
      fontSize: 12, fontWeight: 700, marginLeft: 6,
      fontFamily: 'monospace',
    }}>
      {cfg.label}
    </span>
  );
}

export default function AnalysisPanel({ annotations, game }) {
  if (!annotations || annotations.length === 0) return null;

  const keyMoves = annotations.filter(a => a.classification !== 'normal');
  const whiteName = game?.white?.username ?? 'Blanc';
  const blackName = game?.black?.username ?? 'Noir';

  return (
    <div style={{
      background: '#fafafa',
      border: '1px solid #e0e0e0',
      borderRadius: 10,
      padding: '16px 20px',
      marginBottom: 20,
    }}>
      <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 14 }}>
        Analyse Stockfish
      </div>

      {/* Résumé par joueur */}
      <div style={{ display: 'flex', gap: 16, marginBottom: keyMoves.length > 0 ? 16 : 0 }}>
        <PlayerSummary label={`♙ ${whiteName}`} annotations={annotations} color="blanc" />
        <PlayerSummary label={`♟ ${blackName}`} annotations={annotations} color="noir" />
      </div>

      {/* Moments clés */}
      {keyMoves.length > 0 && (
        <>
          <div style={{ height: 1, background: '#e0e0e0', marginBottom: 12 }} />
          <div style={{ fontSize: 13, color: '#555', marginBottom: 8, fontWeight: 600 }}>
            Moments clés
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {keyMoves.map((m, i) => {
              const cfg = CLASS_CONFIG[m.classification];
              return (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '6px 10px',
                  background: cfg?.bg ?? '#f5f5f5',
                  borderLeft: `3px solid ${cfg?.color ?? '#ccc'}`,
                  borderRadius: '0 6px 6px 0',
                  fontSize: 13,
                }}>
                  <span style={{ color: '#888', minWidth: 54 }}>
                    {m.color === 'blanc' ? `${m.moveNumber}.` : `${m.moveNumber}…`}
                  </span>
                  <span style={{ fontWeight: 600, fontFamily: 'monospace', minWidth: 60 }}>
                    {m.san}
                    <MoveBadge classification={m.classification} />
                  </span>
                  <span style={{ color: '#555', flex: 1 }}>
                    {cfg?.text}
                    {m.evalDrop !== undefined && m.classification !== 'best' && (
                      <span style={{ color: '#888', marginLeft: 6 }}>
                        ({m.evalDrop > 9000 ? 'mat' : `−${m.evalDrop} cp`})
                      </span>
                    )}
                  </span>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
