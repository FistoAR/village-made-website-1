'use client';

import React from 'react';
import { User, Phone, Mail, MapPin, Truck, Sparkles, CreditCard, ClipboardCheck, Wallet, Landmark, ShoppingBag } from 'lucide-react';
import { CartItem, UserAddress } from '@/lib/context/AppContext';

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
  savedAddresses?: UserAddress[];
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
  onClearError,
  savedAddresses = []
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
              <label className={labelStyles}>Recipient Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 w-5 h-5 text-stone-600" />
                <input
                  type="email"
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
            
            {savedAddresses && savedAddresses.length > 0 && (
              <div className="mb-2">
                <span className="text-xs font-bold text-stone-600 uppercase tracking-wider block mb-2">Use Saved Address</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {savedAddresses.map((addr) => {
                    const isSelected = shippingAddress.address === addr.address && shippingAddress.pincode === addr.pincode;
                    return (
                      <div
                        key={addr.id}
                        onClick={() => {
                          setShippingAddress({
                            address: addr.address,
                            city: addr.city,
                            state: addr.state || 'Karnataka',
                            pincode: addr.pincode
                          });
                          setCustomerDetails({
                            ...customerDetails,
                            name: addr.name,
                            phone: addr.phone
                          });
                          onClearError('shipping_address');
                          onClearError('shipping_city');
                          onClearError('shipping_state');
                          onClearError('shipping_pincode');
                          onClearError('name');
                          onClearError('phone');
                        }}
                        className={`p-4 border rounded-xl cursor-pointer font-jakarta transition-all duration-200 relative ${
                          isSelected 
                            ? 'border-[#384401] bg-[#384401]/5 ring-2 ring-[#384401]/10 shadow-xs' 
                            : 'border-[#eeddb9]/60 hover:border-[#384401] bg-white hover:shadow-xs'
                        }`}
                      >
                        <div className="flex justify-between items-center mb-2.5">
                          {addr.isDefault ? (
                            <span className="inline-flex items-center gap-1 bg-[#384401]/10 text-[#384401] text-[9px] font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wider select-none">
                              Primary Address
                            </span>
                          ) : (
                            <span className="text-[9px] font-extrabold text-stone-400 uppercase tracking-wider select-none">Saved Address</span>
                          )}
                          {isSelected && (
                            <span className="bg-[#384401] text-white text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider select-none">Selected</span>
                          )}
                        </div>
                        <div className="grid grid-cols-1 gap-1 text-xs sm:text-sm leading-relaxed">
                          <p><span className="font-extrabold text-stone-700 min-w-[65px] inline-block select-none">Name:</span> <span className="ml-1 font-normal text-black">{addr.name}</span></p>
                          <p><span className="font-extrabold text-stone-700 min-w-[65px] inline-block select-none">Address:</span> <span className="ml-1 font-normal text-black">{addr.address}</span></p>
                          <p><span className="font-extrabold text-stone-700 min-w-[65px] inline-block select-none">City:</span> <span className="ml-1 font-normal text-black">{addr.city}</span></p>
                          <p><span className="font-extrabold text-stone-700 min-w-[65px] inline-block select-none">State:</span> <span className="ml-1 font-normal text-black">{addr.state || 'Karnataka'}</span></p>
                          <p><span className="font-extrabold text-stone-700 min-w-[65px] inline-block select-none">Pincode:</span> <span className="ml-1 font-normal text-black">{addr.pincode}</span></p>
                          <p className="mt-0.5"><span className="font-extrabold text-stone-700 min-w-[65px] inline-block select-none">Phone:</span> <span className="ml-1 font-normal text-black">{addr.phone}</span></p>
                        </div>

                      </div>
                    );
                  })}
                </div>
              </div>
            )}

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
        <div className="flex flex-col gap-3 font-jakarta text-sm text-[#3E2C1C] animate-fade-in">
          <p className="text-[#8B6A4E] font-semibold leading-relaxed text-sm mb-1">
            Please review your details carefully before placing your order.
          </p>

          {/* Recipient Details — Full Width */}
          <div className="border border-[#eeddb9] rounded-xl overflow-hidden bg-white">
            <div className="flex items-center gap-2 px-5 py-3 bg-[#FAF4E6] border-b border-[#eeddb9]">
              <User className="w-4 h-4 text-[#C56C4F]" />
              <span className="text-xs font-black text-[#C56C4F] uppercase tracking-widest">Recipient Details</span>
            </div>
            <div className="px-5 py-4 grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-[#eeddb9]/50">
              <div className="pb-4 sm:pb-0 sm:pr-6">
                <span className="text-xs font-black text-[#8B6A4E] uppercase tracking-wider block mb-1">Full Name</span>
                <span className="font-extrabold text-[#3E2C1C] text-base block">{customerDetails.name}</span>
              </div>
              <div className="py-4 sm:py-0 sm:px-6">
                <span className="text-xs font-black text-[#8B6A4E] uppercase tracking-wider block mb-1">Phone Number</span>
                <span className="font-bold text-[#3E2C1C] text-base block">{customerDetails.phone}</span>
              </div>
              <div className="pt-4 sm:pt-0 sm:pl-6">
                <span className="text-xs font-black text-[#8B6A4E] uppercase tracking-wider block mb-1">Email Address</span>
                <span className="font-bold text-[#3E2C1C] text-base break-all block">{customerDetails.email}</span>
              </div>
            </div>
          </div>

          {/* Shipping Address — Full Width */}
          <div className="border border-[#eeddb9] rounded-xl overflow-hidden bg-white">
            <div className="flex items-center gap-2 px-5 py-3 bg-[#FAF4E6] border-b border-[#eeddb9]">
              <MapPin className="w-4 h-4 text-[#C56C4F]" />
              <span className="text-xs font-black text-[#C56C4F] uppercase tracking-widest">Shipping Address</span>
            </div>
            <div className="px-5 py-4 grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-[#eeddb9]/50">
              <div className="pb-4 sm:pb-0 sm:pr-6">
                <span className="text-xs font-black text-[#8B6A4E] uppercase tracking-wider block mb-1">City & State</span>
                <span className="font-extrabold text-[#3E2C1C] text-base block">{shippingAddress.city}, {shippingAddress.state}</span>
              </div>
              <div className="py-4 sm:py-0 sm:px-6">
                <span className="text-xs font-black text-[#8B6A4E] uppercase tracking-wider block mb-1">Street Address</span>
                <span className="font-bold text-[#3E2C1C] text-base block leading-relaxed">{shippingAddress.address}</span>
              </div>
              <div className="pt-4 sm:pt-0 sm:pl-6">
                <span className="text-xs font-black text-[#8B6A4E] uppercase tracking-wider block mb-1">Pincode</span>
                <span className="font-bold text-[#3E2C1C] text-base block">{shippingAddress.pincode}</span>
              </div>
            </div>
          </div>

          {/* Billing Address — Full Width */}
          <div className="border border-[#eeddb9] rounded-xl overflow-hidden bg-white">
            <div className="flex items-center gap-2 px-5 py-3 bg-[#FAF4E6] border-b border-[#eeddb9]">
              <ClipboardCheck className="w-4 h-4 text-[#C56C4F]" />
              <span className="text-xs font-black text-[#C56C4F] uppercase tracking-widest">Billing Address</span>
            </div>
            <div className="px-5 py-4">
              {sameAsShipping ? (
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-green-50 border border-green-200 flex items-center justify-center shrink-0">
                    <ClipboardCheck className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-[#384401] font-extrabold text-base leading-snug">Same as shipping address</p>
                    <p className="text-[#8B6A4E] font-semibold text-sm mt-0.5">Billing statements go to your delivery address</p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-[#eeddb9]/50">
                  <div className="pb-4 sm:pb-0 sm:pr-6">
                    <span className="text-xs font-black text-[#8B6A4E] uppercase tracking-wider block mb-1">City & State</span>
                    <span className="font-extrabold text-[#3E2C1C] text-base block">{billingAddress.city}, {billingAddress.state}</span>
                  </div>
                  <div className="py-4 sm:py-0 sm:px-6">
                    <span className="text-xs font-black text-[#8B6A4E] uppercase tracking-wider block mb-1">Street Address</span>
                    <span className="font-bold text-[#3E2C1C] text-base block leading-relaxed">{billingAddress.address}</span>
                  </div>
                  <div className="pt-4 sm:pt-0 sm:pl-6">
                    <span className="text-xs font-black text-[#8B6A4E] uppercase tracking-wider block mb-1">Pincode</span>
                    <span className="font-bold text-[#3E2C1C] text-base block">{billingAddress.pincode}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Items In Shipment */}
          <div className="border border-[#eeddb9] rounded-xl overflow-hidden bg-white">
            <div className="bg-[#FAF4E6] px-5 py-3 border-b border-[#eeddb9] flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-[#C56C4F]" />
              <span className="font-black text-xs text-[#3E2C1C] uppercase tracking-widest">Items In Shipment</span>
            </div>
            <div className="divide-y divide-[#eeddb9]/40">
              {cart.map((item) => (
                <div key={`${item.id}-${item.weight}`} className="px-5 py-3.5 flex items-center justify-between gap-3 hover:bg-[#FAF4E6]/20 transition-colors">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-11 h-11 rounded-lg overflow-hidden border border-[#eeddb9]/50 shrink-0 bg-stone-50">
                      <img 
                        src="https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=60&h=60" 
                        alt={item.name} 
                        className="w-full h-full object-cover" 
                      />
                    </div>
                    <div className="min-w-0">
                      <span className="font-extrabold text-[#3E2C1C] text-base block truncate">{item.name}</span>
                      <span className="text-sm text-[#8B6A4E] font-semibold block mt-0.5">Size: {item.weight} &nbsp;|&nbsp; Qty: {item.quantity}</span>
                    </div>
                  </div>
                  <span className="font-extrabold text-[#3E2C1C] text-base shrink-0">₹{item.price * item.quantity}</span>
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
