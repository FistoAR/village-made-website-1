'use client';

import React from 'react';
import { ShoppingBag, ArrowRight, ShieldCheck } from 'lucide-react';

interface CheckoutOrderSummaryProps {
  cartCount: number;
  cartTotal: number;
  discountValue: number;
  shippingFee: number;
  estimatedTax: number;
  paymentMethod?: 'upi' | 'card' | 'netbanking' | 'cod';
  shippingThreshold: number;
  discountedSubtotal: number;
  grandTotal: number;
  couponCode: string;
  setCouponCode: (val: string) => void;
  handleApplyCoupon: (e: React.FormEvent) => void;
  handleRemoveCoupon?: () => void;
  couponError: string;
  couponSuccess: string;
  onProceedToCheckout?: () => void;
  isCheckoutScreen: boolean;
}

export default function CheckoutOrderSummary({
  cartCount,
  cartTotal,
  discountValue,
  shippingFee,
  estimatedTax,
  paymentMethod = 'upi',
  shippingThreshold,
  discountedSubtotal,
  grandTotal,
  couponCode,
  setCouponCode,
  handleApplyCoupon,
  handleRemoveCoupon,
  couponError,
  couponSuccess,
  onProceedToCheckout,
  isCheckoutScreen
}: CheckoutOrderSummaryProps) {
  const codFee = paymentMethod === 'cod' ? 15 : 0;
  const finalTotal = grandTotal + codFee;

  return (
    <div className="w-full lg:w-[35%] flex flex-col gap-6 lg:sticky lg:top-32 select-none self-start">
      {/* Summary Card */}
      <div className="bg-[#FAF4E6] border border-[#eeddb9] rounded-2xl p-6 shadow-sm">
        <h2 className="text-lg font-black font-jakarta text-[#3E2C1C] border-b border-[#eeddb9] pb-3.5 mb-4 flex items-center gap-2">
          <ShoppingBag className="w-5 h-5 text-[#C56C4F]" /> Order Summary
        </h2>

        <div className="flex flex-col gap-4 text-sm font-jakarta text-stone-850">
          <div className="flex justify-between font-semibold">
            <span>Items Subtotal ({cartCount})</span>
            <span className="font-extrabold text-stone-950">₹{cartTotal}</span>
          </div>
          
          {/* Discount display */}
          {discountValue > 0 && (
            <div className="flex justify-between items-center text-[#384401] font-black bg-[#e2edd3] p-2.5 rounded-lg text-xs border border-green-200">
              <div className="flex items-center gap-1.5">
                <span>Discount Applied</span>
                <span className="text-[10px] bg-[#384401]/10 px-1.5 py-0.5 rounded text-stone-750 font-bold uppercase">{couponCode || 'PROMO'}</span>
              </div>
              <div className="flex items-center gap-3">
                <span>- ₹{discountValue}</span>
                {handleRemoveCoupon && (
                  <button 
                    type="button"
                    onClick={handleRemoveCoupon}
                    className="text-red-700 hover:text-red-900 underline font-bold cursor-pointer text-[10px] uppercase ml-1 animate-pulse"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          )}

          <div className="flex justify-between font-semibold">
            <span>Delivery Fee</span>
            <span className="font-extrabold text-stone-950">
              {shippingFee === 0 ? (
                <span className="text-[#384401] font-black">FREE</span>
              ) : (
                `₹${shippingFee}`
              )}
            </span>
          </div>
          <div className="flex justify-between font-semibold">
            <span>Estimated GST (5%)</span>
            <span className="font-extrabold text-stone-950">₹{estimatedTax}</span>
          </div>

          {isCheckoutScreen && paymentMethod === 'cod' && (
            <div className="flex justify-between text-xs text-[#C56C4F] font-black bg-amber-50 p-2 rounded-lg border border-amber-200">
              <span>COD Convenience Fee</span>
              <span>+ ₹15</span>
            </div>
          )}

          {(!isCheckoutScreen && shippingFee > 0) && (
            <div className="bg-[#e2edd3] text-[#384401] border border-green-200 rounded-lg p-2.5 text-xs font-black text-center mt-1">
              Add ₹{shippingThreshold - discountedSubtotal} more for FREE Delivery!
            </div>
          )}

          <div className="border-t border-[#eeddb9]/50 pt-4 mt-2 flex justify-between items-center bg-white border border-[#eeddb9]/30 p-4 rounded-xl shadow-xs">
            <span className="text-stone-600 font-extrabold text-sm uppercase tracking-wide">Grand Total</span>
            <span className="text-xl text-[#384401] font-black font-jakarta">₹{finalTotal}</span>
          </div>

          {/* Coupon entry form */}
          {!isCheckoutScreen && (
            <div className="border-t border-[#eeddb9]/50 pt-4 mt-2 flex flex-col gap-4">
              <form onSubmit={handleApplyCoupon} className="flex flex-col gap-2">
                <label className="text-xs font-extrabold text-[#3E2C1C] uppercase tracking-wide">Have a Coupon?</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. VILLAGE10"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="flex-grow h-10 px-3 bg-white border border-[#eeddb9] hover:border-[#d0b88c] rounded-xl text-xs font-bold text-stone-900 focus:outline-none focus:border-[#384401] focus:ring-4 focus:ring-[#384401]/10 transition-all placeholder:text-stone-400 shadow-xs"
                  />
                  <button
                    type="submit"
                    className="h-10 px-5 bg-[#384401] hover:bg-[#252d00] text-white text-xs font-bold rounded-xl transition-all duration-300 cursor-pointer shadow-xs active:scale-95"
                  >
                    Apply
                  </button>
                </div>
                {couponError && <span className="text-red-700 text-xs font-bold block mt-1">{couponError}</span>}
                {couponSuccess && <span className="text-[#384401] text-xs font-bold block mt-1">{couponSuccess}</span>}
              </form>

              {/* Premium Available Coupons Ticket layout */}
              <div className="mt-1">
                <span className="text-[10px] font-black text-stone-500 uppercase tracking-widest block mb-2">Available Coupons</span>
                <div className="flex flex-col gap-3">
                  
                  {/* WELCOME100 Ticket */}
                  <div 
                    onClick={() => { setCouponCode('WELCOME100'); }}
                    className={`relative flex items-center justify-between border-2 border-dashed p-3.5 rounded-xl cursor-pointer transition-all duration-300 hover:-translate-y-0.5 ${
                      discountValue > 0 && couponCode.toUpperCase() === 'WELCOME100'
                        ? 'border-[#384401] bg-[#384401]/5 shadow-xs'
                        : 'border-[#C56C4F]/30 bg-stone-50/50 hover:bg-stone-50 hover:border-[#C56C4F]/60'
                    }`}
                  >
                    <div className="flex flex-col gap-1 min-w-0 pr-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-sm text-[#384401] tracking-wider">WELCOME100</span>
                        {discountValue > 0 && couponCode.toUpperCase() === 'WELCOME100' && (
                          <span className="bg-[#384401] text-white text-[8px] font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider">Applied</span>
                        )}
                      </div>
                      <span className="text-[11px] text-stone-600 font-semibold leading-tight">Flat ₹100 off (Min. Order ₹300)</span>
                    </div>
                    <button 
                      type="button" 
                      className={`text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-lg transition-colors shrink-0 ${
                        discountValue > 0 && couponCode.toUpperCase() === 'WELCOME100'
                          ? 'bg-[#384401] text-white'
                          : 'bg-[#C56C4F]/10 text-[#C56C4F] hover:bg-[#C56C4F]/20'
                      }`}
                    >
                      {discountValue > 0 && couponCode.toUpperCase() === 'WELCOME100' ? '✓' : 'Apply'}
                    </button>
                  </div>

                  {/* VILLAGE10 Ticket */}
                  <div 
                    onClick={() => { setCouponCode('VILLAGE10'); }}
                    className={`relative flex items-center justify-between border-2 border-dashed p-3.5 rounded-xl cursor-pointer transition-all duration-300 hover:-translate-y-0.5 ${
                      discountValue > 0 && couponCode.toUpperCase() === 'VILLAGE10'
                        ? 'border-[#384401] bg-[#384401]/5 shadow-xs'
                        : 'border-[#C56C4F]/30 bg-stone-50/50 hover:bg-stone-50 hover:border-[#C56C4F]/60'
                    }`}
                  >
                    <div className="flex flex-col gap-1 min-w-0 pr-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-sm text-[#384401] tracking-wider">VILLAGE10</span>
                        {discountValue > 0 && couponCode.toUpperCase() === 'VILLAGE10' && (
                          <span className="bg-[#384401] text-white text-[8px] font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider">Applied</span>
                        )}
                      </div>
                      <span className="text-[11px] text-stone-600 font-semibold leading-tight">Get 10% off on your entire cart</span>
                    </div>
                    <button 
                      type="button" 
                      className={`text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-lg transition-colors shrink-0 ${
                        discountValue > 0 && couponCode.toUpperCase() === 'VILLAGE10'
                          ? 'bg-[#384401] text-white'
                          : 'bg-[#C56C4F]/10 text-[#C56C4F] hover:bg-[#C56C4F]/20'
                      }`}
                    >
                      {discountValue > 0 && couponCode.toUpperCase() === 'VILLAGE10' ? '✓' : 'Apply'}
                    </button>
                  </div>

                </div>
              </div>
            </div>
          )}

          {/* Direct place order button */}
          {!isCheckoutScreen && onProceedToCheckout && (
            <button
              onClick={onProceedToCheckout}
              className="w-full mt-4 py-3.5 bg-gradient-to-r from-[#384401] to-[#485602] hover:shadow-lg hover:shadow-[#384401]/15 text-white font-black rounded-xl transition-all duration-300 active:scale-[0.98] cursor-pointer text-xs uppercase tracking-wider flex items-center justify-center gap-2 font-jakarta"
            >
              Proceed to Checkout <ArrowRight className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {isCheckoutScreen && (
        <div className="bg-white border border-[#eeddb9] rounded-2xl p-4.5 flex gap-3 items-center shadow-xs">
          <ShieldCheck className="w-10 h-10 text-[#6B8E23] shrink-0" />
          <div className="text-xs font-jakarta leading-normal text-stone-700 font-semibold">
            <span className="font-black text-stone-900 block mb-0.5">Secure Transaction</span>
            Your custom details are highly private and secure using direct SSL transport.
          </div>
        </div>
      )}
    </div>
  );
}
