import React from 'react';
import SectionTitle from '@/components/SectionTitle';
import Link from 'next/link';

export default function PrivacyPolicyPage() {
  return (
    <div className="bg-background-body py-12 lg:py-20">
      <div className="w-full max-w-screen-lg mx-auto px-4">
        <SectionTitle centered>Privacy Policy</SectionTitle>

        <div className="prose prose-lg max-w-3xl mx-auto text-text-light mt-8 font-poppins"> {/* Added font-poppins */}
          <p>
            MoPres ("we", "us", "our") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website mopres.co.za (the "Site"). Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, please do not access the site.
          </p>

          <h3 className="font-semibold text-text-dark">Collection of Your Information</h3>
          <p>
            We may collect information about you in a variety of ways. The information we may collect on the Site includes:
          </p>
          <ul>
            <li>
              <strong>Personal Data:</strong> Personally identifiable information, such as your name, shipping address, email address, and telephone number, and demographic information, such as your age, gender, hometown, and interests, that you voluntarily give to us when you register with the Site or when you choose to participate in various activities related to the Site, such as online chat and message boards. You are under no obligation to provide us with personal information of any kind, however your refusal to do so may prevent you from using certain features of the Site.
            </li>
             <li>
              <strong>Derivative Data:</strong> Information our servers automatically collect when you access the Site, such as your IP address, your browser type, your operating system, your access times, and the pages you have viewed directly before and after accessing the Site.
            </li>
             <li>
              <strong>Financial Data:</strong> We currently process payments via EFT and do not directly collect or store financial information like credit card numbers. If we introduce other payment gateways, their privacy policies will apply.
            </li>
             <li>
              <strong>Data From Contests, Giveaways, and Surveys:</strong> Personal and other information you may provide when entering contests or giveaways and/or responding to surveys.
            </li>
          </ul>

          <h3 className="font-semibold text-text-dark">Use of Your Information</h3>
          <p>
            Having accurate information about you permits us to provide you with a smooth, efficient, and customized experience. Specifically, we may use information collected about you via the Site to:
          </p>
           <ul>
                <li>Create and manage your account.</li>
                <li>Process your orders and payments, and deliver products to you.</li>
                <li>Email you regarding your account or order.</li>
                <li>Fulfill and manage purchases, orders, payments, and other transactions related to the Site.</li>
                <li>Prevent fraudulent transactions, monitor against theft, and protect against criminal activity.</li>
                <li>Request feedback and contact you about your use of the Site.</li>
                <li>Resolve disputes and troubleshoot problems.</li>
                <li>Respond to product and customer service requests.</li>
                <li>Send you a newsletter or other marketing communications (if you opt-in).</li>
                <li>Compile anonymous statistical data and analysis for use internally or with third parties.</li>
            </ul>
            <p>We do not sell your personal information to third parties.</p>

          <h3 className="font-semibold text-text-dark">Disclosure of Your Information</h3>
          <p>
            We may share information we have collected about you in certain situations. Your information may be disclosed as follows:
          </p>
           <ul>
                <li><strong>By Law or to Protect Rights:</strong> If we believe the release of information about you is necessary to respond to legal process, to investigate or remedy potential violations of our policies, or to protect the rights, property, and safety of others, we may share your information as permitted or required by any applicable law, rule, or regulation.</li>
                <li><strong>Third-Party Service Providers:</strong> We may share your information with third parties that perform services for us or on our behalf, including payment processing (as applicable), data analysis, email delivery, hosting services, customer service, and marketing assistance. For example, we use Supabase for backend services (database, auth, storage) and potentially Formspree for form submissions.</li>
                <li><strong>Business Transfers:</strong> We may share or transfer your information in connection with, or during negotiations of, any merger, sale of company assets, financing, or acquisition of all or a portion of our business to another company.</li>
                <li><strong>With Your Consent:</strong> We may disclose your personal information for any other purpose with your consent.</li>
            </ul>
            <p>We do not sell your personal information to third parties.</p>

          <h3 className="font-semibold text-text-dark">Security of Your Information</h3>
          <p>
            We use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable, and no method of data transmission can be guaranteed against any interception or other type of misuse.
          </p>

          <h3 className="font-semibold text-text-dark">Policy for Children</h3>
          <p>
            We do not knowingly solicit information from or market to children under the age of 13. If you become aware of any data we have collected from children under age 13, please contact us using the contact information provided below.
          </p>

          <h3 className="font-semibold text-text-dark">Controls for Do-Not-Track Features</h3>
          <p>
            Most web browsers and some mobile operating systems include a Do-Not-Track (“DNT”) feature or setting you can activate to signal your privacy preference not to have data about your online browsing activities monitored and collected. No uniform technology standard for recognizing and implementing DNT signals has been finalized. As such, we do not currently respond to DNT browser signals or any other mechanism that automatically communicates your choice not to be tracked online.
          </p>

          <h3 className="font-semibold text-text-dark">Options Regarding Your Information</h3>
          <p>
            You may at any time review or change the information in your account or terminate your account by logging into your account settings (if available) or contacting us using the contact information provided below. Upon your request to terminate your account, we will deactivate or delete your account and information from our active databases. However, some information may be retained in our files to prevent fraud, troubleshoot problems, assist with any investigations, enforce our Terms of Use and/or comply with legal requirements.
          </p>

          <h3 className="font-semibold text-text-dark">Changes to This Privacy Policy</h3>
           <p>
            We may update this Privacy Policy from time to time in order to reflect, for example, changes to our practices or for other operational, legal or regulatory reasons. We will notify you of any changes by posting the new Privacy Policy on this page. You are advised to review this Privacy Policy periodically for any changes.
          </p>

          <h3 className="font-semibold text-text-dark">Contact Us</h3>
          <p>
            If you have questions or comments about this Privacy Policy, please contact us at: <a href="mailto:info@mopres.co.za" className="text-brand-gold hover:underline">info@mopres.co.za</a>
          </p>
        </div>
      </div>
    </div>
  );
}
