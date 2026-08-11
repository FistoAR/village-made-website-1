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
      <div className="bg-[#FAF4E6] border border-[#eeddb9] rounded-2xl p-6 shadow-xs">
        <h2 className="text-lg font-bold font-jakarta text-stone-950 border-b border-[#eeddb9]/60 pb-3 mb-4 flex items-center gap-1.5">
          <ShoppingBag className="w-4 h-4 text-[#C56C4F]" /> Order Summary
        </h2>

        <div className="flex flex-col gap-3 text-sm font-jakarta text-stone-700">
          <div className="flex justify-between">
            <span>Items Subtotal ({cartCount})</span>
            <span className="font-semibold text-stone-900">₹{cartTotal}</span>
          </div>
          
          {/* Discount display */}
          {discountValue > 0 && (
            <div className="flex justify-between text-[#384401] font-semibold bg-[#e2edd3] p-2 rounded-lg text-xs">
              <span>Discount Applied</span>
              <span>- ₹{discountValue}</span>
            </div>
          )}

          <div className="flex justify-between">
            <span>Delivery Fee</span>
            <span className="font-semibold text-stone-900">
              {shippingFee === 0 ? (
                <span className="text-[#384401] font-bold">FREE</span>
              ) : (
                `₹${shippingFee}`
              )}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Estimated GST (5%)</span>
            <span className="font-semibold text-stone-900">₹{estimatedTax}</span>
          </div>

          {isCheckoutScreen && paymentMethod === 'cod' && (
            <div className="flex justify-between text-[11px] text-[#C56C4F] font-bold">
              <span>COD Convenience Fee</span>
              <span>+ ₹15</span>
            </div>
          )}

          {(!isCheckoutScreen && shippingFee > 0) && (
            <div className="bg-[#e2edd3] text-[#384401] rounded-lg p-2 text-xs font-bold text-center mt-1">
              Add ₹{shippingThreshold - discountedSubtotal} more for FREE Delivery!
            </div>
          )}

          <div className="border-t border-[#eeddb9]/60 pt-4 mt-2 flex justify-between text-base font-extrabold text-stone-950 bg-stone-50/50 p-2 rounded-lg">
            <span>Grand Total</span>
            <span>₹{finalTotal}</span>
          </div>

          {/* Coupon entry form */}
          {!isCheckoutScreen && (
            <form onSubmit={handleApplyCoupon} className="border-t border-[#eeddb9]/60 pt-4 mt-2 flex flex-col gap-2">
              <label className="text-[10px] font-bold text-stone-700 uppercase tracking-wide block">Have a Coupon?</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. VILLAGE10"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="flex-grow h-9 px-3 bg-white border border-[#eeddb9] rounded-lg text-xs focus:outline-none"
                />
                <button
                  type="submit"
                  className="h-9 px-4 bg-[#384401] hover:bg-[#252d00] text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                >
                  Apply
                </button>
              </div>
              {couponError && <span className="text-red-650 text-[10px] font-bold block">{couponError}</span>}
              {couponSuccess && <span className="text-[#384401] text-[10px] font-bold block">{couponSuccess}</span>}
            </form>
          )}

          {/* Direct place order button */}
          {!isCheckoutScreen && onProceedToCheckout && (
            <button
              onClick={onProceedToCheckout}
              className="w-full mt-4 py-3 bg-[#384401] hover:bg-[#252d00] text-white font-bold rounded-xl transition-all shadow-xs cursor-pointer text-xs uppercase tracking-wider flex items-center justify-center gap-2 font-jakarta"
            >
              Proceed to Checkout <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {isCheckoutScreen && (
        <div className="bg-white border border-[#eeddb9]/45 rounded-2xl p-4 flex gap-3 items-center">
          <ShieldCheck className="w-9 h-9 text-[#6B8E23] shrink-0" />
          <div className="text-[11px] font-jakarta leading-normal text-stone-500">
            <span className="font-bold text-stone-800 block mb-0.5">Secure Transaction</span>
            Your custom details are highly private and secure using direct SSL transport.
          </div>
        </div>
      )}
    </div>
  );
}
