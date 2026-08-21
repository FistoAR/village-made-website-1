'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

const STORAGE_KEY = 'vm_bg_music_enabled';

// Indian classical background music
const MUSIC_SRC = '/audio/india_happy-indian-classical-indian-music-494847.mp3';

// ─── Module-level singleton so audio survives React re-mounts / SPA nav ──────
let _audio: HTMLAudioElement | null = null;
let _subscribers: Set<() => void> = new Set();

function getOrCreateAudio(): HTMLAudioElement {
  if (_audio) return _audio;
  if (typeof window === 'undefined') return null as any;
  const a = new Audio(MUSIC_SRC);
  a.loop = true;
  a.volume = 0.15;
  a.preload = 'none';
  _audio = a;
  return a;
}

function notifySubscribers() {
  _subscribers.forEach((fn) => fn());
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useBgMusic() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const interactedOnceRef = useRef(false);

  // Read stored preference — default ON
  const getStoredPref = (): boolean => {
    try {
      const val = localStorage.getItem(STORAGE_KEY);
      return val === null ? true : val === 'true';
    } catch {
      return true;
    }
  };

  // Sync state from audio element
  const syncState = useCallback(() => {
    const a = _audio;
    setIsPlaying(!!a && !a.paused);
  }, []);

  // Register for cross-instance updates
  useEffect(() => {
    _subscribers.add(syncState);
    // Initial sync
    syncState();
    return () => {
      _subscribers.delete(syncState);
    };
  }, [syncState]);

  // ── Try auto-play (respects user pref) ──
  const tryPlay = useCallback(() => {
    const a = getOrCreateAudio();
    if (!a || !getStoredPref()) return;
    a.play()
      .then(() => {
        setIsPlaying(true);
        setHasInteracted(true);
        interactedOnceRef.current = true;
        notifySubscribers();
      })
      .catch(() => {
        /* autoplay blocked — first-interaction listener handles it */
      });
  }, []);

  // ── First-interaction listener ──
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Try immediate autoplay first
    tryPlay();

    // If that fails, catch the first real user gesture
    const handle = () => {
      if (interactedOnceRef.current) return;
      interactedOnceRef.current = true;
      setHasInteracted(true);
      if (getStoredPref()) tryPlay();
      window.removeEventListener('click', handle, true);
      window.removeEventListener('keydown', handle, true);
    };

    window.addEventListener('click', handle, true);
    window.addEventListener('keydown', handle, true);

    return () => {
      window.removeEventListener('click', handle, true);
      window.removeEventListener('keydown', handle, true);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Toggle on / off ──
  const toggle = useCallback(() => {
    const a = getOrCreateAudio();
    if (!a) return;

    if (!a.paused) {
      // Pause & save pref
      a.pause();
      try {
        localStorage.setItem(STORAGE_KEY, 'false');
      } catch {}
      setIsPlaying(false);
      notifySubscribers();
    } else {
      // Resume & save pref
      a.play()
        .then(() => {
          setIsPlaying(true);
          try {
            localStorage.setItem(STORAGE_KEY, 'true');
          } catch {}
          notifySubscribers();
        })
        .catch(() => {});
    }
  }, []);

  return { isPlaying, toggle, hasInteracted };
}
