'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { Menu, X, ShoppingCart, User as UserIcon, Bell } from 'lucide-react';
import { useApp } from '@/lib/context/AppContext';
import LanguageSelector from '@/components/Language/LanguageSelector';
import gsap from 'gsap';

interface NavbarProps {
  isHero?: boolean;
  onReturnClick?: () => void;
  onSkipIntro?: () => void;
  heroPhase?: string;
  introSequence?: string;
  isPreloading?: boolean;
}

function PhaseIndicator({ phase }: { phase: string }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (ref.current) {
      gsap.fromTo(
        ref.current,
        { opacity: 0, y: -8 },
        { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }
      );
    }
  }, [phase]);

  const colors: Record<string, string> = {
    INTRO: '#D4AF37',
    IDLE: '#6B8E23',
    TRAVEL: '#C56C4F',
    EXPLAIN: '#8B7355',
    RETURN: '#6B8E23',
  };

  return (
    <span
      ref={ref}
      className="font-body text-[9px] tracking-[0.2em] uppercase font-semibold px-2 py-0.5 rounded-full border text-stone-900"
      style={{
        color: colors[phase] ?? '#fff',
        borderColor: `${colors[phase] ?? '#fff'}44`,
        background: `${colors[phase] ?? '#fff'}11`,
      }}
    >
      {phase}
    </span>
  );
}

