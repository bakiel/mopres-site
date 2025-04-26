'use client';

import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';

// Import Swiper styles (already imported in HeroBanner, but good practice to include)
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

// Placeholder testimonial data structure
interface Testimonial {
  id: number;
  name: string;
  location?: string; // Optional location
  text: string;
  rating: number; // e.g., 1-5 stars
}

// Placeholder data - replace with actual data fetching later
const testimonials: Testimonial[] = [
  {
    id: 1,
    name: 'Thandiwe M.',
    location: 'Johannesburg',
    text: 'Absolutely stunning shoes! The craftsmanship is impeccable, and they are surprisingly comfortable for heels. Worth every cent.',
    rating: 5,
  },
  {
    id: 2,
    name: 'Sarah L.',
    location: 'Cape Town',
    text: 'I bought the Scarlet Classics for a wedding, and I received so many compliments. They truly make a statement. Excellent quality.',
    rating: 5,
  },
  {
    id: 3,
    name: 'Lerato K.',
    text: 'The customer service was fantastic, and the shoes arrived beautifully packaged. They feel luxurious and look even better in person.',
    rating: 4,
  },
  {
    id: 4,
    name: 'Aisha B.',
    location: 'Durban',
    text: 'Elegant, sophisticated, and unique designs. MoPres has become my go-to for special occasion footwear.',
    rating: 5,
  },
];

// Helper to render stars
const renderStars = (rating: number) => {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    stars.push(
      <svg
        key={i}
        className={`w-5 h-5 ${i <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
        fill="currentColor"
        viewBox="0 0 20 20"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
      </svg>
    );
  }
  return <div className="flex items-center">{stars}</div>;
};


const TestimonialCarousel: React.FC = () => {
  if (!testimonials || testimonials.length === 0) {
    return null; // Don't render if no testimonials
  }

  return (
    <section className="testimonial-carousel bg-brand-ivory py-16 lg:py-24"> {/* Changed background */}
      <div className="w-full max-w-screen-lg mx-auto px-4">
        <h2 className="text-3xl font-bold text-center text-text-dark mb-12 font-montserrat">What Our Customers Say</h2>
        <Swiper
          modules={[Navigation, Pagination, Autoplay]}
          spaceBetween={30} // Space between slides
          slidesPerView={1} // Show one slide on smaller screens
          breakpoints={{
            // when window width is >= 768px
            768: {
              slidesPerView: 2,
              spaceBetween: 40,
            },
            // when window width is >= 1024px
            1024: {
              slidesPerView: 2, // Keep 2 slides on larger screens for better readability
              spaceBetween: 50,
            },
          }}
          navigation // Enable navigation arrows
          pagination={{ clickable: true }} // Enable clickable pagination dots
          loop={testimonials.length > 2} // Enable loop only if enough slides
          autoplay={{
            delay: 7000, // Slower autoplay for testimonials
            disableOnInteraction: true, // Stop autoplay on interaction
          }}
          className="pb-12" // Add padding bottom for pagination
        >
          {testimonials.map((testimonial) => (
            <SwiperSlide key={testimonial.id} className="h-auto">
              <div className="bg-white p-8 rounded-lg shadow-md border border-border-light h-full flex flex-col">
                <div className="flex items-center mb-4">
                  {renderStars(testimonial.rating)}
                </div>
                <blockquote className="text-text-light italic mb-6 flex-grow font-poppins">
                  "{testimonial.text}"
                </blockquote>
                <footer className="mt-auto">
                  <p className="font-semibold text-text-dark font-montserrat">{testimonial.name}</p>
                  {testimonial.location && (
                    <p className="text-sm text-gray-500 font-poppins">{testimonial.location}</p>
                  )}
                </footer>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
};

export default TestimonialCarousel;
