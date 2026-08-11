'use client';

import React from 'react';
import { User, Phone, Mail, MapPin, Truck, Sparkles, CreditCard, ClipboardCheck, Wallet, Landmark, ShoppingBag } from 'lucide-react';
import { CartItem } from '@/lib/context/AppContext';

interface AddressData {
  address: string;
  city: string;
  state: string;
  pincode: string;
}

interface CheckoutStepsProps {
  activeSubStep: number;
  customerDetails: { name: string; phone: string; email: string };
  setCustomerDetails: React.Dispatch<React.SetStateAction<{ name: string; phone: string; email: string }>>;
  shippingAddress: AddressData;
  setShippingAddress: React.Dispatch<React.SetStateAction<AddressData>>;
  sameAsShipping: boolean;
  setSameAsShipping: React.Dispatch<React.SetStateAction<boolean>>;
  billingAddress: AddressData;
  setBillingAddress: React.Dispatch<React.SetStateAction<AddressData>>;
  deliveryMethod: 'standard' | 'express';
  setDeliveryMethod: React.Dispatch<React.SetStateAction<'standard' | 'express'>>;
  paymentMethod: 'upi' | 'card' | 'netbanking' | 'cod';
  setPaymentMethod: React.Dispatch<React.SetStateAction<'upi' | 'card' | 'netbanking' | 'cod'>>;
  baseShippingFee: number;
  cart: CartItem[];
}

