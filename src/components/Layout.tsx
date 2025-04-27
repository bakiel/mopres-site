import React, { FC, ReactNode } from 'react';
import Header from './Header';
import Footer from './Footer';
import { Toaster } from 'react-hot-toast'; // Import Toaster
import CartSidebar from './CartSidebar'; // Import CartSidebar

// No longer need CSS variables defined here

interface LayoutProps {
  children: ReactNode; // Define type for children prop
}

const Layout: FC<LayoutProps> = ({ children }) => { // Type Layout as FC with LayoutProps
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      {/* Main content area */}
      {/* Apply padding-top using Tailwind arbitrary pixel values */}
      <main
        className="flex-grow pt-[110px]" // Apply padding to account for fixed header and top banner height
      >
        {children}
      </main>
      <Footer />
      {/* Toaster is now rendered in RootLayout */}
      <CartSidebar /> {/* Render CartSidebar */}
    </div>
  );
};

export default Layout;
