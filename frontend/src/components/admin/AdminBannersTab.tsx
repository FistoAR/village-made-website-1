'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, X, Settings, Calendar, Clock, Eye, Save, Upload, Image as ImageIcon, Trash2, Edit3, CheckCircle, RefreshCw, Power, Tag } from 'lucide-react';
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
  handleFileUpload?: (file: File, bucket: 'product-images' | 'product-videos') => Promise<string | null>;
}

interface DealBanner {
  id?: number;
  title: string;
  discountText: string;
  description: string;
  buttonText: string;
  buttonLink: string;
  imageUrl?: string;
  scheduleType: 'always' | 'range' | 'day_of_week';
  startDate: string;
  endDate: string;
  daysOfWeek: number[];
  position: 'top' | 'center' | 'bottom-right';
  active: boolean;
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
  handleFileUpload,
}: AdminBannersTabProps) {
  const { showConfirm } = useApp();

  // Sub-tabs navigation: 'deal' (Deal of the Day) or 'slider' (General Slideshow Banners)
  const [subTab, setSubTab] = useState<'deal' | 'slider'>('deal');

  // History list of deal banners
  const [dealBanners, setDealBanners] = useState<DealBanner[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Form states
  const [dealActive, setDealActive] = useState(false);
  const [dealTitle, setDealTitle] = useState('');
  const [dealDiscountText, setDealDiscountText] = useState('');
  const [dealDescription, setDealDescription] = useState('');
  const [dealButtonText, setDealButtonText] = useState('Shop Now');
  const [dealImageUrl, setDealImageUrl] = useState('');
  const [dealScheduleType, setDealScheduleType] = useState<'always' | 'range' | 'day_of_week'>('always');
  const [dealStartDate, setDealStartDate] = useState('');
  const [dealEndDate, setDealEndDate] = useState('');
  const [dealDaysOfWeek, setDealDaysOfWeek] = useState<number[]>([0, 1, 2, 3, 4, 5, 6]);
  const [dealPosition, setDealPosition] = useState<'top' | 'center' | 'bottom-right'>('center');
  
  // Non-technical Link Target customization states
  const [dealLinkType, setDealLinkType] = useState<'products' | 'contact' | 'cart' | 'product_detail' | 'custom'>('products');
  const [dealSelectedProductId, setDealSelectedProductId] = useState<string>('');
  const [dealCustomButtonLink, setDealCustomButtonLink] = useState('/products');
  const [productsList, setProductsList] = useState<{ id: string | number; name: string }[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingDealImg, setUploadingDealImg] = useState(false);
  const [message, setMessage] = useState({ text: '', isError: false });

  // History search/filter states
  const [historySearch, setHistorySearch] = useState('');
  const [historyFilter, setHistoryFilter] = useState<'all' | 'top' | 'center' | 'bottom-right'>('all');

  // Fetch deal of the day config history and product list
  const fetchDealHistory = async () => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
      const res = await fetch(`${baseUrl}/admin/deal-banners`);
      const data = await res.json();
      if (data.success && Array.isArray(data.banners)) {
        setDealBanners(data.banners);
      }
    } catch (err) {
      console.error('Failed to load deal banners history:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchProductsList = async () => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
      const res = await fetch(`${baseUrl}/products`);
      const data = await res.json();
      if (data.success && Array.isArray(data.products)) {
        setProductsList(data.products.map((p: any) => ({ id: p.id, name: p.name })));
      } else if (Array.isArray(data)) {
        setProductsList(data.map((p: any) => ({ id: p.id, name: p.name })));
      }
    } catch (err) {
      console.warn('Failed to fetch products dynamically. Falling back to static products file list.');
      try {
        const staticList = await import('@/data/products-list');
        if (staticList && Array.isArray(staticList.PRODUCTS)) {
          setProductsList(staticList.PRODUCTS.map(p => ({ id: p.id, name: p.name })));
        }
      } catch (e) {
        console.error('Failed to import static fallback list:', e);
      }
    }
  };

  useEffect(() => {
    fetchDealHistory();
    fetchProductsList();
  }, []);

  const getComputedButtonLink = (): string => {
    switch (dealLinkType) {
      case 'products':
        return '/products';
      case 'contact':
        return '/contact';
      case 'cart':
        return '/cart';
      case 'product_detail':
        return `/products/${dealSelectedProductId}`;
      case 'custom':
      default:
        return dealCustomButtonLink;
    }
  };

  const handleSaveDeal = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ text: '', isError: false });

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
      const payload = {
        title: dealTitle,
        discountText: dealDiscountText,
        description: dealDescription,
        buttonText: dealButtonText,
        buttonLink: getComputedButtonLink(),
        imageUrl: dealImageUrl,
        scheduleType: dealScheduleType,
        startDate: dealStartDate,
        endDate: dealEndDate,
        daysOfWeek: dealDaysOfWeek,
        position: dealPosition,
        active: dealActive,
      };

      let url = `${baseUrl}/admin/deal-banners`;
      let method = 'POST';

      if (editingId) {
        url = `${baseUrl}/admin/deal-banners/${editingId}`;
        method = 'PUT';
      }

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        setMessage({ 
          text: editingId ? 'Deal banner updated successfully!' : 'New deal banner created successfully!', 
          isError: false 
        });
        resetForm();
        fetchDealHistory();
      } else {
        setMessage({ text: data.error || 'Failed to save settings.', isError: true });
      }
    } catch (err) {
      console.error(err);
      setMessage({ text: 'Network error. Failed to save settings.', isError: true });
    } finally {
      setSaving(false);
    }
  };

  const handleDealImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!handleFileUpload) {
      setMessage({ text: 'File upload utility is not ready.', isError: true });
      return;
    }

    setUploadingDealImg(true);
    try {
      const url = await handleFileUpload(file, 'product-images');
      if (url) {
        setDealImageUrl(url);
      }
    } catch (err) {
      console.error(err);
      setMessage({ text: 'Image upload failed.', isError: true });
    } finally {
      setUploadingDealImg(false);
    }
  };

  const toggleDay = (day: number) => {
    setDealDaysOfWeek(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day].sort()
    );
  };

  const handleToggleActive = async (bannerId: number) => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
      const res = await fetch(`${baseUrl}/admin/deal-banners/${bannerId}/toggle`, {
        method: 'PUT'
      });
      const data = await res.json();
      if (data.success) {
        fetchDealHistory();
      }
    } catch (err) {
      console.error('Failed to toggle active status:', err);
    }
  };

  const handleDeleteBanner = async (bannerId: number) => {
    showConfirm(
      'Delete Banner Configuration',
      'Are you sure you want to permanently delete this banner configuration from history?',
      async () => {
        try {
          const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
          const res = await fetch(`${baseUrl}/admin/deal-banners/${bannerId}`, {
            method: 'DELETE'
          });
          const data = await res.json();
          if (data.success) {
            fetchDealHistory();
            if (editingId === bannerId) resetForm();
          }
        } catch (err) {
          console.error('Failed to delete banner:', err);
        }
      }
    );
  };

  const handleEditClick = (banner: DealBanner) => {
    setEditingId(banner.id || null);
    setDealActive(banner.active);
    setDealTitle(banner.title);
    setDealDiscountText(banner.discountText || '');
    setDealDescription(banner.description || '');
    setDealButtonText(banner.buttonText || 'Shop Now');
    
    // Parse target button link to set non-technical selectors
    const path = banner.buttonLink || '/products';
    if (path === '/products') {
      setDealLinkType('products');
    } else if (path === '/contact') {
      setDealLinkType('contact');
    } else if (path === '/cart') {
      setDealLinkType('cart');
    } else if (path.startsWith('/products/')) {
      setDealLinkType('product_detail');
      setDealSelectedProductId(path.replace('/products/', ''));
    } else {
      setDealLinkType('custom');
      setDealCustomButtonLink(path);
    }

    setDealImageUrl(banner.imageUrl || '');
    setDealScheduleType(banner.scheduleType);
    setDealStartDate(banner.startDate || '');
    setDealEndDate(banner.endDate || '');
    setDealDaysOfWeek(Array.isArray(banner.daysOfWeek) ? banner.daysOfWeek : JSON.parse(banner.daysOfWeek as any || '[]'));
    setDealPosition(banner.position || 'center');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setEditingId(null);
    setDealActive(false);
    setDealTitle('');
    setDealDiscountText('');
    setDealDescription('');
    setDealButtonText('Shop Now');
    setDealLinkType('products');
    setDealSelectedProductId('');
    setDealCustomButtonLink('/products');
    setDealImageUrl('');
    setDealScheduleType('always');
    setDealStartDate('');
    setDealEndDate('');
    setDealDaysOfWeek([0, 1, 2, 3, 4, 5, 6]);
    setDealPosition('center');
  };

  const daysLabel = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="space-y-8 font-jakarta">
      {/* Dynamic Sub-Tab Navigation Selector */}
      <div className="flex border-b border-stone-200 gap-6 select-none">
        <button
          onClick={() => setSubTab('deal')}
          className={`pb-3 text-sm font-black uppercase tracking-wider relative transition-all cursor-pointer ${
            subTab === 'deal' ? 'text-[#384401]' : 'text-stone-400 hover:text-stone-600'
          }`}
        >
          <span>Deal of the Day Popup & Banner</span>
          {subTab === 'deal' && (
            <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#384401] rounded-full" />
          )}
        </button>
        <button
          onClick={() => setSubTab('slider')}
          className={`pb-3 text-sm font-black uppercase tracking-wider relative transition-all cursor-pointer ${
            subTab === 'slider' ? 'text-[#384401]' : 'text-stone-400 hover:text-stone-600'
          }`}
        >
          <span>General Slider Offer Banners</span>
          {subTab === 'slider' && (
            <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#384401] rounded-full" />
          )}
        </button>
      </div>

      {/* RENDER ACCORDING TO ACTIVE SUBTAB */}
      {subTab === 'deal' ? (
        <div className="space-y-12">
          {/* SECTION 1: DEAL OF THE DAY SETTINGS */}
          <div className="border border-[#eeddb9] rounded-3xl p-8 bg-[#FAF4E6]/25 shadow-xs">
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-3">
                <Settings className="w-6 h-6 text-[#384401]" />
                <h3 className="text-base sm:text-lg font-black uppercase tracking-wider text-[#384401]">
                  {editingId ? `Edit Deal Banner #${editingId}` : 'Create Deal of the Day Banner'}
                </h3>
              </div>
              <div className="flex items-center gap-4">
                {editingId && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-750 text-xs sm:text-sm font-bold rounded-xl cursor-pointer transition-colors"
                  >
                    Cancel Edit
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setDealActive(!dealActive)}
                  className={`px-5 py-2 rounded-full text-xs sm:text-sm font-black tracking-wider uppercase transition-colors duration-300 cursor-pointer ${
                    dealActive ? 'bg-green-600 text-white shadow-xs' : 'bg-stone-250 text-stone-755'
                  }`}
                >
                  {dealActive ? 'Active' : 'Disabled'}
                </button>
              </div>
            </div>

            {loading ? (
              <div className="py-16 flex justify-center items-center">
                <span className="text-sm text-stone-500 font-black uppercase tracking-wider animate-pulse">Loading configurations...</span>
              </div>
            ) : (
              <form onSubmit={handleSaveDeal} className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Left Form Column */}
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="flex flex-col gap-2">
                        <label className="text-xs sm:text-sm font-extrabold text-stone-700 uppercase tracking-wider">Banner Deal Title</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Ragi Almond Health Mix"
                          value={dealTitle}
                          onChange={(e) => setDealTitle(e.target.value)}
                          className="h-11 px-4 bg-white border border-[#d3c099] rounded-xl text-sm text-stone-900 focus:outline-[#384401]"
                        />
                      </div>

                      <div className="flex flex-col gap-2">
                        <label className="text-xs sm:text-sm font-extrabold text-stone-700 uppercase tracking-wider">Discount Text Badge</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. 20% OFF"
                          value={dealDiscountText}
                          onChange={(e) => setDealDiscountText(e.target.value)}
                          className="h-11 px-4 bg-white border border-[#d3c099] rounded-xl text-sm text-stone-900 focus:outline-[#384401]"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-xs sm:text-sm font-extrabold text-stone-700 uppercase tracking-wider">Deal Description / Message</label>
                      <textarea
                        placeholder="e.g. Wholesome nourishing health mix for active infants and parents."
                        value={dealDescription}
                        onChange={(e) => setDealDescription(e.target.value)}
                        rows={3}
                        className="p-4 bg-white border border-[#d3c099] rounded-xl text-sm text-stone-900 focus:outline-[#384401] resize-none"
                      />
                    </div>

                    {/* Image Upload Input */}
                    <div className="flex flex-col gap-2">
                      <label className="text-xs sm:text-sm font-extrabold text-stone-700 uppercase tracking-wider">Deal Banner Image</label>
                      <div className="flex gap-4 items-center">
                        {dealImageUrl && (
                          <div className="w-24 h-24 rounded-2xl border border-[#d3c099] overflow-hidden shrink-0 bg-white relative flex flex-col items-center justify-center p-1">
                            <img src={dealImageUrl} alt="deal preview" className="max-w-full max-h-full object-contain" />
                          </div>
                        )}
                        <div className="flex-grow flex flex-col gap-3">
                          <div className="flex gap-3">
                            <label className="flex-grow flex items-center justify-center border-2 border-dashed border-[#d3c099] rounded-2xl py-4 bg-white cursor-pointer hover:bg-stone-50 transition-colors gap-2 text-xs sm:text-sm font-black text-stone-600">
                              <Upload className="w-5 h-5 text-stone-500" />
                              <span>{uploadingDealImg ? 'Uploading...' : 'Upload Image'}</span>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handleDealImageChange}
                                disabled={uploadingDealImg}
                                className="hidden"
                              />
                            </label>
                            {dealImageUrl && (
                              <button
                                type="button"
                                onClick={() => setDealImageUrl('')}
                                className="px-4 bg-red-50 border border-red-200 text-red-655 hover:bg-red-100 rounded-2xl text-xs sm:text-sm font-bold cursor-pointer transition-colors"
                              >
                                Remove Image
                              </button>
                            )}
                          </div>
                          <input
                            type="text"
                            placeholder="Or paste direct image URL here..."
                            value={dealImageUrl}
                            onChange={(e) => setDealImageUrl(e.target.value)}
                            className="h-10 px-4 bg-white border border-[#d3c099] rounded-xl text-xs sm:text-sm text-[#3d2b1f] w-full focus:outline-[#384401]"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Non-Technical Button Link Selector Panel */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                      <div className="flex flex-col gap-2">
                        <label className="text-xs sm:text-sm font-extrabold text-stone-700 uppercase tracking-wider">Button Text</label>
                        <input
                          type="text"
                          placeholder="Shop Now"
                          value={dealButtonText}
                          onChange={(e) => setDealButtonText(e.target.value)}
                          className="h-11 px-4 bg-white border border-[#d3c099] rounded-xl text-sm text-stone-900 focus:outline-[#384401]"
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-xs sm:text-sm font-extrabold text-stone-700 uppercase tracking-wider">Link Page Type</label>
                        <select
                          value={dealLinkType}
                          onChange={(e) => setDealLinkType(e.target.value as any)}
                          className="h-11 px-4 bg-white border border-[#d3c099] rounded-xl text-sm text-stone-900 focus:outline-[#384401] cursor-pointer"
                        >
                          <option value="products">All Products Page</option>
                          <option value="contact">Contact Us Page</option>
                          <option value="cart">Cart Page</option>
                          <option value="product_detail">A Specific Product...</option>
                          <option value="custom">Custom Link / Raw URL</option>
                        </select>
                      </div>
                      
                      {dealLinkType === 'product_detail' && (
                        <div className="flex flex-col gap-2 animate-fade-in">
                          <label className="text-xs sm:text-sm font-extrabold text-stone-700 uppercase tracking-wider">Choose Product</label>
                          <select
                            value={dealSelectedProductId}
                            onChange={(e) => setDealSelectedProductId(e.target.value)}
                            required
                            className="h-11 px-4 bg-white border border-[#d3c099] rounded-xl text-sm text-stone-900 focus:outline-[#384401] cursor-pointer"
                          >
                            <option value="">-- Select Product --</option>
                            {productsList.map(p => (
                              <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                          </select>
                        </div>
                      )}

                      {dealLinkType === 'custom' && (
                        <div className="flex flex-col gap-2 animate-fade-in">
                          <label className="text-xs sm:text-sm font-extrabold text-stone-700 uppercase tracking-wider">Custom Target Link</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. /custom-page or https://..."
                            value={dealCustomButtonLink}
                            onChange={(e) => setDealCustomButtonLink(e.target.value)}
                            className="h-11 px-4 bg-white border border-[#d3c099] rounded-xl text-sm text-stone-900 focus:outline-[#384401]"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Scheduling, Positions & Preview Column */}
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="flex flex-col gap-2">
                        <label className="text-xs sm:text-sm font-extrabold text-stone-700 uppercase tracking-wider">Position Placement</label>
                        <select
                          value={dealPosition}
                          onChange={(e) => setDealPosition(e.target.value as any)}
                          className="h-11 px-4 bg-white border border-[#d3c099] rounded-xl text-sm text-stone-900 focus:outline-[#384401] cursor-pointer"
                        >
                          <option value="top">Top Announcement Bar</option>
                          <option value="center">Centered Popup Modal</option>
                          <option value="bottom-right">Bottom-Right Floating Card</option>
                        </select>
                      </div>

                      <div className="flex flex-col gap-2">
                        <label className="text-xs sm:text-sm font-extrabold text-stone-700 uppercase tracking-wider">Schedule Configuration</label>
                        <select
                          value={dealScheduleType}
                          onChange={(e) => setDealScheduleType(e.target.value as any)}
                          className="h-11 px-4 bg-white border border-[#d3c099] rounded-xl text-sm text-stone-900 focus:outline-[#384401] cursor-pointer"
                        >
                          <option value="always">Always Active</option>
                          <option value="range">Specific Date Range</option>
                          <option value="day_of_week">Recurring Days of Week</option>
                        </select>
                      </div>
                    </div>

                    {dealScheduleType === 'range' && (
                      <div className="p-5 border border-[#eeddb9] bg-[#FAF4E6]/10 rounded-2xl space-y-4 animate-fade-in">
                        <div className="flex items-center gap-2 text-xs sm:text-sm text-[#384401] font-bold">
                          <Calendar className="w-5 h-5" />
                          <span>Select Dates</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] sm:text-xs font-bold text-stone-500 uppercase tracking-wider">Start Date</label>
                            <input
                              type="date"
                              value={dealStartDate}
                              onChange={(e) => setDealStartDate(e.target.value)}
                              className="h-10 px-3 bg-white border border-[#d3c099] rounded-xl text-xs sm:text-sm text-stone-900 focus:outline-[#384401]"
                            />
                          </div>
                          <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] sm:text-xs font-bold text-stone-500 uppercase tracking-wider">End Date</label>
                            <input
                              type="date"
                              value={dealEndDate}
                              onChange={(e) => setDealEndDate(e.target.value)}
                              className="h-10 px-3 bg-white border border-[#d3c099] rounded-xl text-xs sm:text-sm text-stone-900 focus:outline-[#384401]"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {dealScheduleType === 'day_of_week' && (
                      <div className="p-5 border border-[#eeddb9] bg-[#FAF4E6]/10 rounded-2xl space-y-4 animate-fade-in">
                        <div className="flex items-center gap-2 text-xs sm:text-sm text-[#384401] font-bold">
                          <Clock className="w-5 h-5" />
                          <span>Active Days</span>
                        </div>
                        <div className="flex flex-wrap gap-2.5">
                          {daysLabel.map((day, index) => {
                            const isSelected = dealDaysOfWeek.includes(index);
                            return (
                              <button
                                key={day}
                                type="button"
                                onClick={() => toggleDay(index)}
                                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
                                  isSelected
                                    ? 'bg-[#384401] text-white shadow-xs'
                                    : 'bg-white border border-[#d3c099] text-stone-600 hover:bg-[#FAF4E6]/50'
                                }`}
                              >
                                {day}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Popup Live Preview */}
                    <div className="space-y-3">
                      <span className="text-xs sm:text-sm font-extrabold text-stone-600 uppercase tracking-wider flex items-center gap-1.5">
                        <Eye className="w-4 h-4" />
                        Live Preview (On-Site Layout)
                      </span>
                      <div className="border border-[#eeddb9] rounded-2xl overflow-hidden shadow-sm bg-stone-100/40 p-6 flex flex-col items-center justify-center min-h-[180px] gap-4">
                        {dealActive ? (
                          dealPosition === 'top' ? (
                            /* Top Announcement bar preview */
                            <div className="w-full bg-gradient-to-r from-[#A45338] via-[#B86B4C] to-[#8C462E] text-white py-2.5 px-4 rounded-xl flex items-center justify-between gap-3 text-[10px] sm:text-xs uppercase tracking-wider font-extrabold shadow-sm">
                              <div className="flex items-center gap-2">
                                {dealImageUrl && <img src={dealImageUrl} alt="thumb" className="w-5 h-5 rounded-full object-cover" />}
                                <span className="bg-white/20 px-2 py-0.5 rounded-sm">{dealDiscountText || 'OFFER'}</span>
                                <span className="font-bold">{dealTitle}:</span>
                              </div>
                              <span className="px-3 py-1 bg-white text-[#A45338] rounded-full text-[9px] sm:text-[10px] font-black">{dealButtonText}</span>
                            </div>
                          ) : dealPosition === 'center' ? (
                            /* Centered Modal Preview */
                            <div className="bg-[#FAF9F5] border border-[#eeddb9] rounded-[24px] overflow-hidden shadow-md max-w-[280px] w-full relative flex flex-col text-stone-900 border-t-4 border-t-[#384401]">
                              <div className="absolute top-3 right-3 text-stone-400 text-sm">✕</div>
                              {dealImageUrl && (
                                <div className="w-full bg-white p-3 flex items-center justify-center border-b border-[#eeddb9]/30">
                                  <img src={dealImageUrl} alt="deal preview" className="max-h-28 w-auto object-contain rounded-xl" />
                                </div>
                              )}
                              <div className="p-5 flex flex-col items-center gap-3 text-center">
                                <span className="bg-[#A45338] text-white px-3 py-1 rounded-full text-[8px] sm:text-[9px] font-black tracking-widest uppercase">
                                  {dealDiscountText || 'EXCL. DEAL'}
                                </span>
                                <div className="space-y-1">
                                  <h4 className="text-xs sm:text-sm font-black text-[#384401] leading-tight font-display">
                                    {dealTitle || 'Promo Title'}
                                  </h4>
                                  <p className="text-[10px] sm:text-xs text-stone-600 font-medium leading-normal max-w-[220px]">
                                    {dealDescription || 'Promo description...'}
                                  </p>
                                </div>
                                <div className="w-full py-2 bg-[#384401] text-white rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-wider flex items-center justify-center">
                                  <span>{dealButtonText || 'Shop Now'}</span>
                                </div>
                              </div>
                            </div>
                          ) : (
                            /* Bottom Right Float preview */
                            <div className="bg-[#FAF9F5] border border-[#eeddb9] rounded-xl p-4 shadow-md max-w-[260px] w-full relative flex flex-col text-stone-900 border-l-4 border-l-[#A45338]">
                              <div className="absolute top-2 right-2 text-stone-455 text-xs">✕</div>
                              <div className="flex gap-3 items-start">
                                {dealImageUrl ? (
                                  <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 border border-[#eeddb9]/30 bg-white flex items-center justify-center p-0.5">
                                    <img src={dealImageUrl} alt="deal preview" className="max-w-full max-h-full object-contain" />
                                  </div>
                                ) : (
                                  <div className="w-10 h-10 rounded-xl shrink-0 bg-[#FAF4E6] flex items-center justify-center text-[#A45338]">
                                    <Tag className="w-5 h-5" />
                                  </div>
                                )}
                                <div className="flex-grow flex flex-col leading-tight">
                                  <span className="text-[8px] text-[#A45338] font-black uppercase">{dealDiscountText || 'Offer'}</span>
                                  <h4 className="text-xs font-black text-[#384401] truncate">{dealTitle || 'Title'}</h4>
                                  <p className="text-[10px] text-stone-500 line-clamp-1">{dealDescription}</p>
                                </div>
                              </div>
                              <div className="flex justify-end gap-2 mt-3 text-[9px] font-bold">
                                <span className="text-stone-500 py-0.5">Maybe Later</span>
                                <span className="px-3 py-0.5 bg-[#384401] text-white rounded-md font-black uppercase">{dealButtonText}</span>
                              </div>
                            </div>
                          )
                        ) : (
                          <div className="py-4 text-center text-xs sm:text-sm text-stone-455 font-bold uppercase tracking-wider border border-dashed border-stone-200 rounded-lg w-full">
                            Popup Banner is Currently Disabled
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Messages */}
                {message.text && (
                  <div className={`p-4 rounded-xl text-xs sm:text-sm font-bold ${message.isError ? 'bg-red-50 border border-red-200 text-red-700' : 'bg-emerald-50 border border-emerald-200 text-emerald-800'}`}>
                    {message.text}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full bg-[#384401] hover:bg-[#252d00] disabled:bg-[#384401]/55 text-white text-xs sm:text-sm font-black py-3.5 rounded-2xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-xs active:scale-[0.99]"
                >
                  <Save className="w-5 h-5" />
                  {saving 
                    ? 'Saving Settings...' 
                    : editingId 
                      ? `Update Deal Banner #${editingId}` 
                      : 'Create & Publish New Deal Banner'
                  }
                </button>
              </form>
            )}
          </div>

          {/* SECTION 2: PAST DEAL BANNERS HISTORY LIST */}
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#eeddb9]/30 pb-4">
              <h3 className="text-base sm:text-lg font-black uppercase tracking-wider text-[#384401] flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Deal Banners History ({dealBanners.length})
              </h3>
              
              {/* Search and Filters */}
              <div className="flex gap-3 flex-wrap">
                <input
                  type="text"
                  placeholder="Search past banners..."
                  value={historySearch}
                  onChange={(e) => setHistorySearch(e.target.value)}
                  className="h-10 px-3 bg-white border border-[#d3c099] rounded-xl text-xs sm:text-sm text-stone-900 focus:outline-[#384401] min-w-[160px]"
                />
                <select
                  value={historyFilter}
                  onChange={(e) => setHistoryFilter(e.target.value as any)}
                  className="h-10 px-3 bg-white border border-[#d3c099] rounded-xl text-xs sm:text-sm text-stone-900 focus:outline-[#384401] cursor-pointer"
                >
                  <option value="all">All Positions</option>
                  <option value="top">Top Announcement Bar</option>
                  <option value="center">Centered Popup Modal</option>
                  <option value="bottom-right">Bottom-Right Floating Card</option>
                </select>
              </div>
            </div>
            
            {dealBanners.length === 0 ? (
              <div className="py-12 text-center text-xs sm:text-sm text-stone-400 font-bold uppercase tracking-wider border border-dashed border-stone-250 rounded-2xl bg-stone-50/10">
                No deal of the day banners created yet.
              </div>
            ) : (
              <div className="max-h-[500px] overflow-y-auto pr-2 space-y-4 scrollbar-thin">
                {dealBanners
                  .filter(b => {
                    const matchesSearch = b.title.toLowerCase().includes(historySearch.toLowerCase()) || 
                                          b.description.toLowerCase().includes(historySearch.toLowerCase());
                    const matchesPosition = historyFilter === 'all' || b.position === historyFilter;
                    return matchesSearch && matchesPosition;
                  })
                  .map((b) => (
                    <div 
                      key={b.id} 
                      className={`border rounded-2xl p-6 bg-white transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-3xs ${
                        b.active ? 'border-[#384401] bg-[#FAF8F5]/30' : 'border-stone-200'
                      }`}
                    >
                      <div className="flex gap-4 items-start">
                        {b.imageUrl ? (
                          <div className="w-20 h-20 rounded-2xl overflow-hidden shrink-0 border border-[#eeddb9]/40 bg-white relative flex items-center justify-center p-1">
                            <img src={b.imageUrl} alt={b.title} className="max-w-full max-h-full object-contain" />
                          </div>
                        ) : (
                          <div className="w-20 h-20 rounded-2xl shrink-0 bg-[#FAF4E6] flex items-center justify-center text-[#A45338] border border-stone-200/50">
                            <Tag className="w-8 h-8" />
                          </div>
                        )}
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-stone-850 text-sm sm:text-base">{b.title}</span>
                            <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-md bg-[#A45338]/10 text-[#A45338]">
                              {b.discountText || 'OFFER'}
                            </span>
                            <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-md bg-stone-100 text-stone-600">
                              {b.position || 'center'}
                            </span>
                          </div>
                          <p className="text-xs sm:text-sm text-stone-500 font-medium leading-relaxed max-w-xl line-clamp-2">
                            {b.description || 'No description message.'}
                          </p>
                          <span className="text-[10px] sm:text-xs text-stone-400 block tracking-wide">
                            Target Link: <span className="font-bold text-stone-600">{b.buttonLink}</span>
                            {b.scheduleType !== 'always' && ` | Schedule: ${b.scheduleType}`}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 self-end md:self-center">
                        <button
                          onClick={() => handleToggleActive(b.id!)}
                          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black tracking-wider uppercase transition-all cursor-pointer ${
                            b.active 
                              ? 'bg-green-600 hover:bg-green-700 text-white shadow-xs' 
                              : 'bg-stone-100 hover:bg-stone-200 text-stone-600'
                          }`}
                        >
                          <Power className="w-4 h-4" />
                          <span>{b.active ? 'Active' : 'Draft'}</span>
                        </button>

                        <button
                          onClick={() => handleEditClick(b)}
                          className="p-2.5 text-stone-500 hover:text-[#384401] hover:bg-[#FAF4E6] rounded-xl transition-all cursor-pointer border border-stone-200 bg-white"
                          title="Edit Banner"
                        >
                          <Edit3 className="w-4.5 h-4.5" />
                        </button>

                        <button
                          onClick={() => handleDeleteBanner(b.id!)}
                          className="p-2.5 text-stone-400 hover:text-red-655 hover:bg-red-50 rounded-xl transition-all cursor-pointer border border-stone-200 bg-white"
                          title="Delete Banner"
                        >
                          <Trash2 className="w-4.5 h-4.5" />
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* SECTION 2: GENERAL SLIDER BANNERS */
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1.8fr] gap-8 items-start">
            {/* Left Column: Upload Banner Form */}
            <form onSubmit={handleAddBanner} className="border border-[#d3c099] rounded-3xl p-6 bg-[#FAF4E6]/10 space-y-4">
              <h3 className="text-sm font-black uppercase tracking-wider text-[#384401] flex items-center gap-2">
                <Sparkles className="w-4.5 h-4.5" />
                Upload Slider Banner
              </h3>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-stone-600">Banner Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sprouted Ragi Special 15%"
                  value={bannerTitle}
                  onChange={(e) => setBannerTitle(e.target.value)}
                  className="h-11 px-4 bg-white border border-[#d3c099] rounded-xl text-sm text-stone-900"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-stone-600">Image Source URL</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. /images/cookies-banner.webp"
                  value={bannerImageUrl}
                  onChange={(e) => setBannerImageUrl(e.target.value)}
                  className="h-11 px-4 bg-white border border-[#d3c099] rounded-xl text-sm text-stone-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-stone-600">Target Link URL</label>
                  <input
                    type="text"
                    placeholder="/products?category=Malt"
                    value={bannerLink}
                    onChange={(e) => setBannerLink(e.target.value)}
                    className="h-11 px-4 bg-white border border-[#d3c099] rounded-xl text-sm text-stone-900"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-stone-600">Ribbon tag</label>
                  <input
                    type="text"
                    placeholder="e.g. LIMITED OFFER"
                    value={bannerTag}
                    onChange={(e) => setBannerTag(e.target.value)}
                    className="h-11 px-4 bg-white border border-[#d3c099] rounded-xl text-sm text-stone-900"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-[#384401] hover:bg-[#252d00] text-white text-xs sm:text-sm font-black py-3 rounded-xl transition-colors cursor-pointer"
              >
                Publish Slider Banner
              </button>
            </form>

            {/* Right Column: Banners List Preview */}
            <div className="space-y-4">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-stone-650">
                Active Slider Banner Rotators ({banners.length})
              </h3>

              <div className="space-y-4">
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
      )}
    </div>
  );
}
