import React, { useEffect, useRef } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { HeroProductConfig } from '@/types';

interface ProductOverlayProps {
  products: HeroProductConfig[];
  activeProductId: string | null;
  categoryColor: string;
  visible: boolean;
  onReturnClick: () => void;
  onProductClick: (productId: string | null) => void;
}

function ProductCard({
  product,
  isHighlighted,
  categoryColor,
  onClick,
}: {
  product: HeroProductConfig;
  isHighlighted: boolean;
  categoryColor: string;
  onClick: () => void;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const detailsRef = useRef<HTMLDivElement>(null);

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

  return (
    <div
      ref={cardRef}
      onClick={onClick}
      className={[
        'w-full rounded-2xl border overflow-hidden transition-all duration-300 cursor-pointer select-none',
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
          <h3 className="font-display text-white text-sm md:text-[15px] font-bold leading-snug tracking-wide group-hover:text-[#eeddb9]">
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
        <p className="font-body text-white/70 text-xs md:text-sm leading-relaxed border-t border-[#eeddb9]/10 pt-3 mb-4 font-normal">
          {product.description}
        </p>
        <div className="flex gap-2.5">
          <button
            className="flex-1 py-2.5 rounded-xl border border-[#eeddb9]/30 bg-transparent hover:bg-white/5 text-[#eeddb9] text-xs font-body font-bold tracking-widest uppercase transition-all duration-200 cursor-pointer active:scale-[0.97]"
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            Add to Cart
          </button>
          <button
            className="flex-1 py-2.5 rounded-xl text-xs font-body font-bold text-white tracking-widest uppercase transition-all duration-200 hover:brightness-110 active:scale-[0.97] cursor-pointer shadow-md"
            style={{ 
              background: `linear-gradient(135deg, ${categoryColor} 0%, ${categoryColor}dd 100%)`,
              boxShadow: `0 4px 12px ${categoryColor}25`
            }}
            onClick={(e) => {
              e.stopPropagation();
            }}
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
      ].join(' ')}
    >
      <button
        onClick={onReturnClick}
        className="wood-btn-frame mb-3 cursor-pointer active:scale-95 transition-transform flex-shrink-0"
      >
        <span className="wood-btn-icon-circle">🏠</span>
        <span className="wood-btn-parchment">Return to Categories</span>
      </button>

      <div className="w-full text-left text-xs md:text-sm font-semibold font-body text-[#eeddb9]/60 tracking-[0.15em] uppercase mb-1 pl-1">
        Featured Products
      </div>
      {products.map((p) => (
        <ProductCard
          key={p.id}
          product={p}
          isHighlighted={activeProductId === p.id}
          categoryColor={categoryColor}
          onClick={() => {
            // Toggle highlight on click
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
