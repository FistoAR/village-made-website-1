import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import gsap from 'gsap';
import { HeroProductConfig } from '@/types';
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

function ProductCard({
  product,
  isHighlighted,
  categoryColor,
  categoryLabel,
  onClick,
}: {
  product: HeroProductConfig;
  isHighlighted: boolean;
  categoryColor: string;
  categoryLabel?: string;
  onClick: () => void;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const detailsRef = useRef<HTMLDivElement>(null);
  const { addToCart } = useApp();
  const router = useRouter();
  const [added, setAdded] = useState(false);

  // Auto-scroll highlighted product cards into view
  useEffect(() => {
    if (isHighlighted && cardRef.current) {
      cardRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center',
      });
    }
  }, [isHighlighted]);

  useEffect(() => {
    const el = cardRef.current;
    const details = detailsRef.current;
    if (!el) return;

    if (isHighlighted) {
      // Highlight: scale up, add intense glow, expand details
      gsap.to(el, {
        scale: 1.02,
        borderColor: categoryColor,
        boxShadow: `0 12px 36px rgba(0,0,0,0.75), 0 0 20px 3px ${categoryColor}66`,
        duration: 0.45,
        ease: 'power3.out',
      });
      if (details) {
        gsap.to(details, {
          height: 'auto',
          opacity: 1,
          duration: 0.45,
          ease: 'power3.out',
        });
      }
    } else {
      // Reset layout
      gsap.to(el, {
        scale: 1,
        borderColor: 'rgba(238, 221, 185, 0.15)',
        boxShadow: '0 6px 20px rgba(0,0,0,0.5)',
        duration: 0.4,
        ease: 'power3.out',
      });
      if (details) {
        gsap.to(details, {
          height: 0,
          opacity: 0,
          duration: 0.3,
          ease: 'power3.inOut',
        });
      }
    }
  }, [isHighlighted, categoryColor]);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      weight: '500 g',
      category: categoryLabel || 'Malt',
      image: product.image,
    }, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      weight: '500 g',
      category: categoryLabel || 'Malt',
      image: product.image,
    }, 1);
    router.push('/cart');
  };

  return (
    <div
      ref={cardRef}
      onClick={onClick}
      className={[
        'w-full lg:w-full rounded-2xl border overflow-hidden transition-all duration-300 cursor-pointer select-none',
        'max-lg:w-[280px] max-lg:shrink-0',
        isHighlighted 
          ? 'bg-gradient-to-b from-[#2b170c]/95 to-[#1c0e07]/95' 
          : 'bg-[#150a04]/80 hover:bg-[#1a0e06]/90 backdrop-blur-md',
      ].join(' ')}
      style={{
        borderColor: isHighlighted ? categoryColor : 'rgba(238, 221, 185, 0.15)',
      }}
    >
      <div className="flex gap-4 p-4 items-center">
        {/* Product Image */}
        <div className="relative w-16 h-16 flex-shrink-0 rounded-xl overflow-hidden border border-[#eeddb9]/20 shadow-inner">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-500 hover:scale-110"
            sizes="64px"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
        </div>

        {/* Header Info */}
        <div className="flex flex-col justify-center flex-1 min-w-0">
          <h3 className="font-display text-white text-sm md:text-[15px] font-bold leading-snug tracking-wide group-hover:text-[#eeddb9] truncate">
            {product.name}
          </h3>
          <span
            className="font-body text-sm font-semibold mt-1 tracking-wider"
            style={{ color: isHighlighted ? categoryColor : '#e6c594' }}
          >
            ₹{product.price}
          </span>
        </div>
      </div>

      {/* Expanded details */}
      <div ref={detailsRef} className="overflow-hidden h-0 opacity-0 px-4 pb-4">
        <p className="font-body text-white/70 text-[11px] leading-relaxed border-t border-[#eeddb9]/10 pt-3 mb-3 font-normal max-lg:line-clamp-2">
          {product.description}
        </p>
        <div className="flex gap-2.5">
          <button
            className={`flex-1 py-2.5 rounded-xl border text-xs font-body font-bold tracking-widest uppercase transition-all duration-200 cursor-pointer active:scale-[0.97] ${
              added 
                ? 'bg-[#384401]/30 border-[#eeddb9]/50 text-white' 
                : 'border-[#eeddb9]/30 bg-transparent hover:bg-white/5 text-[#eeddb9]'
            }`}
            onClick={handleAddToCart}
          >
            {added ? 'Added ✓' : 'Add to Cart'}
          </button>
          <button
            className="flex-1 py-2.5 rounded-xl text-xs font-body font-bold text-white tracking-widest uppercase transition-all duration-200 hover:brightness-110 active:scale-[0.97] cursor-pointer shadow-md"
            style={{ 
              background: `linear-gradient(135deg, ${categoryColor} 0%, ${categoryColor}dd 100%)`,
              boxShadow: `0 4px 12px ${categoryColor}25`
            }}
            onClick={handleBuyNow}
          >
            Buy Now
          </button>
        </div>
      </div>
    </div>
  );
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

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    if (visible && products.length > 0) {
      gsap.fromTo(
        el,
        { x: 100, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.6, ease: 'power3.out' }
      );
    } else {
      gsap.to(el, { x: 100, opacity: 0, duration: 0.4, ease: 'power3.in' });
    }
  }, [visible, products]);

  if (!visible || products.length === 0) return null;

  return (
    <div
      ref={containerRef}
      className={[
        'absolute right-6 top-1/2 -translate-y-1/2 z-40',
        'flex flex-col gap-3.5 w-72 md:w-80 max-h-[85vh]',
        'overflow-y-auto pr-2 pl-2 hide-scrollbar py-2 items-center',
        // Responsive mobile/tablet adjustments: horizontally scrollable strip at the bottom above category buttons
        'max-lg:fixed max-lg:bottom-[76px] max-lg:left-0 max-lg:right-0 max-lg:top-auto max-lg:-translate-y-0',
        'max-lg:w-full max-lg:max-h-[300px] max-lg:flex-row max-lg:overflow-x-auto max-lg:px-4 max-lg:py-3',
      ].join(' ')}
    >
      {/* Return to Categories Button */}
      <button
        onClick={onReturnClick}
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

      {products.map((p) => (
        <ProductCard
          key={p.id}
          product={p}
          categoryLabel={categoryLabel}
          isHighlighted={activeProductId === p.id}
          categoryColor={categoryColor}
          onClick={() => {
            if (activeProductId === p.id) {
              onProductClick(null);
            } else {
              onProductClick(p.id);
            }
          }}
        />
      ))}
    </div>
  );
}

