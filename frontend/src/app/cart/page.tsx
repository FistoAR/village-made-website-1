'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Trash2, Minus, Plus, ShoppingBag, ArrowLeft, CheckCircle, ArrowRight } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useApp } from '@/lib/context/AppContext';

function CartQtyInput({ item, updateQuantity }: { item: any; updateQuantity: any }) {
  const [localVal, setLocalVal] = useState(item.quantity.toString());

  useEffect(() => {
    setLocalVal(item.quantity.toString());
  }, [item.quantity]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setLocalVal(val);
    const parsed = parseInt(val, 10);
    if (!isNaN(parsed) && parsed >= 1) {
      updateQuantity(item.id, item.weight, parsed);
    }
  };

  const handleBlur = () => {
    const parsed = parseInt(localVal, 10);
    if (isNaN(parsed) || parsed < 1) {
      setLocalVal('1');
      updateQuantity(item.id, item.weight, 1);
    }
  };

  return (
    <input
      type="text"
      value={localVal}
      onChange={handleChange}
      onBlur={handleBlur}
      className="w-8 h-6 bg-transparent text-center font-jakarta text-xs font-bold text-[#1a110a] focus:outline-none"
    />
  );
}

export default function CartPage() {
  const router = useRouter();
  const { cart, updateQuantity, removeFromCart, clearCart, cartTotal, cartCount, user, addOrder } = useApp();
  const [mounted, setMounted] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<'cart' | 'checkout' | 'success'>('cart');
  const [checkoutForm, setCheckoutForm] = useState({
    name: '',
    phone: '',
    address: '',
    city: '',
    pincode: '',
  });

  // Coupons and checkout toggle states
  const [couponCode, setCouponCode] = useState('');
  const [discountValue, setDiscountValue] = useState(0);
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');
  const [showShippingForm, setShowShippingForm] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && user) {
      const defaultAddr = user.addresses.find(a => a.isDefault) || user.addresses[0];
      setCheckoutForm({
        name: user.name || '',
        phone: user.phone || user.mobile,
        address: defaultAddr?.address || '',
        city: defaultAddr?.city || '',
        pincode: defaultAddr?.pincode || '',
      });
    }
  }, [user, mounted]);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError('');
    setCouponSuccess('');
    const code = couponCode.trim().toUpperCase();

    if (code === 'VILLAGE10') {
      const discount = Math.round(cartTotal * 0.1);
      setDiscountValue(discount);
      setCouponSuccess('10% discount coupon applied successfully!');
    } else if (code === 'WELCOME100') {
      if (cartTotal < 300) {
        setCouponError('Minimum order value of ₹300 required for this coupon.');
        setDiscountValue(0);
      } else {
        setDiscountValue(100);
        setCouponSuccess('Flat ₹100 discount applied successfully!');
      }
    } else if (code === '') {
      setDiscountValue(0);
    } else {
      setCouponError('Invalid coupon code. Try VILLAGE10 or WELCOME100.');
      setDiscountValue(0);
    }
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] text-[#3E2C1C] flex flex-col justify-between">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-[#384401]/30 border-t-[#384401] rounded-full animate-spin"></div>
        </div>
        <Footer />
      </div>
    );
  }

  // Cost calculations
  const shippingThreshold = 499;
  const discountedSubtotal = Math.max(0, cartTotal - discountValue);
  const shippingFee = discountedSubtotal >= shippingThreshold || cartTotal === 0 ? 0 : 50;
  const taxRate = 0.05; // 5% GST
  const estimatedTax = Math.round(discountedSubtotal * taxRate);
  const grandTotal = discountedSubtotal + shippingFee + estimatedTax;

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (user) {
      addOrder(
        cart,
        {
          subtotal: cartTotal,
          shipping: shippingFee,
          tax: estimatedTax,
          total: grandTotal
        },
        {
          id: Math.random().toString(36).substr(2, 9),
          name: checkoutForm.name,
          phone: checkoutForm.phone,
          address: checkoutForm.address,
          city: checkoutForm.city,
          pincode: checkoutForm.pincode,
        }
      );
    }
    setCheckoutStep('success');
  };

  const handleSuccessClose = () => {
    clearCart();
    router.push('/products');
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#3E2C1C] flex flex-col justify-between">
      <Navbar />

      <main className="flex-grow pt-28 pb-20 px-4 md:px-12 lg:px-24 mx-auto w-full max-w-7xl">
        {checkoutStep === 'cart' ? (
          <div>
            {/* Title Section */}
            <div className="mb-8">
              <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-extrabold text-stone-900 tracking-tight mb-2">
                Your Village Cart
              </h1>
              <p className="text-stone-500 font-jakarta text-sm">
                Review your items prepared traditionally with care and hygiene.
              </p>
            </div>

            {cart.length === 0 ? (
              /* Empty Cart State */
              <div className="bg-[#FAF4E6] border border-[#eeddb9] rounded-[32px] p-8 md:p-16 text-center max-w-2xl mx-auto shadow-xs select-none">
                <div className="w-20 h-20 bg-[#EFE6DB] rounded-full flex items-center justify-center mx-auto mb-6">
                  <ShoppingBag className="w-10 h-10 text-[#C56C4F]" />
                </div>
                <h2 className="text-2xl font-bold font-jakarta text-stone-950 mb-3">
                  Your cart is empty
                </h2>
                <p className="text-stone-655 font-jakarta text-sm leading-relaxed mb-8 max-w-md mx-auto">
                  Looks like you haven't added any premium, stone-milled goods or nutritional malts to your pantry yet. Let's explore our traditional products.
                </p>
                <Link
                  href="/products"
                  className="inline-flex items-center gap-2 bg-[#384401] hover:bg-[#252d00] text-white font-bold py-3 px-8 rounded-xl transition-all shadow-md hover:shadow-lg cursor-pointer"
                >
                  Explore Pantry <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ) : (
              /* Active Cart Grid */
              <div className="flex flex-col lg:flex-row gap-8 items-start">
                
                {/* Cart Items List */}
                <div className="w-full lg:w-[65%] flex flex-col gap-4">
                  {cart.map((item) => (
                    <div
                      key={`${item.id}-${item.weight}`}
                      className="bg-white border border-[#eeddb9]/50 hover:border-[#eeddb9] rounded-2xl p-4 md:p-5 flex gap-4 md:gap-6 items-center shadow-xs transition-all"
                    >
                      {/* Product Thumbnail Image */}
                      <div className="w-16 h-16 md:w-20 md:h-20 bg-white border border-[#eeddb9]/30 rounded-xl overflow-hidden shrink-0 relative">
                        <img 
                          src="https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=120&h=120" 
                          alt={item.name} 
                          className="w-full h-full object-cover" 
                        />
                      </div>

                      {/* Item Details */}
                      <div className="flex-grow min-w-0">
                        <span className="text-[#394308] text-[10px] md:text-xs font-bold tracking-wider uppercase block mb-0.5">
                          {item.category}
                        </span>
                        <h3 className="text-stone-950 font-bold text-sm md:text-base font-jakarta truncate">
                          {item.name}
                        </h3>
                        <span className="text-stone-500 text-xs font-semibold font-jakarta block mt-0.5">
                          Size: <span className="text-stone-800 font-bold">{item.weight}</span>
                        </span>
                        <span className="text-stone-850 font-extrabold text-sm block mt-1.5 md:hidden">
                          ₹{item.price * item.quantity}
                        </span>
                      </div>

                      {/* Quantity Controls & Prices */}
                      <div className="flex items-center gap-4 md:gap-8 shrink-0">
                        {/* Quantity controls */}
                        <div className="flex items-center bg-[#faf6eb] border border-[#d2c9b4] rounded-md h-8 px-1">
                          <button
                            onClick={() => updateQuantity(item.id, item.weight, Math.max(1, item.quantity - 1))}
                            className="w-6 h-6 flex items-center justify-center text-[#3e2c1c] hover:bg-[#ebdcc1]/40 rounded cursor-pointer"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <CartQtyInput item={item} updateQuantity={updateQuantity} />
                          <button
                            onClick={() => updateQuantity(item.id, item.weight, item.quantity + 1)}
                            className="w-6 h-6 flex items-center justify-center text-[#3e2c1c] hover:bg-[#ebdcc1]/40 rounded cursor-pointer"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Subtotal Desktop */}
                        <span className="hidden md:block font-jakarta font-bold text-stone-900 min-w-[70px] text-right">
                          ₹{item.price * item.quantity}
                        </span>

                        {/* Remove button */}
                        <button
                          onClick={() => removeFromCart(item.id, item.weight)}
                          className="p-1.5 text-stone-400 hover:text-red-600 transition-colors cursor-pointer rounded-lg hover:bg-stone-50"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-4.5 h-4.5" />
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Continue Shopping and Clear Cart button row */}
                  <div className="mt-2 flex justify-between items-center gap-4">
                    <Link
                      href="/products"
                      className="inline-flex items-center gap-2 text-stone-600 hover:text-[#384401] font-bold text-sm transition-colors cursor-pointer group font-jakarta"
                    >
                      <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" /> Continue Shopping
                    </Link>
                    <button
                      onClick={clearCart}
                      className="text-red-700 hover:text-red-900 font-bold text-sm transition-colors cursor-pointer font-jakarta hover:underline"
                    >
                      Clear Cart
                    </button>
                  </div>
                </div>

                {/* Checkout & Summary panel */}
                <div className="w-full lg:w-[35%] flex flex-col gap-6 sticky top-28">
                  {/* Summary Card */}
                  <div className="bg-[#FAF4E6] border border-[#eeddb9] rounded-2xl p-6 shadow-xs select-none">
                    <h2 className="text-lg font-bold font-jakarta text-stone-950 border-b border-[#eeddb9]/60 pb-3 mb-4">
                      Order Summary
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

                      {shippingFee > 0 && (
                        <div className="bg-[#e2edd3] text-[#384401] rounded-lg p-2 text-xs font-bold text-center mt-1">
                          Add ₹{shippingThreshold - discountedSubtotal} more for FREE Delivery!
                        </div>
                      )}

                      <div className="border-t border-[#eeddb9]/60 pt-4 mt-2 flex justify-between text-base font-extrabold text-stone-950">
                        <span>Grand Total</span>
                        <span>₹{grandTotal}</span>
                      </div>

                      {/* Coupon entry form */}
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

                      {/* Direct place order button */}
                      <button
                        onClick={() => setCheckoutStep('checkout')}
                        className="w-full mt-4 py-3 bg-[#384401] hover:bg-[#252d00] text-white font-bold rounded-xl transition-all shadow-xs cursor-pointer text-xs uppercase tracking-wider flex items-center justify-center gap-2 font-jakarta"
                      >
                        Proceed to Checkout <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            )}
          </div>
        ) : checkoutStep === 'checkout' ? (
          /* Checkout Step */
          <div className="animate-fade-in">
            {/* Title Section */}
            <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-extrabold text-stone-900 tracking-tight mb-2">
                  Delivery Checkout
                </h1>
                <p className="text-stone-700 font-jakarta text-sm">
                  Provide your delivery address to complete your traditional goods purchase.
                </p>
              </div>
              <button
                onClick={() => setCheckoutStep('cart')}
                className="w-fit text-stone-700 hover:text-stone-950 font-bold font-jakarta text-xs border border-stone-300 rounded-xl px-4 py-2.5 hover:bg-stone-50 cursor-pointer shadow-xs"
              >
                ← Back to Cart
              </button>
            </div>

            <div className="flex flex-col lg:flex-row gap-8 items-start">
              {/* Left Column: Dedicated Shipping Details Form */}
              <div className="w-full lg:w-[65%] bg-white border border-[#eeddb9]/50 rounded-[32px] p-6 md:p-8 shadow-xs">
                <h2 className="text-lg font-bold font-jakarta text-stone-950 mb-6 border-b border-[#eeddb9]/45 pb-3">
                  Shipping Destination
                </h2>
                
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (user) {
                      addOrder(
                        cart,
                        {
                          subtotal: cartTotal,
                          shipping: shippingFee,
                          tax: estimatedTax,
                          total: grandTotal
                        },
                        {
                          id: Math.random().toString(36).substr(2, 9),
                          name: checkoutForm.name || user.name || 'Guest Member',
                          phone: checkoutForm.phone || user.mobile,
                          address: checkoutForm.address || 'Address details',
                          city: checkoutForm.city || 'Online',
                          pincode: checkoutForm.pincode || '000000',
                        }
                      );
                    }
                    setCheckoutStep('success');
                  }}
                  className="flex flex-col gap-4 font-jakarta text-xs text-stone-900"
                >
                  <div>
                    <label className="text-[10px] font-bold text-stone-700 uppercase tracking-wide block mb-1.5">Recipient Full Name *</label>
                    <input
                      type="text"
                      required
                      value={checkoutForm.name}
                      onChange={(e) => setCheckoutForm({ ...checkoutForm, name: e.target.value })}
                      placeholder="e.g. Rahul Sharma"
                      className="w-full h-11 px-3 bg-white border border-[#eeddb9] rounded-xl focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-stone-700 uppercase tracking-wide block mb-1.5">Recipient Phone *</label>
                    <input
                      type="tel"
                      required
                      value={checkoutForm.phone}
                      onChange={(e) => setCheckoutForm({ ...checkoutForm, phone: e.target.value })}
                      placeholder="e.g. 9876543210"
                      className="w-full h-11 px-3 bg-white border border-[#eeddb9] rounded-xl focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-stone-700 uppercase tracking-wide block mb-1.5">Delivery Address *</label>
                    <textarea
                      required
                      rows={3}
                      value={checkoutForm.address}
                      onChange={(e) => setCheckoutForm({ ...checkoutForm, address: e.target.value })}
                      placeholder="Flat/House no, Street name, City, Pincode"
                      className="w-full px-3 py-2.5 bg-white border border-[#eeddb9] rounded-xl focus:outline-none resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full mt-4 py-3 bg-[#384401] hover:bg-[#252d00] text-white font-bold rounded-xl transition-all shadow-xs cursor-pointer text-xs uppercase tracking-wider flex items-center justify-center gap-2"
                  >
                    Complete Order & Pay (₹{grandTotal}) <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              </div>

              {/* Right Column: Checkout Summary info panel */}
              <div className="w-full lg:w-[35%]">
                <div className="bg-[#FAF4E6] border border-[#eeddb9] rounded-2xl p-6 shadow-xs select-none">
                  <h2 className="text-lg font-bold font-jakarta text-stone-950 border-b border-[#eeddb9]/60 pb-3 mb-4">
                    Order Summary
                  </h2>

                  <div className="flex flex-col gap-3 text-sm font-jakarta text-stone-700">
                    <div className="flex justify-between">
                      <span>Items Subtotal ({cartCount})</span>
                      <span className="font-semibold text-stone-900">₹{cartTotal}</span>
                    </div>

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

                    <div className="border-t border-[#eeddb9]/60 pt-4 mt-2 flex justify-between text-base font-extrabold text-stone-950">
                      <span>Grand Total</span>
                      <span>₹{grandTotal}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Success Screen */
          <div className="bg-[#FAF4E6] border border-[#eeddb9] rounded-[32px] p-8 md:p-16 text-center max-w-2xl mx-auto shadow-xs select-none animate-scale-up">
            <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600">
              <CheckCircle className="w-12 h-12 fill-green-500 text-white" />
            </div>
            <h1 className="font-display text-3xl font-extrabold text-stone-950 mb-3">
              Order Placed Successfully!
            </h1>
            <p className="text-stone-700 font-semibold text-sm mb-6">
              Thank you for supporting village industries!
            </p>
            <div className="bg-white border border-[#eeddb9]/60 rounded-xl p-5 mb-8 text-left text-xs font-jakarta text-stone-700 flex flex-col gap-2">
              <div className="flex justify-between border-b border-stone-100 pb-2 mb-1">
                <span className="font-bold text-stone-950">Shipment Details:</span>
                <span className="text-[#C56C4F] font-bold">Arriving in 3-5 working days</span>
              </div>
              <p><strong>Deliver To:</strong> {checkoutForm.address || 'Registered Address'}</p>
              <p><strong>Grand Total:</strong> ₹{grandTotal}</p>
            </div>
            <button
              onClick={handleSuccessClose}
              className="bg-[#384401] hover:bg-[#252d00] text-white font-bold py-3 px-8 rounded-xl transition-all shadow-md hover:shadow-lg cursor-pointer"
            >
              Continue Shopping
            </button>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
