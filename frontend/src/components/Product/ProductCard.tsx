'use client';
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Star, Minus, Plus } from 'lucide-react';
import { useApp } from '@/lib/context/AppContext';
import { getVariantPrice } from '@/lib/variantPrice';

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    description: string;
    price: number;
    originalPrice?: number;
    discount?: string;
    rating?: number;
    reviews?: number;
    weights?: any[];
    stock?: number;
    image?: string;
    video?: string;
    category?: string;
    badge?: string;
  };
  highlighted?: boolean;
}

export default function ProductCard({ product, highlighted }: ProductCardProps) {
  const router = useRouter();
  const { addToCart, cart } = useApp();
  const rawWeights = product.weights || ['250g', '500g', '1kg'];
  const weights = useMemo(() => {
    return rawWeights.map((w: any) => (typeof w === 'object' && w !== null && w.weight) ? w.weight : w);
  }, [product.weights]);
  const [selectedWeight, setSelectedWeight] = useState(weights[0]);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  // Calculate variant prices dynamically
  const currentPrice = getVariantPrice(product.price, selectedWeight, product.weights);
  const currentOriginalPrice = product.originalPrice ? getVariantPrice(product.originalPrice, selectedWeight, product.weights) : undefined;

  const currentStock = useMemo(() => {
    if (product.weights && Array.isArray(product.weights)) {
      const cleanWeight = selectedWeight.toLowerCase().replace(/\s+/g, '');
      const found = product.weights.find((w: any) => typeof w === 'object' && w !== null && w.weight && w.weight.toLowerCase().replace(/\s+/g, '') === cleanWeight);
      if (found && typeof found.stock === 'number') {
        return found.stock;
      }
    }
    return product.stock !== undefined ? product.stock : 50;
  }, [product.weights, product.stock, selectedWeight]);

  useEffect(() => {
    if (currentStock === 0) {
      setQty(0);
    } else {
      setQty(prev => Math.min(Math.max(1, prev), currentStock));
    }
  }, [selectedWeight, currentStock]);

  // Lazy-load video: only autoplay when the card is visible in viewport
  const videoRef = useRef<HTMLVideoElement>(null);
  const videoWrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    const wrap = videoWrapRef.current;
    if (!video || !wrap) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Only load + play when visible
          if (!video.src) {
            video.src = product.video || '/videos/products/product-sample-video.webm';
          }
          video.play().catch(() => {/* autoplay policy: silently ignore */});
        } else {
          video.pause();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(wrap);
    return () => observer.disconnect();
  }, [product.video]);

  const isItemInCart = useMemo(() => {
    return cart.some(item => 
      item.id === product.id && 
      item.weight.replace(/\s+/g, '') === selectedWeight.replace(/\s+/g, '')
    );
  }, [cart, product.id, selectedWeight]);

  const [rating, setRating] = useState(product.rating || 4.7);
  const [reviews, setReviews] = useState(product.reviews || 128);

  useEffect(() => {
    try {
      const allReviews = JSON.parse(localStorage.getItem('village_made_global_reviews') || '{}');
      const customReviews = allReviews[product.id] || [];
      if (customReviews.length > 0) {
        const avg = customReviews.reduce((sum: number, r: any) => sum + r.rating, 0) / customReviews.length;
        setRating(parseFloat(avg.toFixed(1)));
        setReviews(customReviews.length);
      } else {
        setRating(product.rating || 4.7);
        setReviews(product.reviews || 128);
      }
    } catch (e) {
      setRating(product.rating || 4.7);
      setReviews(product.reviews || 128);
    }
  }, [product.id, product.rating, product.reviews]);
  const originalPrice = product.originalPrice || Math.round(product.price * 1.3);
  const discount = product.discount || '20% OFF';
  const category = product.category || 'Malt';

  const handleCardClick = () => {
    router.push(`/products/${product.id}`);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart({
      id: product.id,
      name: product.name,
      price: currentPrice,
      weight: selectedWeight,
      category: category
    }, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart({
      id: product.id,
      name: product.name,
      price: currentPrice,
      weight: selectedWeight,
      category: category
    }, qty);
    router.push('/cart');
  };

  return (
    <div 
      onClick={handleCardClick}
      className={`w-full bg-[#FAF4E6] rounded-[24px] overflow-hidden border border-[#eeddb9] shadow-xs flex flex-col relative z-20 transition-all duration-300 hover:shadow-lg cursor-pointer ${
        highlighted ? 'scale-[1.02] border-[#C56C4F]' : ''
      }`}
    >
      {/* Product Video Area — lazy-load: only play when visible */}
      <div className="w-full aspect-square relative overflow-hidden bg-black" ref={videoWrapRef}>
        <video 
          ref={videoRef}
          muted 
          loop 
          playsInline 
          preload="none"
          className="object-cover w-full h-full"
        />
        
        {/* Best Seller Badge */}
        {product.badge && (
          <div className="absolute top-5 left-0 bg-[#42321c] text-white text-[10px] sm:text-[11px] font-jakarta font-bold pl-4 pr-5 py-2.5 rounded-tl-[24px] rounded-br-[20px] flex items-center gap-1.5 shadow-xs z-10">
            <Star className="w-3 sm:w-3.5 h-3 sm:h-3.5 fill-[#f3a847] text-[#f3a847]" />
            {product.badge}
          </div>
        )}
      </div>

      {/* Product Info with Torn Paper Background */}
      <div 
        className="flex flex-col flex-grow p-4 relative z-10 -mt-22 pt-8 bg-cover bg-no-repeat bg-top" 
        style={{ backgroundImage: "url('/images/product-section/bottom-paper-texture.webp')" }}
      >
        <span className="text-[#394308] font-jakarta text-sm font-bold pt-12 mb-1">{category}</span>
        <h3 className="text-[#462617] font-jakarta font-bold text-base sm:text-lg mb-1">{product.name}</h3>
        <p className="text-[#333333] font-jakarta text-sm leading-relaxed mb-3">{product.description}</p>

        {/* Rating */}
        <div className="flex items-center gap-1 mb-3">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`w-3.5 h-3.5 ${
                i < Math.floor(rating)
                  ? 'fill-[#f3a847] text-[#f3a847]'
                  : 'fill-[#e3d7c3] text-[#e3d7c3]'
              }`}
            />
          ))}
          <span className="text-[#1a110a] font-jakarta text-xs font-bold ml-1">{rating}</span>
          <span className="text-[#8e7e6f] font-jakarta text-xs">({reviews})</span>
        </div>

        {/* Pricing */}
        <div className="flex items-center gap-2 mb-4">
          <span className="text-[#1a110a] font-jakarta font-bold text-xl">₹{currentPrice}</span>
          <span className="text-[#8e7e6f] font-jakarta text-sm line-through">₹{currentOriginalPrice || originalPrice}</span>
          <span className="bg-[#e2edd3] text-[#384401] font-jakarta text-[10px] font-bold px-1.5 py-0.5 rounded-md">
            {discount}
          </span>
        </div>

        {/* Weight selection and Qty Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-4 border-t border-stone-200/40 pt-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[#1a110a] font-jakarta text-xs font-bold mr-0.5">Weight:</span>
            <div className="flex gap-1 flex-wrap">
              {weights.map((w) => (
                <button
                  key={w}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedWeight(w);
                  }}
                  className={`px-2 py-0.5 text-[10px] font-jakarta font-semibold rounded-md border transition-all cursor-pointer ${
                    selectedWeight === w
                      ? 'bg-[#ede2d3] border-[#cbb396] text-[#3e2c1c]'
                      : 'bg-white border-[#ebdcc1] text-[#6d5e50] hover:bg-[#fcfbf9]'
                  }`}
                >
                  {w}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity selector */}
          <div className="flex items-center justify-between sm:justify-start gap-2">
            <span className="text-[#1a110a] font-jakarta text-xs font-bold sm:hidden">Qty:</span>
            <div className="flex items-center bg-[#faf6eb] border border-[#d2c9b4] rounded-md h-6 px-1 shrink-0">
              <button
                disabled={currentStock === 0}
                onClick={(e) => {
                  e.stopPropagation();
                  setQty(Math.max(1, qty - 1));
                }}
                className="w-4 h-4 flex items-center justify-center text-[#3e2c1c] hover:bg-[#ebdcc1]/40 rounded cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <Minus className="w-2.5 h-2.5" />
              </button>
              <span className="font-jakarta text-[11px] font-bold text-[#1a110a] mx-1.5">{qty}</span>
              <button
                disabled={qty >= currentStock || currentStock === 0}
                onClick={(e) => {
                  e.stopPropagation();
                  if (qty < currentStock) setQty(qty + 1);
                }}
                className="w-4 h-4 flex items-center justify-center text-[#3e2c1c] hover:bg-[#ebdcc1]/40 rounded cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <Plus className="w-2.5 h-2.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col min-[380px]:flex-row lg:flex-col xl:flex-row gap-2 mt-auto">
          {currentStock === 0 ? (
            <div className="flex-1 bg-stone-200 border border-stone-300 text-stone-500 text-center font-jakarta font-bold text-xs py-2.5 rounded-lg select-none">
              Out of Stock
            </div>
          ) : (
            <>
              <button 
                onClick={handleAddToCart}
                className={`flex-1 text-xs font-jakarta font-bold py-2.5 rounded-lg transition-all duration-300 cursor-pointer text-center text-white shadow-xs ${
                  added 
                    ? 'bg-[#C56C4F] scale-[0.98]' 
                    : 'bg-[#704632] hover:bg-[#5b3827]'
                }`}
              >
                {added ? 'Added! ✓' : 'Add to Cart'}
              </button>
              <button 
                onClick={isItemInCart ? (e) => { e.stopPropagation(); router.push('/cart'); } : handleBuyNow}
                className={`flex-1 text-xs font-jakarta font-bold py-2.5 rounded-lg transition-all cursor-pointer text-center text-white shadow-xs ${
                  isItemInCart 
                    ? 'bg-[#56701b] hover:bg-[#435714]' 
                    : 'bg-[#384401] hover:bg-[#252d00]'
                }`}
              >
                {isItemInCart ? 'View in Cart ✓' : 'Buy Now'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}