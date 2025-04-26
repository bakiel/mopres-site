'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

// Define structure for banner slides
interface BannerSlide {
  id: number;
  imageSrc: string;
  altText: string;
  title: string;
  subtitle: string;
  buttonText: string;
  buttonLink: string;
}

// Define the banner slides data using lifestyle images
const bannerSlides: BannerSlide[] = [
  {
    id: 1,
    imageSrc: '/Woman_wearing_elegant_high_heels.jpg',
    altText: 'Woman wearing elegant MoPres high heels',
    title: 'Step into Luxury',
    subtitle: 'Discover handcrafted footwear that defines elegance.',
    buttonText: 'Explore Collections',
    buttonLink: '#collections', // Link to collections section on the page
  },
  {
    id: 2,
    imageSrc: '/Legs_crossed_wearing_heels.jpg',
    altText: 'Close up of legs crossed wearing stylish heels',
    title: 'Uncompromising Style',
    subtitle: 'Experience the perfect blend of comfort and sophistication.',
    buttonText: 'Shop New Arrivals',
    buttonLink: '#new-arrivals', // Link to new arrivals section
  },
  {
    id: 3,
    imageSrc: '/Person_in_stylish_gold_suit.jpg',
    altText: 'Person wearing a stylish gold suit and heels',
    title: 'Make a Statement',
    subtitle: 'Elevate your look with MoPres signature designs.',
    buttonText: 'View Featured',
    buttonLink: '#featured', // Link to featured section
  },
];


const HeroBanner: React.FC = () => {
  // Removed featuredProducts prop, using static bannerSlides now

  return (
    <section className="relative w-full h-[70vh] md:h-[80vh] lg:h-[90vh] overflow-hidden bg-brand-black"> {/* Adjusted height and bg */}
      <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        spaceBetween={0} // No space between slides
        slidesPerView={1} // Show one slide at a time
        navigation // Enable navigation arrows
        pagination={{ clickable: true }} // Enable clickable pagination dots
        loop={true} // Enable continuous loop mode
        autoplay={{
          delay: 5000, // Autoplay delay 5 seconds
          disableOnInteraction: false, // Autoplay continues after user interaction
        }}
        className="h-full"
      >
        {bannerSlides.map((slide, index) => (
          <SwiperSlide key={slide.id} className="relative h-full w-full">
            {/* Background Image */}
            <Image
              src={slide.imageSrc}
              alt={slide.altText}
              fill
              style={{ objectFit: 'cover' }}
              priority={index === 0} // Prioritize the first image
              quality={85} // Adjust quality as needed
              sizes="100vw"
            />
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent z-10"></div>

            {/* Content Overlay */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4 z-20">
              <h1 className="font-montserrat text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4 lg:mb-6 text-shadow-md">
                {slide.title}
              </h1>
              <p className="text-lg font-poppins font-light text-white/90 max-w-xl mx-auto mb-8 lg:mb-10">
                {slide.subtitle}
              </p>
              {/* Use Link for internal navigation, Button styling */}
              <Link
                href={slide.buttonLink}
                className="inline-block bg-brand-gold text-black py-3 px-8 rounded font-semibold font-poppins hover:bg-opacity-90 transition duration-300"
              >
                {slide.buttonText}
              </Link>
            </div> {/* Close Content Overlay div */}
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
};

export default HeroBanner;
// Removed <style jsx global> block
