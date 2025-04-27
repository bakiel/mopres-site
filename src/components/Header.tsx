"use client";

import React, { useState, useEffect, FC } from 'react';
import Link from 'next/link';
import Image from 'next/image'; // Import Image component
import PredictiveSearch from './PredictiveSearch';
import { useCartStore } from '@/store/cartStore'; // Import the cart store hook

// SVG Icons
const SearchIcon: FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <circle cx="11" cy="11" r="8"></circle>
    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
  </svg>
);

const AccountIcon: FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
    <circle cx="12" cy="7" r="4"></circle>
  </svg>
);

const CartIcon: FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <circle cx="9" cy="21" r="1"></circle>
    <circle cx="20" cy="21" r="1"></circle>
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
  </svg>
);

const MenuIcon: FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="12" x2="21" y2="12"></line>
    <line x1="3" y1="6" x2="21" y2="6"></line>
    <line x1="3" y1="18" x2="21" y2="18"></line>
  </svg>
);


const Header: FC = () => {
  // Cart store state and actions
  const { toggleSidebar, getTotalItems } = useCartStore();
  // State to hold cart items count, initialized for SSR safety
  const [clientCartItems, setClientCartItems] = useState<number>(0);

  // State for mobile menu toggle
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  // State for mobile dropdowns
  const [isShopDropdownOpen, setIsShopDropdownOpen] = useState(false);
  const [isAccountDropdownOpen, setIsAccountDropdownOpen] = useState(false);
  // State for header scroll effect
  const [isScrolled, setIsScrolled] = useState(false);


  // Effect for header scroll shadow
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) { // Add class after scrolling down 50px
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);

    // Clean up the event listener on component unmount
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []); // Empty dependency array means this effect runs once on mount and cleans up on unmount

  // Effect to update cart items count only on the client after hydration
  useEffect(() => {
    // Update the state with the actual count from the store after mount
    setClientCartItems(getTotalItems());
    // Subscribe to store changes to keep the count updated
    const unsubscribe = useCartStore.subscribe(
      (state) => setClientCartItems(state.getTotalItems())
    );
    return unsubscribe; // Cleanup subscription on unmount
  }, [getTotalItems]); // Rerun if getTotalItems reference changes (though unlikely for Zustand)


  // Function to close mobile menu and all dropdowns
  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
    setIsShopDropdownOpen(false);
    setIsAccountDropdownOpen(false);
  };

  return (
    <>
      {/* --- Top Banner --- */}
      <div className="fixed top-0 left-0 z-[1001] w-full h-[var(--top-banner-height)] bg-brand-gold text-white flex items-center justify-center text-sm font-medium text-center px-4 tracking-wide">
        Standard Shipping: R150 | FREE SHIPPING on orders over R2000
      </div>
      {/* --- Header --- */}
      <header className={`fixed top-[var(--top-banner-height)] left-0 z-[1000] w-full h-[var(--header-height)] bg-brand-black flex items-center border-b border-white/10 backdrop-blur-md transition-colors duration-300 ease-in-out ${isScrolled ? 'shadow-md' : ''}`} id="header"> {/* Apply shadow class based on state */}
        {/* Using a simple container div for now. Replace with Tailwind container class if defined globally */}
        <div className="w-full max-w-screen-xl mx-auto px-4">
          <nav className="flex justify-between items-center w-full">
            {/* Logo */}
            <div className="flex-shrink-0">
              {/* Standard Link: no legacyBehavior, single child span, props on Link */}
              <Link
                href="/"
                className="flex items-center gap-3 text-white hover:text-white">
                {/* Restore Image Logo */}
                <Image
                  src="/Mopress Header Logo.png"
                  alt="MoPres Logo"
                  width={160} // Adjusted width
                  height={40} // Adjusted height
                  priority // Mark as priority as it's likely LCP
                  className="h-10 w-auto" // Maintain height and auto width
                  style={{ height: 'auto' }} // Explicitly maintain aspect ratio
                />
              </Link>
            </div>

            {/* Desktop Navigation Menu */}
            <ul className="hidden lg:flex gap-x-6 xl:gap-x-10 items-center mx-auto flex-nowrap">
              <li className="relative group">
                 {/* Standard Link: no legacyBehavior, single child span, props on Link */}
                <Link
                  href="/shop"
                  className="text-white/85 font-normal text-[0.85rem] uppercase tracking-wider relative pb-2 transition-colors duration-200 hover:text-white whitespace-nowrap flex items-center group-hover:text-white after:content-[''] after:absolute after:w-0 after:h-[1px] after:bottom-0 after:left-1/2 after:transform after:-translate-x-1/2 after:bg-brand-gold after:transition-all after:duration-300 after:ease-in-out group-hover:after:w-full">
                  <span className="flex items-center"> {/* Single child wrapper */}
                    Shop
                    <span className="ml-1.5 text-xs transition-transform duration-300 group-hover:rotate-180">▼</span>
                  </span>
                </Link>
                <ul className="absolute top-full left-0 mt-1 bg-brand-black min-w-[230px] py-3 border-t-2 border-brand-gold shadow-lg rounded-b-sm opacity-0 invisible group-hover:opacity-100 group-hover:visible transform translate-y-2 group-hover:translate-y-0 transition-all duration-300 ease-in-out z-[1001]">
                  <li><Link href="/shop/collections/red-showstoppers" className="block px-6 py-2.5 text-sm text-white/80 hover:bg-brand-gold/15 hover:text-brand-gold whitespace-nowrap">Red Showstoppers</Link></li>
                  <li><Link href="/shop/collections/black-essentials" className="block px-6 py-2.5 text-sm text-white/80 hover:bg-brand-gold/15 hover:text-brand-gold whitespace-nowrap">Black Essentials</Link></li>
                  <li><Link href="/shop/collections/statement-bows" className="block px-6 py-2.5 text-sm text-white/80 hover:bg-brand-gold/15 hover:text-brand-gold whitespace-nowrap">Statement Bows</Link></li>
                  <li><Link href="/shop/collections/crystal-rhinestone" className="block px-6 py-2.5 text-sm text-white/80 hover:bg-brand-gold/15 hover:text-brand-gold whitespace-nowrap">Crystal & Rhinestone</Link></li>
                  <li><Link href="/shop/collections/pink" className="block px-6 py-2.5 text-sm text-white/80 hover:bg-brand-gold/15 hover:text-brand-gold whitespace-nowrap">Pink Collection</Link></li>
                  <li><Link href="/shop/collections/metallic" className="block px-6 py-2.5 text-sm text-white/80 hover:bg-brand-gold/15 hover:text-brand-gold whitespace-nowrap">Metallic Collection</Link></li>
                  <li><Link href="/shop/collections/platform" className="block px-6 py-2.5 text-sm text-white/80 hover:bg-brand-gold/15 hover:text-brand-gold whitespace-nowrap">Platform Heels</Link></li>
                  <li><Link href="/shop/collections/leopard" className="block px-6 py-2.5 text-sm text-white/80 hover:bg-brand-gold/15 hover:text-brand-gold whitespace-nowrap">Leopard Print</Link></li>
                  <li><Link href="/shop" className="block px-6 py-2.5 text-sm text-white/80 hover:bg-brand-gold/15 hover:text-brand-gold whitespace-nowrap">All Collections</Link></li>
                </ul>
              </li>
              <li><Link href="/preorder" className="text-white/85 font-normal text-[0.85rem] uppercase tracking-wider relative pb-2 transition-colors duration-200 hover:text-white whitespace-nowrap after:content-[''] after:absolute after:w-0 after:h-[1px] after:bottom-0 after:left-1/2 after:transform after:-translate-x-1/2 after:bg-brand-gold after:transition-all after:duration-300 after:ease-in-out hover:after:w-full">Preorder</Link></li>
              <li><Link href="/about" className="text-white/85 font-normal text-[0.85rem] uppercase tracking-wider relative pb-2 transition-colors duration-200 hover:text-white whitespace-nowrap after:content-[''] after:absolute after:w-0 after:h-[1px] after:bottom-0 after:left-1/2 after:transform after:-translate-x-1/2 after:bg-brand-gold after:transition-all after:duration-300 after:ease-in-out hover:after:w-full">About</Link></li>
              <li><Link href="/contact" className="text-white/85 font-normal text-[0.85rem] uppercase tracking-wider relative pb-2 transition-colors duration-200 hover:text-white whitespace-nowrap after:content-[''] after:absolute after:w-0 after:h-[1px] after:bottom-0 after:left-1/2 after:transform after:-translate-x-1/2 after:bg-brand-gold after:transition-all after:duration-300 after:ease-in-out hover:after:w-full">Contact</Link></li>
              <li className="relative group">
                 {/* Standard Link: no legacyBehavior, single child span, props on Link */}
                <Link
                  href="/account"
                  className="text-white/85 font-normal text-[0.85rem] uppercase tracking-wider relative pb-2 transition-colors duration-200 hover:text-white whitespace-nowrap flex items-center group-hover:text-white after:content-[''] after:absolute after:w-0 after:h-[1px] after:bottom-0 after:left-1/2 after:transform after:-translate-x-1/2 after:bg-brand-gold after:transition-all after:duration-300 after:ease-in-out group-hover:after:w-full">
                  <span className="flex items-center"> {/* Single child wrapper */}
                    Account
                    <span className="ml-1.5 text-xs transition-transform duration-300 group-hover:rotate-180">▼</span>
                  </span>
                </Link>
                <ul className="absolute top-full left-0 mt-1 bg-brand-black min-w-[230px] py-3 border-t-2 border-brand-gold shadow-lg rounded-b-sm opacity-0 invisible group-hover:opacity-100 group-hover:visible transform translate-y-2 group-hover:translate-y-0 transition-all duration-300 ease-in-out z-[1001]">
                  <li><Link href="/account/login" className="block px-6 py-2.5 text-sm text-white/80 hover:bg-brand-gold/15 hover:text-brand-gold whitespace-nowrap">Login</Link></li>
                  <li><Link href="/account/register" className="block px-6 py-2.5 text-sm text-white/80 hover:bg-brand-gold/15 hover:text-brand-gold whitespace-nowrap">Register</Link></li>
                  <li><Link href="/account/orders" className="block px-6 py-2.5 text-sm text-white/80 hover:bg-brand-gold/15 hover:text-brand-gold whitespace-nowrap">My Orders</Link></li>
                  <li><Link href="/account/wishlist" className="block px-6 py-2.5 text-sm text-white/80 hover:bg-brand-gold/15 hover:text-brand-gold whitespace-nowrap">Wishlist</Link></li>
                  <li><Link href="/admin" className="block px-6 py-2.5 text-sm text-white/80 hover:bg-brand-gold/15 hover:text-brand-gold whitespace-nowrap">Admin Panel</Link></li>
                </ul>
              </li>
            </ul>

            {/* Navigation Icons & Search */}
            <div className="hidden lg:flex gap-7 items-center flex-shrink-0">
              <PredictiveSearch />
               {/* Standard Link: no legacyBehavior, single child icon, props on Link */}
              <Link
                href="/account"
                aria-label="My Account"
                className="text-white/85 hover:text-white">
                <AccountIcon /> {/* Single child */}
              </Link>
              <button
                onClick={toggleSidebar}
                // Use clientCartItems for aria-label and badge display
                aria-label={`Shopping Cart (${clientCartItems} items)`}
                className="text-white/85 hover:text-white relative"
              >
                <CartIcon />
                {/* Render badge only after mount and if items > 0 */}
                {clientCartItems > 0 && (
                  <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-brand-gold text-xs font-bold text-black">
                    {clientCartItems}
                  </span>
                )}
              </button>
            </div>

            {/* Mobile Menu Toggle Button */}
            <button
              className="lg:hidden text-white p-2 z-[1001]"
              aria-label={isMobileMenuOpen ? "Close Menu" : "Open Menu"}
              aria-expanded={isMobileMenuOpen}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              ) : (
                <MenuIcon />
              )}
            </button>
          </nav>
        </div>

        {/* Mobile Navigation Menu */}
        <div className={`lg:hidden fixed top-[calc(var(--header-height)+var(--top-banner-height))] left-0 w-full bg-brand-black py-6 flex flex-col items-center gap-0 z-[999] shadow-md transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? 'translate-y-0 opacity-100 visible' : '-translate-y-full opacity-0 invisible'} max-h-[calc(100vh-var(--header-height)-var(--top-banner-height))] overflow-y-auto`}>
          <div className="w-full text-center py-3 px-4 flex justify-center items-center flex-wrap">
            <Link href="/shop" className="text-white/90 text-base uppercase tracking-[1.5px] block hover:text-brand-gold" onClick={closeMobileMenu}>Shop</Link>
            <button
              className="text-white/70 bg-none border-none text-xl px-2 cursor-pointer ml-2 leading-none hover:text-brand-gold"
              aria-label="Toggle Shop Menu"
              onClick={() => {
                setIsShopDropdownOpen(!isShopDropdownOpen);
                setIsAccountDropdownOpen(false);
              }}
            >
              {isShopDropdownOpen ? '−' : '+'}
            </button>
          </div>
          <div className={`w-full bg-black/30 py-2 pl-10 mt-2 ${isShopDropdownOpen ? 'block' : 'hidden'}`}>
            <li><Link href="/shop/collections/red-showstoppers" className="block py-2.5 text-sm text-white/70 hover:text-brand-gold" onClick={closeMobileMenu}>Red Showstoppers</Link></li>
            <li><Link href="/shop/collections/black-essentials" className="block py-2.5 text-sm text-white/70 hover:text-brand-gold" onClick={closeMobileMenu}>Black Essentials</Link></li>
            <li><Link href="/shop/collections/statement-bows" className="block py-2.5 text-sm text-white/70 hover:text-brand-gold" onClick={closeMobileMenu}>Statement Bows</Link></li>
            <li><Link href="/shop/collections/crystal-rhinestone" className="block py-2.5 text-sm text-white/70 hover:text-brand-gold" onClick={closeMobileMenu}>Crystal & Rhinestone</Link></li>
            <li><Link href="/shop/collections/pink" className="block py-2.5 text-sm text-white/70 hover:text-brand-gold" onClick={closeMobileMenu}>Pink Collection</Link></li>
            <li><Link href="/shop/collections/metallic" className="block py-2.5 text-sm text-white/70 hover:text-brand-gold" onClick={closeMobileMenu}>Metallic Collection</Link></li>
            <li><Link href="/shop/collections/platform" className="block py-2.5 text-sm text-white/70 hover:text-brand-gold" onClick={closeMobileMenu}>Platform Heels</Link></li>
            <li><Link href="/shop/collections/leopard" className="block py-2.5 text-sm text-white/70 hover:text-brand-gold" onClick={closeMobileMenu}>Leopard Print</Link></li>
            <li><Link href="/shop" className="block py-2.5 text-sm text-white/70 hover:text-brand-gold" onClick={closeMobileMenu}>All Collections</Link></li>
          </div>
          <div className="w-full text-center py-3 px-4"><Link href="/preorder" className="text-white/90 text-base uppercase tracking-[1.5px] block hover:text-brand-gold" onClick={closeMobileMenu}>Preorder</Link></div>
          <div className="w-full text-center py-3 px-4"><Link href="/about" className="text-white/90 text-base uppercase tracking-[1.5px] block hover:text-brand-gold" onClick={closeMobileMenu}>About</Link></div>
          <div className="w-full text-center py-3 px-4"><Link href="/contact" className="text-white/90 text-base uppercase tracking-[1.5px] block hover:text-brand-gold" onClick={closeMobileMenu}>Contact</Link></div>
          <div className="w-full text-center py-3 px-4 flex justify-center items-center flex-wrap">
            <Link href="/account" className="text-white/90 text-base uppercase tracking-[1.5px] block hover:text-brand-gold" onClick={closeMobileMenu}>Account</Link>
            <button
              className="text-white/70 bg-none border-none text-xl px-2 cursor-pointer ml-2 leading-none hover:text-brand-gold"
              aria-label="Toggle Account Menu"
              onClick={() => {
                setIsAccountDropdownOpen(!isAccountDropdownOpen);
                setIsShopDropdownOpen(false);
              }}
            >
              {isAccountDropdownOpen ? '−' : '+'}
            </button>
          </div>
          <div className={`w-full bg-black/30 py-2 pl-10 mt-2 ${isAccountDropdownOpen ? 'block' : 'hidden'}`}>
            <li><Link href="/account/login" className="block py-2.5 text-sm text-white/70 hover:text-brand-gold" onClick={closeMobileMenu}>Login</Link></li>
            <li><Link href="/account/register" className="block py-2.5 text-sm text-white/70 hover:text-brand-gold" onClick={closeMobileMenu}>Register</Link></li>
            <li><Link href="/account/orders" className="block py-2.5 text-sm text-white/70 hover:text-brand-gold" onClick={closeMobileMenu}>My Orders</Link></li>
            <li><Link href="/account/wishlist" className="block py-2.5 text-sm text-white/70 hover:text-brand-gold" onClick={closeMobileMenu}>Wishlist</Link></li>
            <li><Link href="/admin" className="block py-2.5 text-sm text-white/70 hover:text-brand-gold" onClick={closeMobileMenu}>Admin Panel</Link></li>
          </div>
          <div className="w-full text-center py-3 px-4">
            <button
              onClick={() => {
                toggleSidebar();
                closeMobileMenu();
              }}
              className="text-white/90 text-base uppercase tracking-[1.5px] block hover:text-brand-gold w-full relative"
              // Use clientCartItems for mobile cart button as well
              aria-label={`Shopping Cart (${clientCartItems} items)`}
            >
              Cart
              {/* Render badge only after mount and if items > 0 */}
              {clientCartItems > 0 && (
                  <span className="absolute top-1/2 right-4 transform -translate-y-1/2 flex h-5 w-5 items-center justify-center rounded-full bg-brand-gold text-xs font-bold text-black">
                    {clientCartItems}
                  </span>
                )}
            </button>
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;
