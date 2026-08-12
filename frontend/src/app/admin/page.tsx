'use client';

import React, { useState, useEffect } from 'react';
import { 
  BarChart3, Users, ShoppingBag, DollarSign, Package, Activity, 
  Search, Edit3, Edit, Trash2, Check, X, AlertCircle, RefreshCw, ChevronRight, 
  TrendingUp, Star, Truck, Clipboard, Plus, ShieldCheck, Key, 
  Eye, EyeOff, Image as ImageIcon, Sparkles, FolderOpen, ArrowRight,
  TrendingDown, Layers, FileSpreadsheet, Settings, User
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { PRODUCTS, Product } from '@/data/products-list';
import { useApp } from '@/lib/context/AppContext';

type AdminTab = 'dashboard' | 'inventory' | 'customers' | 'products' | 'orders' | 'sales' | 'banners' | 'media' | 'admin-profile';

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  weight?: string;
  category?: string;
}

interface OrderAddress {
  name: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
}

interface AdminOrder {
  id: string;
  date: string;
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  status: string;
  address: OrderAddress;
  items: OrderItem[];
  customerName: string;
  customerMobile: string;
}

interface AdminCustomer {
  id: number;
  name: string;
  email: string;
  mobile: string;
  phone: string;
  created_at: string;
}

interface PurchaseRecord {
  id: string;
  productName: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
  date: string;
}

interface OfferBanner {
  id: string;
  title: string;
  imageUrl: string;
  link: string;
  active: boolean;
  tag?: string;
}

