import { Product } from '@/data/products-list';

export type AdminTab = 'dashboard' | 'inventory' | 'customers' | 'products' | 'orders' | 'sales' | 'banners' | 'media' | 'admin-profile';

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  weight?: string;
  category?: string;
}

export interface OrderAddress {
  name: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
}

export interface AdminOrder {
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
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  paymentMethod?: string;
  paymentStatus?: string;
  refundId?: string;
  refundStatus?: string;
  remarks?: string;
  status_history?: any[];
}

export interface AdminCustomer {
  id: number;
  name: string;
  email: string;
  mobile: string;
  phone: string;
  created_at: string;
}

export interface PurchaseRecord {
  id: string;
  productName: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
  date: string;
}

export interface OfferBanner {
  id: string;
  title: string;
  imageUrl: string;
  link: string;
  active: boolean;
  tag?: string;
}

export interface ProductBenefit {
  title: string;
  description: string;
  icon?: string;
}

export interface ExtendedProduct extends Product {
  stock: number;
  purchasePrice?: number;
  image?: string;
  video?: string;
  benefits?: ProductBenefit[];
  ingredients?: any;
  features?: any;
  faqs?: any;
  shelfLife?: string;
  shelfLifeDetails?: string;
  suitableFor?: { label: string; value: string }[];
  recipes?: { title: string; prepTime?: string; cookTime?: string; ingredients?: string; instructions: string }[];
  descriptionImage?: string;
}
