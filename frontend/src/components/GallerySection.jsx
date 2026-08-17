import Image from 'next/image';

export default function GallerySection() {
  const items = [
    {
      url: '/images/product-section/product-placeholder-rimage.webp',
      title: 'Our Multi Grain Malt',
    },
    {
      url: '/images/process-section/hygienic-packing.webp',
      title: 'Hygienic Packaging',
    },
    {
      url: '/images/why-choose/why-choose-product-image.webp',
      title: 'Pure Ingredients',
    },
    {
      url: '/images/process-section/delivered-fresh.webp',
      title: 'Freshly Delivered',
    },
  ];

  return (
    <section id="gallery" className="w-full bg-[#bf964f] py-20 relative overflow-hidden">
      {/* Import Google Font Splash */}
      <link href="https://fonts.googleapis.com/css2?family=Splash&display=swap" rel="stylesheet" />

      {/* Decorative leaf in top-right corner */}
      <div className="absolute top-0 right-0 w-24 h-24 sm:w-36 sm:h-36 md:w-64 md:h-64 z-10 pointer-events-none animate-sway-2">
        <Image
          src="/images/gallery/gallery-leaf-image.webp"
          alt="Decorative Leaf"
          fill
          className="object-contain object-right"
          priority
        />
      </div>

      {/* Header aligned flush to the left screen edge */}
      <div className="w-full mb-6 relative reveal">
        {/* Horizontal line starting from the very left edge of the screen */}
        <div className="hidden md:block absolute left-0 top-[20px] sm:top-[24px] lg:top-[28px] w-[30%] lg:w-[38%] h-[1px] bg-stone-900/30"></div>
        
        {/* Heading */}
        <div className="ml-0 md:ml-[35%] lg:ml-[40%] text-center md:text-left px-6">
          <h2 className="text-3xl sm:text-4xl lg:text-[48px] flex flex-col sm:flex-row items-center sm:items-baseline justify-center sm:justify-start gap-1 sm:gap-3 leading-tight sm:leading-none">
            <span 
              className="normal-case text-[#384401]"
              style={{ fontFamily: "'Splash', cursive", fontSize: '42px', fontWeight: 'normal' }}
            >
              Our Village
            </span>
            <span className="font-poetsen text-stone-900 font-bold">Gallery</span>
          </h2>
        </div>
      </div>

      {/* Subtitle centered below */}
      <div className="w-full mb-12 text-center px-4 reveal">
        <p className="text-stone-900 font-body text-sm sm:text-base font-semibold leading-relaxed max-w-4xl mx-auto">
          Explore our journey through videos of our village, our process and the love we put into every product.
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* 4-column Card Layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((item, idx) => (
            <div
              key={idx}
              className={`bg-white rounded-[28px] shadow-[0_15px_30px_rgba(0,0,0,0.06)] aspect-[3/4] flex flex-col justify-between hover:-translate-y-1.5 transition-all duration-300 group reveal-scale ${
                idx === 0 ? 'reveal-delay-100' :
                idx === 1 ? 'reveal-delay-200' :
                idx === 2 ? 'reveal-delay-300' : 'reveal-delay-400'
              }`}
            >
              <div className="relative w-full h-full rounded-[20px] overflow-hidden">
                <Image
                  src={item.url}
                  alt={item.title}
                  fill
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
