'use client';

import { use, useMemo } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Shield, BookOpen, Truck, RotateCcw, Ban, Cookie, Map, ChevronRight } from 'lucide-react';

interface Section {
  heading: string;
  content: string;
}

interface Policy {
  title: string;
  tagline: string;
  icon: any;
  sections: Section[];
}

const POLICIES: Record<string, Policy> = {
  'privacy-policy': {
    title: 'Privacy Policy',
    tagline: 'How we collect, protect, and manage your personal data.',
    icon: Shield,
    sections: [
      {
        heading: '1. Information We Collect',
        content: 'We collect information you provide directly to us when placing an order, registering an account, subscribing to our newsletters, or interacting with customer support. This includes contact details (name, email, phone number, address) and payment transaction indicators.',
      },
      {
        heading: '2. How We Use Your Data',
        content: 'Your data helps us process orders, schedule reliable deliveries, send notifications about product availability, and optimize our store recommendations. We never trade or sell your personal details to advertising networks.',
      },
      {
        heading: '3. Security Protocols',
        content: 'We employ Secure Socket Layer (SSL) encryption to secure all checkouts. Data storage undergoes routine security reviews to protect against unauthorized entry, loss, or alteration.',
      },
    ],
  },
  'terms-conditions': {
    title: 'Terms & Conditions',
    tagline: 'The agreement governing your use of our farm-to-family platform.',
    icon: BookOpen,
    sections: [
      {
        heading: '1. General Terms',
        content: 'By browsing the Village Made Organics marketplace, you acknowledge and agree to comply with our conditions of use. Our services are intended for personal, non-commercial culinary consumption.',
      },
      {
        heading: '2. Product Descriptions',
        content: 'We aim to provide precise details regarding our traditional grains, health mixes, and organic malts. Slight variances in natural product batches, texture, or color are normal and reflect authenticity.',
      },
      {
        heading: '3. User Accounts',
        content: 'You are responsible for keeping account passwords secure and confidential. Any activities conducted under your account are your sole responsibility.',
      },
    ],
  },
  'shipping-policy': {
    title: 'Shipping Policy',
    tagline: 'How we deliver freshness from our village community straight to your door.',
    icon: Truck,
    sections: [
      {
        heading: '1. Shipping Locations & Partners',
        content: 'We ship orders nationwide using trusted express courier partners. Freshly prepared batches are dispatched from our Tamil Nadu hub to ensure maximum shelf life and taste.',
      },
      {
        heading: '2. Delivery Timeframes',
        content: 'Orders are typically packed and shipped within 24 to 48 hours. Standard regional delivery takes 3-5 business days, while national shipments reach you within 5-7 business days.',
      },
      {
        heading: '3. Free Shipping Threshold',
        content: 'We offer free delivery on all orders above ₹499. For orders below this amount, a nominal shipping charge of ₹50 is applied at the time of checkout.',
      },
    ],
  },
  'return-policy': {
    title: 'Return Policy',
    tagline: 'Our simple 7-day policy for hassle-free returns and refunds.',
    icon: RotateCcw,
    sections: [
      {
        heading: '1. Eligibility for Returns',
        content: 'Because our products are edible foods, we accept returns within 7 days of delivery only if the package arrived damaged, expired, or if the incorrect item was dispatched.',
      },
      {
        heading: '2. Refund Processing',
        content: 'Once your return request is approved and validated by our quality assurance team, we will process a full refund to your original payment method within 5-7 working days.',
      },
      {
        heading: '3. Contacting Returns Support',
        content: 'To initiate a return request, please email ferrywellfoods@gmail.com or ping us on WhatsApp with photos of the delivered box and packing slip.',
      },
    ],
  },
  'cancellation-policy': {
    title: 'Cancellation Policy',
    tagline: 'Guidelines regarding order updates and cancellation windows.',
    icon: Ban,
    sections: [
      {
        heading: '1. Order Cancellation Window',
        content: 'You can cancel your order free of charge before it is dispatched from our packing facility (usually within 12 hours of placing the order).',
      },
      {
        heading: '2. Post-Dispatch Status',
        content: 'Orders that have already been collected by our courier partners cannot be canceled. Please refer to our Return Policy if you need to return items after delivery.',
      },
      {
        heading: '3. Automated Cancellations',
        content: 'Village Made Organics reserves the right to cancel orders due to stock shortages, incorrect pricing info, or bulk commercial transactions that exceed retail limits.',
      },
    ],
  },
  'cookie-policy': {
    title: 'Cookie Policy',
    tagline: 'Understanding how cookies improve your shopping experience.',
    icon: Cookie,
    sections: [
      {
        heading: '1. What are Cookies?',
        content: 'Cookies are small text documents stored on your mobile device or desktop computer by websites you visit. They collect browser data to optimize layout configurations.',
      },
      {
        heading: '2. How We Use Cookies',
        content: 'We use cookies to remember items added to your shopping cart, save account login details, and compile analytics on store search trends.',
      },
      {
        heading: '3. Managing Cookie Preferences',
        content: 'You can disable cookies via your internet browser settings. Note that disabling them may affect checkout functionality and search convenience.',
      },
    ],
  },
  'sitemap': {
    title: 'Sitemap',
    tagline: 'Complete index of pages and links on the Village Made Organics portal.',
    icon: Map,
    sections: [
      {
        heading: 'Main Pages',
        content: 'Home (/), Products Listing (/products), Contact Us (/contact)',
      },
      {
        heading: 'Product Details',
        content: 'Dynamic details and purchase options for individual traditional malts (/products/[id])',
      },
      {
        heading: 'Legal & Info',
        content: 'Privacy Policy, Terms of Service, Return Guidelines, Shipping Details, Cookie Preferences',
      },
    ],
  },
};

