/**
 * heroStateMachine.ts
 *
 * Pure reducer — zero React, zero side-effects.
 * All state transitions for the cinematic hero experience live here.
 *
 * State flow:
 *   INTRO  ──(INTRO_ENDED)──► IDLE
 *   IDLE   ──(CATEGORY_CLICK)──► TRAVEL
 *   TRAVEL ──(TRAVEL_ENDED)──► EXPLAIN (index 0)
 *   EXPLAIN ──(EXPLAIN_ENDED, index < maxExplain-1)──► EXPLAIN (index+1)
 *   EXPLAIN ──(EXPLAIN_ENDED, index === maxExplain-1)──► RETURN
 *   RETURN ──(RETURN_ENDED, no queue)──► IDLE
 *   RETURN ──(RETURN_ENDED, has queue)──► TRAVEL (queued category)
 *
 *   While TRAVEL/EXPLAIN/RETURN:
 *     CATEGORY_CLICK → stored as queuedCategory (if different from active)
 */

import { HeroState, HeroAction, HeroPhase } from '@/types';

export const EXPLAIN_VIDEO_COUNT = 3;

export const initialHeroState: HeroState = {
  phase: 'INTRO',
  introSequence: 'INTRO_CLIP',
  activeCategory: null,
  explainIndex: 0,
  queuedCategory: null,
  highlightedCategory: null,
  activeProductId: null,
  buttonsDisabled: true, // Start disabled during intro clip
};

export function heroReducer(state: HeroState, action: HeroAction): HeroState {
  switch (action.type) {
    // ── Intro ───────────────────────────────────────────────────────────────
    case 'INTRO_VIDEO_ENDED': {
      if (state.phase !== 'INTRO') return state;
      return {
        ...state,
        introSequence: 'EXPLANATION_CLIP',
        buttonsDisabled: false, // Enable category buttons when explanation video starts
      };
    }

    case 'WELCOME_VIDEO_ENDED': {
      if (state.phase !== 'INTRO') return state;
      return {
        ...state,
        introSequence: 'EXPLANATION_CLIP',
        buttonsDisabled: false,
      };
    }

    case 'INTRO_HIGHLIGHT': {
      if (state.phase !== 'INTRO' && state.phase !== 'IDLE') return state;
      return {
        ...state,
        highlightedCategory: action.categoryId,
      };
    }

    case 'INTRO_ENDED': {
      if (state.phase !== 'INTRO') return state;
      return {
        ...state,
        phase: 'IDLE',
        highlightedCategory: null,
        buttonsDisabled: false,
      };
    }

    // ── Category selection ──────────────────────────────────────────────────
    case 'CATEGORY_CLICK': {
      if (action.categoryId === state.activeCategory) return state;
      
      // Start travel sequence for the new category immediately, aborting any active sequence or intro
      return {
        ...state,
        phase: 'TRAVEL',
        activeCategory: action.categoryId,
        explainIndex: 0,
        queuedCategory: null,
        highlightedCategory: action.categoryId,
        activeProductId: null,
        buttonsDisabled: false,
      };
    }

    // ── Video sequence transitions ──────────────────────────────────────────
    case 'TRAVEL_ENDED': {
      if (state.phase !== 'TRAVEL') return state;
      return {
        ...state,
        phase: 'EXPLAIN',
        explainIndex: 0,
        activeProductId: null,
      };
    }

    case 'EXPLAIN_ENDED': {
      if (state.phase !== 'EXPLAIN') return state;
      const nextIndex = action.index + 1;

      // More explain videos to play
      if (nextIndex < EXPLAIN_VIDEO_COUNT) {
        return {
          ...state,
          explainIndex: nextIndex,
          activeProductId: null,
        };
      }

      // All explain videos done — go to return
      return {
        ...state,
        phase: 'RETURN',
        activeProductId: null,
      };
    }

    case 'RETURN_ENDED': {
      if (state.phase !== 'RETURN') return state;

      // If a category was queued, start its travel immediately
      if (state.queuedCategory) {
        return {
          ...state,
          phase: 'TRAVEL',
          activeCategory: state.queuedCategory,
          explainIndex: 0,
          queuedCategory: null,
          highlightedCategory: state.queuedCategory,
          activeProductId: null,
          buttonsDisabled: false,
        };
      }

      // Otherwise return to idle
      return {
        ...state,
        phase: 'IDLE',
        activeCategory: null,
        highlightedCategory: null,
        activeProductId: null,
        buttonsDisabled: false,
      };
    }

    // ── Product highlight ───────────────────────────────────────────────────
    case 'PRODUCT_HIGHLIGHT': {
      return {
        ...state,
        activeProductId: action.productId,
      };
    }

    // ── Return to courtyard ─────────────────────────────────────────────────
    case 'RETURN_CLICK': {
      const isSequence =
        state.phase === 'TRAVEL' ||
        state.phase === 'EXPLAIN' ||
        state.phase === 'RETURN';
      if (!isSequence) return state;
      return {
        ...state,
        phase: 'RETURN',
        explainIndex: 0,
        activeProductId: null,
        queuedCategory: null,
        buttonsDisabled: false,
      };
    }

    default:
      return state;
  }
}

