import Image from 'next/image';
import { Leaf, Heart } from 'lucide-react';

export default function AboutSection() {
  const values = [
    {
      icon: '/images/about/natural.svg',
      label: '100% Natural',
    },
    {
      icon: '/images/about/traditional-process.svg',
      label: 'Traditional Process',
    },
    {
      icon: '/images/about/sourced-responsibly.svg',
      label: 'Sourced Responsibly',
    },
    {
      icon: '/images/about/made-with-love.svg',
      label: 'Made with Love',
    },
    {
      icon: '/images/about/quality-you-can-trust.svg',
      label: 'Quality You Can Trust',
    },
  ];

  return (
    <section id="our-story" className="relative w-full bg-[#fdfaf3] overflow-hidden">
      {/* Decorative Leaves (Top-Left) */}
      <div className="absolute top-0 left-0 w-30 sm:w-35 md:w-40 opacity-90 pointer-events-none mix-blend-multiply z-20 animate-sway-1">
        <Image
          src="/images/about/leaf-top.webp"
          alt="Decorative leaves"
          width={300}
          height={300}
          className="object-contain"
        />
      </div>

      {/* Side Decorative Leaf (Left-Middle) - watermark style matching reference */}
      <div className="absolute top-[10%] left-0 w-44 sm:w-60 lg:w-72 h-[60%] opacity-90 pointer-events-none mix-blend-multiply z-10 animate-sway-2">
        <Image
          src="/images/about/leaf-left.webp"
          alt="Decorative leaves watermark"
          fill
          className="object-contain object-left"
        />
      </div>
      
      <div className="relative z-10 w-full h-auto flex flex-col lg:flex-row">
        <div className="w-full lg:w-[40%] flex flex-col">
          
          {/* Left Content */}
          <div className="flex flex-col justify-center items-center md:items-center lg:items-start text-left px-6 sm:px-12 lg:px-0 lg:pl-[15%] pt-16 sm:pt-20 lg:pt-30 pb-16 lg:pb-36 lg:pr-6 lg:-mr-24 z-20 reveal">
            <h3 className="text-[#384401] font-body font-semibold tracking-[0.35em] uppercase text-md md:text-lg lg:text-xl w-full max-w-[500px] text-center mb-5">
              Our Story
            </h3>
            <h2 className="text-4xl sm:text-5xl lg:text-[56px] xl:text-[66px] font-poetsen text-[#3d2b1f] leading-[1.12] mb-6 tracking-tight text-center">
              Rooted in our Village,<br className="" />
              <span className="text-[#4f5a30] lg:whitespace-nowrap">Made for Your Family.</span>
            </h2>
            
            <div className="w-full max-w-[460px] h-[1px] bg-[#c5b799] mb-8" />
            
            <p className="text-[#5d5449] font-body text-base sm:text-lg lg:text-xl leading-relaxed mb-8 max-w-xl">
              Village Made began with a simple belief - Our families deserve food that is pure, natural and made the traditional way. What started in a small village kitchen is today a promise we share with thousands of families across the country.
            </p>
            
            <div className="inline-flex items-center gap-3 bg-[#f5ebd9] border border-[#ebdcc1] px-4 md:px-8 lg:px-8 py-4 rounded-full text-[#3d2b1f] font-body text-sm md:text-lg lg:md:text-lg font-medium shadow-xs">
              <Heart className="w-8 h-8 md:w-4.5 md:h-4.5 lg:w-5 lg:h-5 text-[#4f5a30]" />
              <span>Pure Ingredients. Traditional Process. Honest Nutrition.</span>
            </div>
          </div>

          {/* Right Image Space (for layout alignment on mobile/tablet) */}
          <div className="lg:col-span-6 w-full h-[0px] lg:h-[600px] relative pointer-events-none lg:opacity-0 block lg:hidden">
            {/* Renders inside the grid on mobile only to keep natural document flow */}
          </div>
        </div>
        {/* Right Image Content - absolutely positioned on desktop to span to the screen edge */}
        <div className="w-full lg:w-[60%] h-[400px] sm:h-[500px] md:h-[600px] lg:h-auto min-h-[400px] lg:min-h-0 relative reveal-scale">
          <div className="relative w-full h-full">
            <Image
              src="/images/about/granny-image.webp"
              alt="Traditional village grain processing"
              fill
              className="object-cover object-left-top lg:object-cover"
              priority
            />
            {/* Gradient Fade Overlays */}
            <div className="absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-[#fdfaf3] via-[#fdfaf3]/85 to-transparent pointer-events-none" />
            <div className="absolute bottom-0 inset-x-0 h-1/4 bg-gradient-to-t from-[#fdfaf3] via-[#fdfaf3]/70 to-transparent pointer-events-none" />
            <div className="absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-[#fdfaf3] to-transparent pointer-events-none" />
            
            {/* Quote Paper Overlay - matched exactly to image 2 style */}
            <div className="absolute bottom-0 left-[50%] translate-x-[-50%] lg:translate-x-unset md:bottom-0 lg:bottom-unset lg:top-[45%] lg:left-auto 2xl:top-[35%] sm:right-[6%] lg:right-[5%] xl:right-[3%] w-[180px] sm:w-[230px] md:w-[270px] lg:w-[250px] xl:w-[285px] -rotate-[3deg] animate-float z-20 drop-shadow-xl transition-all duration-300 hover:rotate-0 pointer-events-auto reveal">
              <div className="relative">
                <Image
                  src="/images/about/paper-image.webp"
                  alt="Paper background"
                  width={320}
                  height={320}
                  className="absolute inset-0 w-full h-full object-fill pointer-events-none"
                />
                <div className="relative px-4 sm:px-6 md:px-8 py-6 sm:py-8 md:py-10 text-center select-none">
                  <span className="text-3xl sm:text-4xl text-[#4f5a30] font-serif block mb-1 leading-none font-bold">“</span>
                  <p className="text-[#3d2b1f] font-body text-[11px] sm:text-xs md:text-sm lg:text-base leading-relaxed font-medium">
                    From our viillage<br />kitchen to your<br />home, bringing<br />back the goodness<br />of traditon.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>


      {/* Values Section */}
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20 mt-12 lg:-mt-10 lg:w-[80%] reveal">
        <div className="bg-[#fbf6eb] rounded-3xl p-6 md:p-10 border border-[#e8ddc4] shadow-xs">
          <div className="flex items-center gap-4 w-full mb-5">
            <div className="flex-1 border-t border-dashed border-[#dcd3b6]" />
            <div className="flex items-center gap-2 text-[#4f5a30] font-body font-bold tracking-[0.2em] uppercase text-xs md:text-sm whitespace-nowrap">
              <svg width="21" height="21" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-4 h-4">
                <path d="M18.2551 2.60828V4.34703C18.2551 12.7165 13.584 16.5183 7.8226 16.5183H6.16905C6.35336 13.8998 7.16883 12.3149 9.29707 10.4318C10.3438 9.50592 10.2551 8.97125 9.73958 9.27814C6.18904 11.3907 4.42508 14.2458 4.34683 18.8048L4.34422 19.1265H2.60547C2.60547 17.9415 2.70632 16.8661 2.90627 15.8819C2.7069 14.757 2.60692 13.2303 2.60634 11.3021C2.60634 6.50048 6.49854 2.60828 11.3001 2.60828C13.0389 2.60828 14.7776 3.47765 18.2551 2.60828Z" fill="#CFCDA1"/>
              </svg>
              <span>The Values That Guide Us</span>
            </div>
            <div className="flex-1 border-t border-dashed border-[#dcd3b6]" />
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-y-8 gap-x-4">
            {values.map((value, index) => (
              <div 
                key={index} 
                className={`flex flex-col items-center text-center group px-2 relative ${
                  index < 4 ? 'md:after:content-[""] md:after:absolute md:after:right-0 md:after:top-1/4 md:after:h-1/2 md:after:w-[1px] md:after:bg-[#dcd3b6]/80' : ''
                } ${
                  index === 4 ? 'col-span-2 sm:col-span-1 md:col-span-1' : ''
                }`}
              >
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center mb-3 transition-transform duration-300 group-hover:scale-110 animate-gentle-sway">
                  <Image
                    src={value.icon}
                    alt={value.label}
                    width={80}
                    height={80}
                    className="w-16 h-16 sm:w-20 sm:h-20 object-contain"
                  />
                </div>
                <span className="text-[#4f5a30] font-body font-semibold text-[11px] sm:text-xs md:text-sm tracking-tight max-w-[145px]">
                  {value.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
