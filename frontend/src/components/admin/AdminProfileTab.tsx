import { Settings, Eye, EyeOff, Sparkles, User, Lock, ShieldAlert } from 'lucide-react';

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
  const comingSoon = false; // Set to false to enable profile tab

  if (comingSoon) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center bg-stone-50/10 border border-dashed border-[#d3c099] rounded-2xl p-8 font-jakarta">
        <div className="w-16 h-16 rounded-full bg-[#FAF4EE] flex items-center justify-center text-[#C56C4F] mb-4">
          <Sparkles className="w-8 h-8 animate-pulse" />
        </div>
        <h3 className="text-base font-extrabold text-stone-900 uppercase tracking-wider mb-1">Coming Soon</h3>
        <p className="text-xs text-stone-500 max-w-sm">Admin security profile attributes configuration will be active in the coming weeks.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in font-jakarta">
      <h3 className="text-sm font-extrabold uppercase tracking-wider text-stone-700 flex items-center gap-2">
        <Settings className="w-4.5 h-4.5 text-[#384401]" />
        Modify Admin Attributes
      </h3>
      
      <form onSubmit={handleProfileUpdateSubmit} className="max-w-3xl space-y-6 font-jakarta text-stone-900">
        
        {/* Profile Card */}
        <div className="border border-[#d3c099] rounded-2xl p-6 bg-white shadow-2xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#eeddb9]/30">
            <User className="w-5 h-5 text-[#C56C4F]" />
            <h4 className="text-sm font-extrabold uppercase tracking-wider text-stone-850">Account Credentials</h4>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-stone-500 block mb-1.5">Admin User Name</label>
              <input
                type="text"
                required
                value={profName}
                onChange={(e) => setProfName(e.target.value)}
                className="w-full h-10 px-3.5 bg-white border border-[#d3c099] rounded-xl text-sm text-stone-900 font-bold focus:border-[#384401] focus:ring-1 focus:ring-[#384401] outline-none transition-all"
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-stone-500 block mb-1.5">Admin Email Address</label>
              <input
                type="email"
                required
                value={profEmail}
                onChange={(e) => setProfEmail(e.target.value)}
                className="w-full h-10 px-3.5 bg-white border border-[#d3c099] rounded-xl text-sm text-stone-900 font-bold focus:border-[#384401] focus:ring-1 focus:ring-[#384401] outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-stone-500 block mb-1.5">Admin Phone / Mobile</label>
            <input
              type="tel"
              required
              value={profPhone}
              onChange={(e) => setProfPhone(e.target.value)}
              className="w-full h-10 px-3.5 bg-white border border-[#d3c099] rounded-xl text-sm text-stone-900 font-bold focus:border-[#384401] focus:ring-1 focus:ring-[#384401] outline-none transition-all"
            />
          </div>
        </div>

        {/* Security Credentials Card */}
        <div className="border border-[#d3c099] rounded-2xl p-6 bg-white shadow-2xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#eeddb9]/30">
            <Lock className="w-5 h-5 text-[#384401]" />
            <h4 className="text-sm font-extrabold uppercase tracking-wider text-stone-850">Security Credentials</h4>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-stone-500 block mb-1.5">New Account Password (Leave blank to keep current)</label>
            <div className="relative">
              <input
                type={showProfPassword ? "text" : "password"}
                placeholder="Enter new security password"
                value={profPassword}
                onChange={(e) => setProfPassword(e.target.value)}
                className="w-full h-10 pl-3.5 pr-10 bg-white border border-[#d3c099] rounded-xl text-sm text-stone-900 font-bold focus:border-[#384401] focus:ring-1 focus:ring-[#384401] outline-none transition-all"
              />
              <button
                type="button"
                onClick={() => setShowProfPassword(!showProfPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-750 cursor-pointer"
              >
                {showProfPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
              </button>
            </div>
          </div>

          <div className="pt-2">
            <label className="text-xs font-bold uppercase tracking-wider text-amber-700 block mb-1.5 flex items-center gap-1">
              <ShieldAlert className="w-4 h-4 text-amber-600 animate-pulse" />
              Security Passcode Verification (Enter 4-Digit Passcode)
            </label>
            <div className="relative max-w-xs">
              <input
                type={showProfPasscode ? "text" : "password"}
                required
                maxLength={4}
                placeholder="Verify passcode"
                value={profPasscode}
                onChange={(e) => setProfPasscode(e.target.value)}
                className="w-full h-10 pl-3.5 pr-10 bg-white border border-amber-300 rounded-xl text-sm text-stone-900 font-black tracking-widest text-center focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all"
              />
              <button
                type="button"
                onClick={() => setShowProfPasscode(!showProfPasscode)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-750 cursor-pointer"
              >
                {showProfPasscode ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
              </button>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={profileSaving}
          className="h-10 px-6 bg-[#384401] hover:bg-[#252d00] text-white text-xs font-bold rounded-xl transition-all cursor-pointer uppercase tracking-wider shadow-xs hover:shadow-sm"
        >
          {profileSaving ? 'Saving...' : 'Save Profile Changes'}
        </button>
      </form>
    </div>
  );
}