// ── Selectors / helpers ──────────────────────────────────────────────────────

/** Returns the video src that should be playing given the current state */
export function deriveVideoSrc(
  state: HeroState,
  config: {
    introVideo: string;
    welcomeVideo: string;
    explanationVideo: string;
    introFallback: string;
    getCategoryVideos: (id: string) => {
      travel: string;
      explain: string[];
      return: string;
      fallback: string;
    } | null;
  }
): string {
  const { phase, introSequence, activeCategory, explainIndex } = state;

  if (phase === 'INTRO') {
    if (introSequence === 'INTRO_CLIP') {
      return config.introVideo || config.introFallback;
    }
    if (introSequence === 'WELCOME_CLIP') {
      return config.welcomeVideo || config.introFallback;
    }
    return config.explanationVideo || config.introFallback;
  }

  if (phase === 'IDLE') {
    return config.explanationVideo || config.introFallback;
  }

  if (!activeCategory) return config.introFallback;

  const videos = config.getCategoryVideos(activeCategory);
  if (!videos) return config.introFallback;

  switch (phase) {
    case 'TRAVEL':
      return videos.travel || videos.fallback;
    case 'EXPLAIN':
      return videos.explain[explainIndex] || videos.fallback;
    case 'RETURN':
      return videos.return || videos.fallback;
    default:
      return config.introFallback;
  }
}

/** Returns which video comes next (for preloading) */
export function deriveNextVideoSrc(
  state: HeroState,
  config: {
    welcomeVideo: string;
    explanationVideo: string;
    introFallback: string;
    getCategoryVideos: (id: string) => {
      travel: string;
      explain: string[];
      return: string;
      fallback: string;
    } | null;
  }
): string | null {
  const { phase, introSequence, activeCategory, explainIndex } = state;

  if (phase === 'INTRO') {
    if (introSequence === 'INTRO_CLIP') {
      return config.explanationVideo || null;
    }
    if (introSequence === 'WELCOME_CLIP') {
      return config.explanationVideo || null;
    }
    return null;
  }

  if (!activeCategory) return null;
  const videos = config.getCategoryVideos(activeCategory);
  if (!videos) return null;

  switch (phase) {
    case 'TRAVEL':
      return videos.explain[0] || null;
    case 'EXPLAIN': {
      const next = explainIndex + 1;
      if (next < EXPLAIN_VIDEO_COUNT) return videos.explain[next] || null;
      return videos.return || null;
    }
    case 'RETURN':
      return null; // Back to idle — nothing to preload
    default:
      return null;
  }
}
