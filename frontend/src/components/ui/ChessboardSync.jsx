import React from 'react';
import { Chessboard } from 'react-chessboard';
import { T } from '../../theme.js';
import { useLang } from '../../LanguageContext.jsx';

export default function ChessboardSync({ fen, moveIndex, arrows, squareStyles, size, orientation = 'white' }) {
  const boardSize = size ?? Math.min(400, (typeof window !== 'undefined' ? window.innerWidth : 400) - 48);
  const { t } = useLang();

  const n = Math.ceil(moveIndex / 2);
  const moveNumber = moveIndex > 0
    ? (moveIndex % 2 === 1 ? t.move_white(n) : t.move_black(n))
    : t.initial_position;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
      <div style={{
        borderRadius: T.r12,
        overflow: 'hidden',
        border: `1px solid ${T.borderActive}`,
        boxShadow: T.shadowGold,
        width: boardSize,
        height: boardSize,
      }}>
        {/* react-chessboard v4 : props plats */}
        <Chessboard
          position={fen ?? 'start'}
          boardWidth={boardSize}
          boardOrientation={orientation}
          areArrowsAllowed={false}
          arePiecesDraggable={false}
          animationDuration={150}
          customDarkSquareStyle={{ backgroundColor: '#2d3748' }}
          customLightSquareStyle={{ backgroundColor: '#e8d5a3' }}
          customBoardStyle={{ borderRadius: 0 }}
          customArrows={arrows ?? []}
          customSquareStyles={squareStyles ?? {}}
        />
      </div>

      <div style={{
        fontSize: 12,
        color: T.textSecondary,
        fontFamily: T.fontBody,
        letterSpacing: '0.05em',
      }}>
        {moveNumber}
      </div>
    </div>
  );
}
