'use client';

/**
 * useHeroState.ts
 *
 * Custom hook that wraps heroReducer + exposes a clean API to HeroSection.
 * Handles:
 *   - useReducer instantiation
 *   - Config access helpers
 *   - Dispatch action wrappers
 *   - Current/next video URL derivation
 */

import { useReducer, useCallback, useMemo } from 'react';
import {
  heroReducer,
  initialHeroState,
  deriveVideoSrc,
  deriveNextVideoSrc,
  EXPLAIN_VIDEO_COUNT,
} from '@/lib/heroStateMachine';
import { HeroState, HeroAction, HeroConfig, HeroCategoryConfig } from '@/types';

export interface UseHeroStateReturn {
  state: HeroState;
  dispatch: React.Dispatch<HeroAction>;
  currentVideoSrc: string;
  nextVideoSrc: string | null;
  activeCategory: HeroCategoryConfig | null;
  actions: {
    introVideoEnded: () => void;
    welcomeVideoEnded: () => void;
    introHighlight: (categoryId: string | null) => void;
    introEnded: () => void;
    categoryClick: (categoryId: string) => void;
    travelEnded: () => void;
    explainEnded: (index: number) => void;
    returnEnded: () => void;
    productHighlight: (productId: string | null) => void;
    returnClick: () => void;
  };
  explainVideoCount: number;
}

export function useHeroState(config: HeroConfig): UseHeroStateReturn {
  const [state, dispatch] = useReducer(heroReducer, initialHeroState);

  // ── Config helpers ─────────────────────────────────────────────────────────
  const getCategoryVideos = useCallback(
    (id: string) => {
      const cat = config.categories.find((c) => c.id === id);
      return cat ? cat.videos : null;
    },
    [config.categories]
  );

  const activeCategory = useMemo(
    () =>
      state.activeCategory
        ? (config.categories.find((c) => c.id === state.activeCategory) ?? null)
        : null,
    [state.activeCategory, config.categories]
  );

  // ── Video URL derivation ───────────────────────────────────────────────────
  const currentVideoSrc = useMemo(
    () =>
      deriveVideoSrc(state, {
        introVideo: config.intro.video,
        welcomeVideo: config.intro.welcomeVideo || '',
        explanationVideo: config.intro.explanationVideo,
        introFallback: config.intro.fallbackVideo,
        getCategoryVideos,
      }),
    [state, config.intro.video, config.intro.welcomeVideo, config.intro.explanationVideo, config.intro.fallbackVideo, getCategoryVideos]
  );

  const nextVideoSrc = useMemo(
    () =>
      deriveNextVideoSrc(state, {
        welcomeVideo: config.intro.welcomeVideo || '',
        explanationVideo: config.intro.explanationVideo,
        introFallback: config.intro.fallbackVideo,
        getCategoryVideos,
      }),
    [state, config.intro.welcomeVideo, config.intro.explanationVideo, config.intro.fallbackVideo, getCategoryVideos]
  );

  // ── Action dispatchers ─────────────────────────────────────────────────────
  const actions = useMemo(
    () => ({
      introVideoEnded: () => dispatch({ type: 'INTRO_VIDEO_ENDED' }),

      welcomeVideoEnded: () => dispatch({ type: 'WELCOME_VIDEO_ENDED' }),

      introHighlight: (categoryId: string | null) =>
        dispatch({ type: 'INTRO_HIGHLIGHT', categoryId }),

      introEnded: () => dispatch({ type: 'INTRO_ENDED' }),

      categoryClick: (categoryId: string) =>
        dispatch({ type: 'CATEGORY_CLICK', categoryId }),

      travelEnded: () => dispatch({ type: 'TRAVEL_ENDED' }),

      explainEnded: (index: number) =>
        dispatch({ type: 'EXPLAIN_ENDED', index }),

      returnEnded: () => dispatch({ type: 'RETURN_ENDED' }),

      productHighlight: (productId: string | null) =>
        dispatch({ type: 'PRODUCT_HIGHLIGHT', productId }),

      returnClick: () => dispatch({ type: 'RETURN_CLICK' }),
    }),
    []
  );

  return {
    state,
    dispatch,
    currentVideoSrc,
    nextVideoSrc,
    activeCategory,
    actions,
    explainVideoCount: EXPLAIN_VIDEO_COUNT,
  };
}
