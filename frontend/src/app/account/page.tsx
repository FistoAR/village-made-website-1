'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  User as UserIcon, ShoppingBag, MapPin, Heart, MessageSquare,
  Bell, LogOut, ChevronRight, CheckCircle2, AlertCircle, Plus, Trash2, Home, Edit,
  CheckCheck, Package, Shield, Inbox, BellOff, Download, LifeBuoy
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useApp, UserAddress, UserOrder } from '@/lib/context/AppContext';
import { PRODUCTS } from '@/data/products-list';
import { jsPDF } from 'jspdf';

type AccountTab = 'dashboard' | 'profile' | 'addresses' | 'orders' | 'wishlist' | 'reviews' | 'notifications' | 'tickets';

export default function AccountPage() {
  const router = useRouter();
  const {
    user, logoutUser, updateUserProfile, addAddress, deleteAddress, addReview, showConfirm, isHydrated,
    markAllNotificationsAsRead, markNotificationAsRead, deleteNotification, clearAllNotifications,
    updateOrderStatus, showToast, fetchProducts, tickets, refreshUserProfile, addProductReview
  } = useApp();

  const [activeTab, setActiveTab] = useState<AccountTab>('dashboard');
  const [mounted, setMounted] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Profile forms
  const [profileName, setProfileName] = useState('');
  const [profileEmail, setProfileEmail] = useState('');
  const [profilePhone, setProfilePhone] = useState('');

  // Password change form
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [updatingPassword, setUpdatingPassword] = useState(false);

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
  const [reviewCategory, setReviewCategory] = useState('');
  const [reviewProdId, setReviewProdId] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewTitle, setReviewTitle] = useState('');
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);

  const reviewableProducts = useMemo(() => {
    if (!user) return [];
    const allowedStatuses = ['Delivered', 'Returned', 'Return Requested', 'Return Rejected'];
    const productsMap = new Map<string, { id: string; name: string; category: string }>();
    
    // Find all products that have been delivered or returned
    user.orders?.forEach(order => {
      if (allowedStatuses.includes(order.status)) {
        order.items?.forEach(item => {
          const pInfo = PRODUCTS.find(p => p.id === item.id);
          if (pInfo) {
            productsMap.set(pInfo.id, {
              id: pInfo.id,
              name: pInfo.name,
              category: pInfo.category
            });
          }
        });
      }
    });

    // Filter out products that the user has already reviewed,
    // but if we are editing, we should keep the editing product in the map.
    const reviewedProductIds = new Set(user.reviews?.map(r => r.productId) || []);
    
    return Array.from(productsMap.values()).filter(p => {
      // If we are editing, keep the product being edited
      if (editingReviewId) {
        const editingRev = user.reviews.find(r => r.id === editingReviewId);
        if (editingRev && editingRev.productId === p.id) {
          return true;
        }
      }
      return !reviewedProductIds.has(p.id);
    });
  }, [user, editingReviewId]);

  const reviewableCategories = useMemo(() => {
    return Array.from(new Set(reviewableProducts.map(p => p.category)));
  }, [reviewableProducts]);

  // Expanded order details tracker
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [returnOrderId, setReturnOrderId] = useState('');
  const [returnReason, setReturnReason] = useState('');
  const [returnReasonCategory, setReturnReasonCategory] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch fresh profile state on mount to ensure order status syncs
  useEffect(() => {
    if (mounted && user) {
      refreshUserProfile();
    }
  }, [mounted]);

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
    if (mounted && isHydrated && !user) {
      router.push('/login?redirect=/account');
    }
  }, [user, mounted, isHydrated, router]);

  const handleCancelOrder = (orderId: string) => {
    showConfirm(
      'Cancel Order?',
      'Are you sure you want to cancel this order? This action cannot be undone and your inventory allocation will be released.',
      async () => {
        try {
          const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
          const res = await fetch(`${baseUrl}/auth/orders/${orderId}/cancel`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
          });
          const data = await res.json();
          if (res.ok && data.success) {
            updateOrderStatus(orderId, 'Cancelled');
            showToast('Order cancelled successfully!', 'success');
            await fetchProducts(); // Refresh products stock
          } else {
            showToast(data.error || 'Failed to cancel order.', 'error');
          }
        } catch (err) {
          console.error(err);
          showToast('Failed to connect to backend server.', 'error');
        }
      }
    );
  };

  const handleRequestReturn = (orderId: string) => {
    setReturnOrderId(orderId);
    setReturnReason('');
    setReturnReasonCategory('');
    setShowReturnModal(true);
  };

  const submitReturnRequest = async () => {
    if (!returnReasonCategory) {
      showToast('Please select a return reason category.', 'error');
      return;
    }
    if (returnReasonCategory === 'Others' && !returnReason.trim()) {
      showToast('Remarks are mandatory when "Others" category is selected.', 'error');
      return;
    }

    const finalRemarks = returnReasonCategory === 'Others'
      ? `Others: ${returnReason.trim()}`
      : `${returnReasonCategory}${returnReason.trim() ? ` - ${returnReason.trim()}` : ''}`;

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
      const res = await fetch(`${baseUrl}/auth/orders/${returnOrderId}/return`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({ remarks: finalRemarks })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        updateOrderStatus(returnOrderId, 'Return Requested');
        setShowReturnModal(false);
        showToast('Return requested successfully!', 'success');
        await refreshUserProfile();
      } else {
        showToast(data.error || 'Failed to submit return request.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to connect to backend server.', 'error');
    }
  };

  const handleDownloadInvoice = (order: UserOrder) => {
    try {
      const doc = new jsPDF();
      
      // Set fonts & colors
      doc.setFont("helvetica", "bold");
      doc.setTextColor(56, 68, 1); // Accent Green (#384401)
      doc.setFontSize(22);
      doc.text("VILLAGE MADE ORGANICS", 20, 20);
      
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text("Authentic Village Crafts & Nutrition", 20, 25);
      
      // Invoice Title
      doc.setFontSize(24);
      doc.setTextColor(197, 108, 79); // Accent Orange (#C56C4F)
      doc.text("INVOICE", 150, 22);

      // Line separator
      doc.setDrawColor(56, 68, 1);
      doc.setLineWidth(0.5);
      doc.line(20, 32, 190, 32);

      // Details columns
      doc.setFont("helvetica", "bold");
      doc.setTextColor(62, 44, 28);
      doc.setFontSize(10);
      doc.text("Bill To:", 20, 42);
      
      doc.setFont("helvetica", "normal");
      doc.setTextColor(50, 50, 50);
      doc.text(`${order.address.name}`, 20, 48);
      doc.text(`Phone: ${order.address.phone}`, 20, 54);
      doc.text(`Email: ${user?.email || 'N/A'}`, 20, 60);
      
      doc.setFont("helvetica", "bold");
      doc.setTextColor(62, 44, 28);
      doc.text("Shipping Destination:", 20, 70);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(50, 50, 50);
      const splitAddress = doc.splitTextToSize(`${order.address.address}, ${order.address.city}, ${order.address.pincode}`, 80);
      doc.text(splitAddress, 20, 76);

      // Invoice Meta Right Column
      doc.setFont("helvetica", "bold");
      doc.setTextColor(62, 44, 28);
      doc.text("Invoice ID:", 120, 42);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(50, 50, 50);
      doc.text(`${order.id}`, 150, 42);

      doc.setFont("helvetica", "bold");
      doc.setTextColor(62, 44, 28);
      doc.text("Order Date:", 120, 48);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(50, 50, 50);
      doc.text(`${order.date}`, 150, 48);

      doc.setFont("helvetica", "bold");
      doc.setTextColor(62, 44, 28);
      doc.text("Payment Mode:", 120, 54);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(50, 50, 50);
      doc.text("PAID", 150, 54);

      doc.setFont("helvetica", "bold");
      doc.setTextColor(62, 44, 28);
      doc.text("Order Status:", 120, 60);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(50, 50, 50);
      doc.text(`${order.status}`, 150, 60);

      // Items table header
      let y = 100;
      doc.setFillColor(250, 244, 230); // #FAF4E6
      doc.rect(20, y, 170, 8, "F");
      
      doc.setFont("helvetica", "bold");
      doc.setTextColor(62, 44, 28);
      doc.text("Item Description", 22, y + 6);
      doc.text("Qty", 120, y + 6);
      doc.text("Price", 145, y + 6);
      doc.text("Total", 175, y + 6);

      doc.setDrawColor(238, 221, 185);
      doc.line(20, y + 8, 190, y + 8);
      
      y += 8;
      doc.setFont("helvetica", "normal");
      doc.setTextColor(80, 80, 80);

      order.items.forEach((item: any) => {
        y += 8;
        if (y > 270) {
          doc.addPage();
          y = 20;
        }
        doc.text(`${item.name} (${item.weight})`, 22, y);
        doc.text(`${item.quantity}`, 122, y);
        doc.text(`₹${item.price}`, 145, y);
        doc.text(`₹${item.price * item.quantity}`, 175, y);
        doc.line(20, y + 2, 190, y + 2);
      });

      // Totals
      y += 12;
      doc.setFont("helvetica", "bold");
      doc.setTextColor(56, 68, 1);
      doc.text("Grand Total Paid:", 120, y);
      doc.text(`₹${order.total}`, 175, y);

      // Footer
      doc.setFont("helvetica", "normal");
      doc.setTextColor(120, 120, 120);
      doc.setFontSize(8);
      doc.text("Thank you for supporting village industries and organic farming initiatives.", 105, 285, { align: "center" });

      doc.save(`invoice-${order.id}.pdf`);
    } catch (e) {
      console.error('Failed to generate PDF invoice', e);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  if (!mounted || !isHydrated || !user) {
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

  const handlePasswordSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.trim().length < 6) {
      triggerNotification('Password must be at least 6 characters long.', true);
      return;
    }
    if (newPassword !== confirmPassword) {
      triggerNotification('Passwords do not match.', true);
      return;
    }

    setUpdatingPassword(true);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
      const res = await fetch(`${baseUrl}/auth/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mobile: user.mobile,
          password: newPassword.trim(),
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        triggerNotification('Password updated successfully!');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        triggerNotification(data.error || 'Failed to update password.', true);
      }
    } catch (err) {
      triggerNotification('Connection error updating password.', true);
    } finally {
      setUpdatingPassword(false);
    }
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

  const handleAddReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewProdId || !reviewComment) {
      triggerNotification('Please select a product and write a review.', true);
      return;
    }

    if (editingReviewId) {
      const updatedReviews = user.reviews.map(r =>
        r.id === editingReviewId
          ? { ...r, rating: reviewRating, comment: reviewComment, title: reviewTitle }
          : r
      );
      updateUserProfile({ reviews: updatedReviews });
      triggerNotification('Review updated successfully!');
      setEditingReviewId(null);
    } else {
      const isEligible = reviewableProducts.some(p => p.id === reviewProdId);
      if (!isEligible) {
        triggerNotification('You can only review products you have purchased and received.', true);
        return;
      }
      const product = PRODUCTS.find(p => p.id === reviewProdId);
      if (!product) return;
      
      const res = await addProductReview(reviewProdId, user.name || 'Verified Buyer', reviewRating, reviewTitle, reviewComment);
      if (res && res.success) {
        // Successful submit is already handled via showToast inside addProductReview context
      }
    }

    setReviewCategory('');
    setReviewProdId('');
    setReviewTitle('');
    setReviewComment('');
    setReviewRating(5);
  };

  const handleDeleteReview = (reviewId: string) => {
    showConfirm(
      'Delete Review',
      'Are you sure you want to delete this review? This action cannot be undone.',
      () => {
        const updatedReviews = user.reviews.filter(r => r.id !== reviewId);
        updateUserProfile({ reviews: updatedReviews });
        triggerNotification('Review deleted successfully!');
      }
    );
  };

  const handleLogout = () => {
    logoutUser();
    router.push('/');
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard Overview', icon: Home },
    { id: 'profile', label: 'Profile & Security', icon: UserIcon },
    { id: 'addresses', label: 'Address Book', icon: MapPin },
    { id: 'orders', label: 'My Orders', icon: ShoppingBag },
    { id: 'reviews', label: 'Product Reviews', icon: MessageSquare },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'tickets', label: 'Support Tickets', icon: LifeBuoy },
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
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs sm:text-sm font-semibold font-jakarta transition-colors cursor-pointer ${activeTab === item.id
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
                        <strong className="text-stone-900">{user.addresses.find(a => a.isDefault)?.name || user.addresses[0].name}</strong><br />
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
              <div className="flex flex-col gap-5">
                <div>
                  <h2 className="text-xl md:text-2xl font-bold font-jakarta text-stone-955 mb-1">Profile & Security</h2>
                  <p className="text-stone-600 text-xs leading-relaxed">Update your contact details and change password credentials below. Mobile number cannot be changed.</p>
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

                {/* Change Password Sub-section */}
                <div className="border-t border-[#eeddb9]/100 pt-3 mt-2">
                  <h3 className="text-lg font-bold font-jakarta text-stone-950 mb-1">Change Password</h3>
                  <p className="text-stone-600 text-xs leading-relaxed mb-5">Set a new password for logging in to your member account.</p>

                  <form onSubmit={handlePasswordSave} className="flex flex-col gap-4 max-w-lg">
                    <div>
                      <label className="text-xs sm:text-sm font-extrabold text-[#3E2C1C] uppercase tracking-wider block mb-2 font-jakarta">New Password</label>
                      <input
                        type="password"
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full h-11 px-3.5 bg-white border border-[#eeddb9] focus:border-[#384401] rounded-xl text-xs sm:text-sm text-stone-900 focus:outline-hidden font-jakarta"
                        placeholder="At least 6 characters"
                      />
                    </div>

                    <div>
                      <label className="text-xs sm:text-sm font-extrabold text-[#3E2C1C] uppercase tracking-wider block mb-2 font-jakarta">Confirm New Password</label>
                      <input
                        type="password"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full h-11 px-3.5 bg-white border border-[#eeddb9] focus:border-[#384401] rounded-xl text-xs sm:text-sm text-stone-900 focus:outline-hidden font-jakarta"
                        placeholder="Re-enter new password"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={updatingPassword}
                      className="w-fit px-6 h-11 bg-[#384401] hover:bg-[#252d00] disabled:bg-[#384401]/55 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all shadow-xs cursor-pointer text-xs sm:text-sm mt-2"
                    >
                      {updatingPassword ? 'Updating...' : 'Update Password'}
                    </button>
                  </form>
                </div>
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
                          <div className="grid grid-cols-1 gap-1 text-black">
                            <div className="flex items-start"><span className="font-bold text-stone-900 w-[75px] shrink-0">Name:</span> <span>{addr.name}</span></div>
                            <div className="flex items-start"><span className="font-bold text-stone-900 w-[75px] shrink-0">Address:</span> <span className="break-all">{addr.address}</span></div>
                            <div className="flex items-start"><span className="font-bold text-stone-900 w-[75px] shrink-0">City:</span> <span>{addr.city}</span></div>
                            <div className="flex items-start"><span className="font-bold text-stone-900 w-[75px] shrink-0">State:</span> <span>{addr.state || 'Karnataka'}</span></div>
                            <div className="flex items-start"><span className="font-bold text-stone-900 w-[75px] shrink-0">Pincode:</span> <span>{addr.pincode}</span></div>
                            <div className="flex items-start mt-0.5"><span className="font-bold text-stone-900 w-[75px] shrink-0">Phone:</span> <span>{addr.phone}</span></div>
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
                                <span className={`text-[9px] sm:text-[10px] font-bold px-3 py-0.5 rounded-full uppercase tracking-wider ${order.status === 'Delivered'
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
                                  <div className="flex items-start"><span className="font-bold text-stone-900 w-[85px] shrink-0">Name:</span> <span>{order.address.name}</span></div>
                                  <div className="flex items-start"><span className="font-bold text-stone-900 w-[85px] shrink-0">Address:</span> <span className="break-all">{order.address.address}</span></div>
                                  <div className="flex items-start"><span className="font-bold text-stone-900 w-[85px] shrink-0">City:</span> <span>{order.address.city}</span></div>
                                  <div className="flex items-start"><span className="font-bold text-stone-900 w-[85px] shrink-0">State:</span> <span>{order.address.state || 'Karnataka'}</span></div>
                                  <div className="flex items-start"><span className="font-bold text-stone-900 w-[85px] shrink-0">Pincode:</span> <span>{order.address.pincode}</span></div>
                                  <div className="flex items-start mt-0.5"><span className="font-bold text-stone-900 w-[85px] shrink-0">Phone:</span> <span>{order.address.phone}</span></div>
                                </div>
                              </div>

                              {/* Track & Manage order navigation button */}
                              <div className="flex justify-end items-center gap-3 pt-3 mt-1.5 border-t border-[#eeddb9]/30 flex-wrap">
                                {order.status === 'Processing' && (
                                  <button
                                    onClick={() => handleCancelOrder(order.id)}
                                    className="px-4 py-2.5 bg-red-50 hover:bg-red-100/80 text-red-655 text-xs font-black rounded-xl transition-all cursor-pointer shadow-3xs"
                                  >
                                    Cancel Order
                                  </button>
                                )}

                                {order.status === 'Delivered' && (
                                  <button
                                    onClick={() => handleRequestReturn(order.id)}
                                    className="px-4 py-2.5 bg-amber-50 hover:bg-amber-100/80 text-[#C56C4F] text-xs font-black rounded-xl transition-all cursor-pointer shadow-3xs"
                                  >
                                    Request Return
                                  </button>
                                )}

                                {order.status === 'Return Requested' && (
                                  <span className="text-xs font-jakarta font-extrabold text-amber-700 bg-amber-50/50 border border-amber-200 px-3 py-2 rounded-xl">
                                    Return Requested (Pending Admin)
                                  </span>
                                )}

                                <button
                                  onClick={() => handleDownloadInvoice(order)}
                                  className="px-5 py-2.5 bg-[#C56C4F] hover:bg-[#a85237] text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer active:scale-95 font-jakarta"
                                >
                                  <Download className="w-4 h-4" /> Download Invoice
                                </button>
                                <Link
                                  href={`/orders/${order.id}`}
                                  className="px-5 py-2.5 bg-[#384401] hover:bg-[#252d00] text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer active:scale-95"
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
                {reviewableProducts.length === 0 && !editingReviewId ? (
                  <div className="bg-[#FAF4E6]/40 border border-[#eeddb9]/50 rounded-xl p-6 text-center">
                    <p className="text-stone-700 text-xs sm:text-sm font-bold leading-relaxed font-jakarta">
                      🔒 You don't have any products eligible for review. Only products that have been delivered to you and haven't been reviewed yet can be reviewed.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleAddReviewSubmit} className="bg-[#FAF4E6]/50 border border-[#eeddb9]/60 rounded-xl p-5 flex flex-col gap-4">
                    <h3 className="text-xs sm:text-sm font-extrabold text-[#3E2C1C] uppercase tracking-wider block mb-2">
                      {editingReviewId ? 'Edit Review' : 'Write a Review'}
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-[1.5fr_2fr_1fr] items-end gap-4">
                      {/* Category Selector */}
                      <div className="flex flex-col gap-1.5 w-full">
                        <span className="text-[10px] sm:text-xs font-extrabold text-[#3E2C1C] uppercase tracking-wider block">Category</span>
                        <select
                          required
                          disabled={!!editingReviewId}
                          value={reviewCategory}
                          onChange={(e) => {
                            setReviewCategory(e.target.value);
                            setReviewProdId('');
                          }}
                          className="h-10.5 px-3.5 bg-white border border-[#eeddb9] rounded-xl text-xs sm:text-sm text-stone-850 focus:outline-hidden disabled:bg-stone-100 disabled:cursor-not-allowed w-full font-medium"
                        >
                          <option value="">Select Category...</option>
                          {reviewableCategories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      </div>

                      {/* Product Selector */}
                      <div className="flex flex-col gap-1.5 w-full">
                        <span className="text-[10px] sm:text-xs font-extrabold text-[#3E2C1C] uppercase tracking-wider block">Target Product</span>
                        <select
                          required
                          disabled={!!editingReviewId || !reviewCategory}
                          value={reviewProdId}
                          onChange={(e) => setReviewProdId(e.target.value)}
                          className="h-10.5 px-3.5 bg-white border border-[#eeddb9] rounded-xl text-xs sm:text-sm text-stone-850 focus:outline-hidden disabled:bg-stone-100 disabled:cursor-not-allowed w-full font-medium"
                        >
                          <option value="">
                            {!reviewCategory ? 'Select Category First...' : 'Select Product...'}
                          </option>
                          {reviewableProducts.filter(p => p.category === reviewCategory).map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                          ))}
                        </select>
                      </div>

                      <div className="flex flex-col gap-1.5 justify-end w-full">
                        <span className="text-[10px] sm:text-xs font-extrabold text-[#3E2C1C] uppercase tracking-wider block">Rating Star</span>
                        <div className="flex items-center gap-3">
                          <input
                            type="number"
                            min="1"
                            max="5"
                            step="0.1"
                            required
                            value={reviewRating || ''}
                            onChange={(e) => {
                              let valStr = e.target.value;
                              if (valStr.includes('.')) {
                                const [integerPart, decimalPart] = valStr.split('.');
                                valStr = `${integerPart}.${decimalPart.slice(0, 1)}`;
                              }
                              const val = valStr === '' ? 0 : Number(valStr);
                              setReviewRating(val > 5 ? 5 : val);
                            }}
                            onBlur={() => {
                              if (reviewRating < 1) setReviewRating(1);
                            }}
                            className="h-10.5 w-18 px-2 bg-white border border-[#eeddb9] rounded-xl text-xs sm:text-sm text-stone-900 font-bold text-center focus:outline-hidden focus:border-[#384401] focus:ring-1 focus:ring-[#384401]"
                            placeholder="4.5"
                          />

                          <div className="flex items-center gap-1 h-10 select-none">
                            {[1, 2, 3, 4, 5].map((i) => {
                              let fillWidth = '0%';
                              if (reviewRating >= i) {
                                fillWidth = '100%';
                              } else if (reviewRating > i - 1) {
                                fillWidth = `${(reviewRating - (i - 1)) * 100}%`;
                              }

                              return (
                                <div key={i} className="relative inline-block text-xl text-stone-200">
                                  <span>★</span>
                                  <div
                                    className="absolute top-0 left-0 overflow-hidden h-full text-amber-500"
                                    style={{ width: fillWidth }}
                                  >
                                    <span>★</span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5 w-full">
                      <span className="text-[10px] sm:text-xs font-extrabold text-[#3E2C1C] uppercase tracking-wider block">Review Title</span>
                      <input
                        type="text"
                        required
                        value={reviewTitle}
                        onChange={(e) => setReviewTitle(e.target.value)}
                        placeholder="Summarize your experience (e.g. Delicious flavour, High quality malt)"
                        className="h-10 px-3.5 bg-white border border-[#eeddb9] rounded-xl text-xs sm:text-sm text-stone-900 focus:outline-hidden w-full font-medium"
                      />
                    </div>

                    <textarea
                      required
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      className="w-full px-3.5 py-2 bg-white border border-[#eeddb9] rounded-xl text-xs sm:text-sm text-stone-900 h-16 resize-none focus:outline-hidden font-jakarta"
                      placeholder="Write your honest comments about this organic goods product..."
                    />

                    <div className="flex gap-2">
                      <button
                        type="submit"
                        className="w-fit bg-[#384401] hover:bg-[#252d00] text-white text-xs font-bold py-2.5 px-5 rounded-xl transition-colors cursor-pointer shadow-xs"
                      >
                        {editingReviewId ? 'Update Review' : 'Submit Review'}
                      </button>
                      {editingReviewId && (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingReviewId(null);
                            setReviewCategory('');
                            setReviewProdId('');
                            setReviewTitle('');
                            setReviewComment('');
                            setReviewRating(5);
                          }}
                          className="w-fit bg-white border border-[#eeddb9] hover:bg-[#FAF4E6]/50 text-stone-750 text-xs font-bold py-2.5 px-5 rounded-xl transition-colors cursor-pointer shadow-xs"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </form>
                )}

                <div className="flex flex-col gap-4">
                  {user.reviews.length === 0 ? (
                    <div className="text-center py-10 border border-dashed border-stone-200 rounded-2xl text-stone-400 text-xs sm:text-sm">
                      You haven't posted any reviews yet.
                    </div>
                  ) : (
                    user.reviews.map((rev) => (
                      <div
                        key={rev.id}
                        className="border border-[#eeddb9]/50 rounded-2xl p-5 flex flex-col gap-2.5 bg-stone-50/20"
                      >
                        <div className="flex justify-between items-start gap-4 flex-wrap">
                          <div>
                            <span className="font-bold text-stone-955 text-sm sm:text-base font-jakarta">{rev.productName}</span>
                            {rev.title && (
                              <span className="font-bold text-[#A45338] text-xs sm:text-sm block mt-0.5 select-none">{rev.title}</span>
                            )}
                            <span className="text-[10px] text-stone-500 font-jakarta block mt-0.5">{rev.date}</span>
                          </div>

                          <div className="flex gap-1.5 shrink-0">
                            <button
                              onClick={() => {
                                setEditingReviewId(rev.id);
                                const product = PRODUCTS.find(p => p.id === rev.productId);
                                if (product) {
                                  setReviewCategory(product.category);
                                }
                                setReviewProdId(rev.productId);
                                setReviewRating(rev.rating);
                                setReviewTitle(rev.title || '');
                                setReviewComment(rev.comment);
                              }}
                              className="p-1.5 text-stone-400 hover:text-[#384401] transition-colors cursor-pointer rounded-lg hover:bg-stone-100"
                              aria-label="Edit review"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteReview(rev.id)}
                              className="p-1.5 text-stone-400 hover:text-red-655 transition-colors cursor-pointer rounded-lg hover:bg-stone-100"
                              aria-label="Delete review"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 select-none">
                          {[1, 2, 3, 4, 5].map((i) => {
                            let fillWidth = '0%';
                            if (rev.rating >= i) {
                              fillWidth = '100%';
                            } else if (rev.rating > i - 1) {
                              fillWidth = `${(rev.rating - (i - 1)) * 100}%`;
                            }

                            return (
                              <div key={i} className="relative inline-block text-sm sm:text-base text-stone-200">
                                <span>★</span>
                                <div
                                  className="absolute top-0 left-0 overflow-hidden h-full text-amber-500"
                                  style={{ width: fillWidth }}
                                >
                                  <span>★</span>
                                </div>
                              </div>
                            );
                          })}
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
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#eeddb9]/30 pb-4">
                  <div>
                    <h2 className="text-xl md:text-2xl font-bold font-jakarta text-[#3e2c1c] mb-1">My Notifications</h2>
                    <p className="text-stone-600 text-xs sm:text-sm leading-relaxed">Alerts regarding orders, dispatches, and member announcements.</p>
                  </div>
                  {user.notifications.length > 0 && (
                    <div className="flex items-center gap-2">
                      {user.notifications.some(n => !n.read) && (
                        <button
                          onClick={() => markAllNotificationsAsRead()}
                          className="px-3 py-1.5 bg-[#4f5a30]/10 hover:bg-[#4f5a30]/20 text-[#384401] text-xs sm:text-sm font-bold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-3xs"
                        >
                          <CheckCheck className="w-3.5 h-3.5" /> Mark all read
                        </button>
                      )}
                      <button
                        onClick={() => {
                          showConfirm(
                            'Clear All Notifications?',
                            'Are you sure you want to clear your entire notification history? This action cannot be undone.',
                            () => clearAllNotifications()
                          );
                        }}
                        className="px-3 py-1.5 bg-red-50 hover:bg-red-100/80 text-red-655 text-xs sm:text-sm font-bold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-3xs"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Clear all
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-4">
                  {user.notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center text-center py-16 px-4 bg-stone-50 border border-dashed border-stone-200 rounded-3xl gap-3">
                      <div className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center text-stone-400">
                        <BellOff className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-extrabold text-stone-900 text-sm sm:text-base font-jakarta">Your inbox is clean</h3>
                        <p className="text-stone-500 text-xs sm:text-sm mt-1 max-w-xs font-jakarta">We'll alert you here when dispatches, order updates, or announcement posts drop.</p>
                      </div>
                    </div>
                  ) : (
                    user.notifications.map((n) => {
                      const match = n.message.match(/VM-[A-Za-z0-9]+/);
                      const targetUrl = match ? `/orders/${match[0]}` : null;

                      // Pick icons based on content
                      let notifIcon = <Bell className="w-5 h-5 text-stone-500" />;
                      if (n.title.toLowerCase().includes('order') || n.message.toLowerCase().includes('order') || n.message.toLowerCase().includes('dispatch')) {
                        notifIcon = <Package className="w-5 h-5 text-[#C56C4F]" />;
                      } else if (n.title.toLowerCase().includes('profile') || n.title.toLowerCase().includes('security') || n.title.toLowerCase().includes('address')) {
                        notifIcon = <Shield className="w-5 h-5 text-emerald-700" />;
                      }

                      return (
                        <div
                          key={n.id}
                          className={`border rounded-2xl p-4 flex gap-3.5 transition-all relative group ${
                            !n.read 
                              ? 'bg-amber-50/40 border-[#eeddb9] border-l-4 border-l-[#C56C4F] shadow-xs' 
                              : 'bg-white border-stone-200/80 hover:bg-stone-50/40 border-l-4 border-l-[#384401]'
                          }`}
                        >
                          <div className="shrink-0 mt-0.5">
                            <div className={`w-9.5 h-9.5 rounded-xl flex items-center justify-center ${!n.read ? 'bg-amber-100/60' : 'bg-stone-100'}`}>
                              {notifIcon}
                            </div>
                          </div>
                          <div className="flex-1 flex flex-col gap-1 text-xs sm:text-sm font-jakarta leading-relaxed text-stone-750 pr-8">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className={`text-stone-950 font-jakarta ${!n.read ? 'font-black text-sm sm:text-base' : 'font-extrabold text-sm sm:text-[15px]'}`}>
                                {n.title}
                              </h4>
                              {!n.read && (
                                <span className="bg-[#C56C4F]/10 text-[#C56C4F] text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md">
                                  New
                                </span>
                              )}
                            </div>
                            <p className="text-stone-750 text-xs sm:text-sm font-medium mt-0.5 leading-relaxed">{n.message}</p>
                            <div className="flex items-center gap-4 mt-2">
                              <span className="text-[10.5px] sm:text-xs text-stone-400 font-semibold">{n.date}</span>
                              {targetUrl && (
                                <Link
                                  href={targetUrl}
                                  className="text-[11.5px] sm:text-xs font-extrabold text-[#4f5a30] hover:text-[#384401] hover:underline flex items-center gap-0.5"
                                >
                                  Manage Order →
                                </Link>
                              )}
                            </div>
                          </div>

                          {/* Quick Actions (Unread mark / Delete) */}
                          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5 opacity-85 sm:opacity-0 group-hover:opacity-100 transition-all">
                            {!n.read && (
                              <button
                                onClick={() => markNotificationAsRead(n.id)}
                                className="p-1.5 bg-amber-100 hover:bg-amber-200 text-[#4f5a30] rounded-xl transition-all cursor-pointer shadow-3xs"
                                title="Mark as Read"
                              >
                                <CheckCircle2 className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              onClick={() => {
                                deleteNotification(n.id);
                              }}
                              className="p-1.5 bg-red-50 hover:bg-red-100 text-red-655 rounded-xl transition-all cursor-pointer shadow-3xs"
                              title="Delete Notification"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {/* TAB: SUPPORT TICKETS */}
            {activeTab === 'tickets' && (
              <div className="flex flex-col gap-6">
                <div className="flex justify-between items-center flex-wrap gap-2">
                  <div>
                    <h2 className="text-xl md:text-2xl font-bold font-jakarta text-stone-955 mb-1">Support Tickets</h2>
                    <p className="text-stone-600 text-xs leading-relaxed">Track status and updates of support tickets raised by you.</p>
                  </div>
                  <Link
                    href="/help"
                    className="px-4 py-2.5 bg-[#384401] hover:bg-[#252d00] text-white text-xs font-bold rounded-xl transition-all shadow-2xs font-jakarta cursor-pointer"
                  >
                    Raise Support Ticket
                  </Link>
                </div>

                <div className="flex flex-col gap-4 font-jakarta">
                  {tickets.length === 0 ? (
                    <div className="text-center py-16 border-2 border-dashed border-stone-200 rounded-[24px] text-stone-400 text-xs sm:text-sm">
                      <LifeBuoy className="w-10 h-10 text-stone-300 mx-auto mb-3" />
                      No support tickets raised yet.
                    </div>
                  ) : (
                    tickets.map((t) => (
                      <div
                        key={t.id}
                        className="border border-[#eeddb9] rounded-2xl overflow-hidden shadow-xs bg-white"
                      >
                        <div className="p-4 md:p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                          <div>
                            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                              <span className="font-bold text-stone-900 text-sm sm:text-base">{t.id}</span>
                              <span className="text-stone-500 text-xs">• {t.category}</span>
                            </div>
                            <h4 className="font-extrabold text-stone-955 text-xs sm:text-sm mb-1">{t.subject}</h4>
                            <p className="text-stone-600 text-xs leading-relaxed font-semibold">{t.description}</p>
                            {t.order_id && (
                              <span className="text-[10px] bg-stone-100 text-stone-600 px-2 py-0.5 rounded-md font-bold mt-2 inline-block">
                                Associated Order: #{t.order_id}
                              </span>
                            )}
                          </div>
                          
                          <div className="text-right shrink-0 flex flex-col items-end gap-1.5 w-full sm:w-auto">
                            <span className={`text-[10px] font-bold px-3 py-0.5 rounded-full uppercase tracking-wider ${
                              t.status === 'Resolved'
                                ? 'bg-green-50 text-green-700'
                                : t.status === 'In Progress'
                                  ? 'bg-blue-50 text-blue-700'
                                  : 'bg-amber-50 text-amber-700 animate-pulse'
                            }`}>
                              {t.status}
                            </span>
                            <span className="text-[10px] text-stone-400 font-semibold">
                              Created: {new Date(t.created_at).toLocaleDateString('en-IN')}
                            </span>
                          </div>
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

      {/* Return Reason Modal Dialog */}
      {showReturnModal && (
        <div className="fixed inset-0 bg-[#3E2C1C]/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white border border-[#eeddb9] rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative animate-scaleUp font-jakarta">
            <h3 className="font-poetsen text-xl sm:text-2xl text-[#3E2C1C] mb-2 flex items-center gap-2">
              <Package className="w-6 h-6 text-[#C56C4F]" /> Request Return
            </h3>
            <p className="text-xs sm:text-sm text-stone-600 font-medium mb-5 leading-relaxed">
              We are sorry to hear that you are requesting a return. Please provide a clear reason or remarks below. Our admin team will verify and approve the refund shortly.
            </p>

            <div className="mb-4">
              <label className="block text-xs font-black uppercase tracking-wider text-stone-700 mb-2">
                Select Return Reason
              </label>
              <select
                value={returnReasonCategory}
                onChange={(e) => setReturnReasonCategory(e.target.value)}
                className="w-full bg-stone-50 border border-stone-250 rounded-2xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#384401]/20 focus:border-[#384401] font-medium"
              >
                <option value="">-- Choose Category --</option>
                <option value="Damaged package">Damaged package</option>
                <option value="Wrong product delivered">Wrong product delivered</option>
                <option value="Missing product">Missing product</option>
                <option value="Expired product">Expired product</option>
                <option value="Product received in unacceptable condition">Product received in unacceptable condition</option>
                <option value="Manufacturing/quality issue">Manufacturing/quality issue</option>
                <option value="Others">Others (Remarks Mandatory)</option>
              </select>
            </div>

            <div className="mb-6">
              <label className="block text-xs font-black uppercase tracking-wider text-stone-700 mb-2">
                Remarks {returnReasonCategory === 'Others' ? <span className="text-red-700 font-bold text-sm">*</span> : <span className="text-stone-400 font-bold">(Optional)</span>}
              </label>
              <textarea
                value={returnReason}
                onChange={(e) => setReturnReason(e.target.value)}
                placeholder={returnReasonCategory === 'Others' ? "Please type in your mandatory return reason details here..." : "Describe additional details here (optional)..."}
                rows={3}
                className="w-full bg-stone-50 border border-stone-250 rounded-2xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#384401]/20 focus:border-[#384401] placeholder-stone-400 font-medium leading-relaxed resize-none"
              />
            </div>

            <div className="flex justify-end items-center gap-3">
              <button
                onClick={() => setShowReturnModal(false)}
                className="h-11 px-6 border border-stone-250 text-stone-700 hover:bg-stone-50 text-xs font-black rounded-xl uppercase tracking-wider transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={submitReturnRequest}
                className="h-11 px-6 bg-[#384401] hover:bg-[#252d00] text-white text-xs font-black rounded-xl uppercase tracking-wider transition-all cursor-pointer shadow-sm"
              >
                Submit Return
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
