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
  validationErrors: string[];
  onClearError: (field: string) => void;
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
  cart,
  validationErrors,
  onClearError
}: CheckoutStepsProps) {

  const getInputStyles = (field: string, hasIcon: boolean) => {
    const hasError = validationErrors.includes(field);
    const borderClass = hasError 
      ? "border-red-500 bg-red-50/10 focus:border-red-600 focus:ring-red-600/10" 
      : "border-[#eeddb9] hover:border-[#d0b88c] bg-white focus:border-[#384401] focus:ring-[#384401]/10";
    
    return `w-full h-12 ${hasIcon ? 'pl-10' : 'px-4'} pr-4 rounded-xl focus:outline-none focus:ring-2 text-stone-900 text-sm font-semibold transition-all placeholder:text-stone-450 border ${borderClass}`;
  };

  const getTextareaStyles = (field: string) => {
    const hasError = validationErrors.includes(field);
    const borderClass = hasError 
      ? "border-red-500 bg-red-50/10 focus:border-red-600 focus:ring-red-600/10" 
      : "border-[#eeddb9] hover:border-[#d0b88c] bg-white focus:border-[#384401] focus:ring-[#384401]/10";
    
    return `w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 text-stone-900 text-sm font-semibold transition-all resize-none placeholder:text-stone-450 border ${borderClass}`;
  };

  const labelStyles = "text-xs sm:text-sm font-extrabold text-[#3E2C1C] uppercase tracking-wide block mb-2";

  switch (activeSubStep) {
    case 1:
      return (
        <div className="flex flex-col gap-5 font-jakarta text-sm text-[#3E2C1C] animate-fade-in">
          <p className="text-stone-700 font-semibold mb-2 leading-relaxed">
            Provide contact information so we can dispatch shipping confirmations and text message delivery updates.
          </p>
          <div>
            <label className={labelStyles}>Recipient Full Name *</label>
            <div className="relative">
              <User className="absolute left-3.5 top-3.5 w-5 h-5 text-stone-600" />
              <input
                type="text"
                required
                value={customerDetails.name}
                onChange={(e) => {
                  setCustomerDetails({ ...customerDetails, name: e.target.value });
                  onClearError('name');
                }}
                placeholder="e.g. Rahul Sharma"
                className={getInputStyles('name', true)}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelStyles}>Recipient Phone *</label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-3.5 w-5 h-5 text-stone-600" />
                <input
                  type="tel"
                  required
                  value={customerDetails.phone}
                  onChange={(e) => {
                    setCustomerDetails({ ...customerDetails, phone: e.target.value });
                    onClearError('phone');
                  }}
                  placeholder="e.g. 9876543210"
                  className={getInputStyles('phone', true)}
                />
              </div>
            </div>
            <div>
              <label className={labelStyles}>Recipient Email Address *</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 w-5 h-5 text-stone-600" />
                <input
                  type="email"
                  required
                  value={customerDetails.email}
                  onChange={(e) => {
                    setCustomerDetails({ ...customerDetails, email: e.target.value });
                    onClearError('email');
                  }}
                  placeholder="e.g. rahul@example.com"
                  className={getInputStyles('email', true)}
                />
              </div>
            </div>
          </div>
        </div>
      );

    case 2:
      return (
        <div className="flex flex-col gap-5 font-jakarta text-sm text-[#3E2C1C] animate-fade-in">
          <p className="text-stone-700 font-semibold mb-2 leading-relaxed">
            Enter the address details where you'd like your traditionally crafted natural goods delivered.
          </p>
          <div>
            <label className={labelStyles}>Delivery Street Address *</label>
            <textarea
              required
              rows={3}
              value={shippingAddress.address}
              onChange={(e) => {
                setShippingAddress({ ...shippingAddress, address: e.target.value });
                onClearError('shipping_address');
              }}
              placeholder="House/Flat number, building name, apartment block, street name"
              className={getTextareaStyles('shipping_address')}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className={labelStyles}>City *</label>
              <input
                type="text"
                required
                value={shippingAddress.city}
                onChange={(e) => {
                  setShippingAddress({ ...shippingAddress, city: e.target.value });
                  onClearError('shipping_city');
                }}
                placeholder="e.g. Bengaluru"
                className={getInputStyles('shipping_city', false)}
              />
            </div>
            <div>
              <label className={labelStyles}>State *</label>
              <input
                type="text"
                required
                value={shippingAddress.state}
                onChange={(e) => {
                  setShippingAddress({ ...shippingAddress, state: e.target.value });
                  onClearError('shipping_state');
                }}
                placeholder="e.g. Karnataka"
                className={getInputStyles('shipping_state', false)}
              />
            </div>
            <div>
              <label className={labelStyles}>Pincode *</label>
              <input
                type="text"
                required
                value={shippingAddress.pincode}
                onChange={(e) => {
                  setShippingAddress({ ...shippingAddress, pincode: e.target.value });
                  onClearError('shipping_pincode');
                }}
                placeholder="e.g. 560001"
                className={getInputStyles('shipping_pincode', false)}
              />
            </div>
          </div>
        </div>
      );

    case 3:
      return (
        <div className="flex flex-col gap-5 font-jakarta text-sm text-[#3E2C1C] animate-fade-in">
          <p className="text-stone-700 font-semibold mb-2 leading-relaxed">
            Select whether your billing statements should be sent to the same shipping destination, or enter a separate billing address.
          </p>
          
          <label className="flex items-center gap-3 bg-[#FAF4E6] p-4 border border-[#eeddb9] hover:border-[#d0b88c] rounded-xl cursor-pointer select-none transition-all">
            <input 
              type="checkbox"
              checked={sameAsShipping}
              onChange={(e) => setSameAsShipping(e.target.checked)}
              className="w-5 h-5 rounded text-[#384401] focus:ring-[#384401] border-stone-300"
            />
            <div>
              <span className="font-extrabold text-[#3E2C1C] block text-sm sm:text-base">Billing address same as Shipping Address</span>
              <span className="text-stone-600 font-semibold text-xs mt-0.5 block">Statements will default to your delivery destination</span>
            </div>
          </label>

          {!sameAsShipping && (
            <div className="mt-4 flex flex-col gap-5 animate-scale-up">
              <h3 className="font-extrabold text-[#3E2C1C] text-base border-b border-[#eeddb9]/50 pb-2">Billing Address Details</h3>
              <div>
                <label className={labelStyles}>Billing Address *</label>
                <textarea
                  required={!sameAsShipping}
                  rows={3}
                  value={billingAddress.address}
                  onChange={(e) => {
                    setBillingAddress({ ...billingAddress, address: e.target.value });
                    onClearError('billing_address');
                  }}
                  placeholder="Billing building name, street address details"
                  className={getTextareaStyles('billing_address')}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className={labelStyles}>City *</label>
                  <input
                    type="text"
                    required={!sameAsShipping}
                    value={billingAddress.city}
                    onChange={(e) => {
                      setBillingAddress({ ...billingAddress, city: e.target.value });
                      onClearError('billing_city');
                    }}
                    placeholder="e.g. Bengaluru"
                    className={getInputStyles('billing_city', false)}
                  />
                </div>
                <div>
                  <label className={labelStyles}>State *</label>
                  <input
                    type="text"
                    required={!sameAsShipping}
                    value={billingAddress.state}
                    onChange={(e) => {
                      setBillingAddress({ ...billingAddress, state: e.target.value });
                      onClearError('billing_state');
                    }}
                    placeholder="e.g. Karnataka"
                    className={getInputStyles('billing_state', false)}
                  />
                </div>
                <div>
                  <label className={labelStyles}>Pincode *</label>
                  <input
                    type="text"
                    required={!sameAsShipping}
                    maxLength={6}
                    value={billingAddress.pincode}
                    onChange={(e) => {
                      setBillingAddress({ ...billingAddress, pincode: e.target.value });
                      onClearError('billing_pincode');
                    }}
                    placeholder="e.g. 560001"
                    className={getInputStyles('billing_pincode', false)}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      );

    case 4:
      return (
        <div className="flex flex-col gap-5 font-jakarta text-sm text-[#3E2C1C] animate-fade-in">
          <p className="text-stone-700 font-semibold mb-2 leading-relaxed">
            Choose standard shipping methods or upgraded premium air freight delivery.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Standard Option */}
            <label className={`border rounded-[20px] p-5 cursor-pointer flex flex-col gap-3 transition-all relative ${
              deliveryMethod === 'standard' 
                ? 'border-[#384401] bg-[#fafbf2] shadow-md ring-2 ring-[#384401]/10' 
                : 'border-[#eeddb9] bg-white hover:border-[#d0b88c] hover:shadow-xs'
            }`}>
              <input 
                type="radio" 
                name="delivery_speed" 
                checked={deliveryMethod === 'standard'}
                onChange={() => setDeliveryMethod('standard')}
                className="absolute top-5 right-5 w-5 h-5 text-[#384401] focus:ring-[#384401]" 
              />
              <div className="flex items-center gap-2 text-[#384401]">
                <Truck className="w-6 h-6" />
                <span className="font-black text-base">Standard Delivery</span>
              </div>
              <div>
                <p className="text-xs text-stone-700 font-semibold leading-relaxed">
                  Packages are dispatched via surface transport to minimize carbon footprint. 
                </p>
                <p className="text-xs font-extrabold text-stone-900 mt-2">
                  Estimated Duration: <span className="text-[#C56C4F] text-sm">3 - 5 business days</span>
                </p>
              </div>
              <div className="border-t border-dashed border-[#eeddb9] pt-3 flex justify-between items-center text-xs sm:text-sm">
                <span className="text-stone-600 font-bold">Delivery Fee</span>
                <span className="font-black text-[#384401]">
                  {baseShippingFee === 0 ? 'FREE' : `₹${baseShippingFee}`}
                </span>
              </div>
            </label>

            {/* Express Option */}
            <label className={`border rounded-[20px] p-5 cursor-pointer flex flex-col gap-3 transition-all relative ${
              deliveryMethod === 'express' 
                ? 'border-[#384401] bg-[#fafbf2] shadow-md ring-2 ring-[#384401]/10' 
                : 'border-[#eeddb9] bg-white hover:border-[#d0b88c] hover:shadow-xs'
            }`}>
              <input 
                type="radio" 
                name="delivery_speed" 
                checked={deliveryMethod === 'express'}
                onChange={() => setDeliveryMethod('express')}
                className="absolute top-5 right-5 w-5 h-5 text-[#384401] focus:ring-[#384401]" 
              />
              <div className="flex items-center gap-2 text-[#384401]">
                <div className="flex items-center gap-1">
                  <Truck className="w-6 h-6" />
                  <Sparkles className="w-4 h-4 fill-[#C56C4F] text-[#C56C4F] animate-pulse" />
                </div>
                <span className="font-black text-base">Express Priority</span>
              </div>
              <div>
                <p className="text-xs text-stone-700 font-semibold leading-relaxed">
                  Priority dispatch handling. Routed through fastest premium courier services.
                </p>
                <p className="text-xs font-extrabold text-stone-900 mt-2">
                  Estimated Duration: <span className="text-[#C56C4F] text-sm">1 - 2 business days</span>
                </p>
              </div>
              <div className="border-t border-dashed border-[#eeddb9] pt-3 flex justify-between items-center text-xs sm:text-sm">
                <span className="text-stone-600 font-bold">Delivery Fee</span>
                <span className="font-black text-[#384401]">
                  ₹{baseShippingFee + 100}
                </span>
              </div>
            </label>
          </div>
        </div>
      );

    case 5:
      return (
        <div className="flex flex-col gap-5 font-jakarta text-sm text-[#3E2C1C] animate-fade-in">
          <p className="text-stone-700 font-semibold mb-2 leading-relaxed">
            Select your preferred payment channel. Transactions are securely routed with end-to-end 256-bit encryption.
          </p>

          <div className="flex flex-col gap-3">
            {/* UPI Option */}
            <label className={`border rounded-[16px] p-4 cursor-pointer flex items-center justify-between transition-all ${
              paymentMethod === 'upi' ? 'border-[#384401] bg-[#fafbf2] shadow-sm' : 'border-[#eeddb9] bg-white hover:border-[#d0b88c]'
            }`}>
              <div className="flex items-center gap-3">
                <input 
                  type="radio" 
                  name="payment_choice"
                  checked={paymentMethod === 'upi'}
                  onChange={() => setPaymentMethod('upi')}
                  className="w-5 h-5 text-[#384401]" 
                />
                <div className="flex items-center gap-3">
                  <span className="p-2 bg-purple-100 text-purple-800 rounded-lg"><Wallet className="w-5 h-5" /></span>
                  <div>
                    <span className="font-black text-stone-950 block text-sm sm:text-base">UPI / Instant Transfer</span>
                    <span className="text-xs text-stone-600 font-bold">Google Pay, PhonePe, Paytm, BHIM</span>
                  </div>
                </div>
              </div>
              <span className="text-[11px] font-black text-purple-800 bg-purple-100 px-3 py-1 rounded-full">POPULAR</span>
            </label>

            {/* Card Option */}
            <label className={`border rounded-[16px] p-4 cursor-pointer flex items-center justify-between transition-all ${
              paymentMethod === 'card' ? 'border-[#384401] bg-[#fafbf2] shadow-sm' : 'border-[#eeddb9] bg-white hover:border-[#d0b88c]'
            }`}>
              <div className="flex items-center gap-3">
                <input 
                  type="radio" 
                  name="payment_choice"
                  checked={paymentMethod === 'card'}
                  onChange={() => setPaymentMethod('card')}
                  className="w-5 h-5 text-[#384401]" 
                />
                <div className="flex items-center gap-3">
                  <span className="p-2 bg-blue-100 text-blue-800 rounded-lg"><CreditCard className="w-5 h-5" /></span>
                  <div>
                    <span className="font-black text-stone-950 block text-sm sm:text-base">Credit / Debit Card</span>
                    <span className="text-xs text-stone-600 font-bold">Visa, Mastercard, RuPay, Maestro</span>
                  </div>
                </div>
              </div>
              <span className="text-[11px] font-black text-green-800 bg-green-100 px-3 py-1 rounded-full">SECURE</span>
            </label>

            {/* Netbanking */}
            <label className={`border rounded-[16px] p-4 cursor-pointer flex items-center justify-between transition-all ${
              paymentMethod === 'netbanking' ? 'border-[#384401] bg-[#fafbf2] shadow-sm' : 'border-[#eeddb9] bg-white hover:border-[#d0b88c]'
            }`}>
              <div className="flex items-center gap-3">
                <input 
                  type="radio" 
                  name="payment_choice"
                  checked={paymentMethod === 'netbanking'}
                  onChange={() => setPaymentMethod('netbanking')}
                  className="w-5 h-5 text-[#384401]" 
                />
                <div className="flex items-center gap-3">
                  <span className="p-2 bg-orange-100 text-orange-850 rounded-lg"><Landmark className="w-5 h-5" /></span>
                  <div>
                    <span className="font-black text-stone-950 block text-sm sm:text-base">Net Banking</span>
                    <span className="text-xs text-stone-600 font-bold">All major Indian banks supported</span>
                  </div>
                </div>
              </div>
            </label>

            {/* Cash on Delivery */}
            <label className={`border rounded-[16px] p-4 cursor-pointer flex items-center justify-between transition-all ${
              paymentMethod === 'cod' ? 'border-[#384401] bg-[#fafbf2] shadow-sm' : 'border-[#eeddb9] bg-white hover:border-[#d0b88c]'
            }`}>
              <div className="flex items-center gap-3">
                <input 
                  type="radio" 
                  name="payment_choice"
                  checked={paymentMethod === 'cod'}
                  onChange={() => setPaymentMethod('cod')}
                  className="w-5 h-5 text-[#384401]" 
                />
                <div className="flex items-center gap-3">
                  <span className="p-2 bg-[#FAF4E6] text-[#C56C4F] rounded-lg"><ShoppingBag className="w-5 h-5" /></span>
                  <div>
                    <span className="font-black text-stone-950 block text-sm sm:text-base">Cash on Delivery (COD)</span>
                    <span className="text-xs text-stone-600 font-bold">Pay cash/UPI directly during drop-off</span>
                  </div>
                </div>
              </div>
              <span className="text-[11px] font-black text-amber-800 bg-amber-100 px-3 py-1 rounded-full">+ ₹15 handling</span>
            </label>
          </div>
        </div>
      );

    case 6:
      return (
        <div className="flex flex-col gap-5 font-jakarta text-xs text-[#3E2C1C] animate-fade-in">
          <p className="text-stone-700 font-semibold mb-2 leading-relaxed">
            Please look over your checkout details and totals before confirming placement.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Summary Blocks */}
            <div className="bg-[#FAF4E6]/70 border border-[#eeddb9] p-4 rounded-2xl flex flex-col gap-2.5">
              <span className="text-xs font-bold text-[#C56C4F] uppercase tracking-wide">Recipient Details</span>
              <div>
                <p className="font-extrabold text-stone-950 text-base">{customerDetails.name}</p>
                <p className="text-stone-800 font-semibold mt-1">Phone: {customerDetails.phone}</p>
                <p className="text-stone-800 font-semibold">Email: {customerDetails.email}</p>
              </div>
            </div>

            <div className="bg-[#FAF4E6]/70 border border-[#eeddb9] p-4 rounded-2xl flex flex-col gap-2.5">
              <span className="text-xs font-bold text-[#C56C4F] uppercase tracking-wide">Shipping Location</span>
              <div>
                <p className="font-extrabold text-stone-950 text-base">{shippingAddress.city}, {shippingAddress.state}</p>
                <p className="text-stone-800 font-semibold mt-1 leading-relaxed">{shippingAddress.address}</p>
                <p className="text-stone-900 font-black mt-1">Pincode: {shippingAddress.pincode}</p>
              </div>
            </div>

            <div className="bg-[#FAF4E6]/70 border border-[#eeddb9] p-4 rounded-2xl flex flex-col gap-2.5">
              <span className="text-xs font-bold text-[#C56C4F] uppercase tracking-wide">Billing Location</span>
              <div>
                {sameAsShipping ? (
                  <p className="text-stone-700 font-bold italic">Same as Shipping address destination.</p>
                ) : (
                  <>
                    <p className="font-extrabold text-stone-950 text-base">{billingAddress.city}, {billingAddress.state}</p>
                    <p className="text-stone-800 font-semibold mt-1 leading-relaxed">{billingAddress.address}</p>
                    <p className="text-stone-900 font-black mt-1">Pincode: {billingAddress.pincode}</p>
                  </>
                )}
              </div>
            </div>

            <div className="bg-[#FAF4E6]/70 border border-[#eeddb9] p-4 rounded-2xl flex flex-col gap-2.5">
              <span className="text-xs font-bold text-[#C56C4F] uppercase tracking-wide">Delivery & Payment</span>
              <div className="flex flex-col gap-1.5 mt-1 font-semibold text-stone-800">
                <p>
                  <strong>Speed:</strong> {deliveryMethod === 'express' ? 'Express Priority (1-2 days)' : 'Standard Surface (3-5 days)'}
                </p>
                <p>
                  <strong>Method:</strong> {
                    paymentMethod === 'upi' && 'UPI / Instant Transfer'
                  }{
                    paymentMethod === 'card' && 'Credit / Debit Card'
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
          <div className="border border-[#eeddb9] rounded-xl overflow-hidden mt-2 bg-white">
            <div className="bg-[#FAF4E6] px-4 py-2.5 border-b border-[#eeddb9] font-black text-xs text-[#3E2C1C] uppercase tracking-wide">
              Items In Shipment
            </div>
            <div className="divide-y divide-stone-100">
              {cart.map((item) => (
                <div key={`${item.id}-${item.weight}`} className="p-3.5 flex justify-between items-center text-sm font-semibold">
                  <div className="flex flex-col">
                    <span className="font-extrabold text-stone-900">{item.name}</span>
                    <span className="text-xs text-stone-600 font-medium mt-0.5">Size: {item.weight} | Qty: {item.quantity}</span>
                  </div>
                  <span className="font-extrabold text-stone-950">₹{item.price * item.quantity}</span>
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
