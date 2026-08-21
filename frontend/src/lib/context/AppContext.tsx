'use client';
import React, { createContext, useState, useContext, ReactNode, useEffect, useMemo, useCallback } from 'react';
import { getDictionary } from '@/lib/translations';
import Script from 'next/script';
import { X, CheckCircle, AlertTriangle, AlertCircle, Info, Check } from 'lucide-react';
import { io } from 'socket.io-client';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  weight: string;
  quantity: number;
  image?: string;
  category?: string;
}

export interface UserAddress {
  id: string;
  name: string;
  phone: string;
  address: string;
  city: string;
  state?: string;
  pincode: string;
  isDefault?: boolean;
}

export interface UserOrder {
  id: string;
  date: string;
  items: CartItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  status: 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled' | 'Return Requested' | 'Returned' | 'Return Rejected';
  address: UserAddress;
  remarks?: string;
  appeal_submitted?: boolean;
  status_history?: Array<{
    status: string;
    date: string;
    remarks?: string;
  }>;
}

export interface UserReview {
  id: string;
  productId: string;
  productName: string;
  rating: number;
  comment: string;
  date: string;
}

export interface UserNotification {
  id: string;
  title: string;
  message: string;
  date: string;
  read: boolean;
}

export interface User {
  id?: number;
  mobile: string;
  name?: string;
  email?: string;
  phone?: string;
  role?: string;
  addresses: UserAddress[];
  orders: UserOrder[];
  wishlist: string[];
  reviews: UserReview[];
  notifications: UserNotification[];
}

export interface Ticket {
  id: string;
  user_id?: number;
  subject: string;
  description: string;
  category: string;
  order_id?: string;
  status: string;
  created_at: string;
  updated_at: string;
  order_ref_id?: string;
}

export interface GalleryItem {
  id: number;
  title: string;
  url: string;
  type: 'image' | 'video' | 'youtube';
  display_order: number;
  active: boolean;
  last_updated?: string;
}

