import Image from 'next/image';
import Link from 'next/link';


export default function Footer() {
  const features = [
    {
      icon: '/images/footer/oragnic-icon.svg',
      title: '100% Organic',
      desc: 'Pure & Natural Products',
    },
    {
      icon: '/images/footer/fast-delivery-icon.svg',
      title: 'Fast Delivery',
      desc: 'On Time, Every Time',
    },
    {
      icon: '/images/footer/secure-payment-icon.svg',
      title: 'Secure Payment',
      desc: '100% Safe & Secure',
    },
    {
      icon: '/images/footer/customer-support-icon.svg',
      title: 'Customer Support',
      desc: "We're Here to Help",
    },
  ];

  return (
    <footer id="contact" translate="no" className="notranslate w-full bg-[#fbf6eb] relative pt-0">
      
      {/* 1. Top Value Features Row - Wavy container */}
      <div 
        className="w-full relative z-20 min-h-[200px] md:min-h-[200px] flex items-center -mt-10 md:-mt-16">
          <Image
            src="/images/footer/features-icons-bg.svg"
            fill
            alt="features-icons-bg"
            className="absolute inset-0 w-full h-full object-fill pointer-events-none hidden sm:block"
            priority
          />
          
        <div className="max-w-screen-2xl relative z-10 mx-auto w-full mb-2 md:mb-5 px-4 sm:px-6 lg:px-8 py-4 md:py-12 mt-2 sm:mt-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-6 lg:gap-0 items-center justify-items-center bg-white sm:bg-transparent border border-stone-200/50 sm:border-0 rounded-[24px] sm:rounded-none py-6 px-4 sm:p-0 shadow-sm sm:shadow-none">
            {features.map((feat, index) => (
              <div 
                key={index} 
                className={`flex items-center gap-2 sm:gap-4 w-full px-2 sm:px-6 justify-start sm:justify-center ${
                  index < 3 ? 'lg:border-r lg:border-[#2b3c0c]/20' : ''
                }`}
              >
                <div className="shrink-0 relative w-9 h-9">
                  <Image 
                    src={feat.icon} 
                    alt={feat.title} 
                    fill 
                    className="object-contain" 
                  />
                </div>
                <div className="text-left">
                  <h4 className="text-[#2b3c0c] font-body font-bold text-sm sm:text-base leading-tight">
                    {feat.title}
                  </h4>
                  <p className="text-stone-500 font-body text-xs sm:text-sm mt-0.5 font-medium">
                    {feat.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
 
      {/* 2. Main Footer Content - Links & Contacts */}
      <div className="bg-[#fbf6eb] pt-4 sm:pt-12 pb-0">
        <div className="w-full pb-6 mx-auto max-w-[90%] sm:max-w-[90%] min-[1700px]:max-w-[80%]">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10">
            
            {/* Column 1: Brand Info */}
            <div className="lg:col-span-3 flex flex-col items-start lg:pr-6 reveal reveal-delay-100">
              <h2 className="text-4xl sm:text-5xl font-poetsen text-stone-900 mb-6 font-bold tracking-wide">
                LOGO
              </h2>
              <p className="text-stone-700 font-body text-sm sm:text-base leading-relaxed mb-6 font-semibold max-w-xs">
                Traditional Goodness, From Our Village to Your Family.
              </p>
              {/* Social circles */}
              <div className="flex items-center gap-3">
                <a href="#" className="w-8 h-8 rounded-full bg-[#1877f2]/10 flex items-center justify-center text-[#1877f2] hover:scale-110 transition-transform" aria-label="Facebook">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
                <a href="#" className="w-8 h-8 rounded-full bg-[#e1306c]/10 flex items-center justify-center text-[#e1306c] hover:scale-110 transition-transform" aria-label="Instagram">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>
                  </svg>
                </a>
                <a href="#" className="w-8 h-8 rounded-full bg-[#ff0000]/10 flex items-center justify-center text-[#ff0000] hover:scale-110 transition-transform" aria-label="YouTube">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.107C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.388.511a3.002 3.002 0 0 0-2.11 2.107C0 8.053 0 12 0 12s0 3.947.502 5.837a3.003 3.003 0 0 0 2.11 2.107C4.495 20.455 12 20.455 12 20.455s7.505 0 9.388-.511a3.002 3.002 0 0 0 2.11-2.107C24 15.947 24 12 24 12s0-3.947-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </a>
                <a href="#" className="w-8 h-8 rounded-full bg-[#25d366]/10 flex items-center justify-center text-[#25d366] hover:scale-110 transition-transform" aria-label="WhatsApp">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                </a>
              </div>
            </div>

            {/* Column 2: Quick Links */}
            <div className="lg:col-span-3 lg:border-l lg:border-stone-300/60 lg:pl-8 reveal reveal-delay-200">
              <h4 className="text-[#1a110a] font-body font-bold text-sm tracking-wider uppercase mb-5">
                Quick Links
              </h4>
              <ul className="flex flex-col gap-3">
                {[
                  { label: 'Home', href: '/' },
                  { label: 'About Us', href: '/#our-story' },
                  { label: 'Product', href: '/products' },
                  { label: 'Gallery', href: '/#gallery' },
                  { label: 'Contact Us', href: '/contact' }
                ].map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="flex items-center gap-1.5 text-[#6d5e50] font-body text-sm font-semibold hover:text-[#384401] transition-colors group">
                      <span className="text-[#C56C4F] transition-transform group-hover:translate-x-0.5 font-bold mr-1">&gt;</span>
                      <span>{link.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 3: Customer Service */}
            <div className="lg:col-span-3 lg:border-l lg:border-stone-300/60 lg:pl-8 reveal reveal-delay-300">
              <h4 className="text-[#1a110a] font-body font-bold text-sm tracking-wider uppercase mb-5">
                Customer Service
              </h4>
              <ul className="flex flex-col gap-3">
                {[
                  { label: 'Shipping & Delivery', href: '/policies/shipping-policy' },
                  { label: 'Return & Refund', href: '/policies/return-policy' },
                  { label: 'Terms & Conditions', href: '/policies/terms-conditions' },
                  { label: 'Privacy Policy', href: '/policies/privacy-policy' },
                  { label: 'FAQ', href: '/products/m-1' },
                ].map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="flex items-center gap-1.5 text-[#6d5e50] font-body text-sm font-semibold hover:text-[#384401] transition-colors group">
                      <span className="text-[#C56C4F] transition-transform group-hover:translate-x-0.5 font-bold mr-1">&gt;</span>
                      <span>{link.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 4: Contact Us */}
            <div className="lg:col-span-3 lg:border-l lg:border-stone-300/60 lg:pl-8 reveal reveal-delay-400">
              <h4 className="text-[#1a110a] font-body font-bold text-sm tracking-wider uppercase mb-5">
                Contact Us
              </h4>
              <ul className="flex flex-col gap-4">
                <li className="flex items-center gap-3">
                  <div className="w-6 h-6 flex items-center justify-center shrink-0">
                    <svg width="20" height="20" viewBox="0 0 31 31" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M5.91422 24.3506C5.32386 24.3506 4.83132 24.1533 4.43661 23.7585C4.0419 23.3638 3.84412 22.8709 3.84326 22.2797V8.48013C3.84326 7.88978 4.04104 7.39724 4.43661 7.00253C4.83218 6.60782 5.32428 6.41003 5.91293 6.40918H24.8411C25.4307 6.40918 25.9228 6.60696 26.3175 7.00253C26.7122 7.39809 26.91 7.89063 26.9108 8.48013V22.2809C26.9108 22.8704 26.713 23.363 26.3175 23.7585C25.9219 24.1541 25.4298 24.3515 24.8411 24.3506H5.91422ZM15.6769 15.2799C15.7692 15.2475 15.8606 15.2077 15.9512 15.1608L25.2154 9.09527C25.3367 9.02179 25.4157 8.92141 25.4524 8.79411C25.4892 8.66681 25.4823 8.53994 25.4319 8.41349C25.3995 8.2486 25.2918 8.12899 25.109 8.05467C24.927 7.98119 24.7506 7.99614 24.5797 8.09952L15.377 14.0984L6.17565 8.1008C6.00478 7.99657 5.8322 7.97436 5.65791 8.03416C5.48362 8.09397 5.3717 8.21187 5.32215 8.38786C5.2726 8.51943 5.26619 8.65314 5.30293 8.78898C5.33966 8.92482 5.41826 9.02735 5.53873 9.09655L14.8029 15.1608C14.8935 15.2077 14.9849 15.2475 15.0772 15.2799C15.1703 15.3115 15.2702 15.3274 15.377 15.3274C15.4838 15.3274 15.5838 15.3115 15.6769 15.2799Z" fill="#427024"/>
                    </svg>
                  </div>
                  <span className="text-[#6d5e50] font-body text-sm font-semibold leading-normal">
                    Support@gmail.com
                  </span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-6 h-6 flex items-center justify-center shrink-0">
                    <svg width="20" height="20" viewBox="0 0 31 31" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9.9592 3.12387L11.3394 2.68303C12.6312 2.27037 14.0127 2.93805 14.5663 4.24265L15.6684 6.84159C16.149 7.97319 15.8824 9.3047 15.0097 10.1326L12.5838 12.4368C12.7333 13.8157 13.1964 15.1728 13.973 16.5082C14.7115 17.7998 15.701 18.9305 16.8833 19.8338L19.8001 18.8598C20.9048 18.492 22.1081 18.9162 22.786 19.9119L24.3649 22.2315C25.1543 23.39 25.0121 24.9868 24.0343 25.9684L22.986 27.0206C21.9428 28.0676 20.4537 28.4482 19.0747 28.0176C15.8214 27.0026 12.8298 23.9898 10.1002 18.979C7.36709 13.9596 6.40253 9.70154 7.20647 6.20467C7.5448 4.73347 8.59309 3.56087 9.96177 3.12387" fill="#427024"/>
                    </svg>
                  </div>
                  <span className="text-[#6d5e50] font-body text-sm font-semibold leading-normal">
                    +91 9875785646
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 flex items-center justify-center shrink-0 mt-0.5">
                    <svg width="20" height="20" viewBox="0 0 31 31" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M15.3787 2.56445C9.72716 2.56445 5.12646 7.16515 5.12646 12.8167C5.08802 21.0698 14.251 27.6825 14.6354 27.9644C14.8533 28.1182 15.1224 28.2079 15.3787 28.2079C15.635 28.2079 15.9041 28.131 16.122 27.9644C16.5065 27.6825 25.6694 21.0826 25.631 12.8167C25.631 7.16515 21.0303 2.56445 15.3787 2.56445ZM15.3787 17.9428C12.5465 17.9428 10.2526 15.6489 10.2526 12.8167C10.2526 9.98452 12.5465 7.69058 15.3787 7.69058C18.2109 7.69058 20.5048 9.98452 20.5048 12.8167C20.5048 15.6489 18.2109 17.9428 15.3787 17.9428Z" fill="#427024"/>
                    </svg>
                  </div>
                  <span className="text-[#6d5e50] font-body text-sm font-semibold leading-normal">
                    123, Organic Street, Tamil Nadu -641401
                  </span>
                </li>
              </ul>
            </div>

          </div>
        </div>

        {/* 3. Footer bottom illustration image */}
        <div className="w-full mt-4">
          <img
            src="/images/footer-bottom-image.webp"
            alt="Village scenery landscape footer illustration"
            className="w-full h-auto block"
          />
        </div>
      </div>

      {/* 4. Copyright bottom bar */}
      <div className="bg-[#fbf6eb] py-6 border-t border-[#ebdcc1]/40 -mt-8">
        <div className="mx-auto px-6 sm:px-12 lg:px-16 flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="text-[#8e7e6f] font-body text-sm text-center md:text-left font-semibold">
            @ 2026 Village Made. All Rights Reserved.
          </span>
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[#8e7e6f] font-body text-sm font-semibold">
            {[
              { label: 'Privacy Policy', slug: 'privacy-policy' },
              { label: 'Terms & Conditions', slug: 'terms-conditions' },
              { label: 'Shipping Policy', slug: 'shipping-policy' },
              { label: 'Return Policy', slug: 'return-policy' },
              { label: 'Cancellation Policy', slug: 'cancellation-policy' },
              { label: 'Cookie Policy', slug: 'cookie-policy' },
              { label: 'Sitemap', slug: 'sitemap' }
            ].map((policy, idx) => (
              <span key={policy.slug} className="flex items-center">
                <Link href={`/policies/${policy.slug}`} className="hover:text-[#384401] transition-colors">
                  {policy.label}
                </Link>
                {idx < 6 && <span className="mx-2 text-stone-400">|</span>}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
