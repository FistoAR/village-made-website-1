'use client';

/**
 * HeroSection.tsx
 *
 * Root orchestrator for the cinematic village hero experience.
 *
 * Responsibilities:
 *   - Instantiate hero state via useHeroState()
 *   - Mount the single VideoPlayer
 *   - Mount TimelineManager for intro highlights + product timestamps
 *   - Render CategoryButtons, ProductOverlay, GuideOverlay
 *   - Handle video "ended" events by dispatching correct state actions
 *   - GSAP progress bar
 *   - GSAP idle overlay pulse
 *
 * Architecture: everything is data-driven from hero-config.json.
 * Adding a new category = edit JSON only, no component changes needed.
 */

import React, {
  useRef,
  useEffect,
  useLayoutEffect,
  useMemo,
  useCallback,
  useState,
} from 'react';
import gsap from 'gsap';
import Image from 'next/image';
import Link from 'next/link';

import heroConfig from '@/data/hero-config.json';
import { HeroConfig, HeroProductConfig, IntroHighlight } from '@/types';
import { useHeroState } from '@/hooks/useHeroState';
import { useApp } from '@/lib/context/AppContext';
import Navbar from '@/components/Navbar';

import VideoPlayer, { VideoPlayerHandle } from './VideoPlayer';
import TimelineManager, { TimelineEvent } from './TimelineManager';
import CategoryButtons from './CategoryButtons';
import ProductOverlay from './ProductOverlay';
import GuideOverlay from './GuideOverlay';
import LanguageSelector from '@/components/Language/LanguageSelector';

const CONFIG = heroConfig as HeroConfig;



// ── State Label (debug / cinematic HUD) ───────────────────────────────────────
function PhaseIndicator({ phase }: { phase: string }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (ref.current) {
      gsap.fromTo(
        ref.current,
        { opacity: 0, y: -8 },
        { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }
      );
    }
  }, [phase]);

  const colors: Record<string, string> = {
    INTRO: '#D4AF37',
    IDLE: '#6B8E23',
    TRAVEL: '#C56C4F',
    EXPLAIN: '#8B7355',
    RETURN: '#6B8E23',
  };

  return (
    <span
      ref={ref}
      className="font-body text-[9px] tracking-[0.2em] uppercase font-semibold px-2 py-0.5 rounded-full border"
      style={{
        color: colors[phase] ?? '#fff',
        borderColor: `${colors[phase] ?? '#fff'}44`,
        background: `${colors[phase] ?? '#fff'}11`,
      }}
    >
      {phase}
    </span>
  );
}

