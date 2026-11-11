'use client';

import { useCallback, useRef } from 'react';

type SoundType = 'click' | 'success' | 'error' | 'whoosh' | 'pop';

const soundMap: Record<SoundType, string> = {
  click: 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAA=',
  success: 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAA=',
  error: 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAA=',
  whoosh: 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAA=',
  pop: 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAA=',
};

export function useSound() {
  const audioRefs = useRef<Record<SoundType, HTMLAudioElement>>({
    click: null as any,
    success: null as any,
    error: null as any,
    whoosh: null as any,
    pop: null as any,
  });

  const play = useCallback((type: SoundType, volume = 0.3) => {
    if (typeof window === 'undefined') return;

    let audio = audioRefs.current[type];
    if (!audio) {
      audio = new Audio(soundMap[type]);
      audioRefs.current[type] = audio;
    }

    // Clone for overlapping sounds
    const clone = audio.cloneNode() as HTMLAudioElement;
    clone.volume = volume;
    clone.play().catch(() => {
      // Ignore autoplay policy errors
    });
  }, []);

  return { play };
}

// Generate actual short audio beeps using Web Audio API
export function useWebAudio() {
  const ctxRef = useRef<AudioContext | null>(null);

  const getCtx = useCallback(() => {
    if (!ctxRef.current) {
      ctxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return ctxRef.current;
  }, []);

  const playTone = useCallback((
    frequency: number,
    duration: number,
    type: OscillatorType = 'sine',
    volume = 0.1
  ) => {
    const ctx = getCtx();
    if (ctx.state === 'suspended') ctx.resume();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.value = frequency;
    gain.gain.value = volume;

    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;
    gain.gain.setValueAtTime(volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.start(now);
    osc.stop(now + duration);
  }, [getCtx]);

  const playClick = useCallback(() => playTone(800, 0.05, 'square', 0.08), [playTone]);
  const playSuccess = useCallback(() => {
    playTone(523, 0.1, 'sine', 0.1); // C5
    setTimeout(() => playTone(659, 0.1, 'sine', 0.1), 80); // E5
    setTimeout(() => playTone(784, 0.15, 'sine', 0.1), 160); // G5
  }, [playTone]);
  const playError = useCallback(() => {
    playTone(300, 0.15, 'sawtooth', 0.12);
    setTimeout(() => playTone(250, 0.2, 'sawtooth', 0.1), 100);
  }, [playTone]);
  const playWhoosh = useCallback(() => {
    playTone(400, 0.2, 'sine', 0.05);
    setTimeout(() => playTone(200, 0.15, 'sine', 0.05), 50);
  }, [playTone]);
  const playPop = useCallback(() => playTone(1000, 0.06, 'sine', 0.1), [playTone]);

  return { playClick, playSuccess, playError, playWhoosh, playPop };
}