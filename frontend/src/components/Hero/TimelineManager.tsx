'use client';

/**
 * TimelineManager.tsx
 *
 * rAF-based timestamp watcher that fires callbacks at precise video times.
 * Replaces the old TimelineController + useVideoTimeline hook.
 *
 * - Fires each event exactly once per video playback (tracks fired set)
 * - Resets fired set when video src changes
 * - Works via requestAnimationFrame for sub-100ms precision
 * - Renders nothing — pure side-effect component
 */

import { useEffect, useRef } from 'react';

export interface TimelineEvent {
  at: number;     // seconds at which to fire
  eventId: string;
}

interface TimelineManagerProps {
  /** The active video element */
  videoElement: HTMLVideoElement | null;
  /** List of timestamped events to watch for */
  events: TimelineEvent[];
  /** Called when an event's timestamp is first crossed */
  onEvent: (eventId: string | null) => void;
  /** Set this to the video src so the fired set resets per video */
  videoSrc: string;
}

export default function TimelineManager({
  videoElement,
  events,
  onEvent,
  videoSrc,
}: TimelineManagerProps) {
  const firedRef = useRef<Set<string>>(new Set());
  const rafRef = useRef<number>(0);
  const onEventRef = useRef(onEvent);
  const eventsRef = useRef(events);
  const lastTimeRef = useRef<number>(0);

  // Keep refs fresh without re-running effect
  onEventRef.current = onEvent;
  eventsRef.current = events;

  // Reset fired set when the video source or video element changes
  useEffect(() => {
    firedRef.current = new Set();
    lastTimeRef.current = 0;
  }, [videoSrc, videoElement]);

  // rAF loop
  useEffect(() => {
    const video = videoElement;
    if (!video) return;

    const tick = () => {
      const currentTime = video.currentTime;

      // Reset highlights if video looped/seeked backward
      if (currentTime < lastTimeRef.current - 1 || currentTime === 0) {
        firedRef.current = new Set();
        onEventRef.current(null);
      }
      lastTimeRef.current = currentTime;

      for (const event of eventsRef.current) {
        const key = `${videoSrc}:${event.eventId}`;
        if (!firedRef.current.has(key) && currentTime >= event.at) {
          firedRef.current.add(key);
          onEventRef.current(event.eventId);
        }
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    const start = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(tick);
    };

    const stop = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };

    const handleSeeked = () => {
      if (video.currentTime < 1) {
        firedRef.current = new Set();
        onEventRef.current(null);
      }
    };

    video.addEventListener('play', start);
    video.addEventListener('pause', stop);
    video.addEventListener('ended', stop);
    video.addEventListener('seeked', handleSeeked);

    if (!video.paused) start();

    return () => {
      stop();
      video.removeEventListener('play', start);
      video.removeEventListener('pause', stop);
      video.removeEventListener('ended', stop);
      video.removeEventListener('seeked', handleSeeked);
    };
  }, [videoElement, videoSrc]);

  return null;
}