// Extend Product interface locally with stock values
interface ExtendedProduct extends Product {
  stock: number;
  purchasePrice?: number;
  image?: string;
  video?: string;
  benefits?: string[];
  ingredients?: string[];
  features?: any;
}

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
          ingredients: newProdIngredients ? newProdIngredients.split(',').map(s => s.trim()) : ['Natural ingredients'],
          features: { shelf_life: '6 Months', suitable_for: 'All age groups' }
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
        purchasePrice: Math.floor(newProdPrice * 0.65)
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
          ingredients: editingProduct.ingredients || ['Natural ingredients'],
          features: editingProduct.features || { shelf_life: '6 Months' }
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
      <div className="min-h-screen bg-[#FDFBF7] text-[#3E2C1C] flex flex-col justify-between">
        <Navbar />
        <main className="flex-grow pt-32 pb-20 px-4 flex items-center justify-center">
          <div className="w-full max-w-md bg-white border border-[#eeddb9]/55 rounded-[28px] p-6 sm:p-8 shadow-xl">
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-12 h-12 bg-[#384401]/10 rounded-2xl flex items-center justify-center text-[#384401] mb-3">
                <Key className="w-6 h-6" />
              </div>
              <h2 className="font-display text-2xl font-black text-stone-900">Admin Gated Portal</h2>
              <p className="text-xs text-stone-500 font-jakarta mt-1">Authenticate using registered credentials and security passcode</p>
            </div>

            {authError && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-4.5 rounded-xl text-xs font-semibold mb-6 flex gap-2.5 items-center font-jakarta leading-relaxed">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                <span>{authError}</span>
              </div>
            )}

            <form onSubmit={handleAdminLogin} className="space-y-4 font-jakarta">
              <div>
                <label className="text-[#1a110a] text-xs font-bold block mb-1.5">Registered Admin Mobile</label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. 9999999999"
                  value={adminPhone}
                  onChange={(e) => setAdminPhone(e.target.value)}
                  className="w-full h-11 px-4 border border-[#eeddb9] rounded-xl text-stone-900 focus:outline-none focus:ring-1 focus:ring-[#384401] focus:border-[#384401] bg-white text-sm"
                />
              </div>

              <div>
                <label className="text-[#1a110a] text-xs font-bold block mb-1.5">Passphrase Password</label>
                <div className="relative">
                  <input
                    type={showAdminPassword ? "text" : "password"}
                    required
                    placeholder="Enter security password"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    className="w-full h-11 pl-4 pr-10 border border-[#eeddb9] rounded-xl text-stone-900 focus:outline-none focus:ring-1 focus:ring-[#384401] focus:border-[#384401] bg-white text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowAdminPassword(!showAdminPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-450 cursor-pointer"
                  >
                    {showAdminPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[#1a110a] text-xs font-bold block mb-1.5">Secret Passcode</label>
                <div className="relative">
                  <input
                    type={showAdminPasscode ? "text" : "password"}
                    required
                    placeholder="Enter 4-digit passcode (1234)"
                    maxLength={4}
                    value={adminPasscode}
                    onChange={(e) => setAdminPasscode(e.target.value)}
                    className="w-full h-11 pl-4 pr-10 border border-[#eeddb9] rounded-xl text-stone-900 focus:outline-none focus:ring-1 focus:ring-[#384401] focus:border-[#384401] bg-white text-sm text-center font-black tracking-[0.4em]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowAdminPasscode(!showAdminPasscode)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#384401] hover:text-[#252d00] cursor-pointer"
                  >
                    {showAdminPasscode ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={authLoading}
                className="w-full h-12 bg-[#384401] hover:bg-[#252d00] text-white font-bold rounded-xl transition-all shadow-xs cursor-pointer text-sm tracking-wide uppercase flex items-center justify-center gap-2 mt-4"
              >
                {authLoading ? 'Verifying...' : <>Enter Dashboard <ArrowRight className="w-4 h-4" /></>}
              </button>
            </form>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#3E2C1C] flex flex-col justify-between">
      <Navbar />

      <main className="flex-grow pt-32 pb-20 px-4 max-w-7xl mx-auto w-full">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-[#384401]" />
              <h1 className="font-display text-3xl font-extrabold tracking-tight text-stone-900">
                Village Made control panel
              </h1>
            </div>
            <p className="text-stone-500 text-xs sm:text-sm font-jakarta font-medium mt-1">
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
                  className={`flex items-center gap-3 px-4.5 py-3 rounded-2xl text-xs font-bold uppercase tracking-wider shrink-0 transition-all cursor-pointer ${
                    isActive 
                      ? 'bg-[#384401] text-white shadow-md' 
                      : 'bg-white border border-[#eeddb9]/45 text-stone-700 hover:bg-[#FAF4E6]/50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>

          {/* Core Content Window */}
          <div className="bg-white border border-[#eeddb9]/50 rounded-[32px] p-6 sm:p-8 shadow-xs min-h-[500px]">
            
            {/* TAB: OVERALL DASHBOARD */}
            {activeTab === 'dashboard' && (
              <div className="space-y-8">
                
                {/* Low Stock Banner Alert */}
                {lowStockProducts.length > 0 && (
                  <div className="bg-amber-50 border border-amber-250 p-4.5 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 font-jakarta">
                    <div className="flex gap-3 items-center">
                      <AlertCircle className="w-5 h-5 text-amber-600 animate-pulse shrink-0" />
                      <div>
                        <span className="font-bold text-amber-850 text-xs sm:text-sm block">Low Stock Alert ({lowStockProducts.length} Items)</span>
                        <span className="text-[10px] text-amber-700 font-medium">Certain provisions have inventory stock under 10 units. Check stock logs immediately.</span>
                      </div>
                    </div>
                    <button
                      onClick={() => setActiveTab('inventory')}
                      className="bg-amber-600 hover:bg-amber-700 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                    >
                      Update Stock
                    </button>
                  </div>
                )}

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  {[
                    { label: 'Total Sales', val: `₹${stats.totalSales.toLocaleString('en-IN')}`, icon: DollarSign, color: 'text-amber-600 bg-amber-50' },
                    { label: 'Total Customers', val: stats.totalCustomers, icon: Users, color: 'text-blue-600 bg-blue-50' },
                    { label: 'Placed Orders', val: stats.totalOrders, icon: ShoppingBag, color: 'text-emerald-600 bg-emerald-50' },
                    { label: 'Pending Processing', val: stats.pendingOrders, icon: Activity, color: 'text-rose-600 bg-rose-50' }
                  ].map((s, idx) => {
                    const Icon = s.icon;
                    return (
                      <div key={idx} className="border border-[#eeddb9]/50 rounded-2xl p-5 flex items-center justify-between bg-stone-50/20">
                        <div>
                          <span className="text-[10px] sm:text-xs font-bold text-stone-500 uppercase tracking-wider block mb-1 font-jakarta">{s.label}</span>
                          <span className="text-xl sm:text-2xl font-black text-stone-900">{s.val}</span>
                        </div>
                        <div className={`p-3 rounded-xl ${s.color}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Main section: System Log & Recent Orders */}
                <div className="grid grid-cols-1 lg:grid-cols-[1.8fr_1.2fr] gap-8">
                  
                  {/* Recent Orders List */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-extrabold uppercase tracking-wider text-stone-955 font-jakarta flex items-center gap-2">
                      <ShoppingBag className="w-4.5 h-4.5 text-[#C56C4F]" />
                      Recent Placed Orders
                    </h3>
                    <div className="border border-[#eeddb9]/50 rounded-2xl overflow-hidden bg-stone-50/10">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border border-[#eeddb9] border-collapse">
                          <thead>
                            <tr className="bg-stone-50 border-b border-[#eeddb9] text-stone-500 font-extrabold uppercase tracking-wider">
                              <th className="p-3.5 pl-5 border border-[#eeddb9]">Order ID</th>
                              <th className="p-3.5 border border-[#eeddb9]">Customer</th>
                              <th className="p-3.5 border border-[#eeddb9]">Total</th>
                              <th className="p-3.5 pr-5 border border-[#eeddb9]">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#eeddb9]">
                            {recentOrders.length === 0 ? (
                              <tr>
                                <td colSpan={4} className="p-8 text-center text-stone-400 font-medium font-jakarta border border-[#eeddb9]">No orders recorded yet.</td>
                              </tr>
                            ) : (
                              recentOrders.map(o => (
                                <tr key={o.id} className="hover:bg-stone-50/40 font-medium">
                                  <td className="p-3.5 pl-5 font-bold text-stone-850 font-jakarta border border-[#eeddb9]">{o.id}</td>
                                  <td className="p-3.5 text-stone-600 border border-[#eeddb9]">
                                    <div className="font-semibold">{o.customerName || 'Walk-in User'}</div>
                                    <div className="text-[10px] text-stone-450">{o.customerMobile}</div>
                                  </td>
                                  <td className="p-3.5 font-bold text-stone-850 border border-[#eeddb9]">₹{o.total}</td>
                                  <td className="p-3.5 pr-5 border border-[#eeddb9]">
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                      o.status === 'Delivered' ? 'bg-green-50 text-green-700' :
                                      o.status === 'Shipped' ? 'bg-blue-50 text-blue-700' :
                                      o.status === 'Cancelled' ? 'bg-red-50 text-red-700' :
                                      'bg-amber-50 text-amber-700'
                                    }`}>
                                      {o.status}
                                    </span>
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>

                  {/* System Diagnostics */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-extrabold uppercase tracking-wider text-stone-955 font-jakarta flex items-center gap-2">
                      <Activity className="w-4.5 h-4.5 text-[#384401]" />
                      Warehouse Diagnostics
                    </h3>
                    <div className="border border-[#eeddb9]/50 rounded-2xl p-5 space-y-4.5 bg-stone-50/20 font-jakarta">
                      {[
                        { label: 'Postgres Connection', status: 'Healthy', ping: '12ms', dot: 'bg-green-500' },
                        { label: 'Express Router Server', status: 'Online', ping: 'port 5001', dot: 'bg-green-500' },
                        { label: 'Active Low Stock Flags', status: 'Triggered', ping: `${lowStockProducts.length} flags`, dot: lowStockProducts.length > 0 ? 'bg-amber-500' : 'bg-green-500' }
                      ].map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center gap-2 text-xs font-semibold">
                          <div className="flex items-center gap-2.5">
                            <span className={`w-2.5 h-2.5 rounded-full ${item.dot}`}></span>
                            <span className="text-stone-750">{item.label}</span>
                          </div>
                          <span className="text-stone-500 text-[11px] font-bold">{item.ping}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

              </div>
            )}

            {/* TAB: INVENTORY & STOCK */}
            {activeTab === 'inventory' && (
              <div className="space-y-8">
                
                {/* Top Reports Overview Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  <div className="border border-[#eeddb9]/50 rounded-2xl p-5 bg-stone-50/25 font-jakarta">
                    <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block mb-1">Total Stock Value (Cost)</span>
                    <span className="text-xl font-extrabold text-stone-955">₹{totalInventoryVal.toLocaleString('en-IN')}</span>
                    <span className="text-[10px] text-stone-400 block mt-0.5">Aggregated purchase valuation</span>
                  </div>
                  <div className="border border-amber-100 rounded-2xl p-5 bg-amber-50/5 font-jakarta">
                    <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block mb-1">Low Stock Alerts</span>
                    <span className="text-xl font-extrabold text-amber-800">{lowStockProducts.length} Items</span>
                    <span className="text-[10px] text-amber-600 block mt-0.5">Needs immediate purchase entries</span>
                  </div>
                  <div className="border border-emerald-100 rounded-2xl p-5 bg-emerald-50/5 font-jakarta">
                    <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block mb-1">Available Varieties</span>
                    <span className="text-xl font-extrabold text-emerald-800">{localProducts.length} Skus</span>
                    <span className="text-[10px] text-emerald-600 block mt-0.5">Healthy variety representation</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1.8fr] gap-8 items-start">
                  
                  {/* Left Column: Purchase Entry Form */}
                  <form onSubmit={handlePurchaseSubmit} className="border border-[#eeddb9] rounded-2xl p-5 bg-[#FAF4E6]/10 space-y-4 font-jakarta">
                    <h3 className="text-xs font-black uppercase tracking-wider text-[#384401] flex items-center gap-1.5">
                      <FileSpreadsheet className="w-4 h-4" />
                      Record Purchase Entry
                    </h3>
                    
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-stone-600">Select Product</label>
                      <select
                        required
                        value={purchaseProdId}
                        onChange={(e) => {
                          setPurchaseProdId(e.target.value);
                          const prod = localProducts.find(p => p.id === e.target.value);
                          if (prod) setPurchaseCost(prod.purchasePrice || Math.floor(prod.price * 0.6));
                        }}
                        className="h-10 px-3.5 bg-white border border-[#eeddb9] rounded-xl text-xs text-stone-900"
                      >
                        <option value="">Select Item...</option>
                        {localProducts.map(p => (
                          <option key={p.id} value={p.id}>{p.name} (Stock: {p.stock})</option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-stone-600">Quantity Added</label>
                        <input
                          type="number"
                          required
                          min="1"
                          value={purchaseQty}
                          onChange={(e) => setPurchaseQty(parseInt(e.target.value) || 0)}
                          className="h-10 px-3 bg-white border border-[#eeddb9] rounded-xl text-xs text-stone-900 font-bold"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-stone-600">Cost Price / Unit (₹)</label>
                        <input
                          type="number"
                          required
                          min="1"
                          value={purchaseCost}
                          onChange={(e) => setPurchaseCost(parseInt(e.target.value) || 0)}
                          className="h-10 px-3 bg-white border border-[#eeddb9] rounded-xl text-xs text-stone-900 font-bold"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-[#384401] hover:bg-[#252d00] text-white text-xs font-bold py-2.5 rounded-xl transition-colors cursor-pointer"
                    >
                      Save Purchase Entry
                    </button>
                  </form>

                  {/* Right Column: Inventory Stock Update Listing */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-extrabold uppercase tracking-wider text-stone-955 font-jakarta">
                      Stock Level Updates
                    </h3>
                    
                    <div className="border border-[#eeddb9]/50 rounded-2xl overflow-hidden bg-stone-50/10">
                      <div className="overflow-y-auto max-h-[300px]">
                        <table className="w-full text-left text-xs border border-[#eeddb9] border-collapse">
                          <thead>
                            <tr className="bg-stone-50 border-b border-[#eeddb9] text-stone-500 font-extrabold uppercase tracking-wider sticky top-0">
                              <th className="p-3 pl-4 border border-[#eeddb9]">Product</th>
                              <th className="p-3 text-center border border-[#eeddb9]">Stock</th>
                              <th className="p-3 text-right pr-4 border border-[#eeddb9]">Quick Adjust</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#eeddb9]">
                            {localProducts.map(p => {
                              const isLow = p.stock < 10;
                              return (
                                <tr key={p.id} className={`font-semibold ${isLow ? 'bg-amber-50/20' : ''}`}>
                                  <td className="p-3 pl-4 font-jakarta border border-[#eeddb9]">
                                    <span className="font-bold text-stone-855 block">{p.name}</span>
                                    <span className="text-[9px] text-stone-400 font-normal">{p.category}</span>
                                  </td>
                                  <td className="p-3 text-center border border-[#eeddb9]">
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                                      isLow ? 'bg-amber-100 text-amber-800 animate-pulse' : 'bg-stone-100 text-stone-700'
                                    }`}>
                                      {p.stock} Units
                                    </span>
                                  </td>
                                  <td className="p-3 text-right pr-4 border border-[#eeddb9]">
                                    <div className="flex justify-end gap-1.5">
                                      <button
                                        onClick={() => {
                                          setLocalProducts(prev => prev.map(item => item.id === p.id ? { ...item, stock: Math.max(0, item.stock - 1) } : item));
                                        }}
                                        className="w-7 h-7 bg-stone-100 text-stone-700 hover:bg-stone-200 rounded-lg flex items-center justify-center font-bold text-sm cursor-pointer"
                                      >
                                        -
                                      </button>
                                      <button
                                        onClick={() => {
                                          setLocalProducts(prev => prev.map(item => item.id === p.id ? { ...item, stock: item.stock + 1 } : item));
                                        }}
                                        className="w-7 h-7 bg-stone-100 text-stone-700 hover:bg-stone-200 rounded-lg flex items-center justify-center font-bold text-sm cursor-pointer"
                                      >
                                        +
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Purchase logs */}
                <div className="space-y-4">
                  <h3 className="text-sm font-extrabold uppercase tracking-wider text-stone-955 font-jakarta">
                    Purchase Logs History
                  </h3>
                  <div className="border border-[#eeddb9]/50 rounded-2xl overflow-hidden bg-stone-50/10">
                    <table className="w-full text-left text-xs border border-[#eeddb9] border-collapse">
                      <thead>
                        <tr className="bg-stone-50 border-b border-[#eeddb9] text-stone-500 font-bold uppercase tracking-wider">
                          <th className="p-3 pl-4 border border-[#eeddb9]">Entry ID</th>
                          <th className="p-3 border border-[#eeddb9]">Product Name</th>
                          <th className="p-3 text-center border border-[#eeddb9]">Qty Added</th>
                          <th className="p-3 border border-[#eeddb9]">Unit Cost</th>
                          <th className="p-3 text-right pr-4 border border-[#eeddb9]">Total Cost</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#eeddb9]">
                        {purchaseHistory.map(ph => (
                          <tr key={ph.id} className="font-semibold text-stone-750 font-jakarta">
                            <td className="p-3 pl-4 font-bold text-[#384401] border border-[#eeddb9]">{ph.id}</td>
                            <td className="p-3 text-stone-900 border border-[#eeddb9]">{ph.productName}</td>
                            <td className="p-3 text-center font-bold text-stone-900 border border-[#eeddb9]">+{ph.quantity}</td>
                            <td className="p-3 border border-[#eeddb9]">₹{ph.unitCost}</td>
                            <td className="p-3 text-right pr-4 font-bold text-stone-900 border border-[#eeddb9]">₹{ph.totalCost}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            )}

            {/* TAB: CUSTOMERS */}
            {activeTab === 'customers' && (
              <div className="space-y-6">
                
                {/* Filters Row */}
                <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                  <h3 className="text-sm font-extrabold uppercase tracking-wider text-stone-955 font-jakarta">
                    System Registered Customers ({filteredCustomers.length})
                  </h3>
                  <div className="relative w-full sm:max-w-xs">
                    <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search name, mobile, email..."
                      value={customerSearch}
                      onChange={(e) => setCustomerSearch(e.target.value)}
                      className="w-full h-10 pl-10 pr-4 bg-stone-50/50 border border-[#eeddb9] rounded-xl text-xs sm:text-sm placeholder-stone-400 focus:outline-none font-jakarta"
                    />
                  </div>
                </div>

                {/* Table grid */}
                <div className="border border-[#eeddb9]/50 rounded-2xl overflow-hidden bg-stone-50/10">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border border-[#eeddb9] border-collapse">
                      <thead>
                        <tr className="bg-stone-50 border-b border-[#eeddb9] text-stone-500 font-extrabold uppercase tracking-wider">
                          <th className="p-3.5 pl-5 border border-[#eeddb9]">Client ID</th>
                          <th className="p-3.5 border border-[#eeddb9]">Name</th>
                          <th className="p-3.5 border border-[#eeddb9]">Registered Number</th>
                          <th className="p-3.5 border border-[#eeddb9]">Email</th>
                          <th className="p-3.5 pr-5 border border-[#eeddb9]">Registration Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#eeddb9]">
                        {filteredCustomers.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="p-8 text-center text-stone-455 font-medium font-jakarta border border-[#eeddb9]">No matching customers found.</td>
                          </tr>
                        ) : (
                          filteredCustomers.map(c => (
                            <tr key={c.id} className="hover:bg-stone-50/40 font-medium">
                              <td className="p-3.5 pl-5 font-bold text-stone-800 font-jakarta border border-[#eeddb9]">#{c.id}</td>
                              <td className="p-3.5 text-stone-900 font-bold font-jakarta border border-[#eeddb9]">{c.name || 'Anonymous Member'}</td>
                              <td className="p-3.5 font-bold text-[#384401] border border-[#eeddb9]">{c.mobile || c.phone}</td>
                              <td className="p-3.5 text-stone-500 font-jakarta border border-[#eeddb9]">{c.email || 'No email attached'}</td>
                              <td className="p-3.5 pr-5 text-stone-455 border border-[#eeddb9]">{c.created_at ? new Date(c.created_at).toLocaleDateString('en-IN') : '12/08/2026'}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            )}

            {/* TAB: PRODUCTS */}
{activeTab === 'products' && (
              <div className="space-y-6">
                
                {/* Filters and Add row */}
                <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
                  <div className="flex gap-3 flex-wrap">
                    <select
                      value={selectedProductCategory}
                      onChange={(e) => setSelectedProductCategory(e.target.value)}
                      className="h-10 px-3 bg-white border border-[#eeddb9] rounded-xl text-stone-900 text-xs font-bold"
                    >
                      <option value="All">All Categories</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.name}>{cat.name}</option>
                      ))}
                    </select>

                    <div className="relative w-full sm:w-48">
                      <Search className="w-3.5 h-3.5 text-stone-455 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Search product..."
                        value={productSearch}
                        onChange={(e) => setProductSearch(e.target.value)}
                        className="w-full h-10 pl-8.5 pr-3 bg-white border border-[#eeddb9] rounded-xl text-xs placeholder-stone-400 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => {
                        setShowAddProduct(false);
                        setEditingProduct(null);
                        setShowAddCategory(!showAddCategory);
                      }}
                      className="flex items-center justify-center gap-1.5 bg-[#704632] hover:bg-[#5b3827] text-white text-xs font-bold py-2.5 px-4.5 rounded-xl shadow-xs transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      New Category
                    </button>
                    <button
                      onClick={() => {
                        setEditingProduct(null);
                        setShowAddCategory(false);
                        setShowAddProduct(!showAddProduct);
                      }}
                      className="flex items-center justify-center gap-1.5 bg-[#384401] hover:bg-[#252d00] text-white text-xs font-bold py-2.5 px-4.5 rounded-xl shadow-xs transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      New Product
                    </button>
                  </div>
                </div>

                {/* Add Category Modal/Form */}
                {showAddCategory && (
                  <form onSubmit={handleAddCategorySubmit} className="border border-[#eeddb9] rounded-2xl p-5 bg-[#FAF4E6]/20 space-y-4">
                    <h4 className="text-xs font-black uppercase tracking-wider text-[#704632] font-jakarta">Add New Provision Category</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-jakarta">
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-stone-600">Category Name</label>
                        <input
                          type="text"
                          required
                          value={newCatName}
                          onChange={(e) => setNewCatName(e.target.value)}
                          placeholder="e.g. Natural Sugar"
                          className="h-10 px-3 bg-white border border-[#eeddb9] rounded-xl text-xs text-stone-900"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-stone-600">Category Description</label>
                        <input
                          type="text"
                          value={newCatDesc}
                          onChange={(e) => setNewCatDesc(e.target.value)}
                          placeholder="Short description of category..."
                          className="h-10 px-3 bg-white border border-[#eeddb9] rounded-xl text-xs text-stone-900"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button type="submit" className="bg-[#704632] hover:bg-[#5b3827] text-white text-xs font-bold py-2 px-4 rounded-lg cursor-pointer">
                        Save Category
                      </button>
                      <button type="button" onClick={() => setShowAddCategory(false)} className="border border-stone-300 hover:bg-stone-50 text-stone-700 text-xs font-bold py-2 px-4 rounded-lg cursor-pointer">
                        Cancel
                      </button>
                    </div>
                  </form>
                )}

                {/* Add Product Modal/Form */}
                {showAddProduct && (
                  <form onSubmit={handleAddProductSubmit} className="border border-[#eeddb9] rounded-2xl p-5 bg-[#FAF4E6]/20 space-y-4">
                    <h4 className="text-xs font-black uppercase tracking-wider text-[#384401] font-jakarta">Add New Provision Product</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-[1.5fr_2fr_1fr] gap-4">
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-stone-600">Category</label>
                        <select
                          value={newProdCat}
                          onChange={(e) => setNewProdCat(e.target.value)}
                          className="h-10 px-3 bg-white border border-[#eeddb9] rounded-xl text-xs text-stone-900"
                        >
                          {categories.map((cat) => (
                            <option key={cat.id} value={cat.name}>{cat.name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-stone-600">Product Name</label>
                        <input
                          type="text"
                          required
                          value={newProdName}
                          onChange={(e) => setNewProdName(e.target.value)}
                          placeholder="e.g. MULTI GRAIN COOKIES"
                          className="h-10 px-3 bg-white border border-[#eeddb9] rounded-xl text-xs text-stone-900 font-jakarta"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-stone-600">Base Price (₹)</label>
                        <input
                          type="number"
                          required
                          value={newProdPrice}
                          onChange={(e) => setNewProdPrice(Number(e.target.value))}
                          className="h-10 px-3 bg-white border border-[#eeddb9] rounded-xl text-xs text-stone-900 font-jakarta"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-jakarta">
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-stone-600">Description</label>
                        <input
                          type="text"
                          value={newProdDesc}
                          onChange={(e) => setNewProdDesc(e.target.value)}
                          placeholder="Short description..."
                          className="h-10 px-3 bg-white border border-[#eeddb9] rounded-xl text-xs text-stone-900"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-stone-600">Ribbon Badge (Optional)</label>
                        <input
                          type="text"
                          value={newProdBadge}
                          onChange={(e) => setNewProdBadge(e.target.value)}
                          placeholder="e.g. BEST SELLER"
                          className="h-10 px-3 bg-white border border-[#eeddb9] rounded-xl text-xs text-stone-900"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-stone-600">Initial Stock</label>
                        <input
                          type="number"
                          value={newProdStock}
                          onChange={(e) => setNewProdStock(parseInt(e.target.value) || 0)}
                          className="h-10 px-3 bg-white border border-[#eeddb9] rounded-xl text-xs text-stone-900"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-jakarta">
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-stone-600">Product Image (Upload directly to Supabase storage)</label>
                        <div className="flex items-center gap-2 mt-1">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                setUploadingImage(true);
                                const url = await handleFileUpload(file, 'product-images');
                                if (url) setNewProdImage(url);
                                setUploadingImage(false);
                              }
                            }}
                            className="text-xs file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border file:border-[#eeddb9] file:text-xs file:font-bold file:bg-white file:text-[#384401] hover:file:bg-[#FAF4E6] cursor-pointer"
                          />
                          {uploadingImage && <span className="text-[10px] text-[#C56C4F] font-bold animate-pulse">Uploading...</span>}
                        </div>
                        {newProdImage && (
                          <span className="text-[9px] text-[#384401] font-bold block truncate max-w-xs mt-1">Uploaded: {newProdImage}</span>
                        )}
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-stone-600">Product Video (Upload directly to Supabase storage)</label>
                        <div className="flex items-center gap-2 mt-1">
                          <input
                            type="file"
                            accept="video/*"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                setUploadingVideo(true);
                                const url = await handleFileUpload(file, 'product-videos');
                                if (url) setNewProdVideo(url);
                                setUploadingVideo(false);
                              }
                            }}
                            className="text-xs file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border file:border-[#eeddb9] file:text-xs file:font-bold file:bg-white file:text-[#384401] hover:file:bg-[#FAF4E6] cursor-pointer"
                          />
                          {uploadingVideo && <span className="text-[10px] text-[#C56C4F] font-bold animate-pulse">Uploading...</span>}
                        </div>
                        {newProdVideo && (
                          <span className="text-[9px] text-[#384401] font-bold block truncate max-w-xs mt-1">Uploaded: {newProdVideo}</span>
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-jakarta">
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-stone-600">Benefits (Comma separated)</label>
                        <input
                          type="text"
                          value={newProdBenefits}
                          onChange={(e) => setNewProdBenefits(e.target.value)}
                          placeholder="e.g. Traditional Nutrition, Easy to Digest"
                          className="h-10 px-3 bg-white border border-[#eeddb9] rounded-xl text-xs text-stone-900"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-stone-600">Ingredients (Comma separated)</label>
                        <input
                          type="text"
                          value={newProdIngredients}
                          onChange={(e) => setNewProdIngredients(e.target.value)}
                          placeholder="e.g. Sprouted grains, Almonds"
                          className="h-10 px-3 bg-white border border-[#eeddb9] rounded-xl text-xs text-stone-900"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button type="submit" className="bg-[#384401] hover:bg-[#252d00] text-white text-xs font-bold py-2 px-4 rounded-lg cursor-pointer">
                        Save Product
                      </button>
                      <button type="button" onClick={() => setShowAddProduct(false)} className="border border-stone-300 hover:bg-stone-50 text-stone-700 text-xs font-bold py-2 px-4 rounded-lg cursor-pointer">
                        Cancel
                      </button>
                    </div>
                  </form>
                )}

                {/* Edit Product Inline Form */}
                {editingProduct && (
                  <form onSubmit={handleUpdateProduct} className="border border-amber-200 rounded-2xl p-5 bg-amber-50/10 space-y-4 font-jakarta">
                    <h4 className="text-xs font-black uppercase tracking-wider text-amber-800 font-jakarta">Edit Provision Product Details</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-[1.5fr_2fr_1fr] gap-4">
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-stone-600">Category</label>
                        <select
                          value={editingProduct.category}
                          onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                          className="h-10 px-3 bg-white border border-[#eeddb9] rounded-xl text-xs text-stone-900"
                        >
                          {categories.map((cat) => (
                            <option key={cat.id} value={cat.name}>{cat.name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-stone-600">Product Name</label>
                        <input
                          type="text"
                          required
                          value={editingProduct.name}
                          onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                          className="h-10 px-3 bg-white border border-[#eeddb9] rounded-xl text-xs text-stone-900 font-jakarta"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-stone-600">Base Price (₹)</label>
                        <input
                          type="number"
                          required
                          value={editingProduct.price}
                          onChange={(e) => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
                          className="h-10 px-3 bg-white border border-[#eeddb9] rounded-xl text-xs text-stone-900 font-jakarta"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-jakarta">
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-stone-600">Description</label>
                        <input
                          type="text"
                          value={editingProduct.description}
                          onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                          className="h-10 px-3 bg-white border border-[#eeddb9] rounded-xl text-xs text-stone-900 font-jakarta"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-stone-600">Ribbon Badge (Optional)</label>
                        <input
                          type="text"
                          value={editingProduct.badge || ''}
                          onChange={(e) => setEditingProduct({ ...editingProduct, badge: e.target.value || undefined })}
                          placeholder="e.g. BEST SELLER"
                          className="h-10 px-3 bg-white border border-[#eeddb9] rounded-xl text-xs text-stone-900 font-jakarta"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-stone-600">Stock</label>
                        <input
                          type="number"
                          value={editingProduct.stock}
                          onChange={(e) => setEditingProduct({ ...editingProduct, stock: parseInt(e.target.value) || 0 })}
                          className="h-10 px-3 bg-white border border-[#eeddb9] rounded-xl text-xs text-stone-900 font-jakarta"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-jakarta">
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-stone-600">Product Image (Change file)</label>
                        <div className="flex items-center gap-2 mt-1">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                setUploadingImage(true);
                                const url = await handleFileUpload(file, 'product-images');
                                if (url) setEditingProduct({ ...editingProduct, image: url });
                                setUploadingImage(false);
                              }
                            }}
                            className="text-xs file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border file:border-[#eeddb9] file:text-xs file:font-bold file:bg-white file:text-[#384401] hover:file:bg-[#FAF4E6] cursor-pointer"
                          />
                          {uploadingImage && <span className="text-[10px] text-[#C56C4F] font-bold animate-pulse">Uploading...</span>}
                        </div>
                        {editingProduct.image && (
                          <span className="text-[9px] text-[#384401] font-bold block truncate max-w-xs mt-1">URL: {editingProduct.image}</span>
                        )}
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-stone-600">Product Video (Change file)</label>
                        <div className="flex items-center gap-2 mt-1">
                          <input
                            type="file"
                            accept="video/*"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                setUploadingVideo(true);
                                const url = await handleFileUpload(file, 'product-videos');
                                if (url) setEditingProduct({ ...editingProduct, video: url });
                                setUploadingVideo(false);
                              }
                            }}
                            className="text-xs file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border file:border-[#eeddb9] file:text-xs file:font-bold file:bg-white file:text-[#384401] hover:file:bg-[#FAF4E6] cursor-pointer"
                          />
                          {uploadingVideo && <span className="text-[10px] text-[#C56C4F] font-bold animate-pulse">Uploading...</span>}
                        </div>
                        {editingProduct.video && (
                          <span className="text-[9px] text-[#384401] font-bold block truncate max-w-xs mt-1">URL: {editingProduct.video}</span>
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-jakarta">
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-stone-600">Benefits (Comma separated)</label>
                        <input
                          type="text"
                          value={editingProduct.benefits ? editingProduct.benefits.join(', ') : ''}
                          onChange={(e) => setEditingProduct({ ...editingProduct, benefits: e.target.value.split(',').map(s => s.trim()) })}
                          className="h-10 px-3 bg-white border border-[#eeddb9] rounded-xl text-xs text-stone-900 font-jakarta"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-stone-600">Ingredients (Comma separated)</label>
                        <input
                          type="text"
                          value={editingProduct.ingredients ? editingProduct.ingredients.join(', ') : ''}
                          onChange={(e) => setEditingProduct({ ...editingProduct, ingredients: e.target.value.split(',').map(s => s.trim()) })}
                          className="h-10 px-3 bg-white border border-[#eeddb9] rounded-xl text-xs text-stone-900 font-jakarta"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button type="submit" className="bg-[#384401] hover:bg-[#252d00] text-white text-xs font-bold py-2 px-4 rounded-lg cursor-pointer">
                        Update Product
                      </button>
                      <button type="button" onClick={() => setEditingProduct(null)} className="border border-stone-300 hover:bg-stone-50 text-stone-700 text-xs font-bold py-2 px-4 rounded-lg cursor-pointer">
                        Cancel
                      </button>
                    </div>
                  </form>
                )}

                {/* Products List Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {filteredProducts.map(p => (
                    <div key={p.id} className="border border-[#eeddb9]/50 rounded-2xl p-4.5 bg-stone-50/20 flex flex-col justify-between gap-3">
                      <div>
                        <div className="flex justify-between items-start gap-2">
                          <span className="text-[10px] font-extrabold uppercase tracking-wide text-stone-400 font-jakarta">{p.category}</span>
                          {p.badge && (
                            <span className="bg-[#C56C4F]/10 text-[#C56C4F] text-[9px] font-extrabold px-2 py-0.5 rounded-full font-jakarta">{p.badge}</span>
                          )}
                        </div>
                        <h4 className="font-extrabold text-stone-850 text-sm font-jakarta mt-1.5">{p.name}</h4>
                        <p className="text-[11px] text-stone-500 font-jakarta mt-1 line-clamp-2 leading-relaxed">{p.description}</p>
                      </div>
                      <div className="flex justify-between items-center pt-3 border-t border-stone-150">
                        <div className="flex flex-col">
                          <span className="font-bold text-stone-955">₹{p.price}</span>
                          <span className="text-[10px] text-stone-455 font-jakarta">Stock: {p.stock}</span>
                        </div>
                        <div className="flex gap-3 items-center">
                          <button
                            onClick={() => {
                              setShowAddProduct(false);
                              setEditingProduct(p);
                            }}
                            className="flex items-center gap-1 text-stone-600 hover:text-[#384401] text-xs font-bold cursor-pointer"
                          >
                            <Edit className="w-3.5 h-3.5" />
                            Modify
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(p.id)}
                            className="flex items-center gap-1 text-red-650 hover:text-red-800 text-xs font-bold cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

              </div>
            )}

            {/* TAB: ORDERS */}
            {activeTab === 'orders' && (
              <div className="space-y-6">
                
                {/* Header and filters */}
                <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
                  <div className="flex gap-3 flex-wrap">
                    <select
                      value={orderStatusFilter}
                      onChange={(e) => setOrderStatusFilter(e.target.value)}
                      className="h-10 px-3 bg-white border border-[#eeddb9] rounded-xl text-xs text-stone-755 font-medium"
                    >
                      <option value="All">All Statuses</option>
                      <option value="Processing">Processing</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                    
                    <div className="relative w-full sm:w-56">
                      <Search className="w-3.5 h-3.5 text-stone-455 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Search order ID or phone..."
                        value={orderSearch}
                        onChange={(e) => setOrderSearch(e.target.value)}
                        className="w-full h-10 pl-8.5 pr-3 bg-white border border-[#eeddb9] rounded-xl text-xs placeholder-stone-400 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Orders Main Log Table */}
                <div className="border border-[#eeddb9]/50 rounded-2xl overflow-hidden bg-stone-50/10">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border border-[#eeddb9] border-collapse font-jakarta">
                      <thead>
                        <tr className="bg-stone-50 border-b border-[#eeddb9] text-stone-500 font-extrabold uppercase tracking-wider">
                          <th className="p-3.5 pl-5 border border-[#eeddb9]">Order ID</th>
                          <th className="p-3.5 border border-[#eeddb9]">Date</th>
                          <th className="p-3.5 border border-[#eeddb9]">Customer Mobile</th>
                          <th className="p-3.5 border border-[#eeddb9]">Total Amount</th>
                          <th className="p-3.5 border border-[#eeddb9]">Status</th>
                          <th className="p-3.5 pr-5 border border-[#eeddb9] text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#eeddb9]">
                        {filteredOrders.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="p-8 text-center text-stone-455 font-medium border border-[#eeddb9]">No matching orders found.</td>
                          </tr>
                        ) : (
                          filteredOrders.map(o => (
                            <tr key={o.id} className="hover:bg-stone-50/40 font-medium">
                              <td className="p-3.5 pl-5 font-bold text-stone-850 border border-[#eeddb9]">{o.id}</td>
                              <td className="p-3.5 text-stone-600 border border-[#eeddb9]">{o.date}</td>
                              <td className="p-3.5 font-bold text-[#384401] border border-[#eeddb9]">{o.customerMobile}</td>
                              <td className="p-3.5 font-bold text-stone-900 border border-[#eeddb9]">₹{o.total}</td>
                              <td className="p-3.5 border border-[#eeddb9]">
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  o.status === 'Delivered' ? 'bg-green-50 text-green-700' :
                                  o.status === 'Shipped' ? 'bg-blue-50 text-blue-700' :
                                  o.status === 'Cancelled' ? 'bg-red-50 text-red-700' :
                                  'bg-amber-50 text-amber-700'
                                }`}>
                                  {o.status}
                                </span>
                              </td>
                              <td className="p-3.5 pr-5 border border-[#eeddb9] text-right">
                                <button
                                  onClick={() => setSelectedOrder(o)}
                                  className="text-stone-500 hover:text-stone-850 font-bold hover:underline cursor-pointer"
                                >
                                  View Details
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Details Sheet Modal Overlay */}
                {selectedOrder && (
                  <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-[9999]">
                    <div className="bg-white border border-[#eeddb9] rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl relative max-h-[85vh] overflow-y-auto">
                      <button
                        onClick={() => setSelectedOrder(null)}
                        className="absolute right-4.5 top-4.5 p-1.5 hover:bg-stone-100 rounded-full text-stone-400 hover:text-stone-800 transition-colors cursor-pointer"
                      >
                        <X className="w-5 h-5" />
                      </button>

                      <h3 className="font-display text-2xl font-black text-stone-900 mb-2">Order Dispatch Profile</h3>
                      <p className="text-xs text-stone-450 font-jakarta mb-5">Detail sheet for logs matching: <span className="font-bold text-stone-750">{selectedOrder.id}</span></p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                        {/* Status controls */}
                        <div className="border border-[#eeddb9]/50 rounded-2xl p-4 bg-stone-50/20 font-jakarta">
                          <span className="text-[10px] font-extrabold uppercase tracking-wide text-stone-455 block mb-2">Change Shipping Status</span>
                          <select
                            value={selectedOrder.status}
                            onChange={(e) => handleOrderStatusUpdate(selectedOrder.id, e.target.value)}
                            className="h-10.5 px-3 bg-white border border-[#eeddb9] rounded-xl text-xs text-stone-800 focus:outline-hidden font-bold w-full"
                          >
                            <option value="Processing">Processing</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </div>
                        
                        {/* Address controls */}
                          <div className="space-y-1 text-stone-700">
                            <div className="flex items-start"><span className="font-bold text-stone-900 w-[70px] shrink-0">Name:</span> <span className="font-bold text-stone-855">{selectedOrder.address?.name}</span></div>
                            <div className="flex items-start"><span className="font-bold text-stone-900 w-[70px] shrink-0">Address:</span> <span className="break-all text-stone-600">{selectedOrder.address?.address}</span></div>
                            <div className="flex items-start"><span className="font-bold text-stone-900 w-[70px] shrink-0">City/State:</span> <span className="text-stone-600">{selectedOrder.address?.city}, {selectedOrder.address?.state} - {selectedOrder.address?.pincode}</span></div>
                            <div className="flex items-start mt-0.5"><span className="font-bold text-stone-900 w-[70px] shrink-0">Phone:</span> <span className="font-bold text-[#384401]">{selectedOrder.address?.phone}</span></div>
                          </div>
                      </div>

                      {/* Items */}
                      <div className="border border-[#eeddb9]/50 rounded-2xl overflow-hidden bg-stone-50/10 font-jakarta">
                        <table className="w-full text-left text-xs border border-[#eeddb9] border-collapse">
                          <thead>
                            <tr className="bg-stone-50 border-b border-[#eeddb9] text-stone-450 font-bold uppercase tracking-wider">
                              <th className="p-3 pl-4 border border-[#eeddb9]">Item Name</th>
                              <th className="p-3 text-center border border-[#eeddb9]">Qty</th>
                              <th className="p-3 text-right pr-4 border border-[#eeddb9]">Total</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#eeddb9]">
                            {selectedOrder.items?.map((item, idx) => (
                              <tr key={idx} className="font-semibold text-stone-750">
                                <td className="p-3 pl-4 border border-[#eeddb9]">
                                  <span>{item.name}</span>
                                  {item.weight && <span className="text-[10px] text-stone-400 block font-normal">{item.weight}</span>}
                                </td>
                                <td className="p-3 text-center font-bold text-stone-900 border border-[#eeddb9]">{item.quantity}</td>
                                <td className="p-3 text-right pr-4 font-bold text-stone-900 border border-[#eeddb9]">₹{(item.price || 0) * (item.quantity || 1)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      <div className="flex justify-end gap-3 pt-6 border-t border-stone-150 mt-6 font-jakarta text-xs">
                        <div className="text-right">
                          <span className="text-stone-455">Grand Total: </span>
                          <span className="font-black text-stone-955 text-base ml-1">₹{selectedOrder.total}</span>
                        </div>
                      </div>

                    </div>
                  </div>
                )}

              </div>
            )}

            {/* TAB: SALES */}
            {activeTab === 'sales' && (
              <div className="space-y-8">
                
                <h3 className="text-sm font-extrabold uppercase tracking-wider text-stone-955 font-jakarta mb-4">
                  Financial Sales Distribution
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  
                  {/* Category Revenue Distribution */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-black uppercase tracking-wider text-[#384401] font-jakarta">Revenue by Provision Category</h4>
                    <div className="border border-[#eeddb9]/50 rounded-2xl p-5 space-y-4 bg-stone-50/20 font-jakarta">
                      {categorySales.length === 0 ? (
                        <div className="text-center py-6 text-stone-400 text-xs font-semibold">No category data recorded yet. Place orders to generate reports.</div>
                      ) : (
                        categorySales.map((c, idx) => (
                          <div key={idx} className="space-y-1.5">
                            <div className="flex justify-between text-xs font-bold text-stone-850">
                              <span>{c.category}</span>
                              <span>₹{c.amount.toLocaleString('en-IN')}</span>
                            </div>
                            <div className="h-2 bg-stone-200 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-[#384401] rounded-full" 
                                style={{ width: `${Math.min(100, (c.amount / (stats.totalSales || 1)) * 100)}%` }}
                              />
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Top Selling Products Leaderboard */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-black uppercase tracking-wider text-[#C56C4F] font-jakarta">Top Selling Products</h4>
                    <div className="border border-[#eeddb9]/50 rounded-2xl p-5 space-y-4 bg-stone-50/20 font-jakarta">
                      {leaderboard.length === 0 ? (
                        <div className="text-center py-6 text-stone-400 text-xs font-semibold">No sales recorded yet.</div>
                      ) : (
                        leaderboard.map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between gap-3 text-xs font-bold">
                            <div className="flex items-center gap-3">
                              <span className="w-6 h-6 rounded-full bg-[#C56C4F]/10 text-[#C56C4F] flex items-center justify-center text-[10px] font-extrabold">#{idx+1}</span>
                              <span className="text-stone-800 font-jakarta">{item.name}</span>
                            </div>
                            <span className="text-stone-500 font-jakarta">{item.quantity} Units</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                </div>

              </div>
            )}

            {/* TAB: BANNERS */}
            {activeTab === 'banners' && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1.8fr] gap-8 items-start">
                  
                  {/* Left Column: Upload Banner Form */}
                  <form onSubmit={handleAddBanner} className="border border-[#eeddb9] rounded-2xl p-5 bg-[#FAF4E6]/10 space-y-4 font-jakarta">
                    <h3 className="text-xs font-black uppercase tracking-wider text-[#384401] flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4" />
                      Upload Offer Banner
                    </h3>

                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-stone-600">Banner Title</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Sprouted Ragi Special 15%"
                        value={bannerTitle}
                        onChange={(e) => setBannerTitle(e.target.value)}
                        className="h-10 px-3 bg-white border border-[#eeddb9] rounded-xl text-xs text-stone-900"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-stone-600">Image Source URL</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. /images/cookies-banner.webp"
                        value={bannerImageUrl}
                        onChange={(e) => setBannerImageUrl(e.target.value)}
                        className="h-10 px-3 bg-white border border-[#eeddb9] rounded-xl text-xs text-stone-900"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-stone-600">Target Link URL</label>
                        <input
                          type="text"
                          placeholder="/products?category=Malt"
                          value={bannerLink}
                          onChange={(e) => setBannerLink(e.target.value)}
                          className="h-10 px-3 bg-white border border-[#eeddb9] rounded-xl text-xs text-stone-900"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-stone-600">Ribbon tag</label>
                        <input
                          type="text"
                          placeholder="e.g. LIMITED OFFER"
                          value={bannerTag}
                          onChange={(e) => setBannerTag(e.target.value)}
                          className="h-10 px-3 bg-white border border-[#eeddb9] rounded-xl text-xs text-stone-900"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-[#384401] hover:bg-[#252d00] text-white text-xs font-bold py-2.5 rounded-xl transition-colors cursor-pointer"
                    >
                      Publish Banner
                    </button>
                  </form>

                  {/* Right Column: Banners List Preview */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-extrabold uppercase tracking-wider text-stone-955 font-jakarta">
                      Active Offer Banner Rotators ({banners.length})
                    </h3>

                    <div className="space-y-4 font-jakarta">
                      {banners.map(b => (
                        <div key={b.id} className="border border-[#eeddb9]/50 rounded-2xl p-4 bg-stone-50/20 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                          <div className="flex items-center gap-3">
                            <div className="w-16 h-10 bg-stone-200 rounded-lg overflow-hidden shrink-0 border border-stone-300 relative">
                              <img src={b.imageUrl} alt={b.title} className="w-full h-full object-cover" />
                            </div>
                            <div>
                              {b.tag && (
                                <span className="text-[9px] font-extrabold text-[#C56C4F] uppercase tracking-wide block">{b.tag}</span>
                              )}
                              <span className="font-bold text-stone-855 text-xs sm:text-sm block">{b.title}</span>
                              <span className="text-[10px] text-stone-400 block mt-0.5">{b.link}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => {
                                setBanners(prev => prev.map(item => item.id === b.id ? { ...item, active: !item.active } : item));
                              }}
                              className={`px-3 py-1 rounded-full text-[10px] font-black tracking-wider uppercase cursor-pointer ${
                                b.active ? 'bg-green-100 text-green-700' : 'bg-stone-100 text-stone-600'
                              }`}
                            >
                              {b.active ? 'ON' : 'OFF'}
                            </button>
                            <button
                              onClick={() => {
                                showConfirm(
                                  'Remove Offer Banner',
                                  'Are you sure you want to delete this offer banner from rotation?',
                                  () => setBanners(prev => prev.filter(item => item.id !== b.id))
                                );
                              }}
                              className="text-stone-450 hover:text-red-600 cursor-pointer p-1"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* TAB: MEDIA LIBRARY */}
            {activeTab === 'media' && (
              <div className="space-y-6">
                
                {/* Upload Section */}
                <form onSubmit={handleAddMedia} className="border border-[#eeddb9] rounded-2xl p-5 bg-[#FAF4E6]/10 flex flex-col sm:flex-row gap-4 items-end font-jakarta">
                  <div className="flex-grow flex flex-col gap-1 w-full">
                    <label className="text-[10px] font-bold text-stone-600">Register Image to Media Library</label>
                    <input
                      type="text"
                      required
                      placeholder="Enter Image Path URL (e.g. /images/about/natural.svg)"
                      value={newMediaUrl}
                      onChange={(e) => setNewMediaUrl(e.target.value)}
                      className="h-10 px-3.5 bg-white border border-[#eeddb9] rounded-xl text-xs text-stone-900 w-full"
                    />
                  </div>
                  <button
                    type="submit"
                    className="bg-[#384401] hover:bg-[#252d00] text-white text-xs font-bold py-2.5 px-6 rounded-xl transition-colors cursor-pointer h-10 w-full sm:w-fit uppercase tracking-wider shrink-0"
                  >
                    Add Image
                  </button>
                </form>

                {/* Media Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
                  {mediaFiles.map((url, idx) => (
                    <div key={idx} className="border border-[#eeddb9]/55 rounded-2xl overflow-hidden bg-stone-50/20 group relative shadow-2xs">
                      <div className="aspect-video w-full bg-stone-150 relative">
                        <img src={url} alt={`Media file ${idx}`} className="w-full h-full object-cover" />
                      </div>
                      <div className="p-2.5 flex items-center justify-between bg-white">
                        <span className="text-[9px] text-stone-450 font-bold block truncate max-w-[100px] font-jakarta">{url.split('/').pop()}</span>
                        <button
                          onClick={() => {
                            showConfirm(
                              'Delete Media File',
                              'Are you sure you want to remove this asset image from the gallery media library?',
                              () => setMediaFiles(prev => prev.filter((_, i) => i !== idx))
                            );
                          }}
                          className="text-stone-400 hover:text-red-600 transition-colors p-1 cursor-pointer"
                          aria-label="Remove image"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

              </div>
            )}

            {/* TAB: ADMIN PROFILE SETTINGS */}
            {activeTab === 'admin-profile' && (
              <div className="space-y-6">
                <h3 className="text-sm font-extrabold uppercase tracking-wider text-stone-955 font-jakarta flex items-center gap-2">
                  <Settings className="w-4.5 h-4.5 text-[#384401]" />
                  Modify Admin Attributes
                </h3>
                
                <form onSubmit={handleProfileUpdateSubmit} className="max-w-xl space-y-5 font-jakarta text-stone-900">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-extrabold uppercase tracking-wider text-stone-500 block mb-1.5">Admin User Name</label>
                      <input
                        type="text"
                        required
                        value={profName}
                        onChange={(e) => setProfName(e.target.value)}
                        className="w-full h-11 px-4 border border-[#eeddb9] rounded-xl text-stone-900 bg-white text-xs font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-extrabold uppercase tracking-wider text-stone-500 block mb-1.5">Admin Email Address</label>
                      <input
                        type="email"
                        required
                        value={profEmail}
                        onChange={(e) => setProfEmail(e.target.value)}
                        className="w-full h-11 px-4 border border-[#eeddb9] rounded-xl text-stone-900 bg-white text-xs font-bold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-extrabold uppercase tracking-wider text-stone-500 block mb-1.5">Admin Phone / Mobile</label>
                    <input
                      type="tel"
                      required
                      value={profPhone}
                      onChange={(e) => setProfPhone(e.target.value)}
                      className="w-full h-11 px-4 border border-[#eeddb9] rounded-xl text-stone-900 bg-white text-xs font-bold"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-extrabold uppercase tracking-wider text-stone-500 block mb-1">New Account Password (Leave blank to keep current)</label>
                    <div className="relative">
                      <input
                        type={showProfPassword ? "text" : "password"}
                        placeholder="Enter new security password"
                        value={profPassword}
                        onChange={(e) => setProfPassword(e.target.value)}
                        className="w-full h-11 pl-4 pr-10 border border-[#eeddb9] rounded-xl text-stone-900 bg-white text-xs font-bold"
                      />
                      <button
                        type="button"
                        onClick={() => setShowProfPassword(!showProfPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-850 cursor-pointer"
                      >
                        {showProfPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                      </button>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-stone-200">
                    <label className="text-[10px] font-extrabold uppercase tracking-wider text-amber-700 block mb-1">Security Passcode (1234)</label>
                    <div className="relative">
                      <input
                        type={showProfPasscode ? "text" : "password"}
                        required
                        maxLength={4}
                        placeholder="Enter 4-digit passcode to verify changes"
                        value={profPasscode}
                        onChange={(e) => setProfPasscode(e.target.value)}
                        className="w-full h-11 pl-4 pr-10 border border-amber-300 rounded-xl text-stone-900 bg-white text-xs font-black tracking-widest text-center"
                      />
                      <button
                        type="button"
                        onClick={() => setShowProfPasscode(!showProfPasscode)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-850 cursor-pointer"
                      >
                        {showProfPasscode ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={profileSaving}
                    className="h-11 px-6 bg-[#384401] hover:bg-[#252d00] text-white text-xs font-bold rounded-xl transition-all cursor-pointer uppercase tracking-wider"
                  >
                    {profileSaving ? 'Saving...' : 'Save Profile Changes'}
                  </button>
                </form>

              </div>
            )}

          </div>

        </div>

      </main>

      <Footer />
    </div>
  );
}
