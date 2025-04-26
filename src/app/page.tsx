import React from 'react';
import Link from 'next/link';
import Image from 'next/image'; // Use Next.js Image for optimization if needed
import { cookies } from 'next/headers'; // Import cookies
// Remove auth-helpers import: import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import Button from '@/components/Button';
import SectionTitle from '@/components/SectionTitle';
import { createSupabaseServerClient, getProductImageUrl } from '@/lib/supabaseClient'; // Import server client factory and helper

// Define a type for the product data (adjust based on actual schema)
type Product = {
  id: string;
  name: string;
  slug: string;
  price: number;
  images: string[]; // Assuming images is an array of filenames/paths
};

// Make the component async to fetch data
export default async function Home() {
  // Create a Supabase client for server components using the ssr factory
  const cookieStore = cookies();
  const supabase = createSupabaseServerClient(cookieStore); // Use the ssr client factory

  let featuredProducts: Product[] = [];
  let fetchError: string | null = null;

  try {
    // Fetch featured products using the server client
    const { data, error } = await supabase
      .from('products')
      .select('id, name, slug, price, images') // Select necessary fields
      .eq('featured', true) // Filter for featured products
      .limit(4); // Limit to 4 products

    if (error) {
      console.error("Supabase fetch error:", error);
      throw new Error(error.message); // Throw error to be caught below
    }
    featuredProducts = data || [];
  } catch (error: any) {
    console.error("Error fetching featured products:", error);
    fetchError = "Could not fetch featured products at this time.";
    // In a real app, you might want to log this error to a monitoring service
  }

  // Define fallback image path (can be removed if getImageUrl handles it)
  const fallbackImagePath = '/Mopres_Gold_luxury_lifestyle_logo.png';


  return (
    <>
      {/* --- Hero Section --- */}
      {/* Note: Background image needs to be handled via CSS (globals.css or styled JSX) or Tailwind config */}
      <section
        className="hero min-h-[calc(95vh-var(--top-banner-height))] flex items-center text-center relative overflow-hidden" // Removed bg-cover, bg-center, style
      >
        {/* Animated Background Slideshow using next/image */}
        <div className="absolute inset-0 z-[-1] overflow-hidden">
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/40 to-black/30 z-10"></div>

          {/* Image 1 */}
          <Image
            src="/Woman_wearing_elegant_high_heels.jpg"
            alt="Elegant high heels model"
            fill // Use fill to cover the container
            style={{ objectFit: 'cover' }} // Ensure image covers the area
            className="animate-fade-in-out"
            priority // Load the first image eagerly
            quality={85}
          />
          {/* Image 2 */}
          <Image
            src="/Legs_crossed_wearing_heels.jpg"
            alt="Legs crossed wearing heels"
            fill
            style={{ objectFit: 'cover' }}
            className="animate-fade-in-out opacity-0"
            quality={80}
            loading="lazy" // Lazy load subsequent images
            unoptimized // Consider if optimization is needed for background images
          />
          {/* Image 3 */}
          <Image
            src="/Person_in_stylish_gold_suit.jpg"
            alt="Person in stylish gold suit"
            fill
            style={{ objectFit: 'cover' }}
            className="animate-fade-in-out opacity-0"
            quality={80}
            loading="lazy"
            unoptimized
          />
           {/* Image 4 */}
          <Image
            src="/Person_sitting_in_office_chair.jpg"
            alt="Person sitting in office chair"
            fill
            style={{ objectFit: 'cover' }}
            className="animate-fade-in-out opacity-0"
            quality={80}
            loading="lazy"
            unoptimized
          />
        </div>
        {/* Content Overlay */}
        <div className="relative w-full max-w-screen-xl mx-auto px-4 z-20"> {/* Ensure content is above images and gradient */}
          <h1 className="font-montserrat text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 lg:mb-8 text-shadow-sm">Contemporary Luxury Footwear</h1>
          <p className="text-lg font-poppins font-light text-white/90 max-w-xl mx-auto mb-10">Experience timeless elegance and unparalleled craftsmanship with MoPres.</p> {/* Added font-poppins */}
          <Button href="#collections" variant="primary">Shop Collections</Button>
        </div>
      </section>

      {/* --- Featured Products Section --- */}
      <section id="featured" className="featured bg-background-light py-16 lg:py-24"> {/* Use background-light */}
        <div className="w-full max-w-screen-xl mx-auto px-4">
          <SectionTitle centered>Featured Designs</SectionTitle>
          {fetchError ? (
            <p className="text-center text-red-600">{fetchError}</p>
          ) : featuredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
              {/* Map over fetched products */}
              {featuredProducts.map((product) => (
                <div key={product.id} className="product-card bg-white p-4 pb-8 border border-border-light transition-transform duration-std ease-in-out hover:-translate-y-1 hover:shadow-xl flex flex-col group"> {/* Added group class */}
                    <Link href={`/shop/products/${product.slug}`} className="relative block mb-6 aspect-square overflow-hidden"> {/* Link wraps image, added relative */}
                      <Image
                        src={getProductImageUrl(product.images?.[0])} // Use shared function
                        alt={product.name}
                        fill // Use fill layout
                        style={{ objectFit: 'cover' }}
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw" // Provide sizes hint
                        className="transition-transform duration-std ease-in-out group-hover:scale-105" // Added hover effect consistency
                      unoptimized // Add unoptimized prop as a workaround
                    />
                  </Link>
                  <div className="flex-grow flex flex-col"> {/* Added flex-grow */}
                    <h3 className="font-montserrat text-base font-medium text-text-dark mb-3 truncate flex-grow">{product.name}</h3> {/* Use text-dark */}
                    <p className="price text-base text-brand-gold mb-5 font-poppins"> {/* Use brand-gold, font-poppins */}
                      {/* Format price as South African Rand */}
                      {new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(product.price)}
                    </p>
                    <Button href={`/shop/products/${product.slug}`} variant="secondary" className="text-xs px-5 py-2.5 mt-auto font-poppins">View Details</Button> {/* Added font-poppins, mt-auto */}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-text-light">No featured products found.</p> // Handle case with no products
          )}
        </div>
      </section>

      {/* --- Collections Section --- */}
      <section id="collections" className="collections bg-background-body py-16 lg:py-24"> {/* Use background-body */}
        <div className="w-full max-w-screen-xl mx-auto px-4">
          <SectionTitle centered>Explore Collections</SectionTitle>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Collection Card 1 */}
            <div className="collection-card relative border border-border-light overflow-hidden group">
              <img src="/Red-high-heeled_shoes.jpg" alt="Red Showstoppers Collection" loading="lazy" className="w-full h-auto object-cover transition-transform duration-std ease-in-out group-hover:scale-105" />
              <div className="collection-overlay absolute inset-0 bg-gradient-to-t from-black/75 to-transparent flex flex-col justify-end items-center text-center p-8 transition-colors duration-std ease-in-out group-hover:from-black/90 group-hover:to-black/20">
                <h3 className="font-montserrat text-2xl text-white font-semibold mb-6 text-shadow-sm">Red Showstoppers</h3>
                <Button href="/shop/collections/red-showstoppers" variant="outline-light" className="opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-std ease-in-out font-poppins">Shop Now</Button> {/* Specific collection link, font */}
              </div>
            </div>
             {/* Collection Card 2 */}
            <div className="collection-card relative border border-border-light overflow-hidden group">
              <img src="/Red-high-heel-with-bow.jpg" alt="Statement Bows Collection" loading="lazy" className="w-full h-auto object-cover transition-transform duration-std ease-in-out group-hover:scale-105" />
              <div className="collection-overlay absolute inset-0 bg-gradient-to-t from-black/75 to-transparent flex flex-col justify-end items-center text-center p-8 transition-colors duration-std ease-in-out group-hover:from-black/90 group-hover:to-black/20">
                <h3 className="font-montserrat text-2xl text-white font-semibold mb-6 text-shadow-sm">Statement Bows</h3>
                <Button href="/shop/collections/statement-bows" variant="outline-light" className="opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-std ease-in-out font-poppins">Shop Now</Button> {/* Specific collection link, font */}
              </div>
            </div>
             {/* Collection Card 3 */}
            <div className="collection-card relative border border-border-light overflow-hidden group">
              <img src="/Red-high-heel-with-rhinestones.jpg" alt="Crystal & Rhinestone Collection" loading="lazy" className="w-full h-auto object-cover transition-transform duration-std ease-in-out group-hover:scale-105" />
              <div className="collection-overlay absolute inset-0 bg-gradient-to-t from-black/75 to-transparent flex flex-col justify-end items-center text-center p-8 transition-colors duration-std ease-in-out group-hover:from-black/90 group-hover:to-black/20">
                <h3 className="font-montserrat text-2xl text-white font-semibold mb-6 text-shadow-sm">Crystal Glam</h3>
                <Button href="/shop/collections/crystal-rhinestone" variant="outline-light" className="opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-std ease-in-out font-poppins">Shop Now</Button> {/* Specific collection link, font */}
              </div>
            </div>
             {/* Collection Card 4 */}
            <div className="collection-card relative border border-border-light overflow-hidden group">
              <img src="/High-heeled-patent-leather-shoes.jpg" alt="Classic Elegance Collection" loading="lazy" className="w-full h-auto object-cover transition-transform duration-std ease-in-out group-hover:scale-105" />
              <div className="collection-overlay absolute inset-0 bg-gradient-to-t from-black/75 to-transparent flex flex-col justify-end items-center text-center p-8 transition-colors duration-std ease-in-out group-hover:from-black/90 group-hover:to-black/20">
                <h3 className="font-montserrat text-2xl text-white font-semibold mb-6 text-shadow-sm">Classic Elegance</h3>
                <Button href="/shop/collections/black-essentials" variant="outline-light" className="opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-std ease-in-out font-poppins">Shop Now</Button> {/* Specific collection link, font */}
              </div>
            </div>
          </div>
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
              <Button href="/about" variant="secondary">Learn More</Button>
            </div>
            <div className="about-image text-center md:text-right">
              <img src="/Mopres_Gold_luxury_lifestyle_logo.png" alt="MoPres Brand Logo" loading="lazy" className="inline-block rounded-sm filter brightness-110 max-w-xs md:max-w-sm" />
            </div>
          </div>
        </div>
      </section>

      {/* --- Contact Section --- */}
      <section id="contact" className="contact bg-background-light py-16 lg:py-24"> {/* Use background-light */}
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
