'use client';

import { useEffect } from 'react';
import Image from 'next/image';
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

export default function Home() {
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '0px 0px -60px 0px',
      threshold: 0.05,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
        } else {
          entry.target.classList.remove('revealed');
        }
      });
    }, observerOptions);

    // Initial check and observation
    const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');
    revealElements.forEach((el) => observer.observe(el));

    // Monitor DOM changes to auto-observe dynamically loaded or rendered elements
    const mutationObserver = new MutationObserver(() => {
      const currentRevealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');
      currentRevealElements.forEach((el) => observer.observe(el));
    });
    mutationObserver.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      mutationObserver.disconnect();
    };
  }, []);

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

 

      <Footer />
    </main>
  );
}