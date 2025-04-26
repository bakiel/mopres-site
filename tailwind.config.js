/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}", // Include pages dir if it exists
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}", // Main content path for App Router
  ],
  theme: {
    extend: {
      colors: {
        'brand-gold': '#AF8F53',
        'brand-black': '#000000',
        'brand-white': '#FFFFFF',
        'brand-ivory': '#F5F5F3', // Added Ivory Mist
        'background-body': '#FFFFFF',
        'background-light': '#f9f9f9',
        'text-dark': '#222222',
        'text-light': '#6c757d',
        'border-light': '#e9ecef',
      },
      fontFamily: {
        'montserrat': ['Montserrat', 'sans-serif'],
        'poppins': ['Poppins', 'sans-serif'],
      },
      spacing: { // Add heights from CSS variables if needed as spacing utilities
        'header-height': '75px',
        'top-banner-height': '35px',
      },
      transitionDuration: { // Add transitions if needed
         'fast': '0.2s',
         'std': '0.4s',
      },
      // Add other theme extensions as needed based on original CSS
    },
  },
  plugins: [],
};
