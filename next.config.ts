import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
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
