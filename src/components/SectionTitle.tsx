import React from 'react';

// Define types for SectionTitle props
interface SectionTitleProps {
  children: React.ReactNode;
  centered?: boolean;
}

// Define SectionTitle component
const SectionTitle: React.FC<SectionTitleProps> = ({ children, centered = false }) => {
  const alignmentClass = centered ? 'text-center after:left-1/2 after:-translate-x-1/2' : 'after:left-0';
  // Using Tailwind classes for styling, matching original CSS .section-title::after
  return (
    <h2 className={`relative font-montserrat text-2xl sm:text-3xl lg:text-4xl font-semibold mb-12 pb-[calc(12px+2px)] after:content-[''] after:absolute ${alignmentClass} after:bottom-0 after:w-[60px] after:h-[2px] after:bg-brand-gold`}>
      {children}
    </h2>
  );
};

export default SectionTitle; // Export the component
