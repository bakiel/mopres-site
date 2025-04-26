import React from 'react';
import SectionTitle from '@/components/SectionTitle';
import Link from 'next/link';

export default function ReturnsPolicyPage() {
  return (
    <div className="bg-background-body py-12 lg:py-20">
      <div className="w-full max-w-screen-lg mx-auto px-4">
        <SectionTitle centered>Returns & Exchanges Policy</SectionTitle>

        <div className="prose prose-lg max-w-3xl mx-auto text-text-light mt-8 font-poppins"> {/* Added font-poppins */}
          <p>
            We want you to be completely satisfied with your MoPres purchase. If you need to return or exchange an item, please review our policy below.
          </p>

          <h3 className="font-semibold text-text-dark">Eligibility</h3>
          <ul>
            <li>Returns and exchanges are accepted within 14 days of the delivery date.</li>
            <li>Items must be returned in their original, unworn, undamaged condition, with all original packaging (box, dust bags, etc.) intact.</li>
            <li>Shoes must not show any signs of wear on the soles or uppers. We recommend trying on shoes on a carpeted surface.</li>
            <li>Items marked as "Final Sale" or purchased during specific promotional events may not be eligible for return or exchange unless faulty.</li>
            <li>Pre-order items are subject to this policy once received by the customer.</li>
          </ul>

          <h3 className="font-semibold text-text-dark">How to Initiate a Return/Exchange</h3>
          <ol>
            <li>
              <strong>Contact Us:</strong> Please email us at <a href="mailto:info@mopres.co.za" className="text-brand-gold hover:underline">info@mopres.co.za</a> within 14 days of receiving your order. Include your order number, the item(s) you wish to return/exchange, and the reason. For exchanges, please specify the desired size/style.
            </li>
            <li>
              <strong>Approval:</strong> We will review your request and provide return instructions and authorization if eligible. Please do not send items back without prior authorization.
            </li>
            <li>
              <strong>Shipping:</strong> Customers are responsible for the cost of return shipping unless the item received was incorrect or faulty. We recommend using a trackable shipping service, as MoPres is not responsible for items lost or damaged during return transit.
            </li>
            <li>
              <strong>Inspection:</strong> Once we receive the returned item(s), we will inspect them to ensure they meet the eligibility criteria.
            </li>
          </ol>

          <h3 className="font-semibold text-text-dark">Refunds</h3>
          <p>
            If your return is approved, a refund will be processed to your original payment method (if applicable) or via EFT within 5-7 business days after the item is received and inspected. Please note that original shipping fees (if any) are non-refundable.
          </p>

          <h3 className="font-semibold text-text-dark">Exchanges</h3>
          <p>
            If you requested an exchange and the desired item/size is in stock, we will ship it out to you after receiving and inspecting your returned item. Standard shipping fees may apply for the exchanged item, unless the original item was faulty or incorrect. If the desired item is not available, we will process a refund instead.
          </p>

          <h3 className="font-semibold text-text-dark">Faulty or Incorrect Items</h3>
          <p>
            If you believe you have received a faulty or incorrect item, please <Link href="/contact" className="text-brand-gold hover:underline">contact us</Link> immediately with your order number and photos of the issue. We will arrange for the return and replacement or refund at our expense upon verification.
          </p>

           <h3 className="font-semibold text-text-dark">Questions?</h3>
          <p>
            If you have any questions regarding our returns and exchanges policy, please feel free to <Link href="/contact" className="text-brand-gold hover:underline">contact us</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}
