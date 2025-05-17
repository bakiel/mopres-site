/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'brand-gold': '#AF8F53',
        'brand-black': '#000000',
        'brand-white': '#FFFFFF', 
        'brand-ivory': '#F5F5F3',
        'background-body': '#FFFFFF',
        'background-light': '#f9f9f9',
        'text-dark': '#222222',
        'text-light': '#6c757d',
        'border-light': '#e9ecef',
      },
      fontFamily: {
        'poppins': ['var(--font-poppins)'],
        'montserrat': ['var(--font-montserrat)'],
      },
      spacing: {
        'header-height': '75px',
        'top-banner-height': '35px',
      },
      transitionDuration: {
         'fast': '0.2s',
         'std': '0.4s',
      },
    },
  },
  plugins: [],
};
