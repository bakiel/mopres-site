import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { cookies } from 'next/headers'; // Keep this import

// Force dynamic rendering because we use cookies
export const dynamic = 'force-dynamic';

import Button from '@/components/Button';
import SectionTitle from '@/components/SectionTitle';
import { createSupabaseServerClient, getProductImageUrl } from '@/lib/supabaseClient';
import HeroBanner from '@/components/HeroBanner';
import TestimonialCarousel from '@/components/TestimonialCarousel'; // Import the TestimonialCarousel

// Define a type for the product data (adjust based on actual schema)
type Product = {
  id: string;
  name: string;
  slug: string;
  price: number;
  images: string[];
};

// Define the type for the featured product data needed by HeroBanner
type FeaturedProduct = {
  id: string;
  name: string;
  slug: string;
  images: string[];
};

// Define a type for Collection data
type Collection = {
  id: string;
  name: string;
  slug: string;
  image: string | null; // Image might be nullable
};

export default async function Home() {
  const cookieStore = cookies();
  const supabase = createSupabaseServerClient(cookieStore);

  let featuredProductsData: FeaturedProduct[] = []; // Rename to avoid conflict
  let fetchError: string | null = null;

  try {
    // Fetch featured products for the Hero Banner (only need id, name, slug, images)
    const { data, error } = await supabase
      .from('products')
      .select('id, name, slug, images') // Select fields needed for HeroBanner
      .eq('featured', true)
      .limit(5); // Fetch up to 5 for the banner

    if (error) {
      console.error("Supabase fetch error:", error);
      throw new Error(error.message);
    }
    featuredProductsData = data || [];
  } catch (error: any) {
    console.error("Error fetching featured products for banner:", error);
    fetchError = "Could not fetch hero banner products.";
    // In a real app, you might want to log this error to a monitoring service
  }

  // Define fallback image path (can be removed if getImageUrl handles it)
  const fallbackImagePath = '/Mopres_Gold_luxury_lifestyle_logo.png';



  // Fetch products for the "Featured Designs" section (needs price)
  // Note: This is a separate fetch, could be combined if performance allows
  let featuredDesigns: Product[] = [];
  let featuredDesignsError: string | null = null;
  try {
    const { data, error } = await supabase
      .from('products')
      .select('id, name, slug, price, images') // Select fields needed for cards
      .eq('featured', true)
      .limit(4); // Limit for the grid display

    if (error) {
      console.error("Supabase fetch error (featured designs):", error);
      throw new Error(error.message);
    }
    featuredDesigns = data || [];
  } catch (error: any) {
    console.error("Error fetching featured designs:", error);
    featuredDesignsError = "Could not fetch featured designs.";
  }

  // Fetch collections for the "Explore Collections" section
  let collections: Collection[] = [];
  let collectionsError: string | null = null;
  try {
    const { data, error } = await supabase
      .from('collections')
      .select('id, name, slug, image')
      .limit(4); // Limit to 4 collections for the homepage display

    if (error) {
      console.error("Supabase fetch error (collections):", error);
      throw new Error(error.message);
    }
    collections = data || [];
  } catch (error: any) {
    console.error("Error fetching collections:", error);
    collectionsError = "Could not fetch collections.";
  }

  // Fetch New Arrivals
  let newArrivals: Product[] = [];
  let newArrivalsError: string | null = null;
  try {
    const { data, error } = await supabase
      .from('products')
      .select('id, name, slug, price, images') // Select fields needed for cards
      .order('created_at', { ascending: false }) // Order by creation date
      .limit(4); // Limit to 4 new arrivals

    if (error) {
      console.error("Supabase fetch error (new arrivals):", error);
      throw new Error(error.message);
    }
    newArrivals = data || [];
  } catch (error: any) {
    console.error("Error fetching new arrivals:", error);
    newArrivalsError = "Could not fetch new arrivals.";
  }


  return (
    <>
      {/* --- Hero Banner Section --- */}
      <HeroBanner /> {/* Remove featuredProducts prop */}
      {/* --- Featured Products Section --- */}
      <section id="featured" className="featured bg-background-light py-16 lg:py-24">
        <div className="w-full max-w-screen-xl mx-auto px-4">
          <SectionTitle centered>Featured Designs</SectionTitle>
          {featuredDesignsError ? (
            <p className="text-center text-red-600">{featuredDesignsError}</p>
          ) : featuredDesigns.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
              {/* Map over fetched featured design products */}
              {featuredDesigns.map((product) => (
                <Link
                  key={product.id}
                  href={`/shop/products/${product.slug}`}
                  className="product-card bg-white p-4 pb-8 border border-border-light transition-transform duration-std ease-in-out hover:-translate-y-1 hover:shadow-xl flex flex-col group"> {/* Removed legacyBehavior */}
                  <div> {/* Wrap multiple children in a div instead of Fragment */}
                  <div className="relative block mb-6 aspect-square overflow-hidden"> {/* Link wraps image, added relative */}
                    <Image
                      src={product.images && product.images.length > 0 ? getProductImageUrl(supabase, product.images[0]) : fallbackImagePath} // Check images array
                      alt={product.name}
                      fill // Use fill layout
                      style={{ objectFit: 'cover' }}
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw" // Provide sizes hint
                      className="transition-transform duration-std ease-in-out group-hover:scale-105" // Added hover effect consistency
                      unoptimized // Add unoptimized prop as a workaround
                    />
                  </div>
                  <div className="flex-grow flex flex-col"> {/* Added flex-grow */}
                    <h3 className="font-montserrat text-base font-medium text-text-dark mb-3 truncate flex-grow">{product.name}</h3> {/* Use text-dark */}
                    <p className="price text-base text-brand-gold mb-5 font-poppins"> {/* Use brand-gold, font-poppins */}
                      {/* Format price as South African Rand */}
                      {new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(product.price)}
                    </p>
                    {/* Button relies on parent Link for navigation */}
                    <Button variant="secondary" className="text-xs px-5 py-2.5 mt-auto font-poppins pointer-events-none">View Details</Button> {/* Removed href, added pointer-events-none */}
                  </div>
                  </div> {/* Close wrapping div */}
                </Link>
              ))}
            </div>
          ) : (
            (<p className="text-center text-text-light">No featured products found.</p>) // Handle case with no products
          )}
        </div>
      </section>
      {/* --- Collections Section --- */}
      <section id="collections" className="collections bg-background-body py-16 lg:py-24">
        <div className="w-full max-w-screen-xl mx-auto px-4">
          <SectionTitle centered>Explore Collections</SectionTitle>
          {collectionsError ? (
             <p className="text-center text-red-600">{collectionsError}</p>
          ) : collections.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {/* Map over fetched collections */}
              {collections.map((collection) => (
                <div key={collection.id} className="collection-card relative border border-border-light overflow-hidden group aspect-[3/4]">
                  {/* Remove outer Link, apply link to image */}
                  <Link
                    href={`/shop/collections/${collection.slug}`}
                    className="block w-full h-full absolute inset-0 z-0"> {/* Removed legacyBehavior */}
                    <Image
                      src={collection.image ? `/${collection.image}` : '/placeholder.svg'}
                      alt={collection.name}
                      fill
                      style={{ objectFit: 'cover' }}
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      className="transition-transform duration-std ease-in-out group-hover:scale-105"
                      unoptimized
                    />
                  </Link>
                  {/* Overlay content - keep relative positioning */}
                  <div className="collection-overlay absolute inset-0 bg-gradient-to-t from-black/75 to-transparent flex flex-col justify-end items-center text-center p-6 transition-colors duration-std ease-in-out group-hover:from-black/90 group-hover:to-black/20 z-10">
                    {/* Title (not linked separately, relies on background link) */}
                    <h3 className="font-montserrat text-xl lg:text-2xl text-white font-semibold mb-4 text-shadow-sm">{collection.name}</h3>
                    {/* Button relies on parent Link for navigation */}
                    <Button variant="outline-light" className="opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-std ease-in-out font-poppins text-sm px-5 py-2 pointer-events-none">Shop Now</Button> {/* Removed href, added pointer-events-none */}
                  </div>
                </div>
              ))}
            </div>
          ) : (
             <p className="text-center text-text-light">No collections found.</p>
          )}
        </div> {/* Close max-w-screen-xl */}
      </section> {/* Close collections section */}
      {/* --- New Arrivals Section --- */}
      <section id="new-arrivals" className="new-arrivals bg-background-body py-16 lg:py-24">
        <div className="w-full max-w-screen-xl mx-auto px-4">
          <SectionTitle centered>New Arrivals</SectionTitle>
          {newArrivalsError ? (
            <p className="text-center text-red-600">{newArrivalsError}</p>
          ) : newArrivals.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
              {/* Map over fetched new arrival products */}
              {newArrivals.map((product) => (
                <Link
                  key={product.id}
                  href={`/shop/products/${product.slug}`}
                  className="product-card bg-white p-4 pb-8 border border-border-light transition-transform duration-std ease-in-out hover:-translate-y-1 hover:shadow-xl flex flex-col group"> {/* Removed legacyBehavior */}
                  <div> {/* Wrap multiple children in a div instead of Fragment */}
                  <div className="relative block mb-6 aspect-square overflow-hidden">
                    <Image
                      src={product.images && product.images.length > 0 ? getProductImageUrl(supabase, product.images[0]) : fallbackImagePath} // Check images array
                      alt={product.name}
                      fill
                      style={{ objectFit: 'cover' }}
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      className="transition-transform duration-std ease-in-out group-hover:scale-105"
                      unoptimized
                    />
                  </div>
                  <div className="flex-grow flex flex-col">
                    <h3 className="font-montserrat text-base font-medium text-text-dark mb-3 truncate flex-grow">{product.name}</h3>
                    <p className="price text-base text-brand-gold mb-5 font-poppins">
                      {new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(product.price)}
                    </p>
                    {/* Button relies on parent Link for navigation */}
                    <Button variant="secondary" className="text-xs px-5 py-2.5 mt-auto font-poppins pointer-events-none">View Details</Button> {/* Removed href, added pointer-events-none */}
                  </div>
                  </div> {/* Close wrapping div */}
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-center text-text-light">No new arrivals found.</p>
          )}
        </div>
      </section>
      {/* --- About Section --- */}
      {/* Note: Background texture needs to be handled via CSS */}
      <section id="about" className="about relative bg-brand-black text-white py-16 lg:py-24 overflow-hidden">
         {/* Faint texture overlay - handled with pseudo-element in CSS or inline style */}
         <div
            className="absolute inset-0 bg-cover bg-center opacity-[0.08] z-0"
            style={{ backgroundImage: "url('/Geometric-pattern-with-gold-lines-Dark-bg.jpg')" }}
          ></div>
        <div className="relative w-full max-w-screen-xl mx-auto px-4 z-10">
          <SectionTitle>About MoPres</SectionTitle> {/* Ensure SectionTitle uses Montserrat */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div className="about-text space-y-6">
              <p className="text-white/80 font-poppins font-light leading-relaxed text-lg">MoPres is a contemporary luxury lifestyle brand specializing in high-quality, handcrafted footwear for the modern woman. Our designs seamlessly blend timeless elegance with innovative craftsmanship.</p> {/* Added font-poppins */}
              <p className="text-white/80 font-poppins font-light leading-relaxed text-lg">Each pair of MoPres shoes is meticulously created using premium materials and exceptional attention to detail. We cater to a discerning clientele who values both sophisticated style and enduring comfort.</p> {/* Added font-poppins */}
              {/* Replace Button with styled Link */}
              <Link href="/about" className="inline-block py-[0.8rem] px-[1.8rem] font-poppins font-medium text-[0.9rem] text-center rounded-[2px] cursor-pointer border uppercase tracking-[1px] shadow-[0_2px_5px_rgba(0,0,0,0.05)] transition-all duration-std ease-in-out hover:shadow-[0_4px_10px_rgba(0,0,0,0.1)] hover:-translate-y-[2px] bg-transparent text-brand-gold border-brand-gold hover:bg-brand-gold hover:text-white">
                Learn More
              </Link>
            </div>
            <div className="about-image text-center md:text-right">
              <img src="/Mopres_Gold_luxury_lifestyle_logo.png" alt="MoPres Brand Logo" loading="lazy" className="inline-block rounded-sm filter brightness-110 max-w-xs md:max-w-sm" />
            </div>
          </div>
        </div>
      </section>
      {/* --- Testimonial Section --- */}
      <TestimonialCarousel />
      {/* --- Contact Section --- */}
      <section id="contact" className="contact bg-background-light py-16 lg:py-24">
        <div className="w-full max-w-screen-xl mx-auto px-4">
          <SectionTitle centered>Get In Touch</SectionTitle>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Contact Info */}
            <div className="contact-info">
              <h3 className="font-montserrat text-xl font-semibold text-text-dark mb-4">Contact Information</h3> {/* Use text-dark */}
              <p className="text-text-light mb-6 font-poppins">Reach out for orders, support, or enquiries. We're available during business hours (9 am – 5 pm SAST).</p> {/* Added font-poppins */}
              <ul className="space-y-4 text-base font-poppins"> {/* Added font-poppins */}
                <li className="flex items-start gap-3">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mt-1 flex-shrink-0 text-brand-gold"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                  <span className="text-text-dark">Phone / WhatsApp: +27 83 500 5311</span> {/* Use text-dark */}
                </li>
                <li className="flex items-start gap-3">
                   <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mt-1 flex-shrink-0 text-brand-gold"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                  <span className="text-text-dark">General: info@mopres.co.za</span> {/* Use text-dark */}
                </li>
                 <li className="flex items-start gap-3">
                   <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mt-1 flex-shrink-0 text-brand-gold"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                  <span className="text-text-dark">Owner: pulane@mopres.co.za</span> {/* Use text-dark */}
                </li>
                <li className="flex items-start gap-3">
                   <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mt-1 flex-shrink-0 text-brand-gold"><path d="M1 3h15v13H1zM16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
                  <span className="text-text-dark">Standard Shipping Fee: R150 nationwide</span> {/* Use text-dark */}
                </li>
              </ul>
              {/* Social Icons */}
              <div className="social-icons flex gap-4 mt-8">
                 <a href="#" className="social-icon inline-flex items-center justify-center w-10 h-10 rounded-full bg-gray-200 text-brand-gold transition-all duration-fast ease-in-out hover:bg-brand-gold hover:text-white hover:scale-110" aria-label="Instagram">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                </a>
                 <a href="#" className="social-icon inline-flex items-center justify-center w-10 h-10 rounded-full bg-gray-200 text-brand-gold transition-all duration-fast ease-in-out hover:bg-brand-gold hover:text-white hover:scale-110" aria-label="Facebook">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
                </a>
                 <a href="#" className="social-icon inline-flex items-center justify-center w-10 h-10 rounded-full bg-gray-200 text-brand-gold transition-all duration-fast ease-in-out hover:bg-brand-gold hover:text-white hover:scale-110" aria-label="WhatsApp">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
                </a>
              </div>
            </div>

            {/* Contact Form */}
            <div className="contact-form">
              <h3 className="font-montserrat text-xl font-semibold text-text-dark mb-8">Send an Enquiry</h3> {/* Use text-dark */}
              {/* Connect to Formspree endpoint */}
              <form name="enquiry" method="POST" action="https://formspree.io/f/xdkgobaz"> {/* Use correct Formspree endpoint */}
                <input type="hidden" name="_subject" value="New Enquiry from MoPres Website" /> {/* Optional: Set subject */}
                <div className="form-group mb-6">
                  <label htmlFor="name" className="block mb-2.5 font-medium text-sm text-text-dark font-poppins">Full Name</label> {/* Added font-poppins */}
                  <input type="text" id="name" name="name" placeholder="Your Full Name" required className="w-full py-3.5 px-4 border border-border-light bg-white font-poppins text-base rounded-sm transition-colors duration-300 ease-in-out focus:outline-none focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/15 placeholder:text-gray-400 placeholder:font-light" />
                </div>
                <div className="form-group mb-6">
                  <label htmlFor="email" className="block mb-2.5 font-medium text-sm text-text-dark">Email Address</label>
                  <input type="email" id="email" name="email" placeholder="your.email@example.com" required className="w-full py-3.5 px-4 border border-border-light bg-white font-poppins text-base rounded-sm transition-colors duration-300 ease-in-out focus:outline-none focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/15 placeholder:text-gray-400 placeholder:font-light" />
                </div>
                <div className="form-group mb-6">
                  <label htmlFor="phone" className="block mb-2.5 font-medium text-sm text-text-dark">Phone / WhatsApp</label>
                  <input type="tel" id="phone" name="phone" placeholder="+27 XX XXX XXXX" required className="w-full py-3.5 px-4 border border-border-light bg-white font-poppins text-base rounded-sm transition-colors duration-300 ease-in-out focus:outline-none focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/15 placeholder:text-gray-400 placeholder:font-light" />
                </div>
                <div className="form-group mb-6">
                  <label htmlFor="message" className="block mb-2.5 font-medium text-sm text-text-dark">Message</label>
                  <textarea id="message" name="message" placeholder="Tell us which styles, sizes, or questions you have..." rows={5} required className="w-full py-3.5 px-4 border border-border-light bg-white font-poppins text-base rounded-sm transition-colors duration-300 ease-in-out focus:outline-none focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/15 placeholder:text-gray-400 placeholder:font-light min-h-[130px] resize-y"></textarea>
                </div>
                <Button type="submit" variant="primary" className="w-full mt-4">Send Enquiry</Button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
