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
  couponError,
  couponSuccess,
  onProceedToCheckout,
  isCheckoutScreen
}: CheckoutOrderSummaryProps) {
  const codFee = paymentMethod === 'cod' ? 15 : 0;
  const finalTotal = grandTotal + codFee;

  return (
    <div className="w-full lg:w-[35%] flex flex-col gap-6 sticky top-28 select-none">
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
            <div className="flex justify-between text-[#384401] font-black bg-[#e2edd3] p-2.5 rounded-lg text-xs border border-green-200">
              <span>Discount Applied</span>
              <span>- ₹{discountValue}</span>
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

          <div className="border-t border-[#eeddb9] pt-4 mt-2 flex justify-between text-base font-black text-stone-950 bg-stone-50 p-3 rounded-xl shadow-xs">
            <span>Grand Total</span>
            <span className="text-lg text-[#C56C4F]">₹{finalTotal}</span>
          </div>

          {/* Coupon entry form */}
          {!isCheckoutScreen && (
            <form onSubmit={handleApplyCoupon} className="border-t border-[#eeddb9] pt-4 mt-2 flex flex-col gap-2">
              <label className="text-xs font-extrabold text-stone-800 uppercase tracking-wide">Have a Coupon?</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. VILLAGE10"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="flex-grow h-10 px-3 bg-white border border-[#eeddb9] hover:border-[#d0b88c] rounded-xl text-xs font-bold text-stone-900 focus:outline-none focus:border-[#384401] focus:ring-2 focus:ring-[#384401]/10 transition-all placeholder:text-stone-400"
                />
                <button
                  type="submit"
                  className="h-10 px-5 bg-[#384401] hover:bg-[#252d00] text-white text-xs font-black rounded-xl transition-all cursor-pointer shadow-sm"
                >
                  Apply
                </button>
              </div>
              {couponError && <span className="text-red-700 text-xs font-bold block mt-1">{couponError}</span>}
              {couponSuccess && <span className="text-[#384401] text-xs font-bold block mt-1">{couponSuccess}</span>}
            </form>
          )}

          {/* Direct place order button */}
          {!isCheckoutScreen && onProceedToCheckout && (
            <button
              onClick={onProceedToCheckout}
              className="w-full mt-4 py-3.5 bg-[#384401] hover:bg-[#252d00] text-white font-black rounded-xl transition-all shadow-md hover:shadow-lg cursor-pointer text-xs uppercase tracking-wider flex items-center justify-center gap-2 font-jakarta"
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
