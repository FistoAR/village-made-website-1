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
      ? "border-red-500 bg-red-50/10 focus:border-red-600 focus:ring-red-650/10" 
      : "border-[#eeddb9] hover:border-[#C56C4F]/60 bg-white focus:border-[#384401] focus:ring-4 focus:ring-[#384401]/10 focus:shadow-md";
    
    return `w-full h-12 ${hasIcon ? 'pl-10' : 'px-4'} pr-4 rounded-xl focus:outline-none text-stone-900 text-sm font-semibold transition-all placeholder:text-stone-400 shadow-xs border ${borderClass}`;
  };

  const getTextareaStyles = (field: string) => {
    const hasError = validationErrors.includes(field);
    const borderClass = hasError 
      ? "border-red-500 bg-red-50/10 focus:border-red-600 focus:ring-red-650/10" 
      : "border-[#eeddb9] hover:border-[#C56C4F]/60 bg-white focus:border-[#384401] focus:ring-4 focus:ring-[#384401]/10 focus:shadow-md";
    
    return `w-full px-4 py-3 rounded-xl focus:outline-none text-stone-900 text-sm font-semibold transition-all resize-none placeholder:text-stone-400 shadow-xs border ${borderClass}`;
  };

  const labelStyles = "text-xs sm:text-sm font-extrabold text-[#3E2C1C] uppercase tracking-wide block mb-2";

  switch (activeSubStep) {
    case 1:
      return (
        <div className="flex flex-col gap-5 font-jakarta text-sm text-[#3E2C1C] animate-fade-in">
          <p className="text-stone-600 font-semibold mb-2 leading-relaxed">
            Provide contact information so we can dispatch shipping confirmations and text message delivery updates.
          </p>
          <div>
            <label className={labelStyles}>Recipient Full Name <span className="text-red-500">*</span></label>
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
              <label className={labelStyles}>Recipient Phone <span className="text-red-500">*</span></label>
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
              <label className={labelStyles}>Recipient Email Address <span className="text-red-500">*</span></label>
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
        <div className="flex flex-col gap-6 font-jakarta text-sm text-[#3E2C1C] animate-fade-in">
          {/* Shipping section */}
          <div className="flex flex-col gap-4">
            <h3 className="font-extrabold text-[#3E2C1C] text-sm sm:text-base border-b border-[#eeddb9]/50 pb-2">1. Shipping Address</h3>
            <div>
              <label className={labelStyles}>Delivery Street Address <span className="text-red-500">*</span></label>
              <textarea
                required
                rows={2}
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
                <label className={labelStyles}>City <span className="text-red-500">*</span></label>
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
                <label className={labelStyles}>State <span className="text-red-500">*</span></label>
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
                <label className={labelStyles}>Pincode <span className="text-red-500">*</span></label>
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

          {/* Billing section */}
          <div className="flex flex-col gap-4 mt-2">
            <h3 className="font-extrabold text-[#3E2C1C] text-sm sm:text-base border-b border-[#eeddb9]/50 pb-2">2. Billing Details</h3>
            <label className="flex items-center gap-3 bg-[#FAF4E6] p-3.5 border border-[#eeddb9] hover:border-[#d0b88c] rounded-xl cursor-pointer select-none transition-all">
              <input 
                type="checkbox"
                checked={sameAsShipping}
                onChange={(e) => setSameAsShipping(e.target.checked)}
                className="w-5 h-5 rounded text-[#384401] focus:ring-[#384401] border-stone-300 animate-scale-up"
              />
              <div>
                <span className="font-extrabold text-[#3E2C1C] block text-sm sm:text-base">Billing address same as Shipping Address</span>
                <span className="text-stone-600 font-semibold text-xs mt-0.5 block">Statements will default to your delivery destination</span>
              </div>
            </label>

            {!sameAsShipping && (
              <div className="flex flex-col gap-4 animate-scale-up mt-2">
                <div>
                  <label className={labelStyles}>Billing Address <span className="text-red-500">*</span></label>
                  <textarea
                    required={!sameAsShipping}
                    rows={2}
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
                    <label className={labelStyles}>City <span className="text-red-500">*</span></label>
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
                    <label className={labelStyles}>State <span className="text-red-500">*</span></label>
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
                    <label className={labelStyles}>Pincode <span className="text-red-500">*</span></label>
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
        </div>
      );

    case 3:
      return (
        <div className="flex flex-col gap-6 font-jakarta text-sm text-[#3E2C1C] animate-fade-in">
          <p className="text-stone-600 font-semibold mb-2 leading-relaxed">
            Please look over your checkout details and totals before confirming placement.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Recipient details */}
            <div className="bg-gradient-to-br from-[#fdfcf9] to-white border border-[#eeddb9]/50 p-4.5 rounded-2xl flex flex-col gap-3 shadow-xs hover:shadow-sm transition-all duration-300 min-w-0">
              <div className="flex items-center gap-2 border-b border-stone-100 pb-2">
                <User className="w-4 h-4 text-[#C56C4F]" />
                <span className="text-[10px] font-black text-[#C56C4F] uppercase tracking-wider">Recipient Details</span>
              </div>
              <div className="text-sm space-y-1 min-w-0">
                <p className="font-black text-stone-950 text-base truncate">{customerDetails.name}</p>
                <p className="text-stone-750 font-semibold flex flex-wrap items-center gap-x-1.5"><span className="text-stone-400">Phone:</span> <span className="break-all">{customerDetails.phone}</span></p>
                <p className="text-stone-750 font-semibold flex flex-wrap items-center gap-x-1.5"><span className="text-stone-400">Email:</span> <span className="break-all">{customerDetails.email}</span></p>
              </div>
            </div>

            {/* Shipping location */}
            <div className="bg-gradient-to-br from-[#fdfcf9] to-white border border-[#eeddb9]/50 p-4.5 rounded-2xl flex flex-col gap-3 shadow-xs hover:shadow-sm transition-all duration-300 min-w-0">
              <div className="flex items-center gap-2 border-b border-stone-100 pb-2">
                <MapPin className="w-4 h-4 text-[#C56C4F]" />
                <span className="text-[10px] font-black text-[#C56C4F] uppercase tracking-wider">Shipping Location</span>
              </div>
              <div className="text-sm min-w-0">
                <p className="font-black text-stone-955 text-base truncate">{shippingAddress.city}, {shippingAddress.state}</p>
                <p className="text-stone-750 font-semibold mt-1.5 leading-relaxed break-words">{shippingAddress.address}</p>
                <p className="text-stone-900 font-black mt-2 bg-[#FAF4E6]/50 px-2.5 py-1 rounded-lg border border-[#eeddb9]/30 inline-block text-xs">Pincode: {shippingAddress.pincode}</p>
              </div>
            </div>

            {/* Billing location */}
            <div className="bg-gradient-to-br from-[#fdfcf9] to-white border border-[#eeddb9]/50 p-4.5 rounded-2xl flex flex-col gap-3 shadow-xs hover:shadow-sm transition-all duration-300 min-w-0">
              <div className="flex items-center gap-2 border-b border-stone-100 pb-2">
                <ClipboardCheck className="w-4 h-4 text-[#C56C4F]" />
                <span className="text-[10px] font-black text-[#C56C4F] uppercase tracking-wider">Billing Location</span>
              </div>
              <div className="text-sm flex-grow flex flex-col justify-center min-w-0">
                {sameAsShipping ? (
                  <p className="text-[#384401] bg-green-50/50 border border-green-200/50 p-3 rounded-xl font-bold italic text-center text-xs leading-relaxed">
                    Same as shipping destination.
                  </p>
                ) : (
                  <div className="min-w-0">
                    <p className="font-black text-stone-950 text-base truncate">{billingAddress.city}, {billingAddress.state}</p>
                    <p className="text-stone-750 font-semibold mt-1.5 leading-relaxed break-words">{billingAddress.address}</p>
                    <p className="text-stone-900 font-black mt-2 bg-[#FAF4E6]/50 px-2.5 py-1 rounded-lg border border-[#eeddb9]/30 inline-block text-xs">Pincode: {billingAddress.pincode}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Brief Items Summary list inside Step 3 */}
          <div className="border border-[#eeddb9]/45 rounded-2xl overflow-hidden mt-2 bg-white shadow-xs">
            <div className="bg-[#FAF4E6]/50 px-4 py-3 border-b border-[#eeddb9]/30 flex items-center gap-2 font-black text-xs text-[#3E2C1C] uppercase tracking-wide">
              <ShoppingBag className="w-4 h-4 text-[#C56C4F]" /> Items In Shipment
            </div>
            <div className="divide-y divide-stone-100">
              {cart.map((item) => (
                <div key={`${item.id}-${item.weight}`} className="p-4 flex items-center justify-between gap-4 text-sm font-semibold hover:bg-stone-50/50 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-lg overflow-hidden border border-[#eeddb9]/20 shrink-0 bg-stone-50">
                      <img 
                        src="https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=60&h=60" 
                        alt={item.name} 
                        className="w-full h-full object-cover" 
                      />
                    </div>
                    <div className="min-w-0">
                      <span className="font-extrabold text-stone-900 block truncate">{item.name}</span>
                      <span className="text-xs text-stone-500 font-medium block mt-0.5">Size: {item.weight} | Qty: {item.quantity}</span>
                    </div>
                  </div>
                  <span className="font-extrabold text-stone-950 shrink-0">₹{item.price * item.quantity}</span>
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