export default function CheckoutSteps({
  activeSubStep,
  customerDetails,
  setCustomerDetails,
  shippingAddress,
  setShippingAddress,
  sameAsShipping,
  setSameAsShipping,
  billingAddress,
  setBillingAddress,
  deliveryMethod,
  setDeliveryMethod,
  paymentMethod,
  setPaymentMethod,
  baseShippingFee,
  cart
}: CheckoutStepsProps) {

  switch (activeSubStep) {
    case 1:
      return (
        <div className="flex flex-col gap-4 font-jakarta text-xs text-[#3E2C1C] animate-fade-in">
          <p className="text-stone-500 mb-2 leading-relaxed">
            Provide contact information so we can dispatch shipping confirmations and text message delivery updates.
          </p>
          <div>
            <label className="text-[10px] font-bold text-stone-700 uppercase tracking-wide block mb-1.5">Recipient Full Name *</label>
            <div className="relative">
              <User className="absolute left-3 top-3 w-4 h-4 text-stone-400" />
              <input
                type="text"
                required
                value={customerDetails.name}
                onChange={(e) => setCustomerDetails({ ...customerDetails, name: e.target.value })}
                placeholder="e.g. Rahul Sharma"
                className="w-full h-11 pl-10 pr-3 bg-white border border-[#eeddb9] rounded-xl focus:outline-none"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold text-stone-700 uppercase tracking-wide block mb-1.5">Recipient Phone *</label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 w-4 h-4 text-stone-400" />
                <input
                  type="tel"
                  required
                  value={customerDetails.phone}
                  onChange={(e) => setCustomerDetails({ ...customerDetails, phone: e.target.value })}
                  placeholder="e.g. 9876543210"
                  className="w-full h-11 pl-10 pr-3 bg-white border border-[#eeddb9] rounded-xl focus:outline-none"
                />
              </div>
            </div>
            <div>
              <label className="text-[10px] font-bold text-stone-700 uppercase tracking-wide block mb-1.5">Recipient Email Address *</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-4 h-4 text-stone-400" />
                <input
                  type="email"
                  required
                  value={customerDetails.email}
                  onChange={(e) => setCustomerDetails({ ...customerDetails, email: e.target.value })}
                  placeholder="e.g. rahul@example.com"
                  className="w-full h-11 pl-10 pr-3 bg-white border border-[#eeddb9] rounded-xl focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>
      );

    case 2:
      return (
        <div className="flex flex-col gap-4 font-jakarta text-xs text-[#3E2C1C] animate-fade-in">
          <p className="text-stone-500 mb-2 leading-relaxed">
            Enter the address details where you'd like your traditionally crafted natural goods delivered.
          </p>
          <div>
            <label className="text-[10px] font-bold text-stone-700 uppercase tracking-wide block mb-1.5">Delivery Street Address *</label>
            <textarea
              required
              rows={3}
              value={shippingAddress.address}
              onChange={(e) => setShippingAddress({ ...shippingAddress, address: e.target.value })}
              placeholder="House/Flat number, building name, apartment block, street name"
              className="w-full px-3 py-2.5 bg-white border border-[#eeddb9] rounded-xl focus:outline-none resize-none"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-[10px] font-bold text-stone-700 uppercase tracking-wide block mb-1.5">City *</label>
              <input
                type="text"
                required
                value={shippingAddress.city}
                onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                placeholder="e.g. Bengaluru"
                className="w-full h-11 px-3 bg-white border border-[#eeddb9] rounded-xl focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-stone-700 uppercase tracking-wide block mb-1.5">State *</label>
              <input
                type="text"
                required
                value={shippingAddress.state}
                onChange={(e) => setShippingAddress({ ...shippingAddress, state: e.target.value })}
                placeholder="e.g. Karnataka"
                className="w-full h-11 px-3 bg-white border border-[#eeddb9] rounded-xl focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-stone-700 uppercase tracking-wide block mb-1.5">Pincode *</label>
              <input
                type="text"
                required
                maxLength={6}
                value={shippingAddress.pincode}
                onChange={(e) => setShippingAddress({ ...shippingAddress, pincode: e.target.value })}
                placeholder="e.g. 560001"
                className="w-full h-11 px-3 bg-white border border-[#eeddb9] rounded-xl focus:outline-none"
              />
            </div>
          </div>
        </div>
      );

    case 3:
      return (
        <div className="flex flex-col gap-4 font-jakarta text-xs text-[#3E2C1C] animate-fade-in">
          <p className="text-stone-500 mb-2 leading-relaxed">
            Select whether your billing statements should be sent to the same shipping destination, or enter a separate billing address.
          </p>
          
          <label className="flex items-center gap-3 bg-[#FAF4E6] p-4 border border-[#eeddb9]/50 rounded-xl cursor-pointer select-none">
            <input 
              type="checkbox"
              checked={sameAsShipping}
              onChange={(e) => setSameAsShipping(e.target.checked)}
              className="w-4 h-4 rounded text-[#384401] focus:ring-[#384401]"
            />
            <div>
              <span className="font-bold text-[#1a110a] block">Billing address same as Shipping Address</span>
              <span className="text-stone-555 text-[10px]">Statements will default to your delivery destination</span>
            </div>
          </label>

          {!sameAsShipping && (
            <div className="mt-4 flex flex-col gap-4 animate-scale-up">
              <h3 className="font-bold text-stone-900 border-b border-stone-150 pb-1.5">Billing Address Details</h3>
              <div>
                <label className="text-[10px] font-bold text-stone-700 uppercase tracking-wide block mb-1.5">Billing Address *</label>
                <textarea
                  required={!sameAsShipping}
                  rows={3}
                  value={billingAddress.address}
                  onChange={(e) => setBillingAddress({ ...billingAddress, address: e.target.value })}
                  placeholder="Billing building name, street address details"
                  className="w-full px-3 py-2.5 bg-white border border-[#eeddb9] rounded-xl focus:outline-none resize-none"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-stone-700 uppercase tracking-wide block mb-1.5">City *</label>
                  <input
                    type="text"
                    required={!sameAsShipping}
                    value={billingAddress.city}
                    onChange={(e) => setBillingAddress({ ...billingAddress, city: e.target.value })}
                    placeholder="e.g. Bengaluru"
                    className="w-full h-11 px-3 bg-white border border-[#eeddb9] rounded-xl focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-stone-700 uppercase tracking-wide block mb-1.5">State *</label>
                  <input
                    type="text"
                    required={!sameAsShipping}
                    value={billingAddress.state}
                    onChange={(e) => setBillingAddress({ ...billingAddress, state: e.target.value })}
                    placeholder="e.g. Karnataka"
                    className="w-full h-11 px-3 bg-white border border-[#eeddb9] rounded-xl focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-stone-700 uppercase tracking-wide block mb-1.5">Pincode *</label>
                  <input
                    type="text"
                    required={!sameAsShipping}
                    maxLength={6}
                    value={billingAddress.pincode}
                    onChange={(e) => setBillingAddress({ ...billingAddress, pincode: e.target.value })}
                    placeholder="e.g. 560001"
                    className="w-full h-11 px-3 bg-white border border-[#eeddb9] rounded-xl focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      );

    case 4:
      return (
        <div className="flex flex-col gap-4 font-jakarta text-xs text-[#3E2C1C] animate-fade-in">
          <p className="text-stone-500 mb-2 leading-relaxed">
            Choose standard shipping methods or upgraded premium air freight delivery.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Standard Option */}
            <label className={`border rounded-[20px] p-5 cursor-pointer flex flex-col gap-3 transition-all relative ${
              deliveryMethod === 'standard' 
                ? 'border-[#384401] bg-[#fafbf2] shadow-sm' 
                : 'border-[#eeddb9]/60 bg-white hover:border-[#eeddb9]'
            }`}>
              <input 
                type="radio" 
                name="delivery_speed" 
                checked={deliveryMethod === 'standard'}
                onChange={() => setDeliveryMethod('standard')}
                className="absolute top-4 right-4 w-4 h-4 text-[#384401] focus:ring-[#384401]" 
              />
              <div className="flex items-center gap-2 text-[#384401]">
                <Truck className="w-5 h-5" />
                <span className="font-extrabold text-sm">Standard Delivery</span>
              </div>
              <div>
                <p className="text-[11px] text-stone-600 leading-normal">
                  Packages are dispatched via surface transport to minimize carbon footprint. 
                </p>
                <p className="text-xs font-bold text-stone-900 mt-2">
                  Estimated Duration: <span className="text-[#C56C4F]">3 - 5 business days</span>
                </p>
              </div>
              <div className="border-t border-dashed border-[#eeddb9]/70 pt-2 flex justify-between items-center text-xs">
                <span className="text-stone-500 font-semibold">Delivery Fee</span>
                <span className="font-bold text-stone-900">
                  {baseShippingFee === 0 ? 'FREE' : `₹${baseShippingFee}`}
                </span>
              </div>
            </label>

            {/* Express Option */}
            <label className={`border rounded-[20px] p-5 cursor-pointer flex flex-col gap-3 transition-all relative ${
              deliveryMethod === 'express' 
                ? 'border-[#384401] bg-[#fafbf2] shadow-sm' 
                : 'border-[#eeddb9]/60 bg-white hover:border-[#eeddb9]'
            }`}>
              <input 
                type="radio" 
                name="delivery_speed" 
                checked={deliveryMethod === 'express'}
                onChange={() => setDeliveryMethod('express')}
                className="absolute top-4 right-4 w-4 h-4 text-[#384401] focus:ring-[#384401]" 
              />
              <div className="flex items-center gap-2 text-[#384401]">
                <div className="flex items-center gap-1">
                  <Truck className="w-5 h-5" />
                  <Sparkles className="w-3.5 h-3.5 fill-[#C56C4F] text-[#C56C4F] animate-pulse" />
                </div>
                <span className="font-extrabold text-sm">Express Priority</span>
              </div>
              <div>
                <p className="text-[11px] text-stone-600 leading-normal">
                  Priority dispatch handling. Routed through fastest premium courier services.
                </p>
                <p className="text-xs font-bold text-stone-900 mt-2">
                  Estimated Duration: <span className="text-[#C56C4F]">1 - 2 business days</span>
                </p>
              </div>
              <div className="border-t border-dashed border-[#eeddb9]/70 pt-2 flex justify-between items-center text-xs">
                <span className="text-stone-500 font-semibold">Delivery Fee</span>
                <span className="font-bold text-stone-900">
                  ₹{baseShippingFee + 100}
                </span>
              </div>
            </label>
          </div>
        </div>
      );

    case 5:
      return (
        <div className="flex flex-col gap-4 font-jakarta text-xs text-[#3E2C1C] animate-fade-in">
          <p className="text-stone-500 mb-2 leading-relaxed">
            Select your preferred payment channel. Transactions are securely routed with end-to-end 256-bit encryption.
          </p>

          <div className="flex flex-col gap-3">
            {/* UPI Option */}
            <label className={`border rounded-[16px] p-4 cursor-pointer flex items-center justify-between transition-all ${
              paymentMethod === 'upi' ? 'border-[#384401] bg-[#fafbf2]' : 'border-[#eeddb9]/50 bg-white hover:border-[#eeddb9]'
            }`}>
              <div className="flex items-center gap-3">
                <input 
                  type="radio" 
                  name="payment_choice"
                  checked={paymentMethod === 'upi'}
                  onChange={() => setPaymentMethod('upi')}
                  className="w-4 h-4 text-[#384401]" 
                />
                <div className="flex items-center gap-2">
                  <span className="p-2 bg-purple-50 text-purple-700 rounded-lg"><Wallet className="w-4 h-4" /></span>
                  <div>
                    <span className="font-extrabold text-stone-950 block text-[13px]">UPI / Instant Transfer</span>
                    <span className="text-[10px] text-stone-500">Google Pay, PhonePe, Paytm, BHIM</span>
                  </div>
                </div>
              </div>
              <span className="text-[10px] font-bold text-purple-700 bg-purple-100/50 px-2 py-0.5 rounded-full">POPULAR</span>
            </label>

            {/* Card Option */}
            <label className={`border rounded-[16px] p-4 cursor-pointer flex items-center justify-between transition-all ${
              paymentMethod === 'card' ? 'border-[#384401] bg-[#fafbf2]' : 'border-[#eeddb9]/50 bg-white hover:border-[#eeddb9]'
            }`}>
              <div className="flex items-center gap-3">
                <input 
                  type="radio" 
                  name="payment_choice"
                  checked={paymentMethod === 'card'}
                  onChange={() => setPaymentMethod('card')}
                  className="w-4 h-4 text-[#384401]" 
                />
                <div className="flex items-center gap-2">
                  <span className="p-2 bg-blue-50 text-blue-700 rounded-lg"><CreditCard className="w-4 h-4" /></span>
                  <div>
                    <span className="font-extrabold text-stone-950 block text-[13px]">Credit / Debit Card</span>
                    <span className="text-[10px] text-stone-500">Visa, Mastercard, RuPay, Maestro</span>
                  </div>
                </div>
              </div>
              <span className="text-[10px] font-bold text-[#384401] bg-green-50 px-2 py-0.5 rounded-full">SECURE</span>
            </label>

            {/* Netbanking */}
            <label className={`border rounded-[16px] p-4 cursor-pointer flex items-center justify-between transition-all ${
              paymentMethod === 'netbanking' ? 'border-[#384401] bg-[#fafbf2]' : 'border-[#eeddb9]/50 bg-white hover:border-[#eeddb9]'
            }`}>
              <div className="flex items-center gap-3">
                <input 
                  type="radio" 
                  name="payment_choice"
                  checked={paymentMethod === 'netbanking'}
                  onChange={() => setPaymentMethod('netbanking')}
                  className="w-4 h-4 text-[#384401]" 
                />
                <div className="flex items-center gap-2">
                  <span className="p-2 bg-orange-50 text-orange-700 rounded-lg"><Landmark className="w-4 h-4" /></span>
                  <div>
                    <span className="font-extrabold text-stone-950 block text-[13px]">Net Banking</span>
                    <span className="text-[10px] text-stone-500">All major Indian banks supported</span>
                  </div>
                </div>
              </div>
            </label>

            {/* Cash on Delivery */}
            <label className={`border rounded-[16px] p-4 cursor-pointer flex items-center justify-between transition-all ${
              paymentMethod === 'cod' ? 'border-[#384401] bg-[#fafbf2]' : 'border-[#eeddb9]/50 bg-white hover:border-[#eeddb9]'
            }`}>
              <div className="flex items-center gap-3">
                <input 
                  type="radio" 
                  name="payment_choice"
                  checked={paymentMethod === 'cod'}
                  onChange={() => setPaymentMethod('cod')}
                  className="w-4 h-4 text-[#384401]" 
                />
                <div className="flex items-center gap-2">
                  <span className="p-2 bg-[#FAF4E6] text-[#C56C4F] rounded-lg"><ShoppingBag className="w-4 h-4" /></span>
                  <div>
                    <span className="font-extrabold text-stone-950 block text-[13px]">Cash on Delivery (COD)</span>
                    <span className="text-[10px] text-stone-550">Pay cash/UPI directly during drop-off</span>
                  </div>
                </div>
              </div>
              <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">+ ₹15 handling</span>
            </label>
          </div>
        </div>
      );

    case 6:
      return (
        <div className="flex flex-col gap-5 font-jakarta text-xs text-[#3E2C1C] animate-fade-in">
          <p className="text-stone-500 mb-1 leading-relaxed">
            Please look over your checkout details and totals before confirming placement.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Summary Blocks */}
            <div className="bg-[#FAF4E6]/50 border border-[#eeddb9]/40 p-4 rounded-2xl flex flex-col gap-2.5">
              <span className="text-[10px] font-bold text-[#C56C4F] uppercase tracking-wide">Recipient Details</span>
              <div>
                <p className="font-extrabold text-stone-950 text-sm">{customerDetails.name}</p>
                <p className="text-stone-600 mt-1">Phone: {customerDetails.phone}</p>
                <p className="text-stone-600">Email: {customerDetails.email}</p>
              </div>
            </div>

            <div className="bg-[#FAF4E6]/50 border border-[#eeddb9]/40 p-4 rounded-2xl flex flex-col gap-2.5">
              <span className="text-[10px] font-bold text-[#C56C4F] uppercase tracking-wide">Shipping Location</span>
              <div>
                <p className="font-extrabold text-stone-950 text-sm">{shippingAddress.city}, {shippingAddress.state}</p>
                <p className="text-stone-600 mt-1 leading-relaxed">{shippingAddress.address}</p>
                <p className="text-stone-600 font-semibold mt-1">Pincode: {shippingAddress.pincode}</p>
              </div>
            </div>

            <div className="bg-[#FAF4E6]/50 border border-[#eeddb9]/40 p-4 rounded-2xl flex flex-col gap-2.5">
              <span className="text-[10px] font-bold text-[#C56C4F] uppercase tracking-wide">Billing Location</span>
              <div>
                {sameAsShipping ? (
                  <p className="text-stone-600 italic">Same as Shipping address destination.</p>
                ) : (
                  <>
                    <p className="font-extrabold text-stone-950 text-sm">{billingAddress.city}, {billingAddress.state}</p>
                    <p className="text-stone-600 mt-1 leading-relaxed">{billingAddress.address}</p>
                    <p className="text-stone-600 font-semibold mt-1">Pincode: {billingAddress.pincode}</p>
                  </>
                )}
              </div>
            </div>

            <div className="bg-[#FAF4E6]/50 border border-[#eeddb9]/40 p-4 rounded-2xl flex flex-col gap-2.5">
              <span className="text-[10px] font-bold text-[#C56C4F] uppercase tracking-wide">Delivery & Payment</span>
              <div className="flex flex-col gap-1">
                <p className="text-stone-700">
                  <strong>Speed:</strong> {deliveryMethod === 'express' ? 'Express Priority (1-2 days)' : 'Standard Surface (3-5 days)'}
                </p>
                <p className="text-stone-700">
                  <strong>Method:</strong> {
                    paymentMethod === 'upi' && 'UPI/Instant Transfer'
                  }{
                    paymentMethod === 'card' && 'Credit/Debit Card'
                  }{
                    paymentMethod === 'netbanking' && 'Net Banking'
                  }{
                    paymentMethod === 'cod' && 'Cash on Delivery (COD)'
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Brief Items Summary list inside Step 6 */}
          <div className="border border-stone-100 rounded-xl overflow-hidden mt-2">
            <div className="bg-stone-50 px-4 py-2 border-b border-stone-100 font-bold text-[10px] text-stone-500 uppercase tracking-wide">
              Items In Shipment
            </div>
            <div className="divide-y divide-stone-100">
              {cart.map((item) => (
                <div key={`${item.id}-${item.weight}`} className="p-3 flex justify-between items-center text-xs">
                  <div className="flex flex-col">
                    <span className="font-bold text-stone-900">{item.name}</span>
                    <span className="text-[10px] text-stone-500">Size: {item.weight} | Qty: {item.quantity}</span>
                  </div>
                  <span className="font-bold text-stone-950">₹{item.price * item.quantity}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      );

    default:
      return null;
  }
}
