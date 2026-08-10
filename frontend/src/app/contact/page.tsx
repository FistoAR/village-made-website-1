'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Mail, Phone, MapPin, Clock, Send, CheckCircle2 } from 'lucide-react';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success'>('idle');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;

    setIsSubmitting(true);
    // Simulate API request
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitStatus('success');
      setFormData({ name: '', email: '', subject: '', message: '' });
      
      // Reset status after a few seconds
      setTimeout(() => {
        setSubmitStatus('idle');
      }, 5000);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#3E2C1C]">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-16 px-6 md:px-12 lg:px-24 bg-[#FAF4E6] border-b border-[#eeddb9]/50 text-center">
        <div className="max-w-3xl mx-auto">
          <span className="text-[#C56C4F] font-poetsen text-sm tracking-widest uppercase mb-3 block">
            Get In Touch
          </span>
          <h1
            className="text-4xl md:text-5xl font-bold tracking-tight mb-6 font-display text-stone-900"
            style={{ fontFamily: "var(--font-display), serif" }}
          >
            Contact Our Village Network
          </h1>
          <p className="text-stone-600 font-body text-base md:text-lg leading-relaxed">
            Have questions about our organic products, shipping, bulk ordering, or farm-to-family practices? Reach out to us, and our team will get back to you shortly.
          </p>
        </div>
      </section>

      {/* Main Grid Content */}
      <section className="py-20 px-6 md:px-12 lg:px-24 max-w-[1400px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          
          {/* Left Column: Contact Cards */}
          <div className="lg:col-span-5 space-y-6">
            <h2 className="text-2xl font-bold font-display text-stone-900 mb-6">
              Village Made Headquarters
            </h2>

            {/* Phone Card */}
            <div className="flex gap-4 p-6 bg-white border border-[#eeddb9]/50 rounded-2xl shadow-sm">
              <span className="flex items-center justify-center w-12 h-12 rounded-xl bg-[#5a6a34]/10 text-[#5a6a34] shrink-0">
                <Phone className="w-5 h-5 text-[#384401]" />
              </span>
              <div>
                <h4 className="font-bold text-stone-800 text-sm tracking-wide uppercase mb-1">Phone Number</h4>
                <p className="text-stone-600 font-semibold font-body text-base">+91 9875785646</p>
                <p className="text-stone-400 text-xs mt-0.5">Toll-free Mon-Sat support</p>
              </div>
            </div>

            {/* Email Card */}
            <div className="flex gap-4 p-6 bg-white border border-[#eeddb9]/50 rounded-2xl shadow-sm">
              <span className="flex items-center justify-center w-12 h-12 rounded-xl bg-[#5a6a34]/10 text-[#5a6a34] shrink-0">
                <Mail className="w-5 h-5 text-[#384401]" />
              </span>
              <div>
                <h4 className="font-bold text-stone-800 text-sm tracking-wide uppercase mb-1">Email Address</h4>
                <p className="text-stone-600 font-semibold font-body text-base">Support@gmail.com</p>
                <p className="text-stone-400 text-xs mt-0.5">Response within 24 hours</p>
              </div>
            </div>

            {/* Address Card */}
            <div className="flex gap-4 p-6 bg-white border border-[#eeddb9]/50 rounded-2xl shadow-sm">
              <span className="flex items-center justify-center w-12 h-12 rounded-xl bg-[#5a6a34]/10 text-[#5a6a34] shrink-0">
                <MapPin className="w-5 h-5 text-[#384401]" />
              </span>
              <div>
                <h4 className="font-bold text-stone-800 text-sm tracking-wide uppercase mb-1">Main Store & Farms</h4>
                <p className="text-stone-600 font-semibold font-body text-base leading-relaxed">
                  123, Organic Street, Tamil Nadu - 641401
                </p>
              </div>
            </div>

            {/* Business Hours Card */}
            <div className="flex gap-4 p-6 bg-white border border-[#eeddb9]/50 rounded-2xl shadow-sm">
              <span className="flex items-center justify-center w-12 h-12 rounded-xl bg-[#5a6a34]/10 text-[#5a6a34] shrink-0">
                <Clock className="w-5 h-5 text-[#384401]" />
              </span>
              <div>
                <h4 className="font-bold text-stone-800 text-sm tracking-wide uppercase mb-1">Working Hours</h4>
                <p className="text-stone-600 font-semibold font-body text-base">Mon - Sat: 9:00 AM - 6:00 PM</p>
                <p className="text-stone-400 text-xs mt-0.5">Closed on Sundays & Public Holidays</p>
              </div>
            </div>
          </div>

          {/* Right Column: Contact Form */}
          <div className="lg:col-span-7 bg-white border border-[#eeddb9]/50 p-8 sm:p-10 rounded-[32px] shadow-sm">
            <h3 className="text-2xl font-bold font-display text-stone-900 mb-2">Send Us an Inquiry</h3>
            <p className="text-stone-500 text-sm font-body mb-8">
              Fill out the form below, and we will get in touch with you shortly.
            </p>

            {submitStatus === 'success' ? (
              <div className="bg-[#5a6a34]/10 border border-[#5a6a34]/30 rounded-2xl p-6 text-center text-stone-800 flex flex-col items-center gap-3 animate-fadeIn">
                <CheckCircle2 className="w-12 h-12 text-[#5a6a34]" />
                <h4 className="text-lg font-bold">Message Sent Successfully!</h4>
                <p className="text-stone-600 text-sm">
                  Thank you for contacting Village Made. We appreciate your inquiry and will respond as soon as possible.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="text-stone-700 text-xs font-bold uppercase tracking-wider block mb-2">Your Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. John Doe"
                      className="w-full px-4 py-3 border border-[#eeddb9] rounded-xl text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#C56C4F] focus:border-[#C56C4F] transition-all bg-[#FDFBF7]"
                    />
                  </div>
                  <div>
                    <label className="text-stone-700 text-xs font-bold uppercase tracking-wider block mb-2">Your Email *</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="e.g. name@domain.com"
                      className="w-full px-4 py-3 border border-[#eeddb9] rounded-xl text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#C56C4F] focus:border-[#C56C4F] transition-all bg-[#FDFBF7]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-stone-700 text-xs font-bold uppercase tracking-wider block mb-2">Subject</label>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="Inquiry Topic..."
                    className="w-full px-4 py-3 border border-[#eeddb9] rounded-xl text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#C56C4F] focus:border-[#C56C4F] transition-all bg-[#FDFBF7]"
                  />
                </div>

                <div>
                  <label className="text-stone-700 text-xs font-bold uppercase tracking-wider block mb-2">Message *</label>
                  <textarea
                    required
                    rows={5}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Enter your message detail..."
                    className="w-full px-4 py-3 border border-[#eeddb9] rounded-xl text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#C56C4F] focus:border-[#C56C4F] transition-all bg-[#FDFBF7] resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 bg-[#C56C4F] hover:bg-[#8B5A3C] disabled:bg-stone-400 text-white font-bold py-3.5 rounded-xl shadow-md transition-colors cursor-pointer"
                >
                  {isSubmitting ? (
                    'Sending Message...'
                  ) : (
                    <>
                      <Send className="w-4 h-4" /> Send Message
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Dynamic Location Map Mock Container */}
        <div className="mt-20 border border-[#eeddb9]/60 rounded-[32px] overflow-hidden bg-[#FAF4E6] p-4 shadow-sm">
          <div className="relative w-full h-[350px] rounded-[24px] overflow-hidden bg-stone-200 flex items-center justify-center">
            {/* Background representation of a rural map/farmscape */}
            <div className="absolute inset-0 opacity-40 mix-blend-multiply bg-[radial-gradient(#C56C4F_1px,transparent_1px)] [background-size:16px_16px]"></div>
            <div className="absolute inset-0 bg-[#e5d8be]/30 pointer-events-none"></div>
            
            <div className="z-10 text-center max-w-sm px-6">
              <MapPin className="w-12 h-12 text-[#C56C4F] mx-auto mb-4 animate-sway-1" />
              <h4 className="text-lg font-bold font-display text-stone-900 mb-2">Tamil Nadu, India</h4>
              <p className="text-stone-600 text-xs font-semibold font-body leading-relaxed mb-4">
                Our main packaging hub and organic cooperative farming community is situated in the fertile landscapes of Tamil Nadu.
              </p>
              <span className="text-[11px] font-bold text-[#5a6a34] bg-[#5a6a34]/15 px-3 py-1.5 rounded-full uppercase tracking-wider">
                cooperative farm network
              </span>
            </div>
          </div>
        </div>

      </section>

      <Footer />
    </div>
  );
}
