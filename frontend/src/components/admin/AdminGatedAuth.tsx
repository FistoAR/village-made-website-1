import React from 'react';
import { Key, AlertCircle, Eye, EyeOff, ArrowRight } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

interface AdminGatedAuthProps {
  authError: string;
  adminPhone: string;
  setAdminPhone: (val: string) => void;
  adminPassword: string;
  setAdminPassword: (val: string) => void;
  adminPasscode: string;
  setAdminPasscode: (val: string) => void;
  showAdminPassword: boolean;
  setShowAdminPassword: (val: boolean) => void;
  showAdminPasscode: boolean;
  setShowAdminPasscode: (val: boolean) => void;
  authLoading: boolean;
  handleAdminLogin: (e: React.FormEvent) => void;
}

export default function AdminGatedAuth({
  authError,
  adminPhone,
  setAdminPhone,
  adminPassword,
  setAdminPassword,
  adminPasscode,
  setAdminPasscode,
  showAdminPassword,
  setShowAdminPassword,
  showAdminPasscode,
  setShowAdminPasscode,
  authLoading,
  handleAdminLogin,
}: AdminGatedAuthProps) {
  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#3E2C1C] flex flex-col justify-between">
      <Navbar />
      <main className="flex-grow pt-32 pb-20 px-4 flex items-center justify-center">
        <div className="w-full max-w-md bg-white border border-[#d3c099] rounded-[28px] p-6 sm:p-8 shadow-xl">
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-12 h-12 bg-[#384401]/10 rounded-2xl flex items-center justify-center text-[#384401] mb-3">
              <Key className="w-6 h-6" />
            </div>
            <h2 className="font-display text-2xl font-black text-stone-900">Admin Gated Portal</h2>
            <p className="text-xs text-stone-500 font-jakarta mt-1">Authenticate using registered credentials and security passcode</p>
          </div>

          {authError && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4.5 rounded-xl text-xs font-semibold mb-6 flex gap-2.5 items-center font-jakarta leading-relaxed">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="space-y-4 font-jakarta">
            <div>
              <label className="text-[#1a110a] text-xs font-bold block mb-1.5">Registered Admin Mobile</label>
              <input
                type="tel"
                required
                placeholder="e.g. 9999999999"
                value={adminPhone}
                onChange={(e) => setAdminPhone(e.target.value)}
                className="w-full h-11 px-4 border border-[#d3c099] rounded-xl text-stone-900 focus:outline-none focus:ring-1 focus:ring-[#384401] focus:border-[#384401] bg-white text-sm"
              />
            </div>

            <div>
              <label className="text-[#1a110a] text-xs font-bold block mb-1.5">Passphrase Password</label>
              <div className="relative">
                <input
                  type={showAdminPassword ? "text" : "password"}
                  required
                  placeholder="Enter security password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full h-11 pl-4 pr-10 border border-[#d3c099] rounded-xl text-stone-900 focus:outline-none focus:ring-1 focus:ring-[#384401] focus:border-[#384401] bg-white text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowAdminPassword(!showAdminPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-455 cursor-pointer"
                >
                  {showAdminPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="text-[#1a110a] text-xs font-bold block mb-1.5">Secret Passcode</label>
              <div className="relative">
                <input
                  type={showAdminPasscode ? "text" : "password"}
                  required
                  placeholder="Enter 4-digit passcode (1234)"
                  maxLength={4}
                  value={adminPasscode}
                  onChange={(e) => setAdminPasscode(e.target.value)}
                  className="w-full h-11 pl-4 pr-10 border border-[#d3c099] rounded-xl text-stone-900 focus:outline-none focus:ring-1 focus:ring-[#384401] focus:border-[#384401] bg-white text-sm text-center font-black tracking-[0.4em]"
                />
                <button
                  type="button"
                  onClick={() => setShowAdminPasscode(!showAdminPasscode)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#384401] hover:text-[#252d00] cursor-pointer"
                >
                  {showAdminPasscode ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={authLoading}
              className="w-full h-12 bg-[#384401] hover:bg-[#252d00] text-white font-bold rounded-xl transition-all shadow-xs cursor-pointer text-sm tracking-wide uppercase flex items-center justify-center gap-2 mt-4"
            >
              {authLoading ? 'Verifying...' : <>Enter Dashboard <ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}
