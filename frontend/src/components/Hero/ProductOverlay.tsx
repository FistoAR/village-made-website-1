import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import gsap from 'gsap';
import { HeroProductConfig } from '@/types';
import GlobalProductCard from '@/components/Product/ProductCard';
import { useApp } from '@/lib/context/AppContext';

interface ProductOverlayProps {
  products: HeroProductConfig[];
  activeProductId: string | null;
  categoryColor: string;
  categoryLabel?: string;
  visible: boolean;
  onReturnClick: () => void;
  onProductClick: (productId: string | null) => void;
}

export default function ProductOverlay({
  products,
  activeProductId,
  categoryColor,
  categoryLabel,
  visible,
  onReturnClick,
  onProductClick,
}: ProductOverlayProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { products: dbProducts } = useApp();
  const [manualExpandedId, setManualExpandedId] = useState<string | null>(null);

  const categoryLabelLower = categoryLabel?.toLowerCase();
  const dbCategoryProducts = dbProducts?.filter(
    (item) => item.category?.toLowerCase() === categoryLabelLower
  ) ?? [];

  const displayProducts = [...products];
  dbCategoryProducts.forEach((dbP) => {
    const alreadyInConfig = displayProducts.some(
      (p) => p.name?.toLowerCase() === dbP.name?.toLowerCase()
    );
    if (!alreadyInConfig) {
      displayProducts.push({
        id: dbP.id,
        name: dbP.name,
        description: dbP.description || '',
        price: dbP.price,
        image: dbP.image || '',
        video: dbP.video || '/videos/products/product-sample-video.webm',
        highlightAt: 999,
        explainVideoIndex: 0,
      });
    }
  });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    if (visible && displayProducts.length > 0) {
      gsap.fromTo(
        el,
        { x: 100, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.6, ease: 'power3.out' }
      );
    } else {
      gsap.to(el, { x: 100, opacity: 0, duration: 0.4, ease: 'power3.in' });
    }
  }, [visible, displayProducts.length]); // eslint-disable-line react-hooks/exhaustive-deps

  // Smooth scroll active or manually expanded product card into center viewport
  useEffect(() => {
    const targetId = manualExpandedId || activeProductId;
    if (targetId && containerRef.current) {
      const activeEl = document.getElementById(`overlay-product-${targetId}`);
      const container = containerRef.current;
      if (activeEl && container) {
        const isMobile = window.innerWidth < 1024;
        if (isMobile) {
          const containerWidth = container.clientWidth;
          const elementLeft = activeEl.offsetLeft;
          const elementWidth = activeEl.clientWidth;
          const targetScrollLeft = elementLeft - (containerWidth / 2) + (elementWidth / 2);
          container.scrollTo({
            left: targetScrollLeft,
            behavior: 'smooth'
          });
        } else {
          const containerHeight = container.clientHeight;
          const elementTop = activeEl.offsetTop;
          const elementHeight = activeEl.clientHeight;
          const targetScrollTop = elementTop - (containerHeight / 2) + (elementHeight / 2);
          container.scrollTo({
            top: targetScrollTop,
            behavior: 'smooth'
          });
        }
      }
    }
  }, [activeProductId, manualExpandedId]);

  if (!visible || displayProducts.length === 0) return null;

  return (
    <div
      ref={containerRef}
      className={[
        'absolute right-6 top-1/2 -translate-y-1/2 z-40',
        'flex flex-col gap-5 w-64 md:w-72 max-h-[85vh]',
        'overflow-y-auto pr-2 pl-2 hide-scrollbar py-2 items-center',
        // Responsive mobile/tablet adjustments: horizontally scrollable ribbon at the bottom
        'max-lg:absolute max-lg:bottom-[5%] max-lg:left-0 max-lg:right-0 max-lg:top-auto max-lg:-translate-y-0',
        'max-lg:w-full max-lg:max-h-[520px] max-lg:flex-row max-lg:overflow-x-auto max-lg:px-4 max-lg:py-4 max-lg:gap-5 max-lg:items-end',
      ].join(' ')}
    >
      {/* Return to Categories Button */}
      <button
        onClick={() => {
          setManualExpandedId(null);
          onReturnClick();
        }}
        className={[
          'cursor-pointer active:scale-95 transition-all flex-shrink-0 flex items-center justify-center',
          // Desktop: premium wooden button
          'lg:wood-btn-frame lg:mb-3',
          // Mobile/Tablet: compact wooden card matching the product ribbon height
          'max-lg:w-24 max-lg:h-[96px] max-lg:flex-col max-lg:gap-1.5 max-lg:rounded-2xl max-lg:border max-lg:border-[#eeddb9]/20 max-lg:bg-gradient-to-b max-lg:from-[#2e190e] max-lg:to-[#170c07] max-lg:shadow-lg'
        ].join(' ')}
      >
        <span className={[
          'flex-shrink-0',
          'lg:wood-btn-icon-circle',
          'max-lg:w-10 max-lg:h-10 max-lg:rounded-full max-lg:bg-gradient-to-b max-lg:from-[#eedeb8] max-lg:to-[#dcbfa0] max-lg:border max-lg:border-[#4d2d1b] max-lg:flex max-lg:items-center max-lg:justify-center max-lg:text-base max-lg:shadow-inner'
        ].join(' ')}>🏠</span>
        
        <span className={[
          'font-body font-bold tracking-wider',
          'lg:wood-btn-parchment',
          'max-lg:text-[10px] max-lg:text-[#eeddb9]/90'
        ].join(' ')}>
          Return
        </span>
      </button>

      <div className="w-full text-left text-xs md:text-sm font-semibold font-body text-[#eeddb9]/60 tracking-[0.15em] uppercase mb-1 pl-1 max-lg:hidden">
        Featured Products
      </div>

      {displayProducts.map((p) => {
        const isHighlighted = activeProductId === p.id;
        
        // Find matching product in DB catalog by name if loaded
        const dbProduct = dbProducts?.find(
          (item) => item.name?.toLowerCase() === p.name?.toLowerCase()
        );

        // Map HeroProductConfig properties, overriding with latest live DB details
        const productProps = dbProduct ? {
          id: dbProduct.id,
          name: dbProduct.name,
          description: dbProduct.description,
          price: dbProduct.price,
          originalPrice: dbProduct.originalPrice || Math.round(dbProduct.price * 1.3),
          discount: dbProduct.discount || '20% OFF',
          rating: dbProduct.rating || 4.7,
          reviews: dbProduct.reviews || 128,
          weights: dbProduct.weights || ['500g'],
          stock: dbProduct.stock !== undefined ? dbProduct.stock : 50,
          image: dbProduct.image || p.image,
          video: dbProduct.video || p.video || '/videos/products/product-sample-video.webm',
          category: dbProduct.category || categoryLabel || 'Malt',
        } : {
          id: p.id,
          name: p.name,
          description: p.description,
          price: p.price,
          originalPrice: Math.round(p.price * 1.3),
          discount: '20% OFF',
          rating: 4.7,
          reviews: 128,
          weights: ['500g'],
          stock: 50,
          image: p.image,
          video: p.video || '/videos/products/product-sample-video.webm',
          category: categoryLabel || 'Malt',
        };

        const isExpanded = isHighlighted || manualExpandedId === p.id;
        const isAnyCardExpanded = activeProductId !== null || manualExpandedId !== null;
        const shouldDim = isAnyCardExpanded && !isExpanded;

        return (
          <div
            id={`overlay-product-${p.id}`}
            key={p.id}
            onClickCapture={(e) => {
              // Intercept the click on the card to update the background video highlight 
              // instead of immediately navigating to the product detail page, unless clicking active buttons
              const target = e.target as HTMLElement;
              if (!target.closest('button') && !target.closest('a')) {
                e.stopPropagation();
                e.preventDefault();
                
                if (manualExpandedId === p.id) {
                  setManualExpandedId(null);
                  onProductClick(null);
                } else {
                  setManualExpandedId(p.id);
                  onProductClick(p.id);
                }
              }
            }}
            className={[
              'w-full lg:w-full max-lg:w-[260px] max-lg:shrink-0 flex-shrink-0 transition-all duration-300',
              isExpanded 
                ? 'z-30 relative scale-[1.03] lg:scale-[1.02] max-lg:mx-3 max-lg:my-0 lg:my-2' 
                : shouldDim
                  ? 'z-10 relative scale-90 opacity-60 lg:opacity-60 lg:scale-95 max-lg:mx-0 max-lg:my-0 lg:my-0'
                  : 'z-10 relative scale-100 opacity-100 lg:scale-100 max-lg:mx-0 max-lg:my-0 lg:my-0'
            ].join(' ')}
          >
            <GlobalProductCard
              product={productProps}
              highlighted={isExpanded}
              heroMode={true}
            />
          </div>
        );
      })}
    </div>
  );
}

