import Image from 'next/image';
import Link from 'next/link';
import { Mail, Phone, MapPin } from 'lucide-react';

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
                  <span className="flex items-center justify-center w-8 h-8 rounded-md bg-[#5a6a34]/10 text-[#5a6a34] shrink-0">
                    <Phone className="w-4 h-4 fill-current text-[#384401]" />
                  </span>
                  <span className="text-[#6d5e50] font-body text-sm font-semibold leading-normal">
                    +91 9875785646
                  </span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="flex items-center justify-center w-8 h-8 rounded-md bg-[#5a6a34]/10 text-[#5a6a34] shrink-0">
                    <Mail className="w-4 h-4 fill-current text-[#384401]" />
                  </span>
                  <span className="text-[#6d5e50] font-body text-sm font-semibold leading-normal">
                    Support@gmail.com
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex items-center justify-center w-8 h-8 rounded-md bg-[#5a6a34]/10 text-[#5a6a34] shrink-0 mt-0.5">
                    <MapPin className="w-4 h-4 text-[#384401]" />
                  </span>
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
