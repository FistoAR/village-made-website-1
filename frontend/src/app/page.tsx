'use client';

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