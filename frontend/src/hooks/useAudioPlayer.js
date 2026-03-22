import { useRef, useState, useEffect, useCallback } from 'react';

export default function useAudioPlayer(src) {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !src) return;

    audio.src = src;

    function onTimeUpdate() {
      setCurrentTime(audio.currentTime);
      setProgress(audio.duration > 0 ? audio.currentTime / audio.duration : 0);
    }
    function onLoadedMetadata() {
      setDuration(audio.duration);
    }
    function onEnded() {
      setIsPlaying(false);
      setCurrentTime(0);
      setProgress(0);
    }
    function onPlay() { setIsPlaying(true); }
    function onPause() { setIsPlaying(false); }

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
    };
  }, [src]);

  const play = useCallback(() => { audioRef.current?.play(); }, []);
  const pause = useCallback(() => { audioRef.current?.pause(); }, []);
  const toggle = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) audio.play();
    else audio.pause();
  }, []);
  const seek = useCallback((pct) => {
    const audio = audioRef.current;
    if (!audio || !audio.duration) return;
    audio.currentTime = pct * audio.duration;
  }, []);

  return { audioRef, isPlaying, currentTime, duration, progress, play, pause, toggle, seek };
}
