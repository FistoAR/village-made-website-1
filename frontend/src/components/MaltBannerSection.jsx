import { ArrowRight } from 'lucide-react';

export default function MaltBannerSection() {
  return (
    <section className="w-full bg-[#fefdfd] py-10 px-4 sm:px-6 lg:px-8">
      <div
        className="max-w-7xl mx-auto relative min-h-[280px] md:min-h-[350px] lg:min-h-[370px] flex items-center py-6 md:py-8 px-8 sm:px-16 md:px-20 lg:px-24 mb-5"
        style={{
          backgroundImage: "url('/images/hero-banner-background.webp')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Semi-transparent overlay to ensure readability on small screens */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#fbf6eb]/90 via-[#fbf6eb]/30 to-transparent md:bg-none pointer-events-none" />

        <div className="w-full relative z-10">
          <div className="max-w-md md:max-w-xl flex flex-col items-start text-left bg-[#fbf6eb]/90 md:bg-transparent p-6 md:p-0 rounded-2xl md:rounded-none backdrop-blur-sm md:backdrop-blur-none border border-[#eeddb9]/40 md:border-none shadow-sm md:shadow-none reveal">
            {/* Label Badge */}
            <div className="bg-[#5a6a34] text-[#FDFBF7] font-jakarta font-medium text-[10px] sm:text-xs md:text-sm px-4 py-1.5 md:px-6 md:py-2.5 mb-4 md:mb-6 rounded-[24px_8px_20px_12px] shadow-sm select-none">
              Made the Traditional Way
            </div>

            {/* Heading */}
            <h2 className="text-2xl sm:text-3xl md:text-[40px] lg:text-[48px] font-poetsen leading-[1.15] mb-4 md:mb-6 flex flex-col">
              <span className="text-[#384401]">Healthy Mornings</span>
              <span className="text-[#C56C4F] mt-0.5 md:mt-1">Begin Here</span>
            </h2>

            {/* Description */}
            <p className="text-[#3E2C1C]/90 font-body text-xs sm:text-sm md:text-base lg:text-lg mb-6 md:mb-8 max-w-sm md:max-w-md leading-relaxed font-medium">
              Discover our range of handcrafted malt products made with love, tradition and the goodness of nature.
            </p>

            {/* CTA Button */}
            <button className="group flex items-center gap-2.5 bg-[#2b3c0c] hover:bg-[#3d5414] text-white font-jakarta font-semibold px-5 py-2.5 md:px-6 md:py-3.5 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 select-none cursor-pointer text-xs md:text-sm animate-btn-pulse">
              <span>Shop Now</span>
              <span className="flex items-center justify-center w-5 h-5 md:w-6 md:h-6 bg-white rounded-full text-[#2b3c0c] transition-transform duration-300 group-hover:translate-x-1">
                <ArrowRight className="w-3 h-3 md:w-3.5 md:h-3.5 stroke-[3]" />
              </span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
