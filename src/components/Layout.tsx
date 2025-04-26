import React, { FC, ReactNode } from 'react'; // Import FC and ReactNode
import Header from './Header'; // Remove .tsx extension
import Footer from './Footer'; // Remove .tsx extension

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
    </div>
  );
};

export default Layout;
