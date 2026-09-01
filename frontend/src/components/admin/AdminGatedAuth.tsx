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
    <div className="min-h-screen bg-[#FDFBF7] text-[#3d2b1f] font-jakarta flex flex-col justify-between selection:bg-[#384401] selection:text-white">
      <Navbar />
      <main className="flex-grow pt-28 pb-16 px-4 flex items-center justify-center">
        <div className="w-full max-w-md bg-white border border-[#EBE0CE] rounded-3xl p-7 sm:p-9 shadow-lg">
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-12 h-12 bg-[#384401]/10 rounded-2xl flex items-center justify-center text-[#384401] mb-3">
              <Key className="w-6 h-6" />
            </div>
            <h2 
              className="text-2xl text-[#384401] font-bold uppercase tracking-wide"
              style={{ fontFamily: "'Poetsen One', sans-serif" }}
            >
              Admin Portal
            </h2>
            <p className="text-xs sm:text-sm text-[#5c4636] font-normal mt-1 leading-relaxed">
              Authenticate using registered credentials and security passcode.
            </p>
          </div>

          {authError && (
            <div className="bg-[#C56C4F]/10 border border-[#C56C4F]/30 text-[#C56C4F] p-4 rounded-2xl text-xs sm:text-sm font-medium mb-6 flex gap-2.5 items-center leading-relaxed">
              <AlertCircle className="w-4 h-4 shrink-0 text-[#C56C4F]" />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <label className="text-[#3d2b1f] text-xs sm:text-sm font-medium block mb-1.5">Registered Mobile *</label>
              <input
                type="tel"
                required
                placeholder="e.g. 9876543210"
                value={adminPhone}
                onChange={(e) => setAdminPhone(e.target.value)}
                className="w-full h-11 px-4 bg-[#FAF7F2] border border-[#EBE0CE] rounded-2xl text-[#3d2b1f] text-xs sm:text-sm font-medium focus:bg-white focus:outline-none focus:border-[#384401] transition-all"
              />
            </div>

            <div>
              <label className="text-[#3d2b1f] text-xs sm:text-sm font-medium block mb-1.5">Passphrase Password *</label>
              <div className="relative">
                <input
                  type={showAdminPassword ? "text" : "password"}
                  required
                  placeholder="Enter security password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full h-11 pl-4 pr-10 bg-[#FAF7F2] border border-[#EBE0CE] rounded-2xl text-[#3d2b1f] text-xs sm:text-sm font-medium focus:bg-white focus:outline-none focus:border-[#384401] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowAdminPassword(!showAdminPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#C56C4F] hover:text-[#384401] cursor-pointer"
                >
                  {showAdminPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="text-[#3d2b1f] text-xs sm:text-sm font-medium block mb-1.5">Secret Passcode *</label>
              <div className="relative">
                <input
                  type={showAdminPasscode ? "text" : "password"}
                  required
                  placeholder="4-Digit Passcode (1234)"
                  maxLength={4}
                  value={adminPasscode}
                  onChange={(e) => setAdminPasscode(e.target.value)}
                  className="w-full h-11 pl-4 pr-10 bg-[#FAF7F2] border border-[#EBE0CE] rounded-2xl text-[#384401] text-xs sm:text-sm font-bold text-center tracking-[0.4em] focus:bg-white focus:outline-none focus:border-[#384401] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowAdminPasscode(!showAdminPasscode)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#C56C4F] hover:text-[#384401] cursor-pointer"
                >
                  {showAdminPasscode ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={authLoading}
              className="w-full h-12 bg-[#384401] hover:bg-[#252d00] text-white font-bold rounded-2xl transition-all shadow-md cursor-pointer text-xs sm:text-sm tracking-widest uppercase flex items-center justify-center gap-2.5 mt-5 disabled:opacity-50"
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
