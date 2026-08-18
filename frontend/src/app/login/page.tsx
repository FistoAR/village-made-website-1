'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Phone, User as UserIcon, Mail, Key, ArrowRight, CheckCircle2, AlertCircle, HelpCircle, Eye, EyeOff } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useApp } from '@/lib/context/AppContext';

type Tab = 'login' | 'register' | 'forgot';

export default function LoginPage() {
  const router = useRouter();
  const [searchParams, setSearchParams] = useState<URLSearchParams | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('login');
  const { user, loginUser, registerUser, resetPassword, isHydrated } = useApp();
  const [mounted, setMounted] = useState(false);

  // Form states
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [optionalPhone, setOptionalPhone] = useState('');
  const [forgotMobile, setForgotMobile] = useState('');
  
  // Forgot Password multi-step states
  const [recoveryStep, setRecoveryStep] = useState<'mobile' | 'otp'>('mobile');
  const [recoveryOtp, setRecoveryOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);

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
    if (mounted && isHydrated && user) {
      router.push(redirectTo);
    }
  }, [user, mounted, isHydrated, redirectTo, router]);

  if (!mounted || !isHydrated) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] text-[#3E2C1C] flex flex-col justify-between">
        <Navbar />
        <div className="flex-grow flex items-center justify-center px-4 py-32">
          {/* Shimmer Skeleton Card matching form container dimensions */}
          <div className="w-full max-w-md bg-white border border-[#eeddb9]/40 rounded-[24px] p-6 sm:p-8 shadow-2xs animate-pulse">
            
            {/* Header skeleton */}
            <div className="h-6 bg-stone-200 rounded-lg w-2/5 mb-3" />
            <div className="h-4 bg-stone-150 rounded-lg w-3/5 mb-6" />

            {/* Tab header skeleton */}
            <div className="flex border-b border-stone-150 pb-3 mb-6 gap-6">
              <div className="h-5 bg-stone-200 rounded-md w-16" />
              <div className="h-5 bg-stone-150 rounded-md w-16" />
              <div className="h-5 bg-stone-100 rounded-md w-24 ml-auto" />
            </div>

            {/* Form Fields skeleton */}
            <div className="flex flex-col gap-4 mb-6">
              <div className="space-y-1.5">
                <div className="h-3.5 bg-stone-150 rounded-md w-20" />
                <div className="h-10.5 bg-stone-100 rounded-xl w-full" />
              </div>
              <div className="space-y-1.5">
                <div className="h-3.5 bg-stone-150 rounded-md w-20" />
                <div className="h-10.5 bg-stone-100 rounded-xl w-full" />
              </div>
            </div>

            {/* Submit Button skeleton */}
            <div className="h-11 bg-stone-200 rounded-xl w-full" />

          </div>
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
    setPassword('');
    setName('');
    setEmail('');
    setOptionalPhone('');
    setForgotMobile('');
    setRecoveryStep('mobile');
    setRecoveryOtp('');
    setNewPassword('');
    setConfirmPassword('');
    setShowNewPassword(false);
    setShowConfirmPassword(false);
    setShowLoginPassword(false);
    setShowRegisterPassword(false);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const res = await loginUser(mobile, password);
      setLoading(false);
      if (res.success) {
        setSuccess('Access granted! Logging you in...');
        if (res.user?.role === 'admin') {
          // Pre-authenticate the admin session tab as well!
          sessionStorage.setItem('is_admin_auth', 'true');
          router.push('/admin');
        } else {
          router.push(redirectTo);
        }
      } else {
        setError(res.error || 'Invalid credentials. Please try again.');
      }
    } catch (err) {
      setLoading(false);
      setError('An unexpected error occurred. Please try again.');
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const res = await registerUser(mobile, password, {
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
    } catch (err) {
      setLoading(false);
      setError('An unexpected error occurred. Please try again.');
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (recoveryStep === 'mobile') {
      if (forgotMobile.length < 10) {
        setError('Please enter a valid 10-digit mobile number.');
        return;
      }
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        setSuccess(`Verification code sent to ${forgotMobile}. (Hint: Use OTP 112233)`);
        setRecoveryStep('otp');
      }, 800);
    } else {
      if (recoveryOtp !== '112233') {
        setError('Invalid verification code (OTP). Please try again.');
        return;
      }
      if (newPassword.length < 6) {
        setError('New password must be at least 6 characters long.');
        return;
      }
      if (newPassword !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }

      setLoading(true);
      try {
        const res = await resetPassword(forgotMobile, recoveryOtp, newPassword);
        setLoading(false);
        if (res.success) {
          setSuccess('Password updated successfully! Please log in with your new credentials.');
          setActiveTab('login');
          setMobile(forgotMobile);
          setRecoveryStep('mobile');
          setRecoveryOtp('');
          setNewPassword('');
          setConfirmPassword('');
        } else {
          setError(res.error || 'Failed to reset password. Please check your inputs and try again.');
        }
      } catch (err) {
        setLoading(false);
        setError('An unexpected network error occurred. Please try again.');
      }
    }
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
                {activeTab === 'login' && 'Enter your registered credentials to continue.'}
                {activeTab === 'register' && 'Enter details below to create your member profile.'}
                {activeTab === 'forgot' && 'Provide your mobile number to retrieve your credentials.'}
              </p>
            </div>

            {/* Clean sliding-line tab selector */}
            <div className="flex gap-6 mb-8 pb-1 select-none font-jakarta text-xs font-bold uppercase tracking-wider">
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
                  <label className="text-[#1a110a] text-xs font-bold block mb-2 font-jakarta">Mobile Number <span className="text-red-500">*</span></label>
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
                  <label className="text-[#1a110a] text-xs font-bold block mb-2 font-jakarta">Password <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <input
                      type={showLoginPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your account password"
                      className="w-full h-11 pl-4 pr-10 border border-[#eeddb9] rounded-xl text-stone-900 placeholder-stone-600 focus:outline-none focus:ring-1 focus:ring-[#384401] focus:border-[#384401] transition-all bg-white text-sm font-jakarta"
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-850 cursor-pointer"
                      aria-label="Toggle password visibility"
                    >
                      {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
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
                  <label className="text-[#1a110a] text-xs font-bold block mb-2 font-jakarta">Mobile Number <span className="text-red-500">*</span></label>
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
                  <label className="text-[#1a110a] text-xs font-bold block mb-2 font-jakarta">Password (min 6 characters) <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <input
                      type={showRegisterPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Choose a secure account password"
                      className="w-full h-11 pl-4 pr-10 border border-[#eeddb9] rounded-xl text-stone-900 placeholder-stone-600 focus:outline-none focus:ring-1 focus:ring-[#384401] focus:border-[#384401] transition-all bg-white text-sm font-jakarta"
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-850 cursor-pointer"
                      aria-label="Toggle password visibility"
                    >
                      {showRegisterPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
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
                {recoveryStep === 'mobile' ? (
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
                ) : (
                  <>
                    <div>
                      <label className="text-[#1a110a] text-xs font-bold block mb-2 font-jakarta">Verification OTP</label>
                      <input
                        type="text"
                        required
                        value={recoveryOtp}
                        onChange={(e) => setRecoveryOtp(e.target.value)}
                        placeholder="Enter 6-digit OTP (112233)"
                        className="w-full h-11 px-4 border border-[#eeddb9] rounded-xl text-stone-900 placeholder-stone-600 focus:outline-none focus:ring-1 focus:ring-[#384401] focus:border-[#384401] transition-all bg-white text-sm font-jakarta"
                      />
                    </div>
                    <div>
                      <label className="text-[#1a110a] text-xs font-bold block mb-2 font-jakarta">New Password</label>
                      <div className="relative">
                        <input
                          type={showNewPassword ? "text" : "password"}
                          required
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Enter new password (min 6 chars)"
                          className="w-full h-11 pl-4 pr-10 border border-[#eeddb9] rounded-xl text-stone-900 placeholder-stone-600 focus:outline-none focus:ring-1 focus:ring-[#384401] focus:border-[#384401] transition-all bg-white text-sm font-jakarta"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-850 cursor-pointer"
                        >
                          {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="text-[#1a110a] text-xs font-bold block mb-2 font-jakarta">Confirm New Password</label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          required
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Confirm new password"
                          className="w-full h-11 pl-4 pr-10 border border-[#eeddb9] rounded-xl text-stone-900 placeholder-stone-600 focus:outline-none focus:ring-1 focus:ring-[#384401] focus:border-[#384401] transition-all bg-white text-sm font-jakarta"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-850 cursor-pointer"
                        >
                          {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 bg-white border border-[#384401] hover:bg-[#384401]/5 text-[#384401] font-bold rounded-xl transition-all shadow-xs cursor-pointer text-sm font-jakarta tracking-wide uppercase flex items-center justify-center gap-2"
                >
                  {loading ? (
                    recoveryStep === 'mobile' ? 'Requesting...' : 'Resetting...'
                  ) : (
                    recoveryStep === 'mobile' ? (
                      <>Request Recovery Code <HelpCircle className="w-4 h-4" /></>
                    ) : (
                      <>Update Password <ArrowRight className="w-4 h-4" /></>
                    )
                  )}
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
