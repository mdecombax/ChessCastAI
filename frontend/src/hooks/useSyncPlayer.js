import { useMemo } from 'react';
import useAudioPlayer from './useAudioPlayer.js';

/**
 * useSyncPlayer — étend useAudioPlayer avec la synchronisation échiquier.
 *
 * @param {string} audioUrl
 * @param {string[]} fens - tableau de FEN strings (index 0 = position initiale, index i = après le i-ème demi-coup)
 * @param {Array<{startMove, text, startTime, endTime}>} segmentTimings
 */
export default function useSyncPlayer({ audioUrl, fens, segmentTimings }) {
  const audio = useAudioPlayer(audioUrl);

  // Trouver l'index du segment actif par binary search sur currentTime
  const activeSegmentIndex = useMemo(() => {
    if (!segmentTimings || segmentTimings.length === 0) return 0;
    const t = audio.currentTime;
    let lo = 0, hi = segmentTimings.length - 1;
    let result = 0;
    while (lo <= hi) {
      const mid = (lo + hi) >> 1;
      if (segmentTimings[mid].startTime <= t) {
        result = mid;
        lo = mid + 1;
      } else {
        hi = mid - 1;
      }
    }
    return result;
  }, [audio.currentTime, segmentTimings]);

  const activeSegment = segmentTimings?.[activeSegmentIndex] ?? null;

  // Calculer l'index de FEN courant
  // Pour un segment multi-coups, on interpole entre startMove du segment actif
  // et le startMove du segment suivant, proportionnellement au temps écoulé.
  const currentFenIndex = useMemo(() => {
    if (!activeSegment || !fens || fens.length === 0) return 0;

    const segStart = activeSegment.startMove ?? 0;
    const nextSegment = segmentTimings?.[activeSegmentIndex + 1];
    const segEnd = nextSegment ? (nextSegment.startMove ?? segStart) : (fens.length - 1);

    if (segEnd <= segStart) return Math.min(segStart, fens.length - 1);

    const segDuration = (activeSegment.endTime ?? 0) - (activeSegment.startTime ?? 0);
    if (segDuration <= 0) return Math.min(segStart, fens.length - 1);

    const elapsed = audio.currentTime - (activeSegment.startTime ?? 0);
    const progress = Math.max(0, Math.min(1, elapsed / segDuration));
    const interpolated = Math.round(segStart + progress * (segEnd - segStart));
    return Math.min(interpolated, fens.length - 1);
  }, [activeSegment, activeSegmentIndex, segmentTimings, fens, audio.currentTime]);

  const currentFen = fens?.[currentFenIndex] ?? 'start';

  return {
    ...audio,
    currentFen,
    currentFenIndex,
    activeSegment,
    activeSegmentIndex,
  };
}
