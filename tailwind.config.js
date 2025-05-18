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
        'brand-gold-light': '#C9B77C',
        'brand-gold-dark': '#9A7D4A',
        'brand-black': '#000000',
        'brand-white': '#FFFFFF', 
        'brand-ivory': '#F5F5F3',
        'background-body': '#FFFFFF',
        'background-light': '#f9f9f9',
        'text-dark': '#222222',
        'text-light': '#6c757d',
        'border-light': '#e9ecef',
        // For more consistent styling:
        'primary': '#AF8F53', // Same as brand-gold
        'secondary': '#6c757d',
        'success': '#28a745',
        'danger': '#dc3545',
        'warning': '#ffc107',
        'info': '#17a2b8',
      },
      fontFamily: {
        'poppins': ['var(--font-poppins)', 'sans-serif'],
        'montserrat': ['var(--font-montserrat)', 'sans-serif'],
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
