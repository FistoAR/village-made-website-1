'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { 
  Gift, 
  Truck, 
  Sparkles, 
  CheckCircle2, 
  Building2, 
  Phone, 
  Mail, 
  User, 
  Send,
  Boxes,
  X,
  Check,
  Plus,
  Trash2,
  Award,
  HeartHandshake
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

    if (!formData.name || !formData.phone) {
      setErrorMessage('Please enter your name and phone number.');
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
        window.scrollTo({ top: 250, behavior: 'smooth' });
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

      {/* Hero Header */}
      <section className="relative pt-32 pb-10 md:pt-40 md:pb-14 px-4 text-center overflow-hidden">
        <div className="max-w-3xl mx-auto space-y-4 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#384401]/10 border border-[#384401]/20 text-[#384401] text-xs font-bold uppercase tracking-wider">
            <Award className="w-4 h-4 text-[#C56C4F]" />
            <span>Village Made Bulk Orders</span>
          </div>

          <h1 
            className="text-3xl sm:text-4xl md:text-5xl text-[#384401] tracking-wide font-bold uppercase leading-tight"
            style={{ fontFamily: "'Poetsen One', sans-serif" }}
          >
            Bulk & Corporate Orders
          </h1>

          <p className="max-w-xl mx-auto text-sm sm:text-base text-stone-600 font-medium leading-relaxed">
            Handcrafted organic health mixes, traditional millets, and pure village produce for wedding return gifts, corporate hampers, and wholesale supply.
          </p>

          {/* Clean 3-Item Highlight Badges */}
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 pt-4">
            <div className="flex items-center gap-2 text-xs font-bold text-[#384401] bg-white px-3.5 py-2 rounded-xl border border-[#eeddb9] shadow-xs">
              <Boxes className="w-4 h-4 text-[#C56C4F]" />
              <span>Small Batch Freshness</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-[#384401] bg-white px-3.5 py-2 rounded-xl border border-[#eeddb9] shadow-xs">
              <HeartHandshake className="w-4 h-4 text-[#C56C4F]" />
              <span>Custom Gift Packaging</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-[#384401] bg-white px-3.5 py-2 rounded-xl border border-[#eeddb9] shadow-xs">
              <Truck className="w-4 h-4 text-[#C56C4F]" />
              <span>Pan-India Delivery</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Section */}
      <section className="pb-20 md:pb-28 px-4 max-w-6xl mx-auto relative z-10">
        {successInquiryId ? (
          /* Submission Success State */
          <div className="bg-white rounded-3xl p-8 sm:p-12 border-2 border-[#eeddb9] shadow-xl text-center space-y-5 max-w-xl mx-auto">
            <div className="w-16 h-16 rounded-full bg-[#384401]/10 text-[#384401] flex items-center justify-center mx-auto border border-[#384401]/20">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div className="space-y-2">
              <h2 
                className="text-2xl text-[#384401] uppercase tracking-wider font-bold"
                style={{ fontFamily: "'Poetsen One', sans-serif" }}
              >
                Inquiry Received
              </h2>
              <p className="text-xs text-stone-600 font-medium">
                Your bulk inquiry reference code:
              </p>
              <div className="inline-block px-4 py-2 bg-[#FAF4E6] rounded-xl border border-[#eeddb9] font-mono font-bold text-[#C56C4F] text-lg">
                {successInquiryId}
              </div>
            </div>
            <p className="text-xs text-stone-600 max-w-md mx-auto leading-relaxed font-medium">
              Our Bulk Desk will review your requirements and reach out via Phone/WhatsApp within 24 hours with a custom quotation.
            </p>
            <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-3">
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
                className="px-5 py-3 bg-[#384401] hover:bg-[#252d00] text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer w-full sm:w-auto"
              >
                Submit Another Request
              </button>
              <Link
                href="/products"
                className="px-5 py-3 bg-[#FAF4E6] border border-[#eeddb9] text-[#3d2b1f] rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-[#eeddb9]/50 transition-all cursor-pointer w-full sm:w-auto text-center"
              >
                View Catalog
              </Link>
            </div>
          </div>
        ) : (
          /* Main Layout: Form (Left 7 cols) & Info Sidebar (Right 5 cols) */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* LEFT COLUMN: Request Form Card */}
            <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-9 border-2 border-[#eeddb9] shadow-lg space-y-6">
              
              {/* Header Title */}
              <div className="flex items-center justify-between border-b border-[#eeddb9]/60 pb-4">
                <div>
                  <h2 
                    className="text-xl sm:text-2xl text-[#384401] uppercase tracking-wide font-bold"
                    style={{ fontFamily: "'Poetsen One', sans-serif" }}
                  >
                    Request Bulk Quote
                  </h2>
                  <p className="text-xs text-stone-500 font-medium">Fill in your details below for custom pricing.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowSampleModal(true)}
                  className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 bg-[#FAF4E6] border border-[#eeddb9] text-[#C56C4F] rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-[#eeddb9]/50 transition-all cursor-pointer shadow-2xs"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Request Sample</span>
                </button>
              </div>

              {errorMessage && (
                <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold">
                  {errorMessage}
                </div>
              )}

              <form onSubmit={handleSubmitInquiry} className="space-y-5">
                
                {/* SECTION 1: Contact Details */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#C56C4F] flex items-center gap-2 border-b border-[#eeddb9]/40 pb-1.5">
                    <User className="w-4 h-4 text-[#384401]" />
                    <span>1. Contact Details</span>
                  </h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-[11px] font-bold text-stone-700 uppercase tracking-wider mb-1">Your Name *</label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g. Ramesh Kumar"
                        className="w-full px-3.5 py-2.5 bg-[#FAF4E6]/40 border border-[#eeddb9] rounded-xl text-xs font-bold text-[#3d2b1f] focus:bg-white focus:outline-none focus:border-[#384401] transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-stone-700 uppercase tracking-wider mb-1">Phone / WhatsApp *</label>
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+91 98765 43210"
                        className="w-full px-3.5 py-2.5 bg-[#FAF4E6]/40 border border-[#eeddb9] rounded-xl text-xs font-bold text-[#3d2b1f] focus:bg-white focus:outline-none focus:border-[#384401] transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-[11px] font-bold text-stone-700 uppercase tracking-wider mb-1">Email Address</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                        placeholder="name@domain.com"
                        className="w-full px-3.5 py-2.5 bg-[#FAF4E6]/40 border border-[#eeddb9] rounded-xl text-xs font-bold text-[#3d2b1f] focus:bg-white focus:outline-none focus:border-[#384401] transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-stone-700 uppercase tracking-wider mb-1">Company / Event Name</label>
                      <input
                        type="text"
                        value={formData.companyName}
                        onChange={e => setFormData({ ...formData, companyName: e.target.value })}
                        placeholder="e.g. Wedding Event / Corporate"
                        className="w-full px-3.5 py-2.5 bg-[#FAF4E6]/40 border border-[#eeddb9] rounded-xl text-xs font-bold text-[#3d2b1f] focus:bg-white focus:outline-none focus:border-[#384401] transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* SECTION 2: Purpose & Occasion */}
                <div className="space-y-3 pt-1">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#C56C4F] flex items-center gap-2 border-b border-[#eeddb9]/40 pb-1.5">
                    <Building2 className="w-4 h-4 text-[#384401]" />
                    <span>2. Event & Requirement</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-[11px] font-bold text-stone-700 uppercase tracking-wider mb-1">Occasion / Purpose</label>
                      <select
                        value={formData.purpose}
                        onChange={e => setFormData({ ...formData, purpose: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-[#FAF4E6]/40 border border-[#eeddb9] rounded-xl text-xs font-bold text-[#384401] focus:bg-white focus:outline-none focus:border-[#384401] transition-all cursor-pointer"
                      >
                        <option value="Wedding & Event Return Gifts">Wedding & Event Return Gifts</option>
                        <option value="Corporate Festive Gifting">Corporate Festive Gifting</option>
                        <option value="Retail Wholesale / Organic Store">Retail Wholesale / Organic Store</option>
                        <option value="Personal Family Bulk Purchase">Personal Family Bulk Purchase</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-stone-700 uppercase tracking-wider mb-1">Needed By Date</label>
                      <input
                        type="date"
                        value={formData.neededByDate}
                        onChange={e => setFormData({ ...formData, neededByDate: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-[#FAF4E6]/40 border border-[#eeddb9] rounded-xl text-xs font-bold text-[#3d2b1f] focus:bg-white focus:outline-none focus:border-[#384401] transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-[11px] font-bold text-stone-700 uppercase tracking-wider mb-1">Delivery City</label>
                      <input
                        type="text"
                        value={formData.city}
                        onChange={e => setFormData({ ...formData, city: e.target.value })}
                        placeholder="e.g. Bengaluru / Mysuru"
                        className="w-full px-3.5 py-2.5 bg-[#FAF4E6]/40 border border-[#eeddb9] rounded-xl text-xs font-bold text-[#3d2b1f] focus:bg-white focus:outline-none focus:border-[#384401] transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-stone-700 uppercase tracking-wider mb-1">Pincode</label>
                      <input
                        type="text"
                        value={formData.pincode}
                        onChange={e => setFormData({ ...formData, pincode: e.target.value })}
                        placeholder="560001"
                        className="w-full px-3.5 py-2.5 bg-[#FAF4E6]/40 border border-[#eeddb9] rounded-xl text-xs font-bold text-[#3d2b1f] focus:bg-white focus:outline-none focus:border-[#384401] transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* SECTION 3: Itemized Product Selection */}
                <div className="space-y-3 pt-1">
                  <div className="flex items-center justify-between border-b border-[#eeddb9]/40 pb-1.5">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#C56C4F] flex items-center gap-2">
                      <Boxes className="w-4 h-4 text-[#384401]" />
                      <span>3. Selected Products</span>
                    </h3>
                    <button
                      type="button"
                      onClick={handleAddProduct}
                      className="text-xs font-bold text-[#384401] hover:text-[#C56C4F] cursor-pointer flex items-center gap-1 transition-colors uppercase tracking-wider"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Item</span>
                    </button>
                  </div>

                  <div className="space-y-2.5">
                    {selectedProducts.map((item, idx) => (
                      <div 
                        key={idx} 
                        className="p-3 bg-[#FAF4E6]/50 rounded-xl border border-[#eeddb9] grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center"
                      >
                        <div className="sm:col-span-6">
                          <label className="block text-[10px] font-bold uppercase text-stone-500 mb-1">Organic Product</label>
                          <select
                            value={item.id}
                            onChange={e => handleProductChange(idx, e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-[#eeddb9] rounded-lg text-xs font-bold text-[#384401] focus:outline-none"
                          >
                            {PRODUCTS.map(prod => (
                              <option key={prod.id} value={prod.id}>
                                {prod.name} (₹{prod.price})
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="sm:col-span-3">
                          <label className="block text-[10px] font-bold uppercase text-stone-500 mb-1">Pack Weight</label>
                          <select
                            value={item.weight}
                            onChange={e => handleWeightChange(idx, e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-[#eeddb9] rounded-lg text-xs font-bold text-stone-800 focus:outline-none"
                          >
                            <option value="250g">250g</option>
                            <option value="500g">500g</option>
                            <option value="1kg">1kg</option>
                            <option value="5kg Bulk Pack">5kg Bulk Pack</option>
                          </select>
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block text-[10px] font-bold uppercase text-stone-500 mb-1">Quantity</label>
                          <input
                            type="number"
                            min="1"
                            value={item.qty}
                            onChange={e => handleQtyChange(idx, parseInt(e.target.value) || 1)}
                            className="w-full px-3 py-2 bg-white border border-[#eeddb9] rounded-lg text-xs font-bold text-[#384401] text-center focus:outline-none"
                          />
                        </div>

                        <div className="sm:col-span-1 text-right sm:text-center pt-1 sm:pt-4">
                          {selectedProducts.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveProduct(idx)}
                              className="p-1 text-stone-400 hover:text-red-600 rounded transition-colors cursor-pointer"
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

                {/* SECTION 4: Customization Options & Notes */}
                <div className="space-y-3 pt-1">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#C56C4F] flex items-center gap-2 border-b border-[#eeddb9]/40 pb-1.5">
                    <Sparkles className="w-4 h-4 text-[#384401]" />
                    <span>4. Packaging & Special Requests</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <label className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center gap-2.5 ${
                      formData.customPackaging 
                        ? 'bg-[#384401]/10 border-[#384401] text-[#384401]' 
                        : 'bg-[#FAF4E6]/30 border-[#eeddb9] text-stone-700 hover:bg-[#FAF4E6]'
                    }`}>
                      <input
                        type="checkbox"
                        checked={formData.customPackaging}
                        onChange={e => setFormData({ ...formData, customPackaging: e.target.checked })}
                        className="accent-[#384401] w-4 h-4 rounded cursor-pointer"
                      />
                      <span className="text-xs font-bold">Jute / Rigid Box</span>
                    </label>

                    <label className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center gap-2.5 ${
                      formData.customCard 
                        ? 'bg-[#384401]/10 border-[#384401] text-[#384401]' 
                        : 'bg-[#FAF4E6]/30 border-[#eeddb9] text-stone-700 hover:bg-[#FAF4E6]'
                    }`}>
                      <input
                        type="checkbox"
                        checked={formData.customCard}
                        onChange={e => setFormData({ ...formData, customCard: e.target.checked })}
                        className="accent-[#384401] w-4 h-4 rounded cursor-pointer"
                      />
                      <span className="text-xs font-bold">Greeting Note Card</span>
                    </label>

                    <label className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center gap-2.5 ${
                      formData.logoPrinting 
                        ? 'bg-[#384401]/10 border-[#384401] text-[#384401]' 
                        : 'bg-[#FAF4E6]/30 border-[#eeddb9] text-stone-700 hover:bg-[#FAF4E6]'
                    }`}>
                      <input
                        type="checkbox"
                        checked={formData.logoPrinting}
                        onChange={e => setFormData({ ...formData, logoPrinting: e.target.checked })}
                        className="accent-[#384401] w-4 h-4 rounded cursor-pointer"
                      />
                      <span className="text-xs font-bold">Custom Logo Tag</span>
                    </label>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase text-stone-600 tracking-wider mb-1">
                      Notes / Customization Details
                    </label>
                    <textarea
                      rows={2}
                      value={formData.notes}
                      onChange={e => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="Mention event dates, custom packaging themes, or special instructions..."
                      className="w-full px-3.5 py-2.5 bg-[#FAF4E6]/40 border border-[#eeddb9] rounded-xl text-xs font-medium text-[#3d2b1f] focus:bg-white focus:outline-none focus:border-[#384401] transition-all"
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3.5 bg-[#384401] hover:bg-[#283200] text-white rounded-xl text-xs font-bold uppercase tracking-widest transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>{submitting ? 'Submitting Request...' : 'Send Bulk Inquiry'}</span>
                </button>
              </form>
            </div>

            {/* RIGHT COLUMN: Info & Direct Contact */}
            <div className="lg:col-span-5 space-y-5">
              
              {/* Card 1: Simple 3-Step Process */}
              <div className="bg-white rounded-3xl p-6 border-2 border-[#eeddb9] shadow-md space-y-4">
                <h3 
                  className="text-lg text-[#384401] uppercase tracking-wide font-bold"
                  style={{ fontFamily: "'Poetsen One', sans-serif" }}
                >
                  How Bulk Ordering Works
                </h3>

                <div className="space-y-4 relative before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#eeddb9]">
                  <div className="flex gap-3.5 relative">
                    <div className="w-7 h-7 rounded-full bg-[#384401] text-white font-bold text-xs flex items-center justify-center shrink-0 font-mono">
                      1
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[#384401] uppercase tracking-wider">Submit Request</h4>
                      <p className="text-[11px] text-stone-600 leading-relaxed font-medium">
                        Select items and share your required quantities & delivery date.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3.5 relative">
                    <div className="w-7 h-7 rounded-full bg-[#384401] text-white font-bold text-xs flex items-center justify-center shrink-0 font-mono">
                      2
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[#384401] uppercase tracking-wider">Receive Price Quotation</h4>
                      <p className="text-[11px] text-stone-600 leading-relaxed font-medium">
                        Our team shares custom volume pricing and packaging mock-ups via WhatsApp.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3.5 relative">
                    <div className="w-7 h-7 rounded-full bg-[#C56C4F] text-white font-bold text-xs flex items-center justify-center shrink-0 font-mono">
                      3
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[#384401] uppercase tracking-wider">Fresh Batch Dispatch</h4>
                      <p className="text-[11px] text-stone-600 leading-relaxed font-medium">
                        Fresh organic products prepared on demand and delivered safely to your location.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 2: Sample Tasting Kit Box */}
              <div className="bg-[#384401] rounded-3xl p-6 text-white space-y-3 shadow-md relative overflow-hidden">
                <div className="absolute -right-4 -bottom-4 opacity-10 pointer-events-none">
                  <Gift className="w-40 h-40" />
                </div>

                <h4 
                  className="text-lg font-bold uppercase tracking-wide"
                  style={{ fontFamily: "'Poetsen One', sans-serif" }}
                >
                  Test Quality First
                </h4>

                <p className="text-xs text-stone-200 leading-relaxed font-medium">
                  Want to verify taste & quality before ordering? Request a sample box to test our organic produce.
                </p>

                <button
                  onClick={() => setShowSampleModal(true)}
                  className="px-4 py-2.5 bg-white text-[#384401] rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-[#FAF4E6] transition-all cursor-pointer"
                >
                  Request Sample Box
                </button>
              </div>

              {/* Card 3: Direct Assistance */}
              <div className="bg-[#FAF4E6] rounded-3xl p-6 border-2 border-[#eeddb9] space-y-3">
                <h4 
                  className="text-base font-bold text-[#384401] uppercase tracking-wide"
                  style={{ fontFamily: "'Poetsen One', sans-serif" }}
                >
                  Direct Bulk Assistance
                </h4>
                <p className="text-xs text-stone-600 leading-relaxed font-medium">
                  Need an urgent quotation or custom hamper design? Call or WhatsApp our desk directly:
                </p>
                
                <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-1">
                  <a
                    href="tel:+919876543210"
                    className="w-full sm:w-auto px-4 py-2.5 bg-white border border-[#eeddb9] rounded-xl text-xs font-bold text-[#384401] flex items-center justify-center gap-2 hover:bg-stone-50 transition-colors"
                  >
                    <Phone className="w-4 h-4 text-[#C56C4F]" />
                    <span>+91 98765 43210</span>
                  </a>

                  <a
                    href="mailto:bulk@villagemade.in"
                    className="w-full sm:w-auto px-4 py-2.5 bg-white border border-[#eeddb9] rounded-xl text-xs font-bold text-[#384401] flex items-center justify-center gap-2 hover:bg-stone-50 transition-colors"
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
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-[#fdfaf3] border-2 border-[#eeddb9] rounded-3xl max-w-md w-full p-6 space-y-4 relative shadow-2xl">
            <button
              onClick={() => {
                setShowSampleModal(false);
                setSampleSuccess(false);
              }}
              className="absolute top-4 right-4 text-stone-400 hover:text-stone-700 p-1.5 rounded-full hover:bg-stone-200/50 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {sampleSuccess ? (
              <div className="text-center py-5 space-y-3">
                <div className="w-14 h-14 rounded-full bg-[#384401]/10 text-[#384401] flex items-center justify-center mx-auto border border-[#384401]/20">
                  <Check className="w-7 h-7" />
                </div>
                <h3 
                  className="text-lg font-bold text-[#384401] uppercase tracking-wide"
                  style={{ fontFamily: "'Poetsen One', sans-serif" }}
                >
                  Sample Request Sent
                </h3>
                <p className="text-xs text-stone-600 font-medium">
                  Our team will contact you to dispatch your sample box.
                </p>
                <button
                  onClick={() => {
                    setShowSampleModal(false);
                    setSampleSuccess(false);
                  }}
                  className="px-5 py-2.5 bg-[#384401] text-white rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer hover:bg-[#252d00]"
                >
                  Close
                </button>
              </div>
            ) : (
              <>
                <div className="space-y-1">
                  <h3 
                    className="text-lg font-bold text-[#384401] uppercase tracking-wide"
                    style={{ fontFamily: "'Poetsen One', sans-serif" }}
                  >
                    Request Sample Box
                  </h3>
                  <p className="text-xs text-stone-500 font-medium">
                    Provide your details to receive sample jars before placing your bulk order.
                  </p>
                </div>

                <form onSubmit={handleSampleSubmit} className="space-y-3">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-stone-600 tracking-wider mb-1">Your Name *</label>
                    <input
                      type="text"
                      required
                      value={sampleFormData.name}
                      onChange={e => setSampleFormData({ ...sampleFormData, name: e.target.value })}
                      placeholder="Your Name"
                      className="w-full px-3 py-2 bg-white border border-[#eeddb9] rounded-xl text-xs font-bold focus:outline-none focus:border-[#384401]"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-stone-600 tracking-wider mb-1">Phone Number *</label>
                    <input
                      type="tel"
                      required
                      value={sampleFormData.phone}
                      onChange={e => setSampleFormData({ ...sampleFormData, phone: e.target.value })}
                      placeholder="+91 98765 43210"
                      className="w-full px-3 py-2 bg-white border border-[#eeddb9] rounded-xl text-xs font-bold focus:outline-none focus:border-[#384401]"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-stone-600 tracking-wider mb-1">Product Sample</label>
                    <select
                      value={sampleFormData.selectedProduct}
                      onChange={e => setSampleFormData({ ...sampleFormData, selectedProduct: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-[#eeddb9] rounded-xl text-xs font-bold text-[#384401] focus:outline-none focus:border-[#384401]"
                    >
                      {PRODUCTS.map(p => (
                        <option key={p.id} value={p.name}>{p.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-stone-600 tracking-wider mb-1">Delivery Address & City</label>
                    <input
                      type="text"
                      required
                      value={sampleFormData.address}
                      onChange={e => setSampleFormData({ ...sampleFormData, address: e.target.value })}
                      placeholder="Full Address & Pincode"
                      className="w-full px-3 py-2 bg-white border border-[#eeddb9] rounded-xl text-xs font-bold focus:outline-none focus:border-[#384401]"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={sampleSubmitting}
                    className="w-full py-3 bg-[#384401] hover:bg-[#252d00] text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer disabled:opacity-50 mt-1 shadow-xs"
                  >
                    {sampleSubmitting ? 'Sending Request...' : 'Send Sample Request'}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
