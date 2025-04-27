'use client';

import React, { useState, useEffect } from 'react';

interface ClientPriceFormatProps {
  price: number;
  className?: string; // Allow passing className for styling
}

const ClientPriceFormat: React.FC<ClientPriceFormatProps> = ({ price, className }) => {
  const [formattedPrice, setFormattedPrice] = useState<string | null>(null);

  useEffect(() => {
    // Format the price only on the client side after mount
    setFormattedPrice(
      new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(price)
    );
  }, [price]); // Re-run if the price changes

  // Render null or a placeholder initially to avoid mismatch
  if (formattedPrice === null) {
    // Optional: Render a placeholder or the raw number briefly
    // return <span className={className}>R {price.toFixed(2)}</span>;
    return null; // Or return null for cleanest hydration
  }

  return <span className={className}>{formattedPrice}</span>;
};

export default ClientPriceFormat;
