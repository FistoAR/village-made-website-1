'use client';

import React, { useRef, useEffect, useCallback } from 'react';
import gsap from 'gsap';
import { HeroCategoryConfig, HeroState } from '@/types';

import heroConfig from '@/data/hero-config.json';

interface CategoryButtonsProps {
  categories: HeroCategoryConfig[];
  state: HeroState;
  onCategoryClick: (categoryId: string) => void;
}

interface ButtonState {
  isHighlighted: boolean;
  isActive: boolean;
  isQueued: boolean;
  isDisabled: boolean;
}

function getButtonState(cat: HeroCategoryConfig, state: HeroState): ButtonState {
  const isHighlighted =
    state.highlightedCategory === cat.id ||
    state.activeCategory === cat.id;

  const isActive =
    (state.phase === 'TRAVEL' ||
      state.phase === 'EXPLAIN') &&
    state.activeCategory === cat.id;

  const isQueued = state.queuedCategory === cat.id;
  const isDisabled = state.buttonsDisabled;

  return { isHighlighted, isActive, isQueued, isDisabled };
}

function CategoryButton({
  cat,
  buttonState,
  onCategoryClick,
}: {
  cat: HeroCategoryConfig;
  buttonState: ButtonState;
  onCategoryClick: (id: string) => void;
}) {
  const btnRef = useRef<HTMLButtonElement>(null);
  const { isHighlighted, isActive, isQueued, isDisabled } = buttonState;

  // Auto-scroll highlighted buttons into view (especially useful for horizontal mobile ribbon)
  useEffect(() => {
    if (isHighlighted && btnRef.current) {
      btnRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center',
      });
    }
  }, [isHighlighted]);

  const handleClick = useCallback(() => {
    if (isDisabled) return;
    // Click feedback scaling
    if (btnRef.current) {
      gsap.fromTo(
        btnRef.current,
        { scale: 0.93 },
        { scale: 1, duration: 0.35, ease: 'back.out(2.5)', clearProps: 'transform' }
      );
    }
    onCategoryClick(cat.id);
  }, [isDisabled, cat.id, onCategoryClick]);

  return (
    <button
      ref={btnRef}
      onClick={handleClick}
      disabled={isDisabled}
      aria-label={`Explore ${cat.label}`}
      aria-pressed={isActive}
      className={[
        'wood-btn-frame',
        isHighlighted || isActive ? 'is-highlighted' : '',
        isActive ? 'is-active' : '',
        isQueued ? 'opacity-85 border-dashed' : '',
        isDisabled ? 'opacity-50 cursor-not-allowed' : '',
      ].join(' ')}
      style={cat.id !== 'malt' ? { pointerEvents: 'none' } : undefined}
    >
      {/* Circle Icon Badge */}
      <span className="wood-btn-icon-circle">
        {cat.icon}
      </span>

      {/* Parchment Text Plate */}
      <span className="wood-btn-parchment">
        {cat.label}
      </span>

      {/* Queued dot */}
      {isQueued && (
        <span
          className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full border-2 border-black/50 animate-pulse"
          style={{ backgroundColor: cat.color }}
        />
      )}
    </button>
  );
}

export default function CategoryButtons({
  categories,
  state,
  onCategoryClick,
}: CategoryButtonsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const isSidebar =
    state.phase === 'TRAVEL' ||
    state.phase === 'EXPLAIN';

  // Sort categories according to the categoryHighlights configuration order
  const highlightOrder = heroConfig.intro.categoryHighlights.map(h => h.categoryId);
  const sortedCategories = [...categories].sort((a, b) => {
    const indexA = highlightOrder.indexOf(a.id);
    const indexB = highlightOrder.indexOf(b.id);
    return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB);
  });

  // Entrance animation when component mounts
  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(
        containerRef.current.querySelectorAll('.wood-btn-frame'),
        { opacity: 0, y: 15, scale: 0.95 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.5,
          ease: 'power2.out',
          stagger: 0.04,
          clearProps: 'transform,opacity',
        }
      );
    }
  }, [isSidebar]);

  if (isSidebar) {
    // Single vertical sidebar layout on the left margin during shop interactions
    return (
      <div
        ref={containerRef}
        className="absolute left-6 top-1/2 -translate-y-1/2 z-30 flex flex-col gap-3 max-h-[80vh] overflow-y-auto pr-2 hide-scrollbar"
        role="navigation"
        aria-label="Category navigation sidebar"
      >
        {sortedCategories.map((cat) => (
          <CategoryButton
            key={cat.id}
            cat={cat}
            buttonState={getButtonState(cat, state)}
            onCategoryClick={onCategoryClick}
          />
        ))}
      </div>
    );
  }

  // Courtyard / IDLE layout: Split left/right sidebars on desktop, scrollable ribbon on mobile
  return (
    <div ref={containerRef}>
      {/* Desktop Left Sidebar: Categories 1-5 */}
      <div 
        className="hidden md:flex absolute left-8 top-1/2 -translate-y-1/2 z-30 flex-col gap-3.5"
        role="navigation"
        aria-label="Category navigation left"
      >
        {sortedCategories.slice(0, 5).map((cat) => (
          <CategoryButton
            key={cat.id}
            cat={cat}
            buttonState={getButtonState(cat, state)}
            onCategoryClick={onCategoryClick}
          />
        ))}
      </div>

      {/* Desktop Right Sidebar: Categories 6-10 */}
      <div 
        className="hidden md:flex absolute right-8 top-1/2 -translate-y-1/2 z-30 flex-col gap-3.5"
        role="navigation"
        aria-label="Category navigation right"
      >
        {sortedCategories.slice(5).map((cat) => (
          <CategoryButton
            key={cat.id}
            cat={cat}
            buttonState={getButtonState(cat, state)}
            onCategoryClick={onCategoryClick}
          />
        ))}
      </div>

      {/* Mobile scrollable ribbon at the bottom of the screen */}
      <div 
        className="flex md:hidden absolute bottom-6 left-0 right-0 z-30 gap-3 overflow-x-auto px-4 py-2 hide-scrollbar w-full justify-start"
        role="navigation"
        aria-label="Category navigation mobile scroll"
      >
        {sortedCategories.map((cat) => (
          <CategoryButton
            key={cat.id}
            cat={cat}
            buttonState={getButtonState(cat, state)}
            onCategoryClick={onCategoryClick}
          />
        ))}
      </div>
    </div>
  );
}
