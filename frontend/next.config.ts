import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
  // Faster server-side compilation
  experimental: {
    optimizePackageImports: ['lucide-react', 'gsap'],
  },
  // Tell Turbopack the correct workspace root (silences the "multiple lockfiles" warning)
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
