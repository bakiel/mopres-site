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
    <div className="newsletter-signup bg-gray-100 p-8 rounded-lg">
      <h3 className="text-xl font-semibold text-text-dark mb-4 font-montserrat">Stay Updated</h3>
      <p className="text-text-light mb-6 font-poppins text-sm">
        Subscribe to our newsletter for the latest collections, exclusive offers, and style inspiration.
      </p>
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
        <label htmlFor="newsletter-email" className="sr-only">Email address</label>
        <input
          type="email"
          id="newsletter-email"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email address"
          required
          className="flex-grow py-2.5 px-4 border border-border-light bg-white font-poppins text-base rounded-sm transition-colors duration-300 ease-in-out focus:outline-none focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/15 placeholder:text-gray-400 placeholder:font-light"
          disabled={isLoading}
        />
        <Button
          type="submit"
          variant="primary"
          className="px-6 py-2.5"
          disabled={isLoading}
        >
          {isLoading ? 'Subscribing...' : 'Subscribe'}
        </Button>
      </form>
      {message && (
        <p className={`mt-4 text-sm ${message.includes('failed') || message.includes('error') ? 'text-red-600' : 'text-green-600'} font-poppins`}>
          {message}
        </p>
      )}
    </div>
  );
};

export default NewsletterSignup;
