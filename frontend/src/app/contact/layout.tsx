import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Us',
  description: 'Get in touch with the Village Made Organics team for any queries, bulk orders, or support.',
  keywords: ['contact us', 'support', 'village made organics support', 'customer service', 'bulk orders'],
  alternates: {
    canonical: '/contact',
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
