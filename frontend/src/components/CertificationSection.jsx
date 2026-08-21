import Image from 'next/image';

export default function CertificationSection() {
  const certificates = [
    { name: 'FSSAI', src: '/images/certificates/new/fssai.webp' },
    { name: 'MSME', src: '/images/certificates/new/msme.webp' },
    { name: 'PURE VEG', src: '/images/certificates/new/pure-veg.webp' },
    // { name: 'ISO 22000', src: '/images/certificates/iso.webp' },
    // { name: 'USDA Organic', src: '/images/certificates/usda-organic.webp' },
    // { name: 'APEDA', src: '/images/certificates/apeda.webp' },
    // { name: 'HALAL', src: '/images/certificates/halal.webp' },
    // { name: 'GMP', src: '/images/certificates/gmp.webp' },
    // { name: 'Green Leaf', src: '/images/certificates/green-leaf.webp' },
  ];

  return (
    <section className="w-full bg-white pt-14 pb-0 relative overflow-hidden flex flex-col justify-center">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full z-10 relative">
        {/* Header with Leaf Icon (Perfectly Centered) */}
        <div className="flex items-center justify-center gap-2 sm:gap-3 w-full mb-10 sm:mb-12 reveal">
          <Image
            src="/images/why-choose/title-leaf.svg"
            alt="Leaf Icon"
            width={64}
            height={58}
            className="w-10 h-9 sm:w-14 sm:h-13 lg:w-16 lg:h-15 shrink-0 rotate-[-12deg]"
          />
          <h2 
            className="text-xl sm:text-3xl lg:text-[48px] text-[#4a3525] leading-tight text-center"
            style={{ fontFamily: "'Poetsen One', sans-serif" }}
          >
            Quality & Certification
          </h2>
        </div>

        {/* Certificates Grid Row (Single Row on Desktop) */}
        <div className="flex flex-wrap md:flex-nowrap items-center justify-center gap-4 sm:gap-6 md:gap-8 lg:gap-10 py-4 w-full reveal-scale">
          {certificates.map((cert) => (
            <div
              key={cert.name}
              className="relative w-14 h-14 sm:w-20 sm:h-20 md:w-20 md:h-20 lg:w-28 lg:h-28 xl:w-36 xl:h-36 transition-transform duration-300 hover:scale-110 shrink-0"
            >
              <Image
                src={cert.src}
                alt={cert.name}
                fill
                className="object-contain"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Background illustration at the bottom (Responsive margins and height) */}
      <div className="relative w-full">
        <Image
          src="/images/certificates/certification-image-bg.webp"
          alt="Village background scenery"
          width={1920}
          height={300}
          className="w-full h-auto block relative z-10 -mt-10 sm:-mt-16 md:-mt-9 lg:-mt-14 xl:-mt-16 pointer-events-none"
          priority
        />

        <div style={{backgroundColor: "#FBF6EC", width: "100%", height: "35%", position: "absolute", bottom: 0, left: 0, zIndex: 0}}></div>

      </div>
      
    </section>
  );
}
