'use client';

import React, { useState } from 'react';
import Button from './Button'; // Assuming Button component exists

const NewsletterSignup: React.FC = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setMessage('');

    // --- Placeholder for actual signup logic ---
    // In a real application, you would send the email to your backend/service
    // For example, using fetch:
    // try {
    //   const response = await fetch('/api/newsletter-signup', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({ email }),
    //   });
    //   const result = await response.json();
    //   if (response.ok) {
    //     setMessage('Thank you for subscribing!');
    //     setEmail(''); // Clear input on success
    //   } else {
    //     setMessage(result.error || 'Subscription failed. Please try again.');
    //   }
    // } catch (error) {
    //   setMessage('An error occurred. Please try again later.');
    // } finally {
    //   setIsLoading(false);
    // }

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('Newsletter signup attempt:', email);
    setMessage(`Thank you for subscribing, ${email}! (Placeholder)`);
    setEmail('');
    // --- End Placeholder ---

    setIsLoading(false);
  };

  return (
    // Restore container styling
    <div className="newsletter-signup bg-gray-100 p-8 rounded-lg">
      {/* Restore text colors for light background */}
      <h3 className="text-xl font-semibold text-text-dark mb-4 font-montserrat">Stay Updated</h3>
      <p className="text-text-light mb-6 font-poppins text-sm"> {/* Use text-light or appropriate color for light bg */}
        Subscribe to our newsletter for the latest collections, exclusive offers, and style inspiration.
      </p>
      {/* Applying the new suggested form structure */}
      <form onSubmit={handleSubmit} className="w-full max-w-md mx-auto">
        <div className="flex flex-col gap-3">
          <input
            type="email"
            id="newsletter-email" // Keep ID
            name="email"
            required
            placeholder="Your email address" // Use suggested placeholder
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            // Apply suggested styling, adapting slightly for existing theme (bg-white, border-border-light, text-text-dark, placeholder)
            className="w-full rounded px-4 py-3 bg-white border border-border-light text-text-dark placeholder-gray-400 focus:outline-none focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/15 transition font-poppins"
            disabled={isLoading}
          />
          {/* Using standard button element as per suggestion, applying styling */}
          <button
            type="submit"
            // Apply suggested styling, using brand colors
            className="w-full py-3 rounded bg-brand-gold text-black font-medium hover:bg-brand-gold/90 transition font-poppins"
            disabled={isLoading}
          >
            {isLoading ? 'SUBSCRIBING...' : 'SUBSCRIBE'} {/* Match button text case */}
          </button>
        </div>
      </form>
      {/* Keep existing message display logic */}
      {message && (
        <p className={`mt-4 text-sm ${message.includes('failed') || message.includes('error') ? 'text-red-600' : 'text-green-600'} font-poppins text-center`}> {/* Added text-center */}
          {message}
        </p>
      )}
    </div>
  );
};

export default NewsletterSignup;
