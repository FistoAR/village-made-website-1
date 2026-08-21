'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { X } from 'lucide-react';
import HeroSection from '@/components/Hero/HeroSection';
import AboutSection from '@/components/AboutSection';
import WhyChooseSection from '@/components/WhyChooseSection';
import ProductsSection from '@/components/ProductsSection';
import GallerySection from '@/components/GallerySection';
import CertificationSection from '@/components/CertificationSection';
import TestimonialsSection from '@/components/TestimonialsSection';
import MaltBannerSection from '@/components/MaltBannerSection';
import OurProcessSection from '@/components/OurProcessSection';
import Footer from '@/components/Footer';
import { useApp } from '@/lib/context/AppContext';
import { PRODUCTS } from '@/data/products-list';

// Helper to parse DD/MM/YYYY or standard ISO dates
const parseDateStr = (dateStr: string): Date | null => {
  if (!dateStr) return null;
  let d = new Date(dateStr);
  if (!isNaN(d.getTime())) return d;
  
  const parts = dateStr.split(/[\/\-]/);
  if (parts.length === 3) {
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // 0-indexed month
    const year = parseInt(parts[2], 10);
    d = new Date(year, month, day);
    if (!isNaN(d.getTime())) return d;
  }
  return null;
};

export default function Home() {
  const router = useRouter();
  const { user } = useApp();
  const [promptProduct, setPromptProduct] = useState<any | null>(null);

  useEffect(() => {
    if (!user) return;

    const allowedStatuses = ['Delivered', 'Returned', 'Return Requested', 'Return Rejected'];
    const reviewedProductIds = new Set(user.reviews?.map(r => r.productId) || []);
    
    // Read dismissed prompts from localStorage
    let dismissedIds: string[] = [];
    try {
      dismissedIds = JSON.parse(localStorage.getItem('village_made_dismissed_review_prompts') || '[]');
    } catch (e) {
      dismissedIds = [];
    }

    const now = new Date();

    // Find the first eligible product
    for (const order of user.orders || []) {
      if (allowedStatuses.includes(order.status)) {
        // Determine delivery date
        const deliveryHistory = order.status_history?.find(h => h.status === 'Delivered');
        const deliveryDateStr = deliveryHistory ? deliveryHistory.date : order.date;
        const deliveryDate = parseDateStr(deliveryDateStr);

        if (deliveryDate) {
          const diffTime = now.getTime() - deliveryDate.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

          // Only prompt if delivered at least 7 days ago
          if (diffDays >= 7) {
            for (const item of order.items || []) {
              if (!reviewedProductIds.has(item.id) && !dismissedIds.includes(item.id)) {
                // Find full product details
                const fullProd = PRODUCTS.find(p => p.id === item.id);
                if (fullProd) {
                  setPromptProduct(fullProd);
                  return; // Stop at first eligible
                }
              }
            }
          }
        }
      }
    }
  }, [user]);

  const handleDismiss = () => {
    if (promptProduct) {
      try {
        const dismissed: string[] = JSON.parse(localStorage.getItem('village_made_dismissed_review_prompts') || '[]');
        if (!dismissed.includes(promptProduct.id)) {
          dismissed.push(promptProduct.id);
          localStorage.setItem('village_made_dismissed_review_prompts', JSON.stringify(dismissed));
        }
      } catch (e) {
        // ignore
      }
    }
    setPromptProduct(null);
  };

  const handleGoToReview = () => {
    if (promptProduct) {
      // Mark as dismissed so it doesn't prompt again
      handleDismiss();
      // Redirect to product details reviews tab
      router.push(`/products/${promptProduct.id}?tab=reviews&write=true`);
    }
  };

  return (
    <main className="relative w-full min-h-screen text-warm-cream">
      <HeroSection />

      <AboutSection />
      
      <WhyChooseSection />
      
      <ProductsSection />

      <OurProcessSection />
      
      <GallerySection />
      
      <CertificationSection />
      
      <TestimonialsSection />

      <MaltBannerSection />

      {/* Slide-up bottom-right reviews reminder popup */}
      {promptProduct && (
        <div className="fixed bottom-6 right-6 z-[9999] bg-[#FAF9F5] border-2 border-[#eeddb9] rounded-2xl p-6 shadow-2xl max-w-sm w-full animate-slide-up text-stone-900 font-jakarta border-l-4 border-l-[#384401]">
          <button
            onClick={handleDismiss}
            className="absolute top-3 right-3 text-stone-400 hover:text-stone-750 transition-colors cursor-pointer"
            aria-label="Dismiss Review Reminder"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex gap-4 items-start">
            <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 border border-[#eeddb9]/40 bg-white relative flex items-center justify-center p-1">
              <img
                src={promptProduct.image || `/images/products/${promptProduct.id}.webp`}
                alt={promptProduct.name}
                className="max-w-full max-h-full object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/images/products/banana-baby-malt.webp';
                }}
              />
            </div>
            <div className="flex-1 flex flex-col gap-0.5">
              <span className="text-[10px] text-[#A45338] font-black uppercase tracking-wider">Feedback Requested</span>
              <h4 className="text-sm font-black text-[#384401] leading-tight">{promptProduct.name}</h4>
              <p className="text-[11px] text-stone-650 font-bold leading-normal mt-1">
                It's been a week since your delivery! Let us know how you liked the product to help other parents.
              </p>
            </div>
          </div>
          
          <div className="flex gap-2 justify-end mt-4">
            <button
              onClick={handleDismiss}
              className="px-3 py-1.5 text-stone-600 hover:bg-stone-100 rounded-lg text-[11px] font-bold cursor-pointer transition-colors"
            >
              Maybe Later
            </button>
            <button
              onClick={handleGoToReview}
              className="px-4 py-1.5 bg-[#384401] hover:bg-[#252d00] text-white rounded-lg text-[11px] font-black uppercase cursor-pointer transition-colors shadow-2xs"
            >
              Write Review
            </button>
          </div>
        </div>
      )}

      <Footer />
    </main>
  );
}