export default function Navbar({
  isHero = false,
  onReturnClick,
  onSkipIntro,
  heroPhase,
  introSequence,
  isPreloading = false,
}: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const { cartCount, user, soundOn, toggleSound } = useApp();

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Home', href: isHero ? '#' : '/' },
    { label: 'Our Story', href: isHero ? '#our-story' : '/#our-story' },
    { label: 'Why Us', href: isHero ? '#why-choose' : '/#why-choose' },
    { label: 'Products', href: '/products', isExternal: true },
    { label: 'Gallery', href: isHero ? '#gallery' : '/#gallery' },
    { label: 'Testimonials', href: isHero ? '#testimonials' : '/#testimonials' },
    { label: 'Contact', href: '/contact', isExternal: true },
  ];

  const displayCount = mounted ? cartCount : 0;
  const isTransparent = isHero && !isScrolled && !isOpen;

  return (
    <header
      translate="no"
      className={`notranslate fixed top-0 left-0 right-0 z-[150] flex items-center justify-between px-6 py-3 md:px-10 md:py-4 transition-all duration-300 ${
        isTransparent
          ? 'bg-black/25 backdrop-blur-xs border-b border-white/5 text-white'
          : 'bg-[#fcf9f2]/95 backdrop-blur-md border-b border-[#eeddb9]/50 shadow-md text-[#3d2b1f]'
      }`}
    >
      {/* Left Side: Logo & Phase Indicator */}
      <div className="flex items-center gap-3">
        {isHero ? (
          <a
            href="#"
            className={`font-display text-xl md:text-2xl tracking-[0.22em] font-semibold cursor-pointer select-none transition-colors duration-300 ${
              isTransparent ? 'text-warm-cream' : 'text-[#4f5a30] hover:text-[#3e2c1c]'
            }`}
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: 'smooth' });
              if (onReturnClick) onReturnClick();
            }}
          >
            VILLAGE MADE
          </a>
        ) : (
          <Link
            href="/"
            className="font-display text-xl md:text-2xl tracking-[0.22em] font-semibold cursor-pointer select-none text-[#4f5a30] hover:text-[#3e2c1c] transition-colors duration-300"
          >
            VILLAGE MADE
          </Link>
        )}
      </div>

      {/* Center: Brand Navigation Items */}
      <nav className="hidden lg:flex items-center gap-6 xl:gap-8 text-xs font-body tracking-[0.15em] uppercase font-semibold">
        {navLinks.map((item) => {
          const linkClassName = `transition-all duration-300 py-1.5 border-b-2 border-transparent hover:border-current ${
            isTransparent
              ? 'text-white/80 hover:text-white'
              : 'text-[#5d5449] hover:text-[#4f5a30]'
          }`;

          if (item.isExternal || !isHero) {
            return (
              <Link key={item.label} href={item.href} className={linkClassName}>
                {item.label}
              </Link>
            );
          }

          return (
            <a
              key={item.label}
              href={item.href}
              onClick={(e) => {
                if (item.href === '#') {
                  e.preventDefault();
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                  return;
                }
                const target = document.querySelector(item.href);
                if (target) {
                  e.preventDefault();
                  target.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className={linkClassName}
            >
              {item.label}
            </a>
          );
        })}
      </nav>

      {/* Right Side Actions */}
      <div className="flex items-center gap-2 md:gap-4">
        {/* Skip Intro (Desktop Homepage Only) */}
        {isHero && heroPhase === 'INTRO' && introSequence !== 'EXPLANATION_CLIP' && !isPreloading && onSkipIntro && (
          <button
            onClick={onSkipIntro}
            className={`hidden lg:flex px-4 py-1.5 rounded-full border text-xs font-semibold tracking-wider transition-all cursor-pointer font-body items-center gap-1.5 shadow-sm ${
              isTransparent
                ? 'border-white/20 bg-black/45 text-white hover:bg-white/15'
                : 'border-[#eeddb9] bg-[#fcf9f2] text-[#3d2b1f] hover:bg-[#ebdcc1]'
            }`}
          >
            Skip Intro
          </button>
        )}

        <div className="hidden lg:flex items-center gap-2">
          {/* Language Selector */}
          <LanguageSelector scrolled={!isTransparent} />

          {/* Sound Toggle (Homepage Only) */}
          {isHero && (
            <button
              onClick={toggleSound}
              className={`w-9 h-9 flex items-center justify-center rounded-full border transition-all duration-300 text-sm cursor-pointer shadow-xs ${
                isTransparent
                  ? 'border-white/20 bg-black/40 text-white/95 hover:bg-white/10'
                  : 'border-[#eeddb9] bg-[#fcf9f2] text-[#3d2b1f] hover:bg-[#ebdcc1]'
              }`}
              aria-label={soundOn ? 'Mute' : 'Unmute'}
              title={soundOn ? 'Mute' : 'Unmute'}
            >
              {soundOn ? '🔊' : '🔇'}
            </button>
          )}

          {/* User Account Button (Desktop) */}
          <Link
            href={mounted && user ? "/account" : "/login"}
            className={`w-9 h-9 flex items-center justify-center rounded-full border transition-all duration-300 text-sm cursor-pointer shadow-xs ${
              isTransparent
                ? 'border-white/20 bg-black/40 text-white/95 hover:bg-white/10'
                : 'border-[#eeddb9] bg-[#fcf9f2] text-[#3d2b1f] hover:bg-[#ebdcc1]'
            }`}
            aria-label="User Account"
          >
            <UserIcon className="w-4.5 h-4.5" />
          </Link>
        </div>

        {/* Notifications Bell Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className={`w-9 h-9 flex items-center justify-center rounded-full border transition-all duration-300 text-sm cursor-pointer shadow-xs relative ${
              isTransparent
                ? 'border-white/20 bg-black/40 text-white/95 hover:bg-white/10'
                : 'p-2 hover:bg-stone-200/50 text-[#3d2b1f] hover:text-[#4f5a30]'
            }`}
            aria-label="View Notifications"
          >
            <Bell className="w-4.5 h-4.5" />
            {mounted && user?.notifications && user.notifications.length > 0 && (
              <span className="absolute top-1.5 right-1.5 bg-red-655 rounded-full w-2 h-2 border border-[#fcf9f2]"></span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-3 w-80 bg-[#FAF6EB] border border-[#eeddb9] rounded-2xl shadow-xl p-4.5 z-50 animate-scale-up text-left select-none">
              <div className="flex items-center justify-between border-b border-[#eeddb9]/40 pb-2.5 mb-2.5 font-jakarta">
                <span className="text-xs font-black text-stone-900 uppercase tracking-widest">
                  Notifications ({mounted && user?.notifications ? user.notifications.length : 0})
                </span>
                <button 
                  onClick={() => setShowNotifications(false)}
                  className="text-[10px] font-black text-[#384401] hover:underline cursor-pointer uppercase tracking-wider"
                >
                  Close
                </button>
              </div>

              <div className="flex flex-col gap-1 max-h-72 overflow-y-auto pr-1">
                {!mounted || !user?.notifications || user.notifications.length === 0 ? (
                  <div className="text-center py-8 text-stone-600 text-xs font-jakarta font-semibold">
                    No recent notifications.
                  </div>
                ) : (
                  user.notifications.map((notif, idx) => {
                    const match = notif.message.match(/VM-[A-Za-z0-9]+/);
                    const targetUrl = match ? `/orders/${match[0]}` : '/account';

                    return (
                      <Link 
                        key={idx} 
                        href={targetUrl}
                        onClick={() => setShowNotifications(false)}
                        className="flex flex-col gap-1 text-xs p-2.5 hover:bg-stone-150/40 rounded-xl transition-all font-jakarta text-stone-900 border-b border-[#eeddb9]/10 last:border-b-0 hover:shadow-3xs group"
                      >
                        <div className="flex justify-between items-start gap-2">
                          <span className="font-extrabold text-stone-950 group-hover:text-[#384401] transition-colors">{notif.title}</span>
                          <span className="text-[9px] text-[#C56C4F] font-bold shrink-0">{notif.date}</span>
                        </div>
                        <p className="text-stone-700 text-[10.5px] leading-normal font-medium">{notif.message}</p>
                        {match && (
                          <span className="text-[9px] font-black text-[#384401] mt-1 hover:underline flex items-center gap-0.5">
                            Manage Order →
                          </span>
                        )}
                      </Link>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* Cart Button */}
        <Link
          href="/cart"
          className={`relative w-9 h-9 flex items-center justify-center rounded-full border transition-all duration-300 text-sm cursor-pointer shadow-xs ${
            isTransparent
              ? 'border-white/20 bg-black/40 text-white/95 hover:bg-white/10'
              : 'p-2 hover:bg-stone-200/50 text-[#3d2b1f] hover:text-[#4f5a30]'
          }`}
          aria-label="Shopping Cart"
        >
          <ShoppingCart className="w-4.5 h-4.5" />
          {displayCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-[#C56C4F] text-white text-[9px] font-bold rounded-full w-4.5 h-4.5 flex items-center justify-center border border-[#fcf9f2] animate-scale-up">
              {displayCount}
            </span>
          )}
        </Link>

        {/* User Account Button (Mobile) */}
        <Link
          href={mounted && user ? "/account" : "/login"}
          className={`lg:hidden w-9 h-9 flex items-center justify-center rounded-full border transition-all duration-300 text-sm cursor-pointer shadow-xs ${
            isTransparent
              ? 'border-white/20 bg-black/40 text-white/95 hover:bg-white/10'
              : 'p-2 hover:bg-stone-200/50 text-[#3d2b1f]'
          }`}
          aria-label="User Account"
        >
          <UserIcon className="w-4.5 h-4.5" />
        </Link>

        {/* Mobile menu toggle */}
        <div className="lg:hidden flex items-center">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`w-9 h-9 flex items-center justify-center rounded-full border transition-all duration-300 text-sm cursor-pointer shadow-xs ${
              isTransparent
                ? 'border-white/20 bg-black/40 text-white/95 hover:bg-white/10'
                : 'p-1.5 hover:bg-stone-100 text-[#3d2b1f]'
            }`}
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 bg-[#fcf9f2] border-b border-[#eeddb9]/60 shadow-xl flex flex-col p-6 gap-4 z-50 lg:hidden animate-fade-in text-stone-900 text-left">
          {navLinks.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className="text-[#3d2b1f] font-body text-sm font-semibold tracking-wider uppercase hover:text-[#4f5a30] py-2 border-b border-stone-200/50"
            >
              {item.label}
            </Link>
          ))}
          {/* Mobile Profile/Login Link */}
          <Link
            href={mounted && user ? "/account" : "/login"}
            onClick={() => setIsOpen(false)}
            className="text-[#C56C4F] font-body text-sm font-bold tracking-wider uppercase hover:text-[#4f5a30] py-2 border-b border-stone-200/50 flex items-center gap-2"
          >
            <UserIcon className="w-4 h-4" />
            {mounted && user ? "My Account" : "Login / Register"}
          </Link>
        </div>
      )}
    </header>
  );
}
