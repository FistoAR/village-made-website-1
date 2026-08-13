import React from 'react';
import { Settings, Eye, EyeOff } from 'lucide-react';

interface AdminProfileTabProps {
  profName: string;
  setProfName: (val: string) => void;
  profEmail: string;
  setProfEmail: (val: string) => void;
  profPhone: string;
  setProfPhone: (val: string) => void;
  profPassword: string;
  setProfPassword: (val: string) => void;
  profPasscode: string;
  setProfPasscode: (val: string) => void;
  showProfPassword: boolean;
  setShowProfPassword: (val: boolean) => void;
  showProfPasscode: boolean;
  setShowProfPasscode: (val: boolean) => void;
  profileSaving: boolean;
  handleProfileUpdateSubmit: (e: React.FormEvent) => void;
}

export default function AdminProfileTab({
  profName,
  setProfName,
  profEmail,
  setProfEmail,
  profPhone,
  setProfPhone,
  profPassword,
  setProfPassword,
  profPasscode,
  setProfPasscode,
  showProfPassword,
  setShowProfPassword,
  showProfPasscode,
  setShowProfPasscode,
  profileSaving,
  handleProfileUpdateSubmit,
}: AdminProfileTabProps) {
  return (
    <div className="space-y-6">
      <h3 className="text-sm font-extrabold uppercase tracking-wider text-stone-955 font-jakarta flex items-center gap-2">
        <Settings className="w-4.5 h-4.5 text-[#384401]" />
        Modify Admin Attributes
      </h3>
      
      <form onSubmit={handleProfileUpdateSubmit} className="max-w-xl space-y-5 font-jakarta text-stone-900">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-[10px] font-extrabold uppercase tracking-wider text-stone-500 block mb-1.5">Admin User Name</label>
            <input
              type="text"
              required
              value={profName}
              onChange={(e) => setProfName(e.target.value)}
              className="w-full h-11 px-4 border border-[#eeddb9] rounded-xl text-stone-900 bg-white text-xs font-bold"
            />
          </div>
          <div>
            <label className="text-[10px] font-extrabold uppercase tracking-wider text-stone-500 block mb-1.5">Admin Email Address</label>
            <input
              type="email"
              required
              value={profEmail}
              onChange={(e) => setProfEmail(e.target.value)}
              className="w-full h-11 px-4 border border-[#eeddb9] rounded-xl text-stone-900 bg-white text-xs font-bold"
            />
          </div>
        </div>

        <div>
          <label className="text-[10px] font-extrabold uppercase tracking-wider text-stone-500 block mb-1.5">Admin Phone / Mobile</label>
          <input
            type="tel"
            required
            value={profPhone}
            onChange={(e) => setProfPhone(e.target.value)}
            className="w-full h-11 px-4 border border-[#eeddb9] rounded-xl text-stone-900 bg-white text-xs font-bold"
          />
        </div>

        <div>
          <label className="text-[10px] font-extrabold uppercase tracking-wider text-stone-500 block mb-1">New Account Password (Leave blank to keep current)</label>
          <div className="relative">
            <input
              type={showProfPassword ? "text" : "password"}
              placeholder="Enter new security password"
              value={profPassword}
              onChange={(e) => setProfPassword(e.target.value)}
              className="w-full h-11 pl-4 pr-10 border border-[#eeddb9] rounded-xl text-stone-900 bg-white text-xs font-bold"
            />
            <button
              type="button"
              onClick={() => setShowProfPassword(!showProfPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-850 cursor-pointer"
            >
              {showProfPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
            </button>
          </div>
        </div>

        <div className="pt-4 border-t border-stone-200">
          <label className="text-[10px] font-extrabold uppercase tracking-wider text-amber-700 block mb-1">Security Passcode (1234)</label>
          <div className="relative">
            <input
              type={showProfPasscode ? "text" : "password"}
              required
              maxLength={4}
              placeholder="Enter 4-digit passcode to verify changes"
              value={profPasscode}
              onChange={(e) => setProfPasscode(e.target.value)}
              className="w-full h-11 pl-4 pr-10 border border-amber-300 rounded-xl text-stone-900 bg-white text-xs font-black tracking-widest text-center"
            />
            <button
              type="button"
              onClick={() => setShowProfPasscode(!showProfPasscode)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-850 cursor-pointer"
            >
              {showProfPasscode ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={profileSaving}
          className="h-11 px-6 bg-[#384401] hover:bg-[#252d00] text-white text-xs font-bold rounded-xl transition-all cursor-pointer uppercase tracking-wider"
        >
          {profileSaving ? 'Saving...' : 'Save Profile Changes'}
        </button>
      </form>
    </div>
  );
}
