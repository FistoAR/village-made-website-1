'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { 
  Gift, 
  PackageCheck, 
  Truck, 
  Sparkles, 
  ShieldCheck, 
  CheckCircle2, 
  Building2, 
  Calendar, 
  MapPin, 
  Mail, 
  Phone, 
  User, 
  FileText, 
  Layers, 
  Send,
  Boxes,
  HeartHandshake,
  BadgePercent,
  X,
  Check,
  Plus,
  Trash2,
  ChevronRight,
  Award
} from 'lucide-react';
import { PRODUCTS } from '@/data/products-list';

interface SelectedProduct {
  id: string;
  name: string;
  weight: string;
  qty: number;
}

export default function BulkOrdersPage() {
  const [formData, setFormData] = useState({
    name: '',
    companyName: '',
    email: '',
    phone: '',
    purpose: 'Wedding & Event Return Gifts',
    neededByDate: '',
    city: '',
    pincode: '',
    estimatedQty: 50,
    notes: '',
    customPackaging: false,
    customCard: false,
    logoPrinting: false
  });

  const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>([
    {
      id: PRODUCTS[0]?.id || 'm-1',
      name: PRODUCTS[0]?.name || 'BANANA BABY MALT',
      weight: PRODUCTS[0]?.weights?.[0] || '500g',
      qty: 50
    }
  ]);

  const [submitting, setSubmitting] = useState(false);
  const [successInquiryId, setSuccessInquiryId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  // Sample Request Modal State
  const [showSampleModal, setShowSampleModal] = useState(false);
  const [sampleSubmitting, setSampleSubmitting] = useState(false);
  const [sampleSuccess, setSampleSuccess] = useState(false);
  const [sampleFormData, setSampleFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    selectedProduct: PRODUCTS[0]?.name || 'BANANA BABY MALT'
  });

  const handleAddProduct = () => {
    const firstProd = PRODUCTS[0];
    if (firstProd) {
      setSelectedProducts(prev => [
        ...prev,
        {
          id: firstProd.id,
          name: firstProd.name,
          weight: firstProd.weights?.[0] || '500g',
          qty: 25
        }
      ]);
    }
  };

  const handleRemoveProduct = (index: number) => {
    if (selectedProducts.length > 1) {
      setSelectedProducts(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleProductChange = (index: number, productId: string) => {
    const found = PRODUCTS.find(p => p.id === productId);
    if (found) {
      setSelectedProducts(prev => {
        const next = [...prev];
        next[index] = {
          ...next[index],
          id: found.id,
          name: found.name,
          weight: found.weights?.[0] || '500g'
        };
        return next;
      });
    }
  };

  const handleQtyChange = (index: number, newQty: number) => {
    setSelectedProducts(prev => {
      const next = [...prev];
      next[index].qty = Math.max(1, newQty);
      return next;
    });
  };

  const handleWeightChange = (index: number, weight: string) => {
    setSelectedProducts(prev => {
      const next = [...prev];
      next[index].weight = weight;
      return next;
    });
  };

  const handleSubmitInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!formData.name || !formData.email || !formData.phone) {
      setErrorMessage('Please fill in your name, email, and phone number.');
      return;
    }

    setSubmitting(true);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
      const payload = {
        ...formData,
        selectedProducts,
        customizations: {
          customPackaging: formData.customPackaging,
          customCard: formData.customCard,
          logoPrinting: formData.logoPrinting
        },
        isSampleRequest: false
      };

      const res = await fetch(`${baseUrl}/bulk/inquire`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (data.success) {
        setSuccessInquiryId(data.inquiry.id);
        window.scrollTo({ top: 300, behavior: 'smooth' });
      } else {
        setErrorMessage(data.error || 'Failed to submit bulk inquiry.');
      }
    } catch (err) {
      setErrorMessage('Network error while submitting inquiry. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSampleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSampleSubmitting(true);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
      const payload = {
        name: sampleFormData.name,
        phone: sampleFormData.phone,
        email: sampleFormData.email,
        purpose: 'Sample Request',
        city: sampleFormData.address,
        notes: `Sample requested for product: ${sampleFormData.selectedProduct}`,
        isSampleRequest: true
      };

      const res = await fetch(`${baseUrl}/bulk/inquire`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (data.success) {
        setSampleSuccess(true);
      }
    } catch (err) {
      // fallback
    } finally {
      setSampleSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fdfaf3] text-[#3d2b1f] font-jakarta selection:bg-[#384401] selection:text-white relative">
      <Navbar />

      {/* Decorative Leaves (Top-Left) */}
      <div className="absolute top-0 left-0 w-32 sm:w-44 md:w-56 opacity-85 pointer-events-none mix-blend-multiply z-20 animate-sway-1">
        <Image
          src="/images/about/leaf-top.webp"
          alt="Decorative leaves"
          width={300}
          height={300}
          className="object-contain"
        />
      </div>

      {/* Decorative Leaves (Top-Right) */}
      <div className="absolute top-0 right-0 w-32 sm:w-44 md:w-56 opacity-85 pointer-events-none z-20 animate-sway-2">
        <Image
          src="/images/gallery/gallery-leaf-image.webp"
          alt="Decorative leaves top-right"
          width={300}
          height={300}
          className="object-contain object-right-top"
        />
      </div>

      {/* Decorative Leaves (Left-Middle Watermark) */}
      <div className="absolute top-[20%] left-0 w-44 sm:w-64 opacity-50 pointer-events-none mix-blend-multiply z-0">
        <Image
          src="/images/about/leaf-left.webp"
          alt="Watermark leaf"
          width={280}
          height={500}
          className="object-contain object-left"
        />
      </div>

      {/* HERO SECTION */}
      <section className="relative pt-32 pb-14 md:pt-40 md:pb-20 px-4 text-center overflow-hidden">
        <div className="max-w-4xl mx-auto space-y-4 relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#384401]/10 border border-[#384401]/20 text-[#384401] text-xs font-black uppercase tracking-[0.2em]">
            <Award className="w-4 h-4 text-[#C56C4F]" />
            <span>Artisanal B2B & Corporate Solutions</span>
          </div>

          <div>
            <span 
              className="text-[#C56C4F] block normal-case tracking-normal mb-[-10px] text-3xl sm:text-4xl md:text-5xl"
              style={{ fontFamily: "'Splash', cursive" }}
            >
              Authentic & Traditional
            </span>
            <h1 
              className="text-4xl sm:text-5xl md:text-6xl text-[#3d2b1f] tracking-[0.1em] font-bold uppercase mt-2 leading-tight"
              style={{ fontFamily: "'Poetsen One', sans-serif" }}
            >
              Bulk & Corporate Orders
            </h1>
          </div>

          <p className="max-w-2xl mx-auto text-sm sm:text-base text-stone-650 font-medium leading-relaxed">
            Direct farm-to-table organic produce for wedding return gifts, festival hampers, corporate gifting, and wholesale supply. Handcrafted in small batches with custom branding choices.
          </p>

          {/* Value Propositions Pill Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 pt-8 max-w-4xl mx-auto">
            <div className="p-4 bg-white/80 backdrop-blur-md rounded-2xl border-2 border-[#eeddb9] shadow-xs flex items-center gap-3.5 hover:shadow-md transition-all">
              <div className="p-2.5 rounded-xl bg-[#FAF4E6] text-[#384401] shrink-0">
                <BadgePercent className="w-5 h-5" />
              </div>
              <div className="text-left">
                <p className="text-xs font-black text-[#384401]">Volume Savings</p>
                <p className="text-[10px] text-stone-500 font-bold">Tiered Pricing</p>
              </div>
            </div>

            <div className="p-4 bg-white/80 backdrop-blur-md rounded-2xl border-2 border-[#eeddb9] shadow-xs flex items-center gap-3.5 hover:shadow-md transition-all">
              <div className="p-2.5 rounded-xl bg-[#FAF4E6] text-[#C56C4F] shrink-0">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <div className="text-left">
                <p className="text-xs font-black text-[#384401]">Custom Branding</p>
                <p className="text-[10px] text-stone-500 font-bold">Personalized Tags</p>
              </div>
            </div>

            <div className="p-4 bg-white/80 backdrop-blur-md rounded-2xl border-2 border-[#eeddb9] shadow-xs flex items-center gap-3.5 hover:shadow-md transition-all">
              <div className="p-2.5 rounded-xl bg-[#FAF4E6] text-[#384401] shrink-0">
                <Boxes className="w-5 h-5" />
              </div>
              <div className="text-left">
                <p className="text-xs font-black text-[#384401]">Gift Hampers</p>
                <p className="text-[10px] text-stone-500 font-bold">Jute & Wooden Boxes</p>
              </div>
            </div>

            <div className="p-4 bg-white/80 backdrop-blur-md rounded-2xl border-2 border-[#eeddb9] shadow-xs flex items-center gap-3.5 hover:shadow-md transition-all">
              <div className="p-2.5 rounded-xl bg-[#FAF4E6] text-[#C56C4F] shrink-0">
                <Truck className="w-5 h-5" />
              </div>
              <div className="text-left">
                <p className="text-xs font-black text-[#384401]">Pan-India Delivery</p>
                <p className="text-[10px] text-stone-500 font-bold">Doorstep Freight</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MAIN FORM AND SIDEBAR SECTION */}
      <section className="pb-20 md:pb-28 px-4 max-w-6xl mx-auto relative z-10">
        {successInquiryId ? (
          /* Submission Success State */
          <div className="bg-white/90 backdrop-blur-md rounded-[32px] p-8 sm:p-14 border-2 border-[#eeddb9] shadow-2xl text-center space-y-6 max-w-2xl mx-auto animate-scale-up">
            <div className="w-20 h-20 rounded-full bg-[#384401]/10 text-[#384401] flex items-center justify-center mx-auto border border-[#384401]/20 shadow-inner">
              <CheckCircle2 className="w-12 h-12" />
            </div>
            <div className="space-y-2">
              <span 
                className="text-[#C56C4F] block text-2xl sm:text-3xl"
                style={{ fontFamily: "'Splash', cursive" }}
              >
                Thank You!
              </span>
              <h2 
                className="text-2xl sm:text-3xl text-[#3d2b1f] uppercase tracking-wider font-bold"
                style={{ fontFamily: "'Poetsen One', sans-serif" }}
              >
                Inquiry Received
              </h2>
              <p className="text-xs sm:text-sm text-stone-600 font-medium">
                Your bulk reference code is:
              </p>
              <div className="inline-block px-5 py-2.5 bg-[#FAF4E6] rounded-2xl border-2 border-[#eeddb9] font-mono font-black text-[#C56C4F] text-xl shadow-xs">
                {successInquiryId}
              </div>
            </div>
            <p className="text-xs text-stone-600 max-w-md mx-auto leading-relaxed font-medium">
              Our B2B Bulk Orders Desk will review your items and reach out via WhatsApp/Phone within 24 hours with a custom quote & estimated delivery timeline.
            </p>
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => {
                  setSuccessInquiryId(null);
                  setFormData({
                    name: '',
                    companyName: '',
                    email: '',
                    phone: '',
                    purpose: 'Wedding & Event Return Gifts',
                    neededByDate: '',
                    city: '',
                    pincode: '',
                    estimatedQty: 50,
                    notes: '',
                    customPackaging: false,
                    customCard: false,
                    logoPrinting: false
                  });
                }}
                className="px-6 py-3.5 bg-[#384401] hover:bg-[#252d00] text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all duration-300 shadow-md hover:scale-[1.02] cursor-pointer w-full sm:w-auto"
              >
                Submit Another Request
              </button>
              <Link
                href="/products"
                className="px-6 py-3.5 bg-[#FAF4E6] border border-[#eeddb9] text-[#3d2b1f] rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-[#eeddb9]/50 transition-all cursor-pointer w-full sm:w-auto text-center"
              >
                Browse All Products
              </Link>
            </div>
          </div>
        ) : (
          /* Main Layout: Form (Left 7 cols) & Info Sidebar (Right 5 cols) */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* LEFT COLUMN: Request Form Card */}
            <div className="lg:col-span-7 bg-white/90 backdrop-blur-md rounded-[32px] p-6 sm:p-10 border-2 border-[#eeddb9] shadow-xl space-y-8 relative overflow-hidden">
              {/* Header Title */}
              <div className="flex items-center justify-between border-b border-[#eeddb9]/50 pb-5">
                <div>
                  <span 
                    className="text-[#C56C4F] block text-xl sm:text-2xl"
                    style={{ fontFamily: "'Splash', cursive" }}
                  >
                    Customized Quotation
                  </span>
                  <h2 
                    className="text-2xl sm:text-3xl text-[#384401] uppercase tracking-wider font-bold"
                    style={{ fontFamily: "'Poetsen One', sans-serif" }}
                  >
                    Request Bulk Quote
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setShowSampleModal(true)}
                  className="hidden sm:flex items-center gap-1.5 px-4 py-2 bg-[#FAF4E6] border border-[#eeddb9] text-[#C56C4F] rounded-2xl text-xs font-black uppercase tracking-wider hover:bg-[#eeddb9]/50 transition-all cursor-pointer shadow-2xs"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Request Sample Box</span>
                </button>
              </div>

              {errorMessage && (
                <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold">
                  {errorMessage}
                </div>
              )}

              <form onSubmit={handleSubmitInquiry} className="space-y-6">
                
                {/* SECTION 1: Contact Details */}
                <div className="space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[#C56C4F] flex items-center gap-2 border-b border-[#eeddb9]/30 pb-2">
                    <User className="w-4 h-4 text-[#384401]" />
                    <span>1. Contact & Business Details</span>
                  </h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-black uppercase text-stone-650 tracking-wider mb-1">Full Name *</label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g. Ramesh Kumar"
                        className="w-full px-4 py-3 bg-[#FAF4E6]/50 border-2 border-[#eeddb9]/80 rounded-2xl text-xs font-bold text-[#3d2b1f] focus:bg-white focus:outline-none focus:border-[#384401] transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-black uppercase text-stone-650 tracking-wider mb-1">Company / Event Name</label>
                      <input
                        type="text"
                        value={formData.companyName}
                        onChange={e => setFormData({ ...formData, companyName: e.target.value })}
                        placeholder="e.g. Infosys / Wedding Event"
                        className="w-full px-4 py-3 bg-[#FAF4E6]/50 border-2 border-[#eeddb9]/80 rounded-2xl text-xs font-bold text-[#3d2b1f] focus:bg-white focus:outline-none focus:border-[#384401] transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-black uppercase text-stone-650 tracking-wider mb-1">Email Address *</label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                        placeholder="name@domain.com"
                        className="w-full px-4 py-3 bg-[#FAF4E6]/50 border-2 border-[#eeddb9]/80 rounded-2xl text-xs font-bold text-[#3d2b1f] focus:bg-white focus:outline-none focus:border-[#384401] transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-black uppercase text-stone-650 tracking-wider mb-1">Phone Number (WhatsApp) *</label>
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+91 98765 43210"
                        className="w-full px-4 py-3 bg-[#FAF4E6]/50 border-2 border-[#eeddb9]/80 rounded-2xl text-xs font-bold text-[#3d2b1f] focus:bg-white focus:outline-none focus:border-[#384401] transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* SECTION 2: Purpose & Occasion */}
                <div className="space-y-4 pt-2">
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[#C56C4F] flex items-center gap-2 border-b border-[#eeddb9]/30 pb-2">
                    <Building2 className="w-4 h-4 text-[#384401]" />
                    <span>2. Purpose & Event Details</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-black uppercase text-stone-650 tracking-wider mb-1">Purpose / Occasion *</label>
                      <select
                        value={formData.purpose}
                        onChange={e => setFormData({ ...formData, purpose: e.target.value })}
                        className="w-full px-4 py-3 bg-[#FAF4E6]/50 border-2 border-[#eeddb9]/80 rounded-2xl text-xs font-black text-[#384401] focus:bg-white focus:outline-none focus:border-[#384401] transition-all cursor-pointer"
                      >
                        <option value="Wedding & Event Return Gifts">Wedding & Event Return Gifts</option>
                        <option value="Corporate Festive Gifting">Corporate Festive Gifting</option>
                        <option value="Resort & Restaurant Supply">Resort & Restaurant Supply</option>
                        <option value="Retail Wholesale / Organic Store">Retail Wholesale / Organic Store</option>
                        <option value="Personal Family Bulk Purchase">Personal Family Bulk Purchase</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-black uppercase text-stone-650 tracking-wider mb-1">Target Delivery Date</label>
                      <input
                        type="date"
                        value={formData.neededByDate}
                        onChange={e => setFormData({ ...formData, neededByDate: e.target.value })}
                        className="w-full px-4 py-3 bg-[#FAF4E6]/50 border-2 border-[#eeddb9]/80 rounded-2xl text-xs font-bold text-[#3d2b1f] focus:bg-white focus:outline-none focus:border-[#384401] transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-black uppercase text-stone-650 tracking-wider mb-1">Destination City</label>
                      <input
                        type="text"
                        value={formData.city}
                        onChange={e => setFormData({ ...formData, city: e.target.value })}
                        placeholder="e.g. Bengaluru / Mysuru"
                        className="w-full px-4 py-3 bg-[#FAF4E6]/50 border-2 border-[#eeddb9]/80 rounded-2xl text-xs font-bold text-[#3d2b1f] focus:bg-white focus:outline-none focus:border-[#384401] transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-black uppercase text-stone-650 tracking-wider mb-1">Pincode</label>
                      <input
                        type="text"
                        value={formData.pincode}
                        onChange={e => setFormData({ ...formData, pincode: e.target.value })}
                        placeholder="560001"
                        className="w-full px-4 py-3 bg-[#FAF4E6]/50 border-2 border-[#eeddb9]/80 rounded-2xl text-xs font-bold text-[#3d2b1f] focus:bg-white focus:outline-none focus:border-[#384401] transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* SECTION 3: Itemized Product Picker */}
                <div className="space-y-4 pt-2">
                  <div className="flex items-center justify-between border-b border-[#eeddb9]/30 pb-2">
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[#C56C4F] flex items-center gap-2">
                      <Boxes className="w-4 h-4 text-[#384401]" />
                      <span>3. Itemized Product Selection</span>
                    </h3>
                    <button
                      type="button"
                      onClick={handleAddProduct}
                      className="text-xs font-black text-[#384401] hover:text-[#C56C4F] cursor-pointer flex items-center gap-1 transition-colors uppercase tracking-wider"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Product</span>
                    </button>
                  </div>

                  <div className="space-y-3">
                    {selectedProducts.map((item, idx) => (
                      <div 
                        key={idx} 
                        className="p-4 bg-[#FAF4E6]/60 rounded-2xl border-2 border-[#eeddb9]/70 grid grid-cols-1 sm:grid-cols-12 gap-3 items-center shadow-2xs"
                      >
                        <div className="sm:col-span-6">
                          <label className="block text-[10px] font-black uppercase text-stone-500 mb-1">Select Organic Product</label>
                          <select
                            value={item.id}
                            onChange={e => handleProductChange(idx, e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-[#eeddb9] rounded-xl text-xs font-extrabold text-[#384401] focus:outline-none"
                          >
                            {PRODUCTS.map(prod => (
                              <option key={prod.id} value={prod.id}>
                                {prod.name} (₹{prod.price})
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="sm:col-span-3">
                          <label className="block text-[10px] font-black uppercase text-stone-500 mb-1">Pack Size</label>
                          <select
                            value={item.weight}
                            onChange={e => handleWeightChange(idx, e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-[#eeddb9] rounded-xl text-xs font-bold text-stone-800 focus:outline-none"
                          >
                            <option value="250g">250g</option>
                            <option value="500g">500g</option>
                            <option value="1kg">1kg</option>
                            <option value="5kg Bulk Pack">5kg Bulk Pack</option>
                          </select>
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block text-[10px] font-black uppercase text-stone-500 mb-1">Units Qty</label>
                          <input
                            type="number"
                            min="1"
                            value={item.qty}
                            onChange={e => handleQtyChange(idx, parseInt(e.target.value) || 1)}
                            className="w-full px-3 py-2 bg-white border border-[#eeddb9] rounded-xl text-xs font-black text-[#384401] text-center focus:outline-none"
                          />
                        </div>

                        <div className="sm:col-span-1 text-right sm:text-center pt-1 sm:pt-4">
                          {selectedProducts.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveProduct(idx)}
                              className="p-1.5 text-stone-400 hover:text-red-600 rounded-lg transition-colors cursor-pointer"
                              title="Remove item"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* SECTION 4: Customization Options */}
                <div className="space-y-4 pt-2">
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[#C56C4F] flex items-center gap-2 border-b border-[#eeddb9]/30 pb-2">
                    <Sparkles className="w-4 h-4 text-[#384401]" />
                    <span>4. Custom Packaging & Branding</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <label className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center gap-3 ${
                      formData.customPackaging 
                        ? 'bg-[#384401]/10 border-[#384401] text-[#384401] shadow-xs' 
                        : 'bg-[#FAF4E6]/40 border-[#eeddb9] text-stone-700 hover:bg-[#FAF4E6]'
                    }`}>
                      <input
                        type="checkbox"
                        checked={formData.customPackaging}
                        onChange={e => setFormData({ ...formData, customPackaging: e.target.checked })}
                        className="accent-[#384401] w-4 h-4 rounded cursor-pointer"
                      />
                      <span className="text-xs font-black">Jute / Rigid Box</span>
                    </label>

                    <label className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center gap-3 ${
                      formData.customCard 
                        ? 'bg-[#384401]/10 border-[#384401] text-[#384401] shadow-xs' 
                        : 'bg-[#FAF4E6]/40 border-[#eeddb9] text-stone-700 hover:bg-[#FAF4E6]'
                    }`}>
                      <input
                        type="checkbox"
                        checked={formData.customCard}
                        onChange={e => setFormData({ ...formData, customCard: e.target.checked })}
                        className="accent-[#384401] w-4 h-4 rounded cursor-pointer"
                      />
                      <span className="text-xs font-black">Greeting Note Card</span>
                    </label>

                    <label className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center gap-3 ${
                      formData.logoPrinting 
                        ? 'bg-[#384401]/10 border-[#384401] text-[#384401] shadow-xs' 
                        : 'bg-[#FAF4E6]/40 border-[#eeddb9] text-stone-700 hover:bg-[#FAF4E6]'
                    }`}>
                      <input
                        type="checkbox"
                        checked={formData.logoPrinting}
                        onChange={e => setFormData({ ...formData, logoPrinting: e.target.checked })}
                        className="accent-[#384401] w-4 h-4 rounded cursor-pointer"
                      />
                      <span className="text-xs font-black">Custom Logo Tag</span>
                    </label>
                  </div>
                </div>

                {/* SECTION 5: Additional Notes */}
                <div className="space-y-2 pt-2">
                  <label className="block text-[11px] font-black uppercase text-stone-650 tracking-wider">
                    Special Requirements or Instructions
                  </label>
                  <textarea
                    rows={3}
                    value={formData.notes}
                    onChange={e => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Mention custom box themes, event dates, dietary preferences..."
                    className="w-full px-4 py-3 bg-[#FAF4E6]/50 border-2 border-[#eeddb9]/80 rounded-2xl text-xs font-medium text-[#3d2b1f] focus:bg-white focus:outline-none focus:border-[#384401] transition-all"
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-4 bg-gradient-to-r from-[#384401] via-[#4d5a02] to-[#384401] hover:from-[#252d00] hover:to-[#384401] text-white rounded-2xl text-xs font-black uppercase tracking-[0.2em] transition-all duration-300 shadow-md hover:scale-[1.01] flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50"
                >
                  <Send className={`w-4 h-4 ${submitting ? 'animate-bounce' : ''}`} />
                  <span>{submitting ? 'Submitting Request...' : 'Submit Bulk Inquiry'}</span>
                </button>
              </form>
            </div>

            {/* RIGHT COLUMN: Info & Assistance Cards */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Card 1: How Bulk Ordering Works */}
              <div className="bg-white/90 backdrop-blur-md rounded-[32px] p-6 sm:p-8 border-2 border-[#eeddb9] shadow-xl space-y-6">
                <div>
                  <span 
                    className="text-[#C56C4F] block text-lg"
                    style={{ fontFamily: "'Splash', cursive" }}
                  >
                    Simple & Transparent
                  </span>
                  <h3 
                    className="text-xl text-[#384401] uppercase tracking-wider font-bold"
                    style={{ fontFamily: "'Poetsen One', sans-serif" }}
                  >
                    How It Works
                  </h3>
                </div>

                <div className="space-y-5 relative before:absolute before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#eeddb9]">
                  <div className="flex gap-4 relative">
                    <div className="w-8 h-8 rounded-full bg-[#384401] text-white font-black text-xs flex items-center justify-center shrink-0 shadow-sm z-10 font-mono">
                      01
                    </div>
                    <div>
                      <h4 className="text-xs font-extrabold text-[#384401] uppercase tracking-wider">Submit Inquiry</h4>
                      <p className="text-[11px] text-stone-600 leading-relaxed mt-0.5 font-medium">
                        Specify your products, estimated quantity, and delivery timeline.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4 relative">
                    <div className="w-8 h-8 rounded-full bg-[#384401] text-white font-black text-xs flex items-center justify-center shrink-0 shadow-sm z-10 font-mono">
                      02
                    </div>
                    <div>
                      <h4 className="text-xs font-extrabold text-[#384401] uppercase tracking-wider">Receive Price Quotation</h4>
                      <p className="text-[11px] text-stone-600 leading-relaxed mt-0.5 font-medium">
                        Our bulk manager sends a detailed quote & mock-up via WhatsApp/Email.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4 relative">
                    <div className="w-8 h-8 rounded-full bg-[#384401] text-white font-black text-xs flex items-center justify-center shrink-0 shadow-sm z-10 font-mono">
                      03
                    </div>
                    <div>
                      <h4 className="text-xs font-extrabold text-[#384401] uppercase tracking-wider">Handcrafted Batching</h4>
                      <p className="text-[11px] text-stone-600 leading-relaxed mt-0.5 font-medium">
                        Fresh organic health mixes and cold-pressed oils prepared on demand.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4 relative">
                    <div className="w-8 h-8 rounded-full bg-[#C56C4F] text-white font-black text-xs flex items-center justify-center shrink-0 shadow-sm z-10 font-mono">
                      04
                    </div>
                    <div>
                      <h4 className="text-xs font-extrabold text-[#384401] uppercase tracking-wider">Secure Freight Delivery</h4>
                      <p className="text-[11px] text-stone-600 leading-relaxed mt-0.5 font-medium">
                        Shipped safely in protective master cartons directly to your venue.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 2: Sample Tasting Kit Box */}
              <div className="bg-gradient-to-br from-[#384401] via-[#2d3800] to-[#252d00] rounded-[32px] p-6 text-white space-y-4 shadow-xl border-2 border-[#eeddb9]/40 relative overflow-hidden">
                <div className="absolute -right-6 -bottom-6 opacity-15 pointer-events-none">
                  <Gift className="w-48 h-48" />
                </div>
                
                <span className="bg-white/20 text-white px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border border-white/25">
                  Tasting Box
                </span>

                <h4 
                  className="text-xl font-bold uppercase tracking-wide leading-snug"
                  style={{ fontFamily: "'Poetsen One', sans-serif" }}
                >
                  Test Quality Before Bulk Orders
                </h4>

                <p className="text-xs text-stone-200 leading-relaxed font-medium">
                  Request a Village Made Sample Kit delivered to your address with mini jars of health mix, oils, and honey.
                </p>

                <button
                  onClick={() => setShowSampleModal(true)}
                  className="px-5 py-3 bg-white text-[#384401] rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-[#FAF4E6] transition-all cursor-pointer shadow-md hover:scale-[1.02]"
                >
                  Request Sample Box
                </button>
              </div>

              {/* Card 3: Direct Phone / Contact Assistance */}
              <div className="bg-[#FAF4E6] rounded-[32px] p-6 border-2 border-[#eeddb9] space-y-3">
                <h4 
                  className="text-lg font-bold text-[#384401] uppercase tracking-wide"
                  style={{ fontFamily: "'Poetsen One', sans-serif" }}
                >
                  Urgent Bulk Assistance?
                </h4>
                <p className="text-xs text-stone-650 leading-relaxed font-medium">
                  Have an upcoming event in less than 3 days? Talk directly with our Village Made Bulk Desk:
                </p>
                
                <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                  <a
                    href="tel:+919876543210"
                    className="w-full sm:w-auto px-4 py-3 bg-white border-2 border-[#eeddb9] rounded-2xl text-xs font-black text-[#384401] flex items-center justify-center gap-2 hover:bg-stone-50 transition-colors shadow-2xs"
                  >
                    <Phone className="w-4 h-4 text-[#C56C4F]" />
                    <span>+91 98765 43210</span>
                  </a>

                  <a
                    href="mailto:bulk@villagemade.in"
                    className="w-full sm:w-auto px-4 py-3 bg-white border-2 border-[#eeddb9] rounded-2xl text-xs font-black text-[#384401] flex items-center justify-center gap-2 hover:bg-stone-50 transition-colors shadow-2xs"
                  >
                    <Mail className="w-4 h-4 text-[#C56C4F]" />
                    <span>bulk@villagemade.in</span>
                  </a>
                </div>
              </div>

            </div>
          </div>
        )}
      </section>

      {/* SAMPLE REQUEST MODAL */}
      {showSampleModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-[#fdfaf3] border-2 border-[#eeddb9] rounded-[32px] max-w-md w-full p-6 sm:p-8 space-y-5 relative shadow-2xl animate-scale-up">
            <button
              onClick={() => {
                setShowSampleModal(false);
                setSampleSuccess(false);
              }}
              className="absolute top-5 right-5 text-stone-400 hover:text-stone-700 p-1.5 rounded-full hover:bg-stone-200/50 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {sampleSuccess ? (
              <div className="text-center py-6 space-y-4">
                <div className="w-16 h-16 rounded-full bg-[#384401]/10 text-[#384401] flex items-center justify-center mx-auto border border-[#384401]/20">
                  <Check className="w-8 h-8" />
                </div>
                <h3 
                  className="text-xl font-bold text-[#384401] uppercase tracking-wider"
                  style={{ fontFamily: "'Poetsen One', sans-serif" }}
                >
                  Sample Request Sent!
                </h3>
                <p className="text-xs text-stone-600 font-medium">
                  Our team will contact you to dispatch your sample box.
                </p>
                <button
                  onClick={() => {
                    setShowSampleModal(false);
                    setSampleSuccess(false);
                  }}
                  className="px-6 py-3 bg-[#384401] text-white rounded-2xl text-xs font-black uppercase tracking-widest cursor-pointer hover:bg-[#252d00]"
                >
                  Done
                </button>
              </div>
            ) : (
              <>
                <div className="space-y-1">
                  <span 
                    className="text-[#C56C4F] block text-xl"
                    style={{ fontFamily: "'Splash', cursive" }}
                  >
                    Tasting Sample
                  </span>
                  <h3 
                    className="text-xl font-bold text-[#384401] uppercase tracking-wider"
                    style={{ fontFamily: "'Poetsen One', sans-serif" }}
                  >
                    Request Sample Box
                  </h3>
                  <p className="text-xs text-stone-500 font-medium">
                    Provide your details to receive sample jars before placing your bulk order.
                  </p>
                </div>

                <form onSubmit={handleSampleSubmit} className="space-y-3.5">
                  <div>
                    <label className="block text-[10px] font-black uppercase text-stone-650 tracking-wider mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={sampleFormData.name}
                      onChange={e => setSampleFormData({ ...sampleFormData, name: e.target.value })}
                      placeholder="Your Name"
                      className="w-full px-3.5 py-2.5 bg-[#FAF4E6]/50 border-2 border-[#eeddb9]/80 rounded-2xl text-xs font-bold focus:bg-white focus:outline-none focus:border-[#384401]"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase text-stone-650 tracking-wider mb-1">Phone Number *</label>
                    <input
                      type="tel"
                      required
                      value={sampleFormData.phone}
                      onChange={e => setSampleFormData({ ...sampleFormData, phone: e.target.value })}
                      placeholder="+91 98765 43210"
                      className="w-full px-3.5 py-2.5 bg-[#FAF4E6]/50 border-2 border-[#eeddb9]/80 rounded-2xl text-xs font-bold focus:bg-white focus:outline-none focus:border-[#384401]"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase text-stone-650 tracking-wider mb-1">Product Sample Requested</label>
                    <select
                      value={sampleFormData.selectedProduct}
                      onChange={e => setSampleFormData({ ...sampleFormData, selectedProduct: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-[#FAF4E6]/50 border-2 border-[#eeddb9]/80 rounded-2xl text-xs font-black text-[#384401] focus:bg-white focus:outline-none focus:border-[#384401]"
                    >
                      {PRODUCTS.map(p => (
                        <option key={p.id} value={p.name}>{p.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase text-stone-650 tracking-wider mb-1">Delivery Address & City</label>
                    <input
                      type="text"
                      required
                      value={sampleFormData.address}
                      onChange={e => setSampleFormData({ ...sampleFormData, address: e.target.value })}
                      placeholder="Full Address & Pincode"
                      className="w-full px-3.5 py-2.5 bg-[#FAF4E6]/50 border-2 border-[#eeddb9]/80 rounded-2xl text-xs font-bold focus:bg-white focus:outline-none focus:border-[#384401]"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={sampleSubmitting}
                    className="w-full py-3.5 bg-[#384401] hover:bg-[#252d00] text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all cursor-pointer disabled:opacity-50 mt-2 shadow-md"
                  >
                    {sampleSubmitting ? 'Sending Request...' : 'Send Sample Request'}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}

      {/* Bottom Village Landscape Illustration */}
      <div className="w-full pointer-events-none opacity-40">
        <img
          src="/images/footer-bottom-image.webp"
          alt="Village landscape"
          className="w-full h-auto max-h-[160px] object-cover object-bottom"
        />
      </div>

      <Footer />
    </div>
  );
}
