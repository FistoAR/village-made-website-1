'use client';

import React, {
  forwardRef,
  useEffect,
  useRef,
  useImperativeHandle,
  useState,
} from 'react';
import gsap from 'gsap';

interface VideoPlayerProps {
  src: string;
  nextSrc?: string | null;
  autoPlay?: boolean;
  loop?: boolean;
  muted?: boolean;
  onEnded?: () => void;
  onTimeUpdate?: (currentTime: number) => void;
  onCanPlay?: () => void;
  className?: string;
  /** Pause on last frame instead of looping (for IDLE state) */
  pauseAtEnd?: boolean;
}

export interface VideoPlayerHandle {
  play: () => Promise<void>;
  pause: () => void;
  seek: (time: number) => void;
  getElement: () => HTMLVideoElement | null;
}

const VideoPlayer = forwardRef<VideoPlayerHandle, VideoPlayerProps>(
  function VideoPlayer(
    {
      src,
      nextSrc,
      autoPlay = true,
      loop = false,
      muted = true,
      onEnded,
      onTimeUpdate,
      onCanPlay,
      className = '',
      pauseAtEnd = false,
    },
    ref
  ) {
    const videoRefA = useRef<HTMLVideoElement>(null);
    const videoRefB = useRef<HTMLVideoElement>(null);

    const [srcA, setSrcA] = useState(src);
    const [srcB, setSrcB] = useState('');
    const [activePlayer, setActivePlayer] = useState<'A' | 'B'>('A');

    const prevSrcRef = useRef<string>('');
    const isFirstLoad = useRef(true);

    const onTimeUpdateRef = useRef(onTimeUpdate);
    const onEndedRef = useRef(onEnded);
    const onCanPlayRef = useRef(onCanPlay);

    // Keep callback references updated
    useEffect(() => {
      onTimeUpdateRef.current = onTimeUpdate;
      onEndedRef.current = onEnded;
      onCanPlayRef.current = onCanPlay;
    }, [onTimeUpdate, onEnded, onCanPlay]);

    // Expose active video handle to parent
    useImperativeHandle(ref, () => ({
      play: () => {
        const activeEl = activePlayer === 'A' ? videoRefA.current : videoRefB.current;
        return activeEl?.play() ?? Promise.resolve();
      },
      pause: () => {
        const activeEl = activePlayer === 'A' ? videoRefA.current : videoRefB.current;
        activeEl?.pause();
      },
      seek: (time: number) => {
        const activeEl = activePlayer === 'A' ? videoRefA.current : videoRefB.current;
        if (activeEl) activeEl.currentTime = time;
      },
      getElement: () => {
        return activePlayer === 'A' ? videoRefA.current : videoRefB.current;
      },
    }));

    // ── Seamless cross-fade logic ───────────────────────────────────────────
    useEffect(() => {
      if (src === prevSrcRef.current) return;
      prevSrcRef.current = src;

      if (isFirstLoad.current) {
        isFirstLoad.current = false;
        setSrcA(src);
        return;
      }

      const fadeDuration = 0.4; // smooth, hardware-accelerated fade time

      if (activePlayer === 'A') {
        // Set new src programmatically to ensure it updates immediately in DOM
        const videoB = videoRefB.current;
        if (videoB) {
          videoB.src = src;
          setSrcB(src); // sync React state
          videoB.muted = muted;
          videoB.loop = loop;
          videoB.load();

          const onPlayingB = () => {
            videoB.removeEventListener('playing', onPlayingB);
            
            // Fade A out, fade B in
            gsap.killTweensOf([videoRefA.current, videoRefB.current]);
            gsap.to(videoRefA.current, { opacity: 0, duration: fadeDuration, ease: 'power2.inOut' });
            gsap.to(videoRefB.current, {
              opacity: 1,
              duration: fadeDuration,
              ease: 'power2.inOut',
              onComplete: () => {
                if (videoRefA.current) {
                  videoRefA.current.pause();
                }
                setActivePlayer('B');
                onCanPlayRef.current?.();
              },
            });
          };
          videoB.addEventListener('playing', onPlayingB);
          videoB.play().catch((err) => {
            console.warn("videoB failed to autoplay directly; fallback to visual swap:", err);
            // Fallback: switch instantly if play is blocked
            gsap.killTweensOf([videoRefA.current, videoRefB.current]);
            gsap.set(videoRefA.current, { opacity: 0 });
            gsap.set(videoRefB.current, { opacity: 1 });
            if (videoRefA.current) videoRefA.current.pause();
            setActivePlayer('B');
            onCanPlayRef.current?.();
          });
        }
      } else {
        const videoA = videoRefA.current;
        if (videoA) {
          videoA.src = src;
          setSrcA(src); // sync React state
          videoA.muted = muted;
          videoA.loop = loop;
          videoA.load();

          const onPlayingA = () => {
            videoA.removeEventListener('playing', onPlayingA);

            // Fade B out, fade A in
            gsap.killTweensOf([videoRefA.current, videoRefB.current]);
            gsap.to(videoRefB.current, { opacity: 0, duration: fadeDuration, ease: 'power2.inOut' });
            gsap.to(videoRefA.current, {
              opacity: 1,
              duration: fadeDuration,
              ease: 'power2.inOut',
              onComplete: () => {
                if (videoRefB.current) {
                  videoRefB.current.pause();
                }
                setActivePlayer('A');
                onCanPlayRef.current?.();
              },
            });
          };
          videoA.addEventListener('playing', onPlayingA);
          videoA.play().catch((err) => {
            console.warn("videoA failed to autoplay directly; fallback to visual swap:", err);
            // Fallback: switch instantly if play is blocked
            gsap.killTweensOf([videoRefA.current, videoRefB.current]);
            gsap.set(videoRefB.current, { opacity: 0 });
            gsap.set(videoRefA.current, { opacity: 1 });
            if (videoRefB.current) videoRefB.current.pause();
            setActivePlayer('A');
            onCanPlayRef.current?.();
          });
        }
      }
    }, [src, activePlayer, muted, loop]);

    // ── Sync loop and muted states of active player ─────────────────────────
    useEffect(() => {
      const activeEl = activePlayer === 'A' ? videoRefA.current : videoRefB.current;
      if (activeEl) {
        activeEl.muted = muted;
        activeEl.loop = loop;
      }
    }, [muted, loop, activePlayer]);

    // ── Event listeners for Player A ────────────────────────────────────────
    useEffect(() => {
      const video = videoRefA.current;
      if (!video) return;

      const handleTimeUpdate = () => {
        if (activePlayer === 'A') {
          onTimeUpdateRef.current?.(video.currentTime);
          if (pauseAtEnd && video.duration && video.currentTime >= video.duration - 0.1) {
            video.pause();
          }
        }
      };

      const handleEnded = () => {
        if (activePlayer === 'A') onEndedRef.current?.();
      };

      const handleCanPlay = () => {
        if (activePlayer === 'A') onCanPlayRef.current?.();
      };

      video.addEventListener('timeupdate', handleTimeUpdate);
      video.addEventListener('ended', handleEnded);
      video.addEventListener('canplay', handleCanPlay);

      // Check if video is already loaded (handles race condition)
      if (video.readyState >= 3) {
        handleCanPlay();
      }

      return () => {
        video.removeEventListener('timeupdate', handleTimeUpdate);
        video.removeEventListener('ended', handleEnded);
        video.removeEventListener('canplay', handleCanPlay);
      };
    }, [activePlayer, pauseAtEnd]);

    // ── Event listeners for Player B ────────────────────────────────────────
    useEffect(() => {
      const video = videoRefB.current;
      if (!video) return;

      const handleTimeUpdate = () => {
        if (activePlayer === 'B') {
          onTimeUpdateRef.current?.(video.currentTime);
          if (pauseAtEnd && video.duration && video.currentTime >= video.duration - 0.1) {
            video.pause();
          }
        }
      };

      const handleEnded = () => {
        if (activePlayer === 'B') onEndedRef.current?.();
      };

      const handleCanPlay = () => {
        if (activePlayer === 'B') onCanPlayRef.current?.();
      };

      video.addEventListener('timeupdate', handleTimeUpdate);
      video.addEventListener('ended', handleEnded);
      video.addEventListener('canplay', handleCanPlay);

      // Check if video is already loaded (handles race condition)
      if (video.readyState >= 3) {
        handleCanPlay();
      }

      return () => {
        video.removeEventListener('timeupdate', handleTimeUpdate);
        video.removeEventListener('ended', handleEnded);
        video.removeEventListener('canplay', handleCanPlay);
      };
    }, [activePlayer, pauseAtEnd]);

    return (
      <>
        {/* Preload next video hint for the browser */}
        {nextSrc && (
          <link
            rel="preload"
            as="video"
            href={nextSrc}
            fetchPriority="low"
          />
        )}

        {/* Video Player A */}
        <video
          ref={videoRefA}
          src={srcA || undefined}
          autoPlay={autoPlay && activePlayer === 'A'}
          loop={loop && activePlayer === 'A'}
          muted={muted}
          playsInline
          className={`absolute inset-0 w-full h-full object-cover transition-opacity ${className}`}
          style={{
            display: 'block',
            opacity: activePlayer === 'A' ? 1 : 0,
            zIndex: activePlayer === 'A' ? 2 : 1,
            pointerEvents: activePlayer === 'A' ? 'auto' : 'none',
          }}
        />

        {/* Video Player B */}
        <video
          ref={videoRefB}
          src={srcB || undefined}
          autoPlay={autoPlay && activePlayer === 'B'}
          loop={loop && activePlayer === 'B'}
          muted={muted}
          playsInline
          className={`absolute inset-0 w-full h-full object-cover transition-opacity ${className}`}
          style={{
            display: 'block',
            opacity: activePlayer === 'B' ? 1 : 0,
            zIndex: activePlayer === 'B' ? 2 : 1,
            pointerEvents: activePlayer === 'B' ? 'auto' : 'none',
          }}
        />
      </>
    );
  }
);

VideoPlayer.displayName = 'VideoPlayer';
export default VideoPlayer;
