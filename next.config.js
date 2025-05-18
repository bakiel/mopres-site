/** @type {import('next').NextConfig} */
const nextConfig = {
  // Output standalone is needed for Docker deployment
  output: 'standalone',
  
  // Image optimization configuration
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
  
  // Explicitly define transpilation options for PDF libraries
  transpilePackages: ['html2canvas', 'jspdf'],
  
  // Compiler optimizations
  compiler: {
    // Remove console logs in production (except errors)
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error'],
    } : false,
  },
  
  // Allow building even with errors to facilitate debugging
  eslint: {
    // Allows production builds to complete even with ESLint errors
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Allows production builds to complete even with TypeScript errors
    ignoreBuildErrors: true,
  },
  
  // Optimization experimental flags
  experimental: {
    // Reduce memory usage during build
    optimizeCss: true
  },
  
  // Webpack configuration override to optimize for PDF generation
  webpack: (config, { isServer }) => {
    // Ensure PDF.js related modules are properly handled
    if (!isServer) {
      // Force any PDF-related modules to be handled through the JS/TS loader
      config.module.rules.push({
        test: /pdf(js)?-dist/,
        use: 'null-loader'
      });
    }
    
    return config;
  }
};

module.exports = nextConfig;