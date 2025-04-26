import React from 'react';
import SectionTitle from '@/components/SectionTitle';
import Link from 'next/link';

export default function TermsOfServicePage() {
  return (
    <div className="bg-background-body py-12 lg:py-20">
      <div className="w-full max-w-screen-lg mx-auto px-4">
        <SectionTitle centered>Terms of Service</SectionTitle>

        <div className="prose prose-lg max-w-3xl mx-auto text-text-light mt-8 font-poppins"> {/* Added font-poppins */}
          <p>
            Welcome to MoPres! These Terms of Service ("Terms") govern your use of our website mopres.co.za (the "Site") and the services offered through it. By accessing or using the Site, you agree to be bound by these Terms.
          </p>

          <h3 className="font-semibold text-text-dark">1. Use of the Site</h3>
          <p>
            You agree to use the Site only for lawful purposes and in a way that does not infringe the rights of, restrict or inhibit anyone else's use and enjoyment of the Site. Prohibited behavior includes harassing or causing distress or inconvenience to any other user, transmitting obscene or offensive content, or disrupting the normal flow of dialogue within the Site.
          </p>

          <h3 className="font-semibold text-text-dark">2. Intellectual Property</h3>
          <p>
            All content included on the Site, such as text, graphics, logos, images, as well as the compilation thereof, and any software used on the Site, is the property of MoPres or its suppliers and protected by copyright and other laws that protect intellectual property and proprietary rights. You agree to observe and abide by all copyright and other proprietary notices, legends or other restrictions contained in any such content and will not make any changes thereto.
          </p>

          <h3 className="font-semibold text-text-dark">3. User Accounts</h3>
          <p>
            If you create an account on the Site, you are responsible for maintaining the security of your account and you are fully responsible for all activities that occur under the account. You must immediately notify MoPres of any unauthorized uses of your account or any other breaches of security. MoPres will not be liable for any acts or omissions by You, including any damages of any kind incurred as a result of such acts or omissions.
          </p>

          <h3 className="font-semibold text-text-dark">4. Products and Pricing</h3>
          <p>
            We strive to display accurate product information and pricing on the Site. However, errors may occur. We reserve the right to correct any errors, inaccuracies, or omissions and to change or update information or cancel orders if any information on the Site is inaccurate at any time without prior notice (including after you have submitted your order). Prices are quoted in South African Rand (ZAR) and are subject to change.
          </p>

          <h3 className="font-semibold text-text-dark">5. Orders and Payment</h3>
          <p>
            Placing an order constitutes an offer to purchase the products. All orders are subject to acceptance by us. We currently accept payment via Electronic Funds Transfer (EFT). Payment must be received and confirmed before orders are processed and shipped. Please refer to our <Link href="/policies/shipping" className="text-brand-gold hover:underline">Shipping Policy</Link> for details on processing and delivery.
          </p>

          <h3 className="font-semibold text-text-dark">6. Returns and Exchanges</h3>
          <p>
            Please refer to our <Link href="/policies/returns" className="text-brand-gold hover:underline">Returns & Exchanges Policy</Link> for details on eligibility and procedures for returning or exchanging items.
          </p>

          <h3 className="font-semibold text-text-dark">7. Limitation of Liability</h3>
          <p>
            To the fullest extent permitted by applicable law, MoPres shall not be liable for any indirect, incidental, special, consequential or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible losses, resulting from (a) your access to or use of or inability to access or use the Site; (b) any conduct or content of any third party on the Site; (c) any content obtained from the Site; or (d) unauthorized access, use or alteration of your transmissions or content.
          </p>

          <h3 className="font-semibold text-text-dark">8. Indemnification</h3>
           <p>
            You agree to indemnify, defend and hold harmless MoPres, its officers, directors, employees, agents and third parties, for any losses, costs, liabilities and expenses (including reasonable attorney's fees) relating to or arising out of your use of or inability to use the Site or services, any user postings made by you, your violation of any terms of this Agreement or your violation of any rights of a third party, or your violation of any applicable laws, rules or regulations.
          </p>

          <h3 className="font-semibold text-text-dark">9. Governing Law</h3>
          <p>
            These Terms shall be governed and construed in accordance with the laws of South Africa, without regard to its conflict of law provisions.
          </p>

          <h3 className="font-semibold text-text-dark">10. Changes to Terms</h3>
          <p>
            MoPres reserves the right, in its sole discretion, to change the Terms under which mopres.co.za is offered. The most current version of the Terms will supersede all previous versions. MoPres encourages you to periodically review the Terms to stay informed of our updates.
          </p>

          <h3 className="font-semibold text-text-dark">Contact Us</h3>
          <p>
            MoPres welcomes your questions or comments regarding the Terms: <a href="mailto:info@mopres.co.za" className="text-brand-gold hover:underline">info@mopres.co.za</a>
          </p>
        </div>
      </div>
    </div>
  );
}
