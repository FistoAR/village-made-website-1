'use client';
import React, { useState } from 'react';
import { useApp } from '@/lib/context/AppContext';
import languages from '@/data/languages.json';

export default function LanguageSelector({ scrolled }: { scrolled?: boolean }) {
  const { language, setLanguage } = useApp();
  const [open, setOpen] = useState(false);

  return (
    <div className="flex items-center gap-2 z-30">
      {/* Language Dropdown */}
      <div className="relative">
        <button 
          onClick={() => setOpen(!open)}
          className={`flex items-center gap-2 font-body px-4 py-1.5 rounded-full transition-all duration-200 text-xs cursor-pointer shadow-xs ${
            scrolled 
              ? 'border-[#eeddb9] bg-[#fcf9f2] text-[#3d2b1f] hover:bg-[#ebdcc1]' 
              : 'border-white/20 bg-black/40 text-white/80 hover:bg-white/10 hover:text-white hover:border-white/40'
          }`}
        >
          🌐 {languages.find(l => l.code === language)?.name}
        </button>
        {open && (
          <div className={`absolute right-0 mt-2 w-40 backdrop-blur-md rounded-xl shadow-2xl py-2 z-50 border ${
            scrolled 
              ? 'bg-white border-[#eeddb9] text-[#3d2b1f]' 
              : 'bg-[#1e140d]/90 border-white/10 text-white'
          }`}>
            {languages.map(lang => (
              <button
                key={lang.code}
                onClick={() => { setLanguage(lang.code); setOpen(false); }}
                className={`block w-full text-left px-4 py-2 font-body text-xs transition-colors cursor-pointer ${
                  language === lang.code 
                    ? 'bg-[#b85c37] text-white font-semibold' 
                    : scrolled 
                      ? 'text-[#5d5449] hover:bg-[#fbf6eb] hover:text-[#3d2b1f]' 
                      : 'text-white/80 hover:bg-white/10 hover:text-white'
                }`}
              >
                {lang.name}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}