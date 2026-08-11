'use client';

import React from 'react';
import { Loader2, ShoppingBag, ShieldCheck, CheckCircle } from 'lucide-react';
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
        <div className="min-h-[450px] flex flex-col justify-center items-center text-center max-w-xl mx-auto bg-white border border-[#eeddb9]/50 rounded-[32px] p-8 md:p-12 shadow-xs select-none animate-fade-in">
          <div className="relative mb-6">
            <Loader2 className="w-16 h-16 text-[#C56C4F] animate-spin" />
            <ShoppingBag className="w-6 h-6 text-[#384401] absolute top-5 left-5" />
          </div>
          <h2 className="text-xl md:text-2xl font-bold font-jakarta text-stone-950 mb-3 tracking-tight">
            Creating Your Order
          </h2>
          <p className="text-stone-500 font-jakarta text-xs max-w-sm mb-6 leading-relaxed">
            We are communicating with the village warehouses to secure allocation and setup draft details.
          </p>
          <div className="w-full bg-stone-50 border border-stone-100 rounded-xl p-4 text-left font-jakarta text-xs text-stone-650 flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-[#384401] animate-ping" />
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
              <div className="w-3.5 h-3.5 rounded-full bg-green-500" />
              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">VillagePay Gateway</span>
            </div>
            <span className="text-stone-400 text-xs font-mono">{simulatedOrderId}</span>
          </div>

          {/* Price Box */}
          <div className="w-full bg-stone-900/50 border border-stone-800 rounded-2xl p-5 mb-6 flex justify-between items-center text-left">
            <div>
              <span className="text-[10px] text-stone-400 block font-bold uppercase tracking-wider">Payee Reference</span>
              <span className="text-xs text-stone-200 mt-0.5 block">{customerDetails.name}</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-stone-400 block font-bold uppercase tracking-wider">Amount Due</span>
              <span className="text-2xl font-black text-amber-500">₹{finalTotal}</span>
            </div>
          </div>

          {/* Specific payment details display */}
          <div className="w-full text-left bg-stone-950/60 rounded-xl p-4 mb-6 border border-stone-800/40 text-xs text-stone-400 flex flex-col gap-2.5">
            <p className="font-bold border-b border-stone-800 pb-1.5 text-stone-200 text-[11px] uppercase tracking-wider">
              Payment Route Selected: {paymentMethod.toUpperCase()}
            </p>
            {paymentMethod === 'upi' && (
              <div>
                <p className="text-stone-300">Proceed with instant UPI authorization simulation.</p>
                <input 
                  type="text" 
                  readOnly
                  value={`${customerDetails.phone || '9876543210'}@okvillage`}
                  className="w-full h-10 px-3 bg-stone-900 border border-stone-850 rounded-lg text-xs mt-1.5 focus:outline-none text-stone-300"
                />
              </div>
            )}
            {paymentMethod === 'card' && (
              <div className="flex flex-col gap-2">
                <p className="text-stone-300">Authorized card simulation details:</p>
                <input 
                  type="text" 
                  readOnly
                  value="4321 •••• •••• 9876"
                  className="w-full h-10 px-3 bg-stone-900 border border-stone-850 rounded-lg text-xs focus:outline-none text-stone-300 font-mono"
                />
              </div>
            )}
            {paymentMethod === 'netbanking' && (
              <p className="text-stone-300">Secure banking tunnel will simulate direct authorization on confirmation.</p>
            )}
            {paymentMethod === 'cod' && (
              <p className="text-stone-300">No immediate transaction required. Place authorization check to confirm delivery schedule.</p>
            )}
          </div>

          {/* Actions */}
          <div className="w-full grid grid-cols-2 gap-3 mt-4">
            <button
              onClick={() => handleSimulatePayment(false)}
              className="py-3 bg-stone-900 hover:bg-stone-800 text-stone-300 font-bold rounded-xl text-xs uppercase tracking-wider transition-colors cursor-pointer border border-stone-800"
            >
              Cancel / Fail
            </button>
            <button
              onClick={() => handleSimulatePayment(true)}
              className="py-3 bg-[#C56C4F] hover:bg-[#a85237] text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-colors cursor-pointer shadow-lg hover:shadow-xl font-jakarta"
            >
              Authorize & Pay
            </button>
          </div>

          {/* Foot note */}
          <p className="text-[10px] text-stone-500 mt-6 leading-relaxed flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" /> Secured encryption protocol in sandbox environment.
          </p>
        </div>
      );

    case 'payment_verification':
      return (
        <div className="min-h-[450px] flex flex-col justify-center items-center text-center max-w-xl mx-auto bg-white border border-[#eeddb9]/50 rounded-[32px] p-8 md:p-12 shadow-xs select-none animate-fade-in">
          <div className="relative mb-6">
            <Loader2 className="w-16 h-16 text-[#384401] animate-spin" />
            <ShieldCheck className="w-6 h-6 text-green-600 absolute top-5 left-5 animate-pulse" />
          </div>
          <h2 className="text-xl md:text-2xl font-bold font-jakarta text-stone-950 mb-3 tracking-tight">
            Verifying Payment
          </h2>
          <p className="text-stone-500 font-jakarta text-xs max-w-sm mb-6 leading-relaxed">
            We are communicating with the bank servers to secure authentication receipt.
          </p>
          <div className="w-full bg-stone-50 border border-stone-100 rounded-xl p-4 text-left font-jakarta text-xs text-stone-650 flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-[#384401] animate-ping" />
              <span>{verificationStatus}</span>
            </div>
          </div>
        </div>
      );

    case 'order_confirmed':
      return (
        <div className="min-h-[450px] flex flex-col justify-center items-center text-center max-w-xl mx-auto bg-white border border-[#eeddb9]/50 rounded-[32px] p-8 md:p-12 shadow-md select-none animate-scale-up">
          <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mb-6 text-green-600 animate-bounce">
            <CheckCircle className="w-16 h-16 fill-green-500 text-white" />
          </div>
          <h1 className="font-display text-3xl font-extrabold text-[#384401] mb-2 tracking-tight">
            Order Confirmed!
          </h1>
          <p className="text-[#C56C4F] font-bold text-sm mb-4">
            Yay! Your request has been scheduled for dispatch.
          </p>
          <p className="text-stone-500 text-xs font-jakarta max-w-xs leading-normal">
            Preparing invoice documents. This window will automatically forward to your order summary dashboard in just a moment...
          </p>
        </div>
      );

    case 'success':
      return (
        <div className="bg-[#FAF4E6] border border-[#eeddb9] rounded-[32px] p-6 md:p-12 max-w-2xl mx-auto shadow-xs select-none animate-scale-up">
          <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600">
            <CheckCircle className="w-10 h-10 fill-green-500 text-white" />
          </div>
          <div className="text-center">
            <h1 className="font-display text-3xl font-extrabold text-stone-950 mb-2">
              Pantry Order Dispatched!
            </h1>
            <p className="text-stone-600 font-semibold text-sm mb-8">
              Thank you for supporting village industries and organic farming initiatives.
            </p>
          </div>

          {/* Receipt Summary Card */}
          <div className="bg-white border border-[#eeddb9]/60 rounded-2xl p-5 mb-8 text-left text-xs font-jakarta text-stone-700 flex flex-col gap-3">
            <div className="flex justify-between border-b border-stone-100 pb-3 mb-1">
              <div>
                <span className="font-bold text-stone-950 text-sm block">Order Reference ID:</span>
                <span className="text-stone-400 font-mono text-[10px] block mt-0.5">{simulatedOrderId || 'VM-395802'}</span>
              </div>
              <div className="text-right">
                <span className="text-[#C56C4F] font-bold text-xs block">Estimated Delivery</span>
                <span className="text-stone-900 block font-bold mt-0.5">
                  {deliveryMethod === 'express' ? '1 - 2 business days' : '3 - 5 business days'}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-1.5 border-b border-stone-100 pb-3">
              <p><strong>Deliver To:</strong> {customerDetails.name} ({customerDetails.phone})</p>
              <p><strong>Shipment Address:</strong> {shippingAddress.address}, {shippingAddress.city}, {shippingAddress.pincode}</p>
              <p><strong>Payment Mode:</strong> {paymentMethod.toUpperCase()}</p>
            </div>

            {/* Items List */}
            <div className="flex flex-col gap-1 border-b border-stone-100 pb-3">
              <span className="font-bold text-stone-900 block mb-1">Items Dispatched:</span>
              {cart.map((item) => (
                <div key={`${item.id}-${item.weight}`} className="flex justify-between items-center text-[11px] text-stone-600">
                  <span>{item.name} ({item.weight}) x {item.quantity}</span>
                  <span>₹{item.price * item.quantity}</span>
                </div>
              ))}
            </div>

            <div className="flex justify-between font-bold text-stone-950 pt-1">
              <span>Grand Total Authorized:</span>
              <span className="text-sm text-[#384401]">₹{finalTotal}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <button
              onClick={handleSuccessClose}
              className="w-full sm:w-auto bg-[#384401] hover:bg-[#252d00] text-white font-bold py-3 px-8 rounded-xl transition-all shadow-md hover:shadow-lg cursor-pointer text-xs uppercase tracking-wider text-center"
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
