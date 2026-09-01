'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { 
  CheckCircle2, 
  Phone, 
  Mail, 
  Send, 
  X, 
  Check, 
  MessageSquare, 
  Package 
} from 'lucide-react';
import { PRODUCTS } from '@/data/products-list';

export default function BulkOrdersPage() {
  const categories = useMemo(() => {
    return ['All Categories', ...Array.from(new Set(PRODUCTS.map(p => p.category)))];
  }, []);

  const [selectedCategory, setSelectedCategory] = useState<string>('All Categories');

  const filteredProducts = useMemo(() => {
    if (selectedCategory === 'All Categories') return PRODUCTS;
    return PRODUCTS.filter(p => p.category === selectedCategory);
  }, [selectedCategory]);

  const [selectedOccasionType, setSelectedOccasionType] = useState<string>('Wedding Return Gifts');
  const [customOccasionText, setCustomOccasionText] = useState<string>('');

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    purpose: 'Wedding Return Gifts',
    selectedProduct: PRODUCTS[0]?.name || 'BANANA BABY MALT',
    packWeight: PRODUCTS[0]?.weights?.[0] || '500g',
    quantity: 50,
    neededByDate: '',
    notes: ''
  });

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
    address: '',
    selectedProduct: PRODUCTS[0]?.name || 'BANANA BABY MALT'
  });

  const handleOccasionSelect = (val: string) => {
    setSelectedOccasionType(val);
    if (val !== 'Other') {
      setCustomOccasionText('');
      setFormData(prev => ({ ...prev, purpose: val }));
    } else {
      setFormData(prev => ({
        ...prev,
        purpose: customOccasionText.trim() ? `Other: ${customOccasionText.trim()}` : 'Other'
      }));
    }
  };

  const handleCustomOccasionChange = (text: string) => {
    setCustomOccasionText(text);
    setFormData(prev => ({
      ...prev,
      purpose: text.trim() ? `Other: ${text.trim()}` : 'Other'
    }));
  };

  const handleCategoryChange = (catName: string) => {
    setSelectedCategory(catName);
    const validProds = catName === 'All Categories' ? PRODUCTS : PRODUCTS.filter(p => p.category === catName);
    if (validProds.length > 0) {
      const firstProd = validProds[0];
      setFormData(prev => ({
        ...prev,
        selectedProduct: firstProd.name,
        packWeight: firstProd.weights?.[0] || '500g'
      }));
    }
  };

  const handleSubmitInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!formData.name || !formData.phone) {
      setErrorMessage('Please enter your name and phone number.');
      return;
    }

    if (selectedOccasionType === 'Other' && !customOccasionText.trim()) {
      setErrorMessage('Please specify your custom occasion.');
      return;
    }

    setSubmitting(true);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
      const payload = {
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        purpose: formData.purpose,
        neededByDate: formData.neededByDate,
        estimatedQty: formData.quantity,
        notes: `Product: ${formData.selectedProduct} (${formData.packWeight}) - Qty: ${formData.quantity}. ${formData.notes}`,
        selectedProducts: [
          {
            id: PRODUCTS.find(p => p.name === formData.selectedProduct)?.id || 'm-1',
            name: formData.selectedProduct,
            weight: formData.packWeight,
            qty: Number(formData.quantity) || 50
          }
        ],
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
        window.scrollTo({ top: 200, behavior: 'smooth' });
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
    <div className="min-h-screen bg-[#F5EFE6] text-[#3d2b1f] font-jakarta selection:bg-[#384401] selection:text-white relative">
      <Navbar />

      {/* Hero Header */}
      <section className="pt-20 pb-6 md:pt-25 md:pb-8 px-4 text-center">
        <div className="max-w-4xl mx-auto space-y-2.5">
          <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#C56C4F]">
            Village Made Organics
          </span>

          <h1 
            className="text-3xl sm:text-4xl md:text-5xl text-[#384401] font-bold tracking-tight uppercase leading-tight"
            style={{ fontFamily: "'Poetsen One', sans-serif" }}
          >
            Bulk & Corporate Orders
          </h1>

          <p className="text-sm sm:text-base text-[#5c4636] font-normal leading-relaxed max-w-xl mx-auto">
            Custom organic gift hampers and bulk orders handcrafted for weddings, corporate events, and celebrations.
          </p>
        </div>
      </section>

      {/* Main Container */}
      <section className="pb-12 md:pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto mb-6 md:mb-8">
        {successInquiryId ? (
          /* Submission Success State */
          <div className="bg-white rounded-3xl p-8 sm:p-14 border border-[#D9CBBA] shadow-xl text-center space-y-6 max-w-xl mx-auto">
            <div className="w-16 h-16 rounded-full bg-[#384401]/10 text-[#384401] flex items-center justify-center mx-auto border border-[#384401]/20">
              <CheckCircle2 className="w-9 h-9 text-[#384401]" />
            </div>
            <div className="space-y-2">
              <h2 
                className="text-2xl text-[#384401] uppercase tracking-wide font-bold"
                style={{ fontFamily: "'Poetsen One', sans-serif" }}
              >
                Inquiry Received!
              </h2>
              <p className="text-xs sm:text-sm text-[#5c4636] font-medium">
                Reference Code: <span className="font-mono font-bold text-[#C56C4F]">{successInquiryId}</span>
              </p>
            </div>
            <p className="text-xs sm:text-sm text-[#5c4636] leading-relaxed font-normal">
              Thank you! Our Bulk Desk will contact you on WhatsApp/Phone shortly with a custom quotation.
            </p>
            <div className="pt-2 flex items-center justify-center gap-4">
              <button
                onClick={() => {
                  setSuccessInquiryId(null);
                  setSelectedOccasionType('Wedding Return Gifts');
                  setCustomOccasionText('');
                  setFormData({
                    name: '',
                    phone: '',
                    email: '',
                    purpose: 'Wedding Return Gifts',
                    selectedProduct: PRODUCTS[0]?.name || 'BANANA BABY MALT',
                    packWeight: PRODUCTS[0]?.weights?.[0] || '500g',
                    quantity: 50,
                    neededByDate: '',
                    notes: ''
                  });
                }}
                className="px-6 py-3 bg-[#384401] hover:bg-[#252d00] text-white rounded-2xl text-xs sm:text-sm font-bold uppercase tracking-wider transition-all cursor-pointer shadow-sm"
              >
                New Inquiry
              </button>
              <Link
                href="/products"
                className="px-6 py-3 bg-[#FAF4E6] border border-[#eeddb9] text-[#3d2b1f] rounded-2xl text-xs sm:text-sm font-bold uppercase tracking-wider hover:bg-[#eeddb9]/50 transition-all cursor-pointer"
              >
                Browse Catalog
              </Link>
            </div>
          </div>
        ) : (
          /* High-Contrast Full Width Executive Card */
          <div className="bg-white rounded-3xl border border-[#D9CBBA] shadow-xl shadow-[#384401]/8 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
            
            {/* LEFT: Clean Essential Form (7 Cols) */}
            <div className="lg:col-span-7 p-6 sm:p-9 md:p-10 space-y-6">
              <div>
                <h2 
                  className="text-2xl sm:text-3xl text-[#384401] uppercase tracking-wide font-bold mb-1"
                  style={{ fontFamily: "'Poetsen One', sans-serif" }}
                >
                  Request a Bulk Quote
                </h2>
                <p className="text-xs sm:text-sm text-[#5c4636] font-normal">Enter your details and product requirement below.</p>
              </div>

              {errorMessage && (
                <div className="p-4 rounded-2xl bg-[#C56C4F]/10 border border-[#C56C4F]/30 text-[#C56C4F] text-xs sm:text-sm font-bold">
                  {errorMessage}
                </div>
              )}

              <form onSubmit={handleSubmitInquiry} className="space-y-5">
                {/* 1. Name & Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-[#3d2b1f] mb-1.5">Your Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Ramesh Kumar"
                      className="w-full px-4 py-3 bg-[#FAF6F0] border border-[#D9CBBA] rounded-2xl text-xs sm:text-sm font-medium text-[#3d2b1f] focus:bg-white focus:outline-none focus:border-[#384401] transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-[#3d2b1f] mb-1.5">Phone / WhatsApp *</label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={e => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+91 98765 43210"
                      className="w-full px-4 py-3 bg-[#FAF6F0] border border-[#D9CBBA] rounded-2xl text-xs sm:text-sm font-medium text-[#3d2b1f] focus:bg-white focus:outline-none focus:border-[#384401] transition-all"
                    />
                  </div>
                </div>

                {/* 2. Occasion & Needed Date */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-[#3d2b1f] mb-1.5">Occasion / Purpose</label>
                    <select
                      value={selectedOccasionType}
                      onChange={e => handleOccasionSelect(e.target.value)}
                      className="w-full px-4 py-3 bg-[#FAF6F0] border border-[#D9CBBA] rounded-2xl text-xs sm:text-sm font-medium text-[#384401] focus:bg-white focus:outline-none focus:border-[#384401] transition-all cursor-pointer"
                    >
                      <option value="Wedding Return Gifts">Wedding Return Gifts</option>
                      <option value="Corporate Festive Gifting">Corporate Festive Gifting</option>
                      <option value="Retail Wholesale / Organic Store">Retail Wholesale / Organic Store</option>
                      <option value="Personal Family Bulk Purchase">Personal Family Bulk Purchase</option>
                      <option value="Other">Other (Specify below)</option>
                    </select>

                    {selectedOccasionType === 'Other' && (
                      <div className="mt-2.5 animate-fade-in">
                        <label className="block text-[11px] sm:text-xs font-medium text-[#C56C4F] mb-1">Specify Custom Occasion *</label>
                        <input
                          type="text"
                          required
                          value={customOccasionText}
                          onChange={e => handleCustomOccasionChange(e.target.value)}
                          placeholder="e.g. Temple Festival, Alumni Reunion, Housewarming"
                          className="w-full px-4 py-2.5 bg-white border border-[#C56C4F]/50 rounded-xl text-xs sm:text-sm font-medium text-[#3d2b1f] focus:outline-none focus:border-[#C56C4F] transition-all"
                        />
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-[#3d2b1f] mb-1.5">Needed By Date</label>
                    <input
                      type="date"
                      value={formData.neededByDate}
                      onChange={e => setFormData({ ...formData, neededByDate: e.target.value })}
                      className="w-full px-4 py-3 bg-[#FAF6F0] border border-[#D9CBBA] rounded-2xl text-xs sm:text-sm font-medium text-[#3d2b1f] focus:bg-white focus:outline-none focus:border-[#384401] transition-all"
                    />
                  </div>
                </div>

                {/* 3. Category & Product Selection */}
                <div className="space-y-4 pt-1">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-[#3d2b1f] mb-1.5">Select Category</label>
                      <select
                        value={selectedCategory}
                        onChange={e => handleCategoryChange(e.target.value)}
                        className="w-full px-4 py-3 bg-[#FAF6F0] border border-[#D9CBBA] rounded-2xl text-xs sm:text-sm font-medium text-[#384401] focus:bg-white focus:outline-none focus:border-[#384401] transition-all cursor-pointer"
                      >
                        {categories.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-[#3d2b1f] mb-1.5">Select Product</label>
                      <select
                        value={formData.selectedProduct}
                        onChange={e => {
                          const prodName = e.target.value;
                          const prod = PRODUCTS.find(p => p.name === prodName);
                          setFormData({
                            ...formData,
                            selectedProduct: prodName,
                            packWeight: prod?.weights?.[0] || '500g'
                          });
                        }}
                        className="w-full px-4 py-3 bg-[#FAF6F0] border border-[#D9CBBA] rounded-2xl text-xs sm:text-sm font-medium text-[#384401] focus:bg-white focus:outline-none focus:border-[#384401] transition-all cursor-pointer"
                      >
                        {filteredProducts.map(prod => (
                          <option key={prod.id} value={prod.name}>
                            {prod.name} (₹{prod.price})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-[#3d2b1f] mb-1.5">Estimated Quantity</label>
                    <input
                      type="number"
                      min="1"
                      value={formData.quantity}
                      onChange={e => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
                      className="w-full px-4 py-3 bg-[#FAF6F0] border border-[#D9CBBA] rounded-2xl text-xs sm:text-sm font-medium text-[#384401] text-center focus:bg-white focus:outline-none focus:border-[#384401]"
                    />
                  </div>
                </div>

                {/* 4. Special Notes */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-[#3d2b1f] mb-1.5">Custom Notes & Packaging Requirements</label>
                  <textarea
                    rows={3}
                    value={formData.notes}
                    onChange={e => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Mention custom box preferences, event dates, or specific requests..."
                    className="w-full px-4 py-3 bg-[#FAF6F0] border border-[#D9CBBA] rounded-2xl text-xs sm:text-sm font-medium text-[#3d2b1f] focus:bg-white focus:outline-none focus:border-[#384401] transition-all"
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-4 bg-[#384401] hover:bg-[#252d00] text-white rounded-2xl text-xs sm:text-sm font-bold uppercase tracking-widest transition-all shadow-md flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50 mt-2"
                >
                  <Send className="w-4.5 h-4.5" />
                  <span>{submitting ? 'Submitting Inquiry...' : 'Request Bulk Quote'}</span>
                </button>
              </form>
            </div>

            {/* RIGHT: Direct Contact & Assistance Panel (5 Cols) */}
            <div className="lg:col-span-5 bg-[#FAF6F0] border-t lg:border-t-0 lg:border-l border-[#D9CBBA] p-6 sm:p-9 md:p-10 flex flex-col justify-between space-y-6">
              
              <div className="space-y-5">
                <div>
                  <span className="text-xs font-bold uppercase tracking-widest text-[#C56C4F] block mb-1">
                    Fast Track Assistance
                  </span>
                  <h3 
                    className="text-xl sm:text-2xl text-[#384401] uppercase tracking-wide font-bold mb-1.5"
                    style={{ fontFamily: "'Poetsen One', sans-serif" }}
                  >
                    Direct Bulk Desk
                  </h3>
                  <p className="text-xs sm:text-sm text-[#5c4636] font-normal leading-relaxed">
                    Need an instant quote or custom gift box suggestion? Chat directly with our Bulk Desk on WhatsApp.
                  </p>
                </div>

                {/* Direct WhatsApp Action Button */}
                <a
                  href={`https://wa.me/919876543210?text=${encodeURIComponent('Hi Village Made Organics, I would like to inquire about bulk ordering / corporate gifting.')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3.5 px-5 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-2xl text-xs sm:text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-3 shadow-md transition-all cursor-pointer"
                >
                  <MessageSquare className="w-4.5 h-4.5 fill-white" />
                  <span>Chat on WhatsApp</span>
                </a>

                {/* Direct Phone & Email */}
                <div className="space-y-2.5 pt-1">
                  <a
                    href="tel:+919876543210"
                    className="flex items-center gap-3.5 p-3.5 bg-white rounded-2xl border border-[#D9CBBA] text-xs sm:text-sm font-medium text-[#384401] hover:border-[#384401] transition-all shadow-xs"
                  >
                    <Phone className="w-4.5 h-4.5 text-[#C56C4F] shrink-0" />
                    <span>+91 98765 43210</span>
                  </a>

                  <a
                    href="mailto:bulk@villagemade.in"
                    className="flex items-center gap-3.5 p-3.5 bg-white rounded-2xl border border-[#D9CBBA] text-xs sm:text-sm font-medium text-[#384401] hover:border-[#384401] transition-all shadow-xs"
                  >
                    <Mail className="w-4.5 h-4.5 text-[#C56C4F] shrink-0" />
                    <span>bulk@villagemade.in</span>
                  </a>
                </div>
              </div>

              {/* Sample Tasting Box Section */}
              <div className="p-4.5 bg-white rounded-2xl border border-[#D9CBBA] space-y-2 shadow-xs">
                <div className="flex items-center gap-2 text-[#384401]">
                  <Package className="w-4.5 h-4.5 text-[#C56C4F]" />
                  <span className="text-xs sm:text-sm font-bold uppercase tracking-wider">Test Sample First?</span>
                </div>
                <p className="text-xs text-[#5c4636] font-normal leading-relaxed">
                  Want to test sample jars before placing your bulk order?
                </p>
                <button
                  type="button"
                  onClick={() => setShowSampleModal(true)}
                  className="text-xs sm:text-sm font-medium text-[#C56C4F] hover:text-[#384401] uppercase tracking-wider cursor-pointer transition-colors block pt-0.5"
                >
                  Request Sample Box →
                </button>
              </div>

            </div>
          </div>
        )}
      </section>

      {/* SAMPLE REQUEST MODAL */}
      {showSampleModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-[#FDFBF7] border border-[#D9CBBA] rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-5 relative shadow-2xl">
            <button
              onClick={() => {
                setShowSampleModal(false);
                setSampleSuccess(false);
              }}
              className="absolute top-5 right-5 text-[#a38f7d] hover:text-[#3d2b1f] p-2 rounded-full hover:bg-stone-200/50 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {sampleSuccess ? (
              <div className="text-center py-6 space-y-4">
                <div className="w-14 h-14 rounded-full bg-[#384401]/10 text-[#384401] flex items-center justify-center mx-auto border border-[#384401]/20">
                  <Check className="w-7 h-7" />
                </div>
                <h3 
                  className="text-xl font-bold text-[#384401] uppercase tracking-wide"
                  style={{ fontFamily: "'Poetsen One', sans-serif" }}
                >
                  Sample Request Sent
                </h3>
                <p className="text-xs sm:text-sm text-[#5c4636] font-normal">
                  Our team will contact you to dispatch your sample box.
                </p>
                <button
                  onClick={() => {
                    setShowSampleModal(false);
                    setSampleSuccess(false);
                  }}
                  className="px-6 py-3 bg-[#384401] text-white rounded-2xl text-xs sm:text-sm font-bold uppercase tracking-wider cursor-pointer hover:bg-[#252d00]"
                >
                  Close
                </button>
              </div>
            ) : (
              <>
                <div className="space-y-1.5">
                  <h3 
                    className="text-xl font-bold text-[#384401] uppercase tracking-wide"
                    style={{ fontFamily: "'Poetsen One', sans-serif" }}
                  >
                    Request Sample Box
                  </h3>
                  <p className="text-xs sm:text-sm text-[#5c4636] font-normal">
                    Receive sample jars delivered to your address before placing your bulk order.
                  </p>
                </div>

                <form onSubmit={handleSampleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-[#3d2b1f] mb-1.5">Your Name *</label>
                    <input
                      type="text"
                      required
                      value={sampleFormData.name}
                      onChange={e => setSampleFormData({ ...sampleFormData, name: e.target.value })}
                      placeholder="Your Name"
                      className="w-full px-4 py-3 bg-white border border-[#D9CBBA] rounded-2xl text-xs sm:text-sm font-medium text-[#3d2b1f] focus:outline-none focus:border-[#384401]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-[#3d2b1f] mb-1.5">Phone Number *</label>
                    <input
                      type="tel"
                      required
                      value={sampleFormData.phone}
                      onChange={e => setSampleFormData({ ...sampleFormData, phone: e.target.value })}
                      placeholder="+91 98765 43210"
                      className="w-full px-4 py-3 bg-white border border-[#D9CBBA] rounded-2xl text-xs sm:text-sm font-medium text-[#3d2b1f] focus:outline-none focus:border-[#384401]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-[#3d2b1f] mb-1.5">Product Sample</label>
                    <select
                      value={sampleFormData.selectedProduct}
                      onChange={e => setSampleFormData({ ...sampleFormData, selectedProduct: e.target.value })}
                      className="w-full px-4 py-3 bg-white border border-[#D9CBBA] rounded-2xl text-xs sm:text-sm font-medium text-[#384401] focus:outline-none focus:border-[#384401]"
                    >
                      {PRODUCTS.map(p => (
                        <option key={p.id} value={p.name}>{p.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-[#3d2b1f] mb-1.5">Delivery Address & City</label>
                    <input
                      type="text"
                      required
                      value={sampleFormData.address}
                      onChange={e => setSampleFormData({ ...sampleFormData, address: e.target.value })}
                      placeholder="Full Address & Pincode"
                      className="w-full px-4 py-3 bg-white border border-[#D9CBBA] rounded-2xl text-xs sm:text-sm font-medium text-[#3d2b1f] focus:outline-none focus:border-[#384401]"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={sampleSubmitting}
                    className="w-full py-3.5 bg-[#384401] hover:bg-[#252d00] text-white rounded-2xl text-xs sm:text-sm font-bold uppercase tracking-wider transition-all cursor-pointer disabled:opacity-50 mt-2 shadow-sm"
                  >
                    {sampleSubmitting ? 'Sending...' : 'Send Sample Request'}
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
