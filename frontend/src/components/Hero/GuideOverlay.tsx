'use client';

/**
 * GuideOverlay.tsx
 *
 * Contextual subtitle-style text hints displayed over the video
 * for each hero state. Provides a guide-like narration layer.
 *
 * GSAP fades text in/out on state transitions.
 */

import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { HeroPhase } from '@/types';

interface GuideOverlayProps {
  phase: HeroPhase;
  activeCategoryLabel?: string | null;
  explainIndex?: number;
}

function getGuideText(
  phase: HeroPhase,
  categoryLabel?: string | null,
  explainIndex?: number
): string | null {
  switch (phase) {
    case 'INTRO':
      return 'Welcome to our village — explore our handcrafted goods';
    case 'IDLE':
      return 'Choose a category to begin your journey';
    case 'TRAVEL':
      return categoryLabel ? `Heading to the ${categoryLabel} workshop...` : null;
    case 'EXPLAIN':
      if (explainIndex === 0) return 'Meet our finest products';
      if (explainIndex === 1) return 'Crafted with generations of knowledge';
      return 'Direct from village to your home';
    case 'RETURN':
      return 'Returning to the village square...';
    default:
      return null;
  }
}

export default function GuideOverlay({
  phase,
  activeCategoryLabel,
  explainIndex = 0,
}: GuideOverlayProps) {
  const textRef = useRef<HTMLDivElement>(null);
  const [displayed, setDisplayed] = useState<string | null>(null);

  const text = getGuideText(phase, activeCategoryLabel, explainIndex);

  useEffect(() => {
    const el = textRef.current;
    if (!el) return;

    if (!text) {
      gsap.to(el, { opacity: 0, y: 4, duration: 0.3, ease: 'power2.in' });
      return;
    }

    // Fade out, swap text, fade in
    gsap.to(el, {
      opacity: 0,
      y: 4,
      duration: 0.2,
      ease: 'power2.in',
      onComplete: () => {
        setDisplayed(text);
        gsap.fromTo(
          el,
          { opacity: 0, y: -4 },
          { opacity: 1, y: 0, duration: 0.45, ease: 'power2.out' }
        );
      },
    });
  }, [text]);

  return (
    <div
      className="absolute bottom-20 max-lg:bottom-auto max-lg:top-[124px] left-0 right-0 flex justify-center px-4 z-30 pointer-events-none"
    >
      <div
        ref={textRef}
        className={[
          'px-5 py-2.5 rounded-full',
          'backdrop-blur-md border border-white/15',
          'font-body text-xs md:text-sm text-white/80 text-center',
          'max-w-sm md:max-w-md',
        ].join(' ')}
        style={{
          background: 'rgba(0,0,0,0.35)',
          WebkitBackdropFilter: 'blur(12px)',
          textShadow: '0 1px 4px rgba(0,0,0,0.6)',
          display: displayed ? 'block' : 'none',
        }}
      >
        {displayed}
      </div>
    </div>
  );
}