interface AppContextType {
  language: string;
  setLanguage: (lang: string) => void;
  soundOn: boolean;
  toggleSound: () => void;
  setSoundOn: (sound: boolean) => void;
  dict: any; // The dictionary object
  cart: CartItem[];
  addToCart: (item: Omit<CartItem, 'quantity'>, qty?: number) => void;
  removeFromCart: (id: string, weight: string) => void;
  updateQuantity: (id: string, weight: string, qty: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartTotal: number;
  
  // User Authentication & Profile States
  user: User | null;
  registerUser: (mobile: string, password?: string, optionalData?: { name?: string; phone?: string; email?: string }) => Promise<{ success: boolean; user?: User; error?: string }>;
  loginUser: (mobile: string, password?: string) => Promise<{ success: boolean; user?: User; error?: string }>;
  resetPassword: (mobile: string, otp: string, newPassword?: string) => Promise<{ success: boolean; error?: string }>;
  logoutUser: () => void;
  updateUserProfile: (data: Partial<User>) => void;
  refreshUserProfile: () => Promise<void>;
  toggleWishlist: (productId: string) => void;
  addOrder: (items: CartItem[], totalDetails: { subtotal: number; shipping: number; tax: number; total: number }, address: UserAddress) => void;
  createOrder: (orderData: {
    id: string;
    mobile?: string;
    date: string;
    subtotal: number;
    shipping: number;
    tax: number;
    total: number;
    address: {
      name: string;
      phone: string;
      address: string;
      city: string;
      state: string;
      pincode: string;
    };
    items: CartItem[];
  }) => Promise<{ success: boolean; error?: string }>;
  updateOrderStatus: (orderId: string, status: UserOrder['status']) => void;
  addAddress: (address: Omit<UserAddress, 'id'>) => void;
  deleteAddress: (id: string) => void;
  addNotification: (title: string, message: string) => void;
  markAllNotificationsAsRead: () => void;
  markNotificationAsRead: (id: string) => void;
  deleteNotification: (id: string) => void;
  clearAllNotifications: () => void;
  addReview: (productId: string, productName: string, rating: number, comment: string) => void;
  addProductReview: (productId: string, author: string, rating: number, title: string, comment: string) => Promise<{ success: boolean; error?: string }>;
  editProductReview: (productId: string, reviewId: string, rating: number, title: string, comment: string) => Promise<{ success: boolean; error?: string }>;
  deleteProductReview: (productId: string, reviewId: string) => Promise<{ success: boolean; error?: string }>;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  showAlert: (title: string, message: string, type?: 'success' | 'error' | 'info') => void;
  showConfirm: (title: string, message: string, onConfirm: () => void, onCancel?: () => void) => void;
  products: any[];
  categories: any[];
  fetchProducts: () => Promise<void>;
  fetchCategories: () => Promise<void>;
  isHydrated: boolean;
  tickets: Ticket[];
  raiseTicket: (subject: string, description: string, category: string, orderId?: string) => Promise<{ success: boolean; ticket?: Ticket; error?: string }>;
  fetchUserTickets: () => Promise<void>;
  galleryItems: GalleryItem[];
  fetchGalleryItems: () => Promise<void>;
  fetchAllGalleryItems: () => Promise<GalleryItem[]>;
  createGalleryItem: (item: Omit<GalleryItem, 'id'>) => Promise<{ success: boolean; item?: GalleryItem; error?: string }>;
  updateGalleryItem: (id: number, data: Partial<GalleryItem>) => Promise<{ success: boolean; item?: GalleryItem; error?: string }>;
  deleteGalleryItem: (id: number) => Promise<{ success: boolean; error?: string }>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const generateRandomId = () => Math.random().toString(36).substring(2, 11);
const generateAddressId = () => `VM-${Math.floor(100000 + Math.random() * 900000)}`;

export function AppProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState('en');
  const [soundOn, setSoundOn] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  // User auth state
  const [user, setUser] = useState<User | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);

  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);

  useEffect(() => {
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5001';
    const socket = io(socketUrl, {
      transports: ['websocket'],
    });

    socket.on('connect', () => {
      console.log('🔌 Connected to real-time inventory socket');
    });

    socket.on('inventory-update', (data: { productId: string; stock: number; weights?: any }) => {
      console.log('📡 Real-time inventory update received:', data);
      setProducts((prevProducts) =>
        prevProducts.map((p) =>
          p.id === data.productId
            ? { ...p, stock: data.stock, weights: data.weights !== undefined ? data.weights : p.weights }
            : p
        )
      );
    });

    socket.on('order-update', (data: { orderId: string; status: any; remarks?: string }) => {
      console.log('📡 Real-time order update received:', data);
      setUser((prevUser) => {
        if (!prevUser || !prevUser.orders) return prevUser;
        return {
          ...prevUser,
          orders: prevUser.orders.map((o) => {
            if (o.id === data.orderId) {
              const oldHistory = Array.isArray(o.status_history) ? o.status_history : [];
              const hasUpdate = oldHistory.some((h: any) => h.status === data.status && h.remarks === data.remarks);
              let newHistory = oldHistory;
              if (!hasUpdate) {
                newHistory = [
                  ...oldHistory,
                  {
                    status: data.status,
                    date: new Date().toLocaleDateString('en-IN') + ' ' + new Date().toLocaleTimeString('en-IN'),
                    remarks: data.remarks || 'Status updated by administrator'
                  }
                ];
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
        };
      });
    });

    socket.on('new-notification', (data: { userId: number; notification: any }) => {
      console.log('📡 Real-time notification received:', data);
      setUser((prevUser) => {
        if (!prevUser || prevUser.id !== data.userId) return prevUser;
        const oldNotifs = Array.isArray(prevUser.notifications) ? prevUser.notifications : [];
        if (oldNotifs.some((n: any) => n.id === data.notification.id)) return prevUser;
        return {
          ...prevUser,
          notifications: [data.notification, ...oldNotifs]
        };
      });
    });

    socket.on('disconnect', () => {
      console.log('🔌 Disconnected from real-time inventory socket');
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const fetchProducts = async () => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
      const res = await fetch(`${baseUrl}/products`);
      const data = await res.json();
      if (data.success && Array.isArray(data.products) && data.products.length > 0) {
        setProducts(data.products);
      } else {
        const localData = await import('@/data/products-list');
        setProducts(localData.PRODUCTS);
      }
    } catch (err) {
      console.warn('⚠️ Failed to load products from API, falling back to local catalog:', err);
      try {
        const localData = await import('@/data/products-list');
        setProducts(localData.PRODUCTS);
      } catch (fallbackErr) {
        console.error('❌ Failed to load local catalog fallback:', fallbackErr);
      }
    }
  };

  const fetchCategories = async () => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
      const res = await fetch(`${baseUrl}/products/categories`);
      const data = await res.json();
      if (data.success && Array.isArray(data.categories) && data.categories.length > 0) {
        setCategories(data.categories);
      } else {
        const localCats = await import('@/data/categories.json');
        setCategories(localCats.default || localCats);
      }
    } catch (err) {
      console.warn('⚠️ Failed to load categories from API, falling back to local configuration:', err);
      try {
        const localCats = await import('@/data/categories.json');
        setCategories(localCats.default || localCats);
      } catch (fallbackErr) {
        console.error('❌ Failed to load local categories fallback:', fallbackErr);
      }
    }
  };

  const getDefaultGalleryItems = (): GalleryItem[] => {
    return [
      { id: 1, title: 'Our Multi Grain Malt', url: '/images/product-section/product-placeholder-rimage.webp', type: 'image', display_order: 1, active: true },
      { id: 2, title: 'Hygienic Packaging', url: '/images/process-section/hygienic-packing.webp', type: 'image', display_order: 2, active: true },
      { id: 3, title: 'Pure Ingredients', url: '/images/why-choose/why-choose-product-image.webp', type: 'image', display_order: 3, active: true },
      { id: 4, title: 'Freshly Delivered', url: '/images/process-section/delivered-fresh.webp', type: 'image', display_order: 4, active: true },
      { id: 5, title: 'Our Village Journey', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', type: 'youtube', display_order: 5, active: true }
    ];
  };

  const fetchGalleryItems = async () => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
      const res = await fetch(`${baseUrl}/gallery`);
      const data = await res.json();
      if (data.success && Array.isArray(data.items)) {
        setGalleryItems(data.items);
      } else {
        setGalleryItems(getDefaultGalleryItems());
      }
    } catch (err) {
      console.warn('⚠️ Failed to load gallery items from API, using fallback:', err);
      setGalleryItems(getDefaultGalleryItems());
    }
  };

  const fetchAllGalleryItems = async (): Promise<GalleryItem[]> => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
      const res = await fetch(`${baseUrl}/gallery/all`);
      const data = await res.json();
      if (data.success && Array.isArray(data.items)) {
        return data.items;
      }
    } catch (err) {
      console.error('Failed to fetch all gallery items:', err);
    }
    return galleryItems.length > 0 ? galleryItems : getDefaultGalleryItems();
  };

  const createGalleryItem = async (newItem: Omit<GalleryItem, 'id'>) => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
      const res = await fetch(`${baseUrl}/gallery`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newItem)
      });
      const data = await res.json();
      if (data.success) {
        await fetchGalleryItems();
        return { success: true, item: data.item };
      }
      return { success: false, error: data.error };
    } catch (err) {
      console.error(err);
      const fallbackItem: GalleryItem = { id: Date.now(), ...newItem };
      setGalleryItems(prev => [...prev, fallbackItem]);
      return { success: true, item: fallbackItem };
    }
  };

  const updateGalleryItem = async (id: number, updateData: Partial<GalleryItem>) => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
      const res = await fetch(`${baseUrl}/gallery/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      });
      const data = await res.json();
      if (data.success) {
        await fetchGalleryItems();
        return { success: true, item: data.item };
      }
      return { success: false, error: data.error };
    } catch (err) {
      console.error(err);
      setGalleryItems(prev => prev.map(item => item.id === id ? { ...item, ...updateData } : item));
      return { success: true };
    }
  };

  const deleteGalleryItem = async (id: number) => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
      const res = await fetch(`${baseUrl}/gallery/${id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        await fetchGalleryItems();
        return { success: true };
      }
      return { success: false, error: data.error };
    } catch (err) {
      console.error(err);
      setGalleryItems(prev => prev.filter(item => item.id !== id));
      return { success: true };
    }
  };

  const toggleSound = () => setSoundOn(prev => !prev);
  
  // Get the dictionary based on current language - memoized so it only
  // recalculates when language changes, not on every cart/user update
  const dict = useMemo(() => getDictionary(language), [language]);

  // Load cart and user sessions from localStorage on mount
  useEffect(() => {
    const storedCart = localStorage.getItem('village_made_cart');
    if (storedCart) {
      try {
        setCart(JSON.parse(storedCart));
      } catch (e) {
        console.error('Failed to parse cart data', e);
      }
    }

    const storedUser = localStorage.getItem('village_made_user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        const isAdminSession = sessionStorage.getItem('is_admin_auth') === 'true';
        if (parsedUser && parsedUser.role === 'admin' && !isAdminSession) {
          localStorage.removeItem('village_made_user');
        } else {
          setUser(parsedUser);
        }
      } catch (e) {
        console.error('Failed to parse user session', e);
      }
    }
    
    fetchProducts();
    fetchCategories();
    fetchGalleryItems();
    setIsHydrated(true);
  }, []);

  // Sync state language with Google Translate element in DOM and cookies
  useEffect(() => {
    if (!isHydrated) return;

    // 1. Set the cookies for Google Translate to preserve language on reload / page navigation
    const setTranslateCookie = (lang: string) => {
      document.cookie = `googtrans=/en/${lang}; path=/;`;
      if (typeof window !== 'undefined') {
        const host = window.location.hostname;
        document.cookie = `googtrans=/en/${lang}; path=/; domain=.${host};`;
        document.cookie = `googtrans=/en/${lang}; path=/; domain=${host};`;
      }
    };

    setTranslateCookie(language);

    // 2. Programmatically trigger the select change to translate without reloading
    const updateGoogleTranslate = () => {
      const googleSelect = document.querySelector('.goog-te-combo') as HTMLSelectElement;
      if (googleSelect) {
        googleSelect.value = language;
        googleSelect.dispatchEvent(new Event('change'));
      } else {
        // Retry if element has not finished loading/injecting
        setTimeout(updateGoogleTranslate, 250);
      }
    };

    updateGoogleTranslate();
  }, [language, isHydrated]);

  // Save cart to localStorage when it changes
  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem('village_made_cart', JSON.stringify(cart));
    }
  }, [cart, isHydrated]);

  // Sync user state to localStorage & backend Postgres database when it changes
  useEffect(() => {
    if (isHydrated) {
      if (user) {
        localStorage.setItem('village_made_user', JSON.stringify(user));
        
        // Also update the local database of registered users
        const usersDb = JSON.parse(localStorage.getItem('village_made_users_db') || '[]');
        const updatedDb = usersDb.map((u: User) => u.mobile === user.mobile ? user : u);
        localStorage.setItem('village_made_users_db', JSON.stringify(updatedDb));

        // Asynchronously sync the profile changes to the Postgres backend
        const syncProfile = async () => {
          try {
            const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
            await fetch(`${baseUrl}/auth/profile`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                mobile: user.mobile,
                name: user.name,
                email: user.email,
                phone: user.phone,
                addresses: user.addresses,
                reviews: user.reviews,
                notifications: user.notifications,
                orders: user.orders
              })
            });
          } catch (e) {
            console.error('Failed to sync user profile with backend database', e);
          }
        };
        syncProfile();
      } else {
        localStorage.removeItem('village_made_user');
      }
    }
  }, [user, isHydrated]);

  const addToCart = (newItem: Omit<CartItem, 'quantity'>, qty: number = 1) => {
    const product = products.find(p => p.id === newItem.id);
    const stockLimit = product ? product.stock : 50;

    if (stockLimit <= 0) {
      showToast(`Sorry, "${newItem.name}" is currently out of stock.`, 'error');
      return;
    }

    setCart(prevCart => {
      const existingItemIndex = prevCart.findIndex(
        item => item.id === newItem.id && item.weight === newItem.weight
      );

      if (existingItemIndex > -1) {
        const currentQty = prevCart[existingItemIndex].quantity;
        if (currentQty + qty > stockLimit) {
          showToast(`Cannot add more. Only ${stockLimit} units of "${newItem.name}" are in stock.`, 'error');
          return prevCart;
        }
        const updatedCart = [...prevCart];
        updatedCart[existingItemIndex].quantity += qty;
        showToast(`Added more "${newItem.name}" to cart.`, 'success');
        return updatedCart;
      }

      if (qty > stockLimit) {
        showToast(`Cannot add. Only ${stockLimit} units of "${newItem.name}" are in stock.`, 'error');
        return prevCart;
      }

      showToast(`Added "${newItem.name}" to cart.`, 'success');
      return [...prevCart, { ...newItem, quantity: qty }];
    });
  };

  const removeFromCart = (id: string, weight: string) => {
    setCart(prevCart => prevCart.filter(item => !(item.id === id && item.weight === weight)));
  };

  const updateQuantity = (id: string, weight: string, qty: number) => {
    const finalQty = Math.max(1, qty);
    const cartItem = cart.find(item => item.id === id && item.weight === weight);
    if (!cartItem) return;

    const product = products.find(p => p.id === id);
    const stockLimit = product ? product.stock : 50;

    if (finalQty > stockLimit) {
      showToast(`Only ${stockLimit} units of "${cartItem.name}" are in stock.`, 'error');
      return;
    }

    setCart(prevCart =>
      prevCart.map(item =>
        item.id === id && item.weight === weight ? { ...item, quantity: finalQty } : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartCount = useMemo(
    () => cart.reduce((total, item) => total + item.quantity, 0),
    [cart]
  );
  const cartTotal = useMemo(
    () => cart.reduce((total, item) => total + item.price * item.quantity, 0),
    [cart]
  );

  // Authentication Database Actions
  const registerUser = async (mobile: string, password?: string, optionalData?: { name?: string; phone?: string; email?: string }) => {
    const cleanMobile = mobile.trim();
    if (!cleanMobile || cleanMobile.length < 10) {
      return { success: false, error: 'Please enter a valid mobile number.' };
    }

    if (!password || password.trim().length < 6) {
      return { success: false, error: 'Password must be at least 6 characters long.' };
    }

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
      const res = await fetch(`${baseUrl}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mobile: cleanMobile,
          password: password.trim(),
          name: optionalData?.name || '',
          email: optionalData?.email || '',
          phone: optionalData?.phone || cleanMobile
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, error: data.error || 'Registration failed.' };
      }

      setUser(data.user);
      return { success: true, user: data.user };
    } catch (err) {
      return { success: false, error: 'Network error connecting to auth server.' };
    }
  };

  const loginUser = async (mobile: string, password?: string) => {
    const cleanMobile = mobile.trim();
    if (!cleanMobile) {
      return { success: false, error: 'Mobile number is required.' };
    }

    if (!password) {
      return { success: false, error: 'Password is required.' };
    }

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
      const res = await fetch(`${baseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          mobile: cleanMobile,
          password: password.trim()
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, error: data.error || 'Login failed.' };
      }

      setUser(data.user);
      return { success: true, user: data.user };
    } catch (err) {
      return { success: false, error: 'Network error connecting to auth server.' };
    }
  };
  const resetPassword = async (mobile: string, otp: string, newPassword?: string) => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
      const res = await fetch(`${baseUrl}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mobile: mobile.trim(),
          otp: otp.trim(),
          newPassword: newPassword?.trim()
        })
      });
      const data = await res.json();
      return { success: res.ok && data.success, error: data.error };
    } catch (err) {
      return { success: false, error: 'Network error connecting to auth server.' };
    }
  };
  const logoutUser = () => {
    setUser(null);
  };

  const updateUserProfile = (data: Partial<User>) => {
    if (!user) return;
    setUser(prev => {
      if (!prev) return null;
      return { ...prev, ...data };
    });
  };

  const refreshUserProfile = async () => {
    if (!user) return;
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
      const res = await fetch(`${baseUrl}/auth/profile/${user.mobile}`);
      const data = await res.json();
      if (data.success && data.user) {
        setUser(data.user);
      }
    } catch (e) {
      console.error('Failed to refresh user profile:', e);
    }
  };

  const toggleWishlist = (productId: string) => {
    if (!user) return;
    setUser(prev => {
      if (!prev) return null;
      const wishlist = [...prev.wishlist];
      const index = wishlist.indexOf(productId);
      if (index > -1) {
        wishlist.splice(index, 1);
      } else {
        wishlist.push(productId);
      }
      return { ...prev, wishlist };
    });
  };

  const addOrder = (items: CartItem[], totalDetails: { subtotal: number; shipping: number; tax: number; total: number }, address: UserAddress) => {
    if (!user) return;
    const newOrder: UserOrder = {
      id: address.id || generateAddressId(),
      date: new Date().toLocaleDateString('en-IN'),
      items,
      subtotal: totalDetails.subtotal,
      shipping: totalDetails.shipping,
      tax: totalDetails.tax,
      total: totalDetails.total,
      status: 'Processing',
      address
    };

    setUser(prev => {
      if (!prev) return null;
      const orders = [newOrder, ...prev.orders];
      const notifications = [
        {
          id: generateRandomId(),
          title: 'Order Placed!',
          message: `Your order ${newOrder.id} has been received and is being processed.`,
          date: new Date().toLocaleDateString('en-IN'),
          read: false
        },
        ...prev.notifications
      ];
      return { ...prev, orders, notifications };
    });
  };

  const createOrder = async (orderData: {
    id: string;
    mobile?: string;
    date: string;
    subtotal: number;
    shipping: number;
    tax: number;
    total: number;
    address: {
      name: string;
      phone: string;
      address: string;
      city: string;
      state: string;
      pincode: string;
    };
    items: CartItem[];
  }) => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
      const res = await fetch(`${baseUrl}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast('Order placed successfully!', 'success');

        // If registered user, update local user state
        if (user) {
          const newOrder: UserOrder = {
            id: orderData.id,
            date: orderData.date,
            items: orderData.items,
            subtotal: orderData.subtotal,
            shipping: orderData.shipping,
            tax: orderData.tax,
            total: orderData.total,
            status: 'Processing',
            address: {
              id: orderData.id,
              ...orderData.address,
              isDefault: false
            }
          };

          setUser(prev => {
            if (!prev) return null;
            const orders = [newOrder, ...prev.orders];
            const notifications = [
              {
                id: generateRandomId(),
                title: 'Order Placed!',
                message: `Your order ${newOrder.id} has been received and is being processed.`,
                date: orderData.date,
                read: false
              },
              ...prev.notifications
            ];
            return { ...prev, orders, notifications };
          });
        }

        return { success: true };
      } else {
        showToast(data.error || 'Failed to place order.', 'error');
        return { success: false, error: data.error };
      }
    } catch (err) {
      console.error('Error placing order:', err);
      showToast('Connection error. Please try again.', 'error');
      return { success: false, error: 'Connection error' };
    }
  };

  const updateOrderStatus = (orderId: string, status: UserOrder['status']) => {
    setUser(prev => {
      if (!prev) return null;
      const orders = prev.orders.map(o => o.id === orderId ? { ...o, status } : o);
      return { ...prev, orders };
    });
  };

  const addAddress = (addressData: Omit<UserAddress, 'id'>) => {
    if (!user) return;
    const newAddress: UserAddress = {
      ...addressData,
      id: generateRandomId(),
      isDefault: user.addresses.length === 0 ? true : addressData.isDefault
    };

    setUser(prev => {
      if (!prev) return null;
      let addresses = [...prev.addresses];
      if (newAddress.isDefault) {
        addresses = addresses.map(addr => ({ ...addr, isDefault: false }));
      }
      addresses.push(newAddress);
      return { ...prev, addresses };
    });
  };

  const deleteAddress = (id: string) => {
    if (!user) return;
    setUser(prev => {
      if (!prev) return null;
      const addresses = prev.addresses.filter(addr => addr.id !== id);
      // Ensure there is still a default if deleted was default
      if (addresses.length > 0 && !addresses.some(addr => addr.isDefault)) {
        addresses[0].isDefault = true;
      }
      return { ...prev, addresses };
    });
  };

  const addNotification = (title: string, message: string) => {
    if (!user) return;
    const newNotification: UserNotification = {
      id: generateRandomId(),
      title,
      message,
      date: new Date().toLocaleDateString('en-IN'),
      read: false
    };
    setUser(prev => {
      if (!prev) return null;
      return { ...prev, notifications: [newNotification, ...prev.notifications] };
    });
  };

  const markAllNotificationsAsRead = () => {
    if (!user) return;
    setUser(prev => {
      if (!prev) return null;
      const updated = prev.notifications.map(n => ({ ...n, read: true }));
      return { ...prev, notifications: updated };
    });
  };

  const markNotificationAsRead = (id: string) => {
    if (!user) return;
    setUser(prev => {
      if (!prev) return null;
      const updated = prev.notifications.map(n => n.id === id ? { ...n, read: true } : n);
      return { ...prev, notifications: updated };
    });
  };

  const deleteNotification = (id: string) => {
    if (!user) return;
    setUser(prev => {
      if (!prev) return null;
      const updated = prev.notifications.filter(n => n.id !== id);
      return { ...prev, notifications: updated };
    });
  };

  const clearAllNotifications = () => {
    if (!user) return;
    setUser(prev => {
      if (!prev) return null;
      return { ...prev, notifications: [] };
    });
  };

  const addReview = (productId: string, productName: string, rating: number, comment: string) => {
    if (!user) return;
    const newReview: UserReview = {
      id: Math.random().toString(36).substr(2, 9),
      productId,
      productName,
      rating,
      comment,
      date: new Date().toLocaleDateString('en-IN')
    };
    setUser(prev => {
      if (!prev) return null;
      return { ...prev, reviews: [newReview, ...prev.reviews] };
    });
  };

  const addProductReview = async (productId: string, author: string, rating: number, title: string, comment: string) => {
    const cleanAuthor = author.trim() || 'Anonymous';
    
    if (!user) {
      showToast('You must be logged in to submit a review.', 'error');
      return { success: false, error: 'Not logged in' };
    }

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
      const res = await fetch(`${baseUrl}/products/${productId}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          author: cleanAuthor,
          rating,
          title: title.trim() || 'Verified Purchase Review',
          comment: comment.trim(),
          mobile: user.mobile
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast('Review submitted successfully!', 'success');
        
        // Link to user session review log if active
        const userReview: UserReview = {
          id: generateRandomId(),
          productId,
          productName: title || 'Product Review',
          rating,
          comment,
          date: new Date().toLocaleDateString('en-IN')
        };
        setUser(prev => {
          if (!prev) return null;
          return { ...prev, reviews: [userReview, ...prev.reviews] };
        });

        fetchProducts();

        return { success: true };
      } else {
        showToast(data.error || 'Failed to save review.', 'error');
        return { success: false, error: data.error };
      }
    } catch (err) {
      console.warn('⚠️ Connection error, saving review locally:', err);
      showToast('Offline: Review saved locally.', 'info');

      const newProductReview = {
        id: generateRandomId(),
        author: cleanAuthor,
        rating,
        title: title.trim() || 'Verified Purchase Review',
        comment: comment.trim(),
        time: 'Just now',
        helpful: 0
      };

      const allReviews = JSON.parse(localStorage.getItem('village_made_global_reviews') || '{}');
      if (!allReviews[productId]) {
        allReviews[productId] = [];
      }
      allReviews[productId] = [newProductReview, ...allReviews[productId]];
      localStorage.setItem('village_made_global_reviews', JSON.stringify(allReviews));

      if (user) {
        const userReview: UserReview = {
          id: newProductReview.id,
          productId,
          productName: title || 'Product Review',
          rating,
          comment,
          date: new Date().toLocaleDateString('en-IN')
        };
        setUser(prev => {
          if (!prev) return null;
          return { ...prev, reviews: [userReview, ...prev.reviews] };
        });
      }
      return { success: true };
    }
  };

  const editProductReview = async (productId: string, reviewId: string, rating: number, title: string, comment: string) => {
    if (!user) {
      showToast('You must be logged in to edit a review.', 'error');
      return { success: false, error: 'Not logged in' };
    }

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
      const res = await fetch(`${baseUrl}/products/${productId}/reviews/${reviewId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rating,
          title: title.trim() || 'Verified Purchase Review',
          comment: comment.trim(),
          mobile: user.mobile
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast('Review updated successfully!', 'success');
        
        // Update user session reviews
        setUser(prev => {
          if (!prev) return null;
          const reviews = prev.reviews.map(r => 
            r.id === reviewId ? { ...r, rating, comment, productName: title || r.productName } : r
          );
          return { ...prev, reviews };
        });

        fetchProducts();

        return { success: true };
      } else {
        showToast(data.error || 'Failed to update review.', 'error');
        return { success: false, error: data.error };
      }
    } catch (err) {
      console.warn('⚠️ Connection error, editing review locally:', err);
      showToast('Offline: Review edit saved locally.', 'info');

      // Local storage fallback
      const allReviews = JSON.parse(localStorage.getItem('village_made_global_reviews') || '{}');
      if (allReviews[productId]) {
        allReviews[productId] = allReviews[productId].map((r: any) => 
          r.id === reviewId ? { ...r, rating, title, comment } : r
        );
        localStorage.setItem('village_made_global_reviews', JSON.stringify(allReviews));
      }

      setUser(prev => {
        if (!prev) return null;
        const reviews = prev.reviews.map(r => 
          r.id === reviewId ? { ...r, rating, comment, productName: title || r.productName } : r
        );
        return { ...prev, reviews };
      });

      return { success: true };
    }
  };

  const deleteProductReview = async (productId: string, reviewId: string) => {
    if (!user) {
      showToast('You must be logged in to delete a review.', 'error');
      return { success: false, error: 'Not logged in' };
    }

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
      const res = await fetch(`${baseUrl}/products/${productId}/reviews/${reviewId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mobile: user.mobile
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast('Review deleted successfully!', 'success');
        
        // Remove from user session reviews
        setUser(prev => {
          if (!prev) return null;
          const reviews = prev.reviews.filter(r => r.id !== reviewId);
          return { ...prev, reviews };
        });

        fetchProducts();

        return { success: true };
      } else {
        showToast(data.error || 'Failed to delete review.', 'error');
        return { success: false, error: data.error };
      }
    } catch (err) {
      console.warn('⚠️ Connection error, deleting review locally:', err);
      showToast('Offline: Review deleted locally.', 'info');

      // Local storage fallback
      const allReviews = JSON.parse(localStorage.getItem('village_made_global_reviews') || '{}');
      if (allReviews[productId] && Array.isArray(allReviews[productId])) {
        allReviews[productId] = allReviews[productId].filter((r: any) => r.id !== reviewId);
        localStorage.setItem('village_made_global_reviews', JSON.stringify(allReviews));
      }

      setUser(prev => {
        if (!prev) return null;
        const reviews = prev.reviews.filter(r => r.id !== reviewId);
        return { ...prev, reviews };
      });

      return { success: true };
    }
  };

    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info'; show: boolean }>({ message: '', type: 'info', show: false });
    const [alertData, setAlertData] = useState<{ title: string; message: string; type: 'success' | 'error' | 'info'; show: boolean }>({ title: '', message: '', type: 'info', show: false });
    const [confirmData, setConfirmData] = useState<{ title: string; message: string; show: boolean; onConfirm: () => void; onCancel?: () => void }>({ title: '', message: '', show: false, onConfirm: () => {} });

    const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
      setToast({ message, type, show: true });
    };

    useEffect(() => {
      if (toast.show) {
        const timer = setTimeout(() => {
          setToast(prev => ({ ...prev, show: false }));
        }, 3500);
        return () => clearTimeout(timer);
      }
    }, [toast.show]);

    const showAlert = (title: string, message: string, type: 'success' | 'error' | 'info' = 'info') => {
      setAlertData({ title, message, type, show: true });
    };

    const showConfirm = (title: string, message: string, onConfirm: () => void, onCancel?: () => void) => {
      setConfirmData({ title, message, show: true, onConfirm, onCancel });
    };

    const fetchUserTickets = useCallback(async () => {
      if (!user || !user.id) return;
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
        const res = await fetch(`${baseUrl}/tickets/user/${user.id}`);
        const data = await res.json();
        if (res.ok && data.success && Array.isArray(data.tickets)) {
          setTickets(data.tickets);
        }
      } catch (err) {
        console.error('Failed to fetch user support tickets:', err);
      }
    }, [user]);

    const raiseTicket = async (subject: string, description: string, category: string, orderId?: string) => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
        const res = await fetch(`${baseUrl}/tickets`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user?.id || null,
            subject,
            description,
            category,
            orderId
          })
        });
        const data = await res.json();
        if (res.ok && data.success) {
          showToast('Support ticket raised successfully!', 'success');
          if (user) {
            fetchUserTickets();
          }
          return { success: true, ticket: data.ticket };
        } else {
          showToast(data.error || 'Failed to raise support ticket.', 'error');
          return { success: false, error: data.error };
        }
      } catch (err) {
        console.error(err);
        showToast('Network error submitting support ticket.', 'error');
        return { success: false, error: 'Network error submitting support ticket.' };
      }
    };

    // Load tickets when user changes
    useEffect(() => {
      if (isHydrated && user) {
        fetchUserTickets();
      } else {
        setTickets([]);
      }
    }, [user, isHydrated, fetchUserTickets]);

  return (
    <AppContext.Provider
      value={{
        language,
        setLanguage,
        soundOn,
        toggleSound,
        setSoundOn,
        dict,
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartCount,
        cartTotal,
        
        // User Authentication & Profile
        user,
        registerUser,
        loginUser,
        resetPassword,
        logoutUser,
        updateUserProfile,
        refreshUserProfile,
        toggleWishlist,
        addOrder,
        createOrder,
        updateOrderStatus,
        addAddress,
        deleteAddress,
        addNotification,
        markAllNotificationsAsRead,
        markNotificationAsRead,
        deleteNotification,
        clearAllNotifications,
        addReview,
        addProductReview,
        editProductReview,
        deleteProductReview,
        showToast,
        showAlert,
        showConfirm,
        products,
        categories,
        fetchProducts,
        fetchCategories,
        isHydrated,
        tickets,
        raiseTicket,
        fetchUserTickets,
        galleryItems,
        fetchGalleryItems,
        fetchAllGalleryItems,
        createGalleryItem,
        updateGalleryItem,
        deleteGalleryItem,
      }}
    >
      {children}

      {/* Global Toast Notification */}
      {toast.show && (
        <div className="fixed top-24 left-4 right-4 sm:left-auto sm:right-4 sm:max-w-sm z-[9999] bg-white border border-[#eeddb9] rounded-2xl shadow-xl p-4 flex gap-3 items-center animate-scale-up border-l-4 border-l-[#C56C4F]">
          <div className="shrink-0 flex items-center justify-center">
            {toast.type === 'success' && <CheckCircle className="w-6 h-6 text-green-600 fill-green-100 animate-bounce" />}
            {toast.type === 'error' && <AlertCircle className="w-6 h-6 text-red-600 fill-red-100 animate-pulse" />}
            {toast.type === 'info' && <Info className="w-6 h-6 text-[#C56C4F] fill-amber-100 animate-pulse" />}
          </div>
          <div className="flex-grow text-xs font-jakarta font-extrabold text-stone-900 leading-normal">
            {toast.message}
          </div>
          <button 
            onClick={() => setToast(prev => ({ ...prev, show: false }))} 
            className="p-1 hover:bg-stone-100 rounded-lg text-stone-400 hover:text-stone-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Global Alert Modal */}
      {alertData.show && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md select-none animate-fade-in">
          <div className="bg-white border border-[#eeddb9] rounded-[28px] max-w-md w-full p-6 text-center shadow-2xl animate-scale-up">
            <div className="w-16 h-16 bg-[#FAF4E6] rounded-full flex items-center justify-center mx-auto mb-4 text-[#C56C4F]">
              {alertData.type === 'success' && <CheckCircle className="w-8 h-8 text-green-600" />}
              {alertData.type === 'error' && <AlertTriangle className="w-8 h-8 text-red-600" />}
              {alertData.type === 'info' && <Info className="w-8 h-8 text-[#C56C4F]" />}
            </div>
            <h3 className="text-lg font-black font-jakarta text-stone-950 mb-2">{alertData.title}</h3>
            <p className="text-sm font-semibold text-stone-700 leading-relaxed mb-6 font-jakarta">{alertData.message}</p>
            <button
              onClick={() => {
                setAlertData(prev => ({ ...prev, show: false }));
              }}
              className="w-full py-3 bg-[#384401] hover:bg-[#252d00] text-white text-xs font-black rounded-xl transition-all shadow-md uppercase tracking-wider font-jakarta cursor-pointer"
            >
              OK
            </button>
          </div>
        </div>
      )}

      {/* Global Confirmation Modal */}
      {confirmData.show && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md select-none animate-fade-in">
          <div className="bg-white border border-[#eeddb9] rounded-[28px] max-w-md w-full p-6 text-center shadow-2xl animate-scale-up">
            <div className="w-16 h-16 bg-[#FAF4E6] rounded-full flex items-center justify-center mx-auto mb-4 text-[#C56C4F]">
              <AlertCircle className="w-8 h-8 text-[#C56C4F]" />
            </div>
            <h3 className="text-lg font-black font-jakarta text-stone-950 mb-2">{confirmData.title}</h3>
            <p className="text-sm font-semibold text-stone-700 leading-relaxed mb-6 font-jakarta">{confirmData.message}</p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => {
                  setConfirmData(prev => ({ ...prev, show: false }));
                  if (confirmData.onCancel) confirmData.onCancel();
                }}
                className="py-3 border border-stone-300 hover:border-stone-400 bg-white hover:bg-stone-50 text-stone-700 text-xs font-black rounded-xl transition-all font-jakarta cursor-pointer uppercase tracking-wider"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setConfirmData(prev => ({ ...prev, show: false }));
                  confirmData.onConfirm();
                }}
                className="py-3 bg-[#C56C4F] hover:bg-[#a85237] text-white text-xs font-black rounded-xl transition-all shadow-md font-jakarta cursor-pointer uppercase tracking-wider"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
      
      {isHydrated && (
        <>
          {/* Google Translate Hidden Element & Inits */}
          <div id="google_translate_element" style={{ position: 'absolute', top: '-9999px', left: '-9999px', opacity: 0, pointerEvents: 'none' }}></div>
          <Script id="google-translate-init" strategy="afterInteractive">
            {`
              window.googleTranslateElementInit = function() {
                new window.google.translate.TranslateElement({
                  pageLanguage: 'en',
                  includedLanguages: 'en,ta,hi,ml,te,kn,fr',
                  autoDisplay: false
                }, 'google_translate_element');
              };
            `}
          </Script>
          <Script
            src="https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
            strategy="afterInteractive"
          />

        </>
      )}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}