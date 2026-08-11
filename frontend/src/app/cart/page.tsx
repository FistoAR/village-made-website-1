'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Trash2, Minus, Plus, ShoppingBag, ArrowLeft, ArrowRight,
  User, MapPin, Truck, CreditCard, ClipboardCheck, Sparkles, ChevronRight
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useApp } from '@/lib/context/AppContext';

// Import newly refactored checkout components
import CheckoutProgress from '@/components/checkout/CheckoutProgress';
import CheckoutSteps from '@/components/checkout/CheckoutSteps';
import CheckoutOrderSummary from '@/components/checkout/CheckoutOrderSummary';
import CheckoutSimulations from '@/components/checkout/CheckoutSimulations';

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

// Checkout Steps Enum/Types
type CheckoutMainStep = 'cart' | 'checkout' | 'create_order' | 'payment_gateway' | 'payment_verification' | 'order_confirmed' | 'success';

interface AddressData {
  address: string;
  city: string;
  state: string;
  pincode: string;
}

export default function CartPage() {
  const router = useRouter();
  const { cart, updateQuantity, removeFromCart, clearCart, cartTotal, cartCount, user, addOrder } = useApp();
  const [mounted, setMounted] = useState(false);
  
  // Steps control
  const [checkoutStep, setCheckoutStep] = useState<CheckoutMainStep>('cart');
  const [activeSubStep, setActiveSubStep] = useState<number>(1); // 1 to 6

  // Form inputs
  const [customerDetails, setCustomerDetails] = useState({
    name: '',
    phone: '',
    email: '',
  });

  const [shippingAddress, setShippingAddress] = useState<AddressData>({
    address: '',
    city: '',
    state: '',
    pincode: '',
  });

  const [sameAsShipping, setSameAsShipping] = useState(true);
  const [billingAddress, setBillingAddress] = useState<AddressData>({
    address: '',
    city: '',
    state: '',
    pincode: '',
  });

  const [deliveryMethod, setDeliveryMethod] = useState<'standard' | 'express'>('standard');
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'netbanking' | 'cod'>('upi');

  // Coupons states
  const [couponCode, setCouponCode] = useState('');
  const [discountValue, setDiscountValue] = useState(0);
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');

  // Loading animation items
  const [creationStatus, setCreationStatus] = useState<string>('Initializing order parameters...');
  const [verificationStatus, setVerificationStatus] = useState<string>('Connecting to secure banking networks...');
  const [simulatedOrderId, setSimulatedOrderId] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);

  // Autofill if user is logged in
  useEffect(() => {
    if (mounted && user) {
      const defaultAddr = user.addresses.find(a => a.isDefault) || user.addresses[0];
      setCustomerDetails({
        name: user.name || '',
        phone: user.phone || user.mobile || '',
        email: user.email || '',
      });
      if (defaultAddr) {
        setShippingAddress({
          address: defaultAddr.address || '',
          city: defaultAddr.city || '',
          state: 'Karnataka', // Default fallback
          pincode: defaultAddr.pincode || '',
        });
      }
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

  // Cost calculations
  const shippingThreshold = 499;
  const discountedSubtotal = Math.max(0, cartTotal - discountValue);
  
  // Base delivery fee
  const baseShippingFee = discountedSubtotal >= shippingThreshold || cartTotal === 0 ? 0 : 50;
  // Extra for Express
  const expressSurcharge = deliveryMethod === 'express' ? 100 : 0;
  const shippingFee = baseShippingFee + expressSurcharge;

  const taxRate = 0.05; // 5% GST
  const estimatedTax = Math.round(discountedSubtotal * taxRate);
  const grandTotal = discountedSubtotal + shippingFee + estimatedTax;

  // Sub-step Validation
  const validateSubStep = (): boolean => {
    if (activeSubStep === 1) {
      if (!customerDetails.name.trim()) return false;
      if (!customerDetails.phone.trim() || customerDetails.phone.length < 10) return false;
      if (!customerDetails.email.trim() || !customerDetails.email.includes('@')) return false;
    }
    if (activeSubStep === 2) {
      if (!shippingAddress.address.trim()) return false;
      if (!shippingAddress.city.trim()) return false;
      if (!shippingAddress.state.trim()) return false;
      if (!shippingAddress.pincode.trim() || shippingAddress.pincode.length < 6) return false;
    }
    if (activeSubStep === 3 && !sameAsShipping) {
      if (!billingAddress.address.trim()) return false;
      if (!billingAddress.city.trim()) return false;
      if (!billingAddress.state.trim()) return false;
      if (!billingAddress.pincode.trim() || billingAddress.pincode.length < 6) return false;
    }
    return true;
  };

  const handleNextStep = () => {
    if (validateSubStep()) {
      setActiveSubStep(prev => prev + 1);
    } else {
      alert('Please fill out all required fields correctly before moving forward.');
    }
  };

  const handleBackStep = () => {
    if (activeSubStep > 1) {
      setActiveSubStep(prev => prev - 1);
    }
  };

  // 1. PLACE ORDER -> CREATE ORDER pipeline
  const handlePlaceOrder = () => {
    setCheckoutStep('create_order');
    setCreationStatus('Preparing order parameters...');
    
    // Simulate ORDER CREATION
    setTimeout(() => {
      setCreationStatus('Checking inventory allocation...');
      setTimeout(() => {
        setCreationStatus('Generating secure unique invoice reference...');
        setTimeout(() => {
          const generatedId = `VM-${Math.floor(100000 + Math.random() * 900000)}`;
          setSimulatedOrderId(generatedId);
          
          // Proceed to Payment screen
          setCheckoutStep('payment_gateway');
        }, 1000);
      }, 1000);
    }, 1000);
  };

  // 2. PAYMENT -> PAYMENT VERIFICATION -> ORDER CONFIRMED -> ORDER SUCCESS pipeline
  const handleSimulatePayment = (success: boolean) => {
    if (!success) {
      alert('Payment cancelled / failed. Please try again or select another payment option.');
      setCheckoutStep('checkout');
      setActiveSubStep(5); // Go back to payment step
      return;
    }

    setCheckoutStep('payment_verification');
    setVerificationStatus('Validating transaction with provider network...');

    setTimeout(() => {
      setVerificationStatus('Securing tokenized handshake authorization...');
      setTimeout(() => {
        setVerificationStatus('Finalizing ledger updates and saving order...');
        setTimeout(() => {
          // Store order details in AppContext
          const finalBillingAddr = sameAsShipping ? shippingAddress : billingAddress;
          
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
                name: customerDetails.name,
                phone: customerDetails.phone,
                address: finalBillingAddr.address,
                city: finalBillingAddr.city,
                pincode: finalBillingAddr.pincode,
                isDefault: false
              }
            );
          }

          // Transition to CONFIRMED celebration screen
          setCheckoutStep('order_confirmed');
          
          // Confirmed splash duration before final receipts page
          setTimeout(() => {
            setCheckoutStep('success');
          }, 2000);

        }, 1200);
      }, 1000);
    }, 1000);
  };

  const handleSuccessClose = () => {
    clearCart();
    router.push('/products');
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

  // Define steps configurations
  const checkoutSubSteps = [
    { num: 1, label: 'Details', icon: User },
    { num: 2, label: 'Shipping', icon: MapPin },
    { num: 3, label: 'Billing', icon: ClipboardCheck },
    { num: 4, label: 'Shipment', icon: Truck },
    { num: 5, label: 'Payment', icon: CreditCard },
    { num: 6, label: 'Review', icon: Sparkles }
  ];

  const currentIcon = checkoutSubSteps[activeSubStep - 1].icon;

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
                <p className="text-stone-600 font-jakarta text-sm leading-relaxed mb-8 max-w-md mx-auto">
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
              <div className="flex flex-col lg:flex-row gap-8 items-start animate-fade-in">
                
                {/* Cart Items List */}
                <div className="w-full lg:w-[65%] flex flex-col gap-4">
                  {cart.map((item) => (
                    <div
                      key={`${item.id}-${item.weight}`}
                      className="bg-white border border-[#eeddb9]/50 hover:border-[#eeddb9] rounded-2xl p-4 md:p-5 flex gap-4 md:gap-6 items-center shadow-xs transition-all animate-fade-in"
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
                        <span className="text-stone-855 font-extrabold text-sm block mt-1.5 md:hidden">
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
                <CheckoutOrderSummary 
                  cartCount={cartCount}
                  cartTotal={cartTotal}
                  discountValue={discountValue}
                  shippingFee={shippingFee}
                  estimatedTax={estimatedTax}
                  shippingThreshold={shippingThreshold}
                  discountedSubtotal={discountedSubtotal}
                  grandTotal={grandTotal}
                  couponCode={couponCode}
                  setCouponCode={setCouponCode}
                  handleApplyCoupon={handleApplyCoupon}
                  couponError={couponError}
                  couponSuccess={couponSuccess}
                  isCheckoutScreen={false}
                  onProceedToCheckout={() => {
                    setCheckoutStep('checkout');
                    setActiveSubStep(1);
                  }}
                />
              </div>
            )}
          </div>
        ) : checkoutStep === 'checkout' ? (
          /* Multi-step Checkout Flow */
          <div className="animate-fade-in">
            {/* Steps Progress Tracker Banner */}
            <CheckoutProgress steps={checkoutSubSteps} activeSubStep={activeSubStep} />

            {/* Main Checkout View: Form Left, Summary Right */}
            <div className="flex flex-col lg:flex-row gap-8 items-start">
              
              {/* Form Input Columns */}
              <div className="w-full lg:w-[65%] bg-white border border-[#eeddb9]/50 rounded-[32px] p-6 md:p-8 shadow-xs">
                
                {/* BACK BUTTON AND HEADER */}
                <div className="flex justify-between items-center mb-6 pb-3 border-b border-[#eeddb9]/45">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-full bg-[#FAF4E6] flex items-center justify-center text-[#C56C4F]">
                      {React.createElement(currentIcon, { className: "w-4 h-4" })}
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wide">Step {activeSubStep} of 6</span>
                      <h2 className="text-lg font-bold font-jakarta text-stone-950">
                        {activeSubStep === 1 && "Customer Details"}
                        {activeSubStep === 2 && "Shipping Destination"}
                        {activeSubStep === 3 && "Billing Settings"}
                        {activeSubStep === 4 && "Choose Shipment Speed"}
                        {activeSubStep === 5 && "Select Payment Method"}
                        {activeSubStep === 6 && "Final Review & Confirms"}
                      </h2>
                    </div>
                  </div>
                  
                  {activeSubStep > 1 && (
                    <button
                      onClick={handleBackStep}
                      className="text-xs font-jakarta text-stone-500 hover:text-stone-900 border border-stone-200 px-3 py-1.5 rounded-lg hover:bg-stone-50 cursor-pointer"
                    >
                      ← Back
                    </button>
                  )}
                  {activeSubStep === 1 && (
                    <button
                      onClick={() => setCheckoutStep('cart')}
                      className="text-xs font-jakarta text-stone-500 hover:text-stone-900 border border-stone-200 px-3 py-1.5 rounded-lg hover:bg-stone-50 cursor-pointer"
                    >
                      ← Back to Cart
                    </button>
                  )}
                </div>

                {/* Sub-step Form Pages */}
                <CheckoutSteps 
                  activeSubStep={activeSubStep}
                  customerDetails={customerDetails}
                  setCustomerDetails={setCustomerDetails}
                  shippingAddress={shippingAddress}
                  setShippingAddress={setShippingAddress}
                  sameAsShipping={sameAsShipping}
                  setSameAsShipping={setSameAsShipping}
                  billingAddress={billingAddress}
                  setBillingAddress={setBillingAddress}
                  deliveryMethod={deliveryMethod}
                  setDeliveryMethod={setDeliveryMethod}
                  paymentMethod={paymentMethod}
                  setPaymentMethod={setPaymentMethod}
                  baseShippingFee={baseShippingFee}
                  cart={cart}
                />

                {/* NAVIGATION FOOTER */}
                <div className="mt-8 pt-6 border-t border-[#eeddb9]/30 flex justify-between items-center">
                  <div className="text-[11px] text-stone-400 font-semibold">
                    Step {activeSubStep} of 6 Completed
                  </div>
                  
                  {activeSubStep < 6 ? (
                    <button
                      onClick={handleNextStep}
                      className="px-6 py-3 bg-[#384401] hover:bg-[#252d00] text-white font-bold rounded-xl transition-all shadow-xs cursor-pointer text-xs uppercase tracking-wider flex items-center gap-1.5 font-jakarta"
                    >
                      Next Step <ChevronRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      onClick={handlePlaceOrder}
                      className="px-8 py-3.5 bg-[#C56C4F] hover:bg-[#a85237] text-white font-bold rounded-xl transition-all shadow-md hover:shadow-lg cursor-pointer text-xs uppercase tracking-wider flex items-center gap-2 font-jakarta animate-pulse"
                    >
                      Place Order (₹{grandTotal}) <ArrowRight className="w-4.5 h-4.5" />
                    </button>
                  )}
                </div>

              </div>

              {/* Right Column: Checkout Summary info panel */}
              <CheckoutOrderSummary 
                cartCount={cartCount}
                cartTotal={cartTotal}
                discountValue={discountValue}
                shippingFee={shippingFee}
                estimatedTax={estimatedTax}
                paymentMethod={paymentMethod}
                shippingThreshold={shippingThreshold}
                discountedSubtotal={discountedSubtotal}
                grandTotal={grandTotal}
                couponCode={couponCode}
                setCouponCode={setCouponCode}
                handleApplyCoupon={handleApplyCoupon}
                couponError={couponError}
                couponSuccess={couponSuccess}
                isCheckoutScreen={true}
              />

            </div>
          </div>
        ) : (
          /* Simulated pipeline steps: CREATE ORDER -> PAYMENT GATEWAY -> VERIFYING -> CONFIRMED -> SUCCESS Dashboard */
          <CheckoutSimulations 
            checkoutStep={checkoutStep}
            customerDetails={customerDetails}
            shippingAddress={shippingAddress}
            paymentMethod={paymentMethod}
            deliveryMethod={deliveryMethod}
            cart={cart}
            grandTotal={grandTotal}
            simulatedOrderId={simulatedOrderId}
            creationStatus={creationStatus}
            verificationStatus={verificationStatus}
            handleSimulatePayment={handleSimulatePayment}
            handleSuccessClose={handleSuccessClose}
          />
        )}
      </main>

      <Footer />
    </div>
  );
}
