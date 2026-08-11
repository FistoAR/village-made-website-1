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
  const { cart, updateQuantity, removeFromCart, clearCart, cartTotal, cartCount, user, addOrder, showAlert, showConfirm, showToast } = useApp();
  const [mounted, setMounted] = useState(false);
  
  // Steps control
  const [checkoutStep, setCheckoutStep] = useState<CheckoutMainStep>('cart');
  const [activeSubStep, setActiveSubStep] = useState<number>(1); // 1 to 6
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const handleClearError = (field: string) => {
    setValidationErrors(prev => prev.filter(err => err !== field));
  };

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
  const shippingFee = baseShippingFee;

  const taxRate = 0.05; // 5% GST
  const estimatedTax = Math.round(discountedSubtotal * taxRate);
  const grandTotal = discountedSubtotal + shippingFee + estimatedTax;

  // Sub-step Validation
  const validateSubStep = (): boolean => {
    const errors: string[] = [];
    if (activeSubStep === 1) {
      if (!customerDetails.name.trim()) errors.push('name');
      if (!customerDetails.phone.trim() || customerDetails.phone.length < 10) errors.push('phone');
      if (!customerDetails.email.trim() || !customerDetails.email.includes('@')) errors.push('email');
    }
    if (activeSubStep === 2) {
      if (!shippingAddress.address.trim()) errors.push('shipping_address');
      if (!shippingAddress.city.trim()) errors.push('shipping_city');
      if (!shippingAddress.state.trim()) errors.push('shipping_state');
      if (!shippingAddress.pincode.trim() || shippingAddress.pincode.length < 6) errors.push('shipping_pincode');
      
      if (!sameAsShipping) {
        if (!billingAddress.address.trim()) errors.push('billing_address');
        if (!billingAddress.city.trim()) errors.push('billing_city');
        if (!billingAddress.state.trim()) errors.push('billing_state');
        if (!billingAddress.pincode.trim() || billingAddress.pincode.length < 6) errors.push('billing_pincode');
      }
    }
    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleNextStep = () => {
    if (validateSubStep()) {
      setActiveSubStep(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      showToast('Please fill out all required fields correctly before moving forward.', 'error');
    }
  };

  const handleBackStep = () => {
    if (activeSubStep > 1) {
      setActiveSubStep(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
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
      showToast('The payment request was cancelled or declined. Please try again.', 'error');
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
    { num: 2, label: 'Shipping & Delivery', icon: MapPin },
    { num: 3, label: 'Review', icon: Sparkles }
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
              <h1 className="font-poetsen text-3xl sm:text-4xl md:text-5xl text-stone-950 tracking-tight mb-3">
                Your Village Cart
              </h1>
              <p className="text-stone-700 font-semibold font-jakarta text-base">
                Review your items prepared traditionally with care and hygiene.
              </p>
            </div>

            {cart.length === 0 ? (
              /* Empty Cart State */
              <div className="bg-[#FAF4E6] border border-[#eeddb9] rounded-[32px] p-8 md:p-16 text-center max-w-2xl mx-auto shadow-xs select-none">
                <div className="w-20 h-20 bg-[#EFE6DB] rounded-full flex items-center justify-center mx-auto mb-6">
                  <ShoppingBag className="w-10 h-10 text-[#C56C4F]" />
                </div>
                <h2 className="text-2.5xl font-black font-jakarta text-stone-950 mb-3">
                  Your cart is empty
                </h2>
                <p className="text-stone-850 font-jakarta text-base leading-relaxed mb-8 max-w-md mx-auto font-semibold">
                  Looks like you haven't added any premium, stone-milled goods or nutritional malts to your pantry yet. Let's explore our traditional products.
                </p>
                <Link
                  href="/products"
                  className="inline-flex items-center gap-2 bg-[#384401] hover:bg-[#252d00] text-white font-bold py-3.5 px-8 rounded-xl transition-all shadow-md hover:shadow-lg cursor-pointer"
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
                      className="bg-white border border-[#eeddb9]/70 hover:border-[#eeddb9] rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row gap-3 sm:gap-6 sm:items-center shadow-sm transition-all animate-fade-in"
                    >
                      {/* Top Row / Content part */}
                      <div className="flex gap-4 items-center w-full min-w-0">
                        {/* Product Thumbnail Image */}
                        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white border border-[#eeddb9]/30 rounded-xl overflow-hidden shrink-0 relative">
                          <img 
                            src="https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=120&h=120" 
                            alt={item.name} 
                            className="w-full h-full object-cover" 
                          />
                        </div>

                        {/* Item Details */}
                        <div className="flex-grow min-w-0">
                          <span className="text-[#394308] text-[10px] sm:text-xs font-black tracking-wider uppercase block mb-0.5">
                            {item.category}
                          </span>
                          <h3 className="text-stone-950 font-extrabold text-xs sm:text-sm md:text-base font-jakarta leading-snug break-words">
                            {item.name}
                          </h3>
                          <span className="text-stone-750 text-[11px] sm:text-xs font-bold font-jakarta block mt-0.5">
                            Size: <span className="text-stone-900 font-extrabold">{item.weight}</span>
                          </span>
                        </div>
                      </div>

                      {/* Bottom Row / Controls part */}
                      <div className="flex justify-between sm:justify-end items-center gap-4 sm:gap-8 w-full sm:w-auto mt-3 sm:mt-0 pt-3 sm:pt-0 border-t border-stone-100 sm:border-t-0 shrink-0">
                        {/* Quantity controls */}
                        <div className="flex items-center bg-[#faf6eb] border border-[#d2c9b4] rounded-md h-8 px-1">
                          <button
                            onClick={() => updateQuantity(item.id, item.weight, Math.max(1, item.quantity - 1))}
                            className="w-6 h-6 flex items-center justify-center text-[#3e2c1c] hover:bg-[#ebdcc1]/40 rounded cursor-pointer font-bold"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <CartQtyInput item={item} updateQuantity={updateQuantity} />
                          <button
                            onClick={() => updateQuantity(item.id, item.weight, item.quantity + 1)}
                            className="w-6 h-6 flex items-center justify-center text-[#3e2c1c] hover:bg-[#ebdcc1]/40 rounded cursor-pointer font-bold"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Price and Action items grouping */}
                        <div className="flex items-center gap-4 sm:gap-6">
                          {/* Price */}
                          <span className="font-jakarta font-black text-stone-950 text-right text-sm sm:text-base min-w-[60px]">
                            ₹{item.price * item.quantity}
                          </span>

                          {/* Remove button */}
                          <button
                            onClick={() => removeFromCart(item.id, item.weight)}
                            className="p-1.5 text-stone-500 hover:text-red-700 transition-colors cursor-pointer rounded-lg hover:bg-stone-50"
                            aria-label="Remove item"
                          >
                            <Trash2 className="w-4.5 h-4.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Continue Shopping and Clear Cart button row */}
                  <div className="mt-2 flex justify-between items-center gap-4">
                    <Link
                      href="/products"
                      className="inline-flex items-center gap-2 text-stone-700 hover:text-[#384401] font-extrabold text-sm transition-colors cursor-pointer group font-jakarta"
                    >
                      <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" /> Continue Shopping
                    </Link>
                    <button
                      onClick={clearCart}
                      className="text-red-700 hover:text-red-900 font-extrabold text-sm transition-colors cursor-pointer font-jakarta hover:underline"
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
                    window.scrollTo({ top: 0, behavior: 'smooth' });
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
              <div className="w-full lg:w-[65%] bg-white border border-[#eeddb9] rounded-[24px] sm:rounded-[32px] p-4 sm:p-6 md:p-8 shadow-sm">
                
                {/* BACK BUTTON AND HEADER */}
                <div className="flex justify-between items-center mb-5 pb-3.5 border-b border-[#eeddb9] gap-2">
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#FAF4E6] flex items-center justify-center text-[#C56C4F] shadow-sm shrink-0">
                      {React.createElement(currentIcon, { className: "w-4 h-4 sm:w-5 sm:h-5" })}
                    </div>
                    <div className="min-w-0 flex flex-col justify-center">
                      
                      <h2 className="text-base sm:text-lg md:text-xl font-black font-jakarta text-stone-950 leading-tight truncate sm:normal-case">
                        {activeSubStep === 1 && "Customer Details"}
                        {activeSubStep === 2 && "Shipping & Delivery"}
                        {activeSubStep === 3 && "Order Review"}
                      </h2>
                    </div>
                  </div>
                  
                  {activeSubStep > 1 && (
                    <button
                      onClick={handleBackStep}
                      className="w-8 h-8 sm:w-auto sm:px-3.5 sm:py-2 rounded-xl border border-stone-300 bg-white hover:bg-stone-50 flex items-center justify-center gap-1 shrink-0 shadow-xs cursor-pointer text-xs font-black font-jakarta text-stone-700 hover:text-stone-950"
                    >
                      <ArrowLeft className="w-4 h-4" /> <span className="hidden sm:inline">Back</span>
                    </button>
                  )}
                  {activeSubStep === 1 && (
                    <button
                      onClick={() => {
                        setCheckoutStep('cart');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="w-8 h-8 sm:w-auto sm:px-3.5 sm:py-2 rounded-xl border border-stone-300 bg-white hover:bg-stone-50 flex items-center justify-center gap-1 shrink-0 shadow-xs cursor-pointer text-xs font-black font-jakarta text-stone-700 hover:text-stone-950"
                    >
                      <ArrowLeft className="w-4 h-4" /> <span className="hidden sm:inline">Back to Cart</span>
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
                  validationErrors={validationErrors}
                  onClearError={handleClearError}
                />

                {/* NAVIGATION FOOTER */}
                <div className="mt-8 pt-6 border-t border-[#eeddb9] flex justify-between items-center">
                  <div className="text-xs font-medium text-stone-900">
                    Step {activeSubStep} of 3 Completed
                  </div>
                  
                   {activeSubStep < 3 ? (
                    <button
                      onClick={handleNextStep}
                      className="px-6 py-3 bg-gradient-to-r from-[#384401] to-[#485602] hover:shadow-lg hover:shadow-[#384401]/15 text-white font-black rounded-xl transition-all duration-300 active:scale-95 cursor-pointer text-xs uppercase tracking-wider flex items-center gap-2 font-jakarta"
                    >
                      Next Step <ChevronRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      onClick={handlePlaceOrder}
                      className="px-8 py-3.5 bg-gradient-to-r from-[#C56C4F] to-[#b0583c] hover:shadow-lg hover:shadow-[#C56C4F]/15 text-white font-black rounded-xl transition-all duration-300 active:scale-95 cursor-pointer text-xs uppercase tracking-wider flex items-center gap-2 font-jakarta animate-pulse"
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
