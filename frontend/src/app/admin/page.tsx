'use client';

import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { 
  BarChart3, Users, ShoppingBag, DollarSign, Package, 
  Check, AlertCircle, RefreshCw, ShieldCheck, Sparkles, FolderOpen,
  Layers, Settings, MessageSquare
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
  ExtendedProduct,
  ProductBenefit
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
import AdminReviewsTab from '@/components/admin/AdminReviewsTab';

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
  const [newProdOriginalPrice, setNewProdOriginalPrice] = useState(100);
  const [newProdDiscount, setNewProdDiscount] = useState('0');
  const [newProdCat, setNewProdCat] = useState('Malt');
  const [newProdDesc, setNewProdDesc] = useState('');
  const [newProdBadge, setNewProdBadge] = useState('');
  const [newProdStock, setNewProdStock] = useState(25);
  const [newProdImage, setNewProdImage] = useState('');
  const [newProdVideo, setNewProdVideo] = useState('');
  const [newProdBenefits, setNewProdBenefits] = useState<ProductBenefit[]>([
    { title: 'Traditional Nutrition', description: 'Made with ancient grains passed down through generations.' },
    { title: 'Easy to Digest', description: 'Gentle on growing tummies, suitable for all age groups.' },
    { title: 'Natural Goodness', description: 'No artificial colours, flavours or preservatives.' }
  ]);
  const [newProdIngredients, setNewProdIngredients] = useState('');
  const [newProdDescImage, setNewProdDescImage] = useState('');
  
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

  // Dynamic features setup
  const [newProdShelfLife, setNewProdShelfLife] = useState('6 Months');
  const [newProdShelfLifeDetails, setNewProdShelfLifeDetails] = useState('Best before 6 months from the date of manufacturing.');
  const [newProdSuitableFor, setNewProdSuitableFor] = useState<{ label: string; value: string }[]>([
    { label: 'Babies', value: '6+ Months*' },
    { label: 'Toddlers', value: '1-3 Years' },
    { label: 'Growing Kids', value: '4+ Years' }
  ]);
  const [newProdRecipes, setNewProdRecipes] = useState<{ title: string; prepTime?: string; cookTime?: string; ingredients?: string; instructions: string }[]>([]);

  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);

  // Add Category Form
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');

  // Purchase Entry Form
  const [purchaseHistory, setPurchaseHistory] = useState<PurchaseRecord[]>([]);

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
  const [newProdWeights, setNewProdWeights] = useState<any[]>(['250 g', '500 g', '1 kg']);

  // Sales State
  const [categorySales, setCategorySales] = useState<{ category: string; amount: number }[]>([]);
  const [leaderboard, setLeaderboard] = useState<{ name: string; quantity: number }[]>([]);

  // Specialized fetch functions for individual tabs
  const fetchDashboardData = async () => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
      const dashRes = await fetch(`${baseUrl}/admin/dashboard`);
      const dashData = await dashRes.json();
      if (dashData.success) {
        setStats(dashData.stats);
        setRecentOrders(dashData.recentOrders);
      }
    } catch (err) {
      console.warn('⚠️ Unable to fetch dashboard. Falling back to simulation.', err);
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
    }
  };

  const fetchCustomersData = async () => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
      const custRes = await fetch(`${baseUrl}/admin/customers`);
      const custData = await custRes.json();
      if (custData.success) {
        setCustomers(custData.customers);
      }
    } catch (err) {
      console.error('⚠️ Failed to load customers:', err);
    }
  };

  const fetchOrdersData = async () => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
      const orderRes = await fetch(`${baseUrl}/admin/orders`);
      const orderData = await orderRes.json();
      if (orderData.success) {
        setOrders(orderData.orders);
      }
    } catch (err) {
      console.error('⚠️ Failed to load orders:', err);
    }
  };

  const fetchSalesData = async () => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
      const salesRes = await fetch(`${baseUrl}/admin/sales`);
      const salesData = await salesRes.json();
      if (salesData.success) {
        setCategorySales(salesData.categorySales);
        setLeaderboard(salesData.leaderboard);
      }
    } catch (err) {
      console.error('⚠️ Failed to load sales reports:', err);
    }
  };

  const fetchPurchaseHistory = async () => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
      const purchaseRes = await fetch(`${baseUrl}/admin/inventory/purchase`);
      const purchaseData = await purchaseRes.json();
      if (purchaseData.success) {
        setPurchaseHistory(purchaseData.purchases);
      }
    } catch (err) {
      console.error('⚠️ Failed to load purchase history:', err);
    }
  };

  // Initial Auth Check
  useEffect(() => {
    setMounted(true);
    const isAuth = sessionStorage.getItem('is_admin_auth') === 'true';
    if (isAuth) {
      setIsAdminAuthenticated(true);
    } else {
      setLoading(false);
    }
  }, []);

  // Sync activeTab with URL query parameters to support refreshing and routing
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab') as AdminTab;
      if (tabParam && ['dashboard', 'inventory', 'customers', 'products', 'orders', 'sales', 'banners', 'media', 'admin-profile'].includes(tabParam)) {
        setActiveTab(tabParam);
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined' && activeTab) {
      const params = new URLSearchParams(window.location.search);
      if (params.get('tab') !== activeTab) {
        params.set('tab', activeTab);
        const newUrl = `${window.location.pathname}?${params.toString()}`;
        window.history.pushState({ path: newUrl }, '', newUrl);
      }
    }
  }, [activeTab]);

  const handleSync = async () => {
    setLoading(true);
    setError('');
    try {
      if (activeTab === 'dashboard') {
        await fetchDashboardData();
      } else if (activeTab === 'customers') {
        await fetchCustomersData();
      } else if (activeTab === 'orders') {
        await fetchOrdersData();
      } else if (activeTab === 'sales') {
        await fetchSalesData();
      }
    } catch (err) {
      console.error(err);
      setError('Error syncing data.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch only active tab content when tab selection changes
  useEffect(() => {
    if (!isAdminAuthenticated) return;

    const loadTabContent = async () => {
      setLoading(true);
      setError('');
      try {
        if (activeTab === 'dashboard') {
          await Promise.all([fetchDashboardData(), fetchProducts()]);
        } else if (activeTab === 'inventory') {
          await Promise.all([fetchProducts(), fetchPurchaseHistory()]);
        } else if (activeTab === 'customers') {
          await Promise.all([fetchCustomersData(), fetchOrdersData()]);
        } else if (activeTab === 'products') {
          await Promise.all([fetchProducts(), fetchCategories()]);
        } else if (activeTab === 'orders') {
          await fetchOrdersData();
        } else if (activeTab === 'sales') {
          await fetchSalesData();
        }
      } catch (err) {
        console.error(err);
        setError('Error loading tab content.');
      } finally {
        setLoading(false);
      }
    };

    loadTabContent();
  }, [activeTab, isAdminAuthenticated]);

  // WebSocket Live Updates (Orders & Stocks)
  useEffect(() => {
    if (!isAdminAuthenticated) return;

    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5001';
    const socket = io(socketUrl, {
      transports: ['websocket'],
    });

    socket.on('connect', () => {
      console.log('🔌 Admin connected to real-time updates socket');
    });

    socket.on('inventory-update', (data: { productId: string; stock: number; weights?: any }) => {
      console.log('📡 Admin: Real-time inventory update received:', data);
      setLocalProducts((prev) =>
        prev.map((p) =>
          p.id === data.productId
            ? { ...p, stock: data.stock, weights: data.weights !== undefined ? data.weights : p.weights }
            : p
        )
      );
    });

    socket.on('order-placed', (data: { orderId: string; order: AdminOrder }) => {
      console.log('📡 Admin: Real-time order placed received:', data);
      setOrders((prev) => {
        // Avoid duplicate entries
        if (prev.some(o => o.id === data.orderId)) return prev;
        return [data.order, ...prev];
      });
      // Increment dashboard stats if on dashboard
      setStats((prev) => ({
        ...prev,
        totalOrders: prev.totalOrders + 1,
        pendingOrders: prev.pendingOrders + 1,
        totalSales: prev.totalSales + data.order.total
      }));
    });

    socket.on('order-update', (data: { orderId: string; status: string; remarks?: string }) => {
      console.log('📡 Admin: Real-time order update received:', data);
      const timestamp = new Date().toLocaleDateString('en-IN') + ' ' + new Date().toLocaleTimeString('en-IN');
      const newHistoryEntry = {
        status: data.status,
        date: timestamp,
        remarks: data.remarks || 'Status updated'
      };

      setOrders((prev) =>
        prev.map((o) => {
          if (o.id === data.orderId) {
            const oldHistory = Array.isArray(o.status_history) ? o.status_history : [];
            const hasUpdate = oldHistory.some((h: any) => h.status === data.status && h.remarks === data.remarks);
            let newHistory = oldHistory;
            if (!hasUpdate) {
              newHistory = [...oldHistory, newHistoryEntry];
            }
            return {
              ...o,
              status: data.status,
              remarks: data.remarks || o.remarks,
              status_history: newHistory
            };
          }
          return o;
        })
      );
      setSelectedOrder((prev) => {
        if (prev && prev.id === data.orderId) {
          const oldHistory = Array.isArray(prev.status_history) ? prev.status_history : [];
          const hasUpdate = oldHistory.some((h: any) => h.status === data.status && h.remarks === data.remarks);
          let newHistory = oldHistory;
          if (!hasUpdate) {
            newHistory = [...oldHistory, newHistoryEntry];
          }
          return {
            ...prev,
            status: data.status,
            remarks: data.remarks || prev.remarks,
            status_history: newHistory
          };
        }
        return prev;
      });
    });

    socket.on('disconnect', () => {
      console.log('🔌 Admin disconnected from socket');
    });

    return () => {
      socket.disconnect();
    };
  }, [isAdminAuthenticated]);

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
  const handleOrderStatusUpdate = async (orderId: string, newStatus: string, remarks?: string) => {
    const timestamp = new Date().toLocaleDateString('en-IN') + ' ' + new Date().toLocaleTimeString('en-IN');
    const newHistoryEntry = {
      status: newStatus,
      date: timestamp,
      remarks: remarks || 'Status updated by administrator'
    };

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
      const res = await fetch(`${baseUrl}/admin/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, remarks: remarks || undefined })
      });
      const data = await res.json();
      if (data.success) {
        triggerAlert(`Order ${orderId} updated to ${newStatus}`);
        setOrders(prev => prev.map(o => {
          if (o.id === orderId) {
            const oldHistory = Array.isArray(o.status_history) ? o.status_history : [];
            return {
              ...o,
              status: newStatus,
              remarks: remarks || o.remarks,
              status_history: [...oldHistory, newHistoryEntry]
            };
          }
          return o;
        }));
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder(prev => {
            if (!prev) return null;
            const oldHistory = Array.isArray(prev.status_history) ? prev.status_history : [];
            return {
              ...prev,
              status: newStatus,
              remarks: remarks || prev.remarks,
              status_history: [...oldHistory, newHistoryEntry]
            };
          });
        }
      } else {
        triggerAlert(data.error || 'Failed to update order status', true);
      }
    } catch (err) {
      setOrders(prev => prev.map(o => {
        if (o.id === orderId) {
          const oldHistory = Array.isArray(o.status_history) ? o.status_history : [];
          return {
            ...o,
            status: newStatus,
            remarks: remarks || o.remarks,
            status_history: [...oldHistory, newHistoryEntry]
          };
        }
        return o;
      }));
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(prev => {
          if (!prev) return null;
          const oldHistory = Array.isArray(prev.status_history) ? prev.status_history : [];
          return {
            ...prev,
            status: newStatus,
            remarks: remarks || prev.remarks,
            status_history: [...oldHistory, newHistoryEntry]
          };
        });
      }
      triggerAlert(`Simulation: Order ${orderId} status changed to ${newStatus}`);
    }
  };

  // Purchase Entry Submission
  const handlePurchaseSubmit = async (
    batchNumber: string,
    items: { productId: string; weight: string | null; quantity: number }[]
  ): Promise<boolean> => {
    try {
      setLoading(true);
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
      const response = await fetch(`${baseUrl}/admin/inventory/purchase`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          batchNumber,
          items
        })
      });

      const data = await response.json();
      if (data.success) {
        triggerAlert('Batch purchase inventory log recorded successfully!');
        // Reload purchase logs & fresh stock counts
        await Promise.all([fetchPurchaseHistory(), fetchProducts()]);
        return true;
      } else {
        triggerAlert(data.error || 'Failed to log batch purchase entry.', true);
        return false;
      }
    } catch (err) {
      console.error(err);
      triggerAlert('Failed to connect to inventory API.', true);
      return false;
    } finally {
      setLoading(false);
    }
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
    if (!newProdName) {
      triggerAlert('Please enter valid product details', true);
      return;
    }

    const firstVariantPrice = newProdWeights && newProdWeights.length > 0
      ? (typeof newProdWeights[0] === 'object' ? newProdWeights[0].price : Number(newProdWeights[0]))
      : 100;
    const derivedPrice = firstVariantPrice || 100;

    const foundCategory = categories.find(
      c => c.name.toLowerCase().trim() === (newProdCat || '').toLowerCase().trim()
    );
    const categoryId = foundCategory ? foundCategory.id : 'malt';
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
          price: derivedPrice,
          originalPrice: newProdOriginalPrice,
          discount: newProdDiscount && Number(newProdDiscount) > 0 ? `${newProdDiscount}% OFF` : null,
          description: newProdDesc,
          badge: newProdBadge || undefined,
          stock: newProdStock,
          purchasePrice: Math.floor(derivedPrice * 0.65),
          weights: newProdWeights,
          imageUrl: newProdImage || null,
          videoUrl: newProdVideo || null,
          benefits: newProdBenefits,
          ingredients: structuredIngredients,
          features: { shelf_life: newProdShelfLife, suitable_for: 'All age groups' },
          faqs: newProdFaqs,
          shelfLife: newProdShelfLife,
          shelfLifeDetails: newProdShelfLifeDetails,
          suitableFor: newProdSuitableFor,
          recipes: newProdRecipes,
          descriptionImage: newProdDescImage || null
        })
      });
      const data = await res.json();
      if (data.success) {
        triggerAlert('Product added to database catalog!');
        await fetchProducts();
        setShowAddProduct(false);
        setNewProdName('');
        setNewProdPrice(0);
        setNewProdOriginalPrice(100);
        setNewProdDiscount('0');
        setNewProdDesc('');
        setNewProdBadge('');
        setNewProdStock(25);
        setNewProdImage('');
        setNewProdVideo('');
        setNewProdBenefits([
          { title: 'Traditional Nutrition', description: 'Made with ancient grains passed down through generations.' },
          { title: 'Easy to Digest', description: 'Gentle on growing tummies, suitable for all age groups.' },
          { title: 'Natural Goodness', description: 'No artificial colours, flavours or preservatives.' }
        ]);
        setNewProdIngredients('');
        setNewProdDescImage('');
        setNewProdIngDesktop('');
        setNewProdIngTablet('');
        setNewProdIngMobile('');
        setNewProdIngSameTab(true);
        setNewProdIngSameMobile('desktop');
        setNewProdFaqs([]);
        setNewProdShelfLife('6 Months');
        setNewProdShelfLifeDetails('Best before 6 months from the date of manufacturing.');
        setNewProdSuitableFor([
          { label: 'Babies', value: '6+ Months*' },
          { label: 'Toddlers', value: '1-3 Years' },
          { label: 'Growing Kids', value: '4+ Years' }
        ]);
        setNewProdRecipes([]);
      } else {
        triggerAlert(data.error || 'Failed to save product to database.', true);
      }
    } catch (err) {
      console.error(err);
      triggerAlert('Failed to connect to catalog API, saving locally.', true);
      const newProduct: ExtendedProduct = {
        id: newId,
        name: newProdName,
        price: derivedPrice,
        originalPrice: newProdOriginalPrice,
        discount: newProdDiscount && Number(newProdDiscount) > 0 ? `${newProdDiscount}% OFF` : undefined,
        category: newProdCat,
        description: newProdDesc,
        badge: newProdBadge || undefined,
        stock: newProdStock,
        purchasePrice: Math.floor(derivedPrice * 0.65),
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

    const firstVariantPrice = editingProduct.weights && editingProduct.weights.length > 0
      ? (typeof (editingProduct.weights as any[])[0] === 'object' ? (editingProduct.weights as any[])[0].price : Number(editingProduct.weights[0]))
      : (editingProduct.price || 100);
    const derivedPrice = firstVariantPrice || 100;

    const foundCategory = categories.find(
      c => c.name.toLowerCase().trim() === (editingProduct.category || '').toLowerCase().trim()
    );
    const categoryId = foundCategory ? foundCategory.id : 'malt';

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
      const res = await fetch(`${baseUrl}/products/${editingProduct.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          categoryId,
          name: editingProduct.name,
          price: derivedPrice,
          originalPrice: editingProduct.originalPrice,
          discount: editingProduct.discount,
          description: editingProduct.description,
          badge: editingProduct.badge || null,
          stock: editingProduct.stock,
          purchasePrice: Math.floor(derivedPrice * 0.65),
          weights: editingProduct.weights || ['250 g', '500 g', '1 kg'],
          imageUrl: editingProduct.image || null,
          videoUrl: editingProduct.video || null,
          benefits: editingProduct.benefits || [
            { title: 'Traditional Nutrition', description: 'Made with ancient grains passed down through generations.' },
            { title: 'Easy to Digest', description: 'Gentle on growing tummies, suitable for all age groups.' },
            { title: 'Natural Goodness', description: 'No artificial colours, flavours or preservatives.' }
          ],
          ingredients: editingProduct.ingredients,
          features: editingProduct.features || { shelf_life: '6 Months' },
          faqs: editingProduct.faqs || [],
          shelfLife: (editingProduct as any).shelfLife || null,
          shelfLifeDetails: (editingProduct as any).shelfLifeDetails || null,
          suitableFor: (editingProduct as any).suitableFor || null,
          recipes: (editingProduct as any).recipes || [],
          descriptionImage: (editingProduct as any).descriptionImage || null
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

      <main className="flex-grow pt-27 pb-20 px-4 sm:px-6 md:px-8 lg:pl-[292px] lg:pr-8 w-full">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-[#384401]" />
              <h1 className="font-poetsen text-3xl font-medium tracking-relaxed text-stone-900">
                <span className="lg:hidden">Village Made Organics Admin panel</span>
                <span className="hidden lg:inline">Admin Control Panel</span>
              </h1>
            </div>
            <p className="text-stone-700 text-xs sm:text-sm font-jakarta font-medium mt-1">
              Configure products, verify customer files, track dispatch logs, and monitor growth statistics.
            </p>
          </div>
          
          <div className="flex gap-2 flex-wrap lg:hidden">
            <button
              onClick={handleSync}
              className="flex items-center gap-2 bg-white border border-[#eeddb9] hover:bg-[#FAF4E6]/50 text-stone-850 text-xs font-bold py-2.5 px-4 rounded-xl shadow-2xs transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Sync Data</span>
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
        <div className="grid grid-cols-1 lg:grid-cols-1 gap-4 lg:gap-8 items-start">
          
          {/* Sidebar Nav controls */}
          <nav className="flex flex-row lg:flex-col gap-1.5 lg:gap-2 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0 scrollbar-none select-none lg:fixed lg:left-0 lg:top-[108px] lg:bottom-0 lg:w-[260px] lg:z-40 lg:bg-[#FAF8F5] lg:border-r lg:border-[#d3c099]/50 lg:p-6 lg:rounded-none lg:shadow-none justify-start">
            {/* Top Branding Section on Desktop */}
            <div className="hidden lg:flex flex-col gap-1.5 px-2 mb-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5.5 h-5.5 text-[#384401]" />
                <span className="font-poetsen text-lg text-[#3E2C1C]">Village Made</span>
              </div>
              <span className="text-[10px] text-stone-500 font-bold uppercase tracking-wider">Admin Workspace</span>
            </div>

            {/* Nav Links list container */}
            <div className="flex flex-row lg:flex-col gap-1.5 lg:gap-2 overflow-x-auto lg:overflow-y-auto lg:overflow-x-hidden flex-grow w-full scrollbar-none pr-1 lg:max-h-[calc(100vh-340px)]">
              {[
                { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
                { id: 'inventory', label: 'Inventory', icon: Layers },
                { id: 'customers', label: 'Customers', icon: Users },
                { id: 'products', label: 'Products', icon: Package },
                { id: 'orders', label: 'Orders', icon: ShoppingBag },
                { id: 'sales', label: 'Sales', icon: DollarSign },
                { id: 'reviews', label: 'Reviews', icon: MessageSquare },
                { id: 'banners', label: 'Banners', icon: Sparkles },
                { id: 'media', label: 'Media', icon: FolderOpen },
                { id: 'admin-profile', label: 'Profile', icon: Settings }
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as AdminTab)}
                    className={`flex items-center gap-3 px-4.5 py-3 text-[11px] lg:text-[13px] xl:text-sm font-extrabold uppercase tracking-wider shrink-0 transition-all duration-300 cursor-pointer text-left lg:w-full rounded-xl relative ${
                      isActive 
                        ? 'bg-gradient-to-r from-[#384401] to-[#4d5a02] text-white shadow-md shadow-[#384401]/15 scale-[1.02] pl-6' 
                        : 'bg-white lg:bg-transparent border border-[#eeddb9]/65 lg:border-none text-stone-600 hover:bg-[#FAF4E6]/75 hover:text-[#384401] hover:pl-5.5 hover:scale-[1.01]'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 lg:w-4 lg:h-4 shrink-0 transition-all duration-300 ${isActive ? 'text-white scale-110' : 'text-[#384401]/60'}`} />
                    <span className="transition-all duration-300">{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Bottom Actions Section on Desktop */}
            <div className="hidden lg:flex flex-col gap-2 pt-4 border-t border-[#eeddb9]/50 w-full">
              <button
                onClick={handleSync}
                className="flex items-center gap-2.5 bg-white border border-[#eeddb9] hover:bg-[#FAF4E6]/50 text-stone-850 text-xs font-bold py-2.5 px-4 rounded-xl shadow-3xs transition-colors cursor-pointer w-full"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span>Sync Data</span>
              </button>
              <button
                onClick={() => {
                  sessionStorage.removeItem('is_admin_auth');
                  setIsAdminAuthenticated(false);
                  logoutUser();
                }}
                className="flex items-center gap-2.5 bg-red-50 border border-red-200 hover:bg-red-100/50 text-red-700 text-xs font-bold py-2.5 px-4 rounded-xl shadow-3xs transition-colors cursor-pointer w-full"
              >
                Log Out
              </button>
            </div>
          </nav>

          {/* Core Content Window */}
          <div className="bg-white border border-[#d3c099] rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 shadow-xs min-h-[500px] lg:max-h-[75vh] lg:overflow-y-auto overflow-x-hidden relative">
            {loading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 backdrop-blur-[1.5px] rounded-xl sm:rounded-2xl z-50">
                <div className="flex flex-col items-center gap-3">
                  <div className="relative w-14 h-14">
                    <div className="absolute inset-0 rounded-full border-4 border-[#384401]/10"></div>
                    <div className="absolute inset-0 rounded-full border-4 border-t-[#384401] border-r-[#384401]/30 animate-spin"></div>
                  </div>
                  <span className="text-[11px] font-bold font-jakarta text-[#384401] uppercase tracking-widest animate-pulse">Loading {activeTab} Data...</span>
                </div>
              </div>
            )}
            
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
                lowStockProducts={lowStockProducts}
                localProducts={localProducts}
                purchaseHistory={purchaseHistory}
                handlePurchaseSubmit={handlePurchaseSubmit}
              />
            )}

            {activeTab === 'customers' && (
              <AdminCustomersTab
                filteredCustomers={filteredCustomers}
                customerSearch={customerSearch}
                setCustomerSearch={setCustomerSearch}
                orders={orders}
                setActiveTab={setActiveTab}
                setOrderSearch={setOrderSearch}
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
                newProdOriginalPrice={newProdOriginalPrice}
                setNewProdOriginalPrice={setNewProdOriginalPrice}
                newProdDiscount={newProdDiscount}
                setNewProdDiscount={setNewProdDiscount}
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
                newProdShelfLife={newProdShelfLife}
                setNewProdShelfLife={setNewProdShelfLife}
                newProdShelfLifeDetails={newProdShelfLifeDetails}
                setNewProdShelfLifeDetails={setNewProdShelfLifeDetails}
                newProdSuitableFor={newProdSuitableFor}
                setNewProdSuitableFor={setNewProdSuitableFor}
                newProdRecipes={newProdRecipes}
                setNewProdRecipes={setNewProdRecipes}
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
                newProdWeights={newProdWeights}
                setNewProdWeights={setNewProdWeights}
                newProdDescImage={newProdDescImage}
                setNewProdDescImage={setNewProdDescImage}
                triggerAlert={triggerAlert}
              />
            )}

            {activeTab === 'orders' && (
              <AdminOrdersTab
                orders={orders}
                selectedOrder={selectedOrder}
                setSelectedOrder={setSelectedOrder}
                handleOrderStatusUpdate={handleOrderStatusUpdate}
                orderSearch={orderSearch}
                setOrderSearch={setOrderSearch}
              />
            )}

            {activeTab === 'sales' && (
              <AdminSalesTab
                categorySales={categorySales}
                leaderboard={leaderboard}
                totalSales={stats.totalSales}
                orders={orders}
              />
            )}

            {activeTab === 'reviews' && (
              <AdminReviewsTab />
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
              <AdminMediaTab />
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

      <div className="w-full lg:pl-[260px]">
        <Footer />
      </div>
    </div>
  );
}
