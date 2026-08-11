'use client';

import React from 'react';
import { Loader2, ShoppingBag, ShieldCheck, CheckCircle, Check } from 'lucide-react';
import { CartItem } from '@/lib/context/AppContext';

interface AddressData {
  address: string;
  city: string;
  state: string;
  pincode: string;
}

interface CheckoutSimulationsProps {
  checkoutStep: 'create_order' | 'payment_gateway' | 'payment_verification' | 'order_confirmed' | 'success';
  customerDetails: { name: string; phone: string; email: string };
  shippingAddress: AddressData;
  paymentMethod: 'upi' | 'card' | 'netbanking' | 'cod';
  deliveryMethod: 'standard' | 'express';
  cart: CartItem[];
  grandTotal: number;
  simulatedOrderId: string;
  creationStatus: string;
  verificationStatus: string;
  handleSimulatePayment: (success: boolean) => void;
  handleSuccessClose: () => void;
}

export default function CheckoutSimulations({
  checkoutStep,
  customerDetails,
  shippingAddress,
  paymentMethod,
  deliveryMethod,
  cart,
  grandTotal,
  simulatedOrderId,
  creationStatus,
  verificationStatus,
  handleSimulatePayment,
  handleSuccessClose
}: CheckoutSimulationsProps) {
  const codFee = paymentMethod === 'cod' ? 15 : 0;
  const finalTotal = grandTotal + codFee;

  switch (checkoutStep) {
    case 'create_order':
      return (
        <div className="min-h-[450px] flex flex-col justify-center items-center text-center max-w-xl mx-auto bg-white border border-[#eeddb9] rounded-[32px] p-8 md:p-12 shadow-md select-none animate-fade-in">
          <div className="relative mb-6">
            <Loader2 className="w-16 h-16 text-[#C56C4F] animate-spin" />
            <ShoppingBag className="w-7 h-7 text-[#384401] absolute top-4.5 left-4.5" />
          </div>
          <h2 className="text-2xl font-black font-jakarta text-stone-950 mb-3 tracking-tight">
            Creating Your Order
          </h2>
          <p className="text-stone-700 font-semibold text-sm max-w-sm mb-6 leading-relaxed">
            We are communicating with the village warehouses to secure allocation and setup draft details.
          </p>
          <div className="w-full bg-[#FAF4E6] border border-[#eeddb9] rounded-xl p-4 text-left font-jakarta text-sm text-[#3E2C1C] font-extrabold shadow-xs">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-[#384401] animate-ping" />
              <span>{creationStatus}</span>
            </div>
          </div>
        </div>
      );

    case 'payment_gateway':
      return (
        <div className="min-h-[500px] flex flex-col justify-center items-center text-center max-w-lg mx-auto bg-[#1a1008] border border-stone-850 rounded-[32px] p-6 sm:p-10 shadow-2xl text-white select-none animate-scale-up">
          {/* Header */}
          <div className="w-full flex justify-between items-center pb-4 border-b border-stone-800/80 mb-6">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-green-500" />
              <span className="text-xs font-black text-stone-300 uppercase tracking-widest">VillagePay Gateway</span>
            </div>
            <span className="text-stone-300 text-sm font-mono font-bold">{simulatedOrderId}</span>
          </div>

          {/* Price Box */}
          <div className="w-full bg-stone-900 border border-stone-800 rounded-2xl p-5 mb-6 flex justify-between items-center text-left">
            <div>
              <span className="text-xs text-stone-400 block font-black uppercase tracking-wider">Payee Reference</span>
              <span className="text-sm font-bold text-stone-100 mt-0.5 block">{customerDetails.name}</span>
            </div>
            <div className="text-right">
              <span className="text-xs text-stone-400 block font-black uppercase tracking-wider">Amount Due</span>
              <span className="text-2xl font-black text-amber-500">₹{finalTotal}</span>
            </div>
          </div>

          {/* Specific payment details display */}
          <div className="w-full text-left bg-stone-950/60 rounded-xl p-5 mb-6 border border-stone-800/40 text-xs text-stone-300 flex flex-col gap-3">
            <p className="font-black border-b border-stone-800 pb-2 text-stone-200 text-xs uppercase tracking-wider">
              Payment Route Selected: {paymentMethod.toUpperCase()}
            </p>
            {paymentMethod === 'upi' && (
              <div>
                <p className="text-stone-300 font-semibold mb-1">Proceed with instant UPI authorization simulation.</p>
                <input 
                  type="text" 
                  readOnly
                  value={`${customerDetails.phone || '9876543210'}@okvillage`}
                  className="w-full h-11 px-4 bg-stone-900 border border-stone-850 rounded-lg text-sm focus:outline-none text-stone-200 font-bold"
                />
              </div>
            )}
            {paymentMethod === 'card' && (
              <div className="flex flex-col gap-2">
                <p className="text-stone-300 font-semibold">Authorized card simulation details:</p>
                <input 
                  type="text" 
                  readOnly
                  value="4321 •••• •••• 9876"
                  className="w-full h-11 px-4 bg-stone-900 border border-stone-850 rounded-lg text-sm focus:outline-none text-stone-200 font-mono font-bold"
                />
              </div>
            )}
            {paymentMethod === 'netbanking' && (
              <p className="text-stone-350 font-semibold leading-relaxed">Secure banking tunnel will simulate direct authorization on confirmation.</p>
            )}
            {paymentMethod === 'cod' && (
              <p className="text-stone-355 font-semibold leading-relaxed">No immediate transaction required. Place authorization check to confirm delivery schedule.</p>
            )}
          </div>

          {/* Actions */}
          <div className="w-full grid grid-cols-2 gap-3 mt-4">
            <button
              onClick={() => handleSimulatePayment(false)}
              className="py-3 bg-stone-900 hover:bg-stone-800 text-stone-300 font-black rounded-xl text-xs uppercase tracking-wider transition-colors cursor-pointer border border-stone-800"
            >
              Cancel / Fail
            </button>
            <button
              onClick={() => handleSimulatePayment(true)}
              className="py-3 bg-[#C56C4F] hover:bg-[#a85237] text-white font-black rounded-xl text-xs uppercase tracking-wider transition-colors cursor-pointer shadow-lg hover:shadow-xl font-jakarta"
            >
              Authorize & Pay
            </button>
          </div>

          {/* Foot note */}
          <p className="text-xs text-stone-400 mt-6 leading-relaxed flex items-center gap-1.5 justify-center">
            <ShieldCheck className="w-4 h-4 text-green-500" /> Secured encryption protocol in sandbox environment.
          </p>
        </div>
      );

    case 'payment_verification':
      return (
        <div className="min-h-[450px] flex flex-col justify-center items-center text-center max-w-xl mx-auto bg-white border border-[#eeddb9] rounded-[32px] p-8 md:p-12 shadow-md select-none animate-fade-in">
          <div className="relative mb-6">
            <Loader2 className="w-16 h-16 text-[#384401] animate-spin" />
            <ShieldCheck className="w-7 h-7 text-green-600 absolute top-4.5 left-4.5 animate-pulse" />
          </div>
          <h2 className="text-2xl font-black font-jakarta text-stone-950 mb-3 tracking-tight">
            Verifying Payment
          </h2>
          <p className="text-stone-700 font-semibold text-sm max-w-sm mb-6 leading-relaxed">
            We are communicating with the bank servers to secure authentication receipt.
          </p>
          <div className="w-full bg-[#FAF4E6] border border-[#eeddb9] rounded-xl p-4 text-left font-jakarta text-sm text-[#3E2C1C] font-extrabold shadow-xs">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-[#384401] animate-ping" />
              <span>{verificationStatus}</span>
            </div>
          </div>
        </div>
      );

    case 'order_confirmed':
      return (
        <div className="min-h-[450px] flex flex-col justify-center items-center text-center max-w-xl mx-auto bg-white border border-[#eeddb9] rounded-[32px] p-8 md:p-12 shadow-md select-none animate-scale-up">
          <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-6 relative">
            <div className="absolute inset-0 rounded-full border-4 border-green-500/20 animate-ping duration-1000" />
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center shadow-lg shadow-green-500/25">
              <Check className="w-9 h-9 text-white stroke-[3.5]" />
            </div>
          </div>
          <h1 className="font-display text-3xl font-black text-[#384401] mb-2 tracking-tight">
            Order Confirmed!
          </h1>
          <p className="text-[#C56C4F] font-black text-base mb-4 animate-pulse">
            Yay! Your request has been scheduled for dispatch.
          </p>
          <p className="text-stone-700 font-semibold text-sm max-w-xs leading-relaxed">
            Preparing invoice documents. This window will automatically forward to your order summary dashboard in just a moment...
          </p>
        </div>
      );

    case 'success':
      return (
        <div className="bg-[#FAF4E6] border border-[#eeddb9] rounded-[32px] p-6 md:p-12 max-w-2xl mx-auto shadow-md select-none animate-scale-up">
          <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6 relative">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center shadow-lg shadow-green-500/25 mx-auto">
              <Check className="w-9 h-9 text-white stroke-[3.5]" />
            </div>
          </div>
          <div className="text-center">
            <h1 className="font-display text-3xl font-black text-stone-950 mb-2">
              Pantry Order Dispatched!
            </h1>
            <p className="text-stone-800 font-extrabold text-sm mb-8">
              Thank you for supporting village industries and organic farming initiatives.
            </p>
          </div>

          {/* Receipt Summary Card */}
          <div className="bg-white border border-[#eeddb9] rounded-2xl p-6 mb-8 text-left text-sm font-jakarta text-stone-800 flex flex-col gap-4 shadow-sm">
            <div className="flex justify-between border-b border-stone-150 pb-3 mb-1">
              <div>
                <span className="font-black text-stone-950 text-sm block">Order Reference ID:</span>
                <span className="text-[#384401] font-mono text-xs font-bold block mt-1">{simulatedOrderId || 'VM-395802'}</span>
              </div>
              <div className="text-right">
                <span className="text-[#C56C4F] font-black text-xs block">Estimated Delivery</span>
                <span className="text-stone-950 block font-black mt-1 text-sm">
                  {deliveryMethod === 'express' ? '1 - 2 business days' : '3 - 5 business days'}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-2 border-b border-stone-150 pb-3 font-semibold text-stone-805">
              <p><strong>Deliver To:</strong> {customerDetails.name} ({customerDetails.phone})</p>
              <p><strong>Shipment Address:</strong> {shippingAddress.address}, {shippingAddress.city}, {shippingAddress.pincode}</p>
              <p><strong>Payment Mode:</strong> <span className="uppercase text-[#384401] font-extrabold">{paymentMethod}</span></p>
            </div>

            {/* Items List */}
            <div className="flex flex-col gap-2 border-b border-stone-150 pb-3">
              <span className="font-black text-stone-950 block mb-1">Items Dispatched:</span>
              {cart.map((item) => (
                <div key={`${item.id}-${item.weight}`} className="flex justify-between items-center text-sm font-semibold text-stone-750">
                  <span>{item.name} ({item.weight}) x {item.quantity}</span>
                  <span className="font-extrabold text-stone-950">₹{item.price * item.quantity}</span>
                </div>
              ))}
            </div>

            <div className="flex justify-between font-black text-stone-950 pt-1 text-base">
              <span>Grand Total Authorized:</span>
              <span className="text-lg text-[#384401]">₹{finalTotal}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <button
              onClick={handleSuccessClose}
              className="w-full sm:w-auto bg-[#384401] hover:bg-[#252d00] text-white font-black py-4.5 px-10 rounded-xl transition-all shadow-md hover:shadow-lg cursor-pointer text-xs uppercase tracking-wider text-center"
            >
              Explore More Products
            </button>
          </div>
        </div>
      );

    default:
      return null;
  }
}
