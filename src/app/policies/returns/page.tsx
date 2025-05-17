import React from 'react';
import SectionTitle from '@/components/SectionTitle';
import Link from 'next/link';

export default function ReturnsPolicyPage() {
  return (
    <div className="bg-background-body py-12 lg:py-20">
      <div className="w-full max-w-screen-lg mx-auto px-4">
        <SectionTitle centered>Returns & Exchanges Policy</SectionTitle>

        <div className="prose prose-lg max-w-3xl mx-auto text-text-light mt-8 font-poppins">
          <p>
            We want you to be completely satisfied with your MoPres purchase. If you need to return or exchange an item, please review our policy below.
          </p>

          <h2 className="font-semibold text-text-dark mt-8 mb-4">Return Timeframe</h2>
          <p className="font-bold text-lg">
            You have 7 days from the date of delivery to initiate a return or exchange.
          </p>

          <h2 className="font-semibold text-text-dark mt-8 mb-4">Eligibility for Returns & Exchanges</h2>
          <p>To be eligible for a return or exchange, items must meet the following conditions:</p>
          <ul>
            <li>Be returned within the <strong>7-day timeframe</strong> mentioned above.</li>
            <li>Be in their original, unworn, and undamaged condition.</li>
            <li>Include all original packaging (box, dust bags, etc.).</li>
            <li>Show no signs of wear on the soles or uppers. We recommend trying on shoes on a carpeted surface to avoid damage.</li>
          </ul>
          <p><strong>Please Note:</strong></p>
          <ul>
            <li>Items marked as "Final Sale" or purchased during specific promotional events may not be eligible unless faulty.</li>
            <li>Pre-order items are subject to this policy once received.</li>
          </ul>

          <h2 className="font-semibold text-text-dark mt-8 mb-4">How to Initiate a Return or Exchange</h2>
          <ol>
            <li>
              <strong>Contact Us Promptly:</strong> Email us at <a href="mailto:info@mopres.co.za" className="text-brand-gold hover:underline">info@mopres.co.za</a> <strong>within 7 days</strong> of receiving your order. Please include:
              <ul>
                <li>Your order number</li>
                <li>The item(s) you wish to return or exchange</li>
                <li>The reason for the return/exchange</li>
                <li>For exchanges: the desired size/style</li>
              </ul>
            </li>
            <li>
              <strong>Await Authorization:</strong> We will review your request. If eligible, we'll provide return instructions and authorization. <strong>Do not send items back without prior authorization.</strong>
            </li>
            <li>
              <strong>Ship the Item:</strong> You are responsible for return shipping costs unless the item was incorrect or faulty. We strongly recommend using a trackable shipping service. MoPres is not responsible for items lost or damaged during return transit.
            </li>
            <li>
              <strong>Inspection Process:</strong> Once received, we will inspect the item(s) to ensure they meet the eligibility criteria.
            </li>
          </ol>

          <h2 className="font-semibold text-text-dark mt-8 mb-4">Refunds</h2>
          <p>
            If your return is approved, a refund will be processed to your original payment method or via EFT within 5-7 business days after inspection. Original shipping fees (if any) are non-refundable.
          </p>

          <h2 className="font-semibold text-text-dark mt-8 mb-4">Exchanges</h2>
          <p>
            If your exchange is approved and the desired item/size is in stock, we will ship it after inspecting your return. Standard shipping fees may apply for the new item, unless the original was faulty/incorrect. If the desired item is unavailable, a refund will be processed instead.
          </p>

          <h2 className="font-semibold text-text-dark mt-8 mb-4">Faulty or Incorrect Items</h2>
          <p>
            Received a faulty or incorrect item? Please <Link href="/contact" className="text-brand-gold hover:underline">contact us</Link> immediately with your order number and photos of the issue. We will arrange the return and replacement/refund at our expense upon verification.
          </p>

           <h2 className="font-semibold text-text-dark mt-8 mb-4">Questions?</h2>
          <p>
            Have questions about our policy? Please feel free to <Link href="/contact" className="text-brand-gold hover:underline">contact us</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}
