import React, { FC, ReactNode } from 'react';
import Header from './Header';
import Footer from './Footer';
import { Toaster } from 'react-hot-toast'; // Import Toaster
import CartSidebar from './CartSidebar'; // Import CartSidebar

interface LayoutProps {
  children: ReactNode; // Define type for children prop
}

const Layout: FC<LayoutProps> = ({ children }) => { // Type Layout as FC with LayoutProps
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow pt-[var(--header-and-banner-height)]">
        {children}
      </main>
      <Footer />
      <CartSidebar /> {/* Render CartSidebar */}
    </div>
  );
};

export default Layout;
