import React from 'react';
import SectionTitle from '@/components/SectionTitle';
import Link from 'next/link';

export default function ShippingPolicyPage() {
  return (
    <div className="bg-background-body py-12 lg:py-20">
      <div className="w-full max-w-screen-lg mx-auto px-4">
        <SectionTitle centered>Shipping Policy</SectionTitle>

        <div className="prose prose-lg max-w-3xl mx-auto text-text-light mt-8 font-poppins"> {/* Added font-poppins */}
          <p>
            Thank you for shopping with MoPres! We are committed to delivering your luxury footwear promptly and securely. Please review our shipping policy below.
          </p>

          <h3 className="font-semibold text-text-dark">Processing Time</h3>
          <p>
            Orders for in-stock items are typically processed within 1-3 business days (Monday - Friday, excluding holidays) after payment confirmation. Pre-order items are subject to the estimated shipping timeframe indicated on the product page.
          </p>

          <h3 className="font-semibold text-text-dark">Shipping Within South Africa</h3>
          <ul>
            <li><strong>Standard Shipping:</strong> We offer a flat-rate standard shipping fee of R150 for all orders within South Africa.</li>
            <li><strong>Free Shipping:</strong> Enjoy complimentary standard shipping on all orders totaling R2000 or more.</li>
            <li><strong>Delivery Timeframe:</strong> Standard delivery typically takes 2-5 business days after the order has been processed and shipped, depending on your location. Major centres usually receive deliveries faster than outlying areas.</li>
            <li><strong>Courier Partners:</strong> We utilize reputable courier services to ensure reliable delivery. You will receive tracking information via email once your order ships.</li>
          </ul>

          <h3 className="font-semibold text-text-dark">International Shipping</h3>
          <p>
            Currently, MoPres only ships within South Africa. We are exploring options for international shipping in the future. Please check back later or <Link href="/contact" className="text-brand-gold hover:underline">contact us</Link> for updates.
          </p>

          <h3 className="font-semibold text-text-dark">Order Tracking</h3>
          <p>
            Once your order has shipped, you will receive an email containing your tracking number and a link to the courier's tracking website. Please allow up to 24 hours for the tracking information to become active.
          </p>

          <h3 className="font-semibold text-text-dark">Shipping Address</h3>
          <p>
            Please ensure your shipping address is complete and accurate during checkout. MoPres is not responsible for orders shipped to incorrect addresses provided by the customer. If you need to change your shipping address after placing an order, please <Link href="/contact" className="text-brand-gold hover:underline">contact us</Link> immediately. We cannot guarantee address changes can be made once an order is processed.
          </p>

           <h3 className="font-semibold text-text-dark">Failed Deliveries</h3>
          <p>
            Our courier partners will typically attempt delivery multiple times. If delivery fails after these attempts, the package may be returned to us. Re-shipment may incur additional shipping charges.
          </p>

          <h3 className="font-semibold text-text-dark">Questions?</h3>
          <p>
            If you have any questions regarding our shipping policy, please feel free to <Link href="/contact" className="text-brand-gold hover:underline">contact us</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}
