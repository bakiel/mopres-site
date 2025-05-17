'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function TestPage() {
  return (
    <main className="pt-[calc(var(--header-height)+var(--top-banner-height))] h-screen">
      <div className="relative w-full h-3/4 bg-gray-900">
        <Image
          src="/Legs_crossed_wearing_heels.jpg"
          alt="Elegant heels"
          fill
          style={{ objectFit: 'cover', objectPosition: 'center' }}
          priority
          quality={90}
          sizes="100vw"
          unoptimized
        />
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent"></div>
        
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
          <h1 className="font-montserrat text-4xl sm:text-5xl lg:text-7xl font-bold text-white mb-4 lg:mb-6 tracking-wider">
            Uncompromising Style
          </h1>
          <p className="text-lg sm:text-xl font-poppins font-light text-white/90 max-w-2xl mx-auto mb-8 lg:mb-10">
            Experience the perfect blend of comfort and sophistication.
          </p>
          <Link
            href="#"
            className="inline-block bg-brand-gold hover:bg-brand-gold/90 text-black py-3 px-8 rounded-sm font-semibold font-poppins transition duration-300 text-base">
            Shop New Arrivals
          </Link>
        </div>
      </div>
    </main>
  );
}
