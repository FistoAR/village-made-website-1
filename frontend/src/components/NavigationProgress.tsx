'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

/**
 * Slim progress bar at the top of the page — appears immediately on
 * route change and completes when the new page renders.
 *
 * Works with Next.js App Router by watching pathname + searchParams.
 */
export default function NavigationProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevPathRef = useRef(pathname + searchParams.toString());

  // Kick off progress bar whenever the route changes
  useEffect(() => {
    const current = pathname + searchParams.toString();

    if (current === prevPathRef.current) return; // same page, no bar needed
    prevPathRef.current = current;

    // Clear any previous timers
    if (timerRef.current) clearInterval(timerRef.current);
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);

    // Instantly show at 20%
    setProgress(20);
    setVisible(true);

    // Quickly advance to ~85% to show progress
    timerRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 85) {
          if (timerRef.current) clearInterval(timerRef.current);
          return 85;
        }
        return prev + (85 - prev) * 0.08; // eased growth
      });
    }, 80);

    // Immediately complete + fade out once the new page renders
    // (this effect runs after the new pathname renders, so we can complete now)
    setProgress(100);
    if (timerRef.current) clearInterval(timerRef.current);

    hideTimerRef.current = setTimeout(() => setVisible(false), 600);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, [pathname, searchParams]);

  if (!visible) return null;

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        height: '3px',
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          height: '100%',
          width: `${progress}%`,
          background: 'linear-gradient(90deg, #384401, #6B8E23, #D4AF37)',
          boxShadow: '0 0 8px rgba(107,142,35,0.7)',
          transition: progress === 100
            ? 'width 0.2s ease-out, opacity 0.4s ease 0.2s'
            : 'width 0.08s linear',
          opacity: progress === 100 ? 0 : 1,
          borderRadius: '0 2px 2px 0',
        }}
      />
    </div>
  );
}
