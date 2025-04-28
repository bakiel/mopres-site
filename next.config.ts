import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export', // Add this line for static export
  /* config options here */
  images: {
    unoptimized: true, // Add this line to disable Image Optimization for export
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
};

export default nextConfig;
