'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

/**
 * Premium Navigation Progress Bar
 * - Triggers instantly on link click and route change
 * - Automatically resets window scroll to top (0,0) so page navigation feels like a real multi-page website
 */
export default function NavigationProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Trigger progress bar and scroll-to-top on route changes
  useEffect(() => {
    // Scroll to top immediately on route change to make it feel like a real new page load
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }

    // Show top loading indicator
    setVisible(true);
    setProgress(35);

    if (timerRef.current) clearInterval(timerRef.current);
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);

    timerRef.current = setInterval(() => {
      setProgress((prev) => (prev >= 90 ? 90 : prev + 12));
    }, 60);

    const doneTimer = setTimeout(() => {
      setProgress(100);
      if (timerRef.current) clearInterval(timerRef.current);
      hideTimerRef.current = setTimeout(() => setVisible(false), 250);
    }, 120);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
      clearTimeout(doneTimer);
    };
  }, [pathname, searchParams]);

  // Intercept click on any internal link to start progress bar instantly before route transition
  useEffect(() => {
    const handleLinkClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest('a');
      if (target && target.href && target.href.startsWith(window.location.origin)) {
        const targetUrl = new URL(target.href);
        if (targetUrl.pathname !== window.location.pathname) {
          setVisible(true);
          setProgress(25);
        }
      }
    };

    document.addEventListener('click', handleLinkClick);
    return () => document.removeEventListener('click', handleLinkClick);
  }, []);

  if (!visible) return null;

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 99999,
        height: '3.5px',
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          height: '100%',
          width: `${progress}%`,
          background: 'linear-gradient(90deg, #384401 0%, #C56C4F 50%, #D4E47A 100%)',
          transition: 'width 150ms ease-out, opacity 250ms ease-in-out',
          boxShadow: '0 0 12px rgba(197, 108, 79, 0.9)',
        }}
      />
    </div>
  );
}
