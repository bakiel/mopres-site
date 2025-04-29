import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // output: 'export', // REMOVED: Not needed for Vercel
  /* config options here */
  images: {
    // unoptimized: true, // REMOVED: Vercel handles image optimization
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'i.ibb.co',
        port: '',
        pathname: '/**', // Allow any path from this host
      },
      {
        protocol: 'https',
        hostname: 'gfbedvoexpulmmfitxje.supabase.co', // Your Supabase project hostname
        port: '',
        pathname: '/storage/v1/object/public/product-images/**', // Allow paths specific to the product-images bucket
      },
    ],
  },
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true, // Keep ESLint ignore for now, can be removed later if build passes on Vercel
  },
  // typescript: { // REMOVED: Let Vercel handle type checking during its build
  //   ignoreBuildErrors: true,
  // },
};

export default nextConfig;
