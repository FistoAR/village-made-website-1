import ProductsClientContainer from '@/components/Product/ProductsClientContainer';
import { PRODUCTS as STATIC_PRODUCTS } from '@/data/products-list';

export const dynamic = 'force-dynamic';

async function getProducts() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
    const res = await fetch(`${baseUrl}/products`, {
      cache: 'no-store', // Force Server-Side Rendering (SSR)
    });
    if (!res.ok) {
      throw new Error('Failed to fetch from API');
    }
    const data = await res.json();
    if (data.success && Array.isArray(data.products) && data.products.length > 0) {
      return data.products;
    }
    return STATIC_PRODUCTS;
  } catch (err) {
    console.warn('⚠️ Server-side fetch failed, falling back to static product catalog on SSR:', err);
    return STATIC_PRODUCTS;
  }
}

export default async function ProductsPage() {
  const products = await getProducts();

  return <ProductsClientContainer initialProducts={products} />;
}
