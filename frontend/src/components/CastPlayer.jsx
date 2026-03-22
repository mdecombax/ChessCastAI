import React from 'react';

export default function CastPlayer({ text, audioUrl, loadingAudio, onGenerateAudio }) {
  return (
    <div style={{ marginTop: 16 }}>
      <h3>Commentaire</h3>
      <div
        style={{
          background: '#f5f5f5',
          borderRadius: 8,
          padding: 16,
          marginBottom: 16,
          minHeight: 80,
          whiteSpace: 'pre-wrap',
          lineHeight: 1.6,
        }}
      >
        {text || 'Rédaction du commentaire...'}
      </div>

      {text && (
        <button
          onClick={onGenerateAudio}
          disabled={loadingAudio}
          style={{
            display: 'block',
            width: '100%',
            padding: '12px 0',
            fontSize: 16,
            fontWeight: 'bold',
            background: loadingAudio ? '#aaa' : '#34a853',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            cursor: loadingAudio ? 'not-allowed' : 'pointer',
            marginBottom: 16,
          }}
        >
          {loadingAudio ? "Génération de l'audio..." : "Générer l'audio"}
        </button>
      )}

      {audioUrl && <audio controls autoPlay src={audioUrl} style={{ width: '100%' }} />}
    </div>
  );
}
