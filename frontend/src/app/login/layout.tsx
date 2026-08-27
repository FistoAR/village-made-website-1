import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Login',
  description: 'Login to your Village Made Organics account to track orders and manage your profile.',
  keywords: ['login', 'sign in', 'village made organics login', 'my account'],
  alternates: {
    canonical: '/login',
  },
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
