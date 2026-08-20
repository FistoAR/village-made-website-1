'use client';

import { use, useState, useMemo, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductCard from '@/components/Product/ProductCard';
import { PRODUCTS, Product } from '@/data/products-list';
import categoriesData from '@/data/categories.json';
import { Star, Minus, Plus, ArrowLeft, Heart, Share2, Calendar, MessageSquare, ChevronDown, ChevronUp, ThumbsUp, ThumbsDown, ShieldCheck, Pencil, Trash2 } from 'lucide-react';
import { Category } from '@/types';
import { useApp } from '@/lib/context/AppContext';
import { getVariantPrice, getVariantOriginalPrice } from '@/lib/variantPrice';

/** Renders N/5 stars with accurate partial fill using SVG linearGradient per star */
function StarRating({ rating, size = 16, gap = 2 }: { rating: number; size?: number; gap?: number }) {
  const uid = `sr-${Math.round(rating * 10)}`;
  return (
    <div className="inline-flex items-center" style={{ gap }}>
      {[...Array(5)].map((_, i) => {
        const fill = Math.min(1, Math.max(0, rating - i));
        const gradId = `${uid}-${i}`;
        return (
          <svg key={i} width={size} height={size} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="0">
                <stop offset={`${fill * 100}%`} stopColor="#f3a847" />
                <stop offset={`${fill * 100}%`} stopColor="#e5e7eb" />
              </linearGradient>
            </defs>
            <polygon
              points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"
              fill={`url(#${gradId})`}
              stroke={fill > 0 ? '#f3a847' : '#d1d5db'}
              strokeWidth="1"
              strokeLinejoin="round"
            />
          </svg>
        );
      })}
    </div>
  );
}

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // Unwrap the params promise
  const { id } = use(params);

  const { addToCart, addProductReview, editProductReview, deleteProductReview, showConfirm, user, cart, products: dbProducts } = useApp();

  const products = useMemo(() => {
    return dbProducts && dbProducts.length > 0 ? dbProducts : (PRODUCTS as unknown as Product[]);
  }, [dbProducts]);

  const categories = categoriesData as Category[];

  // Find the current product
  const product = useMemo(() => {
    return products.find((p) => p.id === id);
  }, [products, id]);

  // Find category name
  const category = useMemo(() => {
    if (!product) return null;
    return categories.find((c) => c.id === product.category.toLowerCase().replace(/\s+/g, '-'));
  }, [categories, product]);

  // Interactive State
  const [quantity, setQuantity] = useState(1);
  const [selectedWeight, setSelectedWeight] = useState('500 g');
  
  const weights = useMemo(() => {
    if (!product || !product.weights) return ['250 g', '500 g', '1 kg'];
    return product.weights.map((w: any) => (typeof w === 'object' && w !== null && w.weight) ? w.weight : w);
  }, [product]);

  useEffect(() => {
    if (product?.weights && product.weights.length > 0) {
      const has500g = product.weights.find((w: any) => {
        const str = (typeof w === 'object' && w !== null && w.weight) ? w.weight : w;
        return str.replace(/\s+/g, '') === '500g';
      });
      const resolvedHas500g = (typeof has500g === 'object' && has500g !== null && has500g.weight) ? has500g.weight : has500g;
      const fallback = (typeof product.weights[0] === 'object' && product.weights[0] !== null && product.weights[0].weight) ? product.weights[0].weight : product.weights[0];
      setSelectedWeight(resolvedHas500g || fallback);
    }
  }, [product]);
  
  // Calculate dynamic variant prices
  const currentPrice = useMemo(() => {
    if (!product) return 0;
    return getVariantPrice(product.price, selectedWeight, product.weights);
  }, [product, selectedWeight]);

  const discount = product?.discount;
  const hasDiscount = !!discount && discount !== '0%' && discount !== '0% OFF';

  const currentOriginalPrice = useMemo(() => {
    if (!product) return 0;
    const baseOriginal = product.originalPrice || (hasDiscount ? Math.round(product.price / (1 - (parseInt(discount!.replace(/[^0-9]/g, '')) || 20) / 100)) : product.price);
    return getVariantOriginalPrice(baseOriginal, selectedWeight, product.weights);
  }, [product, selectedWeight, hasDiscount, discount]);

  const currentStock = useMemo(() => {
    if (!product) return 0;
    if (!product.weights || !Array.isArray(product.weights)) return product.stock;
    const cleanWeight = selectedWeight.toLowerCase().replace(/\s+/g, '');
    const variant = product.weights.find((w: any) => {
      const wName = typeof w === 'object' && w !== null && w.weight ? w.weight : w;
      return typeof wName === 'string' && wName.toLowerCase().replace(/\s+/g, '') === cleanWeight;
    });
    if (typeof variant === 'object' && variant !== null && typeof variant.stock === 'number') {
      return variant.stock;
    }
    return product.stock;
  }, [product, selectedWeight]);

  const similarProducts = useMemo(() => {
    if (!product) return [];
    return products
      .filter((p) => p.category === product.category && p.id !== product.id)
      .slice(0, 4);
  }, [products, product]);

  const [activeTab, setActiveTab] = useState('recipes');
  const [faqOpenIndex, setFaqOpenIndex] = useState<number | null>(0);
  
  const router = useRouter();
  const [added, setAdded] = useState(false);

  // Lazy-load the hero video — only fetch + play when panel is visible
  const detailVideoRef = useRef<HTMLVideoElement>(null);
  const detailVideoWrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const video = detailVideoRef.current;
    const wrap = detailVideoWrapRef.current;
    if (!video || !wrap) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (!video.src) {
            video.src = product?.video || '/videos/products/product-sample-video.webm';
          }
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(wrap);
    return () => observer.disconnect();
  }, [product]);


  const isItemInCart = useMemo(() => {
    if (!product) return false;
    return cart.some(item => 
      item.id === product.id && 
      item.weight.replace(/\s+/g, '') === selectedWeight.replace(/\s+/g, '')
    );
  }, [cart, product, selectedWeight]);

  // Dynamic reviews states
  const [productReviews, setProductReviews] = useState<any[]>([]);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReviewAuthor, setNewReviewAuthor] = useState('');
  const [newReviewTitle, setNewReviewTitle] = useState('');
  const [newReviewComment, setNewReviewComment] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(5.0);

  // Edit review state
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  const [editRating, setEditRating] = useState<number>(5.0);
  const [editTitle, setEditTitle] = useState<string>('');
  const [editComment, setEditComment] = useState<string>('');

  const handleStartEdit = (rev: any) => {
    setEditingReviewId(rev.id);
    setEditRating(rev.rating);
    setEditTitle(rev.title || '');
    setEditComment(rev.comment || '');
  };

  const handleEditSubmit = async (e: React.FormEvent, reviewId: string) => {
    e.preventDefault();
    if (!product || !editComment.trim()) return;
    const res = await editProductReview(product.id, reviewId, editRating, editTitle, editComment);
    if (res && res.success) {
      setEditingReviewId(null);
      fetchProductReviewsFromDb();
    }
  };

  const handleDeleteReview = (reviewId: string) => {
    showConfirm(
      'Delete Review',
      'Are you sure you want to permanently delete your review?',
      async () => {
        if (!product) return;
        const res = await deleteProductReview(product.id, reviewId);
        if (res && res.success) {
          fetchProductReviewsFromDb();
        }
      }
    );
  };

  const getDefaultReviews = () => [
    { author: 'Priya S.', rating: 5, time: '2 days ago', title: 'My baby loves the taste!', comment: 'My baby loves the taste and it mixes easily without lumps. Very healthy and natural product.', helpful: 12 },
    { author: 'Rahul K.', rating: 5, time: '1 week ago', title: 'Good quality and packing', comment: 'Good quality product. Packing is also good and delivery was on time.', helpful: 8 },
    { author: 'Anitha N.', rating: 5, time: '2 weeks ago', title: 'Healthy and easy to prepare', comment: 'Healthy and easy to prepare. My child drinks it daily. Highly recommend it.', helpful: 15 },
    { author: 'Deepa M.', rating: 4, time: '3 weeks ago', title: 'Great nutritional product', comment: 'Really impressed with the quality. My toddler enjoys the taste and I feel good knowing it is made from natural ingredients.', helpful: 6 },
    { author: 'Suresh P.', rating: 5, time: '1 month ago', title: 'Best baby malt we have tried', comment: 'We have tried many brands but this one is the best. Mixes smoothly and has a great natural flavour.', helpful: 21 },
    { author: 'Kavitha R.', rating: 5, time: '1 month ago', title: 'Excellent product, pure and natural', comment: 'No artificial taste at all. My daughter finished the entire pack and is asking for more. Will definitely order again.', helpful: 18 },
  ];

  const fetchProductReviewsFromDb = async () => {
    if (!product) return;
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
      const res = await fetch(`${baseUrl}/products/${product.id}/reviews`);
      const data = await res.json();
      if (data.success && Array.isArray(data.reviews)) {
        setProductReviews(data.reviews);
      } else {
        const allReviews = JSON.parse(localStorage.getItem('village_made_global_reviews') || '{}');
        const customReviews = allReviews[product.id] || [];
        setProductReviews([...customReviews, ...getDefaultReviews()]);
      }
    } catch (e) {
      console.warn("Failed to load reviews from API, falling back:", e);
      const allReviews = JSON.parse(localStorage.getItem('village_made_global_reviews') || '{}');
      const customReviews = allReviews[product.id] || [];
      setProductReviews([...customReviews, ...getDefaultReviews()]);
    }
  };

  useEffect(() => {
    fetchProductReviewsFromDb();
  }, [product]);

  // Set default author name if user is logged in
  useEffect(() => {
    if (user && user.name) {
      setNewReviewAuthor(user.name);
    }
  }, [user]);

  const handleStarClick = (ratingValue: number) => {
    setNewReviewRating(ratingValue);
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product || !newReviewComment.trim()) return;

    const res = await addProductReview(
      product.id,
      newReviewAuthor || user?.name || 'Anonymous',
      newReviewRating,
      newReviewTitle || 'Verified Purchase Review',
      newReviewComment
    );

    if (res && res.success) {
      fetchProductReviewsFromDb();
    }

    // Clear form
    setNewReviewTitle('');
    setNewReviewComment('');
    setNewReviewRating(5.0);
    setShowReviewForm(false);
  };

  const handleAddToCart = () => {
    if (!product) return;
    addToCart({
      id: product.id,
      name: product.name,
      price: currentPrice,
      originalPrice: currentOriginalPrice,
      weight: selectedWeight,
      category: product.category
    }, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const handleBuyNow = () => {
    if (!product) return;
    addToCart({
      id: product.id,
      name: product.name,
      price: currentPrice,
      originalPrice: currentOriginalPrice,
      weight: selectedWeight,
      category: product.category
    }, quantity);
    router.push('/cart');
  };

  const handleShare = async () => {
    if (!product) return;
    const shareData = {
      title: `Village Made - ${product.name}`,
      text: `Check out ${product.name} on Village Made!`,
      url: window.location.href
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert('Link copied to clipboard!');
      }
    } catch (err) {
      console.log('Error sharing:', err);
    }
  };

  // Fallback default details if JSON doesn't provide them
  const displayReviews = productReviews.length;
  const displayRating = productReviews.length > 0
    ? parseFloat((productReviews.reduce((sum, r) => sum + r.rating, 0) / productReviews.length).toFixed(1))
    : (product?.rating || 4.7);
  const displayOriginalPrice = product?.originalPrice || (product?.price ? Math.round(product.price * 1.3) : 290);
  const displayDiscount = product?.discount || '14% OFF';

  // Toggle FAQ Accordion
  const toggleFaq = (index: number) => {
    setFaqOpenIndex(faqOpenIndex === index ? null : index);
  };

  const formatTitleCase = (str: string) => {
    return str.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
  };

  if (!product) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] text-[#3E2C1C] flex flex-col justify-between">
        <Navbar />
        <div className="text-center py-40 max-w-md mx-auto px-6">
          <h2 className="text-3xl font-display font-bold mb-4">Product Not Found</h2>
          <p className="text-stone-500 mb-8">
            The product you are looking for does not exist or has been removed from our village catalog.
          </p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 bg-[#C56C4F] hover:bg-[#8B5A3C] text-white font-bold py-3 px-6 rounded-full transition-colors shadow-md"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Pantry
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#3E2C1C]">
      <Navbar />

      <main className="pt-28 pb-20 px-4 md:px-12 lg:px-24 mx-auto">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-1.5 text-xs text-stone-500 font-jakarta font-medium mb-6 select-none">
          <Link href="/" className="hover:text-[#384401] transition-colors">Home</Link>
          <span>&gt;</span>
          <Link href="/products" className="hover:text-[#384401] transition-colors">{product.category}</Link>
          <span>&gt;</span>
          <span className="text-stone-900 font-bold">{product.name} ({selectedWeight})</span>
        </div>

        {/* Main Details Panel */}
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-[5%] mb-8 md:mb-12 items-stretch justify-between">

          {/* Left Column: Video or Image Showcase */}
          <div className="w-full lg:w-[47.5%] flex flex-col">
            <div className="relative w-full h-full aspect-square sm:aspect-[4/3] lg:aspect-auto min-h-[350px] lg:min-h-0 bg-[#FAF4E6]/20 rounded-[32px] overflow-hidden border border-[#eeddb9]/40 shadow-xs flex-grow flex items-center justify-center" ref={detailVideoWrapRef}>
              {product?.video || (!product?.image) ? (
                <video
                  ref={detailVideoRef}
                  muted
                  loop
                  playsInline
                  preload="none"
                  className="absolute inset-0 w-full h-full object-cover"
                />
              ) : (
                <img
                  src={product.image}
                  alt={product.name}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              )}
            </div>
          </div>

          {/* Right Column: Key Details */}
          <div className="w-full lg:w-[47.5%] flex flex-col">
            <div className="w-full flex flex-col">

              {/* Badge Row & Share Button */}
              <div className="flex justify-between items-start mb-3">
                <div className="flex gap-2">
                  <span className="bg-[#FFECCB] text-[#5C4018] text-[11px] font-bold px-4 py-1.5 rounded-full uppercase tracking-wider font-jakarta">
                    {product.badge || 'Bestseller'}
                  </span>
                  <span className="bg-[#E5ECE0] text-[#3D562C] text-[11px] font-bold px-4 py-1.5 rounded-full uppercase tracking-wider font-jakarta">
                    Kids Favourite
                  </span>
                </div>
                <button onClick={handleShare} className="p-2 text-stone-500 hover:text-stone-800 transition-colors cursor-pointer">
                  <Share2 className="w-5 h-5" />
                </button>
              </div>

              {/* Title */}
              <h1 className="text-2xl sm:text-3xl font-extrabold font-jakarta text-stone-950 mb-2 leading-tight tracking-tight">
                {formatTitleCase(product.name)} <span className="text-stone-600 text-xl sm:text-2xl font-normal font-jakarta">({selectedWeight})</span>
              </h1>

              {/* Tagline */}
              <p className="text-stone-500 font-semibold text-xs sm:text-sm tracking-wide mb-4">
                Nourishing &nbsp;|&nbsp; Tasty &nbsp;|&nbsp; Easy to Digest
              </p>

              {/* Ratings */}
              <div className="flex items-center gap-2 mb-4">
                <StarRating rating={displayRating} size={16} gap={2} />
                <span className="text-stone-900 font-bold text-sm font-jakarta">{displayRating}</span>
                <span className="text-stone-505 text-xs font-semibold">({displayReviews} Reviews)</span>
              </div>

              {/* Stock Status Badge */}
              <div className="mb-5 flex items-center animate-fade-in">
                {product && currentStock > 0 ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-full border border-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    In Stock ({currentStock} units left)
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-800 text-xs font-bold rounded-full border border-red-250 animate-pulse">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                    Out of Stock
                  </span>
                )}
              </div>

              {/* Price Box */}
              <div className="mb-6">
                <div className="flex items-baseline gap-2.5">
                  <span className="text-3xl font-extrabold text-stone-955 font-jakarta">₹{currentPrice}</span>
                  {hasDiscount && currentOriginalPrice > currentPrice && (
                    <>
                      <span className="text-stone-400 line-through text-base">₹{currentOriginalPrice}</span>
                      <span className="text-[#384401] font-extrabold text-base">{discount}</span>
                    </>
                  )}
                </div>
                <span className="text-stone-500 text-xs mt-1 block">Inclusive of all taxes</span>
              </div>

              {/* Key Quality Indicators Bar */}
              <div className="flex flex-wrap items-center justify-between bg-[#FDF6E9] rounded-xl p-3 gap-3 mb-6 w-full">
                {(product.benefits || ['Rich in Calcium', 'No Added Sugar', 'Made with Real Bananas']).map((benefit: any, idx: number) => {
                  const benefitText = typeof benefit === 'object' && benefit !== null ? (benefit.title || '') : String(benefit);
                  let iconSrc = "/images/products/details-page/icon-images/no-added-sugar.svg";
                  const lowerText = benefitText.toLowerCase();
                  if (lowerText.includes('calcium')) iconSrc = "/images/products/details-page/icon-images/rich-in-calcium.svg";
                  else if (lowerText.includes('banana')) iconSrc = "/images/products/details-page/icon-images/made-with-banana.svg";
                  else if (lowerText.includes('digest')) iconSrc = "/images/products/details-page/icon-images/easy-returns.svg";
                  
                  return (
                    <div key={idx} className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-full bg-[#EFE6DB] flex items-center justify-center shrink-0">
                        <img src={iconSrc} alt="" className="w-5 h-5 object-contain" />
                      </div>
                      <span className="text-stone-955 font-bold text-xs font-jakarta">{benefitText}</span>
                    </div>
                  );
                })}
              </div>

              {/* Select Size and Quantity Row */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                {/* Select Size */}
                <div>
                  <span className="text-stone-900 text-sm font-bold block mb-3 font-jakarta">Select Size</span>
                  <div className="flex gap-3">
                    {weights.map((size: string) => (
                      <button
                        key={size}
                        onClick={() => setSelectedWeight(size)}
                        className={`min-w-[90px] py-2.5 px-4 rounded-xl border text-sm font-bold font-jakarta transition-all cursor-pointer ${selectedWeight === size
                          ? 'bg-white border-[#384401] text-[#384401] shadow-xs'
                          : 'bg-white border-[#eeddb9] text-stone-700 hover:bg-[#FAF4E6]/20'
                          }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quantity Counter */}
                <div className="flex flex-col gap-1.5 min-w-[130px]">
                  <span className="text-stone-900 text-xs font-bold font-jakarta">Quantity</span>
                  <div className={`flex items-center justify-between border border-[#eeddb9] rounded-xl h-11 px-4 w-full ${product && currentStock <= 0 ? 'bg-stone-100 opacity-60' : 'bg-white'}`}>
                    <button
                      disabled={!product || currentStock <= 0}
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-1 text-stone-600 hover:text-stone-900 transition-colors cursor-pointer disabled:cursor-not-allowed"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="text-stone-855 font-bold font-jakarta">{product && currentStock <= 0 ? 0 : quantity}</span>
                    <button
                      disabled={!product || currentStock <= 0 || quantity >= currentStock}
                      onClick={() => setQuantity(quantity + 1)}
                      className="p-1 text-stone-600 hover:text-stone-900 transition-colors cursor-pointer disabled:cursor-not-allowed"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Actions Buttons Row */}
              <div className="flex flex-row gap-4 mb-8">
                <button 
                  disabled={!product || currentStock <= 0}
                  onClick={handleAddToCart}
                  className={`flex-1 h-12 text-sm font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 text-white shadow-xs ${
                    !product || currentStock <= 0
                      ? 'bg-stone-300 text-stone-505 cursor-not-allowed'
                      : added 
                        ? 'bg-[#C56C4F] scale-[0.98] cursor-pointer' 
                        : 'bg-[#704632] hover:bg-[#5b3827] cursor-pointer'
                  }`}
                >
                  {!product || currentStock <= 0 ? 'Out of Stock' : added ? 'Added to Cart! ✓' : 'Add to Cart'}
                </button>
                <button 
                  disabled={!product || currentStock <= 0}
                  onClick={isItemInCart ? () => router.push('/cart') : handleBuyNow}
                  className={`flex-1 h-12 text-sm font-bold rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 text-white ${
                    !product || currentStock <= 0
                      ? 'bg-stone-300 text-stone-505 cursor-not-allowed'
                      : isItemInCart 
                        ? 'bg-[#56701b] hover:bg-[#435714] cursor-pointer' 
                        : 'bg-[#384401] hover:bg-[#252d00] cursor-pointer'
                  }`}
                >
                  {!product || currentStock <= 0 ? 'Out of Stock' : isItemInCart ? 'View in Cart ✓' : 'Buy Now'}
                </button>
              </div>

              {/* Value Pros Statement Row */}
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-2 py-4 border-t border-stone-200 text-stone-700 text-xs font-semibold justify-between items-start sm:items-center">
                <div className="flex items-center gap-2.5">
                  <img src="/images/products/details-page/icon-images/carbon_delivery-truck.svg" alt="" className="w-6 h-6 shrink-0 object-contain" />
                  <div className="flex flex-col">
                    <span className="font-bold text-stone-955 text-xs leading-tight">Free Shipping</span>
                    <span className="text-stone-500 text-[10px] font-normal leading-tight">on orders above ₹499</span>
                  </div>
                </div>
                <div className="flex items-center gap-2.5 sm:border-x sm:border-stone-250 sm:px-5">
                  <img src="/images/products/details-page/icon-images/secure-payment.svg" alt="" className="w-6 h-6 shrink-0 object-contain" />
                  <div className="flex flex-col">
                    <span className="font-bold text-stone-955 text-xs leading-tight">Secure Payment</span>
                    <span className="text-stone-500 text-[10px] font-normal leading-tight">100% secure checkout</span>
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  <img src="/images/products/details-page/icon-images/easy-returns.svg" alt="" className="w-6 h-6 shrink-0 object-contain" />
                  <div className="flex flex-col">
                    <span className="font-bold text-stone-955 text-xs leading-tight">Easy Returns</span>
                    <span className="text-stone-500 text-[10px] font-normal leading-tight">7 days return policy</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Menu Header — sticky below navbar */}
        <div className="sticky top-[72px] z-40 bg-[#FDFBF7]/95 backdrop-blur-sm border-b border-[#eeddb9]/40 mb-6 flex md:justify-center pb-3 md:pb-1 -mx-4 md:-mx-12 lg:-mx-24 px-4 md:px-12 lg:px-24">
          <div className="grid grid-cols-2 md:flex md:justify-center gap-x-8 gap-y-3 md:gap-24 w-full md:w-auto">
            {[
              { id: 'recipes', label: 'Recipes' },
              { id: 'ingredients', label: 'Ingredients' },
              { id: 'description', label: 'Description' },
              { id: 'reviews', label: `Reviews (${displayReviews})` },
              { id: 'faq', label: 'FAQ' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 md:py-3 text-sm sm:text-base  cursor-pointer transition-all relative text-center w-full md:w-auto ${activeTab === tab.id
                  ? 'text-[#384401] font-bold'
                  : 'text-stone-700 hover:text-[#384401]'
                  }`}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <span className="absolute bottom-0 left-0 w-full h-[3px] bg-[#384401] rounded-full" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content Display Area */}
        <div className="min-h-[300px]">

          {/* TAB 0: RECIPES */}
          {activeTab === 'recipes' && (
            <div className="w-full font-jakarta p-6 bg-[#FAF4E6]/25 border border-[#eeddb9]/30 rounded-[24px]">
              {(() => {
                const isMalt = (product.category || '').toLowerCase().includes('malt') || product.categoryId === 'malt';
                const list = (product as any).recipes && (product as any).recipes.length > 0
                  ? (product as any).recipes
                  : [
                      {
                        title: isMalt ? 'Premium Healthy Porridge / Malt Drink' : 'Traditional Preparation Method',
                        prepTime: isMalt ? '2 Mins' : '5 Mins',
                        cookTime: isMalt ? '8 Mins' : '15 Mins',
                        ingredients: isMalt
                          ? `2 tbsp ${product.name}, 1 Cup Milk or Water, Sweetener (Jaggery or Palm Sugar) to taste`
                          : `1 Cup Grains/Mix, 2.5 Cups Water, Pinch of Salt`,
                        instructions: isMalt
                          ? `Dissolve 2 tablespoons of ${product.name} in half a cup of cold milk or water to form a smooth slurry without any lumps.\nHeat the remaining milk or water in a sauce pan on medium flame.\nGradually pour the prepared slurry into the pan while stirring constantly to prevent lump formation.\nCook on a low flame for 6-8 minutes, stirring continuously until the mixture thickens.\nRemove from heat, blend in jaggery or palm sugar to taste, and serve warm.`
                          : `Rinse the grains or mix thoroughly under cold running water.\nBring 2.5 cups of water to a boil in a cooking vessel with a pinch of salt.\nAdd the grains/mix to the boiling water, reduce the heat to a simmer, and cover with a lid.\nCook for 12-15 minutes or until the water is completely absorbed and the texture is soft and tender.\nTurn off the flame, let it rest for 2-3 minutes, fluff gently with a spoon, and serve hot.`
                      }
                    ];

                return (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                    {list.map((rec: any, idx: number) => {
                      const ingList = rec.ingredients ? rec.ingredients.split(',').map((s: string) => s.trim()).filter(Boolean) : [];
                      const stepList = rec.instructions ? rec.instructions.split('\n').map((s: string) => s.trim()).filter(Boolean) : [];
                      return (
                        <div key={idx} className="bg-white border border-[#eeddb9]/45 rounded-3xl p-6 md:p-8 shadow-xs hover:shadow-sm transition-all duration-300">
                          <h4 className="text-lg md:text-xl font-extrabold text-[#384401] mb-5 uppercase tracking-wide border-b border-[#eeddb9]/30 pb-3 font-jakarta">
                            {rec.title}
                          </h4>
                          
                          <div className="flex gap-6 mb-6">
                            {rec.prepTime && (
                              <div className="flex flex-col bg-[#FDF8EF] border border-[#B0B49C]/40 rounded-xl px-4 py-2">
                                <span className="text-[10px] text-stone-500 font-bold uppercase tracking-wider">Prep Time</span>
                                <span className="text-sm font-extrabold text-[#384401]">{rec.prepTime}</span>
                              </div>
                            )}
                            {rec.cookTime && (
                              <div className="flex flex-col bg-[#FDF8EF] border border-[#B0B49C]/40 rounded-xl px-4 py-2">
                                <span className="text-[10px] text-stone-500 font-bold uppercase tracking-wider">Cook Time</span>
                                <span className="text-sm font-extrabold text-[#384401]">{rec.cookTime}</span>
                              </div>
                            )}
                          </div>

                          {ingList.length > 0 && (
                            <div className="mb-6">
                              <span className="text-xs font-extrabold text-amber-855 uppercase tracking-widest block mb-2.5">Ingredients Needed</span>
                              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-stone-650 text-xs font-semibold leading-relaxed">
                                {ingList.map((ing: string, i: number) => (
                                  <li key={i} className="flex items-start gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-amber-600 mt-1.5 shrink-0" />
                                    <span>{ing}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {stepList.length > 0 && (
                            <div>
                              <span className="text-xs font-extrabold text-[#C56C4F] uppercase tracking-widest block mb-3 font-jakarta">Cooking Instructions</span>
                              <div className="space-y-4">
                                {stepList.map((step: string, sIdx: number) => (
                                  <div key={sIdx} className="flex gap-3">
                                    <span className="w-5 h-5 rounded-full bg-[#EFE6DB] text-[#384401] flex items-center justify-center font-extrabold text-[10px] shrink-0 font-jakarta mt-0.5">
                                      {sIdx + 1}
                                    </span>
                                    <p className="text-stone-650 text-xs leading-relaxed font-jakarta">
                                      {step}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          )}

          {/* TAB 1: DESCRIPTION */}
          {activeTab === 'description' && (
            <div className="flex flex-col lg:flex-row gap-6 lg:gap-[3%] items-stretch justify-between">
              {/* Left text */}
              <div className="w-full lg:w-[47%] flex flex-col">
                <h3 className="text-xl md:text-2xl font-bold font-jakarta text-[#384401] mb-4 tracking-wide">
                  PRODUCT DESCRIPTION
                </h3>
                <p className="text-stone-800 text-sm leading-relaxed mb-6 font-medium font-jakarta">
                  {product.description || `${formatTitleCase(product.name)} is a wholesome product prepared from premium ingredients to deliver authentic taste and natural nourishment.`}
                </p>

                {/* Sub features list */}
                <div className="flex flex-col gap-5">
                  {(() => {
                    const standardBenefits = {
                      "Traditional Nutrition": {
                        desc: "Prepared using time-honoured recipes with carefully selected ingredients to preserve authentic flavour and natural goodness in every serving.",
                        icon: (
                          <svg className="w-4 h-4 text-[#384401]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 2v4M8 4h8" />
                            <path d="M3 10a9 9 0 0 0 18 0V9H3v1Z" />
                            <path d="M7 19h10" />
                          </svg>
                        )
                      },
                      "Easy to Digest": {
                        desc: "A smooth and nourishing malt drink that is gentle on the stomach, making it suitable for regular consumption by the whole family.",
                        icon: (
                          <svg className="w-4 h-4 text-[#384401]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 3a9 9 0 0 0-9 9c0 4.97 4.03 9 9 9s9-4.03 9-9" />
                            <path d="M12 8v8M9 12h6" />
                          </svg>
                        )
                      },
                      "Natural Goodness": {
                        desc: "Made without artificial colours or preservatives, ensuring a healthier choice with trusted quality and freshness.",
                        icon: (
                          <svg className="w-4 h-4 text-[#384401]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                            <path d="m9 11 2 2 4-4" />
                          </svg>
                        )
                      }
                    };

                    const benefitsList = product.benefits && product.benefits.length > 0
                      ? product.benefits
                      : ['Traditional Nutrition', 'Easy to Digest', 'Natural Goodness'];

                    return benefitsList.map((item: any, bIdx: number) => {
                      const title = typeof item === 'object' && item !== null ? item.title : String(item);
                      const customDesc = typeof item === 'object' && item !== null ? item.description : null;
                      const customIcon = typeof item === 'object' && item !== null ? item.icon : null;
                      
                      const iconMap = {
                        bowl: (
                          <svg className="w-4 h-4 text-[#384401]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 2v4M8 4h8" />
                            <path d="M3 10a9 9 0 0 0 18 0V9H3v1Z" />
                            <path d="M7 19h10" />
                          </svg>
                        ),
                        digest: (
                          <svg className="w-4 h-4 text-[#384401]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 3a9 9 0 0 0-9 9c0 4.97 4.03 9 9 9s9-4.03 9-9" />
                            <path d="M12 8v8M9 12h6" />
                          </svg>
                        ),
                        shield: (
                          <svg className="w-4 h-4 text-[#384401]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                            <path d="m9 11 2 2 4-4" />
                          </svg>
                        ),
                        leaf: (
                          <svg className="w-4 h-4 text-[#384401]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 3.5 1 8a7 7 0 0 1-9 10Z" />
                            <path d="M9 22v-4" />
                          </svg>
                        )
                      };

                      // Match standard
                      const matched = standardBenefits[title as keyof typeof standardBenefits] || {
                        desc: customDesc || "Delivering authentic quality and pure nutrition in every bite.",
                        icon: (
                          <svg className="w-4 h-4 text-[#384401]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10" />
                            <path d="m9 12 2 2 4-4" />
                          </svg>
                        )
                      };

                      const displayIcon = (customIcon && iconMap[customIcon as keyof typeof iconMap]) || matched.icon;

                      return (
                        <div key={bIdx} className="flex gap-3">
                          <span className="w-8 h-8 rounded-full bg-[#EFE6DB] flex items-center justify-center shrink-0">
                            {displayIcon}
                          </span>
                          <div className="flex flex-col">
                            <span className="text-[#384401] font-bold text-xs sm:text-sm font-jakarta">{title}</span>
                            <span className="text-stone-605 text-xs font-jakarta leading-relaxed mt-0.5">{customDesc || matched.desc}</span>
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>

              {/* Center graphic image */}
              <div className="w-full lg:w-[28%] flex flex-col">
                <div className="relative w-full h-full aspect-square sm:aspect-[4/3] lg:aspect-auto min-h-[320px] lg:min-h-0 rounded-[24px] overflow-hidden shadow-sm flex-grow">
                  <Image
                    src={(product as any).descriptionImage || "/images/products/details-page/description-image-1.webp"}
                    alt={`${product.name} showcase`}
                    fill
                    sizes="(max-width: 1024px) 100vw, 28vw"
                    className="object-cover"
                  />
                </div>
              </div>

              {/* Right metadata shelf box */}
              <div className="w-full lg:w-[22%] flex flex-col gap-6 justify-between">
                {/* shelf life */}
                <div className="bg-[#FDF8EF] border border-[#B0B49C] rounded-[20px] p-4 flex gap-3 items-start shadow-2xs">
                  <div className="w-8 h-8 rounded-full bg-[#EAE9D5] shrink-0 text-[#384401] flex items-center justify-center">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[#384401] text-sm font-bold uppercase tracking-wider font-jakarta">Shelf Life</span>
                    <span className="text-[#384401] font-extrabold text-sm mt-0.5 tracking-wider">{(product as any).shelfLife || "6 Months"}</span>
                    <span className="text-stone-900 text-xs leading-normal mt-1">{(product as any).shelfLifeDetails || `Best before ${(product as any).shelfLife || "6 Months"} from the date of manufacturing.`}</span>
                  </div>
                </div>

                {/* suitable for */}
                <div className="border border-[#DFB684] bg-[#FDF8EF] rounded-[20px] p-4 shadow-2xs flex-grow">
                  <span className="text-[#C56C4F] text-xs font-extrabold uppercase tracking-widest block mb-3 font-jakarta">Suitable For</span>
                  <div className="flex flex-col gap-4">
                    {(() => {
                      const suitableList = (product as any).suitableFor && (product as any).suitableFor.length > 0
                        ? (product as any).suitableFor
                        : [
                            { label: 'Babies', value: '6+ Months*' },
                            { label: 'Toddlers', value: '1-3 Years' },
                            { label: 'Growing Kids', value: '4+ Years' }
                          ];
                      return suitableList.map((target: any, tIdx: number) => {
                        const labelLower = (target.label || '').toLowerCase();
                        let imgPath = '/images/products/details-page/suitable-persons/growing-kids.webp';
                        if (labelLower.includes('baby') || labelLower.includes('babies')) {
                          imgPath = '/images/products/details-page/suitable-persons/babies.webp';
                        } else if (labelLower.includes('toddler')) {
                          imgPath = '/images/products/details-page/suitable-persons/toddlers.webp';
                        }
                        return (
                          <div key={tIdx} className="flex items-center gap-2.5">
                            <img src={imgPath} alt="" className="w-9 h-9 pt-0.5 rounded-full object-cover border border-[#DFB684]" />
                            <div className="flex flex-col">
                              <span className="text-black font-bold text-xs font-jakarta">{target.label}</span>
                              <span className="text-stone-850 text-xs font-jakarta">{target.value}</span>
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: INGREDIENTS */}
          {activeTab === 'ingredients' && (
            <div className="w-full font-jakarta text-sm font-semibold text-stone-850 p-6 bg-[#FAF4E6]/25 border border-[#eeddb9]/30 rounded-[24px]">
              {(() => {
                const ing = product.ingredients;
                if (ing && !Array.isArray(ing) && typeof ing === 'object') {
                  const ingObj = ing as any;
                  const desktopUrl = ingObj.desktop || "/images/products/details-page/ingredients-image.webp";
                  let tabletUrl = desktopUrl;
                  if (!ingObj.useSameForTab) {
                    tabletUrl = ingObj.tablet || desktopUrl;
                  }
                  let mobileUrl = desktopUrl;
                  if (ingObj.useSameForMobile === 'tablet') {
                    mobileUrl = tabletUrl;
                  } else if (ingObj.useSameForMobile === 'none') {
                    mobileUrl = ingObj.mobile || desktopUrl;
                  }
                  return (
                    <picture className="w-full">
                      <source media="(max-width: 639px)" srcSet={mobileUrl} />
                      <source media="(max-width: 1023px)" srcSet={tabletUrl} />
                      <img
                        src={desktopUrl}
                        alt="Ingredients infographics"
                        className="w-full h-auto rounded-2xl object-cover"
                      />
                    </picture>
                  );
                } else if (Array.isArray(ing) && ing.length > 0) {
                  return (
                    <div className="flex flex-col gap-3">
                      <span className="text-[#384401] font-black uppercase text-xs sm:text-sm tracking-wider mb-2 block">Catalog Ingredients</span>
                      <div className="flex flex-wrap gap-2.5">
                        {ing.map((ingredient: string, idx: number) => (
                          <span key={idx} className="bg-white border border-[#eeddb9] text-[#704632] px-4.5 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold shadow-2xs">
                            {ingredient}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                } else {
                  return (
                    <img
                      src="/images/products/details-page/ingredients-image.webp"
                      alt="Ingredients infographics"
                      className="w-full h-auto rounded-2xl"
                    />
                  );
                }
              })()}
            </div>
          )}

          {/* TAB 3: REVIEWS */}
          {activeTab === 'reviews' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
              {/* Left statistics card summary */}
              <div className="lg:col-span-4 flex flex-col gap-5">
                <h3 className="text-base font-bold font-jakarta text-[#384401] mb-2 tracking-wide uppercase">Customer Reviews</h3>
                
                <div className="flex items-center gap-3">
                  <span className="text-4xl font-black text-[#384401] font-jakarta">{displayRating}</span>
                  <StarRating rating={displayRating} size={16} gap={2} />
                </div>
                <span className="text-stone-900 text-xs font-medium font-jakarta -mt-2">Based on {displayReviews} verified reviews</span>

                {/* Rating bars */}
                <div className="w-full flex flex-col gap-4 mt-2">
                  {[
                    { stars: 5, pct: '92%', count: 118 },
                    { stars: 4, pct: '6%', count: 8 },
                    { stars: 3, pct: '1%', count: 1 },
                    { stars: 2, pct: '1%', count: 1 },
                    { stars: 1, pct: '0%', count: 0 }
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between text-sm font-bold font-jakarta text-stone-900">
                      <span className="w-6 text-left">{item.stars} ★</span>
                      <div className="flex-1 mx-3 h-2 bg-stone-200 rounded-full overflow-hidden">
                        <div className="h-full bg-[#384401] rounded-full" style={{ width: item.pct }} />
                      </div>
                      <span className="w-8 text-right text-stone-600 font-bold">{item.pct}</span>
                      <span className="w-10 text-right text-stone-700 font-normal">({item.count})</span>
                    </div>
                  ))}
                </div>

                {/* Verified reviews block */}
                <div className="flex items-center gap-6 py-4 px-10 bg-[#F5F6EF] rounded-[16px] border border-[#DBDBDB] mt-4 shadow-2xs">
                  <div className="text-[#384401] shrink-0">
                    <svg className="w-8 h-8" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M6 9.3V24C6 38.7 24 45 24 45C24 45 42 38.7 42 24V9.3L24 3L6 9.3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="square"/>
                      <path d="M16.3477 22.3455L22.0017 28.0015L33.3157 16.6875" stroke="currentColor" strokeWidth="2" strokeLinecap="square"/>
                    </svg>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-black font-medium text-sm font-jakarta">All reviews are from</span>
                    <span className="text-[#3B5001] font-semibold text-md font-jakarta">Verified purchases</span>
                  </div>
                </div>

                {/* Write a review box */}
                <div className="p-5 bg-[#FCF9F5] border border-[#DBDBDB] rounded-[16px] mt-2 shadow-2xs">
                  <span className="text-stone-900 font-bold text-sm block mb-1 font-jakarta">Share your experience</span>
                  <span className="text-stone-900 text-xs block mb-5 font-jakarta">Your review helps other parents make the right choice.</span>
                  
                  {!user ? (
                    <div className="text-center py-2">
                      <p className="text-xs text-stone-500 font-semibold mb-3 font-jakarta">Please log in to share your experience with this provision.</p>
                      <button
                        onClick={() => router.push(`/login?redirect=/products/${product.id}`)}
                        className="w-full py-2.5 bg-[#704632] hover:bg-[#5b3827] text-white text-xs font-bold uppercase rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-xs font-jakarta"
                      >
                        Log In to Write Review
                      </button>
                    </div>
                  ) : !showReviewForm ? (
                    <button
                      onClick={() => setShowReviewForm(true)}
                      className="w-full py-2.5 bg-[#384401] hover:bg-[#252d00] text-white font-bold text-xs uppercase rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-xs font-jakarta"
                    >
                      <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" /></svg>
                      Write a Review
                    </button>
                  ) : (
                    <form onSubmit={handleReviewSubmit} className="flex flex-col gap-3 mt-2 border-t border-stone-200 pt-4 font-jakarta text-xs text-stone-900">
                      
                      {/* Name input */}
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-stone-700 uppercase tracking-wide block">Your Name</label>
                        <input
                          type="text"
                          required
                          value={newReviewAuthor}
                          onChange={(e) => setNewReviewAuthor(e.target.value)}
                          readOnly={true}
                          placeholder="e.g. Priyan"
                          className="w-full h-9 px-3 bg-white border border-[#eeddb9]/80 focus:border-[#384401] rounded-lg text-xs"
                        />
                      </div>

                      {/* Rating GUI star selector + decimal inputs */}
                      <div className="flex flex-col gap-1.5 my-1">
                        <label className="text-[10px] font-bold text-stone-700 uppercase tracking-wide block">Rating *</label>
                        <div className="flex items-center gap-3">
                          {/* Visual Star GUI */}
                          <div className="flex text-[#f3a847] gap-1 select-none">
                            {[1, 2, 3, 4, 5].map((val) => (
                              <button
                                type="button"
                                key={val}
                                onClick={() => handleStarClick(val)}
                                className="focus:outline-none hover:scale-110 transition-transform cursor-pointer"
                                title={`Rate ${val} Stars`}
                              >
                                <Star 
                                  className={`w-5.5 h-5.5 fill-current ${
                                    val <= Math.round(newReviewRating) ? 'text-[#f3a847]' : 'text-stone-200'
                                  }`}
                                />
                              </button>
                            ))}
                          </div>
                          
                          {/* Point input (keyboard support) */}
                          <div className="flex items-center gap-1 shrink-0">
                            <input
                              type="number"
                              min="1"
                              max="5"
                              step="0.1"
                              value={newReviewRating}
                              onChange={(e) => {
                                const num = parseFloat(e.target.value);
                                if (!isNaN(num) && num >= 1 && num <= 5) {
                                  setNewReviewRating(num);
                                }
                              }}
                              className="w-12 h-7 px-1.5 border border-[#DBDBDB] bg-white rounded-md text-xs font-bold text-center text-stone-900 focus:outline-none"
                            />
                            <span className="text-[9px] text-stone-600 font-bold uppercase tracking-wide">Points</span>
                          </div>
                        </div>
                      </div>

                      {/* Title input */}
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-stone-700 uppercase tracking-wide block">Review Title</label>
                        <input
                          type="text"
                          value={newReviewTitle}
                          onChange={(e) => setNewReviewTitle(e.target.value)}
                          placeholder="e.g. Highly nutritious and tasty"
                          className="w-full h-9 px-3 bg-white border border-[#eeddb9]/80 focus:border-[#384401] rounded-lg text-xs"
                        />
                      </div>

                      {/* Comment textarea */}
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-stone-700 uppercase tracking-wide block">Comment *</label>
                        <textarea
                          required
                          rows={3}
                          value={newReviewComment}
                          onChange={(e) => setNewReviewComment(e.target.value)}
                          placeholder="What did you like or dislike about this provision?"
                          className="w-full px-3 py-2 bg-white border border-[#eeddb9]/80 focus:border-[#384401] rounded-lg text-xs resize-none"
                        />
                      </div>

                      {/* Form CTAs */}
                      <div className="flex gap-2 justify-end mt-1">
                        <button
                          type="button"
                          onClick={() => setShowReviewForm(false)}
                          className="bg-white border border-[#eeddb9] hover:bg-[#FAF4E6]/50 text-stone-750 font-bold px-3 py-1.5 rounded-lg text-[10px] transition-colors cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="bg-[#384401] hover:bg-[#252d00] text-white font-bold px-3 py-1.5 rounded-lg text-[10px] transition-colors cursor-pointer"
                        >
                          Submit Review
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </div>

              {/* Right reviews stream — 2 per row on desktop */}
              <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-5">
                {productReviews.map((rev, idx) => {
                  const getInitials = (name: string) => {
                    const parts = name.split(' ');
                    if (parts.length >= 2) {
                      return (parts[0][0] + parts[1][0]).toUpperCase();
                    }
                    return name.substring(0, 2).toUpperCase();
                  };

                  const isMyReview = user && user.reviews?.some(ur => ur.id === rev.id);

                  if (editingReviewId === rev.id) {
                    return (
                      <form 
                        key={idx} 
                        onSubmit={(e) => handleEditSubmit(e, rev.id)} 
                        className="bg-[#FEFAF5] border border-[#384401] rounded-[20px] p-5 flex flex-col shadow-xs gap-3 font-jakarta"
                      >
                        <h4 className="text-xs font-black text-stone-950 uppercase tracking-wider">Edit Your Review</h4>
                        
                        {/* Edit Rating */}
                        <div className="flex items-center gap-3">
                          <div className="flex text-[#f3a847] gap-1 select-none">
                            {[1, 2, 3, 4, 5].map((val) => (
                              <button
                                type="button"
                                key={val}
                                onClick={() => setEditRating(val)}
                                className="focus:outline-none hover:scale-110 transition-transform cursor-pointer"
                              >
                                <Star 
                                  className={`w-4 h-4 fill-current ${
                                    val <= Math.round(editRating) ? 'text-[#f3a847]' : 'text-stone-200'
                                  }`}
                                />
                              </button>
                            ))}
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <input
                              type="number"
                              min="1"
                              max="5"
                              step="0.1"
                              value={editRating}
                              onChange={(e) => {
                                const num = parseFloat(e.target.value);
                                if (!isNaN(num) && num >= 1 && num <= 5) setEditRating(num);
                              }}
                              className="w-10 h-6 border border-stone-300 bg-white rounded text-[10px] font-bold text-center text-stone-900"
                            />
                            <span className="text-[8px] text-stone-500 font-bold uppercase tracking-wider">Pts</span>
                          </div>
                        </div>

                        {/* Edit Title */}
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          placeholder="Review Title"
                          className="w-full h-8 px-3 bg-white border border-[#eeddb9]/80 focus:border-[#384401] rounded-lg text-xs"
                        />

                        {/* Edit Comment */}
                        <textarea
                          required
                          rows={2}
                          value={editComment}
                          onChange={(e) => setEditComment(e.target.value)}
                          placeholder="Comment"
                          className="w-full px-3 py-1.5 bg-white border border-[#eeddb9]/80 focus:border-[#384401] rounded-lg text-xs resize-none"
                        />

                        {/* Buttons */}
                        <div className="flex gap-2 justify-end">
                          <button
                            type="button"
                            onClick={() => setEditingReviewId(null)}
                            className="bg-white border border-[#eeddb9] hover:bg-[#FAF4E6]/50 text-stone-750 font-bold px-3 py-1 rounded-md text-[9px] cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="bg-[#384401] hover:bg-[#252d00] text-white font-bold px-3 py-1 rounded-md text-[9px] cursor-pointer"
                          >
                            Save
                          </button>
                        </div>
                      </form>
                    );
                  }

                  return (
                    <div key={idx} className="bg-[#FEFAF5] border border-[#939393] rounded-[20px] p-5 flex flex-col shadow-2xs">
                      {/* Avatar row */}
                      <div className="flex items-center justify-between mb-3 gap-2">
                        <div className="flex items-center gap-3">
                          <span className="w-9 h-9 rounded-full bg-[#EFE6DB] text-[#384401] flex items-center justify-center font-bold text-xs uppercase select-none font-jakarta">
                            {getInitials(rev.author)}
                          </span>
                          <div className="flex flex-col">
                            <span className="font-bold text-stone-900 text-xs sm:text-sm font-jakarta">{rev.author}</span>
                            <span className="text-stone-700 text-[10px] font-jakarta">{rev.time || '1 day ago'}</span>
                          </div>
                        </div>

                        {/* Edit & Delete Action Buttons */}
                        {isMyReview && (
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              onClick={() => handleStartEdit(rev)}
                              className="p-1 text-stone-500 hover:text-[#384401] hover:bg-[#FAF4E6]/60 rounded-lg transition-colors cursor-pointer"
                              title="Edit Review"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteReview(rev.id)}
                              className="p-1 text-stone-500 hover:text-red-750 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                              title="Delete Review"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Stars row — filled + empty up to 5 */}
                      <div className="flex text-[#f3a847] gap-0.5 mb-3 items-center">
                        <div className="flex text-[#f3a847] gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3.5 h-3.5 fill-current ${
                                i < Math.round(rev.rating) ? 'text-[#f3a847]' : 'text-stone-200'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-[10px] font-bold text-stone-900 ml-1.5 bg-[#FAF4E6] px-1.5 py-0.5 rounded border border-[#eeddb9] font-jakarta">
                          {rev.rating}★
                        </span>
                      </div>

                      {/* Title and comment */}
                      <h4 className="font-bold text-stone-950 text-sm mb-1.5 font-jakarta">{rev.title}</h4>
                      <p className="text-stone-700 text-xs leading-relaxed mb-4 font-jakarta flex-1">{rev.comment}</p>

                      {/* Was this helpful feedback row */}
                      <div className="flex items-center gap-3 text-stone-750 text-xs self-end mt-auto">
                        <span>Was this helpful?</span>
                        <button className="flex items-center gap-1.5 hover:text-stone-900 transition-colors cursor-pointer font-jakarta">
                          <ThumbsUp className="w-4 h-4 text-stone-900" />
                          <span className="font-bold text-stone-700">{rev.helpful || 0}</span>
                        </button>
                        <span className="text-stone-300">|</span>
                        <button className="flex items-center gap-1.5 hover:text-stone-900 transition-colors cursor-pointer font-jakarta">
                          <ThumbsDown className="w-4 h-4 text-stone-900" />
                          <span className="font-bold text-stone-700">0</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>


            </div>
          )}

          {/* TAB 4: FAQ */}
          {activeTab === 'faq' && (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
                
                {/* Left features sidebar */}
                <div className="lg:col-span-4 flex flex-col gap-3">
                  <h3 className="text-base font-bold font-jakarta text-[#384401] mb-1 tracking-wide uppercase">
                    FREQUENTLY ASKED QUESTIONS
                  </h3>
                  <p className="text-stone-900 text-xs sm:text-sm mb-2 font-jakarta">
                    Find answer to common questions about <span className="font-extrabold text-stone-900">{formatTitleCase(product.name)}</span>.
                  </p>

                  <div className="border border-stone-400/80 rounded-2xl p-6 flex flex-col gap-5 bg-[#FAF9F5] shadow-2xs">
                    <h3 className="text-stone-900 font-extrabold text-md font-jakarta">Got Questions?</h3>
                    {/* Short accent green line */}
                    <div className="w-10 h-[2px] bg-[#384401] -mt-3" />
                    
                    <p className="text-gray-900 text-xs sm:text-sm font-jakarta leading-relaxed">
                      We&apos;re here to help! Browse through common questions or reach out to us anytime.
                    </p>
                    
                    {/* Full-width divider line */}
                    <div className="w-full h-[1.5px] bg-[#384401]/20 my-1" />

                    <div className="flex items-center gap-4 mb-1">
                      <div className="w-11 h-11 rounded-full bg-[#EAE9D5] text-stone-900 flex items-center justify-center shrink-0 shadow-2xs">
                        <svg className="w-5 h-5" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M6.66602 27.9998C7.33268 21.9998 9.99935 17.3332 15.9993 14.6665" stroke="black" strokeWidth="2.66667" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M11.9998 23.9999C20.2905 23.9999 25.9998 19.6159 26.6665 7.99992V5.33325H21.3145C9.31445 5.33325 5.33312 10.6666 5.31445 17.3333C5.31445 18.6666 5.31445 21.3333 7.98112 23.9999H11.9998Z" stroke="black" strokeWidth="2.66667" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[#384401] font-bold text-sm sm:text-base font-jakarta">Natural Ingredients</span>
                        <span className="text-stone-900 text-xs sm:text-sm font-jakarta leading-relaxed mt-0.5">Made with natural grains, cereals and nuts.</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 mb-1">
                      <div className="w-11 h-11 rounded-full bg-[#EAE9D5] text-stone-900 flex items-center justify-center shrink-0 shadow-2xs">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="black" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[#384401] font-bold text-sm sm:text-base font-jakarta">Safe & Health</span>
                        <span className="text-stone-900 text-xs sm:text-sm font-jakarta leading-relaxed mt-0.5">No added preservatives, artificial flavours or colours.</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 mb-1">
                      <div className="w-11 h-11 rounded-full bg-[#EAE9D5] text-stone-900 flex items-center justify-center shrink-0 shadow-2xs">
                        <svg className="w-5 h-5" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M13.334 21.3333C14.0007 21.7333 14.934 22 16.0007 22C17.0673 22 18.0007 21.7333 18.6673 21.3333M20.0007 16H20.014" stroke="black" strokeWidth="2.66667" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M25.8403 9.084C26.7751 10.4432 27.4197 11.9805 27.7337 13.6C28.1845 13.8184 28.5647 14.1593 28.8308 14.5838C29.0968 15.0082 29.238 15.499 29.238 16C29.238 16.501 29.0968 16.9918 28.8308 17.4162C28.5647 17.8407 28.1845 18.1816 27.7337 18.4C27.158 21.0846 25.6792 23.4907 23.5439 25.2167C21.4086 26.9427 18.746 27.8843 16.0003 27.8843C13.2547 27.8843 10.592 26.9427 8.45674 25.2167C6.32144 23.4907 4.8426 21.0846 4.26699 18.4C3.81613 18.1816 3.4359 17.8407 3.16985 17.4162C2.9038 16.9918 2.7627 16.501 2.7627 16C2.7627 15.499 2.9038 15.0082 3.16985 14.5838C3.4359 14.1593 3.81613 13.8184 4.26699 13.6C4.81934 10.894 6.28818 8.46136 8.42569 6.71249C10.5632 4.96362 13.2385 4.00557 16.0003 4C18.667 4 20.667 5.46667 20.667 7.33333C20.667 9.2 19.467 10.6667 18.0003 10.6667C16.9337 10.6667 16.0003 10.1333 16.0003 9.33333M12.0003 16H12.0137" stroke="black" strokeWidth="2.66667" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[#384401] font-bold text-sm sm:text-base font-jakarta">Made for Babies</span>
                        <span className="text-stone-900 text-xs sm:text-sm font-jakarta leading-relaxed mt-0.5">Specially formulated for babies and young children.</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Accordion Questions list */}
                <div className="lg:col-span-8 flex flex-col gap-4">
                  {(product.faqs && product.faqs.length > 0
                    ? product.faqs
                    : [
                        { q: `What is ${formatTitleCase(product.name)}?`, a: `${formatTitleCase(product.name)} is a nutritional health mix specially made for babies and toddlers. It is prepared using carefully selected natural ingredients such as banana, cereals, millets, pulses, and nuts to support healthy growth and daily nutrition.` },
                        { q: `From what age can my baby have ${formatTitleCase(product.name)}?`, a: 'Suitable for babies 6 months and above after starting solid foods.' },
                        { q: `How do I prepare ${formatTitleCase(product.name)}?`, a: 'Mix with water or milk, cook for 5-7 minutes, and serve warm.' },
                        { q: `Can I give ${formatTitleCase(product.name)} every day?`, a: 'Yes, it can be included in your baby\'s daily balanced diet.' },
                        { q: `Does it contain sugar or preservatives?`, a: 'No. It contains no artificial preservatives, colours, or flavours.' }
                      ]
                  ).map((faq: { q: string; a: string }, idx: number) => {
                    const isOpen = faqOpenIndex === idx;
                    return (
                      <div 
                        key={idx} 
                        className={`border border-stone-200/80 rounded-[16px] transition-all duration-300 p-5 shadow-2xs ${
                          isOpen ? 'bg-[#FAF9F5]' : 'bg-white'
                        }`}
                      >
                        <div
                          onClick={() => toggleFaq(idx)}
                          className="w-full flex items-center justify-between cursor-pointer select-none"
                        >
                          <div className="flex items-center gap-4 flex-1">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all ${
                              isOpen ? 'bg-[#A45338] text-white' : 'border border-[#384401]/50 text-[#384401]'
                            }`}>
                              {isOpen ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                            </div>
                            <span className={`text-sm sm:text-base font-bold font-jakarta transition-colors ${
                              isOpen ? 'text-[#A45338]' : 'text-stone-900'
                            }`}>{faq.q}</span>
                          </div>
                          {!isOpen && (
                            <ChevronDown className="w-5 h-5 text-stone-900 shrink-0 ml-4" />
                          )}
                        </div>
                        <div className={`grid transition-all duration-300 ease-in-out ${
                          isOpen ? 'grid-rows-[1fr] opacity-100 mt-2' : 'grid-rows-[0fr] opacity-0'
                        }`}>
                          <div className="overflow-hidden">
                            <div className="pl-12 text-[#0D0D0D] text-xs sm:text-sm leading-relaxed font-jakarta">
                              {faq.a}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

              </div>

              {/* Bottom Support links bar */}
                <div className="bg-[#FAF6EE] border border-stone-200 rounded-[20px] p-4 grid grid-cols-1 md:grid-cols-4 gap-4 mt-12 divide-y md:divide-y-0 md:divide-x divide-stone-200">
                  {/* Box 1 */}
                  <div className="flex items-center gap-2.5 pr-2 py-2 md:py-0">
                    <img src="/images/products/details-page/icon-images/faq-icons/headphone.svg" alt="Headphones" className="w-9 h-9 shrink-0 object-contain" />
                    <div className="flex flex-col">
                      <span className="text-stone-900 font-extrabold text-xs font-jakarta tracking-wide">Still Have Questions?</span>
                      <span className="text-stone-900 text-[10px] font-jakarta opacity-80 mt-0.5 font-medium">We&apos;re here to help you!</span>
                    </div>
                  </div>

                  {/* Box 2 */}
                  <div className="flex items-center gap-2.5 px-2 md:pl-5 py-3 md:py-0">
                    <img src="/images/products/details-page/icon-images/faq-icons/whatsapp.svg" alt="WhatsApp" className="w-9 h-9 shrink-0 object-contain" />
                    <div className="flex flex-col">
                      <span className="text-stone-900 font-extrabold text-xs font-jakarta tracking-wide">Chart on Watsapp</span>
                      <a href="https://wa.me/919876543210" target="_blank" rel="noopener noreferrer" className="text-stone-900 text-[10px] font-jakarta opacity-80 mt-0.5 font-medium hover:underline hover:text-[#384401] transition-colors">
                        +91 98765 43210
                      </a>
                    </div>
                  </div>

                  {/* Box 3 */}
                  <div className="flex items-center gap-2.5 px-2 md:pl-5 py-3 md:py-0">
                    <img src="/images/products/details-page/icon-images/faq-icons/email.svg" alt="Email" className="w-9 h-9 shrink-0 object-contain" />
                    <div className="flex flex-col">
                      <span className="text-stone-900 font-extrabold text-xs font-jakarta tracking-wide">Email Us</span>
                      <a href="mailto:support@villagemade.com" className="text-stone-900 text-[10px] font-jakarta opacity-80 mt-0.5 font-medium hover:underline hover:text-[#384401] transition-colors">
                        support@villagemade.com
                      </a>
                    </div>
                  </div>

                  {/* Box 4 */}
                  <div className="flex items-center gap-2.5 pl-2 md:pl-5 py-2 md:py-0">
                    <img src="/images/products/details-page/icon-images/faq-icons/customer-support.svg" alt="Support" className="w-9 h-9 shrink-0 object-contain" />
                    <div className="flex flex-col">
                      <span className="text-stone-900 font-extrabold text-xs font-jakarta tracking-wide">Customer Support</span>
                      <span className="text-stone-900 text-[10px] font-jakarta opacity-80 mt-0.5 font-medium">Mon - Sat: 9 AM - 6 PM</span>
                    </div>
                  </div>

                </div>
            </>
          )}

        </div>

        {/* Similar Products */}
        {similarProducts.length > 0 && (
          <div className="w-full mt-16 mb-8 font-jakarta">
            <div className="border-t border-[#eeddb9]/60 pt-12">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-stone-900 uppercase tracking-tight">You May Also Like</h2>
                  <p className="text-xs sm:text-sm text-stone-500 font-semibold mt-1">Discover other hand-crafted, nutrient-rich provisions from our {product?.category} range.</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {similarProducts.map((p) => (
                  <ProductCard key={p.id} product={p as any} />
                ))}
              </div>
            </div>
          </div>
        )}

      </main>

      <Footer />
    </div>
  );
}
