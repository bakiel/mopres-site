'use client';

import React from 'react';
import { default as dynamicImport } from 'next/dynamic';

// Dynamically import TestimonialCarousel with SSR turned off
const TestimonialCarousel = dynamicImport(() => import('@/components/TestimonialCarousel'), {
  ssr: false,
  loading: () => <div className="text-center py-10"><p>Loading testimonials...</p></div>, // Optional loading state
});

const DynamicTestimonialCarousel: React.FC = () => {
  return <TestimonialCarousel />;
};

export default DynamicTestimonialCarousel;