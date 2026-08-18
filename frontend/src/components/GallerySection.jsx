import Image from 'next/image';
import { useState, useRef, useEffect } from 'react';
import { Play, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useApp } from '@/lib/context/AppContext';

const Youtube = (props) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    {...props}
  >
    <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.107C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.388.511a3.002 3.002 0 0 0-2.11 2.107C0 8.053 0 12 0 12s0 3.947.502 5.837a3.003 3.003 0 0 0 2.11 2.107c1.883.511 9.388.511 9.388.511s7.505 0 9.388-.511a3.002 3.002 0 0 0 2.11-2.107C24 15.947 24 12 24 12s0-3.947-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
);

// Helper to extract YouTube Video ID
const getYouTubeId = (url) => {
  if (!url) return null;
  const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i);
  return match ? match[1] : null;
};

// Helper to get YouTube Thumbnail
const getYouTubeThumbnail = (url) => {
  const id = getYouTubeId(url);
  return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : '/images/product-section/product-placeholder-rimage.webp';
};

export default function GallerySection() {
  const { galleryItems } = useApp();
  const [activeMedia, setActiveMedia] = useState(null);
  const scrollRef = useRef(null);
  const sectionRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  // Filter to only active YouTube items from DB
  const dbYouTubeItems = galleryItems
    ? galleryItems.filter(item => item.type === 'youtube' && item.active !== false)
    : [];

  // Fallback to static YouTube items if DB has none
  const displayItems = dbYouTubeItems.length > 0 ? dbYouTubeItems : [
    { id: 1, title: 'Our Village Journey', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', type: 'youtube', display_order: 1 }
  ];

  // Intersection Observer to detect visibility
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.15 }
    );
    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }
    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  // Autoplay sliding interval
  useEffect(() => {
    if (!isVisible || displayItems.length <= 1) return;

    const interval = setInterval(() => {
      if (scrollRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
        
        // If we are at the end, wrap back to the beginning
        if (scrollLeft + clientWidth >= scrollWidth - 10) {
          scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          // Scroll by one card's width + gap
          const firstCard = scrollRef.current.children[0];
          const cardWidth = firstCard ? firstCard.clientWidth : clientWidth / 4;
          scrollRef.current.scrollTo({
            left: scrollLeft + cardWidth + 24, // card width + gap-6
            behavior: 'smooth'
          });
        }
      }
    }, 7000); // Auto-slide every 7 seconds

    return () => clearInterval(interval);
  }, [isVisible, displayItems]);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollAmount = clientWidth * 0.75;
      scrollRef.current.scrollTo({
        left: direction === 'left' ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section ref={sectionRef} id="gallery" className="w-full bg-[#bf964f] py-20 relative overflow-hidden">
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
      <div className="w-full mb-6 relative">
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
      <div className="w-full mb-12 text-center px-4">
        <p className="text-stone-900 font-body text-sm sm:text-base font-semibold leading-relaxed max-w-4xl mx-auto text-[#3d2b1f]/90">
          Explore our journey through videos of our village, our process and the love we put into every product.
        </p>
      </div>

      <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10 group/carousel">
        {/* Navigation Buttons */}
        <button
          onClick={() => scroll('left')}
          className="absolute left-1 sm:left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 bg-white/90 hover:bg-white text-stone-900 rounded-full flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all border border-stone-200 cursor-pointer md:opacity-0 md:group-hover/carousel:opacity-100"
          aria-label="Scroll Left"
        >
          <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
        <button
          onClick={() => scroll('right')}
          className="absolute right-1 sm:right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 bg-white/90 hover:bg-white text-stone-900 rounded-full flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all border border-stone-200 cursor-pointer md:opacity-0 md:group-hover/carousel:opacity-100"
          aria-label="Scroll Right"
        >
          <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        {/* Carousel Container */}
        <div 
          ref={scrollRef}
          className="flex overflow-x-auto gap-6 scroll-smooth snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] py-4 px-1"
        >
          {displayItems.map((item, idx) => {
            const videoId = getYouTubeId(item.url);

            return (
              <div
                key={item.id || idx}
                className="flex flex-col gap-3 flex-shrink-0 snap-center
                  w-[80%]
                  sm:w-[45%]
                  lg:w-[30%]
                  xl:w-[22%]
                  min-w-[280px]"
              >
                {/* Video wrapper */}
                <div className="relative w-full min-h-[500px] rounded-[28px] overflow-hidden shadow-[0_20px_40px_rgba(0,0,0,0.15)] hover:shadow-[0_28px_55px_rgba(0,0,0,0.22)] hover:-translate-y-1 transition-all duration-300 border border-white/25 bg-black">
                  {videoId ? (
                    <iframe
                      src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&playlist=${videoId}&loop=1&controls=0&modestbranding=1&rel=0`}
                      className="w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      title={item.title}
                    ></iframe>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white bg-stone-900">
                      <span className="text-xs font-bold font-jakarta">Video Unplayable</span>
                    </div>
                  )}
                </div>

                {/* Title below */}
                <div className="px-2 font-jakarta text-center">
                  <h4 className="text-xs font-black text-stone-900 uppercase tracking-widest truncate leading-tight">
                    {item.title}
                  </h4>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Lightbox / Video Player Modal */}
      {activeMedia && (
        <div 
          className="fixed inset-0 z-[500] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setActiveMedia(null)}
        >
          <div 
            className="w-full max-w-[1600px] relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={() => setActiveMedia(null)}
              className="absolute -top-12 right-0 p-2 text-white hover:text-stone-300 bg-white/10 hover:bg-white/20 rounded-full transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="aspect-video w-full rounded-[24px] overflow-hidden bg-black border border-white/10 shadow-2xl">
              {getYouTubeId(activeMedia.url) ? (
                <iframe
                  src={`https://www.youtube.com/embed/${getYouTubeId(activeMedia.url)}?autoplay=1`}
                  className="w-full h-full border-0"
                  allow="autoplay; encrypted-media"
                  allowFullScreen
                  title={activeMedia.title}
                ></iframe>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white">
                  <span className="text-sm font-bold">Unable to load video</span>
                </div>
              )}
            </div>

            <div className="text-white mt-4 text-center font-jakarta">
              <h4 className="text-base font-extrabold uppercase tracking-widest">{activeMedia.title}</h4>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
