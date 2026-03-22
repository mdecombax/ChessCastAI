import React, { useEffect, useState } from 'react';
import AnalysisPanel from './AnalysisPanel.jsx';

function Spinner() {
  const frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
  const [frame, setFrame] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setFrame(f => (f + 1) % frames.length), 100);
    return () => clearInterval(id);
  }, []);
  return <span style={{ fontFamily: 'monospace', fontSize: 16, color: '#1a73e8' }}>{frames[frame]}</span>;
}

function NextButton({ label, onClick, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        width: '100%',
        padding: '12px 0',
        fontSize: 15,
        fontWeight: 600,
        background: disabled ? '#e0e0e0' : '#1a73e8',
        color: disabled ? '#aaa' : '#fff',
        border: 'none',
        borderRadius: 8,
        cursor: disabled ? 'not-allowed' : 'pointer',
        marginTop: 12,
      }}
    >
      {label}
    </button>
  );
}

function StepRow({ icon, activeText, doneText, status }) {
  const isDone = status === 'done';
  const isError = status === 'error';
  const isActive = status === 'active';

  const borderColor = isError ? '#c62828' : isDone ? '#2e7d32' : '#1a73e8';
  const bg = isError ? '#ffebee' : isDone ? '#e8f5e9' : '#e8f0fe';

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      padding: '10px 16px',
      background: bg,
      border: `1px solid ${borderColor}`,
      borderRadius: 8,
    }}>
      <span style={{ fontSize: 18, marginRight: 10 }}>{icon}</span>
      <span style={{ flex: 1, fontWeight: 600, fontSize: 14 }}>
        {isDone ? doneText : activeText}
      </span>
      <span>
        {isActive && <Spinner />}
        {isDone && <span style={{ color: '#2e7d32', fontWeight: 700, fontSize: 16 }}>✓</span>}
        {isError && <span style={{ color: '#c62828', fontWeight: 700, fontSize: 16 }}>✗</span>}
      </span>
    </div>
  );
}

export default function Pipeline({
  stepStatus, stepError,
  annotations, game, castText, audioUrl,
  onAnalyze, onCast, onAudio,
}) {
  const { analyze, cast, audio } = stepStatus;

  return (
    <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>

      {/* ── Étape 1 : Analyse Stockfish ── */}
      {analyze === 'idle' && (
        <NextButton label="⚙️ Lancer l'analyse Stockfish" onClick={onAnalyze} />
      )}

      {analyze !== 'idle' && (
        <div>
          <StepRow
            icon="⚙️"
            activeText="Analyse Stockfish en cours..."
            doneText="Analyse Stockfish terminée"
            status={analyze}
          />
          {stepError.analyze && (
            <div style={{ color: '#c62828', fontSize: 13, padding: '8px 16px', background: '#ffebee', border: '1px solid #c62828', borderTop: 'none', borderRadius: '0 0 8px 8px' }}>
              {stepError.analyze}
            </div>
          )}
          {analyze === 'done' && annotations && (
            <AnalysisPanel annotations={annotations} game={game} />
          )}
        </div>
      )}

      {/* ── Bouton étape 2 ── */}
      {analyze === 'done' && cast === 'idle' && (
        <NextButton label="✍️ Générer le commentaire" onClick={onCast} />
      )}

      {/* ── Étape 2 : Commentaire ── */}
      {cast !== 'idle' && (
        <div>
          <StepRow
            icon="✍️"
            activeText="Rédaction du commentaire..."
            doneText="Commentaire rédigé"
            status={cast}
          />
          {stepError.cast && (
            <div style={{ color: '#c62828', fontSize: 13, padding: '8px 16px', background: '#ffebee', border: '1px solid #c62828', borderTop: 'none', borderRadius: '0 0 8px 8px' }}>
              {stepError.cast}
            </div>
          )}
          {cast === 'done' && castText && (
            <div style={{
              background: '#f5f5f5',
              border: '1px solid #e0e0e0',
              borderTop: 'none',
              borderRadius: '0 0 8px 8px',
              padding: '14px 16px',
              whiteSpace: 'pre-wrap',
              lineHeight: 1.7,
              fontSize: 14,
              color: '#333',
            }}>
              {castText}
            </div>
          )}
        </div>
      )}

      {/* ── Bouton étape 3 ── */}
      {cast === 'done' && audio === 'idle' && (
        <NextButton label="🎙️ Générer l'audio" onClick={onAudio} />
      )}

      {/* ── Étape 3 : Audio ── */}
      {audio !== 'idle' && (
        <div>
          <StepRow
            icon="🎙️"
            activeText="Génération audio..."
            doneText="Audio prêt — bonne écoute !"
            status={audio}
          />
          {stepError.audio && (
            <div style={{ color: '#c62828', fontSize: 13, padding: '8px 16px', background: '#ffebee', border: '1px solid #c62828', borderTop: 'none', borderRadius: '0 0 8px 8px' }}>
              {stepError.audio}
            </div>
          )}
          {audio === 'done' && audioUrl && (
            <audio
              controls
              autoPlay
              src={audioUrl}
              style={{ width: '100%', marginTop: 8, display: 'block', borderRadius: 8 }}
            />
          )}
        </div>
      )}

    </div>
  );
}
