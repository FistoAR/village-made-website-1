'use client';
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { getDictionary } from '@/lib/translations';
import Script from 'next/script';

export interface CartItem {
  id: string;
  name: string;
  price: number;
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
  status: 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  address: UserAddress;
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
  mobile: string;
  name?: string;
  email?: string;
  phone?: string;
  addresses: UserAddress[];
  orders: UserOrder[];
  wishlist: string[];
  reviews: UserReview[];
  notifications: UserNotification[];
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
  registerUser: (mobile: string, password?: string, optionalData?: { name?: string; phone?: string; email?: string }) => Promise<{ success: boolean; error?: string }>;
  loginUser: (mobile: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  logoutUser: () => void;
  updateUserProfile: (data: Partial<User>) => void;
  toggleWishlist: (productId: string) => void;
  addOrder: (items: CartItem[], totalDetails: { subtotal: number; shipping: number; tax: number; total: number }, address: UserAddress) => void;
  addAddress: (address: Omit<UserAddress, 'id'>) => void;
  deleteAddress: (id: string) => void;
  addNotification: (title: string, message: string) => void;
  addReview: (productId: string, productName: string, rating: number, comment: string) => void;
  addProductReview: (productId: string, author: string, rating: number, title: string, comment: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState('en');
  const [soundOn, setSoundOn] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  // User auth state
  const [user, setUser] = useState<User | null>(null);

  const toggleSound = () => setSoundOn(prev => !prev);
  
  // Get the dictionary based on current language
  const dict = getDictionary(language);

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
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error('Failed to parse user session', e);
      }
    }
    
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

  // Sync user state to localStorage when it changes
  useEffect(() => {
    if (isHydrated) {
      if (user) {
        localStorage.setItem('village_made_user', JSON.stringify(user));
        
        // Also update the local database of registered users
        const usersDb = JSON.parse(localStorage.getItem('village_made_users_db') || '[]');
        const updatedDb = usersDb.map((u: User) => u.mobile === user.mobile ? user : u);
        localStorage.setItem('village_made_users_db', JSON.stringify(updatedDb));
      } else {
        localStorage.removeItem('village_made_user');
      }
    }
  }, [user, isHydrated]);

  const addToCart = (newItem: Omit<CartItem, 'quantity'>, qty: number = 1) => {
    setCart(prevCart => {
      const existingItemIndex = prevCart.findIndex(
        item => item.id === newItem.id && item.weight === newItem.weight
      );

      if (existingItemIndex > -1) {
        const updatedCart = [...prevCart];
        updatedCart[existingItemIndex].quantity += qty;
        return updatedCart;
      }

      return [...prevCart, { ...newItem, quantity: qty }];
    });
  };

  const removeFromCart = (id: string, weight: string) => {
    setCart(prevCart => prevCart.filter(item => !(item.id === id && item.weight === weight)));
  };

  const updateQuantity = (id: string, weight: string, qty: number) => {
    const finalQty = Math.max(1, qty);
    setCart(prevCart =>
      prevCart.map(item =>
        item.id === id && item.weight === weight ? { ...item, quantity: finalQty } : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  const cartTotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);

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
      const res = await fetch('http://localhost:5001/api/auth/register', {
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
      return { success: true };
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
      const res = await fetch('http://localhost:5001/api/auth/login', {
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
      return { success: true };
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
      id: `VM-${Math.floor(100000 + Math.random() * 900000)}`,
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
          id: Math.random().toString(36).substr(2, 9),
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

  const addAddress = (addressData: Omit<UserAddress, 'id'>) => {
    if (!user) return;
    const newAddress: UserAddress = {
      ...addressData,
      id: Math.random().toString(36).substr(2, 9),
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
      id: Math.random().toString(36).substr(2, 9),
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

  const addProductReview = (productId: string, author: string, rating: number, title: string, comment: string) => {
    const cleanAuthor = author.trim() || 'Anonymous';
    const newProductReview = {
      id: Math.random().toString(36).substr(2, 9),
      author: cleanAuthor,
      rating,
      title: title.trim() || 'Verified Purchase Review',
      comment: comment.trim(),
      time: 'Just now',
      helpful: 0
    };

    // Save to global storage database
    const allReviews = JSON.parse(localStorage.getItem('village_made_global_reviews') || '{}');
    if (!allReviews[productId]) {
      allReviews[productId] = [];
    }
    allReviews[productId] = [newProductReview, ...allReviews[productId]];
    localStorage.setItem('village_made_global_reviews', JSON.stringify(allReviews));

    // Link to user session review log if active
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
  };

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
        logoutUser,
        updateUserProfile,
        toggleWishlist,
        addOrder,
        addAddress,
        deleteAddress,
        addNotification,
        addReview,
        addProductReview,
      }}
    >
      {children}
      
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