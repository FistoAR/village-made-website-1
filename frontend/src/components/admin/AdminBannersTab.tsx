import React from 'react';
import { Sparkles, X } from 'lucide-react';
import { OfferBanner } from './types';
import { useApp } from '@/lib/context/AppContext';

interface AdminBannersTabProps {
  bannerTitle: string;
  setBannerTitle: (val: string) => void;
  bannerImageUrl: string;
  setBannerImageUrl: (val: string) => void;
  bannerLink: string;
  setBannerLink: (val: string) => void;
  bannerTag: string;
  setBannerTag: (val: string) => void;
  handleAddBanner: (e: React.FormEvent) => void;
  banners: OfferBanner[];
  setBanners: React.Dispatch<React.SetStateAction<OfferBanner[]>>;
}

export default function AdminBannersTab({
  bannerTitle,
  setBannerTitle,
  bannerImageUrl,
  setBannerImageUrl,
  bannerLink,
  setBannerLink,
  bannerTag,
  setBannerTag,
  handleAddBanner,
  banners,
  setBanners,
}: AdminBannersTabProps) {
  const comingSoon = true; // Set to false to enable banners tab

  if (comingSoon) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center bg-stone-50/10 border border-dashed border-[#d3c099] rounded-2xl p-8 font-jakarta">
        <div className="w-16 h-16 rounded-full bg-[#FAF4EE] flex items-center justify-center text-[#C56C4F] mb-4">
          <Sparkles className="w-8 h-8 animate-pulse" />
        </div>
        <h3 className="text-base font-extrabold text-stone-900 uppercase tracking-wider mb-1">Coming Soon</h3>
        <p className="text-xs text-stone-500 max-w-sm">Promotional slider controls and banner configuration will be active in the coming weeks.</p>
      </div>
    );
  }

  const { showConfirm } = useApp();

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1.8fr] gap-8 items-start">
        {/* Left Column: Upload Banner Form */}
        <form onSubmit={handleAddBanner} className="border border-[#d3c099] rounded-2xl p-5 bg-[#FAF4E6]/10 space-y-4 font-jakarta">
          <h3 className="text-xs font-black uppercase tracking-wider text-[#384401] flex items-center gap-1.5">
            <Sparkles className="w-4 h-4" />
            Upload Offer Banner
          </h3>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-stone-600">Banner Title</label>
            <input
              type="text"
              required
              placeholder="e.g. Sprouted Ragi Special 15%"
              value={bannerTitle}
              onChange={(e) => setBannerTitle(e.target.value)}
              className="h-10 px-3 bg-white border border-[#d3c099] rounded-xl text-xs text-stone-900"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-stone-600">Image Source URL</label>
            <input
              type="text"
              required
              placeholder="e.g. /images/cookies-banner.webp"
              value={bannerImageUrl}
              onChange={(e) => setBannerImageUrl(e.target.value)}
              className="h-10 px-3 bg-white border border-[#d3c099] rounded-xl text-xs text-stone-900"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-stone-600">Target Link URL</label>
              <input
                type="text"
                placeholder="/products?category=Malt"
                value={bannerLink}
                onChange={(e) => setBannerLink(e.target.value)}
                className="h-10 px-3 bg-white border border-[#d3c099] rounded-xl text-xs text-stone-900"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-stone-600">Ribbon tag</label>
              <input
                type="text"
                placeholder="e.g. LIMITED OFFER"
                value={bannerTag}
                onChange={(e) => setBannerTag(e.target.value)}
                className="h-10 px-3 bg-white border border-[#d3c099] rounded-xl text-xs text-stone-900"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-[#384401] hover:bg-[#252d00] text-white text-xs font-bold py-2.5 rounded-xl transition-colors cursor-pointer"
          >
            Publish Banner
          </button>
        </form>

        {/* Right Column: Banners List Preview */}
        <div className="space-y-4">
          <h3 className="text-sm font-extrabold uppercase tracking-wider text-stone-955 font-jakarta">
            Active Offer Banner Rotators ({banners.length})
          </h3>

          <div className="space-y-4 font-jakarta">
            {banners.map(b => (
              <div key={b.id} className="border border-[#d3c099] rounded-2xl p-4 bg-stone-50/20 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-16 h-10 bg-stone-200 rounded-lg overflow-hidden shrink-0 border border-stone-300 relative">
                    <img src={b.imageUrl} alt={b.title} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    {b.tag && (
                      <span className="text-[9px] font-extrabold text-[#C56C4F] uppercase tracking-wide block">{b.tag}</span>
                    )}
                    <span className="font-bold text-stone-855 text-xs sm:text-sm block">{b.title}</span>
                    <span className="text-[10px] text-stone-400 block mt-0.5">{b.link}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      setBanners(prev => prev.map(item => item.id === b.id ? { ...item, active: !item.active } : item));
                    }}
                    className={`px-3 py-1 rounded-full text-[10px] font-black tracking-wider uppercase cursor-pointer ${
                      b.active ? 'bg-green-100 text-green-700' : 'bg-stone-100 text-stone-600'
                    }`}
                  >
                    {b.active ? 'ON' : 'OFF'}
                  </button>
                  <button
                    onClick={() => {
                      showConfirm(
                        'Remove Offer Banner',
                        'Are you sure you want to delete this offer banner from rotation?',
                        () => setBanners(prev => prev.filter(item => item.id !== b.id))
                      );
                    }}
                    className="text-stone-450 hover:text-red-600 cursor-pointer p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
