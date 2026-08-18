'use client';

import React from 'react';
import { Check } from 'lucide-react';

interface ProgressStep {
  num: number;
  label: string;
  icon: React.ComponentType<any>;
}

interface CheckoutProgressProps {
  steps: ProgressStep[];
  activeSubStep: number;
}

export default function CheckoutProgress({ steps, activeSubStep }: CheckoutProgressProps) {
  return (
    <div className="mb-8 bg-white/95 backdrop-blur-md border border-[#eeddb9]/50 p-6 rounded-[28px] shadow-sm select-none relative">
      <div className="flex justify-between items-center max-w-4xl mx-auto relative">
        {/* Background connector line aligned precisely from center of step 1 column to center of step 3 column */}
        <div className="absolute top-[18px] left-[16.66%] right-[16.66%] h-[3px] bg-stone-200/50 hidden md:block z-0 rounded-full">
          <div 
            className="h-full bg-gradient-to-r from-[#384401] to-[#5a6c02] rounded-full transition-all duration-500 ease-out shadow-xs" 
            style={{ width: `${((Math.min(3, Math.max(1, activeSubStep)) - 1) / 2) * 100}%` }}
          />
        </div>

        {steps.map((s) => {
          const isActive = activeSubStep === s.num;
          const isCompleted = activeSubStep > s.num;
          return (
            <div key={s.num} className="flex flex-col items-center gap-2.5 flex-1 relative z-10">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center border transition-all duration-300 text-xs font-bold ${
                isActive 
                  ? 'bg-gradient-to-br from-[#384401] to-[#4b5902] text-white border-transparent scale-110 shadow-lg shadow-[#384401]/20 ring-4 ring-[#384401]/10' 
                  : isCompleted 
                    ? 'bg-green-50 text-green-700 border-green-500 shadow-xs' 
                    : 'text-stone-605 border-stone-300 bg-stone-50/50'
              }`}>
                {isCompleted ? <Check className="w-4 h-4 stroke-[3]" /> : s.num}
              </div>
              <span className={`text-[10px] sm:text-xs font-jakarta tracking-wide transition-colors hidden sm:block ${
                isActive 
                  ? 'text-[#384401] font-extrabold' 
                  : isCompleted 
                    ? 'text-green-700 font-bold' 
                    : 'text-stone-600 font-bold'
              }`}>
                {s.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
