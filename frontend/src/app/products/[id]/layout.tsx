import type { Metadata } from 'next';
import { PRODUCTS } from '@/data/products-list';

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata(
  { params }: Props
): Promise<Metadata> {
  const resolvedParams = await params;
  const product = PRODUCTS.find((p) => p.id === resolvedParams.id);

  if (!product) {
    return {
      title: 'Product Not Found',
    };
  }

  return {
    title: product.name,
    description: product.description,
    keywords: [product.name, product.category, 'village made', 'organic products', 'buy ' + product.name],
    alternates: {
      canonical: `/products/${product.id}`,
    },
    openGraph: {
      title: `${product.name} | Village Made`,
      description: product.description,
    },
  };
}

export default function ProductLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
