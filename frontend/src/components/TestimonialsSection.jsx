import Image from 'next/image';
import { Star } from 'lucide-react';

export default function TestimonialsSection() {
  const testimonials = [
    {
      name: 'Priya S',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150',
      rating: 5,
      text: "The taste reminds me of my grandmother's recipe. Pure, healthy and authentic.",
    },
    {
      name: 'Arun R',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150',
      rating: 5,
      text: "The taste reminds me of my grandmother's recipe. Pure, healthy and authentic.",
    },
    {
      name: 'Maya S',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=150',
      rating: 5,
      text: "The taste reminds me of my grandmother's recipe. Pure, healthy and authentic.",
    },
    {
      name: 'Anu C',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=150',
      rating: 5,
      text: "The taste reminds me of my grandmother's recipe. Pure, healthy and authentic.",
    },
  ];

  return (
    <section
      id="testimonials"
      className="w-full bg-[#fdfaf3] pt-18 pb-48 md:pb-64 px-4 sm:px-6 lg:px-8 relative overflow-hidden"
      style={{
        backgroundImage: "url('/images/testimonial-section/testimonial-section-bg.webp')",
        backgroundSize: 'cover',
        backgroundPosition: 'bottom center',
        marginTop: "-3%",
      }}
    >
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-3 reveal">
          <span className="text-[#8B5A3C] font-body text-xs md:text-sm font-bold tracking-[0.25em] uppercase block mb-3">
            What Our Customers Says
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-[48px] font-poetsen leading-tight mb-4">
            <span className="text-[#C56C4F]">Trusted</span> <span className="text-[#384401]">by Families,</span> <span className="text-[#C56C4F]">Love</span> <span className="text-[#384401]">Every Day</span>
          </h2>
          <p className="text-[#6d5e50] font-body text-sm sm:text-base max-w-xl mx-auto">
            Real Stories from real People who choose natural goodness for their families.
          </p>
        </div>

        {/* Pinned Note Cards Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-1 lg:gap-4 relative z-10">
          {testimonials.map((test, index) => {
            // Apply slight random-like rotations for realism (using deterministic index values)
            const rotations = ['-rotate-1', 'rotate-1.5', '-rotate-1.5', 'rotate-1'];
            const rot = rotations[index % rotations.length];

            return (
              <div
                key={index}
                className={`animate-float w-full flex justify-center reveal-scale ${
                  index === 0 ? 'reveal-delay-100' :
                  index === 1 ? 'reveal-delay-200' :
                  index === 2 ? 'reveal-delay-300' : 'reveal-delay-400'
                }`}
              >
                <div
                  className={`relative bg-transparent pb-8 px-6 sm:px-7 transition-transform duration-300 hover:scale-105 flex flex-col justify-between mx-auto select-none cursor-pointer ${rot}`}
                  style={{
                    backgroundImage: "url('/images/testimonial-section/testimonial-card-bg.webp')",
                    backgroundSize: '100% 100%',
                    backgroundRepeat: 'no-repeat',
                  }}
                >
                  {/* Content wrapper */}
                  <div className="flex flex-col items-start w-full pt-30">
                    {/* Quote Mark - Left Aligned */}
                    <span className="text-[#384401] font-serif text-[48px] leading-[0.2] block mt-1 mb-2 pl-1 select-none font-bold">“</span>

                    {/* Stars - Left Aligned */}
                    <div className="flex items-center justify-start gap-1 mb-4 pl-1 mx-auto">
                      {[...Array(test.rating)].map((_, i) => (
                        <Star key={i} className="w-[14px] h-[14px] fill-[#f5b823] text-[#f5b823]" />
                      ))}
                    </div>

                    {/* Review Text - Centered */}
                    <p className="text-[#3d2b1f] font-body text-[13px] leading-relaxed font-semibold text-center w-full px-2 mb-4 max-w-[200px]">
                      {test.text}
                    </p>
                  </div>

                  {/* Reviewer Details - Left Aligned */}
                  <div className="flex items-center justify-start gap-3 pt-3 border-t border-[#eeddb9]/50 w-[90%] mx-auto mt-2 pl-1 mb-3">
                    <div className="relative w-10 h-10 rounded-full overflow-hidden border border-[#c5b799]/40 shadow-sm flex-shrink-0">
                      <Image
                        src={test.avatar}
                        alt={test.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <span className="text-[#3d2b1f] font-body font-bold text-[13px]">
                      {test.name}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

