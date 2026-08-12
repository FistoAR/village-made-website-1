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
  title: "Village Made | Premium Organic Village Goods",
  description: "An immersive cinematic e-commerce experience showcasing authentic village products.",
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