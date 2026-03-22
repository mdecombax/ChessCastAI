import { useMemo } from 'react';

const COLORS = {
  blunder:   { arrow: 'rgb(220, 50, 50)',   square: 'rgba(220, 50, 50, 0.35)' },
  mistake:   { arrow: 'rgb(230, 150, 30)',  square: 'rgba(230, 150, 30, 0.35)' },
  inaccuracy:{ arrow: 'rgb(220, 200, 50)',  square: 'rgba(220, 200, 50, 0.25)' },
  best:      { arrow: 'rgb(80, 180, 80)',   square: 'rgba(80, 180, 80, 0.3)' },
  normal:    { arrow: 'rgb(100, 150, 200)', square: null },
};
const BEST_MOVE_COLOR = 'rgb(80, 210, 80)';
const TRANSITION_COLOR = 'rgba(100, 150, 200, 0.6)';

/**
 * Dérive les flèches et surbrillances à afficher sur l'échiquier
 * en fonction du coup actuel et du type de segment.
 *
 * @param {Object[]} annotations - tableau d'annotations Stockfish (une par demi-coup)
 * @param {number} currentFenIndex - index du FEN affiché (0 = position initiale)
 * @param {{ type: string }} activeSegment - segment audio actif
 * @returns {{ arrows: Array, squareStyles: Object }}
 */
export default function useBoardAnnotations({ annotations, currentFenIndex, activeSegment }) {
  return useMemo(() => {
    if (!annotations || currentFenIndex <= 0 || !activeSegment) {
      return { arrows: [], squareStyles: {} };
    }

    const ann = annotations[currentFenIndex - 1];
    if (!ann || !ann.from || !ann.to) {
      return { arrows: [], squareStyles: {} };
    }

    const { from, to, bestMove, classification } = ann;
    const isKey = activeSegment.type === 'key';
    const colors = COLORS[classification] ?? COLORS.normal;

    if (isKey) {
      const arrows = [[from, to, colors.arrow]];

      // Flèche verte du meilleur coup pour blunders/mistakes (si différent du coup joué)
      if ((classification === 'blunder' || classification === 'mistake') && bestMove && bestMove.length >= 4) {
        const bestFrom = bestMove.slice(0, 2);
        const bestTo = bestMove.slice(2, 4);
        if (bestFrom !== from || bestTo !== to) {
          arrows.push([bestFrom, bestTo, BEST_MOVE_COLOR]);
        }
      }

      const squareStyles = {};
      if (colors.square) {
        squareStyles[from] = { backgroundColor: colors.square };
        squareStyles[to] = { backgroundColor: colors.square };
      }

      return { arrows, squareStyles };
    }

    // Transition : flèche discrète du coup joué
    return {
      arrows: [[from, to, TRANSITION_COLOR]],
      squareStyles: {},
    };
  }, [annotations, currentFenIndex, activeSegment]);
}
