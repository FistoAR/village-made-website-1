import Image from 'next/image';

export default function WhyChooseSection() {
  const points = [
    {
      iconSrc: '/images/why-choose/svg-icons/natural-ingredients.svg',
      title: '100% Natural Ingredients',
      description: 'Made with carefully selected natural ingredients.',
    },
    {
      iconSrc: '/images/why-choose/svg-icons/no-preservatives.svg',
      title: 'No Preservatives',
      description: 'Free from artificial colours, flavours, and preservatives.',
    },
    {
      iconSrc: '/images/why-choose/svg-icons/traditional-recipies.svg',
      title: 'Traditional Recipes',
      description: 'Prepared using authentic village recipes.',
    },
    {
      iconSrc: '/images/why-choose/svg-icons/healthy_and_nutritious.svg',
      title: 'Healthy & Nutritious',
      description: 'Rich in natural goodness for everyday wellness.',
    },
    {
      iconSrc: '/images/why-choose/svg-icons/trusted-quality.svg',
      title: 'Trusted Quality',
      description: 'Hygienically prepared and packed with care.',
    },
  ];

  return (
    <section id="why-choose" className="w-full relative min-h-[600px] bg-[#dfc086] overflow-hidden flex flex-col xl:flex-row">
      {/* Left side Image with blend overlay */}
      <div className="w-full xl:w-1/2 min-h-[300px] sm:min-h-[400px] xl:min-h-full relative xl:absolute xl:left-0 xl:top-0 xl:bottom-0">
        <Image
          src="/images/why-choose/why-choose-product-image.webp"
          alt="Village Made products showcase"
          fill
          className="object-cover object-center xl:object-left"
          priority
        />
      </div>

      {/* Right Column - Spacer for absolute layout on desktop, normal column on mobile */}
      <div className="hidden xl:block xl:w-1/2 pointer-events-none" />

      {/* Right Content */}
      <div className="w-full xl:w-1/2 px-4 py-12 sm:px-12 xl:pl-20 xl:pr-14 xl:py-20 flex flex-col justify-center relative z-10 bg-[#dfc086]">
        {/* Title and Subtext aligned block */}
        <div className="flex flex-col xl:flex-row items-center xl:items-start gap-3 xl:gap-4 mb-6 w-full text-center xl:text-left reveal">
          {/* Leaf Icon (Enlarged) */}
          <div className="shrink-0 pt-1 xl:pt-2 animate-sway-3">
            <Image
              src="/images/why-choose/title-leaf.svg"
              alt="Leaf Icon"
              width={64}
              height={58}
              className="w-12 h-12 sm:w-16 sm:h-16 xl:w-20 xl:h-20 shrink-0"
            />
          </div>

          {/* Texts Column */}
          <div className="flex flex-col flex-grow items-center xl:items-start">
            <div className="flex items-center justify-center xl:justify-start gap-2 w-full mb-2 mt-1 xl:mt-2">
              <h2 
                className="text-2xl sm:text-4xl xl:text-[48px] text-[#000000] leading-tight text-center xl:text-left"
                style={{ fontFamily: "'Poetsen One', sans-serif" }}
              >
                Why Choose <span className="text-[#b85c37]">Village Made</span> ?
              </h2>
              <div className="hidden sm:block flex-grow h-[1px] bg-[#c5b799]/60 ml-4" />
            </div>

            {/* Subtitles */}
            <p className="text-[#000000] font-inter text-sm sm:text-base md:text-lg font-normal">
              Wholesome goodness from our village home.
            </p>
            <p className="text-[#000000] font-inter text-sm sm:text-base md:text-lg mb-6 sm:mb-8">
              Choose from wide range of healthy & traditional products.
            </p>
          </div>
        </div>

        {/* Points List with overlapping scalloped style */}
        <div className="flex flex-col gap-5 sm:gap-6 w-full relative xl:ml-[-9.5%]">
          {points.map((point, index) => (
            <div 
              key={index} 
              className={`flex items-center gap-3 sm:gap-4 relative group w-full min-h-[70px] sm:min-h-[80px] reveal-right ${
                index === 0 ? 'reveal-delay-100' :
                index === 1 ? 'reveal-delay-200' :
                index === 2 ? 'reveal-delay-300' :
                index === 3 ? 'reveal-delay-400' : 'reveal-delay-500'
              }`}
            >
              <div 
                className="xl:absolute xl:-left-14 xl:top-1/2 xl:-translate-y-1/2 w-16 h-16 sm:w-20 sm:h-20 xl:w-26 xl:h-26 rounded-full flex items-center justify-center z-10 shadow-sm shrink-0 animate-pulse-glow"
                style={{ backgroundColor: '#dfc086' }}
              >
                {/* Circular Badge Icon SVG */}
                <div className="w-12 h-12 sm:w-16 sm:h-16 xl:w-20 xl:h-20 shrink-0 relative transition-transform duration-300 group-hover:scale-105">
                  <Image
                    src={point.iconSrc}
                    alt={point.title}
                    fill
                    className="object-contain"
                  />
                </div>
              </div>

              {/* Dashed connecting line with dot at the end */}
              <div className="hidden xl:flex items-center w-17 xl:w-21 shrink-0 xl:ml-12 relative">
                <div className="animate-dash-line" />
                <div className="w-2.5 h-2.5 rounded-full bg-black shrink-0 ml-[-4px]" />
              </div>

              {/* Text Card Box */}
              <div 
                className="flex-grow w-full xl:w-[78%] p-3 sm:p-5 transition-all duration-300 z-20 rounded-xl"
                style={{
                  background: index % 2 === 0
                      ? "linear-gradient(90deg, rgba(246, 233, 215, 0) 21.49%, rgba(247, 234, 216, 0.7) 69.9%)"
                      : "linear-gradient(90deg, rgba(246, 233, 215, 0) 21.49%, #F2EBD8 69.9%)"
                }}>
                <h4 className="text-[#4f5a30] font-jakarta font-bold text-sm sm:text-xl mb-1">
                  {point.title}
                </h4>
                <p className="text-[#000000] font-body text-xs sm:text-lg leading-normal">
                  {point.description}
                </p>
              </div>  
            </div>
          ))}
        </div>
      </div>
      {/* Decorative right bottom image (Desktop only) */}
      <div className="hidden xl:block absolute right-0 bottom-0 w-56 h-[480px] z-30 pointer-events-none animate-sway-1">
        <Image
          src="/images/why-choose/why-choose-right-image.webp"
          alt="decorative grain plant"
          fill
          className="object-contain object-bottom object-right"
        />
      </div>
    </section>
  );
}
