'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  User as UserIcon, ShoppingBag, MapPin, Heart, MessageSquare, 
  Bell, LogOut, ChevronRight, CheckCircle2, AlertCircle, Plus, Trash2, Home
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useApp, UserAddress, UserOrder } from '@/lib/context/AppContext';
import { PRODUCTS } from '@/data/products-list';

type AccountTab = 'dashboard' | 'profile' | 'addresses' | 'orders' | 'wishlist' | 'reviews' | 'notifications';

export default function AccountPage() {
  const router = useRouter();
  const { 
    user, logoutUser, updateUserProfile, addAddress, deleteAddress, addReview 
  } = useApp();
  
  const [activeTab, setActiveTab] = useState<AccountTab>('dashboard');
  const [mounted, setMounted] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Profile forms
  const [profileName, setProfileName] = useState('');
  const [profileEmail, setProfileEmail] = useState('');
  const [profilePhone, setProfilePhone] = useState('');

  // Address forms
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [addrName, setAddrName] = useState('');
  const [addrPhone, setAddrPhone] = useState('');
  const [addrAddress, setAddrAddress] = useState('');
  const [addrCity, setAddrCity] = useState('');
  const [addrPincode, setAddrPincode] = useState('');
  const [addrDefault, setAddrDefault] = useState(false);

  // Review Form for testing reviews
  const [reviewProdId, setReviewProdId] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');

  // Expanded order details tracker
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Pre-fill profile forms when user object is loaded
  useEffect(() => {
    if (user) {
      setProfileName(user.name || '');
      setProfileEmail(user.email || '');
      setProfilePhone(user.phone || '');
    }
  }, [user]);

  // Auth Guard: Redirect to login if user session doesn't exist
  useEffect(() => {
    if (mounted && !user) {
      router.push('/login?redirect=/account');
    }
  }, [user, mounted, router]);

  if (!mounted || !user) {
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

  const triggerNotification = (msg: string, isError = false) => {
    if (isError) {
      setErrorMsg(msg);
      setTimeout(() => setErrorMsg(''), 3000);
    } else {
      setSuccessMsg(msg);
      setTimeout(() => setSuccessMsg(''), 3000);
    }
  };

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfile({
      name: profileName,
      email: profileEmail,
      phone: profilePhone,
    });
    triggerNotification('Profile updated successfully!');
  };

  const handleAddAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addrName || !addrPhone || !addrAddress || !addrCity || !addrPincode) {
      triggerNotification('Please fill out all address fields.', true);
      return;
    }
    addAddress({
      name: addrName,
      phone: addrPhone,
      address: addrAddress,
      city: addrCity,
      pincode: addrPincode,
      isDefault: addrDefault,
    });
    triggerNotification('Address added to book!');
    
    // Reset form
    setAddrName('');
    setAddrPhone('');
    setAddrAddress('');
    setAddrCity('');
    setAddrPincode('');
    setAddrDefault(false);
    setShowAddAddress(false);
  };

  const handleAddReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewProdId || !reviewComment) {
      triggerNotification('Please select a product and write a review.', true);
      return;
    }
    const product = PRODUCTS.find(p => p.id === reviewProdId);
    if (!product) return;
    addReview(reviewProdId, product.name, reviewRating, reviewComment);
    triggerNotification('Review submitted successfully!');
    setReviewProdId('');
    setReviewComment('');
    setReviewRating(5);
  };

  const handleLogout = () => {
    logoutUser();
    router.push('/');
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard Overview', icon: Home },
    { id: 'profile', label: 'My Profile', icon: UserIcon },
    { id: 'addresses', label: 'Address Book', icon: MapPin },
    { id: 'orders', label: 'My Orders', icon: ShoppingBag },
    { id: 'reviews', label: 'Product Reviews', icon: MessageSquare },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ];

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#3E2C1C] flex flex-col justify-between">
      <Navbar />

      <main className="flex-grow pt-28 pb-20 px-4 md:px-12 lg:px-24 mx-auto w-full max-w-7xl">
        
        {/* Banner Card */}
        <div className="bg-[#462617] rounded-[24px] p-6 md:p-8 text-white mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-md relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-cover" style={{ backgroundImage: "url('/images/product-section/bottom-paper-texture.webp')" }}></div>
          <div className="relative z-10">
            <span className="text-[#D4E47A] text-xs font-bold uppercase tracking-widest block mb-1">MEMBER ACCOUNT</span>
            <h1 className="font-display text-2xl md:text-3xl font-bold">
              Namaskaram, {user.name || 'Village Member'}!
            </h1>
            <p className="text-stone-100 text-xs mt-1">Mobile: {user.mobile}</p>
          </div>
          <button 
            onClick={handleLogout}
            className="relative z-10 flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl text-xs font-bold font-jakarta transition-colors border border-white/25 cursor-pointer"
          >
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>

        {/* Messaging Feedback Toasts */}
        {successMsg && (
          <div className="bg-[#e2edd3] border border-[#d2c9b4]/50 text-[#384401] px-5 py-3.5 rounded-xl text-xs font-semibold mb-6 flex gap-2 items-center animate-fade-in shadow-xs">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-[#384401]" />
            {successMsg}
          </div>
        )}
        {errorMsg && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-5 py-3.5 rounded-xl text-xs font-semibold mb-6 flex gap-2 items-center animate-fade-in shadow-xs">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-655" />
            {errorMsg}
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-8 items-stretch justify-between">
          {/* Sidebar / Left Column Nav */}
          <aside className="w-full lg:w-[25%] flex flex-col gap-2 bg-white border border-[#eeddb9]/50 rounded-[24px] p-4 h-fit shadow-xs shrink-0 select-none">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => { setActiveTab(item.id as AccountTab); setSuccessMsg(''); setErrorMsg(''); }}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold font-jakarta transition-colors cursor-pointer ${
                    activeTab === item.id
                      ? 'bg-[#384401] text-white'
                      : 'text-stone-750 hover:bg-stone-50 hover:text-stone-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4.5 h-4.5" />
                    {item.label}
                  </div>
                  <ChevronRight className={`w-3.5 h-3.5 opacity-55 ${activeTab === item.id ? 'text-white' : ''}`} />
                </button>
              );
            })}
          </aside>

          {/* Details Area / Right Column Content */}
          <section className="w-full lg:w-[72%] bg-white border border-[#eeddb9]/50 rounded-[24px] p-6 md:p-8 shadow-xs flex flex-col min-h-[450px]">
            
            {/* TAB: DASHBOARD */}
            {activeTab === 'dashboard' && (
              <div className="flex flex-col gap-6">
                <div>
                  <h2 className="text-xl font-bold font-jakarta text-stone-950 mb-1">Account Dashboard</h2>
                  <p className="text-stone-750 text-xs leading-relaxed">Overview of your account settings, orders, and addresses.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Order Overview Card */}
                  <div className="bg-[#FAF4E6] border border-[#eeddb9] rounded-xl p-5">
                    <h3 className="text-sm font-bold text-stone-900 mb-2 font-jakarta flex items-center gap-2">
                      <ShoppingBag className="w-4 h-4 text-[#384401]" /> Orders Log
                    </h3>
                    <p className="text-[#333] text-xs mb-4">You have placed {user.orders.length} order(s) traditionally prepared.</p>
                    <button 
                      onClick={() => setActiveTab('orders')}
                      className="text-xs font-bold text-[#384401] hover:underline cursor-pointer"
                    >
                      View all orders →
                    </button>
                  </div>

                  {/* Address Summary Card */}
                  <div className="bg-[#FAF4E6] border border-[#eeddb9] rounded-xl p-5">
                    <h3 className="text-sm font-bold text-stone-900 mb-2 font-jakarta flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-[#C56C4F]" /> Primary Address
                    </h3>
                    {user.addresses.length === 0 ? (
                      <p className="text-stone-700 text-xs mb-4">No shipping addresses saved in your address book yet.</p>
                    ) : (
                      <div className="text-xs text-stone-700 leading-relaxed mb-4 truncate">
                        <strong>{user.addresses.find(a => a.isDefault)?.name || user.addresses[0].name}</strong><br/>
                        {user.addresses.find(a => a.isDefault)?.address || user.addresses[0].address}
                      </div>
                    )}
                    <button 
                      onClick={() => setActiveTab('addresses')}
                      className="text-xs font-bold text-[#384401] hover:underline cursor-pointer"
                    >
                      Manage addresses →
                    </button>
                  </div>
                </div>

                {/* Notifications Panel teaser */}
                <div className="bg-stone-50 border border-stone-200/50 rounded-xl p-5 mt-2">
                  <h3 className="text-sm font-bold text-stone-900 mb-3 font-jakarta flex items-center gap-2">
                    <Bell className="w-4.5 h-4.5 text-stone-700" /> Recent Notification
                  </h3>
                  {user.notifications.length === 0 ? (
                    <p className="text-stone-700 text-xs">No notifications yet.</p>
                  ) : (
                    <div className="flex flex-col gap-1.5 border-l-2 border-[#384401] pl-3">
                      <h4 className="text-xs font-bold text-stone-900">{user.notifications[0].title}</h4>
                      <p className="text-[11px] text-stone-700 leading-relaxed">{user.notifications[0].message}</p>
                      <span className="text-[9px] text-stone-700 font-jakarta">{user.notifications[0].date}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB: PROFILE */}
            {activeTab === 'profile' && (
              <div className="flex flex-col gap-6">
                <div>
                  <h2 className="text-xl font-bold font-jakarta text-stone-950 mb-1">My Profile</h2>
                  <p className="text-stone-755 text-xs leading-relaxed">Update your contact information below. Mobile number cannot be changed.</p>
                </div>

                <form onSubmit={handleProfileSave} className="flex flex-col gap-4 max-w-lg">
                  <div>
                    <label className="text-[10px] font-bold text-stone-700 uppercase tracking-wide block mb-1.5 font-jakarta">Registered Mobile</label>
                    <input
                      type="text"
                      disabled
                      value={user.mobile}
                      className="w-full h-11 px-3 bg-stone-100 border border-stone-200 rounded-xl text-sm text-stone-700 focus:outline-hidden cursor-not-allowed font-jakarta"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-stone-700 uppercase tracking-wide block mb-1.5 font-jakarta">Full Name</label>
                    <input
                      type="text"
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      className="w-full h-11 px-3 bg-white border border-[#eeddb9] focus:border-[#384401] rounded-xl text-sm text-stone-900 focus:outline-hidden font-jakarta"
                      placeholder="e.g. Ravi Kiran"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-stone-700 uppercase tracking-wide block mb-1.5 font-jakarta">Email Address</label>
                    <input
                      type="email"
                      value={profileEmail}
                      onChange={(e) => setProfileEmail(e.target.value)}
                      className="w-full h-11 px-3 bg-white border border-[#eeddb9] focus:border-[#384401] rounded-xl text-sm text-stone-900 focus:outline-hidden font-jakarta"
                      placeholder="e.g. ravi@example.com"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-stone-700 uppercase tracking-wide block mb-1.5 font-jakarta">Alternative Contact Number</label>
                    <input
                      type="tel"
                      value={profilePhone}
                      onChange={(e) => setProfilePhone(e.target.value)}
                      className="w-full h-11 px-3 bg-white border border-[#eeddb9] focus:border-[#384401] rounded-xl text-sm text-stone-900 focus:outline-hidden font-jakarta"
                      placeholder="e.g. 10-digit mobile"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-fit px-6 h-11 bg-[#384401] hover:bg-[#252d00] text-white font-bold rounded-xl transition-all shadow-xs cursor-pointer text-xs mt-2"
                  >
                    Save Changes
                  </button>
                </form>
              </div>
            )}

            {/* TAB: ADDRESS BOOK */}
            {activeTab === 'addresses' && (
              <div className="flex flex-col gap-6">
                <div className="flex justify-between items-center gap-4 flex-wrap">
                  <div>
                    <h2 className="text-xl font-bold font-jakarta text-stone-950 mb-1">Address Book</h2>
                    <p className="text-stone-700 text-xs leading-relaxed">Manage your shipping address cards for faster checkouts.</p>
                  </div>
                  {!showAddAddress && (
                    <button
                      onClick={() => setShowAddAddress(true)}
                      className="flex items-center gap-1.5 bg-[#384401] hover:bg-[#252d00] text-white text-xs font-bold py-2.5 px-4 rounded-xl transition-colors cursor-pointer shadow-xs"
                    >
                      <Plus className="w-4 h-4" /> Add Address
                    </button>
                  )}
                </div>

                {/* Add Address Form overlay or insert */}
                {showAddAddress && (
                  <form onSubmit={handleAddAddressSubmit} className="bg-[#FAF4E6] border border-[#eeddb9] rounded-2xl p-5 flex flex-col gap-4">
                    <h3 className="font-bold text-stone-900 text-sm font-jakarta">New Delivery Address</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-bold text-stone-700 uppercase tracking-wide block mb-1 font-jakarta font-semibold">Recipient Name *</label>
                        <input
                          type="text"
                          required
                          value={addrName}
                          onChange={(e) => setAddrName(e.target.value)}
                          className="w-full h-10 px-3 bg-white border border-[#eeddb9] rounded-lg text-sm text-stone-900 focus:outline-hidden"
                          placeholder="e.g. Ramesh"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-stone-700 uppercase tracking-wide block mb-1 font-jakarta font-semibold">Recipient Phone *</label>
                        <input
                          type="tel"
                          required
                          value={addrPhone}
                          onChange={(e) => setAddrPhone(e.target.value)}
                          className="w-full h-10 px-3 bg-white border border-[#eeddb9] rounded-lg text-sm text-[#000] focus:outline-hidden"
                          placeholder="10-digit number"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-stone-700 uppercase tracking-wide block mb-1 font-jakarta font-semibold">Street Address *</label>
                      <textarea
                        required
                        value={addrAddress}
                        onChange={(e) => setAddrAddress(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-[#eeddb9] rounded-lg text-sm text-stone-900 h-16 resize-none focus:outline-hidden"
                        placeholder="House no, Building, Street name"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-bold text-stone-700 uppercase tracking-wide block mb-1 font-jakarta font-semibold">City *</label>
                        <input
                          type="text"
                          required
                          value={addrCity}
                          onChange={(e) => setAddrCity(e.target.value)}
                          className="w-full h-10 px-3 bg-white border border-[#eeddb9] rounded-lg text-sm text-stone-900 focus:outline-hidden"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-stone-700 uppercase tracking-wide block mb-1 font-jakarta font-semibold">Pincode *</label>
                        <input
                          type="text"
                          required
                          pattern="[0-9]{6}"
                          value={addrPincode}
                          onChange={(e) => setAddrPincode(e.target.value)}
                          className="w-full h-10 px-3 bg-white border border-[#eeddb9] rounded-lg text-sm text-stone-900 focus:outline-hidden"
                        />
                      </div>
                    </div>

                    <label className="flex items-center gap-2 text-xs font-semibold text-stone-700 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={addrDefault}
                        onChange={(e) => setAddrDefault(e.target.checked)}
                      />
                      Set as primary delivery address
                    </label>

                    <div className="flex gap-2 justify-end mt-2">
                      <button
                        type="button"
                        onClick={() => setShowAddAddress(false)}
                        className="bg-white border border-[#eeddb9] hover:bg-[#FAF4E6]/50 text-stone-700 font-bold px-4 py-2 rounded-xl text-xs transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="bg-[#384401] hover:bg-[#252d00] text-white font-bold px-4 py-2 rounded-xl text-xs transition-colors cursor-pointer"
                      >
                        Save Address
                      </button>
                    </div>
                  </form>
                )}

                {/* Addresses List */}
                <div className="flex flex-col gap-4">
                  {user.addresses.length === 0 ? (
                    <div className="text-center py-10 border-2 border-dashed border-stone-200 rounded-2xl text-stone-400 text-xs">
                      No addresses saved. Click "Add Address" to register a delivery card.
                    </div>
                  ) : (
                    user.addresses.map((addr) => (
                      <div
                        key={addr.id}
                        className="border border-[#eeddb9]/70 rounded-2xl p-5 flex justify-between items-start gap-4 hover:bg-stone-50/50"
                      >
                        <div className="text-xs text-stone-700 leading-relaxed font-jakarta">
                          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                            <span className="font-bold text-stone-950 text-sm">{addr.name}</span>
                            {addr.isDefault && (
                              <span className="bg-[#e2edd3] text-[#384401] text-[9px] font-bold px-2 py-0.5 rounded-full uppercase">
                                DEFAULT
                              </span>
                            )}
                          </div>
                          <p>{addr.address}</p>
                          <p>{addr.city} - {addr.pincode}</p>
                          <p className="text-stone-500 font-bold mt-1">Phone: {addr.phone}</p>
                        </div>

                        <button
                          onClick={() => deleteAddress(addr.id)}
                          className="p-1.5 text-stone-400 hover:text-red-650 transition-colors cursor-pointer rounded-lg hover:bg-stone-100"
                          aria-label="Delete address"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* TAB: MY ORDERS & DETAILS */}
            {activeTab === 'orders' && (
              <div className="flex flex-col gap-6">
                <div>
                  <h2 className="text-xl font-bold font-jakarta text-stone-950 mb-1">My Orders</h2>
                  <p className="text-stone-700 text-xs leading-relaxed">Track and view history of your village-crafted product orders.</p>
                </div>

                <div className="flex flex-col gap-4">
                  {user.orders.length === 0 ? (
                    <div className="text-center py-16 border-2 border-dashed border-stone-200 rounded-[24px] text-stone-450 text-xs">
                      <ShoppingBag className="w-10 h-10 text-stone-300 mx-auto mb-3" />
                      No orders placed yet. Add traditional products to pantry.
                    </div>
                  ) : (
                    user.orders.map((order) => {
                      const isExpanded = expandedOrderId === order.id;
                      return (
                        <div
                          key={order.id}
                          className="border border-[#eeddb9] rounded-2xl overflow-hidden shadow-xs"
                        >
                          {/* Order Header Summary Row */}
                          <div 
                            onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                            className="bg-[#FAF4E6]/50 hover:bg-[#FAF4E6] p-4 md:p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-3 cursor-pointer border-b border-[#eeddb9]/50 select-none"
                          >
                            <div className="text-xs font-jakarta flex flex-col gap-1">
                              <span className="font-bold text-stone-950 text-sm uppercase">Order #{order.id}</span>
                              <span className="text-stone-700">Placed on: {order.date}</span>
                            </div>

                            <div className="flex items-center gap-6 justify-between w-full md:w-auto">
                              <div className="text-xs font-jakarta text-right">
                                <span className="text-stone-700 block mb-0.5">Total Amount</span>
                                <span className="font-extrabold text-stone-900 text-sm">₹{order.total}</span>
                              </div>
                              
                              <div className="flex items-center gap-3">
                                <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase ${
                                  order.status === 'Delivered' 
                                    ? 'bg-[#e2edd3] text-[#384401]'
                                    : order.status === 'Cancelled'
                                      ? 'bg-red-50 text-red-650'
                                      : 'bg-[#FFECCB] text-[#5C4018]'
                                }`}>
                                  {order.status}
                                </span>
                                <ChevronRight className={`w-4 h-4 text-stone-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                              </div>
                            </div>
                          </div>

                           {/* Expanded Order Items and Address Details */}
                          {isExpanded && (
                            <div className="p-5 bg-white flex flex-col gap-5 border-t border-[#eeddb9]/30">
                              
                              {/* Product items list */}
                              <div className="flex flex-col gap-3">
                                <h4 className="text-[11px] font-bold text-stone-700 uppercase tracking-wide">Items Purchased</h4>
                                {order.items.map((item) => (
                                  <div key={`${item.id}-${item.weight}`} className="flex justify-between items-center gap-4 text-xs font-jakarta py-1">
                                    <div>
                                      <span className="font-bold text-stone-950">{item.name}</span>
                                      <span className="text-stone-700 ml-1.5 font-semibold font-jakarta">({item.weight}) x {item.quantity}</span>
                                    </div>
                                    <span className="font-extrabold text-stone-900">₹{item.price * item.quantity}</span>
                                  </div>
                                ))}
                              </div>

                              {/* Price Math */}
                              <div className="border-y border-stone-100 py-3 text-xs font-jakarta text-stone-700 flex flex-col gap-1.5 max-w-xs ml-auto w-full">
                                <div className="flex justify-between">
                                  <span>Subtotal</span>
                                  <span className="font-semibold text-stone-900">₹{order.subtotal}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Shipping Charges</span>
                                  <span className="font-semibold text-[#384401]">
                                    {order.shipping === 0 ? 'FREE' : `₹${order.shipping}`}
                                  </span>
                                </div>
                                <div className="flex justify-between font-semibold">
                                  <span>Tax (GST 5%)</span>
                                  <span className="font-semibold text-stone-900">₹{order.tax}</span>
                                </div>
                                <div className="flex justify-between font-extrabold text-stone-950 text-sm border-t border-stone-100 pt-2 mt-1">
                                  <span>Paid Total</span>
                                  <span>₹{order.total}</span>
                                </div>
                              </div>

                              {/* Shipping address details */}
                              <div className="text-xs text-stone-700 leading-relaxed font-jakarta">
                                <h4 className="text-[11px] font-bold text-stone-700 uppercase tracking-wide mb-1.5">Delivered Address</h4>
                                <p className="font-bold text-stone-950">{order.address.name}</p>
                                <p>{order.address.address}</p>
                                <p>{order.address.city} - {order.address.pincode}</p>
                                <p className="text-stone-700 font-semibold mt-0.5">Phone contact: {order.address.phone}</p>
                              </div>

                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {/* TAB: PRODUCT REVIEWS */}
            {activeTab === 'reviews' && (
              <div className="flex flex-col gap-6">
                <div>
                  <h2 className="text-xl font-bold font-jakarta text-stone-950 mb-1">Product Reviews</h2>
                  <p className="text-stone-500 text-xs leading-relaxed">View reviews you written or write a feedback for your purchased products.</p>
                </div>

                {/* Optional Review form for testing */}
                <form onSubmit={handleAddReviewSubmit} className="bg-[#FAF4E6]/50 border border-[#eeddb9]/60 rounded-xl p-4 flex flex-col gap-3">
                  <h3 className="text-xs font-bold text-stone-900 font-jakarta uppercase tracking-wide">Write a Review</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <select
                      required
                      value={reviewProdId}
                      onChange={(e) => setReviewProdId(e.target.value)}
                      className="h-10 px-3 bg-white border border-[#eeddb9] rounded-lg text-xs text-stone-700 focus:outline-hidden"
                    >
                      <option value="">Select Product...</option>
                      {PRODUCTS.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                    
                    <select
                      required
                      value={reviewRating}
                      onChange={(e) => setReviewRating(Number(e.target.value))}
                      className="h-10 px-3 bg-white border border-[#eeddb9] rounded-lg text-xs text-stone-700 focus:outline-hidden"
                    >
                      {[5, 4, 3, 2, 1].map(n => (
                        <option key={n} value={n}>{n} Stars</option>
                      ))}
                    </select>
                  </div>

                  <textarea
                    required
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#eeddb9] rounded-lg text-xs text-stone-900 h-14 resize-none focus:outline-hidden font-jakarta"
                    placeholder="Write your honest comments about this organic goods product..."
                  />

                  <button
                    type="submit"
                    className="w-fit bg-[#384401] hover:bg-[#252d00] text-white text-[10px] font-bold py-2 px-5 rounded-lg transition-colors cursor-pointer"
                  >
                    Submit Review
                  </button>
                </form>

                {/* Reviews List */}
                <div className="flex flex-col gap-4">
                  {user.reviews.length === 0 ? (
                    <div className="text-center py-8 border border-dashed border-stone-200 rounded-2xl text-stone-400 text-xs">
                      You haven't posted any reviews yet.
                    </div>
                  ) : (
                    user.reviews.map((rev) => (
                      <div
                        key={rev.id}
                        className="border border-[#eeddb9]/50 rounded-2xl p-4 flex flex-col gap-2 bg-stone-50/20"
                      >
                        <div className="flex justify-between items-center gap-4 flex-wrap">
                          <span className="font-bold text-stone-900 text-sm font-jakarta">{rev.productName}</span>
                          <span className="text-[10px] text-stone-400 font-jakarta">{rev.date}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <span 
                              key={i} 
                              className={`text-sm ${i < rev.rating ? 'text-amber-500' : 'text-stone-200'}`}
                            >
                              ★
                            </span>
                          ))}
                        </div>
                        <p className="text-stone-700 text-xs leading-relaxed font-jakarta mt-1">"{rev.comment}"</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* TAB: NOTIFICATIONS */}
            {activeTab === 'notifications' && (
              <div className="flex flex-col gap-6">
                <div>
                  <h2 className="text-xl font-bold font-jakarta text-stone-950 mb-1">My Notifications</h2>
                  <p className="text-stone-500 text-xs leading-relaxed">Alerts regarding orders, dispatches, and member announcements.</p>
                </div>

                <div className="flex flex-col gap-3">
                  {user.notifications.length === 0 ? (
                    <div className="text-center py-10 border border-dashed border-stone-200 rounded-2xl text-stone-400 text-xs">
                      No notifications or announcements.
                    </div>
                  ) : (
                    user.notifications.map((n) => (
                      <div
                        key={n.id}
                        className="bg-stone-50 border-l-4 border-[#384401] rounded-r-xl p-4 flex justify-between gap-4"
                      >
                        <div className="text-xs font-jakarta flex flex-col gap-1.5 leading-relaxed text-stone-750">
                          <h4 className="font-bold text-stone-950">{n.title}</h4>
                          <p>{n.message}</p>
                          <span className="text-[9px] text-stone-400 block mt-1">{n.date}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
