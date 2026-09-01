'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { Menu, X, ShoppingCart, User as UserIcon, Bell, ShieldCheck, CheckCheck, Trash2, Info, Package, Shield, BellOff } from 'lucide-react';
import { useApp } from '@/lib/context/AppContext';
import LanguageSelector from '@/components/Language/LanguageSelector';
import gsap from 'gsap';
import DealOfTheDayBanner from '@/components/DealOfTheDayBanner';

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

const getInitials = (user: any) => {
  if (!user) return '';
  if (user.name) {
    const trimmed = user.name.trim();
    const parts = trimmed.split(/\s+/);
    if (parts.length > 1) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return trimmed.slice(0, Math.min(2, trimmed.length)).toUpperCase();
  }
  if (user.email) {
    const emailName = user.email.split('@')[0];
    return emailName.slice(0, Math.min(2, emailName.length)).toUpperCase();
  }
  if (user.mobile) {
    return user.mobile.slice(0, 2);
  }
  return 'U';
};

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
  const {
    cartCount,
    user,
    soundOn,
    toggleSound,
    markAllNotificationsAsRead,
    markNotificationAsRead,
    deleteNotification
  } = useApp();
  const isAdminAuth = mounted && typeof window !== 'undefined' && sessionStorage.getItem('is_admin_auth') === 'true';

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
    { label: 'Products', href: '/products', isExternal: true },
    { label: 'Contact', href: '/contact', isExternal: true },
  ];

  const displayCount = mounted ? cartCount : 0;
  const isTransparent = isHero && !isScrolled && !isOpen;

  return (
    <>
      <header
        translate="no"
        className={`notranslate fixed top-0 left-0 right-0 z-[150] flex items-center justify-between px-6 py-3 md:px-10 md:py-4 transition-all duration-300 ${isTransparent
            ? 'bg-black/25 backdrop-blur-xs border-b border-white/5 text-white'
            : 'bg-[#fcf9f2]/95 backdrop-blur-md border-b border-[#eeddb9]/50 shadow-md text-[#3d2b1f]'
          }`}
      >
        {/* Left Side: Logo & Phase Indicator */}
        <div className="flex items-center gap-3">
        {isHero ? (
          <a
            href="#"
            className={`font-display text-xl md:text-2xl tracking-[0.22em] font-semibold cursor-pointer select-none transition-colors duration-300 ${isTransparent ? 'text-warm-cream' : 'text-[#4f5a30] hover:text-[#3e2c1c]'
              }`}
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: 'smooth' });
              if (onReturnClick) onReturnClick();
            }}
          >
            VILLAGE MADE ORGANICS
          </a>
        ) : (
          <Link
            href="/"
            className="font-display text-xl md:text-2xl tracking-[0.22em] font-semibold cursor-pointer select-none text-[#4f5a30] hover:text-[#3e2c1c] transition-colors duration-300"
          >
            VILLAGE MADE ORGANICS
          </Link>
        )}
      </div>

      {/* Center: Brand Navigation Items */}
      <nav className="hidden lg:flex items-center gap-6 xl:gap-8 text-xs font-body tracking-[0.15em] uppercase font-semibold">
        {navLinks.map((item) => {
          const linkClassName = `transition-all duration-300 py-1.5 border-b-2 border-transparent hover:border-current ${isTransparent
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
            className={`hidden lg:flex px-4 py-1.5 rounded-full border text-xs font-semibold tracking-wider transition-all cursor-pointer font-body items-center gap-1.5 shadow-sm ${isTransparent
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
              className={`w-9 h-9 flex items-center justify-center rounded-full border transition-all duration-300 text-sm cursor-pointer shadow-xs ${isTransparent
                  ? 'border-white/20 bg-black/40 text-white/95 hover:bg-white/10'
                  : 'border-[#eeddb9] bg-[#fcf9f2] text-[#3d2b1f] hover:bg-[#ebdcc1]'
                }`}
              aria-label={soundOn ? 'Mute' : 'Unmute'}
              title={soundOn ? 'Mute' : 'Unmute'}
            >
              {soundOn ? '🔊' : '🔇'}
            </button>
          )}

          {/* Admin Control Button if user is admin */}
          {mounted && user?.role === 'admin' && isAdminAuth && (
            <Link
              href="/admin"
              className={`w-9 h-9 flex items-center justify-center rounded-full border transition-all duration-300 text-sm cursor-pointer shadow-xs ${isTransparent
                  ? 'border-white/20 bg-black/40 text-white/95 hover:bg-white/10'
                  : 'border-[#eeddb9] bg-[#FAF4E6] text-[#384401] hover:bg-[#384401] hover:text-white'
                }`}
              aria-label="Admin Control panel"
              title="Admin Control Panel"
            >
              <ShieldCheck className="w-4.5 h-4.5" />
            </Link>
          )}

          {/* User Account Button (Desktop) - ONLY RENDER IF NOT ADMIN */}
          {mounted && (!user || user.role !== 'admin' || !isAdminAuth) && (
            <Link
              href={mounted && user ? "/account" : "/login"}
              className={`w-9 h-9 flex items-center justify-center rounded-full border transition-all duration-300 text-xs font-bold font-jakarta cursor-pointer shadow-xs ${
                mounted && user
                  ? isTransparent
                    ? 'border-[#C56C4F]/30 bg-[#C56C4F] text-white hover:bg-[#C56C4F]/80'
                    : 'border-[#eeddb9] bg-[#4f5a30] text-[#fcf9f2] hover:bg-[#384401]'
                  : isTransparent
                    ? 'border-white/20 bg-black/40 text-white/95 hover:bg-white/10'
                    : 'border-[#eeddb9] bg-[#fcf9f2] text-[#3d2b1f] hover:bg-[#ebdcc1]'
              }`}
              aria-label="User Account"
            >
              {mounted && user ? (
                <span>{getInitials(user)}</span>
              ) : (
                <UserIcon className="w-4.5 h-4.5" />
              )}
            </Link>
          )}
        </div>

        {/* Notifications Bell Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className={`w-9 h-9 flex items-center justify-center rounded-full border transition-all duration-300 text-sm cursor-pointer shadow-xs relative ${isTransparent
                ? 'border-white/20 bg-black/40 text-white/95 hover:bg-white/10'
                : 'p-2 hover:bg-stone-200/50 text-[#3d2b1f] hover:text-[#4f5a30]'
              }`}
            aria-label="View Notifications"
          >
            <Bell className="w-4.5 h-4.5" />
            {mounted && user?.notifications && user.notifications.some(n => !n.read) && (
              <span className="absolute top-1.5 right-1.5 bg-[#C56C4F] rounded-full w-2 h-2 border border-[#fcf9f2] animate-pulse"></span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-3 w-90 bg-[#FAF6EB]/95 backdrop-blur-md border border-[#eeddb9] rounded-2xl shadow-xl p-3.5 z-50 animate-scale-up text-left select-none max-h-[500px] flex flex-col">
              <div className="flex items-center justify-between border-b border-[#eeddb9]/40 pb-2 mb-2 font-jakarta shrink-0">
                <div>
                  <span className="text-[13px] font-black text-stone-900 uppercase tracking-widest block">
                    Notifications
                  </span>
                  {mounted && user?.notifications && user.notifications.filter(n => !n.read).length > 0 && (
                    <span className="text-[11px] text-[#C56C4F] font-bold">
                      {user.notifications.filter(n => !n.read).length} unread
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  {mounted && user?.notifications && user.notifications.some(n => !n.read) && (
                    <button
                      onClick={() => markAllNotificationsAsRead()}
                      className="text-[11px] font-bold text-[#4f5a30] hover:text-[#384401] cursor-pointer flex items-center gap-1 hover:underline animate-fade-in"
                      title="Mark all as read"
                    >
                      <CheckCheck className="w-3 h-3" /> Mark all read
                    </button>
                  )}
                  <button 
                    onClick={() => setShowNotifications(false)}
                    className="text-[11px] font-black text-stone-600 hover:text-stone-900 cursor-pointer uppercase tracking-wider"
                  >
                    Close
                  </button>
                </div>
              </div>

              <div className="flex-1 flex flex-col gap-1.5 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-stone-250">
                {!mounted || !user?.notifications || user.notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 text-center gap-2">
                    <BellOff className="w-8 h-8 text-stone-400/80" />
                    <div className="text-stone-500 text-xs font-jakarta font-semibold">
                      No notifications yet.
                    </div>
                  </div>
                ) : (
                  user.notifications.map((notif) => {
                    const match = notif.message.match(/VM-[A-Za-z0-9]+/);
                    const targetUrl = match ? `/orders/${match[0]}` : '/account';

                    // Pick icons based on content
                    let notifIcon = <Info className="w-4 h-4 text-stone-655" />;
                    if (notif.title.toLowerCase().includes('order') || notif.message.toLowerCase().includes('order') || notif.message.toLowerCase().includes('dispatch')) {
                      notifIcon = <Package className="w-4 h-4 text-[#C56C4F]" />;
                    } else if (notif.title.toLowerCase().includes('profile') || notif.title.toLowerCase().includes('security') || notif.title.toLowerCase().includes('address')) {
                      notifIcon = <ShieldCheck className="w-4 h-4 text-emerald-700" />;
                    }

                    return (
                      <div
                        key={notif.id}
                        onClick={() => {
                          if (!notif.read) markNotificationAsRead(notif.id);
                        }}
                        className={`flex gap-3 p-3 rounded-xl transition-all font-jakarta border border-transparent hover:border-[#eeddb9]/45 hover:shadow-xs group cursor-pointer relative ${
                          !notif.read ? 'bg-amber-50/70 shadow-3xs' : 'bg-transparent hover:bg-stone-100/35'
                        }`}
                      >
                        <div className="shrink-0 mt-0.5">
                          {notifIcon}
                        </div>
                        <div className="flex-1 flex flex-col gap-0.5 min-w-0 pr-4">
                          <div className="flex justify-between items-start gap-1.5">
                            <span className={`text-stone-900 text-[12.5px] truncate font-jakarta ${notif.read ? 'font-semibold' : 'font-extrabold'}`}>
                              {notif.title}
                            </span>
                            <span className="text-[10px] text-stone-500 font-medium shrink-0">{notif.date}</span>
                          </div>
                          <p className="text-stone-750 text-[11.5px] leading-relaxed font-medium break-words">
                            {notif.message}
                          </p>
                          <div className="flex items-center gap-3 mt-1 shrink-0">
                            <Link
                              href={targetUrl}
                              onClick={() => setShowNotifications(false)}
                              className="text-[11px] font-bold text-[#4f5a30] hover:text-[#384401] hover:underline"
                            >
                              {match ? 'Manage Order →' : 'View Account →'}
                            </Link>
                          </div>
                        </div>

                        {/* Unread indicator / Delete button */}
                        <div className="absolute right-2.5 top-3 flex flex-col items-center gap-2">
                          {!notif.read && (
                            <span className="w-1.5 h-1.5 rounded-full bg-[#C56C4F]" />
                          )}
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              deleteNotification(notif.id);
                            }}
                            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-50 text-stone-400 hover:text-red-600 rounded transition-all cursor-pointer"
                            title="Delete Notification"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
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
          className={`relative w-9 h-9 flex items-center justify-center rounded-full border transition-all duration-300 text-sm cursor-pointer shadow-xs ${isTransparent
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

        {/* User Account Button (Mobile) - ONLY RENDER IF NOT ADMIN */}
        {mounted && (!user || user.role !== 'admin' || !isAdminAuth) && (
          <Link
            href={mounted && user ? "/account" : "/login"}
            className={`lg:hidden w-9 h-9 flex items-center justify-center rounded-full border transition-all duration-300 text-xs font-bold font-jakarta cursor-pointer shadow-xs ${
              mounted && user
                ? isTransparent
                  ? 'border-[#C56C4F]/30 bg-[#C56C4F] text-white hover:bg-[#C56C4F]/80'
                  : 'border-[#eeddb9] bg-[#4f5a30] text-[#fcf9f2] hover:bg-[#384401]'
                : isTransparent
                  ? 'border-white/20 bg-black/40 text-white/95 hover:bg-white/10'
                  : 'p-2 hover:bg-stone-200/50 text-[#3d2b1f]'
            }`}
            aria-label="User Account"
          >
            {mounted && user ? (
              <span>{getInitials(user)}</span>
            ) : (
              <UserIcon className="w-4.5 h-4.5" />
            )}
          </Link>
        )}

        {/* Mobile menu toggle */}
        <div className="lg:hidden flex items-center">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`w-9 h-9 flex items-center justify-center rounded-full border transition-all duration-300 text-sm cursor-pointer shadow-xs ${isTransparent
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
          {mounted && user?.role === 'admin' && isAdminAuth ? (
            <Link
              href="/admin"
              onClick={() => setIsOpen(false)}
              className="text-[#384401] font-body text-sm font-bold tracking-wider uppercase py-2 border-b border-stone-200/50 flex items-center gap-2"
            >
              <ShieldCheck className="w-4.5 h-4.5" />
              Admin Panel
            </Link>
          ) : (
            <Link
              href={mounted && user ? "/account" : "/login"}
              onClick={() => setIsOpen(false)}
              className="text-[#C56C4F] font-body text-sm font-bold tracking-wider uppercase hover:text-[#4f5a30] py-2 border-b border-stone-200/50 flex items-center gap-2"
            >
              {mounted && user ? (
                <span className="w-5 h-5 rounded-full bg-[#4f5a30] text-[#fcf9f2] flex items-center justify-center text-[10px] font-bold font-jakarta border border-[#eeddb9]">
                  {getInitials(user)}
                </span>
              ) : (
                <UserIcon className="w-4.5 h-4.5" />
              )}
              {mounted && user ? "My Account" : "Login / Register"}
            </Link>
          )}
        </div>
      )}
    </header>
    <DealOfTheDayBanner isPreloading={isPreloading} />
    </>
  );
}
