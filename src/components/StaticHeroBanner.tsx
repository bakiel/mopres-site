'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

const StaticHeroBanner: React.FC = () => {
  return (
    <section className="relative w-full h-[70vh] md:h-[80vh] lg:h-[90vh] overflow-hidden bg-brand-black">
      <div className="relative h-full w-full">
        {/* Background Image */}
        <div className="absolute inset-0 h-full w-full bg-gray-900">
          <Image
            src="/Legs_crossed_wearing_heels.jpg"
            alt="Close up of legs crossed wearing stylish heels"
            fill
            style={{ objectFit: 'cover', objectPosition: 'center' }}
            priority
            quality={90}
            sizes="100vw"
            unoptimized
          />
        </div>
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent z-10"></div>

        {/* Content Overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 z-20">
          <h1 className="font-montserrat text-4xl sm:text-5xl lg:text-7xl font-bold text-white mb-4 lg:mb-6 tracking-wider">
            Uncompromising Style
          </h1>
          <p className="text-lg sm:text-xl font-poppins font-light text-white/90 max-w-2xl mx-auto mb-8 lg:mb-10">
            Experience the perfect blend of comfort and sophistication.
          </p>
          <Link
            href="#new-arrivals"
            className="inline-block bg-brand-gold hover:bg-brand-gold/90 text-black py-3 px-8 rounded-sm font-semibold font-poppins transition duration-300 text-base">
            Shop New Arrivals
          </Link>
        </div>
      </div>
    </section>
  );
};

export default StaticHeroBanner;
