'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  User as UserIcon, ShoppingBag, MapPin, Heart, MessageSquare, 
  Bell, LogOut, ChevronRight, CheckCircle2, AlertCircle, Plus, Trash2, Home, Edit
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
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [addrName, setAddrName] = useState('');
  const [addrPhone, setAddrPhone] = useState('');
  const [addrAddress, setAddrAddress] = useState('');
  const [addrCity, setAddrCity] = useState('');
  const [addrState, setAddrState] = useState('');
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
    
    if (editingAddressId) {
      const updatedAddresses = user.addresses.map(addr => 
        addr.id === editingAddressId 
          ? { ...addr, name: addrName, phone: addrPhone, address: addrAddress, city: addrCity, state: addrState, pincode: addrPincode, isDefault: addrDefault } 
          : addr
      );
      updateUserProfile({ addresses: updatedAddresses });
      triggerNotification('Address updated successfully!');
      setEditingAddressId(null);
    } else {
      addAddress({
        name: addrName,
        phone: addrPhone,
        address: addrAddress,
        city: addrCity,
        state: addrState,
        pincode: addrPincode,
        isDefault: addrDefault,
      });
      triggerNotification('Address added to book!');
    }
    
    // Reset form
    setAddrName('');
    setAddrPhone('');
    setAddrAddress('');
    setAddrCity('');
    setAddrState('');
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

      <main className="flex-grow pt-32 pb-24 px-4 md:px-8 mx-auto w-full max-w-[1400px]">
        
        {/* Banner Card */}
        <div className="bg-[#462617] rounded-[24px] p-6 md:p-8 text-white mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-md relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-cover" style={{ backgroundImage: "url('/images/product-section/bottom-paper-texture.webp')" }}></div>
          <div className="relative z-10">
            <span className="text-[#D4E47A] text-xs font-bold uppercase tracking-widest block mb-1">MEMBER ACCOUNT</span>
            <h1 className="font-display text-2xl md:text-3xl font-bold">
              Welcome, {user.name || 'Village Member'}!
            </h1>
            <p className="text-stone-200 text-xs mt-1 font-medium">Registered Mobile: {user.mobile}</p>
          </div>
          <button 
            onClick={handleLogout}
            className="relative z-10 flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl text-xs font-bold font-jakarta transition-colors border border-white/25 cursor-pointer"
          >
            <LogOut className="w-4.5 h-4.5" /> Logout
          </button>
        </div>

        {/* Messaging Feedback Toasts */}
        {successMsg && (
          <div className="bg-[#e2edd3] border border-[#d2c9b4]/50 text-[#384401] px-5 py-3.5 rounded-2xl text-xs font-semibold mb-6 flex gap-2.5 items-center animate-fade-in shadow-xs">
            <CheckCircle2 className="w-4.5 h-4.5 shrink-0 text-[#384401]" />
            {successMsg}
          </div>
        )}
        {errorMsg && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-5 py-3.5 rounded-2xl text-xs font-semibold mb-6 flex gap-2.5 items-center animate-fade-in shadow-xs">
            <AlertCircle className="w-4.5 h-4.5 shrink-0 text-red-600" />
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
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs sm:text-sm font-semibold font-jakarta transition-colors cursor-pointer ${
                    activeTab === item.id
                      ? 'bg-[#384401] text-white font-bold'
                      : 'text-stone-700 hover:bg-stone-50 hover:text-stone-950'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4.5 h-4.5" />
                    {item.label}
                  </div>
                  <ChevronRight className={`w-3.5 h-3.5 opacity-60 ${activeTab === item.id ? 'text-white' : ''}`} />
                </button>
              );
            })}
          </aside>

          {/* Details Area / Right Column Content */}
          <section className="w-full lg:w-[72%] bg-white border border-[#eeddb9]/50 rounded-[24px] p-6 md:p-8 shadow-xs flex flex-col min-h-[480px]">
            
            {/* TAB: DASHBOARD */}
            {activeTab === 'dashboard' && (
              <div className="flex flex-col gap-6">
                <div>
                  <h2 className="text-xl md:text-2xl font-bold font-jakarta text-stone-955 mb-1">Account Dashboard</h2>
                  <p className="text-stone-600 text-xs leading-relaxed">Overview of your account settings, orders, and addresses.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Order Overview Card */}
                  <div className="bg-[#FAF4E6] border border-[#eeddb9] rounded-xl p-5 transition-all duration-300 hover:shadow-sm">
                    <h3 className="text-sm font-bold text-stone-900 mb-2 font-jakarta flex items-center gap-2">
                      <ShoppingBag className="w-4 h-4 text-[#384401]" /> Orders Log
                    </h3>
                    <p className="text-stone-700 text-xs mb-3.5">You have placed {user.orders.length} order(s) traditionally prepared.</p>
                    <button 
                      onClick={() => setActiveTab('orders')}
                      className="text-xs font-bold text-[#384401] hover:underline cursor-pointer flex items-center gap-0.5"
                    >
                      View all orders →
                    </button>
                  </div>

                  {/* Address Summary Card */}
                  <div className="bg-[#FAF4E6] border border-[#eeddb9] rounded-xl p-5 transition-all duration-300 hover:shadow-sm">
                    <h3 className="text-sm font-bold text-stone-900 mb-2 font-jakarta flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-[#C56C4F]" /> Primary Address
                    </h3>
                    {user.addresses.length === 0 ? (
                      <p className="text-stone-700 text-xs mb-3.5">No shipping addresses saved in your address book yet.</p>
                    ) : (
                      <div className="text-xs text-stone-700 leading-relaxed mb-3.5 truncate">
                        <strong className="text-stone-900">{user.addresses.find(a => a.isDefault)?.name || user.addresses[0].name}</strong><br/>
                        {user.addresses.find(a => a.isDefault)?.address || user.addresses[0].address}
                      </div>
                    )}
                    <button 
                      onClick={() => setActiveTab('addresses')}
                      className="text-xs font-bold text-[#384401] hover:underline cursor-pointer flex items-center gap-0.5"
                    >
                      Manage addresses →
                    </button>
                  </div>
                </div>

                {/* Notifications Panel teaser */}
                <div className="bg-stone-50 border border-stone-200/50 rounded-xl p-5 mt-1">
                  <h3 className="text-sm font-bold text-stone-900 mb-3 font-jakarta flex items-center gap-2">
                    <Bell className="w-4.5 h-4.5 text-stone-700" /> Recent Notification
                  </h3>
                  {user.notifications.length === 0 ? (
                    <p className="text-stone-600 text-xs">No notifications yet.</p>
                  ) : (
                    <div className="flex flex-col gap-1.5 border-l-2 border-[#384401] pl-3">
                      <h4 className="text-xs font-bold text-stone-950">{user.notifications[0].title}</h4>
                      <p className="text-xs text-stone-700 leading-relaxed">{user.notifications[0].message}</p>
                      <span className="text-[10px] text-stone-500 font-jakarta">{user.notifications[0].date}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB: PROFILE */}
            {activeTab === 'profile' && (
              <div className="flex flex-col gap-6">
                <div>
                  <h2 className="text-xl md:text-2xl font-bold font-jakarta text-stone-950 mb-1">My Profile</h2>
                  <p className="text-stone-600 text-xs leading-relaxed">Update your contact information below. Mobile number cannot be changed.</p>
                </div>

                <form onSubmit={handleProfileSave} className="flex flex-col gap-4 max-w-lg">
                  <div>
                    <label className="text-xs sm:text-sm font-extrabold text-[#3E2C1C] uppercase tracking-wider block mb-2 font-jakarta">Registered Mobile</label>
                    <input
                      type="text"
                      disabled
                      value={user.mobile}
                      className="w-full h-11 px-3.5 bg-stone-100 border border-stone-200 rounded-xl text-xs sm:text-sm text-stone-655 focus:outline-hidden cursor-not-allowed font-jakarta font-medium"
                    />
                  </div>

                  <div>
                    <label className="text-xs sm:text-sm font-extrabold text-[#3E2C1C] uppercase tracking-wider block mb-2 font-jakarta">Full Name</label>
                    <input
                      type="text"
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      className="w-full h-11 px-3.5 bg-white border border-[#eeddb9] focus:border-[#384401] rounded-xl text-xs sm:text-sm text-stone-900 focus:outline-hidden font-jakarta"
                      placeholder="e.g. Ravi Kiran"
                    />
                  </div>

                  <div>
                    <label className="text-xs sm:text-sm font-extrabold text-[#3E2C1C] uppercase tracking-wider block mb-2 font-jakarta">Email Address</label>
                    <input
                      type="email"
                      value={profileEmail}
                      onChange={(e) => setProfileEmail(e.target.value)}
                      className="w-full h-11 px-3.5 bg-white border border-[#eeddb9] focus:border-[#384401] rounded-xl text-xs sm:text-sm text-stone-900 focus:outline-hidden font-jakarta"
                      placeholder="e.g. ravi@example.com"
                    />
                  </div>

                  <div>
                    <label className="text-xs sm:text-sm font-extrabold text-[#3E2C1C] uppercase tracking-wider block mb-2 font-jakarta">Alternative Contact Number</label>
                    <input
                      type="tel"
                      value={profilePhone}
                      onChange={(e) => setProfilePhone(e.target.value)}
                      className="w-full h-11 px-3.5 bg-white border border-[#eeddb9] focus:border-[#384401] rounded-xl text-xs sm:text-sm text-stone-900 focus:outline-hidden font-jakarta"
                      placeholder="e.g. 10-digit mobile"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-fit px-6 h-11 bg-[#384401] hover:bg-[#252d00] text-white font-bold rounded-xl transition-all shadow-xs cursor-pointer text-xs sm:text-sm mt-2"
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
                    <h2 className="text-xl md:text-2xl font-bold font-jakarta text-stone-950 mb-1">Address Book</h2>
                    <p className="text-stone-600 text-xs leading-relaxed">Manage your shipping address cards for faster checkouts.</p>
                  </div>
                  {!showAddAddress && (
                    <button
                      onClick={() => setShowAddAddress(true)}
                      className="flex items-center gap-1.5 bg-[#384401] hover:bg-[#252d00] text-white text-xs font-bold py-2 px-4 rounded-xl transition-colors cursor-pointer shadow-xs"
                    >
                      <Plus className="w-4 h-4" /> Add Address
                    </button>
                  )}
                </div>

                {/* Add Address Form overlay or insert */}
                {showAddAddress && (
                  <form onSubmit={handleAddAddressSubmit} className="bg-[#FAF4E6] border border-[#eeddb9] rounded-2xl p-5 flex flex-col gap-4">
                    <h3 className="font-jakarta font-black text-base md:text-lg text-[#6a1010] border-b border-stone-250/20 pb-2.5 mb-4 uppercase">
                      {editingAddressId ? 'Edit Delivery Address' : 'New Delivery Address'}
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs sm:text-sm font-extrabold text-[#3E2C1C] uppercase tracking-wider block mb-2 font-jakarta">Recipient Name <span className="text-red-500">*</span></label>
                        <input
                          type="text"
                          required
                          value={addrName}
                          onChange={(e) => setAddrName(e.target.value)}
                          className="w-full h-10 px-3 bg-white border border-[#eeddb9] rounded-xl text-xs sm:text-sm text-stone-900 focus:outline-hidden"
                          placeholder="e.g. Ramesh"
                        />
                      </div>
                      <div>
                        <label className="text-xs sm:text-sm font-extrabold text-[#3E2C1C] uppercase tracking-wider block mb-2 font-jakarta">Recipient Phone <span className="text-red-500">*</span></label>
                        <input
                          type="tel"
                          required
                          value={addrPhone}
                          onChange={(e) => setAddrPhone(e.target.value)}
                          className="w-full h-10 px-3 bg-white border border-[#eeddb9] rounded-xl text-xs sm:text-sm text-[#000] focus:outline-hidden"
                          placeholder="10-digit number"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs sm:text-sm font-extrabold text-[#3E2C1C] uppercase tracking-wider block mb-2 font-jakarta">Street Address <span className="text-red-500">*</span></label>
                      <textarea
                        required
                        value={addrAddress}
                        onChange={(e) => setAddrAddress(e.target.value)}
                        className="w-full px-3.5 py-2 bg-white border border-[#eeddb9] rounded-xl text-xs sm:text-sm text-stone-900 h-16 resize-none focus:outline-hidden"
                        placeholder="House no, Building, Street name"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="text-xs sm:text-sm font-extrabold text-[#3E2C1C] uppercase tracking-wider block mb-2 font-jakarta">City <span className="text-red-500">*</span></label>
                        <input
                          type="text"
                          required
                          value={addrCity}
                          onChange={(e) => setAddrCity(e.target.value)}
                          className="w-full h-10 px-3 bg-white border border-[#eeddb9] rounded-xl text-xs sm:text-sm text-stone-900 focus:outline-hidden"
                          placeholder="e.g. Bengaluru"
                        />
                      </div>
                      <div>
                        <label className="text-xs sm:text-sm font-extrabold text-[#3E2C1C] uppercase tracking-wider block mb-2 font-jakarta">State <span className="text-red-500">*</span></label>
                        <input
                          type="text"
                          required
                          value={addrState}
                          onChange={(e) => setAddrState(e.target.value)}
                          className="w-full h-10 px-3 bg-white border border-[#eeddb9] rounded-xl text-xs sm:text-sm text-stone-900 focus:outline-hidden"
                          placeholder="e.g. Karnataka"
                        />
                      </div>
                      <div>
                        <label className="text-xs sm:text-sm font-extrabold text-[#3E2C1C] uppercase tracking-wider block mb-2 font-jakarta">Pincode <span className="text-red-500">*</span></label>
                        <input
                          type="text"
                          required
                          pattern="[0-9]{6}"
                          value={addrPincode}
                          onChange={(e) => setAddrPincode(e.target.value)}
                          className="w-full h-10 px-3 bg-white border border-[#eeddb9] rounded-xl text-xs sm:text-sm text-stone-900 focus:outline-hidden"
                          placeholder="e.g. 560001"
                        />
                      </div>
                    </div>

                    <label className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-stone-700 cursor-pointer select-none">
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
                        onClick={() => {
                          setEditingAddressId(null);
                          setAddrName('');
                          setAddrPhone('');
                          setAddrAddress('');
                          setAddrCity('');
                          setAddrState('');
                          setAddrPincode('');
                          setAddrDefault(false);
                          setShowAddAddress(false);
                        }}
                        className="bg-white border border-[#eeddb9] hover:bg-[#FAF4E6]/50 text-stone-700 font-bold px-4 py-2 rounded-xl text-xs sm:text-sm transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="bg-[#384401] hover:bg-[#252d00] text-white font-bold px-4 py-2 rounded-xl text-xs sm:text-sm transition-colors cursor-pointer"
                      >
                        {editingAddressId ? 'Update Address' : 'Save Address'}
                      </button>
                    </div>
                  </form>
                )}

                {/* Addresses List */}
                <div className="flex flex-col gap-4">
                  {user.addresses.length === 0 ? (
                    <div className="text-center py-10 border border-dashed border-stone-200 rounded-xl text-stone-400 text-xs sm:text-sm">
                      No addresses saved. Click "Add Address" to register a delivery card.
                    </div>
                  ) : (
                    user.addresses.map((addr) => (
                      <div
                        key={addr.id}
                        className="border border-[#eeddb9]/70 rounded-2xl p-5 flex justify-between items-start gap-4 hover:bg-stone-50/50 transition-colors"
                      >
                        <div className="text-xs sm:text-sm text-stone-700 leading-relaxed font-jakarta">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            {addr.isDefault && (
                              <span className="bg-[#e2edd3] text-[#384401] text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                                DEFAULT
                              </span>
                            )}
                          </div>
                          <div className="grid grid-cols-1 gap-1">
                            <p className='text-black'><span className="font-bold text-stone-900 min-w-[75px] inline-block">Name:</span> {addr.name}</p>
                            <p className='text-black'><span className="font-bold text-stone-900 min-w-[75px] inline-block">Address:</span> {addr.address}</p>
                            <p className='text-black'><span className="font-bold text-stone-900 min-w-[75px] inline-block">City:</span> {addr.city}</p>
                            <p className='text-black'><span className="font-bold text-stone-900 min-w-[75px] inline-block">State:</span> {addr.state || 'Karnataka'}</p>
                            <p className='text-black'><span className="font-bold text-stone-900 min-w-[75px] inline-block">Pincode:</span> {addr.pincode}</p>
                            <p className="mt-1 text-black"><span className="font-bold text-stone-900 min-w-[75px] inline-block">Phone:</span> {addr.phone}</p>
                          </div>
                        </div>

                        <div className="flex gap-1.5 shrink-0">
                          <button
                            onClick={() => {
                              setEditingAddressId(addr.id);
                              setAddrName(addr.name);
                              setAddrPhone(addr.phone);
                              setAddrAddress(addr.address);
                              setAddrCity(addr.city);
                              setAddrState(addr.state || '');
                              setAddrPincode(addr.pincode);
                              setAddrDefault(addr.isDefault || false);
                              setShowAddAddress(true);
                            }}
                            className="p-1.5 text-stone-400 hover:text-[#384401] transition-colors cursor-pointer rounded-lg hover:bg-stone-100"
                            aria-label="Edit address"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteAddress(addr.id)}
                            className="p-1.5 text-stone-400 hover:text-red-650 transition-colors cursor-pointer rounded-lg hover:bg-stone-100"
                            aria-label="Delete address"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
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
                  <h2 className="text-xl md:text-2xl font-bold font-jakarta text-[#3E2C1C] mb-1">My Orders</h2>
                  <p className="text-stone-600 text-xs leading-relaxed">Track and view history of your village-crafted product orders.</p>
                </div>

                <div className="flex flex-col gap-4">
                  {user.orders.length === 0 ? (
                    <div className="text-center py-16 border-2 border-dashed border-stone-200 rounded-[24px] text-stone-400 text-xs sm:text-sm">
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
                            className="bg-[#FAF4E6]/50 hover:bg-[#FAF4E6] p-4 md:p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-3 cursor-pointer border-b border-[#eeddb9]/50 select-none transition-colors"
                          >
                            <div className="text-xs sm:text-sm font-jakarta flex flex-col gap-1">
                              <span className="font-bold text-stone-955 text-sm sm:text-base uppercase">Order #{order.id}</span>
                              <span className="text-stone-600 font-medium">Placed on: {order.date}</span>
                            </div>

                            <div className="flex items-center gap-6 justify-between w-full md:w-auto">
                              <div className="text-xs sm:text-sm font-jakarta text-right">
                                <span className="text-stone-600 block mb-0.5 font-medium">Total Amount</span>
                                <span className="font-extrabold text-stone-950 text-sm sm:text-base">₹{order.total}</span>
                              </div>
                              
                              <div className="flex items-center gap-3">
                                <span className={`text-[9px] sm:text-[10px] font-bold px-3 py-0.5 rounded-full uppercase tracking-wider ${
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
                                <h4 className="text-xs sm:text-sm font-extrabold text-[#3E2C1C] uppercase tracking-wider block mb-2">Items Purchased</h4>
                                {order.items.map((item) => (
                                  <div key={`${item.id}-${item.weight}`} className="flex justify-between items-center gap-4 text-xs sm:text-sm font-jakarta py-1.5 border-b border-stone-100 last:border-0">
                                    <div>
                                      <span className="font-bold text-stone-950">{item.name}</span>
                                      <span className="text-stone-600 ml-2 font-bold">({item.weight}) x {item.quantity}</span>
                                    </div>
                                    <span className="font-extrabold text-stone-950">₹{item.price * item.quantity}</span>
                                  </div>
                                ))}
                              </div>

                              {/* Price Math */}
                              <div className="border-y border-[#eeddb9]/30 py-3.5 text-xs sm:text-sm font-jakarta text-stone-950 flex flex-col gap-1.5 max-w-xs ml-auto w-full">
                                <div className="flex justify-between">
                                  <span className="font-semibold">Subtotal</span>
                                  <span className="font-black text-black">₹{order.subtotal}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="font-semibold">Shipping Charges</span>
                                  <span className="font-black text-[#384401]">
                                    {order.shipping === 0 ? 'FREE' : `₹${order.shipping}`}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="font-semibold">Tax (GST 5%)</span>
                                  <span className="font-black text-black">₹{order.tax}</span>
                                </div>
                                <div className="flex justify-between font-black text-stone-950 text-sm sm:text-base border-t border-[#eeddb9]/30 pt-2 mt-1">
                                  <span>Paid Total</span>
                                  <span className="text-[#384401]">₹{order.total}</span>
                                </div>
                              </div>

                              {/* Shipping address details */}
                              <div className="text-xs sm:text-sm text-stone-950 leading-relaxed font-jakarta">
                                <h4 className="text-xs sm:text-sm font-extrabold text-[#3E2C1C] uppercase tracking-wider block mb-3">Delivered Address</h4>
                                <div className="grid grid-cols-1 gap-1 text-black">
                                  <p><span className="font-bold text-stone-900 min-w-[85px] inline-block">Name:</span> {order.address.name}</p>
                                  <p><span className="font-bold text-stone-900 min-w-[85px] inline-block">Address:</span> {order.address.address}</p>
                                  <p><span className="font-bold text-stone-900 min-w-[85px] inline-block">City:</span> {order.address.city}</p>
                                  <p><span className="font-bold text-stone-900 min-w-[85px] inline-block">State:</span> {order.address.state || 'Karnataka'}</p>
                                  <p><span className="font-bold text-stone-900 min-w-[85px] inline-block">Pincode:</span> {order.address.pincode}</p>
                                  <p className="mt-1"><span className="font-bold text-stone-900 min-w-[85px] inline-block">Phone:</span> {order.address.phone}</p>
                                </div>
                              </div>

                              {/* Track & Manage order navigation button */}
                              <div className="flex justify-end pt-3 mt-1.5 border-t border-[#eeddb9]/30">
                                <Link 
                                  href={`/orders/${order.id}`}
                                  className="px-5 py-2.5 bg-[#384401] hover:bg-[#252d00] text-white text-xs font-medium rounded-xl transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer active:scale-95"
                                >
                                  Track & Manage Order
                                </Link>
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
                  <h2 className="text-xl md:text-2xl font-bold font-jakarta text-stone-955 mb-1">Product Reviews</h2>
                  <p className="text-stone-600 text-xs leading-relaxed">View reviews you written or write a feedback for your purchased products.</p>
                </div>

                {/* Optional Review form for testing */}
                <form onSubmit={handleAddReviewSubmit} className="bg-[#FAF4E6]/50 border border-[#eeddb9]/60 rounded-xl p-5 flex flex-col gap-4">
                  <h3 className="text-xs sm:text-sm font-extrabold text-[#3E2C1C] uppercase tracking-wider block mb-2">Write a Review</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <select
                      required
                      value={reviewProdId}
                      onChange={(e) => setReviewProdId(e.target.value)}
                      className="h-10 px-3 bg-white border border-[#eeddb9] rounded-xl text-xs sm:text-sm text-stone-850 focus:outline-hidden"
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
                      className="h-10 px-3 bg-white border border-[#eeddb9] rounded-xl text-xs sm:text-sm text-stone-850 focus:outline-hidden"
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
                    className="w-full px-3.5 py-2 bg-white border border-[#eeddb9] rounded-xl text-xs sm:text-sm text-stone-900 h-16 resize-none focus:outline-hidden font-jakarta"
                    placeholder="Write your honest comments about this organic goods product..."
                  />

                  <button
                    type="submit"
                    className="w-fit bg-[#384401] hover:bg-[#252d00] text-white text-xs font-bold py-2.5 px-5 rounded-xl transition-colors cursor-pointer shadow-xs"
                  >
                    Submit Review
                  </button>
                </form>

                {/* Reviews List */}
                <div className="flex flex-col gap-4">
                  {user.reviews.length === 0 ? (
                    <div className="text-center py-10 border border-dashed border-stone-200 rounded-2xl text-stone-400 text-xs sm:text-sm">
                      You haven't posted any reviews yet.
                    </div>
                  ) : (
                    user.reviews.map((rev) => (
                      <div
                        key={rev.id}
                        className="border border-[#eeddb9]/50 rounded-2xl p-4 flex flex-col gap-2.5 bg-stone-50/20"
                      >
                        <div className="flex justify-between items-center gap-4 flex-wrap">
                          <span className="font-bold text-stone-950 text-sm sm:text-base font-jakarta">{rev.productName}</span>
                          <span className="text-xs text-stone-500 font-jakarta">{rev.date}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <span 
                              key={i} 
                              className={`text-sm sm:text-base ${i < rev.rating ? 'text-amber-500' : 'text-stone-200'}`}
                            >
                              ★
                            </span>
                          ))}
                        </div>
                        <p className="text-stone-700 text-xs sm:text-sm leading-relaxed font-jakarta mt-1">"{rev.comment}"</p>
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
                  <h2 className="text-xl md:text-2xl font-bold font-jakarta text-stone-955 mb-1">My Notifications</h2>
                  <p className="text-stone-600 text-xs leading-relaxed">Alerts regarding orders, dispatches, and member announcements.</p>
                </div>

                <div className="flex flex-col gap-4">
                  {user.notifications.length === 0 ? (
                    <div className="text-center py-12 border border-dashed border-stone-200 rounded-2xl text-stone-400 text-xs sm:text-sm">
                      No notifications or announcements.
                    </div>
                  ) : (
                    user.notifications.map((n) => (
                      <div
                        key={n.id}
                        className="bg-stone-50 border-l-4 border-[#384401] rounded-r-2xl p-4 flex justify-between gap-4"
                      >
                        <div className="text-xs sm:text-sm font-jakarta flex flex-col gap-1.5 leading-relaxed text-stone-750">
                          <h4 className="font-bold text-stone-950 text-sm sm:text-base">{n.title}</h4>
                          <p>{n.message}</p>
                          <span className="text-[10px] text-stone-400 block mt-1">{n.date}</span>
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
