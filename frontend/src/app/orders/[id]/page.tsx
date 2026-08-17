'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, Package, Truck, CheckCircle2, Clock, MapPin, 
  CreditCard, Phone, MessageSquare, AlertCircle, ShoppingBag, ShieldCheck,
  Calendar, Check, Landmark, Box
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useApp } from '@/lib/context/AppContext';
import { io } from 'socket.io-client';
import { PRODUCTS } from '@/data/products-list';

export default function OrderTrackingPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const { user, updateOrderStatus, showToast, showConfirm } = useApp();
  const [mounted, setMounted] = useState(false);
  const [fetchedOrder, setFetchedOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fallbackOrder = {
    id: id || 'VM-630591',
    date: '12/8/2026',
    status: 'Processing' as const,
    subtotal: 840,
    shipping: 0,
    tax: 38,
    total: 794,
    items: [
      {
        id: 'sweet-potato-malt',
        name: 'SWEET POTATO MALT',
        weight: '500 g',
        price: 280,
        quantity: 3
      }
    ],
    address: {
      id: 'default',
      name: user?.name || 'testuser',
      phone: user?.phone || '9911223344',
      address: 'just a normal street, cbe',
      city: 'Coimbatore',
      state: 'Tamil Nadu',
      pincode: '641001',
      isDefault: true
    }
  };

  const handleRequestReturn = () => {
    showConfirm(
      'Request Return?',
      'Are you sure you want to request a return for this order? Our admin team will verify details and approve/process the refund shortly.',
      async () => {
        try {
          const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
          const res = await fetch(`${baseUrl}/auth/orders/${(fetchedOrder || fallbackOrder).id}/return`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
          });
          const data = await res.json();
          if (res.ok && data.success) {
            updateOrderStatus((fetchedOrder || fallbackOrder).id, 'Return Requested');
            setFetchedOrder((prev: any) => prev ? { ...prev, status: 'Return Requested' } : null);
            showToast('Return requested successfully!', 'success');
          } else {
            showToast(data.error || 'Failed to submit return request.', 'error');
          }
        } catch (err) {
          console.error(err);
          showToast('Failed to connect to backend server.', 'error');
        }
      }
    );
  };

  useEffect(() => {
    setMounted(true);

    const fetchOrder = async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
        const res = await fetch(`${baseUrl}/orders/${id}`);
        const data = await res.json();
        if (data.success) {
          setFetchedOrder(data.order);
        }
      } catch (err) {
        console.error('Failed to fetch order details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();

    // Setup live websocket tracking
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5001';
    const socket = io(socketUrl, { transports: ['websocket'] });

    socket.on('connect', () => {
      console.log('🔌 Order tracking page connected to real-time updates socket');
    });

    socket.on('order-update', (data: { orderId: string; status: string; remarks?: string }) => {
      if (data.orderId === id) {
        console.log('📡 Real-time tracking status update received:', data);
        setFetchedOrder((prev: any) => {
          if (!prev) return prev;
          const oldHistory = Array.isArray(prev.status_history) ? prev.status_history : [];
          const hasUpdate = oldHistory.some((h: any) => h.status === data.status && h.remarks === data.remarks);
          let newHistory = oldHistory;
          if (!hasUpdate) {
            newHistory = [
              ...oldHistory,
              {
                status: data.status,
                date: new Date().toLocaleDateString('en-IN') + ' ' + new Date().toLocaleTimeString('en-IN'),
                remarks: data.remarks || 'Status updated by administrator'
              }
            ];
          }
          return {
            ...prev,
            status: data.status,
            remarks: data.remarks || prev.remarks,
            status_history: newHistory
          };
        });
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [id]);

  if (!mounted) return null;

  const order = fetchedOrder || fallbackOrder;
  const orderObj = order; // support legacy naming if any

  // Track steps status map
  const statusSteps = [
    { label: 'Order Confirmed', desc: 'Your order has been received and verified', time: '10:00 AM, ' + order.date, icon: ClipboardCheckIcon },
    { label: 'Processing', desc: 'Millers traditionally preparing organic goods', time: '11:30 AM, ' + order.date, icon: GearIcon },
    { label: 'Shipped', desc: 'Handed over to our courier partner', time: 'Pending dispatch', icon: TruckIcon },
    { label: 'Delivered', desc: 'Successfully delivered to destination', time: 'Pending arrival', icon: HomeIcon }
  ];

  // Helper to determine status step indexes
  const getActiveStepIndex = () => {
    switch (order.status) {
      case 'Delivered': 
      case 'Return Requested':
      case 'Returned':
        return 3;
      case 'Shipped': return 2;
      case 'Cancelled': return -1;
      case 'Processing':
      default: return 1;
    }
  };

  const activeIndex = getActiveStepIndex();

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#3E2C1C] flex flex-col justify-between select-none">
      <Navbar />

      <main className="flex-grow pt-28 pb-20 px-4 md:px-8 mx-auto w-full max-w-[1400px]">
        {/* Navigation Breadcrumb */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/account"
            className="group inline-flex items-center gap-1.5 text-stone-700 hover:text-stone-950 text-xs sm:text-sm font-semibold font-jakarta transition-colors"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" /> Back to Account
          </Link>
          
        </div>

        {/* Premium Chocolate Header Banner */}
        <div className="bg-[#3E2C1C] rounded-[24px] p-6 sm:p-8 md:p-10 text-white mb-8 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
          <div className="absolute right-0 top-0 w-64 h-64 bg-[#C56C4F]/5 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10">
            <span className="text-[10px] sm:text-xs font-bold text-[#C56C4F] uppercase tracking-widest block mb-2">Order Tracking Desk</span>
            <h1 className="font-poetsen text-2.5xl sm:text-3.5xl md:text-4xl text-white tracking-tight mb-2">
              Order #{order.id}
            </h1>
            <p className="text-stone-300 font-medium font-jakarta text-xs sm:text-sm">
              Placed on <span className="text-white font-bold">{order.date}</span> • Delivery estimated in <span className="text-[#C56C4F] font-bold">2-4 working days</span>
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 shrink-0 relative z-10 w-full md:w-auto">
            <span className={`text-xs font-black px-4.5 py-2 rounded-xl uppercase tracking-wider select-none ${
              order.status === 'Delivered' || order.status === 'Returned'
                ? 'bg-[#e2edd3] text-[#384401]'
                : order.status === 'Cancelled'
                  ? 'bg-red-100 text-red-700'
                  : 'bg-[#C56C4F] text-white animate-pulse'
            }`}>
              Status: {order.status}
            </span>
            {order.status === 'Delivered' && (
              <button
                onClick={handleRequestReturn}
                className="px-4.5 py-2 bg-[#C56C4F] hover:bg-[#a85237] text-white text-xs font-black rounded-xl transition-all cursor-pointer shadow-3xs uppercase tracking-wide"
              >
                Request Return
              </button>
            )}
            <Link
              href={`/help?orderId=${order.id}`}
              className="px-4.5 py-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-black rounded-xl transition-all cursor-pointer shadow-3xs uppercase tracking-wide flex items-center gap-1.5"
            >
              <MessageSquare className="w-3.5 h-3.5" /> Support Desk
            </Link>
          </div>
        </div>

        {/* Main Columns Grid Layout */}
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          {/* Left Column: Visual tracker and item lists */}
          <div className="w-full lg:w-[65%] flex flex-col gap-6">
            
            {/* Visual Tracking Stepper Section */}
            <div className="bg-white border border-[#eeddb9] rounded-2xl p-6 sm:p-8 shadow-2xs">
              <h2 className="text-base sm:text-lg font-black font-jakarta text-stone-900 border-b border-[#eeddb9]/30 pb-3 mb-6 flex items-center gap-2">
                <Truck className="w-5 h-5 text-[#C56C4F]" /> Delivery Progress Timeline
              </h2>              <div className="relative flex flex-col md:flex-row justify-between items-start md:items-start gap-8 md:gap-4 md:pt-4">
                
                {/* Horizontal connector line on wide viewports */}
                <div className="hidden md:block absolute left-[12.5%] right-[12.5%] top-10 h-[3px] bg-stone-150 -z-0" />
                <div 
                  className="hidden md:block absolute left-[12.5%] top-10 h-[3px] bg-[#384401] -z-0 transition-all duration-500" 
                  style={{ width: `${(activeIndex / 3) * 75}%` }}
                />

                {statusSteps.map((step, idx) => {
                  const isCompleted = idx <= activeIndex && order.status !== 'Cancelled';
                  const isCurrent = idx === activeIndex && order.status !== 'Cancelled';
                  
                  return (
                    <div key={step.label} className="relative z-10 flex md:flex-col items-center md:items-center gap-4 w-full md:w-1/4">
                      
                      {/* Step Circle with Icon */}
                      <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all shrink-0 ${
                        isCompleted 
                          ? 'bg-[#384401] border-[#384401] text-white shadow-xs' 
                          : 'bg-white border-stone-250 text-stone-400'
                      } ${isCurrent ? 'ring-4 ring-[#384401]/10 scale-105' : ''}`}>
                        {isCompleted && idx < activeIndex ? (
                          <Check className="w-5 h-5 stroke-[3]" />
                        ) : (
                          <step.icon className="w-5 h-5" />
                        )}
                      </div>

                      {/* Step Description details */}
                      <div className="flex flex-col items-start md:items-center min-w-0 md:mt-2.5 text-left md:text-center w-full">
                        <p className={`font-extrabold text-xs sm:text-sm font-jakarta ${isCompleted ? 'text-stone-955' : 'text-stone-400'}`}>
                          {step.label}
                        </p>
                        <p className="text-[11px] text-stone-500 font-semibold mt-1 leading-relaxed max-w-[160px] break-words">
                          {step.desc}
                        </p>
                        {isCompleted && (
                          <div className="text-[9px] font-mono text-[#384401] font-bold mt-2 bg-[#384401]/10 px-2.5 py-0.5 rounded-full select-none">
                            {step.time.split(',')[0]}
                          </div>
                        )}
                      </div>

                    </div>
                  );
                })}
              </div>

              {order.status === 'Cancelled' && (
                <div className="mt-8 bg-red-50 border border-red-200 rounded-xl p-4 flex gap-3 items-center">
                  <AlertCircle className="w-5 h-5 text-red-700 shrink-0" />
                  <div className="text-xs text-red-800 font-jakarta font-semibold">
                    This order was cancelled. Refund has been processed to your payment card.
                  </div>
                </div>
              )}
            </div>

            {/* Refund Status Section */}
            {(order.status === 'Return Requested' || order.status === 'Returned') && (
              <div className="bg-white border border-[#eeddb9] rounded-2xl p-6 sm:p-8 shadow-2xs font-jakarta">
                <h2 className="text-base sm:text-lg font-black text-stone-900 border-b border-[#eeddb9]/30 pb-3.5 mb-6 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-[#C56C4F]" /> Return & Refund Status
                </h2>
                
                <div className="relative flex flex-col md:flex-row justify-between items-start md:items-start gap-8 md:gap-4 md:pt-4">
                  {/* Connect Line */}
                  <div className="hidden md:block absolute left-[16.5%] right-[16.5%] top-10 h-[3px] bg-stone-150 -z-0" />
                  <div 
                    className="hidden md:block absolute left-[16.5%] top-10 h-[3px] bg-[#C56C4F] -z-0 transition-all duration-500" 
                    style={{ width: order.status === 'Returned' ? '67%' : '0%' }}
                  />

                  {/* Step 1: Return Requested */}
                  <div className="relative z-10 flex md:flex-col items-center md:items-center gap-4 w-full md:w-1/3">
                    <div className="w-12 h-12 rounded-full bg-[#C56C4F] text-white flex items-center justify-center font-bold shadow-xs">
                      <Check className="w-5 h-5 stroke-[3]" />
                    </div>
                    <div className="flex flex-col items-start md:items-center min-w-0 md:mt-2.5 text-left md:text-center w-full">
                      <p className="font-extrabold text-xs sm:text-sm text-stone-950">Return Requested</p>
                      <p className="text-[11px] text-stone-500 font-semibold mt-1 leading-relaxed max-w-[160px]">
                        Return request submitted. Verification in progress.
                      </p>
                    </div>
                  </div>

                  {/* Step 2: Refund Processing */}
                  <div className="relative z-10 flex md:flex-col items-center md:items-center gap-4 w-full md:w-1/3">
                    <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center font-bold ${
                      order.status === 'Return Requested' 
                        ? 'bg-white border-[#C56C4F] text-[#C56C4F] ring-4 ring-[#C56C4F]/10 animate-pulse'
                        : 'bg-[#C56C4F] text-white border-[#C56C4F]'
                    }`}>
                      {order.status === 'Returned' ? <Check className="w-5 h-5 stroke-[3]" /> : <Clock className="w-5 h-5" />}
                    </div>
                    <div className="flex flex-col items-start md:items-center min-w-0 md:mt-2.5 text-left md:text-center w-full">
                      <p className="font-extrabold text-xs sm:text-sm text-stone-950">Processing Refund</p>
                      <p className="text-[11px] text-stone-500 font-semibold mt-1 leading-relaxed max-w-[160px]">
                        Verification approved. Preparing credit transaction.
                      </p>
                    </div>
                  </div>

                  {/* Step 3: Refund Credited */}
                  <div className="relative z-10 flex md:flex-col items-center md:items-center gap-4 w-full md:w-1/3">
                    <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center font-bold ${
                      order.status === 'Returned'
                        ? 'bg-[#384401] border-[#384401] text-white shadow-xs'
                        : 'bg-white border-stone-250 text-stone-400'
                    }`}>
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col items-start md:items-center min-w-0 md:mt-2.5 text-left md:text-center w-full">
                      <p className={`font-extrabold text-xs sm:text-sm ${order.status === 'Returned' ? 'text-stone-955' : 'text-stone-400'}`}>Refund Credited</p>
                      <p className="text-[11px] text-stone-500 font-semibold mt-1 leading-relaxed max-w-[160px]">
                        Credit transferred back to original payment mode.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Product Cards Listing */}
            <div className="bg-white border border-[#eeddb9] rounded-2xl p-6 shadow-2xs">
              <h2 className="text-base sm:text-lg font-black font-jakarta text-stone-900 border-b border-[#eeddb9]/30 pb-3.5 mb-4 flex items-center gap-2">
                <Package className="w-5 h-5 text-[#C56C4F]" /> Items Purchased
              </h2>

              <div className="flex flex-col gap-1">
                {order.items.map((item) => {
                  const productObj = PRODUCTS.find(p => p.id === item.id || p.name.toLowerCase() === item.name.toLowerCase());
                  return (
                    <div 
                      key={`${item.id}-${item.weight}`} 
                      className="flex items-center justify-between gap-4 py-4 border-b border-stone-150/45 last:border-0"
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="w-16 h-16 bg-[#FAF4E6] rounded-xl overflow-hidden shrink-0 border border-[#eeddb9]/20 flex items-center justify-center relative">
                          <img 
                            src={productObj?.image || "/images/product-section/product-placeholder-rimage.webp"} 
                            alt={item.name} 
                            className="object-cover w-full h-full"
                          />
                        </div>
                        <div className="min-w-0">
                          <span className="font-black text-stone-955 block text-xs sm:text-sm leading-tight hover:underline cursor-pointer">{item.name}</span>
                          <span className="text-stone-600 text-xs font-bold block mt-1">Weight: {item.weight} • Qty: {item.quantity}</span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="font-extrabold text-stone-900 block text-xs sm:text-sm">₹{item.price * item.quantity}</span>
                        <span className="text-stone-500 text-[10px] font-semibold block mt-0.5">₹{item.price} each</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Right Column: Order Details and Receipt Address Cards */}
          <div className="w-full lg:w-[35%] flex flex-col gap-6 lg:sticky lg:top-32 self-start">
            
            {/* DELIVERY ADDRESS DETAILS */}
            <div className="bg-[#FAF4E6] border border-[#eeddb9] rounded-2xl p-6 shadow-2xs">
              <h3 className="text-base font-black font-jakarta text-stone-900 border-b border-[#eeddb9]/50 pb-3 mb-4 flex items-center gap-2">
                <MapPin className="w-4.5 h-4.5 text-[#C56C4F]" /> Delivery Address
              </h3>

              <div className="grid grid-cols-1 gap-2 text-xs sm:text-sm font-jakarta text-stone-955">
                <div className="flex items-start"><span className="font-extrabold text-stone-500 w-[85px] shrink-0 select-none">Name:</span> <span className="font-semibold text-black">{order.address.name}</span></div>
                <div className="flex items-start"><span className="font-extrabold text-stone-500 w-[85px] shrink-0 select-none">Address:</span> <span className="font-semibold text-black break-all">{order.address.address}</span></div>
                <div className="flex items-start"><span className="font-extrabold text-stone-500 w-[85px] shrink-0 select-none">City:</span> <span className="font-semibold text-black">{order.address.city}</span></div>
                <div className="flex items-start"><span className="font-extrabold text-stone-500 w-[85px] shrink-0 select-none">State:</span> <span className="font-semibold text-black">{order.address.state || 'Karnataka'}</span></div>
                <div className="flex items-start"><span className="font-extrabold text-stone-500 w-[85px] shrink-0 select-none">Pincode:</span> <span className="font-semibold text-black">{order.address.pincode}</span></div>
                <div className="flex items-start mt-0.5"><span className="font-extrabold text-stone-500 w-[85px] shrink-0 select-none">Phone:</span> <span className="font-bold text-black">{order.address.phone}</span></div>
              </div>
            </div>

            {/* ORDER INVOICE CALCULATION SUMMARY */}
            <div className="bg-white border border-[#eeddb9] rounded-2xl p-6 shadow-2xs">
              <h3 className="text-base font-black font-jakarta text-stone-900 border-b border-stone-150/45 pb-3 mb-4 flex items-center gap-2">
                <CreditCard className="w-4.5 h-4.5 text-[#C56C4F]" /> Payment Summary
              </h3>

              <div className="flex flex-col gap-2.5 text-xs sm:text-sm font-jakarta text-stone-950">
                <div className="flex justify-between">
                  <span className="font-semibold text-stone-600">Subtotal</span>
                  <span className="font-black text-black">₹{order.subtotal}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-stone-600">Shipping Charges</span>
                  <span className="font-black text-[#384401]">
                    {order.shipping === 0 ? 'FREE' : `₹${order.shipping}`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-stone-600">GST (5%)</span>
                  <span className="font-black text-black">₹{order.tax}</span>
                </div>
                
                <div className="border-t border-[#eeddb9]/30 pt-3.5 mt-2 flex justify-between items-center text-stone-950 font-black">
                  <span className="text-xs uppercase tracking-wider select-none">Grand Total</span>
                  <span className="text-lg sm:text-xl text-[#384401]">₹{order.total}</span>
                </div>
              </div>
            </div>

            {/* SECURE TRANSACTION BADGE */}
            <div className="bg-white border border-[#eeddb9] rounded-2xl p-4 flex gap-3.5 items-center shadow-3xs">
              <ShieldCheck className="w-9 h-9 text-[#384401] shrink-0" />
              <div className="text-[11px] sm:text-xs font-jakarta leading-relaxed text-stone-700 font-medium">
                <span className="font-black text-stone-950 block mb-0.5">Assured Delivery desk</span>
                For updates or changes to delivery schedule, email <span className="font-bold text-[#C56C4F]">support@villagemade.com</span>.
              </div>
            </div>

          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}

// Local helper icons
function ClipboardCheckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
      <path d="m9 14 2 2 4-4" />
    </svg>
  );
}

function GearIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.1a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function TruckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="1" y="3" width="15" height="13" rx="2" ry="2" />
      <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
      <circle cx="5.5" cy="18.5" r="2.5" />
      <circle cx="18.5" cy="18.5" r="2.5" />
    </svg>
  );
}

function HomeIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}
