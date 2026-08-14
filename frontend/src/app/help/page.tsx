'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { 
  Search, ArrowLeft, MessageSquare, Phone, Mail, HelpCircle, 
  ChevronDown, ChevronUp, Package, CreditCard, ShieldQuestion, 
  Send, Sparkles, CheckCircle2, AlertCircle, FileText
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useApp } from '@/lib/context/AppContext';

export default function HelpCenterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, raiseTicket } = useApp();
  
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [openFaqId, setOpenFaqId] = useState<number | null>(null);

  // Ticket form states
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketCategory, setTicketCategory] = useState('General Inquiry');
  const [ticketDescription, setTicketDescription] = useState('');
  const [ticketOrderId, setTicketOrderId] = useState('');
  const [submittingTicket, setSubmittingTicket] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    setMounted(true);
    // Auto-fill order ID if provided in URL params
    const prefillOrder = searchParams.get('orderId');
    if (prefillOrder) {
      setTicketOrderId(prefillOrder);
      setTicketCategory('Return & Refund');
      // Scroll to ticket form
      setTimeout(() => {
        const formEl = document.getElementById('raise-ticket-form');
        if (formEl) {
          formEl.scrollIntoView({ behavior: 'smooth' });
        }
      }, 500);
    }
  }, [searchParams]);

  if (!mounted) return null;

  const faqs = [
    {
      id: 1,
      category: 'returns',
      q: 'How do I raise a Return Request?',
      a: 'To return a delivered item, go to your "Account" dashboard, select "My Orders", click "Track & Manage Order" on the delivered order, and click "Request Return". Our quality control team will inspect the request and notify you once approved.'
    },
    {
      id: 2,
      category: 'refunds',
      q: 'What is the Refund Status after returning an item?',
      a: 'Once an admin approves your return request, the status updates to "Returned". The credit refund will be processed back to your original payment mode (or bank account) within 3-5 working days. You can track this status on the order tracking page.'
    },
    {
      id: 3,
      category: 'shipping',
      q: 'How long does traditional delivery take?',
      a: 'Since our nutritional malts, cookies, and grains are prepared traditionally in small batches to preserve nutrition, orders generally ship within 24-48 hours and arrive in 2-4 working days across India.'
    },
    {
      id: 4,
      category: 'products',
      q: 'Are your products chemical-free and organic?',
      a: 'Absolutely. All Village Made products are certified organic, stone-ground, traditionally prepared, and completely free from artificial sweeteners, chemicals, and preservatives.'
    },
    {
      id: 5,
      category: 'tickets',
      q: 'How do I track my support tickets?',
      a: 'After raising a support ticket on this page, you can monitor live updates and replies by navigating to your "Account" dashboard and selecting the "Support Tickets" tab.'
    }
  ];

  const filteredFaqs = faqs.filter(faq => {
    const matchesSearch = faq.q.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          faq.a.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === 'all' || faq.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const handleTicketSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject || !ticketDescription || !ticketCategory) {
      setErrorMsg('Please fill out all required fields.');
      return;
    }

    setSubmittingTicket(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await raiseTicket(
        ticketSubject,
        ticketDescription,
        ticketCategory,
        ticketOrderId || undefined
      );

      if (res.success) {
        setSuccessMsg(`Support ticket raised successfully! ID: ${res.ticket?.id || 'TCK-NEW'}`);
        setTicketSubject('');
        setTicketDescription('');
        setTicketOrderId('');
        setTicketCategory('General Inquiry');
        
        // Scroll back to success alert
        const alertEl = document.getElementById('ticket-status-alert');
        if (alertEl) {
          alertEl.scrollIntoView({ behavior: 'smooth' });
        }
      } else {
        setErrorMsg(res.error || 'Failed to raise support ticket. Please try again.');
      }
    } catch (err) {
      setErrorMsg('A network error occurred. Please try again.');
    } finally {
      setSubmittingTicket(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#3E2C1C] flex flex-col justify-between select-none">
      <Navbar />

      <main className="flex-grow pt-32 pb-24 px-4 md:px-8 mx-auto w-full max-w-[1400px]">
        {/* Breadcrumbs */}
        <div className="mb-6">
          <Link
            href="/"
            className="group inline-flex items-center gap-1.5 text-stone-700 hover:text-stone-950 text-xs sm:text-sm font-semibold font-jakarta transition-colors"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" /> Back to Home
          </Link>
        </div>

        {/* Hero Header Banner */}
        <div className="bg-[#462617] rounded-[24px] p-8 md:p-12 text-white mb-10 shadow-md relative overflow-hidden text-center">
          <div className="absolute inset-0 opacity-10 bg-cover" style={{ backgroundImage: "url('/images/product-section/bottom-paper-texture.webp')" }}></div>
          <div className="relative z-10 max-w-2xl mx-auto flex flex-col items-center">
            <span className="text-[#D4E47A] text-xs font-bold uppercase tracking-widest block mb-2">VILLAGE MADE CUSTOMER SUPPORT</span>
            <h1 className="font-poetsen text-3xl md:text-5xl text-white mb-4 tracking-tight">
              How Can We Help You?
            </h1>
            <p className="text-stone-250 text-sm md:text-base leading-relaxed mb-6 font-jakarta font-medium">
              Find instant answers to returns, refund status, traditional preparation methods, or raise support requests.
            </p>
            
            {/* Live Search Bar */}
            <div className="relative w-full max-w-lg">
              <Search className="w-5 h-5 text-stone-400 absolute left-4.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search FAQs, refund policies, support guides..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-12.5 pl-12 pr-4 bg-white border border-[#eeddb9] rounded-2xl text-xs sm:text-sm text-stone-900 focus:outline-hidden font-jakarta shadow-md"
              />
            </div>
          </div>
        </div>

        {/* Grid Layout for FAQ and Contact */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start mb-12">
          
          {/* Left / Center 2 Columns: FAQ Section */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <div className="bg-white border border-[#eeddb9] rounded-[24px] p-6 sm:p-8 shadow-xs">
              <h2 className="text-lg sm:text-xl font-black font-jakarta text-stone-900 border-b border-[#eeddb9]/30 pb-3 mb-6 flex items-center gap-2">
                <HelpCircle className="w-5.5 h-5.5 text-[#C56C4F]" /> Frequently Asked Questions
              </h2>

              {/* Category Filter Chips */}
              <div className="flex gap-2.5 flex-wrap mb-6">
                {[
                  { id: 'all', label: 'All FAQs' },
                  { id: 'returns', label: 'Returns' },
                  { id: 'refunds', label: 'Refunds' },
                  { id: 'shipping', label: 'Shipping' },
                  { id: 'products', label: 'Products' }
                ].map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-4.5 py-1.5 rounded-full text-xs font-bold font-jakarta transition-all cursor-pointer ${
                      selectedCategory === cat.id
                        ? 'bg-[#384401] text-white'
                        : 'bg-[#FAF4E6] text-stone-750 hover:bg-[#ebdcc1]'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* FAQ Accordion List */}
              <div className="flex flex-col gap-3.5">
                {filteredFaqs.length === 0 ? (
                  <div className="text-center py-10 text-stone-400 text-xs sm:text-sm font-semibold border border-dashed border-stone-200 rounded-2xl">
                    No FAQs matching your search query. Try typing 'refund' or 'return'.
                  </div>
                ) : (
                  filteredFaqs.map((faq) => {
                    const isOpen = openFaqId === faq.id;
                    return (
                      <div 
                        key={faq.id} 
                        className="border border-[#eeddb9]/60 rounded-2xl overflow-hidden transition-all duration-300 bg-[#FDFBF7]/40"
                      >
                        <button
                          onClick={() => setOpenFaqId(isOpen ? null : faq.id)}
                          className="w-full p-4 sm:p-5 text-left flex justify-between items-center gap-4 hover:bg-[#FAF4E6]/30 transition-colors"
                        >
                          <span className="font-bold text-stone-950 text-xs sm:text-sm font-jakarta">{faq.q}</span>
                          {isOpen ? <ChevronUp className="w-4 h-4 text-stone-500 shrink-0" /> : <ChevronDown className="w-4 h-4 text-stone-500 shrink-0" />}
                        </button>
                        {isOpen && (
                          <div className="px-5 pb-5 pt-1 text-stone-700 text-xs sm:text-sm leading-relaxed font-jakarta font-medium border-t border-[#eeddb9]/20 bg-white">
                            {faq.a}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Direct Contact & Resources */}
          <div className="flex flex-col gap-6">
            
            {/* Contact Support Info */}
            <div className="bg-white border border-[#eeddb9] rounded-[24px] p-6 shadow-xs">
              <h3 className="text-base font-black font-jakarta text-stone-900 border-b border-stone-150/45 pb-3 mb-5 flex items-center gap-2">
                <Mail className="w-4.5 h-4.5 text-[#C56C4F]" /> Contact Support
              </h3>
              
              <div className="flex flex-col gap-4 font-jakarta">
                <div className="flex gap-3.5 items-start">
                  <div className="w-9 h-9 rounded-xl bg-[#FAF4E6] flex items-center justify-center text-[#384401] shrink-0 border border-[#eeddb9]/30">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-stone-500 block mb-0.5">Call Us</span>
                    <span className="text-xs sm:text-sm font-bold text-stone-950 hover:underline cursor-pointer">+91 9988776655</span>
                    <span className="text-[10px] text-stone-500 block mt-0.5">Mon - Sat: 9:00 AM - 6:00 PM</span>
                  </div>
                </div>

                <div className="flex gap-3.5 items-start">
                  <div className="w-9 h-9 rounded-xl bg-[#FAF4E6] flex items-center justify-center text-[#384401] shrink-0 border border-[#eeddb9]/30">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-stone-500 block mb-0.5">Support Email</span>
                    <a href="mailto:support@villagemade.com" className="text-xs sm:text-sm font-bold text-[#C56C4F] hover:underline block break-all">
                      support@villagemade.com
                    </a>
                    <span className="text-[10px] text-stone-500 block mt-0.5">Average reply time: Under 4 hours</span>
                  </div>
                </div>

                <div className="flex gap-3.5 items-start">
                  <div className="w-9 h-9 rounded-xl bg-[#FAF4E6] flex items-center justify-center text-[#384401] shrink-0 border border-[#eeddb9]/30">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-stone-500 block mb-0.5">Live Desk</span>
                    <span className="text-xs sm:text-sm font-bold text-stone-950">Traditional Help center</span>
                    <span className="text-[10px] text-stone-500 block mt-0.5">Quick tickets raising and tracking</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Policies Card */}
            <div className="bg-[#FAF4E6] border border-[#eeddb9] rounded-[24px] p-5 shadow-xs">
              <h4 className="text-xs sm:text-sm font-extrabold text-[#3E2C1C] uppercase tracking-wider block mb-3 font-jakarta flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-[#384401]" /> Standard Refund Policy
              </h4>
              <p className="text-[11px] sm:text-xs text-stone-700 leading-relaxed font-semibold font-jakarta mb-3">
                Returns must be initiated within 7 days of delivery. The products must be unopened, with seal intact, and stored according to label storage instructions.
              </p>
              <Link 
                href="/policies/refund-policy" 
                className="text-[11.5px] font-bold text-[#384401] hover:underline font-jakarta"
              >
                Read Refund Policy →
              </Link>
            </div>

          </div>
        </div>

        {/* Section 2: Raise Support Ticket Form */}
        <div id="raise-ticket-form" className="bg-white border border-[#eeddb9] rounded-[24px] p-6 sm:p-8 max-w-3xl mx-auto shadow-sm">
          <div className="text-center max-w-md mx-auto mb-8 font-jakarta">
            <span className="text-[#C56C4F] text-xs font-bold uppercase tracking-widest block mb-1">RAISE A SUPPORT TICKET</span>
            <h2 className="text-2xl font-black text-stone-950">Submit Support Request</h2>
            <p className="text-stone-600 text-xs sm:text-sm mt-1 font-semibold leading-relaxed">
              Have an issue with your return, order dispatch, or refund? Submit a ticket below.
            </p>
          </div>

          {/* Alert messages inside ticket form */}
          <div id="ticket-status-alert">
            {successMsg && (
              <div className="bg-[#e2edd3] border border-[#d2c9b4]/50 text-[#384401] px-5 py-3.5 rounded-2xl text-xs font-semibold mb-6 flex gap-2.5 items-center animate-scale-up">
                <CheckCircle2 className="w-4.5 h-4.5 shrink-0 text-[#384401]" />
                {successMsg}
              </div>
            )}
            {errorMsg && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-5 py-3.5 rounded-2xl text-xs font-semibold mb-6 flex gap-2.5 items-center animate-scale-up">
                <AlertCircle className="w-4.5 h-4.5 shrink-0 text-red-600" />
                {errorMsg}
              </div>
            )}
          </div>

          <form onSubmit={handleTicketSubmit} className="flex flex-col gap-5 font-jakarta">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Category selector */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-extrabold text-[#3E2C1C] uppercase tracking-wider block">Ticket Category *</label>
                <select
                  value={ticketCategory}
                  onChange={(e) => setTicketCategory(e.target.value)}
                  className="h-11 px-3.5 bg-white border border-[#eeddb9] rounded-xl text-xs sm:text-sm text-stone-850 focus:outline-hidden focus:border-[#384401] font-semibold"
                >
                  <option value="General Inquiry">General Inquiry</option>
                  <option value="Return & Refund">Return & Refund Status</option>
                  <option value="Delivery Delay">Delivery delay</option>
                  <option value="Damaged Items">Damaged / Incorrect items</option>
                  <option value="Payment Issue">Payment Transaction failed</option>
                </select>
              </div>

              {/* Order ID selector/textbox */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-extrabold text-[#3E2C1C] uppercase tracking-wider block">Associated Order ID (Optional)</label>
                {user && user.orders && user.orders.length > 0 ? (
                  <select
                    value={ticketOrderId}
                    onChange={(e) => setTicketOrderId(e.target.value)}
                    className="h-11 px-3.5 bg-white border border-[#eeddb9] rounded-xl text-xs sm:text-sm text-stone-850 focus:outline-hidden focus:border-[#384401] font-semibold"
                  >
                    <option value="">Select an order...</option>
                    {user.orders.map(o => (
                      <option key={o.id} value={o.id}>#{o.id} ({o.date} - ₹{o.total})</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={ticketOrderId}
                    onChange={(e) => setTicketOrderId(e.target.value)}
                    placeholder="e.g. VM-109283"
                    className="h-11 px-3.5 bg-white border border-[#eeddb9] rounded-xl text-xs sm:text-sm text-stone-900 focus:outline-hidden focus:border-[#384401]"
                  />
                )}
              </div>
            </div>

            {/* Subject */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-extrabold text-[#3E2C1C] uppercase tracking-wider block">Subject *</label>
              <input
                type="text"
                required
                value={ticketSubject}
                onChange={(e) => setTicketSubject(e.target.value)}
                placeholder="Brief summary of the support request..."
                className="h-11 px-3.5 bg-white border border-[#eeddb9] rounded-xl text-xs sm:text-sm text-stone-900 focus:outline-hidden focus:border-[#384401]"
              />
            </div>

            {/* Description */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-extrabold text-[#3E2C1C] uppercase tracking-wider block">Description / Details *</label>
              <textarea
                required
                rows={5}
                value={ticketDescription}
                onChange={(e) => setTicketDescription(e.target.value)}
                placeholder="Explain the issue or query in detail so our milling/delivery partner teams can verify details and rectify..."
                className="p-3.5 bg-white border border-[#eeddb9] rounded-xl text-xs sm:text-sm text-stone-900 focus:outline-hidden focus:border-[#384401]"
              />
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={submittingTicket}
              className="mt-2 w-full sm:w-auto self-end px-7 py-3 bg-[#384401] hover:bg-[#252d00] disabled:bg-stone-300 disabled:cursor-not-allowed text-white text-xs font-black rounded-xl transition-all shadow-md uppercase tracking-wider cursor-pointer flex items-center justify-center gap-2 active:scale-98"
            >
              {submittingTicket ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Submitting...
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" /> Submit Support Ticket
                </>
              )}
            </button>
          </form>
        </div>

      </main>

      <Footer />
    </div>
  );
}