export default function PolicyDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);

  // Fallback to privacy policy if slug is unknown
  const activeSlug = useMemo(() => {
    return POLICIES[slug] ? slug : 'privacy-policy';
  }, [slug]);

  const activePolicy = POLICIES[activeSlug];
  const ActiveIcon = activePolicy.icon;

  const sidebarLinks = [
    { slug: 'privacy-policy', label: 'Privacy Policy', icon: Shield },
    { slug: 'terms-conditions', label: 'Terms & Conditions', icon: BookOpen },
    { slug: 'shipping-policy', label: 'Shipping Policy', icon: Truck },
    { slug: 'return-policy', label: 'Return Policy', icon: RotateCcw },
    { slug: 'cancellation-policy', label: 'Cancellation Policy', icon: Ban },
    { slug: 'cookie-policy', label: 'Cookie Policy', icon: Cookie },
    { slug: 'sitemap', label: 'Sitemap', icon: Map },
  ];

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#3E2C1C]">
      <Navbar />

      {/* Page Header */}
      <section className="pt-32 pb-12 px-6 md:px-12 lg:px-24 bg-[#FAF4E6] border-b border-[#eeddb9]/50">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row md:items-center gap-6">
          <div className="w-14 h-14 rounded-2xl bg-[#384401]/10 text-[#384401] flex items-center justify-center shrink-0">
            <ActiveIcon className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-stone-900 font-display">
              {activePolicy.title}
            </h1>
            <p className="text-[#384401] text-sm sm:text-base mt-1.5 font-medium font-body leading-relaxed">
              {activePolicy.tagline}
            </p>
          </div>
        </div>
      </section>

      {/* Policy Page Columns layout */}
      <section className="py-16 px-6 md:px-12 lg:px-24 max-w-[1400px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Left Sidebar Links */}
          <div className="lg:col-span-4 bg-white border border-[#eeddb9]/50 rounded-[24px] p-6 shadow-2xs space-y-2">
            <h3 className="text-[#384401] font-bold text-xs uppercase tracking-widest px-3 mb-4 font-jakarta">
              Legal Documents
            </h3>
            <div className="flex flex-col gap-1.5">
              {sidebarLinks.map((item) => {
                const ItemIcon = item.icon;
                const isActive = activeSlug === item.slug;
                return (
                  <Link
                    key={item.slug}
                    href={`/policies/${item.slug}`}
                    className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold font-jakarta transition-all ${
                      isActive
                        ? 'bg-[#384401] text-white'
                        : 'text-stone-700 hover:bg-[#FAF4E6]/40 hover:text-[#384401]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <ItemIcon className="w-4.5 h-4.5 shrink-0" />
                      <span>{item.label}</span>
                    </div>
                    <ChevronRight className={`w-4 h-4 shrink-0 transition-transform ${isActive ? 'rotate-90 text-white' : 'text-stone-400'}`} />
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Right Main content */}
          <div className="lg:col-span-8 bg-white border border-[#eeddb9]/50 rounded-[32px] p-8 sm:p-10 shadow-xs">
            <article className="prose prose-stone max-w-none space-y-8">
              {activePolicy.sections.map((sec, idx) => (
                <div key={idx} className="pb-8 border-b border-stone-100 last:border-b-0 last:pb-0">
                  <h3 className="text-xl font-bold text-stone-900 font-display mb-3">
                    {sec.heading}
                  </h3>
                  <p className="text-stone-700 text-sm sm:text-base font-body leading-relaxed">
                    {sec.content}
                  </p>
                </div>
              ))}
            </article>
          </div>

        </div>
      </section>

      <Footer />
    </div>
  );
}
