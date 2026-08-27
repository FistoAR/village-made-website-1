import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Help & Support',
  description: 'Find answers to frequently asked questions and get support for your Village Made Organics orders.',
  keywords: ['help', 'support', 'FAQ', 'village made organics help', 'order support'],
  alternates: {
    canonical: '/help',
  },
};

export default function HelpLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
