'use client';

import React, { useState, useEffect } from 'react';
import { 
  BarChart3, Users, ShoppingBag, DollarSign, Package, 
  Check, AlertCircle, RefreshCw, ShieldCheck, Sparkles, FolderOpen,
  Layers, Settings
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useApp } from '@/lib/context/AppContext';

import {
  AdminTab,
  AdminOrder,
  AdminCustomer,
  PurchaseRecord,
  OfferBanner,
  ExtendedProduct
} from '@/components/admin/types';

import AdminGatedAuth from '@/components/admin/AdminGatedAuth';
import AdminDashboardTab from '@/components/admin/AdminDashboardTab';
import AdminInventoryTab from '@/components/admin/AdminInventoryTab';
import AdminCustomersTab from '@/components/admin/AdminCustomersTab';
import AdminProductsTab from '@/components/admin/AdminProductsTab';
import AdminOrdersTab from '@/components/admin/AdminOrdersTab';
import AdminSalesTab from '@/components/admin/AdminSalesTab';
import AdminBannersTab from '@/components/admin/AdminBannersTab';
import AdminMediaTab from '@/components/admin/AdminMediaTab';
import AdminProfileTab from '@/components/admin/AdminProfileTab';

export default function AdminPage() {
  const { loginUser, showConfirm, user, updateUserProfile, logoutUser, products, fetchProducts, categories, fetchCategories } = useApp();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Admin Auth States
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [adminPhone, setAdminPhone] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminPasscode, setAdminPasscode] = useState('');
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [showAdminPasscode, setShowAdminPasscode] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  // Navigation tab
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');

  // Admin Profile Edit States
  const [profName, setProfName] = useState('');
  const [profEmail, setProfEmail] = useState('');
  const [profPhone, setProfPhone] = useState('');
  const [profPassword, setProfPassword] = useState('');
  const [profPasscode, setProfPasscode] = useState('');
  const [showProfPassword, setShowProfPassword] = useState(false);
  const [showProfPasscode, setShowProfPasscode] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);

  // Dashboard Stats State
  const [stats, setStats] = useState({
    totalCustomers: 0,
    totalOrders: 0,
    pendingOrders: 0,
    totalSales: 0
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);

  // Customers State
  const [customers, setCustomers] = useState<AdminCustomer[]>([]);
  const [customerSearch, setCustomerSearch] = useState('');

  // Products & Inventory State
  const [localProducts, setLocalProducts] = useState<ExtendedProduct[]>([]);
  const [productSearch, setProductSearch] = useState('');
  const [selectedProductCategory, setSelectedProductCategory] = useState('All');
  const [editingProduct, setEditingProduct] = useState<ExtendedProduct | null>(null);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [productViewMode, setProductViewMode] = useState<'card' | 'table'>('table');

  // Add Product Form
  const [newProdName, setNewProdName] = useState('');
  const [newProdPrice, setNewProdPrice] = useState(100);
  const [newProdCat, setNewProdCat] = useState('Malt');
  const [newProdDesc, setNewProdDesc] = useState('');
  const [newProdBadge, setNewProdBadge] = useState('');
  const [newProdStock, setNewProdStock] = useState(25);
  const [newProdImage, setNewProdImage] = useState('');
  const [newProdVideo, setNewProdVideo] = useState('');
  const [newProdBenefits, setNewProdBenefits] = useState('');
  const [newProdIngredients, setNewProdIngredients] = useState('');
  
  // Ingredients responsive images setup
  const [newProdIngDesktop, setNewProdIngDesktop] = useState('');
  const [newProdIngTablet, setNewProdIngTablet] = useState('');
  const [newProdIngMobile, setNewProdIngMobile] = useState('');
  const [newProdIngSameTab, setNewProdIngSameTab] = useState(true);
  const [newProdIngSameMobile, setNewProdIngSameMobile] = useState<'desktop' | 'tablet' | 'none'>('desktop');
  
  // FAQs editor setup
  const [newProdFaqs, setNewProdFaqs] = useState<{ q: string; a: string }[]>([]);
  const [faqInputQ, setFaqInputQ] = useState('');
  const [faqInputA, setFaqInputA] = useState('');

  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);

  // Add Category Form
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');

  // Purchase Entry Form
  const [purchaseProdId, setPurchaseProdId] = useState('');
  const [purchaseQty, setPurchaseQty] = useState(10);
  const [purchaseCost, setPurchaseCost] = useState(150);
  const [purchaseHistory, setPurchaseHistory] = useState<PurchaseRecord[]>([
    { id: 'PE-1092', productName: 'BANANA BABY MALT', quantity: 30, unitCost: 150, totalCost: 4500, date: '12/08/2026' },
    { id: 'PE-4821', productName: 'SWEET POTATO MALT', quantity: 20, unitCost: 170, totalCost: 3400, date: '11/08/2026' }
  ]);

  // Banners State
  const [banners, setBanners] = useState<OfferBanner[]>([
    { id: 'b-1', title: '15% Off Sprouted Malts', imageUrl: '/images/malts-banner.webp', link: '/products?category=Malt', active: true, tag: 'FESTIVAL SPECIAL' },
    { id: 'b-2', title: 'Healthy Millet Cookies Buy 2 Get 1', imageUrl: '/images/cookies-banner.webp', link: '/products?category=Millets', active: false, tag: 'LIMITED TIME' }
  ]);
  const [bannerTitle, setBannerTitle] = useState('');
  const [bannerImageUrl, setBannerImageUrl] = useState('');
  const [bannerLink, setBannerLink] = useState('');
  const [bannerTag, setBannerTag] = useState('');

  // Media Library State
  const [mediaFiles, setMediaFiles] = useState<string[]>([
    '/images/why-choose/why-choose-product-image.webp',
    '/images/malts-banner.webp',
    '/images/cookies-banner.webp',
    '/images/our-process/sourcing.webp',
    '/images/our-process/grinding.webp',
    '/images/our-process/dispatch.webp'
  ]);
  const [newMediaUrl, setNewMediaUrl] = useState('');

  // Orders State
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('All');

  // Sales State
  const [categorySales, setCategorySales] = useState<{ category: string; amount: number }[]>([]);
  const [leaderboard, setLeaderboard] = useState<{ name: string; quantity: number }[]>([]);

  // Fetch admin dynamic data
  const fetchAdminData = async () => {
    setLoading(true);
    setError('');
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
      
      // Fetch Dashboard
      const dashRes = await fetch(`${baseUrl}/admin/dashboard`);
      const dashData = await dashRes.json();
      if (dashData.success) {
        setStats(dashData.stats);
        setRecentOrders(dashData.recentOrders);
      }

      // Fetch Customers
      const custRes = await fetch(`${baseUrl}/admin/customers`);
      const custData = await custRes.json();
      if (custData.success) {
        setCustomers(custData.customers);
      }

      // Fetch Orders
      const orderRes = await fetch(`${baseUrl}/admin/orders`);
      const orderData = await orderRes.json();
      if (orderData.success) {
        setOrders(orderData.orders);
      }

      // Fetch Sales
      const salesRes = await fetch(`${baseUrl}/admin/sales`);
      const salesData = await salesRes.json();
      if (salesData.success) {
        setCategorySales(salesData.categorySales);
        setLeaderboard(salesData.leaderboard);
      }

    } catch (err) {
      console.error(err);
      setError('Unable to fetch live backend statistics. Running simulation values.');
      setStats({
        totalCustomers: 8,
        totalOrders: 12,
        pendingOrders: 3,
        totalSales: 4890
      });
      setRecentOrders([
        { id: 'VM-830281', customerName: 'Rahul Sharma', customerMobile: '9012345678', date: '12/08/2026', total: 680, status: 'Processing' },
        { id: 'VM-291038', customerName: 'Priya Patel', customerMobile: '9123456789', date: '11/08/2026', total: 320, status: 'Shipped' },
        { id: 'VM-492019', customerName: 'Anand Kumar', customerMobile: '9234567890', date: '10/08/2026', total: 1250, status: 'Delivered' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    // Check if admin is authenticated from session
    const isAuth = sessionStorage.getItem('is_admin_auth') === 'true';
    if (isAuth) {
      setIsAdminAuthenticated(true);
      fetchAdminData();
    }
  }, []);

  useEffect(() => {
    if (products && products.length > 0) {
      const extended = products.map((p, index) => ({
        ...p,
        stock: p.stock !== undefined ? p.stock : (index === 0 ? 4 : index === 5 ? 8 : index === 12 ? 3 : Math.floor(15 + Math.random() * 45)),
        purchasePrice: p.purchasePrice !== undefined ? p.purchasePrice : Math.floor(p.price * 0.6)
      }));
      setLocalProducts(extended);
    }
  }, [products]);

  // Pre-fill profile state when context user is loaded
  useEffect(() => {
    if (user) {
      setProfName(user.name || '');
      setProfEmail(user.email || '');
      setProfPhone(user.phone || user.mobile || '');
    }
  }, [user]);

  const triggerAlert = (msg: string, isError = false) => {
    if (isError) {
      setError(msg);
      setTimeout(() => setError(''), 4000);
    } else {
      setSuccessMsg(msg);
      setTimeout(() => setSuccessMsg(''), 4000);
    }
  };

  // Admin login check
  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);

    if (adminPasscode !== '1234') {
      setAuthError('Secret admin passcode (1234) is invalid.');
      setAuthLoading(false);
      return;
    }

    try {
      const res = await loginUser(adminPhone, adminPassword);
      setAuthLoading(false);

      if (res.success) {
        if (res.user?.role === 'admin') {
          sessionStorage.setItem('is_admin_auth', 'true');
          setIsAdminAuthenticated(true);
          fetchAdminData();
        } else {
          setAuthError('Access denied. This profile does not have admin permissions.');
        }
      } else {
        setAuthError(res.error || 'Invalid credentials. Please verify your credentials.');
      }
    } catch (err) {
      setAuthLoading(false);
      // Fallback auth for development demo if server disconnected
      if (adminPhone === '9999999999' && adminPassword === 'admin123') {
        sessionStorage.setItem('is_admin_auth', 'true');
        setIsAdminAuthenticated(true);
        fetchAdminData();
      } else {
        setAuthError('Could not verify credentials. Use fallback (Phone: 9999999999, Pass: admin123, Passcode: 1234)');
      }
    }
  };

  // Admin Profile Update Check
  const handleProfileUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (profPasscode !== '1234') {
      triggerAlert('Verification security passcode (1234) is incorrect.', true);
      return;
    }

    setProfileSaving(true);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
      const payload: any = {
        mobile: user?.mobile || '9999999999',
        name: profName,
        email: profEmail,
        phone: profPhone
      };
      
      if (profPassword.trim() !== '') {
        payload.password = profPassword;
      }

      const res = await fetch(`${baseUrl}/auth/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      setProfileSaving(false);

      if (res.ok && data.success) {
        updateUserProfile({
          name: profName,
          email: profEmail,
          phone: profPhone
        });
        setProfPassword('');
        setProfPasscode('');
        triggerAlert('Admin profile updated successfully!');
      } else {
        triggerAlert(data.error || 'Failed to update admin profile', true);
      }
    } catch (err) {
      setProfileSaving(false);
      // Simulate success if disconnected
      updateUserProfile({
        name: profName,
        email: profEmail,
        phone: profPhone
      });
      setProfPassword('');
      setProfPasscode('');
      triggerAlert('Simulation: Admin profile attributes updated successfully!');
    }
  };

  // Change Shipping Status
  const handleOrderStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
      const res = await fetch(`${baseUrl}/admin/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        triggerAlert(`Order ${orderId} updated to ${newStatus}`);
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder(prev => prev ? { ...prev, status: newStatus } : null);
        }
      } else {
        triggerAlert(data.error || 'Failed to update order status', true);
      }
    } catch (err) {
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      triggerAlert(`Simulation: Order ${orderId} status changed to ${newStatus}`);
    }
  };

  // Purchase Entry Submission
  const handlePurchaseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!purchaseProdId || purchaseQty <= 0 || purchaseCost <= 0) {
      triggerAlert('Please choose a product and fill accurate purchase figures.', true);
      return;
    }
    const targetProd = localProducts.find(p => p.id === purchaseProdId);
    if (!targetProd) return;

    // Increment inventory stock
    setLocalProducts(prev => prev.map(p => 
      p.id === purchaseProdId 
        ? { ...p, stock: p.stock + purchaseQty, purchasePrice: purchaseCost } 
        : p
    ));

    const newRecord: PurchaseRecord = {
      id: `PE-${Math.floor(1000 + Math.random() * 9000)}`,
      productName: targetProd.name,
      quantity: purchaseQty,
      unitCost: purchaseCost,
      totalCost: purchaseCost * purchaseQty,
      date: new Date().toLocaleDateString('en-IN')
    };

    setPurchaseHistory(prev => [newRecord, ...prev]);
    setPurchaseProdId('');
    setPurchaseQty(10);
    setPurchaseCost(150);
    triggerAlert('Purchase inventory log recorded successfully!');
  };

  const handleFileUpload = async (file: File, bucket: 'product-images' | 'product-videos'): Promise<string | null> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('bucket', bucket);

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
      const res = await fetch(`${baseUrl}/products/upload`, {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.success && data.url) {
        return data.url;
      } else {
        triggerAlert(data.error || 'Failed to upload file to storage.', true);
        return null;
      }
    } catch (err) {
      console.error(err);
      triggerAlert('Failed to connect to file upload server.', true);
      return null;
    }
  };

  // Add Category Submit
  const handleAddCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName) {
      triggerAlert('Please enter category name', true);
      return;
    }

    const newId = newCatName.toLowerCase().replace(/\s+/g, '-');

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
      const res = await fetch(`${baseUrl}/products/categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: newId,
          name: newCatName,
          description: newCatDesc
        })
      });
      const data = await res.json();
      if (data.success) {
        triggerAlert('Category added successfully!');
        await fetchCategories();
        setShowAddCategory(false);
        setNewCatName('');
        setNewCatDesc('');
      } else {
        triggerAlert(data.error || 'Failed to save category.', true);
      }
    } catch (err) {
      console.error(err);
      triggerAlert('Failed to connect to category catalog API.', true);
    }
  };

  // Add Product Submit
  const handleAddProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName || newProdPrice <= 0) {
      triggerAlert('Please enter valid product details', true);
      return;
    }

    const catMap: Record<string, string> = {
      'Malt': 'malt',
      'Natural Health Mix': 'natural-health-mix',
      'Millets': 'millets',
      'Millet Flours': 'millet-flours',
      'Millet Tiffin mix': 'millet-tiffin-mix',
      'Millet Noodles': 'millet-noodles'
    };
    const categoryId = catMap[newProdCat] || 'malt';
    const newId = `p-new-${Math.floor(1000 + Math.random() * 9000)}`;

    const structuredIngredients = {
      desktop: newProdIngDesktop || "/images/products/details-page/ingredients-image.webp",
      tablet: newProdIngTablet || "",
      mobile: newProdIngMobile || "",
      useSameForTab: newProdIngSameTab,
      useSameForMobile: newProdIngSameMobile
    };

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
      const res = await fetch(`${baseUrl}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: newId,
          categoryId,
          name: newProdName,
          price: newProdPrice,
          description: newProdDesc,
          badge: newProdBadge || undefined,
          stock: newProdStock,
          purchasePrice: Math.floor(newProdPrice * 0.65),
          weights: ['250 g', '500 g', '1 kg'],
          imageUrl: newProdImage || null,
          videoUrl: newProdVideo || null,
          benefits: newProdBenefits ? newProdBenefits.split(',').map(s => s.trim()) : ['Traditional Nutrition', 'Easy to Digest', 'Natural Goodness'],
          ingredients: structuredIngredients,
          features: { shelf_life: '6 Months', suitable_for: 'All age groups' },
          faqs: newProdFaqs
        })
      });
      const data = await res.json();
      if (data.success) {
        triggerAlert('Product added to database catalog!');
        await fetchProducts();
        setShowAddProduct(false);
        setNewProdName('');
        setNewProdPrice(100);
        setNewProdDesc('');
        setNewProdBadge('');
        setNewProdStock(25);
        setNewProdImage('');
        setNewProdVideo('');
        setNewProdBenefits('');
        setNewProdIngredients('');
        setNewProdIngDesktop('');
        setNewProdIngTablet('');
        setNewProdIngMobile('');
        setNewProdIngSameTab(true);
        setNewProdIngSameMobile('desktop');
        setNewProdFaqs([]);
      } else {
        triggerAlert(data.error || 'Failed to save product to database.', true);
      }
    } catch (err) {
      console.error(err);
      triggerAlert('Failed to connect to catalog API, saving locally.', true);
      const newProduct: ExtendedProduct = {
        id: newId,
        name: newProdName,
        price: newProdPrice,
        category: newProdCat,
        description: newProdDesc,
        badge: newProdBadge || undefined,
        stock: newProdStock,
        purchasePrice: Math.floor(newProdPrice * 0.65),
        ingredients: structuredIngredients as any,
        faqs: newProdFaqs as any
      };
      setLocalProducts(prev => [newProduct, ...prev]);
      setShowAddProduct(false);
    }
  };

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    const catMap: Record<string, string> = {
      'Malt': 'malt',
      'Natural Health Mix': 'natural-health-mix',
      'Millets': 'millets',
      'Millet Flours': 'millet-flours',
      'Millet Tiffin mix': 'millet-tiffin-mix',
      'Millet Noodles': 'millet-noodles'
    };
    const categoryId = catMap[editingProduct.category] || 'malt';

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
      const res = await fetch(`${baseUrl}/products/${editingProduct.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          categoryId,
          name: editingProduct.name,
          price: editingProduct.price,
          description: editingProduct.description,
          badge: editingProduct.badge || null,
          stock: editingProduct.stock,
          purchasePrice: editingProduct.purchasePrice || Math.floor(editingProduct.price * 0.65),
          weights: editingProduct.weights || ['250 g', '500 g', '1 kg'],
          imageUrl: editingProduct.image || null,
          videoUrl: editingProduct.video || null,
          benefits: editingProduct.benefits || ['Traditional Nutrition', 'Easy to Digest', 'Natural Goodness'],
          ingredients: editingProduct.ingredients,
          features: editingProduct.features || { shelf_life: '6 Months' },
          faqs: editingProduct.faqs || []
        })
      });
      const data = await res.json();
      if (data.success) {
        triggerAlert('Product details updated successfully!');
        await fetchProducts();
        setEditingProduct(null);
      } else {
        triggerAlert(data.error || 'Failed to update product details.', true);
      }
    } catch (err) {
      console.error(err);
      triggerAlert('Failed to update catalog API, saving locally.', true);
      setLocalProducts(prev => prev.map(p => p.id === editingProduct.id ? editingProduct : p));
      setEditingProduct(null);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    showConfirm(
      'Remove Product',
      'Are you sure you want to permanently delete this product from the inventory catalog?',
      async () => {
        try {
          const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
          const res = await fetch(`${baseUrl}/products/${productId}`, {
            method: 'DELETE'
          });
          const data = await res.json();
          if (data.success) {
            triggerAlert('Product removed from database catalog!');
            await fetchProducts();
          } else {
            triggerAlert(data.error || 'Failed to delete product.', true);
          }
        } catch (err) {
          console.error(err);
          triggerAlert('Failed to delete catalog API product, removing locally.', true);
          setLocalProducts(prev => prev.filter(p => p.id !== productId));
        }
      }
    );
  };

  // Add Offer Banner
  const handleAddBanner = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bannerTitle || !bannerImageUrl) {
      triggerAlert('Banner Title and Image URL are required.', true);
      return;
    }
    const newBanner: OfferBanner = {
      id: `b-${Date.now()}`,
      title: bannerTitle,
      imageUrl: bannerImageUrl,
      link: bannerLink || '/products',
      active: true,
      tag: bannerTag || undefined
    };
    setBanners(prev => [newBanner, ...prev]);
    setBannerTitle('');
    setBannerImageUrl('');
    setBannerLink('');
    setBannerTag('');
    triggerAlert('Offer banner uploaded successfully!');
  };

  // Add Media File
  const handleAddMedia = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMediaUrl) return;
    setMediaFiles(prev => [newMediaUrl, ...prev]);
    setNewMediaUrl('');
    triggerAlert('Media image URL loaded to gallery library!');
  };

  if (!mounted) return null;

  // Filter calculations
  const lowStockProducts = localProducts.filter(p => p.stock < 10);
  const totalInventoryVal = localProducts.reduce((sum, p) => sum + (p.stock * (p.purchasePrice || p.price * 0.6)), 0);

  const filteredCustomers = customers.filter(c => 
    c.name?.toLowerCase().includes(customerSearch.toLowerCase()) ||
    c.mobile?.includes(customerSearch) ||
    c.email?.toLowerCase().includes(customerSearch.toLowerCase())
  );

  const filteredProducts = localProducts.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(productSearch.toLowerCase());
    const matchesCategory = selectedProductCategory === 'All' || p.category === selectedProductCategory;
    return matchesSearch && matchesCategory;
  });

  const filteredOrders = orders.filter(o => {
    const matchesSearch = o.id.toLowerCase().includes(orderSearch.toLowerCase()) || 
                          o.customerName?.toLowerCase().includes(orderSearch.toLowerCase()) ||
                          o.customerMobile?.includes(orderSearch);
    const matchesStatus = orderStatusFilter === 'All' || o.status === orderStatusFilter;
    return matchesSearch && matchesStatus;
  });

  // Gated Admin Authentication UI
  if (!isAdminAuthenticated) {
    return (
      <AdminGatedAuth
        authError={authError}
        adminPhone={adminPhone}
        setAdminPhone={setAdminPhone}
        adminPassword={adminPassword}
        setAdminPassword={setAdminPassword}
        adminPasscode={adminPasscode}
        setAdminPasscode={setAdminPasscode}
        showAdminPassword={showAdminPassword}
        setShowAdminPassword={setShowAdminPassword}
        showAdminPasscode={showAdminPasscode}
        setShowAdminPasscode={setShowAdminPasscode}
        authLoading={authLoading}
        handleAdminLogin={handleAdminLogin}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#3E2C1C] flex flex-col justify-between">
      <Navbar />

      <main className="flex-grow pt-27 pb-20 px-4 sm:px-6 md:px-8 w-full">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-[#384401]" />
              <h1 className="font-poetsen text-3xl font-medium tracking-relaxed text-stone-900">
                Village Made Admin panel
              </h1>
            </div>
            <p className="text-stone-700 text-xs sm:text-sm font-jakarta font-medium mt-1">
              Configure products, verify customer files, track dispatch logs, and monitor growth statistics.
            </p>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={fetchAdminData}
              className="flex items-center gap-2 bg-white border border-[#eeddb9] hover:bg-[#FAF4E6]/50 text-stone-850 text-xs font-bold py-2.5 px-4 rounded-xl shadow-2xs transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              Sync Data
            </button>
            <button
              onClick={() => {
                sessionStorage.removeItem('is_admin_auth');
                setIsAdminAuthenticated(false);
                logoutUser();
              }}
              className="flex items-center gap-2 bg-red-50 border border-red-200 hover:bg-red-100/50 text-red-700 text-xs font-bold py-2.5 px-4 rounded-xl shadow-2xs transition-colors cursor-pointer"
            >
              Log Out
            </button>
          </div>
        </div>

        {/* Action Alerts */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl text-xs font-semibold flex gap-3 items-center font-jakarta">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {successMsg && (
          <div className="mb-6 bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-2xl text-xs font-semibold flex gap-3 items-center font-jakarta">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Grid Layout: Sidebar & Content Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-8 items-start">
          
          {/* Sidebar Nav controls */}
          <nav className="flex flex-row lg:flex-col gap-2.5 overflow-x-auto lg:overflow-visible pb-4 lg:pb-0 scrollbar-none select-none">
            {[
              { id: 'dashboard', label: 'Overall Dashboard', icon: BarChart3 },
              { id: 'inventory', label: 'Inventory & Stock', icon: Layers },
              { id: 'customers', label: 'Customer Files', icon: Users },
              { id: 'products', label: 'Products Control', icon: Package },
              { id: 'orders', label: 'Order Dispatch', icon: ShoppingBag },
              { id: 'sales', label: 'Sales Reports', icon: DollarSign },
              { id: 'banners', label: 'Offer Banners', icon: Sparkles },
              { id: 'media', label: 'Media Library', icon: FolderOpen },
              { id: 'admin-profile', label: 'Admin Profile', icon: Settings }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as AdminTab)}
                  className={`flex items-center gap-3 px-4.5 py-3 rounded-2xl text-sm font-bold uppercase tracking-wider shrink-0 transition-all cursor-pointer ${
                    isActive 
                      ? 'bg-[#384401] text-white shadow-md' 
                      : 'bg-white border border-[#d3c099] text-stone-700 hover:bg-[#FAF4E6]/50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>

          {/* Core Content Window */}
          <div className="bg-white border border-[#d3c099] rounded-[32px] p-6 sm:p-8 shadow-xs min-h-[500px]">
            
            {activeTab === 'dashboard' && (
              <AdminDashboardTab
                stats={stats}
                recentOrders={recentOrders}
                lowStockProducts={lowStockProducts}
                setActiveTab={setActiveTab}
              />
            )}

            {activeTab === 'inventory' && (
              <AdminInventoryTab
                totalInventoryVal={totalInventoryVal}
                lowStockProducts={lowStockProducts}
                localProducts={localProducts}
                setLocalProducts={setLocalProducts}
                purchaseProdId={purchaseProdId}
                setPurchaseProdId={setPurchaseProdId}
                purchaseQty={purchaseQty}
                setPurchaseQty={setPurchaseQty}
                purchaseCost={purchaseCost}
                setPurchaseCost={setPurchaseCost}
                purchaseHistory={purchaseHistory}
                handlePurchaseSubmit={handlePurchaseSubmit}
              />
            )}

            {activeTab === 'customers' && (
              <AdminCustomersTab
                filteredCustomers={filteredCustomers}
                customerSearch={customerSearch}
                setCustomerSearch={setCustomerSearch}
              />
            )}

            {activeTab === 'products' && (
              <AdminProductsTab
                categories={categories}
                selectedProductCategory={selectedProductCategory}
                setSelectedProductCategory={setSelectedProductCategory}
                productSearch={productSearch}
                setProductSearch={setProductSearch}
                productViewMode={productViewMode}
                setProductViewMode={setProductViewMode}
                showAddCategory={showAddCategory}
                setShowAddCategory={setShowAddCategory}
                newCatName={newCatName}
                setNewCatName={setNewCatName}
                newCatDesc={newCatDesc}
                setNewCatDesc={setNewCatDesc}
                handleAddCategorySubmit={handleAddCategorySubmit}
                showAddProduct={showAddProduct}
                setShowAddProduct={setShowAddProduct}
                newProdCat={newProdCat}
                setNewProdCat={setNewProdCat}
                newProdName={newProdName}
                setNewProdName={setNewProdName}
                newProdPrice={newProdPrice}
                setNewProdPrice={setNewProdPrice}
                newProdDesc={newProdDesc}
                setNewProdDesc={setNewProdDesc}
                newProdBadge={newProdBadge}
                setNewProdBadge={setNewProdBadge}
                newProdStock={newProdStock}
                setNewProdStock={setNewProdStock}
                newProdImage={newProdImage}
                setNewProdImage={setNewProdImage}
                newProdVideo={newProdVideo}
                setNewProdVideo={setNewProdVideo}
                newProdIngDesktop={newProdIngDesktop}
                setNewProdIngDesktop={setNewProdIngDesktop}
                newProdIngTablet={newProdIngTablet}
                setNewProdIngTablet={setNewProdIngTablet}
                newProdIngMobile={newProdIngMobile}
                setNewProdIngMobile={setNewProdIngMobile}
                newProdIngSameTab={newProdIngSameTab}
                setNewProdIngSameTab={setNewProdIngSameTab}
                newProdIngSameMobile={newProdIngSameMobile}
                setNewProdIngSameMobile={setNewProdIngSameMobile}
                newProdBenefits={newProdBenefits}
                setNewProdBenefits={setNewProdBenefits}
                newProdFaqs={newProdFaqs}
                setNewProdFaqs={setNewProdFaqs}
                faqInputQ={faqInputQ}
                setFaqInputQ={setFaqInputQ}
                faqInputA={faqInputA}
                setFaqInputA={setFaqInputA}
                uploadingImage={uploadingImage}
                setUploadingImage={setUploadingImage}
                uploadingVideo={uploadingVideo}
                setUploadingVideo={setUploadingVideo}
                handleFileUpload={handleFileUpload}
                handleAddProductSubmit={handleAddProductSubmit}
                editingProduct={editingProduct}
                setEditingProduct={setEditingProduct}
                handleUpdateProduct={handleUpdateProduct}
                handleDeleteProduct={handleDeleteProduct}
                filteredProducts={filteredProducts}
                triggerAlert={triggerAlert}
              />
            )}

            {activeTab === 'orders' && (
              <AdminOrdersTab
                orderStatusFilter={orderStatusFilter}
                setOrderStatusFilter={setOrderStatusFilter}
                orderSearch={orderSearch}
                setOrderSearch={setOrderSearch}
                filteredOrders={filteredOrders}
                selectedOrder={selectedOrder}
                setSelectedOrder={setSelectedOrder}
                handleOrderStatusUpdate={handleOrderStatusUpdate}
              />
            )}

            {activeTab === 'sales' && (
              <AdminSalesTab
                categorySales={categorySales}
                leaderboard={leaderboard}
                totalSales={stats.totalSales}
              />
            )}

            {activeTab === 'banners' && (
              <AdminBannersTab
                bannerTitle={bannerTitle}
                setBannerTitle={setBannerTitle}
                bannerImageUrl={bannerImageUrl}
                setBannerImageUrl={setBannerImageUrl}
                bannerLink={bannerLink}
                setBannerLink={setBannerLink}
                bannerTag={bannerTag}
                setBannerTag={setBannerTag}
                handleAddBanner={handleAddBanner}
                banners={banners}
                setBanners={setBanners}
              />
            )}

            {activeTab === 'media' && (
              <AdminMediaTab
                newMediaUrl={newMediaUrl}
                setNewMediaUrl={setNewMediaUrl}
                handleAddMedia={handleAddMedia}
                mediaFiles={mediaFiles}
                setMediaFiles={setMediaFiles}
              />
            )}

            {activeTab === 'admin-profile' && (
              <AdminProfileTab
                profName={profName}
                setProfName={setProfName}
                profEmail={profEmail}
                setProfEmail={setProfEmail}
                profPhone={profPhone}
                setProfPhone={setProfPhone}
                profPassword={profPassword}
                setProfPassword={setProfPassword}
                profPasscode={profPasscode}
                setProfPasscode={setProfPasscode}
                showProfPassword={showProfPassword}
                setShowProfPassword={setShowProfPassword}
                showProfPasscode={showProfPasscode}
                setShowProfPasscode={setShowProfPasscode}
                profileSaving={profileSaving}
                handleProfileUpdateSubmit={handleProfileUpdateSubmit}
              />
            )}

          </div>

        </div>

      </main>

      <Footer />
    </div>
  );
}
