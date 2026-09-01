'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { X, ArrowRight, Sparkles, Tag } from 'lucide-react';

interface DealBanner {
  id: number;
  title: string;
  discountText: string;
  description: string;
  buttonText: string;
  buttonLink: string;
  imageUrl?: string;
  scheduleType: 'always' | 'range' | 'day_of_week';
  startDate: string;
  endDate: string;
  daysOfWeek: number[];
  position: 'top' | 'center' | 'bottom-right';
  active: boolean;
}

interface DealOfTheDayBannerProps {
  isPreloading?: boolean;
}

export default function DealOfTheDayBanner({ isPreloading = false }: DealOfTheDayBannerProps) {
  const pathname = usePathname();

  // Track if preloader is active on page
  const [isPreloaderActive, setIsPreloaderActive] = useState(() => {
    if (typeof window === 'undefined') return false;
    if (isPreloading) return true;
    if (pathname === '/' && sessionStorage.getItem('hasExplored') !== 'true') return true;
    return false;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const active = isPreloading || (pathname === '/' && sessionStorage.getItem('hasExplored') !== 'true');
    setIsPreloaderActive(active);
  }, [isPreloading, pathname]);
  
  // States for active banners matching current path and schedule
  const [topBanner, setTopBanner] = useState<DealBanner | null>(null);
  const [centerBanner, setCenterBanner] = useState<DealBanner | null>(null);
  const [bottomRightBanner, setBottomRightBanner] = useState<DealBanner | null>(null);
  
  // Visibility states for once-per-session popups
  const [showCenter, setShowCenter] = useState(false);
  const [showBottomRight, setShowBottomRight] = useState(false);
  const [showTop, setShowTop] = useState(true);

  useEffect(() => {
    // Don't display or trigger popups while preloader is active
    if (isPreloaderActive) return;

    // Allow popups on all eligible pages including homepage after scrolling past hero
    const isEligiblePage = true;
    let cleanupScrollListener: (() => void) | null = null;

    const fetchActiveBanners = async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
        const res = await fetch(`${baseUrl}/settings/active-deal-banners`);
        const data = await res.json();
        
        if (data.success && Array.isArray(data.banners)) {
          const eligibleBanners = data.banners.filter((b: DealBanner) => evaluateSchedule(b));
          
          // Find banners for each position
          const top = eligibleBanners.find((b: DealBanner) => b.position === 'top') || null;
          const center = eligibleBanners.find((b: DealBanner) => b.position === 'center') || null;
          const bottomRight = eligibleBanners.find((b: DealBanner) => b.position === 'bottom-right') || null;

          setTopBanner(top);
          setCenterBanner(center);
          setBottomRightBanner(bottomRight);

          // Evaluate session-based visibility for popups after 2-3 scrolls / past Hero section
          if (isEligiblePage && (center || bottomRight)) {
            const checkAndTrigger = () => {
              if (center) {
                const shownCenter = sessionStorage.getItem(`deal_shown_center_${center.id}`) === 'true';
                if (!shownCenter) {
                  setShowCenter(true);
                  sessionStorage.setItem(`deal_shown_center_${center.id}`, 'true');
                }
              }
              if (bottomRight) {
                const shownBR = sessionStorage.getItem(`deal_shown_br_${bottomRight.id}`) === 'true';
                if (!shownBR) {
                  setShowBottomRight(true);
                  sessionStorage.setItem(`deal_shown_br_${bottomRight.id}`, 'true');
                }
              }
            };

            // Track distinct scroll gestures with a debounced timestamp gap
            let gestureCount = 0;
            let lastGestureTime = 0;

            const handleScroll = () => {
              const currentScrollY = window.scrollY;
              const now = Date.now();

              // Count a new distinct scroll gesture only if at least 350ms passed since last counted gesture
              if (now - lastGestureTime > 350) {
                gestureCount += 1;
                lastGestureTime = now;
              }

              // Trigger ONLY after at least 3 distinct scroll gestures AND scrolled past 600px
              if (gestureCount >= 3 && currentScrollY >= 600) {
                checkAndTrigger();
                window.removeEventListener('scroll', handleScroll);
              }
            };

            window.addEventListener('scroll', handleScroll, { passive: true });
            cleanupScrollListener = () => window.removeEventListener('scroll', handleScroll);
          }
        }
      } catch (err) {
        console.error('Failed to load active deal banners:', err);
      }
    };

    fetchActiveBanners();

    return () => {
      if (cleanupScrollListener) {
        cleanupScrollListener();
      }
    };
  }, [pathname, isPreloaderActive]);

  const evaluateSchedule = (cfg: DealBanner): boolean => {
    if (!cfg.active) return false;

    const today = new Date();

    if (cfg.scheduleType === 'range') {
      if (!cfg.startDate || !cfg.endDate) return false;
      const start = new Date(cfg.startDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(cfg.endDate);
      end.setHours(23, 59, 59, 999);
      return today >= start && today <= end;
    }

    if (cfg.scheduleType === 'day_of_week') {
      const currentDay = today.getDay(); // 0 is Sunday, 6 is Saturday
      const days = Array.isArray(cfg.daysOfWeek) ? cfg.daysOfWeek : JSON.parse(cfg.daysOfWeek as any || '[]');
      return days.map(Number).includes(currentDay);
    }

    return true; // 'always'
  };

  // Helper flags to check if popup is "Image-Only" (image exists but no promo texts are typed)
  const isCenterImageOnly = !!centerBanner?.imageUrl && !centerBanner.title && !centerBanner.discountText && !centerBanner.description;
  const isBottomRightImageOnly = !!bottomRightBanner?.imageUrl && !bottomRightBanner.title && !bottomRightBanner.discountText && !bottomRightBanner.description;

  if (isPreloaderActive) return null;

  return (
    <>
      {/* 1. TOP ANNOUNCEMENT BAR */}
      {showTop && topBanner && (
        <div className="w-full bg-gradient-to-r from-[#A45338] via-[#B86B4C] to-[#8C462E] text-white py-2 px-4 relative flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-6 text-center border-b border-white/10 font-jakarta transition-all duration-300 animate-fade-in shadow-md z-[160]">
          <div className="flex items-center gap-2 text-[10px] sm:text-xs font-extrabold uppercase tracking-wider">
            {topBanner.imageUrl && (
              <img src={topBanner.imageUrl} alt="promo thumbnail" className="w-5 h-5 rounded-full object-cover border border-white/20" />
            )}
            <span className="bg-white/20 px-2 py-0.5 rounded-full flex items-center gap-1 border border-white/25">
              <Tag className="w-3 h-3" />
              <span>{topBanner.discountText || 'OFFER'}</span>
            </span>
            <span className="font-bold text-[#F7EFE9]">{topBanner.title}:</span>
            <span className="font-normal text-stone-200 normal-case hidden md:inline">{topBanner.description}</span>
          </div>

          <Link
            href={topBanner.buttonLink || '/products'}
            className="group px-3 py-1 bg-white hover:bg-[#FAF9F5] text-[#A45338] rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-wider transition-all duration-350 cursor-pointer shadow-xs hover:scale-[1.03] flex items-center gap-1 shrink-0"
          >
            <span>{topBanner.buttonText || 'Shop Now'}</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </Link>

          <button
            onClick={() => setShowTop(false)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/70 hover:text-white p-1 hover:bg-white/10 rounded-full transition-colors cursor-pointer"
            aria-label="Dismiss banner"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 2. CENTER POPUP MODAL */}
      {showCenter && centerBanner && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in font-jakarta select-none">
          <div className="absolute inset-0" onClick={() => setShowCenter(false)}></div>
          
          <div className={`overflow-hidden shadow-2xl relative flex flex-col text-stone-900 animate-scale-up z-10 ${
            isCenterImageOnly 
              ? 'bg-transparent border-0 rounded-[32px] max-w-lg w-auto' 
              : 'bg-[#FAF9F5] border-2 border-[#eeddb9] rounded-[32px] max-w-sm w-full border-t-8 border-t-[#384401]'
          }`}>
            {/* Close Button */}
            <button
              onClick={() => setShowCenter(false)}
              className={`absolute top-4 right-4 p-1.5 rounded-full transition-all cursor-pointer z-20 ${
                isCenterImageOnly
                  ? 'bg-white/70 hover:bg-white text-stone-800 hover:text-stone-900 shadow-md'
                  : 'bg-black/10 hover:bg-black/20 text-stone-700 hover:text-stone-900'
              }`}
              aria-label="Close"
            >
              <X className="w-4.5 h-4.5" />
            </button>

            {isCenterImageOnly ? (
              /* Image Only Centered Modal Layout */
              <div className="relative">
                {centerBanner.buttonLink ? (
                  <Link href={centerBanner.buttonLink} onClick={() => setShowCenter(false)}>
                    <img
                      src={centerBanner.imageUrl}
                      alt={centerBanner.title || 'Promotional Banner'}
                      className="w-full h-auto max-h-[80vh] object-contain rounded-[32px] cursor-pointer"
                    />
                  </Link>
                ) : (
                  <img
                    src={centerBanner.imageUrl}
                    alt={centerBanner.title || 'Promotional Banner'}
                    className="w-full h-auto max-h-[80vh] object-contain rounded-[32px]"
                  />
                )}
              </div>
            ) : (
              /* Premium Combination Text-and-Image Layout */
              <>
                {/* Banner Image */}
                {centerBanner.imageUrl && (
                  <div className="w-full bg-white p-4 flex items-center justify-center border-b border-[#eeddb9]/30">
                    <img
                      src={centerBanner.imageUrl}
                      alt={centerBanner.title}
                      className="max-h-48 w-auto object-contain rounded-2xl"
                    />
                  </div>
                )}

                {/* Text Details Area */}
                <div className="p-6 sm:p-8 flex flex-col items-center text-center gap-4">
                  <span className="bg-[#A45338] text-white px-3.5 py-1 rounded-full text-[9px] font-black tracking-widest uppercase flex items-center gap-1 shadow-sm">
                    <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                    {centerBanner.discountText || 'EXCLUSIVE DEAL'}
                  </span>
                  <div className="space-y-1.5">
                    <h3 className="text-lg sm:text-xl font-black text-[#384401] leading-tight font-display tracking-wide">
                      {centerBanner.title}
                    </h3>
                    <p className="text-xs text-stone-600 font-medium leading-relaxed max-w-[280px]">
                      {centerBanner.description}
                    </p>
                  </div>
                  <Link
                    href={centerBanner.buttonLink || '/products'}
                    onClick={() => setShowCenter(false)}
                    className="group w-full py-3.5 bg-gradient-to-r from-[#384401] to-[#4d5a02] hover:from-[#252d00] hover:to-[#384401] text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all duration-300 shadow-md hover:scale-[1.01] flex items-center justify-center gap-2 cursor-pointer mt-2"
                  >
                    <span>{centerBanner.buttonText || 'Shop Now'}</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* 3. BOTTOM-RIGHT FLOATING CARD */}
      {showBottomRight && bottomRightBanner && (
        <div className={`fixed bottom-6 right-6 z-[9998] shadow-2xl animate-slide-up text-stone-900 font-jakarta ${
          isBottomRightImageOnly
            ? 'bg-transparent border-0 rounded-2xl max-w-[260px]'
            : 'bg-[#FAF9F5] border-2 border-[#eeddb9] rounded-2xl p-5 max-w-sm w-full border-l-4 border-l-[#A45338]'
        }`}>
          {/* Close Button */}
          <button
            onClick={() => setShowBottomRight(false)}
            className={`absolute top-3 right-3 p-1.5 rounded-full transition-all cursor-pointer z-20 ${
              isBottomRightImageOnly
                ? 'bg-white/80 hover:bg-white text-stone-850 hover:text-stone-900 shadow-md'
                : 'text-stone-400 hover:text-stone-750 hover:bg-stone-100'
            }`}
            aria-label="Dismiss banner"
          >
            <X className="w-4 h-4" />
          </button>

          {isBottomRightImageOnly ? (
            /* Image Only Bottom-Right Float Layout */
            <div className="relative">
              {bottomRightBanner.buttonLink ? (
                <Link href={bottomRightBanner.buttonLink} onClick={() => setShowBottomRight(false)}>
                  <img
                    src={bottomRightBanner.imageUrl}
                    alt={bottomRightBanner.title || 'Promotional Banner'}
                    className="w-full h-auto object-contain rounded-2xl cursor-pointer"
                  />
                </Link>
              ) : (
                <img
                  src={bottomRightBanner.imageUrl}
                  alt={bottomRightBanner.title || 'Promotional Banner'}
                  className="w-full h-auto object-contain rounded-2xl"
                />
              )}
            </div>
          ) : (
            /* Standard Text-and-Image Floating Layout */
            <>
              <div className="flex gap-4 items-start">
                {bottomRightBanner.imageUrl ? (
                  <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 border border-[#eeddb9]/40 bg-white relative flex items-center justify-center p-1">
                    <img src={bottomRightBanner.imageUrl} alt={bottomRightBanner.title} className="max-w-full max-h-full object-contain" />
                  </div>
                ) : (
                  <div className="w-14 h-14 rounded-xl shrink-0 bg-[#FAF4E6] border border-[#eeddb9]/50 flex items-center justify-center text-[#A45338]">
                    <Tag className="w-6 h-6" />
                  </div>
                )}
                <div className="flex-1 flex flex-col gap-0.5 pr-4">
                  <span className="text-[9px] text-[#A45338] font-black uppercase tracking-wider flex items-center gap-0.5">
                    <Sparkles className="w-2.5 h-2.5 animate-pulse" />
                    {bottomRightBanner.discountText || 'Offer'}
                  </span>
                  <h4 className="text-xs font-black text-[#384401] leading-tight">{bottomRightBanner.title}</h4>
                  <p className="text-[10px] text-stone-650 font-bold leading-normal mt-1">
                    {bottomRightBanner.description}
                  </p>
                </div>
              </div>
              
              <div className="flex gap-2 justify-end mt-4">
                <button
                  onClick={() => setShowBottomRight(false)}
                  className="px-3 py-1.5 text-stone-600 hover:bg-stone-100 rounded-lg text-[10px] font-bold cursor-pointer transition-colors"
                >
                  Maybe Later
                </button>
                <Link
                  href={bottomRightBanner.buttonLink || '/products'}
                  onClick={() => setShowBottomRight(false)}
                  className="px-4 py-1.5 bg-[#384401] hover:bg-[#252d00] text-white rounded-lg text-[10px] font-black uppercase cursor-pointer transition-colors shadow-2xs"
                >
                  {bottomRightBanner.buttonText || 'Claim Deal'}
                </Link>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
