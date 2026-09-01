import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  reactStrictMode: false, // Prevents double component rendering and double effect execution in dev mode
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'npkywzfheuvmdiybxrwr.supabase.co',
      },
    ],
  },
  // Faster server-side compilation
  experimental: {
    optimizePackageImports: ['lucide-react', 'gsap', 'jspdf', 'exceljs'],
  },
  // Tell Turbopack the correct workspace root
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
