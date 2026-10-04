import React from 'react'
import Link from 'next/link'

import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Shipping Policy | Solecraft',
  description: 'Information on Solecraft shipping rates, delivery times, and order processing for domestic and international orders.',
  openGraph: {
    title: 'Shipping Policy | Solecraft',
    description: 'Information on Solecraft shipping rates, delivery times, and order processing for domestic and international orders.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Shipping Policy | Solecraft',
    description: 'Information on Solecraft shipping rates, delivery times, and order processing for domestic and international orders.',
  }
};

export default function ShippingPolicyPage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-[720px] mx-auto px-6 py-16 md:py-24">
        <h1 className="text-3xl md:text-4xl font-extrabold text-[#0f0f1a] mb-4">Shipping Policy</h1>
        <p className="text-sm font-semibold text-gray-500 mb-12 uppercase tracking-wider">
          Last updated: October 3, 2026
        </p>
        
        <div className="prose prose-gray max-w-none text-gray-600 leading-relaxed space-y-8">
          
          <section>
            <h2 className="text-xl font-bold text-[#0f0f1a] mb-4">1. Shipping Areas</h2>
            <p>
              Solecraft currently ships exclusively within Pakistan. We do not offer international shipping at this time.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#0f0f1a] mb-4">2. Shipping Cost</h2>
            <p>
              We offer a flat shipping rate of <strong>PKR 250</strong> on all standard orders. 
            </p>
            <p className="mt-2 font-semibold text-[#0f0f1a]">
              Enjoy FREE shipping on all orders with a subtotal of PKR 15,000 or more!
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#0f0f1a] mb-4">3. Processing Time</h2>
            <p>
              All orders are processed within 1-2 business days before they are dispatched for delivery. Orders are not processed or shipped on weekends or public holidays.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#0f0f1a] mb-4">4. Delivery Time</h2>
            <p>
              Once dispatched, the estimated delivery time is between 3 to 7 business days, depending on your specific location within Pakistan.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#0f0f1a] mb-4">5. Order Tracking</h2>
            <p>
              Once your order has shipped, you can track its progress directly from your account. Navigate to your <Link href="/account/orders" className="text-[#6C5CE7] hover:underline font-semibold">Orders</Link> page to view the designated carrier, your tracking number, and the estimated delivery date.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#0f0f1a] mb-4">6. Cash on Delivery (COD)</h2>
            <p>
              If you select Cash on Delivery at checkout, you will be required to pay the exact total amount in cash to the courier at the time of delivery. The courier may contact you via the phone number provided at checkout prior to delivery.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#0f0f1a] mb-4">7. Delivery Issues</h2>
            <p>
              If you experience any issues with your delivery—such as delayed, lost, or damaged shipments—please contact our support team immediately with your order number so we can assist you.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#0f0f1a] mb-4">8. Contact Us</h2>
            <p>
              For any shipping-related inquiries, please reach out to us at:
            </p>
            <p className="mt-2 font-medium text-[#6C5CE7]">
              support@solecraft.com
            </p>
          </section>

        </div>
      </div>
    </main>
  )
}
