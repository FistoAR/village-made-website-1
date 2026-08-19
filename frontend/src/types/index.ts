// ─── Legacy types (preserved) ────────────────────────────────────────────────

export interface Category {
  id: string;
  name: string;
  features: string[];
  description: string;
  image?: string;
}

export interface Product {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  price: number;
  image: string;
  originalPrice?: number;
  discount?: string;
  weights?: string[];
  badge?: string;
  rating?: number;
  reviews?: number;
  features?: string[];
}

export interface Language {
  code: string;
  name: string;
}

export type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night';

// ─── Hero Config types ────────────────────────────────────────────────────────

export interface IntroHighlight {
  categoryId: string;
  at: number; // seconds
}

export interface HeroIntroConfig {
  video: string;
  fallbackVideo: string;
  welcomeVideo?: string;
  explanationVideo: string;
  categoryHighlights: IntroHighlight[];
}

export interface HeroProductConfig {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  video?: string;
  /** The video currentTime (seconds) at which this product card should appear */
  highlightAt: number;
  /** Index (0-based) of which explain video this product appears in */
  explainVideoIndex: number;
}

export interface HeroCategoryVideos {
  travel: string;
  explain: string[];
  return: string;
  fallback: string;
}

export interface HeroCategoryConfig {
  id: string;
  label: string;
  icon: string;
  color: string;
  videos: HeroCategoryVideos;
  products: HeroProductConfig[];
}

export interface HeroConfig {
  intro: HeroIntroConfig;
  categories: HeroCategoryConfig[];
}

// ─── State Machine types ──────────────────────────────────────────────────────

export type HeroPhase =
  | 'INTRO'
  | 'IDLE'
  | 'TRAVEL'
  | 'EXPLAIN'
  | 'RETURN';

export interface HeroState {
  phase: HeroPhase;
  introSequence: 'INTRO_CLIP' | 'WELCOME_CLIP' | 'EXPLANATION_CLIP';
  /** The category currently being shown (TRAVEL / EXPLAIN / RETURN) */
  activeCategory: string | null;
  /** Which explain video we are on (0 = explain1, 1 = explain2, 2 = explain3) */
  explainIndex: number;
  /** Category queued while a playback sequence is running */
  queuedCategory: string | null;
  /** Category button currently highlighted (during intro or active travel) */
  highlightedCategory: string | null;
  /** Product currently being highlighted as an overlay */
  activeProductId: string | null;
  /** When true, category buttons are unclickable */
  buttonsDisabled: boolean;
}

export type HeroAction =
  | { type: 'INTRO_VIDEO_ENDED' }
  | { type: 'WELCOME_VIDEO_ENDED' }
  | { type: 'INTRO_HIGHLIGHT'; categoryId: string | null }
  | { type: 'INTRO_ENDED' }
  | { type: 'CATEGORY_CLICK'; categoryId: string }
  | { type: 'TRAVEL_ENDED' }
  | { type: 'EXPLAIN_ENDED'; index: number }
  | { type: 'RETURN_ENDED' }
  | { type: 'PRODUCT_HIGHLIGHT'; productId: string | null }
  | { type: 'RETURN_CLICK' };