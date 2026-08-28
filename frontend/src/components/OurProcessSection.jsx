import { useState, useEffect } from 'react';
import Image from 'next/image';

export default function OurProcessSection() {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % 6);
    }, 3500);
    return () => clearInterval(interval);
  }, []);
  const steps = [
    {
      num: '01',
      title: 'Organic Farming',
      desc: 'Grown naturally in our fertile fields without chemicals.',
      image: '/images/process-section/organic-farming-1.webp',
      color: '#384401', // Green
    },
    {
      num: '02',
      title: 'Hand Selection',
      desc: 'Carefully handpicked grain for the best quality.',
      image: '/images/process-section/hand-selection-2.webp',
      color: '#384401', // Green
    },
    {
      num: '03',
      title: 'Traditional Strong Graining',
      desc: 'Strong-ground slowly to retain nutrients and natural taste.',
      image: '/images/process-section/traditional-strong-graining-3.webp',
      color: '#C56C4F', // Terracotta
    },
    {
      num: '04',
      title: 'Home made Preparation',
      desc: 'Hygienically Prepared in small batches with love and care.',
      image: '/images/process-section/home-made-preparation-4.webp',
      color: '#384401', // Green
    },
    {
      num: '05',
      title: 'Hygienic Packing',
      desc: "Packed with modern hygiene for your family's health.",
      image: '/images/process-section/hygienic-packing-5.webp',
      color: '#C56C4F', // Terracotta
    },
    {
      num: '06',
      title: 'Delivered Fresh',
      desc: 'Delivered fresh to your doorstep on time, every time.',
      image: '/images/process-section/delivered-fresh-6.webp',
      color: '#384401', // Green
    },
  ];

  return (
    <section id="process" className="w-full bg-[#fdfaf3] relative overflow-hidden pb-4">
      {/* Import Google Font Splash */}
      <link href="https://fonts.googleapis.com/css2?family=Splash&display=swap" rel="stylesheet" />

      {/* 1. Mobile/Tablet Layout (<lg) */}
      <div className="lg:hidden w-full py-16 px-6 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="text-[#8B5A3C] font-body text-xs font-bold tracking-[0.2em] uppercase block mb-3">
            Our Process
          </span>
          <h2 className="text-3xl sm:text-4xl font-poetsen leading-tight mb-4">
            <span className="text-[#384401]">From Our Village</span>
            <span 
              className="text-[#C56C4F] block mt-1 normal-case tracking-normal" 
              style={{ fontFamily: "'Splash', cursive", fontSize: '42px', fontWeight: 'normal' }}
            >
              To Your Home
            </span>
          </h2>
          <p className="text-[#6d5e50] font-body text-sm max-w-md mx-auto">
            Crafted with tradition. Delivered with care.
          </p>
        </div>

        {/* Steps List */}
        <div className="flex flex-col gap-12 max-w-md mx-auto">
          {steps.map((step) => (
            <div key={step.num} className="flex flex-col bg-white/40 border border-stone-200/50 rounded-2xl p-6 shadow-xs">
              <div className="flex items-baseline gap-3 mb-3">
                <span 
                  className="font-poetsen text-3xl font-extrabold"
                  style={{ color: step.color }}
                >
                  {step.num}
                </span>
                <h3 className="font-poetsen text-lg text-[#384401] font-bold">{step.title}</h3>
              </div>
              <p className="text-stone-600 font-body text-sm mb-4 font-medium leading-relaxed">
                {step.desc}
              </p>
              <div className="relative w-full aspect-[4/3]">
                <Image
                  src={step.image}
                  alt={step.title}
                  fill
                  className="object-contain"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Desktop Layout (>=lg) - Pixel-perfect alignment over background */}
      <div 
        className="hidden lg:block w-full relative aspect-[1920/1080] bg-cover bg-center select-none"
        style={{
          backgroundImage: "url('/images/our-process.webp')",
        }}
      >
        {/* Winding Connecting Path SVG */}
        <svg 
          className="absolute z-10 pointer-events-none" 
          style={{
            left: '40.05%',
            top: '5.09%',
            width: '26.77%',
            height: '92.31%'
          }}
          viewBox="-20 -20 514 997" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Curve */}
          <path 
            d="M1 0C1.00031 32 2.38203 138.467 147.231 148.934C328.292 162.018 273.592 273.39 241.767 288.725C194.5 311.5 0.619183 325.222 55.8989 438.156C111.179 551.09 406.004 431.27 443.658 592.407C449.171 616 418.021 645.431 382.77 661.958C338.707 682.617 71.922 702.587 86.3428 796.928C97.8794 872.401 219.869 881.17 279.421 876.12C328.292 872.447 435.326 883.281 472.5 956" 
            stroke="#384401" 
            strokeWidth="2" 
            strokeDasharray="6 6"
            opacity="0.8"
          />

          {/* Helper nodes along curve */}
          {/* Node 1 */}
          <circle 
            cx="1" 
            cy="0" 
            r={activeStep === 0 ? "13" : "10"} 
            fill="#fdfaf3" 
            stroke={activeStep === 0 ? "#C56C4F" : "#384401"} 
            strokeWidth={activeStep === 0 ? "4" : "3"} 
            className="transition-all duration-300 pointer-events-auto cursor-pointer" 
            onMouseEnter={() => setActiveStep(0)}
          />
          <circle cx="1" cy="0" r={activeStep === 0 ? "7" : "5"} fill={activeStep === 0 ? "#C56C4F" : "#384401"} className="transition-all duration-300 pointer-events-none" />

          {/* Node 2 */}
          <circle 
            cx="147.231" 
            cy="148.934" 
            r={activeStep === 1 ? "13" : "10"} 
            fill="#fdfaf3" 
            stroke={activeStep === 1 ? "#C56C4F" : "#384401"} 
            strokeWidth={activeStep === 1 ? "4" : "3"} 
            className="transition-all duration-300 pointer-events-auto cursor-pointer" 
            onMouseEnter={() => setActiveStep(1)}
          />
          <circle cx="147.231" cy="148.934" r={activeStep === 1 ? "7" : "5"} fill={activeStep === 1 ? "#C56C4F" : "#384401"} className="transition-all duration-300 pointer-events-none" />

          {/* Node 3 */}
          <circle 
            cx="241.767" 
            cy="288.725" 
            r={activeStep === 2 ? "13" : "10"} 
            fill="#fdfaf3" 
            stroke={activeStep === 2 ? "#384401" : "#C56C4F"} 
            strokeWidth={activeStep === 2 ? "4" : "3"} 
            className="transition-all duration-300 pointer-events-auto cursor-pointer" 
            onMouseEnter={() => setActiveStep(2)}
          />
          <circle cx="241.767" cy="288.725" r={activeStep === 2 ? "7" : "5"} fill={activeStep === 2 ? "#384401" : "#C56C4F"} className="transition-all duration-300 pointer-events-none" />

          {/* Node 4 */}
          <circle 
            cx="55.8989" 
            cy="438.156" 
            r={activeStep === 3 ? "13" : "10"} 
            fill="#fdfaf3" 
            stroke={activeStep === 3 ? "#C56C4F" : "#384401"} 
            strokeWidth={activeStep === 3 ? "4" : "3"} 
            className="transition-all duration-300 pointer-events-auto cursor-pointer" 
            onMouseEnter={() => setActiveStep(3)}
          />
          <circle cx="55.8989" cy="438.156" r={activeStep === 3 ? "7" : "5"} fill={activeStep === 3 ? "#C56C4F" : "#384401"} className="transition-all duration-300 pointer-events-none" />

          {/* Node 5 */}
          <circle 
            cx="382.77" 
            cy="661.958" 
            r={activeStep === 4 ? "13" : "10"} 
            fill="#fdfaf3" 
            stroke={activeStep === 4 ? "#384401" : "#C56C4F"} 
            strokeWidth={activeStep === 4 ? "4" : "3"} 
            className="transition-all duration-300 pointer-events-auto cursor-pointer" 
            onMouseEnter={() => setActiveStep(4)}
          />
          <circle cx="382.77" cy="661.958" r={activeStep === 4 ? "7" : "5"} fill={activeStep === 4 ? "#384401" : "#C56C4F"} className="transition-all duration-300 pointer-events-none" />

          {/* Node 6 */}
          <circle 
            cx="279.421" 
            cy="876.12" 
            r={activeStep === 5 ? "13" : "10"} 
            fill="#fdfaf3" 
            stroke={activeStep === 5 ? "#C56C4F" : "#384401"} 
            strokeWidth={activeStep === 5 ? "4" : "3"} 
            className="transition-all duration-300 pointer-events-auto cursor-pointer" 
            onMouseEnter={() => setActiveStep(5)}
          />
          <circle cx="279.421" cy="876.12" r={activeStep === 5 ? "7" : "5"} fill={activeStep === 5 ? "#C56C4F" : "#384401"} className="transition-all duration-300 pointer-events-none" />
        </svg>

        {/* Header Block */}
        <div className="absolute left-[8%] top-[8%] lg:max-w-[20vw] text-left reveal">
          <span className="text-[#8B5A3C] font-body text-xs lg:text-[0.7vw] font-bold tracking-[0.25em] uppercase block lg:mb-[0.8vw]">
            Our Process
          </span>
          <h2 className="lg:text-[2.3vw] font-poetsen leading-[1.1] lg:mb-[1vw] text-[#384401] relative">
            From Our Village
            <span 
              className="text-[#C56C4F] block lg:mt-[0.2vw] normal-case tracking-normal"
              style={{ fontFamily: "'Splash', cursive", fontSize: '2.7vw', fontWeight: 'normal' }}
            >
              To Your Home
            </span>
            {/* Small leaf next to heading */}
            <span className="absolute -right-[3.5vw] top-[1.25vw] lg:w-[4.1vw] lg:h-[4.1vw] transform rotate-12 opacity-90 pointer-events-none animate-sway-3">
              <Image 
                src="/images/product-section/products-leaf.svg" 
                alt="decorative leaf" 
                fill 
                className="object-contain" 
              />
            </span>
          </h2>
          <p className="text-[#6d5e50] font-body lg:text-[0.75vw] font-semibold lg:max-w-[15vw] leading-relaxed">
            Crafted with tradition. Delivered with care.
          </p>
        </div>

        {/* Step 1: Organic Farming */}
        <div 
          onMouseEnter={() => setActiveStep(0)}
          className={`absolute left-[48%] top-[6%] text-left z-30 transition-all duration-500  ${
            activeStep === 0 ? 'scale-[1.04] opacity-100' : 'scale-100 opacity-60'
          }`}
        >
          <h3 className="font-poetsen flex items-end lg:gap-[0.6vw]">
            <span className="text-[#384401] lg:text-[2.8vw] font-extrabold leading-none">01</span>
            <span className="text-[#384401] lg:text-[1.56vw] font-bold tracking-tight">Organic Farming</span>
          </h3>
          <p className="text-[#6d5e50] font-body lg:text-[0.78vw] lg:mt-[0.5vw] font-semibold leading-relaxed">
            Grown naturally in our fertile fields without chemicals.
          </p>
        </div>
        <div 
          onMouseEnter={() => setActiveStep(0)}
          className={`absolute left-[62%] top-[3%] w-[19%] aspect-[1.3] z-20 pointer-events-auto transition-all duration-500  ${
            activeStep === 0 ? 'scale-[1.08]' : 'scale-100 opacity-80'
          }`}
        >
          <Image src="/images/process-section/organic-farming-1.webp" alt="" fill className="object-contain" />
        </div>

        {/* Step 2: Hand Selection */}
        <div 
          onMouseEnter={() => setActiveStep(1)}
          className={`absolute left-[26%] top-[25%] text-left z-30 transition-all duration-500  ${
            activeStep === 1 ? 'scale-[1.04] opacity-100' : 'scale-100 opacity-60'
          }`}
        >
          <h3 className="font-poetsen flex items-end lg:gap-[0.6vw]">
            <span className="text-[#384401] lg:text-[2.8vw] font-extrabold leading-none">02</span>
            <span className="text-[#384401] lg:text-[1.56vw] font-bold tracking-tight">Hand Selection</span>
          </h3>
          <p className="text-[#6d5e50] font-body lg:text-[0.78vw] lg:mt-[0.5vw] font-semibold leading-relaxed">
            Carefully handpicked grain for the best quality.
          </p>
        </div>
        <div 
          onMouseEnter={() => setActiveStep(1)}
          className={`absolute left-[4%] top-[24%] w-[21%] aspect-[1.3] z-20 pointer-events-auto transition-all duration-500  ${
            activeStep === 1 ? 'scale-[1.08]' : 'scale-100 opacity-80'
          }`}
        >
          <Image src="/images/process-section/hand-selection-2.webp" alt="" fill className="object-contain" />
        </div>

        {/* Step 3: Traditional Strong Graining */}
        <div 
          onMouseEnter={() => setActiveStep(2)}
          className={`absolute left-[56%] top-[36%] text-left z-30 transition-all duration-500  ${
            activeStep === 2 ? 'scale-[1.04] opacity-100' : 'scale-100 opacity-60'
          }`}
        >
          <h3 className="font-poetsen flex items-end lg:gap-[0.6vw]">
            <span className="text-[#C56C4F] lg:text-[2.8vw] font-extrabold leading-none">03</span>
            <span className="text-[#384401] lg:text-[1.56vw] font-bold tracking-tight">Traditional Strong Graining</span>
          </h3>
          <p className="text-[#6d5e50] font-body lg:text-[0.78vw] lg:mt-[0.5vw] font-semibold leading-relaxed">
            Strong-ground slowly to retain nutrients and natural taste.
          </p>
        </div>
        <div 
          onMouseEnter={() => setActiveStep(2)}
          className={`absolute left-[77%] top-[34%] w-[19%] aspect-[1.25] z-20 pointer-events-auto transition-all duration-500  ${
            activeStep === 2 ? 'scale-[1.08]' : 'scale-100 opacity-80'
          }`}
        >
          <Image src="/images/process-section/traditional-strong-graining-3.webp" alt="" fill className="object-contain" />
        </div>

        {/* Step 4: Homemade Preparation */}
        <div 
          onMouseEnter={() => setActiveStep(3)}
          className={`absolute left-[20%] top-[57%] text-left z-30 transition-all duration-500  ${
            activeStep === 3 ? 'scale-[1.04] opacity-100' : 'scale-100 opacity-60'
          }`}
        >
          <h3 className="font-poetsen flex items-end lg:gap-[0.6vw]">
            <span className="text-[#384401] lg:text-[2.8vw] font-extrabold leading-none">04</span>
            <span className="text-[#384401] lg:text-[1.56vw] font-bold tracking-tight">Home made Preparation</span>
          </h3>
          <p className="text-[#6d5e50] font-body lg:text-[0.78vw] lg:mt-[0.5vw] font-semibold leading-relaxed">
            Hygienically Prepared in small batches with love and care.
          </p>
        </div>
        <div 
          onMouseEnter={() => setActiveStep(3)}
          className={`absolute left-[3%] top-[60%] w-[21%] aspect-[1.3] z-20 pointer-events-auto transition-all duration-500  ${
            activeStep === 3 ? 'scale-[1.08]' : 'scale-100 opacity-80'
          }`}
        >
          <Image src="/images/process-section/home-made-preparation-4.webp" alt="" fill className="object-contain" />
        </div>

        {/* Step 5: Hygienic Packing */}
        <div 
          onMouseEnter={() => setActiveStep(4)}
          className={`absolute left-[64%] top-[65%] text-left z-20 transition-all duration-500  ${
            activeStep === 4 ? 'scale-[1.04] opacity-100' : 'scale-100 opacity-60'
          }`}
        >
          <h3 className="font-poetsen flex items-end lg:gap-[0.6vw]">
            <span className="text-[#C56C4F] lg:text-[2.8vw] font-extrabold leading-none">05</span>
            <span className="text-[#384401] lg:text-[1.56vw] font-bold tracking-tight">Hygienic Packing</span>
          </h3>
          <p className="text-[#6d5e50] font-body lg:text-[0.78vw] lg:mt-[0.5vw] font-semibold leading-relaxed">
            Packed with modern hygiene for your family's <br /> health.
          </p>
        </div>
        <div 
          onMouseEnter={() => setActiveStep(4)}
          className={`absolute left-[78%] top-[68%] w-[19%] aspect-[1.25] z-20 pointer-events-auto transition-all duration-500  ${
            activeStep === 4 ? 'scale-[1.08]' : 'scale-100 opacity-80'
          }`}
        >
          <Image src="/images/process-section/hygienic-packing-5.webp" alt="" fill className="object-contain" />
        </div>

        {/* Step 6: Delivered Fresh */}
        <div 
          onMouseEnter={() => setActiveStep(5)}
          className={`absolute left-[28%] top-[86%] text-left z-30 transition-all duration-500  ${
            activeStep === 5 ? 'scale-[1.04] opacity-100' : 'scale-100 opacity-60'
          }`}
        >
          <h3 className="font-poetsen flex items-end lg:gap-[0.6vw]">
            <span className="text-[#384401] lg:text-[2.8vw] font-extrabold leading-none">06</span>
            <span className="text-[#384401] lg:text-[1.56vw] font-bold tracking-tight">Delivered Fresh</span>
          </h3>
          <p className="text-[#6d5e50] font-body lg:text-[0.78vw] lg:mt-[0.5vw] font-semibold leading-relaxed">
            Delivered fresh to your doorstep on time, every time.
          </p>
        </div>
        <div 
          onMouseEnter={() => setActiveStep(5)}
          className={`absolute left-[51%] top-[77%] w-[20%] aspect-[1.35] z-20 pointer-events-auto transition-all duration-500  ${
            activeStep === 5 ? 'scale-[1.08]' : 'scale-100 opacity-80'
          }`}
        >
          <Image src="/images/process-section/delivered-fresh-6.webp" alt="" fill className="object-contain" />
        </div>
      </div>
    </section>
  );
}
