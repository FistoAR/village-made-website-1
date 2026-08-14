'use client';

import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Compass, ArrowLeft, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <main className="relative w-full min-h-screen bg-[#fcf9f2] flex flex-col font-jakarta">
      <Navbar />
      
      <div className="flex-1 flex flex-col items-center justify-center text-center px-4 py-35 relative z-10 overflow-hidden">
        {/* Background Decorative Elements */}
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[#dce5c7] rounded-full blur-[100px] opacity-30 -z-10" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-[#f8ebd0] rounded-full blur-[80px] opacity-40 -z-10" />

        <div className="bg-white/60 backdrop-blur-xl border border-white p-6 md:p-10 rounded-[32px] shadow-2xl max-w-lg w-full">
          <div className="w-16 h-16 bg-[#384401]/10 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
            <Compass className="w-8 h-8 text-[#384401]" />
          </div>
          
          <h1 className="text-6xl md:text-8xl font-black font-poetsen text-transparent bg-clip-text bg-gradient-to-br from-[#384401] to-[#607317] leading-none mb-3 drop-shadow-sm">
            404
          </h1>
          
          <h2 className="text-xl md:text-2xl font-extrabold text-stone-900 mb-3 tracking-tight">
            Oops! You've strayed from the village path.
          </h2>
          
          <p className="text-stone-600 text-sm font-semibold max-w-sm mx-auto mb-8 leading-relaxed">
            The page you're looking for seems to have been moved, deleted, or never existed in the first place. Let's get you back home.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button 
              onClick={() => window.history.back()}
              className="w-full sm:w-auto px-5 py-2.5 bg-white border-2 border-stone-200 hover:border-[#384401] hover:bg-[#fafbfa] text-stone-700 font-bold rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              Go Back
            </button>
            
            <Link
              href="/"
              className="w-full sm:w-auto px-5 py-2.5 bg-[#384401] hover:bg-[#2c3601] text-white font-bold rounded-xl transition-all shadow-xl hover:shadow-2xl hover:-translate-y-0.5 flex items-center justify-center gap-2 group text-sm"
            >
              <Home className="w-4 h-4 group-hover:scale-110 transition-transform" />
              Return Home
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
