"use client"; // Keep use client for other potential client-side features if needed

"use client"; // Keep use client for other potential client-side features if needed

import React from 'react'; // Removed useEffect, useRef
import Link from 'next/link';
import Image from 'next/image';
import Button from '@/components/Button'; // Import shared Button

// --- About Page Content ---
// Removed metadata export as it conflicts with "use client"

export default function AboutPage() {

  // Removed Intersection Observer logic

  return (
    <>
      {/* --- Page Header Section (Replicated from HTML structure) --- */}
      <section className="bg-brand-black text-white py-12 lg:py-16 relative overflow-hidden">
        {/* Background Texture */}
        <div
            className="absolute inset-0 bg-cover bg-center opacity-[0.06] z-0"
            style={{ backgroundImage: "url('/Geometric_pattern_with_gold_lines_Dark_bg.jpg')" }}
          ></div>
        {/* Content */}
        <div className="relative w-full max-w-screen-xl mx-auto px-4 z-10 text-center"> {/* Consistent container */}
          <h1 className="font-montserrat text-4xl sm:text-5xl font-bold">About MoPres</h1>
          <p className="text-lg font-light text-white/80 max-w-xl mx-auto mt-4 mb-0">Discover the story behind our contemporary luxury footwear.</p> {/* Removed mb */}
        </div>
      </section>

      {/* --- Our Story Section --- */}
      {/* Applied final animation classes directly */}
      <section
        className="about-page-section bg-brand-black text-white relative overflow-hidden py-16 lg:py-24 opacity-100 translate-y-0 transition-all duration-700 ease-out"
      >
         <div
            className="absolute inset-0 bg-cover bg-center opacity-[0.06] z-0"
            style={{ backgroundImage: "url('/Geometric_pattern_with_gold_lines_Dark_bg.jpg')" }}
          ></div>
        <div className="container relative z-10 max-w-screen-xl mx-auto px-4"> {/* Consistent container */}
            <div className="founder-section grid grid-cols-1 md:grid-cols-[300px_1fr] gap-8 md:gap-16 items-center mb-10"> {/* Increased gap and mb */}
                 <div className="founder-image text-center md:text-left">
                     <Image
                         src="/Pulane_Profile.jpg" // Updated profile image
                         alt="Pulane, Founder of MoPres"
                         width={300}
                         height={300}
                         className="max-w-[300px] rounded-full border-4 border-brand-gold mx-auto md:mx-0 shadow-lg"
                         loading="lazy"
                     />
                 </div>
                 <div className="founder-text text-center md:text-left space-y-5"> {/* Added space-y */}
                    <h3 className="font-montserrat text-xl lg:text-2xl font-semibold mb-4 text-white">Our Story</h3>
                    <p className="text-white/85 font-light leading-relaxed">Founded in 2018, MoPres emerged from a passion for creating luxury footwear that doesn't compromise on comfort or style. Based in South Africa, we draw inspiration from global fashion trends while infusing our designs with a uniquely African perspective.</p>
                    <p className="text-white/85 font-light leading-relaxed">Our founder, Pulane, started with a vision to create footwear that celebrates femininity while delivering exceptional comfort and durability. What began as a small collection has grown into a distinguished brand known for its attention to detail and commitment to quality.</p>
                </div>
            </div>
             <p className="text-white/85 font-light leading-relaxed text-center md:text-left mt-6">MoPres is a contemporary luxury footwear brand specializing in high-quality, handcrafted shoes for the modern woman. Our designs seamlessly blend timeless elegance with innovative craftsmanship to create footwear that empowers women to step confidently through life.</p> {/* Added mt */}
        </div>
      </section>

      {/* --- Our Philosophy Section --- */}
      {/* Applied final animation classes directly */}
      <section
        className="about-page-section bg-background-body text-text-dark relative overflow-hidden py-16 lg:py-24 opacity-100 translate-y-0 transition-all duration-700 ease-out"
      >
         <div
             className="absolute inset-0 bg-cover bg-center opacity-[0.05] z-0"
             style={{ backgroundImage: "url('/Geometric_tribal_pattern_design_light_BG.jpg')" }}
          ></div>
         <div className="container relative z-10 max-w-screen-xl mx-auto px-4"> {/* Consistent container */}
            <h3 className="font-montserrat text-xl lg:text-2xl font-semibold mb-6 text-center md:text-left">Our Philosophy</h3> {/* Adjusted mb */}
            <p className="text-text-light font-light leading-relaxed mb-4">At MoPres, we believe that luxury should be accessible without sacrificing craftsmanship. Each pair of our shoes is meticulously created using premium materials and exceptional attention to detail. We cater to a discerning clientele who values both sophisticated style and enduring comfort.</p>
            <p className="text-text-light font-light leading-relaxed mb-6">Our philosophy centers on three core principles:</p>
            <ul className="list-disc list-outside ml-5 space-y-3 text-text-light font-light leading-relaxed"> {/* Adjusted space-y */}
                <li><strong>Quality Craftsmanship:</strong> We use only the finest materials and work with skilled artisans to ensure every pair meets our exacting standards.</li>
                <li><strong>Timeless Design:</strong> While we embrace contemporary trends, we design with longevity in mind, creating pieces that transcend seasonal fashions.</li>
                <li><strong>Comfortable Luxury:</strong> We believe that luxury footwear should feel as good as it looks, with comfort engineered into every design.</li>
            </ul>
        </div>
      </section>

      {/* --- Our Collections Section --- */}
      {/* Applied final animation classes directly */}
      <section
        className="about-page-section bg-background-light relative overflow-hidden py-16 lg:py-24 opacity-100 translate-y-0 transition-all duration-700 ease-out"
      >
         <div className="container relative z-10 max-w-screen-xl mx-auto px-4"> {/* Consistent container */}
            <h3 className="font-montserrat text-xl lg:text-2xl font-semibold mb-6 text-center md:text-left">Our Collections</h3> {/* Adjusted mb */}
            <p className="text-text-light font-light leading-relaxed mb-8">MoPres offers a diverse range of collections to suit various occasions and preferences, including Red Showstoppers, Black Essentials, Statement Bows, Crystal Glam, Platforms, and more. Each collection is thoughtfully curated to offer versatility while maintaining our signature aesthetic of refined elegance.</p>
             <div className="mini-collection-grid grid grid-cols-2 sm:grid-cols-4 gap-6 md:gap-8 mt-8"> {/* Adjusted gap */}
                 {/* Using local images */}
                 <div className="mini-collection-item">
                     <Image src="/Red_high_heeled_shoes.jpg" alt="Red Showstoppers Example" width={150} height={150} className="aspect-square object-cover border border-border-light rounded-sm transition-transform duration-300 ease-in-out hover:scale-105 hover:shadow-md" loading="lazy"/>
                 </div>
                 <div className="mini-collection-item">
                     <Image src="/Black_high_heels_with_buckles_1.jpg" alt="Black Essentials Example" width={150} height={150} className="aspect-square object-cover border border-border-light rounded-sm transition-transform duration-300 ease-in-out hover:scale-105 hover:shadow-md" loading="lazy"/>
                 </div>
                  <div className="mini-collection-item">
                     <Image src="/High_heel_with_large_bow.jpg" alt="Statement Bows Example" width={150} height={150} className="aspect-square object-cover border border-border-light rounded-sm transition-transform duration-300 ease-in-out hover:scale-105 hover:shadow-md" loading="lazy"/>
                 </div>
                 <div className="mini-collection-item">
                     <Image src="/Red_high_heel_with_rhinestones.jpg" alt="Crystal Glam Example" width={150} height={150} className="aspect-square object-cover border border-border-light rounded-sm transition-transform duration-300 ease-in-out hover:scale-105 hover:shadow-md" loading="lazy"/>
                 </div>
             </div>
             <div className="mt-10 text-center md:text-left"> {/* Increased mt */}
                <Button href="/shop" variant="secondary">Explore All Collections</Button>
             </div>
         </div>
      </section>

      {/* --- Sustainability Section --- */}
      {/* Applied final animation classes directly */}
      <section
        className="about-page-section bg-background-light relative overflow-hidden py-16 lg:py-24 opacity-100 translate-y-0 transition-all duration-700 ease-out"
      >
        <div className="container relative z-10 max-w-screen-xl mx-auto px-4"> {/* Consistent container */}
            <h3 className="font-montserrat text-xl lg:text-2xl font-semibold mb-6 text-center md:text-left">Our Commitment to Sustainability</h3> {/* Adjusted mb */}
            <p className="text-text-light font-light leading-relaxed mb-6">We recognize our responsibility to the planet and are continuously working to improve our sustainability practices. This includes:</p>
            <ul className="list-disc list-outside ml-5 space-y-3 text-text-light font-light leading-relaxed mt-4"> {/* Adjusted space-y */}
                <li>Sourcing materials from responsible suppliers</li>
                <li>Minimizing waste in our production process</li>
                <li>Creating durable products designed to last</li>
                <li>Developing eco-friendly packaging solutions</li>
            </ul>
         </div>
      </section>

      {/* --- Experience Section --- */}
      {/* Applied final animation classes directly */}
      <section
        className="about-page-section bg-background-body relative overflow-hidden py-16 lg:py-24 opacity-100 translate-y-0 transition-all duration-700 ease-out"
      >
         <div className="container relative z-10 max-w-screen-xl mx-auto px-4"> {/* Consistent container */}
            <h3 className="font-montserrat text-xl lg:text-2xl font-semibold mb-6 text-center md:text-left">Experience MoPres</h3> {/* Adjusted mb */}
            <p className="text-text-light font-light leading-relaxed mb-4">We invite you to experience the perfect blend of style, comfort, and craftsmanship that defines MoPres. Whether you're dressing for a special occasion or elevating your everyday look, our footwear is designed to help you put your best foot forward.</p>
            <p className="text-text-light font-light leading-relaxed">Visit our <Link href="/shop" className="text-brand-gold hover:text-[#9a7d4a]">collections</Link> to discover luxury footwear that speaks to your personal style and accompanies you on life's many journeys.</p>
        </div>
      </section>

      {/* --- Contact Info Section --- */}
      {/* Applied final animation classes directly */}
      <section
        className="about-page-section bg-background-light relative overflow-hidden py-16 lg:py-24 opacity-100 translate-y-0 transition-all duration-700 ease-out"
      >
        <div className="container relative z-10 max-w-screen-xl mx-auto px-4"> {/* Consistent container */}
            <h3 className="font-montserrat text-xl lg:text-2xl font-semibold mb-6 text-center md:text-left">Contact Us</h3> {/* Adjusted mb */}
            <p className="text-text-light font-light leading-relaxed mb-6">We welcome your questions and feedback:</p>
            <ul className="space-y-4 mt-4 text-text-light font-light"> {/* Adjusted space-y */}
                <li className="flex items-center gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-brand-gold flex-shrink-0"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                    Email: <a href="mailto:info@mopres.co.za" className="text-brand-gold hover:text-[#9a7d4a]">info@mopres.co.za</a>
                </li>
                <li className="flex items-center gap-3">
                     <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-brand-gold flex-shrink-0"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                    Phone/WhatsApp: <a href="tel:+27835005311" className="text-brand-gold hover:text-[#9a7d4a]">+27 83 500 5311</a>
                </li>
                <li className="flex items-start gap-3"> {/* Use items-start for multi-line address */}
                     <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-brand-gold flex-shrink-0 mt-1"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                    Address: 6680 Witrigwend Street, Unit 378, Herendaig Estate, Colonial Ext 20, Centurion 0157, South Africa
                </li>
                <li className="flex items-center gap-3">
                     <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-brand-gold flex-shrink-0"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                    Hours: Monday to Friday, 9 am – 5 pm SAST
                </li>
            </ul>
        </div>
      </section>
    </>
  );
}