export default function HeroSection() {
  const { soundOn, toggleSound, setSoundOn } = useApp();
  const videoHandleRef = useRef<VideoPlayerHandle>(null);
  const videoElementRef = useRef<HTMLVideoElement | null>(null);
  const idleOverlayRef = useRef<HTMLDivElement>(null);
  const [isPreloading, setIsPreloading] = useState(true);
  const [isReadyToExplore, setIsReadyToExplore] = useState(false);
  const [activeVideoElement, setActiveVideoElement] = useState<HTMLVideoElement | null>(null);
  const preloaderRef = useRef<HTMLDivElement>(null);
  const heroRootRef = useRef<HTMLDivElement>(null);
  const [isIntersecting, setIsIntersecting] = useState(true);
  const [isTabVisible, setIsTabVisible] = useState(true);
  const {
    state,
    currentVideoSrc,
    nextVideoSrc,
    activeCategory,
    actions,
    explainVideoCount,
  } = useHeroState(CONFIG);

  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    try {
      if (sessionStorage.getItem('hasExplored') === 'true') {
        document.documentElement.classList.add('has-explored');
      }
    } catch (e) {}
  }, []);

  // Track tab visibility to pause/resume video
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsTabVisible(document.visibilityState === 'visible');
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Observe intersection to play/pause video when scrolled
  useEffect(() => {
    const el = heroRootRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting && entry.intersectionRatio > 0.2);
      },
      { threshold: [0, 0.2, 0.5, 0.8, 1.0] }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Play/pause based on intersection and tab visibility
  useEffect(() => {
    const el = activeVideoElement;
    if (!el) return;

    if (!isIntersecting || !isTabVisible) {
      el.pause();
    } else {
      if (!isPreloading) {
        el.play().catch(() => {});
      }
    }
  }, [isIntersecting, isTabVisible, isPreloading, activeVideoElement]);

  // Lock body and html scroll while preloading
  useEffect(() => {
    if (isPreloading) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, [isPreloading]);

  const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

  // Check explored state and test autoplay capabilities immediately on client mount
  useIsomorphicLayoutEffect(() => {
    try {
      const hasExplored = sessionStorage.getItem('hasExplored') === 'true';
      if (!hasExplored) return;

      // Skip preloading immediately since they already explored.
      // This prevents locking the scrollbar and keeps the UI active.
      setIsPreloading(false);

      // Probe whether unmuted autoplay is allowed asynchronously.
      const testAudio = new Audio(
        'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAAA'
      );
      testAudio
        .play()
        .then(() => {
          testAudio.pause();
          setSoundOn(true);
        })
        .catch(() => {
          setSoundOn(false);
        });
    } catch (e) {
      console.warn('sessionStorage is not accessible or Audio test failed', e);
    }
  }, [setSoundOn]);

  const handleBackgroundClick = useCallback((e: React.MouseEvent) => {
    if (isPreloading) return;

    const target = e.target as HTMLElement;
    if (
      target.closest('button') ||
      target.closest('a') ||
      target.closest('[role="region"]') ||
      target.closest('header')
    ) {
      return;
    }

    // Play/resume video if paused (e.g. clicked center of screen)
    const el = videoHandleRef.current?.getElement();
    if (el && el.paused) {
      el.play().catch(err => {
        console.error("Failed to resume video on click:", err);
      });
    }

    if (!soundOn) {
      toggleSound();
    }
  }, [isPreloading, soundOn, toggleSound]);

 

  // ── Video element ref bridge ──────────────────────────────────────────────
  // Sync the inner video element reference when the player is ready
  const syncVideoRef = useCallback(() => {
    videoElementRef.current = videoHandleRef.current?.getElement() ?? null;
  }, []);

  const handleCanPlay = useCallback(() => {
    const el = videoHandleRef.current?.getElement() ?? null;
    videoElementRef.current = el;
    setActiveVideoElement(el);
    if (isPreloading) {
      setIsReadyToExplore(true);
    }
  }, [isPreloading]);

  const handleExplore = useCallback(() => {
    // Unmute/enable sound on user interaction
    setSoundOn(true);
    
    // Store explored state in sessionStorage
    try {
      sessionStorage.setItem('hasExplored', 'true');
    } catch (e) {
      console.warn("Failed to set sessionStorage item:", e);
    }
    
    // Explicitly play the video now that user has interacted with the page
    const el = videoHandleRef.current?.getElement();
    if (el) {
      el.muted = false;
      el.play().catch(err => {
        console.error("Failed to autoplay video with audio:", err);
      });
    }

    if (preloaderRef.current) {
      gsap.to(preloaderRef.current, {
        opacity: 0,
        duration: 0.8,
        ease: 'power2.out',
        onComplete: () => setIsPreloading(false),
      });
    }
  }, [setSoundOn]);

  const handleSkipIntro = useCallback(() => {
    actions.welcomeVideoEnded();
  }, [actions]);

  // ── Video ended handler ───────────────────────────────────────────────────
  const handleVideoEnded = useCallback(() => {
    switch (state.phase) {
      case 'INTRO':
        if (state.introSequence === 'INTRO_CLIP') {
          actions.introVideoEnded();
        } else if (state.introSequence === 'WELCOME_CLIP') {
          actions.welcomeVideoEnded();
        } else {
          actions.introEnded();
          // Force immediate play to begin IDLE native looping
          setTimeout(() => {
            videoHandleRef.current?.play().catch(err => {
              console.log("Failed to start idle loop playback:", err);
            });
          }, 50);
        }
        break;
      case 'TRAVEL':
        actions.travelEnded();
        break;
      case 'EXPLAIN':
        actions.explainEnded(state.explainIndex);
        break;
      case 'RETURN':
        actions.returnEnded();
        // Force immediate play to resume IDLE native looping
        setTimeout(() => {
          videoHandleRef.current?.play().catch(err => {
            console.log("Failed to start idle loop playback:", err);
          });
        }, 50);
        break;
      default:
        break;
    }
  }, [state.phase, state.introSequence, state.explainIndex, actions]);

  const [showButtons, setShowButtons] = useState(false);

  useEffect(() => {
    if (state.phase === 'INTRO') {
      setShowButtons(state.introSequence === 'EXPLANATION_CLIP');
    } else if (state.phase === 'TRAVEL' || state.phase === 'EXPLAIN') {
      setShowButtons(false);
    } else {
      setShowButtons(true);
    }
  }, [state.phase, state.introSequence]);

  // ── IDLE overlay animation ────────────────────────────────────────────────
  useEffect(() => {
    if (!idleOverlayRef.current) return;
    if (state.phase === 'IDLE') {
      gsap.to(idleOverlayRef.current, {
        opacity: 0.5,
        duration: 1.5,
        ease: 'power2.out',
      });
    } else {
      gsap.to(idleOverlayRef.current, {
        opacity: 0,
        duration: 0.8,
        ease: 'power2.out',
      });
    }
  }, [state.phase]);

  // ── Muted sync ───────────────────────────────────────────────────────────
  useEffect(() => {
    const el = videoHandleRef.current?.getElement();
    if (el) el.muted = !soundOn;
  }, [soundOn]);

  // ── Intro timeline events → button highlights ─────────────────────────────
  const introTimelineEvents = useMemo<TimelineEvent[]>(
    () =>
      CONFIG.intro.categoryHighlights.map((h: IntroHighlight) => ({
        at: h.at,
        eventId: h.categoryId,
      })),
    []
  );

  const handleIntroEvent = useCallback(
    (eventId: string | null) => {
      actions.introHighlight(eventId);
    },
    [actions]
  );

  // ── Product timeline events (only during EXPLAIN phase) ───────────────────
  const productTimelineEvents = useMemo<TimelineEvent[]>(() => {
    if (state.phase !== 'EXPLAIN' || !activeCategory) return [];
    return activeCategory.products
      .filter((p: HeroProductConfig) => p.explainVideoIndex === state.explainIndex)
      .map((p: HeroProductConfig) => ({
        at: p.highlightAt,
        eventId: p.id,
      }));
  }, [state.phase, state.explainIndex, activeCategory]);

  const handleProductEvent = useCallback(
    (eventId: string | null) => {
      actions.productHighlight(eventId);
    },
    [actions]
  );

  // Clear product on video change
  useEffect(() => {
    actions.productHighlight(null);
  }, [currentVideoSrc]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Derive active product for overlay ─────────────────────────────────────
  const activeProduct = useMemo<HeroProductConfig | null>(() => {
    if (!state.activeProductId || !activeCategory) return null;
    return activeCategory.products.find(
      (p: HeroProductConfig) => p.id === state.activeProductId
    ) ?? null;
  }, [state.activeProductId, activeCategory]);

  // ── Category color ────────────────────────────────────────────────────────
  const categoryColor = activeCategory?.color ?? '#D4AF37';

  const isSidebar =
    state.phase === 'TRAVEL' ||
    state.phase === 'EXPLAIN';

  // videoElementRef is already a stable MutableRefObject — use it directly

  return (
    <div
      ref={heroRootRef}
      className="relative w-full h-screen overflow-hidden bg-earth-brown cursor-default"
      onClick={handleBackgroundClick}
      suppressHydrationWarning
    >

      {/* ── Premium Cinematic Preloader ── */}
      {isPreloading && (
        <div
          ref={preloaderRef}
          id="preloader-overlay"
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#fdfaf3] text-[#3e2c1c] overflow-hidden"
        >
          {/* Top-Left Leaf Watermark */}
          <div className="absolute top-0 left-0 w-28 sm:w-44 md:w-56 opacity-90 pointer-events-none mix-blend-multiply z-20 animate-sway-1">
            <Image
              src="/images/about/leaf-top.webp"
              alt="Decorative leaves top-left"
              width={260}
              height={260}
              className="object-contain"
            />
          </div>

          {/* Top-Right Leaf Watermark */}
          <div className="absolute top-0 right-0 w-28 sm:w-44 md:w-56 opacity-90 pointer-events-none z-20 animate-sway-2">
            <Image
              src="/images/gallery/gallery-leaf-image.webp"
              alt="Decorative leaves top-right"
              width={260}
              height={260}
              className="object-contain object-right-top"
            />
          </div>

          {/* Bottom-Left Leaf Watermark */}
          <div className="absolute bottom-0 left-0 w-24 sm:w-36 md:w-44 opacity-80 pointer-events-none z-20 animate-sway-3">
            <Image
              src="/images/product-section/top-left-leaf.webp"
              alt="Decorative leaves bottom-left"
              width={220}
              height={220}
              className="object-contain object-left-bottom"
            />
          </div>

          {/* Bottom-Right Sugarcane Graphic */}
          <div className="absolute bottom-0 right-0 w-32 sm:w-48 md:w-60 opacity-90 pointer-events-none z-20 animate-sway-1">
            <Image
              src="/images/product-section/product-section-sugarcane.webp"
              alt="Sugarcane bottom-right"
              width={280}
              height={280}
              className="object-contain object-right-bottom"
            />
          </div>

          {/* Bottom Village Scenery landscape illustration */}
          <div className="absolute bottom-0 left-0 right-0 w-full z-0 opacity-20 pointer-events-none">
            <img
              src="/images/footer-bottom-image.webp"
              alt="Village scenery illustration"
              className="w-full h-auto object-cover object-bottom max-h-[160px] sm:max-h-[220px]"
            />
          </div>

          <div className="flex flex-col items-center max-w-md px-6 text-center space-y-8 relative z-10">
            <div className="flex flex-col items-center">
              <span 
                className="text-[#C56C4F] block normal-case tracking-normal mb-[-12px]"
                style={{ fontFamily: "'Splash', cursive", fontSize: '42px' }}
              >
                Welcome to
              </span>
              <h1 
                className="text-4xl md:text-[46px] text-[#3d2b1f] tracking-[0.2em] font-bold uppercase mt-2"
                style={{ fontFamily: "'Poetsen One', sans-serif" }}
              >
                Village Made
              </h1>
            </div>
            
            <div className="w-24 h-[1px] bg-[#c5b799]" />
            
            {!isReadyToExplore ? (
              <div className="flex flex-col items-center space-y-4">
                <div className="w-16 h-16 relative flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full border-2 border-[#eeddb9] border-t-[#384401] animate-spin" />
                  <span className="text-[9px] font-body text-[#3e2c1c]/50 font-bold tracking-wider">LOADING</span>
                </div>
                <p className="font-body text-xs text-[#5d5449] font-medium tracking-wide uppercase">
                  Preparing your experience...
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center space-y-4">
                <button
                  onClick={handleExplore}
                  className="px-8 py-3.5 rounded-xl bg-[#2b3c0c] hover:bg-[#3d5414] text-white font-jakarta text-sm font-semibold tracking-widest uppercase transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg border border-[#eeddb9]/30 hover:border-white/30 cursor-pointer"
                  style={{
                    boxShadow: '0 10px 25px rgba(43, 60, 12, 0.25)'
                  }}
                >
                  Explore Village Made
                </button>
                <p className="font-body text-[10px] text-[#5d5449] font-bold tracking-widest uppercase">
                  Click to enter with sound enabled 🔊
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Single Full-Screen Video ── */}
      <VideoPlayer
        ref={videoHandleRef}
        src={currentVideoSrc}
        nextSrc={nextVideoSrc}
        autoPlay={!isPreloading}
        muted={!soundOn}
        loop={state.phase === 'IDLE' || state.phase === 'EXPLAIN'}
        pauseAtEnd={false}
        onEnded={handleVideoEnded}
        onCanPlay={handleCanPlay}
        className="absolute inset-0 w-full h-full object-cover z-0"
      />

      {/* ── Timeline Managers ── */}
      {(state.phase === 'INTRO' && state.introSequence === 'EXPLANATION_CLIP' || state.phase === 'IDLE') && (
        <TimelineManager
          videoElement={activeVideoElement}
          events={introTimelineEvents}
          onEvent={handleIntroEvent}
          videoSrc={currentVideoSrc}
        />
      )}
      {state.phase === 'EXPLAIN' && (
        <TimelineManager
          videoElement={activeVideoElement}
          events={productTimelineEvents}
          onEvent={handleProductEvent}
          videoSrc={currentVideoSrc}
        />
      )}
      {/* ── Navigation Bar ── */}
      <Navbar 
        isHero={true}
        onReturnClick={isSidebar ? actions.returnClick : undefined}
        onSkipIntro={handleSkipIntro}
        heroPhase={state.phase}
        introSequence={state.introSequence}
        isPreloading={isPreloading}
      />

      {/* ── Cinematic gradient overlays ── */}
      {/* Bottom gradient for UI legibility */}
      <div className="absolute inset-0 z-10 pointer-events-none"
        style={{
          background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.3) 30%, transparent 60%, rgba(0,0,0,0.2) 100%)',
        }}
      />

      {/* IDLE vignette overlay */}
      <div
        ref={idleOverlayRef}
        className="absolute inset-0 z-10 pointer-events-none"
        style={{
          opacity: 0,
          background: 'radial-gradient(ellipse at center, transparent 40%, rgba(62,44,28,0.6) 100%)',
        }}
      />



      {/* ── Guide Overlay ── */}
      <GuideOverlay
        phase={state.phase}
        activeCategoryLabel={activeCategory?.label}
        explainIndex={state.explainIndex}
      />

      {/* ── Product Overlay ── */}
      <ProductOverlay
        products={activeCategory?.products ?? []}
        activeProductId={state.activeProductId}
        categoryColor={categoryColor}
        visible={state.phase === 'TRAVEL' || state.phase === 'EXPLAIN'}
        onReturnClick={actions.returnClick}
        onProductClick={actions.productHighlight}
      />

      {/* ── Active Category Context Bar ── */}
      {(state.phase === 'TRAVEL' || state.phase === 'EXPLAIN' || state.phase === 'RETURN') && activeCategory && (
        <div
          className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/15 backdrop-blur-md text-xs font-body text-white/70 shadow-lg"
          style={{ background: 'rgba(0,0,0,0.5)' }}
        >
          <span>{activeCategory.icon}</span>
          <span className="font-semibold" style={{ color: categoryColor }}>
            {activeCategory.label}
          </span>
          {state.phase === 'EXPLAIN' && (
            <>
              <span className="text-white/30">•</span>
              <span>
                Scene {state.explainIndex + 1} of {explainVideoCount}
              </span>
            </>
          )}
          {state.queuedCategory && (
            <>
              <span className="text-white/30">•</span>
              <span className="text-white/50">
                Next:{' '}
                {CONFIG.categories.find((c) => c.id === state.queuedCategory)?.label}
              </span>
            </>
          )}
        </div>
      )}

      {/* ── Category Buttons ── */}
      {showButtons && (
        <CategoryButtons
          categories={CONFIG.categories}
          state={state}
          onCategoryClick={actions.categoryClick}
        />
      )}

      
    </div>
  );
}