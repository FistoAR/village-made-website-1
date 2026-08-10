'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Phone, User as UserIcon, Mail, Key, ArrowRight, CheckCircle2, AlertCircle, HelpCircle } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useApp } from '@/lib/context/AppContext';

type Tab = 'login' | 'register' | 'forgot';

export default function LoginPage() {
  const router = useRouter();
  const [searchParams, setSearchParams] = useState<URLSearchParams | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('login');
  const { user, loginUser, registerUser } = useApp();
  const [mounted, setMounted] = useState(false);

  // Form states
  const [mobile, setMobile] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [optionalPhone, setOptionalPhone] = useState('');
  const [forgotMobile, setForgotMobile] = useState('');

  // UI status states
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setMounted(true);
    setSearchParams(new URLSearchParams(window.location.search));
  }, []);

  const redirectTo = searchParams?.get('redirect') || '/account';

  // Redirect if already logged in
  useEffect(() => {
    if (mounted && user) {
      router.push(redirectTo);
    }
  }, [user, mounted, redirectTo, router]);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] text-[#3E2C1C] flex flex-col justify-between">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-[#384401]/30 border-t-[#384401] rounded-full animate-spin"></div>
        </div>
        <Footer />
      </div>
    );
  }

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
    setError('');
    setSuccess('');
    setMobile('');
    setName('');
    setEmail('');
    setOptionalPhone('');
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    setTimeout(() => {
      const res = loginUser(mobile);
      setLoading(false);
      if (res.success) {
        setSuccess('Access granted! Logging you in...');
        router.push(redirectTo);
      } else {
        setError(res.error || 'Mobile number not registered. Please register first.');
      }
    }, 1000);
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    setTimeout(() => {
      const res = registerUser(mobile, {
        name: name || undefined,
        email: email || undefined,
        phone: optionalPhone || undefined,
      });
      setLoading(false);
      if (res.success) {
        setSuccess('Registration successful! Welcome to the family.');
        router.push(redirectTo);
      } else {
        setError(res.error || 'Failed to create your account.');
      }
    }, 1000);
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      if (forgotMobile.length >= 10) {
        setSuccess(`Verification code sent to ${forgotMobile}.`);
      } else {
        setError('Please enter a valid 10-digit mobile number.');
      }
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#3E2C1C] flex flex-col justify-between">
      <Navbar />

      <main className="flex-grow pt-32 pb-20 px-4 flex items-center justify-center">
        
        {/* Double-Column Modular Premium Portal Card */}
        <div className="w-full max-w-6xl bg-white border border-[#eeddb9]/50 rounded-[32px] overflow-hidden shadow-xl flex flex-col md:flex-row min-h-[560px] items-stretch">
          
          {/* Left Side: Immersive Photographic Branding Column */}
          <div className="w-full md:w-[42%] relative min-h-[250px] md:min-h-auto flex flex-col justify-end p-8 text-white select-none overflow-hidden">
            {/* Background Image of premium natural provisions */}
            <div 
              className="absolute inset-0 bg-cover bg-center transition-transform duration-700 hover:scale-105"
              style={{ 
                backgroundImage: "url('/images/why-choose/why-choose-product-image.webp')" 
              }}
            />
            {/* Soft, rich dark gradient overlays for maximum legibility */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-black/10 z-10" />

            {/* Left side text overlays using site typography */}
            <div className="relative z-20 flex flex-col gap-2">
              <span className="text-[#D4E47A] text-[10px] font-bold uppercase tracking-[0.25em] font-jakarta">
                Handcrafted Heritage
              </span>
              <h2 className="font-display text-2xl xl:text-3xl font-extrabold leading-tight text-[#FDFBF7]">
                Slow Ground. <br />
                Village Sourced.
              </h2>
              <p className="text-stone-300 text-xs leading-relaxed font-jakarta font-medium mt-1">
                Prepared with care, patience, and age-old traditional recipes. By signing in, you support rural livelihoods and sustainable farm-to-family provisions.
              </p>
            </div>
          </div>

          {/* Right Side: Sleek Professional Form Container */}
          <div className="w-full md:w-[58%] p-6 sm:p-10 md:p-12 flex flex-col justify-center bg-[#FAF4E6]/25">
            
            {/* Header titles using Cormorant Garamond */}
            <div className="mb-6">
              <h1 className="font-display text-3xl font-extrabold text-stone-900 tracking-tight mb-1">
                {activeTab === 'login' && 'Sign In'}
                {activeTab === 'register' && 'Register'}
                {activeTab === 'forgot' && 'Account Recovery'}
              </h1>
              <p className="text-[#1a110a]/80 font-jakarta text-xs">
                {activeTab === 'login' && 'Enter your registered mobile number to continue.'}
                {activeTab === 'register' && 'Enter a mobile number to create your member profile.'}
                {activeTab === 'forgot' && 'Provide your mobile number to retrieve your credentials.'}
              </p>
            </div>

            {/* Clean sliding-line tab selector */}
            <div className="flex gap-6 mb-8 border-b border-stone-250/60 pb-2 select-none font-jakarta text-xs font-bold uppercase tracking-wider">
              {[
                { id: 'login', label: 'Login' },
                { id: 'register', label: 'Register' },
                { id: 'forgot', label: 'Forgot password' }
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => handleTabChange(t.id as Tab)}
                  className={`pb-2 relative cursor-pointer transition-colors ${
                    activeTab === t.id 
                      ? 'text-[#C56C4F] font-extrabold' 
                      : 'text-stone-600 hover:text-[#C56C4F]'
                  }`}
                >
                  {t.label}
                  {activeTab === t.id && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#C56C4F] rounded-full"></span>
                  )}
                </button>
              ))}
            </div>

            {/* Alert Logs */}
            <div>
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-xs font-semibold mb-6 flex gap-2.5 items-center font-jakarta">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                  <span>{error}</span>
                </div>
              )}

              {success && (
                <div className="bg-[#e2edd3] border border-[#d2c9b4]/50 text-[#384401] p-4 rounded-xl text-xs font-semibold mb-6 flex gap-2.5 items-center font-jakarta">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-[#384401]" />
                  <span>{success}</span>
                </div>
              )}
            </div>

            {/* TAB: LOGIN */}
            {activeTab === 'login' && (
              <form onSubmit={handleLoginSubmit} className="space-y-5">
                <div>
                  <label className="text-[#1a110a] text-xs font-bold block mb-2 font-jakarta">Mobile Number *</label>
                  <input
                    type="tel"
                    required
                    pattern="[0-9]{10}"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    placeholder="Enter 10-digit mobile number"
                    className="w-full h-11 px-4 border border-[#eeddb9] rounded-xl text-stone-900 placeholder-stone-600 focus:outline-none focus:ring-1 focus:ring-[#384401] focus:border-[#384401] transition-all bg-white text-sm font-jakarta"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 bg-[#384401] hover:bg-[#252d00] text-white font-bold rounded-xl transition-all shadow-xs cursor-pointer text-sm font-jakarta tracking-wide uppercase flex items-center justify-center gap-2"
                >
                  {loading ? 'Verifying...' : <>Enter Pantry <ArrowRight className="w-4 h-4" /></>}
                </button>
              </form>
            )}

            {/* TAB: REGISTER */}
            {activeTab === 'register' && (
              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                <div>
                  <label className="text-[#1a110a] text-xs font-bold block mb-2 font-jakarta">Mobile Number *</label>
                  <input
                    type="tel"
                    required
                    pattern="[0-9]{10}"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    placeholder="Enter 10-digit mobile number"
                    className="w-full h-11 px-4 border border-[#eeddb9] rounded-xl text-stone-900 placeholder-stone-600 focus:outline-none focus:ring-1 focus:ring-[#384401] focus:border-[#384401] transition-all bg-white text-sm font-jakarta"
                  />
                </div>

                <div>
                  <label className="text-[#1a110a] text-xs font-bold block mb-2 font-jakarta">Full Name (Optional)</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full h-11 px-4 border border-[#eeddb9] rounded-xl text-stone-900 placeholder-stone-600 focus:outline-none focus:ring-1 focus:ring-[#384401] focus:border-[#384401] transition-all bg-white text-sm font-jakarta"
                  />
                </div>

                <div>
                  <label className="text-[#1a110a] text-xs font-bold block mb-2 font-jakarta">Email Address (Optional)</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. name@example.com"
                    className="w-full h-11 px-4 border border-[#eeddb9] rounded-xl text-stone-900 placeholder-stone-600 focus:outline-none focus:ring-1 focus:ring-[#384401] focus:border-[#384401] transition-all bg-white text-sm font-jakarta"
                  />
                </div>

                <div>
                  <label className="text-[#1a110a] text-xs font-bold block mb-2 font-jakarta">Alternative Phone (Optional)</label>
                  <input
                    type="tel"
                    value={optionalPhone}
                    onChange={(e) => setOptionalPhone(e.target.value)}
                    placeholder="e.g. Alternative phone number"
                    className="w-full h-11 px-4 border border-[#eeddb9] rounded-xl text-stone-900 placeholder-stone-600 focus:outline-none focus:ring-1 focus:ring-[#384401] focus:border-[#384401] transition-all bg-white text-sm font-jakarta"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 bg-[#384401] hover:bg-[#252d00] text-white font-bold rounded-xl transition-all shadow-xs cursor-pointer text-sm font-jakarta tracking-wide uppercase flex items-center justify-center gap-2"
                >
                  {loading ? 'Registering...' : <>Register Account <ArrowRight className="w-4 h-4" /></>}
                </button>
              </form>
            )}

            {/* TAB: FORGOT */}
            {activeTab === 'forgot' && (
              <form onSubmit={handleForgotSubmit} className="space-y-5">
                <div>
                  <label className="text-[#1a110a] text-xs font-bold block mb-2 font-jakarta">Registered Mobile Number</label>
                  <input
                    type="tel"
                    required
                    pattern="[0-9]{10}"
                    value={forgotMobile}
                    onChange={(e) => setForgotMobile(e.target.value)}
                    placeholder="Enter 10-digit mobile number"
                    className="w-full h-11 px-4 border border-[#eeddb9] rounded-xl text-stone-900 placeholder-stone-600 focus:outline-none focus:ring-1 focus:ring-[#384401] focus:border-[#384401] transition-all bg-white text-sm font-jakarta"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 bg-white border border-[#384401] hover:bg-[#384401]/5 text-[#384401] font-bold rounded-xl transition-all shadow-xs cursor-pointer text-sm font-jakarta tracking-wide uppercase flex items-center justify-center gap-2"
                >
                  {loading ? 'Requesting...' : <>Request Recovery Code <HelpCircle className="w-4 h-4" /></>}
                </button>
              </form>
            )}

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
