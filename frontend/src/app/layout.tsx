import type { Metadata } from "next";
import { Inter, Cormorant_Garamond, Fredoka, Poetsen_One, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import GlobalScrollReveal from "@/components/GlobalScrollReveal";
import BackToTop from "@/components/BackToTop";
import { AppProvider } from "@/lib/context/AppContext";
import NavigationProgress from "@/components/NavigationProgress";
import Script from "next/script";
import { Suspense } from "react";

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const fredoka = Fredoka({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-rounded",
  display: "swap",
});

const poetsen = Poetsen_One({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-poetsen",
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  title: {
    default: "Village Made | Premium Organic Village Goods",
    template: "%s | Village Made",
  },
  description: "An immersive cinematic e-commerce experience showcasing authentic village products, millets, natural health mixes, and organic snacks.",
  keywords: ["organic", "village made", "millets", "health mix", "natural products", "ecommerce"],
  authors: [{ name: "Village Made Team" }],
  openGraph: {
    title: "Village Made | Premium Organic Village Goods",
    description: "An immersive cinematic e-commerce experience showcasing authentic village products.",
    url: "/",
    siteName: "Village Made",
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Village Made | Premium Organic Village Goods",
    description: "An immersive cinematic e-commerce experience showcasing authentic village products.",
  },
  alternates: {
    canonical: '/',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${cormorant.variable} ${fredoka.variable} ${poetsen.variable} ${jakarta.variable}`} suppressHydrationWarning>
      <body className="font-body antialiased" suppressHydrationWarning>
        <AppProvider>
          <Suspense fallback={null}>
            <NavigationProgress />
          </Suspense>
          <GlobalScrollReveal />
          <BackToTop />
          {children}
        </AppProvider>
      </body>
    </html>
  );
}