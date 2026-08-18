import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Shopping Cart',
  description: 'Review the items in your Village Made shopping cart and proceed to checkout.',
  keywords: ['shopping cart', 'checkout', 'village made cart', 'organic products cart'],
  alternates: {
    canonical: '/cart',
  },
};

export default function CartLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
