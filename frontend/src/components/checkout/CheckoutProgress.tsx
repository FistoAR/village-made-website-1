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
    <div className="mb-8 bg-white border border-[#eeddb9]/65 p-4 rounded-[24px] shadow-sm select-none">
      <div className="flex justify-between items-center max-w-4xl mx-auto">
        {steps.map((s) => {
          const IconComponent = s.icon;
          const isActive = activeSubStep === s.num;
          const isCompleted = activeSubStep > s.num;
          return (
            <div key={s.num} className="flex-1 flex items-center">
              <div className="flex flex-col items-center gap-1.5 mx-auto">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all text-xs font-bold ${
                  isActive 
                    ? 'bg-[#384401] text-white border-[#384401] scale-110 shadow-md' 
                    : isCompleted 
                      ? 'bg-green-100 text-green-700 border-green-200' 
                      : 'bg-stone-50 text-stone-400 border-stone-200'
                }`}>
                  {isCompleted ? <Check className="w-4 h-4" /> : s.num}
                </div>
                <span className={`text-[10px] font-jakarta font-bold hidden sm:block ${
                  isActive ? 'text-[#384401] scale-105' : 'text-stone-400'
                }`}>
                  {s.label}
                </span>
              </div>
              {s.num < 6 && (
                <div className="flex-grow h-[2px] bg-stone-100 mx-2 hidden md:block relative">
                  <div className={`absolute top-0 left-0 h-full bg-[#384401] transition-all duration-300 ${
                    isCompleted ? 'w-full' : 'w-0'
                  }`} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
