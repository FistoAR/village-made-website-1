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
    <div className="mb-8 bg-white border border-[#eeddb9]/70 p-5 rounded-[24px] shadow-sm select-none relative">
      <div className="flex justify-between items-center max-w-4xl mx-auto relative">
        {/* Background connector line aligned precisely from center of step 1 column to center of step 6 column */}
        <div className="absolute top-[18px] left-[8.33%] right-[8.33%] h-[3px] bg-stone-100 hidden md:block z-0 rounded-full">
          <div 
            className="h-full bg-[#384401] rounded-full transition-all duration-500 ease-out" 
            style={{ width: `${((Math.min(6, Math.max(1, activeSubStep)) - 1) / 5) * 100}%` }}
          />
        </div>

        {steps.map((s) => {
          const isActive = activeSubStep === s.num;
          const isCompleted = activeSubStep > s.num;
          return (
            <div key={s.num} className="flex flex-col items-center gap-2 flex-1 relative z-10">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center border transition-all text-xs font-bold bg-white ${
                isActive 
                  ? '!bg-[#384401] text-white border-[#384401] scale-110 shadow-md ring-4 ring-[#384401]/15' 
                  : isCompleted 
                    ? '!bg-green-100 text-green-700 border-green-300' 
                    : 'text-stone-500 border-stone-250'
              }`}>
                {isCompleted ? <Check className="w-4.5 h-4.5 stroke-[3]" /> : s.num}
              </div>
              <span className={`text-[11px] sm:text-xs font-jakarta font-bold transition-colors ${
                isActive 
                  ? 'text-[#384401] font-extrabold' 
                  : isCompleted 
                    ? 'text-green-800' 
                    : 'text-stone-550'
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
