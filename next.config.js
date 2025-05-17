/** @type {import('next').NextConfig} */
const nextConfig = {
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
  eslint: {
    // Allows production builds to complete even with ESLint errors
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Allows production builds to complete even with TypeScript errors
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig;
