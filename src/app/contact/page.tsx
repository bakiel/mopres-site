import React from 'react';
import SectionTitle from '@/components/SectionTitle';
import Button from '@/components/Button'; // Import Button if needed for form

// TODO: Add Formspree integration later

export default function ContactPage() {
  return (
    <div className="bg-background-body py-12 lg:py-20">
      <div className="w-full max-w-screen-xl mx-auto px-4">
        <SectionTitle centered>Contact Us</SectionTitle>
        <p className="text-center text-text-light mb-12 max-w-2xl mx-auto">
          Have questions about our products, orders, or just want to say hello? Reach out using the details below or fill out the form. We typically respond within 1 business day.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16">
          {/* Contact Information */}
          <div className="contact-info">
            <h3 className="font-montserrat text-xl font-semibold mb-6">Our Details</h3>
            <ul className="space-y-4 text-base text-text-light">
              <li className="flex items-start gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mt-1 flex-shrink-0 text-brand-gold"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                <span>Phone / WhatsApp: +27 83 500 5311</span>
              </li>
              <li className="flex items-start gap-3">
                 <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mt-1 flex-shrink-0 text-brand-gold"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                <span>General Enquiries: info@mopres.co.za</span>
              </li>
               <li className="flex items-start gap-3">
                 <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mt-1 flex-shrink-0 text-brand-gold"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                <span>Owner: pulane@mopres.co.za</span>
              </li>
              <li className="flex items-start gap-3">
                 <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mt-1 flex-shrink-0 text-brand-gold"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                 {/* Using address from architecture doc */}
                <span>Address: 6680 Witrugeend Street, 578 Heuwelsig Estates, Cetisdal, Centurion.</span>
              </li>
               <li className="flex items-start gap-3">
                 <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mt-1 flex-shrink-0 text-brand-gold"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                <span>Support Hours: Mon - Fri, 9 am – 5 pm SAST</span>
              </li>
            </ul>
             {/* Social Icons */}
             <div className="social-icons flex gap-4 mt-8">
                 <a href="https://www.instagram.com/MoPres/" target="_blank" rel="noopener noreferrer" className="social-icon inline-flex items-center justify-center w-10 h-10 rounded-full bg-gray-200 text-brand-gold transition-all duration-fast ease-in-out hover:bg-brand-gold hover:text-white hover:scale-110" aria-label="Instagram">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                </a>
                 <a href="https://www.facebook.com/MoPresLuxuryFootwear/" target="_blank" rel="noopener noreferrer" className="social-icon inline-flex items-center justify-center w-10 h-10 rounded-full bg-gray-200 text-brand-gold transition-all duration-fast ease-in-out hover:bg-brand-gold hover:text-white hover:scale-110" aria-label="Facebook">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
                </a>
                 <a href="https://wa.me/27835005311" target="_blank" rel="noopener noreferrer" className="social-icon inline-flex items-center justify-center w-10 h-10 rounded-full bg-gray-200 text-brand-gold transition-all duration-fast ease-in-out hover:bg-brand-gold hover:text-white hover:scale-110" aria-label="WhatsApp">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
                </a>
              </div>
          </div>

          {/* Contact Form Placeholder */}
          {/* TODO: Replace with Formspree form component/integration */}
          <div className="contact-form">
            <h3 className="font-montserrat text-xl font-semibold mb-8">Send an Enquiry</h3>
            {/* Updated action to point to the correct Formspree endpoint */}
            <form action="https://formspree.io/f/xdkgobaz" method="POST">
              {/* Add a hidden subject field for better email filtering (optional) */}
              <input type="hidden" name="_subject" value="New Enquiry from MoPres Website Contact Form" />
              <div className="form-group mb-6">
                <label htmlFor="name" className="block mb-2.5 font-medium text-sm text-text-dark">Full Name</label>
                <input type="text" id="name" name="name" placeholder="Your Full Name" required className="w-full py-3.5 px-4 border border-border-light bg-white font-poppins text-base rounded-sm transition-colors duration-300 ease-in-out focus:outline-none focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/15 placeholder:text-gray-400 placeholder:font-light" />
              </div>
              <div className="form-group mb-6">
                <label htmlFor="email" className="block mb-2.5 font-medium text-sm text-text-dark">Email Address</label>
                <input type="email" id="email" name="email" placeholder="your.email@example.com" required className="w-full py-3.5 px-4 border border-border-light bg-white font-poppins text-base rounded-sm transition-colors duration-300 ease-in-out focus:outline-none focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/15 placeholder:text-gray-400 placeholder:font-light" />
              </div>
              <div className="form-group mb-6">
                <label htmlFor="phone" className="block mb-2.5 font-medium text-sm text-text-dark">Phone / WhatsApp (Optional)</label>
                <input type="tel" id="phone" name="phone" placeholder="+27 XX XXX XXXX" className="w-full py-3.5 px-4 border border-border-light bg-white font-poppins text-base rounded-sm transition-colors duration-300 ease-in-out focus:outline-none focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/15 placeholder:text-gray-400 placeholder:font-light" />
              </div>
              <div className="form-group mb-6">
                <label htmlFor="message" className="block mb-2.5 font-medium text-sm text-text-dark">Message</label>
                <textarea id="message" name="message" placeholder="Tell us which styles, sizes, or questions you have..." rows={5} required className="w-full py-3.5 px-4 border border-border-light bg-white font-poppins text-base rounded-sm transition-colors duration-300 ease-in-out focus:outline-none focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/15 placeholder:text-gray-400 placeholder:font-light min-h-[130px] resize-y"></textarea>
              </div>
              {/* Optional: Add hidden fields for Formspree like _subject */}
              {/* <input type="hidden" name="_subject" value="New Enquiry from MoPres Website!" /> */}
              <Button type="submit" variant="primary" className="w-full mt-4">Send Enquiry</Button>
            </form>
            <p className="text-xs text-text-light mt-4">This site is protected by reCAPTCHA and the Google Privacy Policy and Terms of Service apply.</p>
          </div>
        </div>

        {/* Optional: Map Section */}
        {/* TODO: Add map embed if required */}
        {/* <div className="map-section mt-16 lg:mt-24 pt-12 border-t border-border-light">
          <SectionTitle centered>Find Us</SectionTitle>
          <div className="aspect-w-16 aspect-h-9 bg-gray-200 rounded mt-8">
             Map embed code goes here
          </div>
        </div> */}
      </div>
    </div>
  );
}
