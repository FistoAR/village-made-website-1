'use client';
import { useState } from 'react';
import Image from 'next/image';
import { Star, ShoppingCart, Minus, Plus } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getVariantPrice, getVariantOriginalPrice } from '@/lib/variantPrice';
import { useApp } from '@/lib/context/AppContext';

export default function ProductsSection() {
  const router = useRouter();
  const { products: dbProducts } = useApp();
  const [quantities, setQuantities] = useState({});
  const [selectedWeights, setSelectedWeights] = useState({});

  const products = [
    {
      id: 'm-1',
      category: 'Malt',
      name: 'Banana Baby Malt',
      description: 'Natural energy drink made with premium banana & grains.',
      rating: 4.7,
      reviews: 128,
      price: 250,
      originalPrice: 330,
      discount: '14% OFF',
      image: '/images/product-section/product-placeholder-rimage.webp',
      weights: ['250g', '500g', '1kg'],
      badge: 'BEST SELLER',
    },
    {
      id: 'm-2',
      category: 'Malt',
      name: 'Sweet Potato Malt',
      description: 'Nutritious energy health drink made of organic sweet potato.',
      rating: 4.8,
      reviews: 94,
      price: 280,
      originalPrice: 350,
      discount: '20% OFF',
      image: '/images/product-section/product-placeholder-rimage.webp',
      weights: ['250g', '500g', '1kg'],
      badge: 'BEST SELLER',
    },
    {
      id: 'hm-2',
      category: 'Health Mix',
      name: 'Multi Millet Health Mix',
      description: 'Traditional health mix loaded with goodness of multi millets.',
      rating: 4.9,
      reviews: 210,
      price: 320,
      originalPrice: 380,
      discount: '15% OFF',
      image: '/images/product-section/product-placeholder-rimage.webp',
      weights: ['250g', '500g', '1kg'],
      badge: 'BEST SELLER',
    },
    {
      id: 'fl-1',
      category: 'Flour',
      name: 'Finger Millet Flour',
      description: 'Pure and stone ground organic ragi flour for healthy recipes.',
      rating: 4.6,
      reviews: 82,
      price: 90,
      originalPrice: 120,
      discount: '25% OFF',
      image: '/images/product-section/product-placeholder-rimage.webp',
      weights: ['500g', '1kg'],
      badge: 'BEST SELLER',
    },
  ];

  const displayProducts = products.map(sp => {
    const dbProd = dbProducts?.find(p => p.id === sp.id);
    if (dbProd) {
      return {
        ...sp,
        price: dbProd.price,
        originalPrice: dbProd.originalPrice,
        discount: dbProd.discount,
        weights: dbProd.weights || sp.weights,
        badge: dbProd.badge || sp.badge,
        stock: dbProd.stock
      };
    }
    return sp;
  });

  const handleQtyChange = (productId, delta) => {
    setQuantities(prev => ({
      ...prev,
      [productId]: Math.max(1, (prev[productId] || 1) + delta),
    }));
  };

  const handleWeightChange = (productId, weight) => {
    setSelectedWeights(prev => ({
      ...prev,
      [productId]: weight,
    }));
  };

  return (
    <section 
      id="products" 
      className="w-full pt-20 pb-36 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-[#F5ECD7]/40"
      style={{ backgroundImage: "url('/images/product-section/products-bg.webp')", backgroundSize: 'cover', backgroundPosition: 'center' }}
    >
      {/* Decorative Leaves Watermark on top-left */}
      <div className="absolute top-12 left-0 w-20 sm:w-30 md:w-30 pointer-events-none z-0 animate-sway-top-left">
        <Image
          src="/images/product-section/top-left-leaf.webp"
          alt="Leaf graphic"
          width={220}
          height={400}
          className="object-contain"
        />
      </div>

      <div className="w-full mx-auto relative z-10 max-w-[90%] sm:max-w-[90%] min-[1700px]:max-w-[80%]">
        {/* Header with Title and Leaf Icon */}
        <div className="flex items-center justify-center gap-2 mb-12 reveal">
          <h2 
            className="text-3xl sm:text-4xl lg:text-[46px] text-[#1a110a] text-center"
            style={{ fontFamily: "'Poetsen One', sans-serif" }}
          >
            Our Products
          </h2>
          <div className="animate-sway-3 shrink-0">
            <Image
              src="/images/product-section/products-leaf.svg"
              alt="Leaf Icon"
              width={48}
              height={44}
              className="w-15 h-18 rotate-[-12deg]"
            />
          </div>
        </div>

        {/* Products Grid - Displaying only 4 products */}
        <div className="flex flex-wrap justify-center gap-6 md:gap-8 w-full">
          {displayProducts.map((product) => {
            const currentQty = quantities[product.id] || 1;
            const firstWeight = (typeof product.weights[0] === 'object' && product.weights[0] !== null && product.weights[0].weight) ? product.weights[0].weight : product.weights[0];
            const currentWeight = selectedWeights[product.id] || firstWeight;
            
            const discount = product.discount;
            const hasDiscount = !!discount && discount !== '0%' && discount !== '0% OFF';
            const displayDiscount = hasDiscount ? discount : undefined;
            
            const currentPrice = getVariantPrice(product.price, currentWeight, product.weights);
            const baseOriginalPrice = product.originalPrice || (hasDiscount ? Math.round(product.price / (1 - (parseInt(discount.replace(/[^0-9]/g, '')) || 20) / 100)) : product.price);
            const currentOriginalPrice = getVariantOriginalPrice(baseOriginalPrice, currentWeight, product.weights);
            return (
              <div 
                key={product.id} 
                onClick={() => router.push(`/products/${product.id}`)}
                className={`w-full sm:w-[calc(50%-12px)] lg:w-[calc(25%-24px)] bg-[#FAF4E6] rounded-[24px] overflow-hidden border border-[#eeddb9] shadow-xs flex flex-col relative z-20 transition-all duration-300 hover:shadow-md cursor-pointer reveal-scale ${
                  product.id === 'm-1' ? 'reveal-delay-100' :
                  product.id === 'm-2' ? 'reveal-delay-200' :
                  product.id === 'hm-2' ? 'reveal-delay-300' : 'reveal-delay-400'
                }`}
              >
                {/* Product Image Area */}
                <div className="w-full aspect-square relative overflow-hidden bg-[#fbf8f2]">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 25vw"
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
                  <span className="text-[#394308] font-jakarta text-sm font-bold pt-12 mb-1">{product.category}</span>
                  <h3 className="text-[#462617] font-jakarta font-bold text-base sm:text-lg mb-1">{product.name}</h3>
                  <p className="text-[#333333] font-jakarta text-sm leading-relaxed mb-3">{product.description}</p>

                  {/* Rating */}
                  <div className="flex items-center gap-1 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${
                          i < 4
                            ? 'fill-[#f3a847] text-[#f3a847]'
                            : 'fill-[#e3d7c3] text-[#e3d7c3]'
                        }`}
                      />
                    ))}
                    <span className="text-[#1a110a] font-jakarta text-xs font-bold ml-1">{product.rating}</span>
                    <span className="text-[#8e7e6f] font-jakarta text-xs">({product.reviews})</span>
                  </div>

                  {/* Pricing */}
                  <div className="flex items-center gap-2 mb-4 h-7">
                    <span className="text-[#1a110a] font-jakarta font-bold text-xl">₹{currentPrice}</span>
                    {hasDiscount && currentOriginalPrice > currentPrice && (
                      <>
                        <span className="text-[#8e7e6f] font-jakarta text-sm line-through">₹{currentOriginalPrice}</span>
                        <span className="bg-[#e2edd3] text-[#384401] font-jakarta text-[10px] font-bold px-1.5 py-0.5 rounded-md">
                          {displayDiscount}
                        </span>
                      </>
                    )}
                  </div>

                  {/* Weight selection and Qty Row */}
                  <div className="flex items-center justify-between gap-1.5 mb-4">
                    <div className="flex items-center gap-1">
                      <span className="text-[#1a110a] font-jakarta text-xs font-bold mr-1">Weight:</span>
                      <div className="flex gap-1">
                        {product.weights.map((w) => {
                          const wName = (typeof w === 'object' && w !== null && w.weight) ? w.weight : w;
                          return (
                            <button
                              key={wName}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleWeightChange(product.id, wName);
                              }}
                              className={`px-2 py-0.5 text-[10px] font-jakarta font-semibold rounded-md border transition-all cursor-pointer ${
                                currentWeight === wName
                                  ? 'bg-[#ede2d3] border-[#cbb396] text-[#3e2c1c]'
                                  : 'bg-white border-[#ebdcc1] text-[#6d5e50] hover:bg-[#fcfbf9]'
                              }`}
                            >
                              {wName}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Quantity selector */}
                    <div className="flex items-center bg-[#faf6eb] border border-[#d2c9b4] rounded-md h-6 px-1 shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleQtyChange(product.id, -1);
                        }}
                        className="w-4 h-4 flex items-center justify-center text-[#3e2c1c] hover:bg-[#ebdcc1]/40 rounded cursor-pointer"
                      >
                        <Minus className="w-2.5 h-2.5" />
                      </button>
                      <span className="font-jakarta text-[11px] font-bold text-[#1a110a] mx-1.5">{currentQty}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleQtyChange(product.id, 1);
                        }}
                        className="w-4 h-4 flex items-center justify-center text-[#3e2c1c] hover:bg-[#ebdcc1]/40 rounded cursor-pointer"
                      >
                        <Plus className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  </div>

                  {/* Actions buttons */}
                  <div className="grid grid-cols-2 gap-2 mt-auto">
                    <button 
                      onClick={(e) => e.stopPropagation()}
                      className="bg-[#6c3a1e] hover:bg-[#562d16] text-white text-xs font-jakarta font-bold py-2.5 rounded-md shadow-xs transition-colors cursor-pointer"
                    >
                      Buy Now
                    </button>
                    <button 
                      onClick={(e) => e.stopPropagation()}
                      className="bg-[#384401] hover:bg-[#2b3501] text-white text-xs font-jakarta font-bold py-2.5 rounded-md flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* View All Products Button */}
        <div className="flex justify-center mt-14 w-full relative z-20">
          <Link href="/products" target='_blank' className="flex items-center gap-2 bg-[#2b3c0c] hover:bg-[#3d5414] text-white font-jakarta font-semibold px-8 py-3.5 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 cursor-pointer text-sm">
            <span>View All Products</span>
          </Link>
        </div>
      </div>

      {/* Decorative Sugarcane Image at the Right Bottom */}
      <div className="absolute right-[-20px] bottom-[-20px] w-48 h-48 sm:w-64 sm:h-64 md:w-80 md:h-[320px] lg:w-[440px] lg:h-[420px] z-0 pointer-events-none animate-sway-1">
        <Image
          src="/images/product-section/product-section-sugarcane.webp"
          alt="Sugarcane and Jaggery decorative graphic"
          fill
          className="object-contain object-bottom object-right"
        />
      </div>
    </section>
  );
}
