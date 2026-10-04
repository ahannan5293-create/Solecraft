import React from 'react'

import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Review the Terms of Service for using the Solecraft website. These terms govern your use of our products, services, and online platform.',
  alternates: { canonical: '/terms-of-service' },
};

export default function TermsOfServicePage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-[720px] mx-auto px-6 py-16 md:py-24">
        <h1 className="text-3xl md:text-4xl font-extrabold text-[#0f0f1a] mb-4">Terms of Service</h1>
        <p className="text-sm font-semibold text-gray-500 mb-12 uppercase tracking-wider">
          Last updated: October 3, 2026
        </p>
        
        <div className="prose prose-gray max-w-none text-gray-600 leading-relaxed space-y-8">
          
          <section>
            <h2 className="text-xl font-bold text-[#0f0f1a] mb-4">1. Agreement to Terms</h2>
            <p>
              By accessing or using the Solecraft website, you agree to be bound by these Terms of Service. If you do not agree to all of these terms, please do not use our website.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#0f0f1a] mb-4">2. Accounts</h2>
            <p>
              When you create an account with us, you must provide accurate and complete information. You are solely responsible for maintaining the confidentiality of your login credentials and for all activities that occur under your account. We permit only one account per person.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#0f0f1a] mb-4">3. Products & Pricing</h2>
            <p>
              All prices shown on our website are in Pakistani Rupees (PKR). Solecraft reserves the right to correct any pricing errors that may occur. Product availability is not guaranteed until you receive a formal order confirmation from us.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#0f0f1a] mb-4">4. Orders & Payment</h2>
            <p>
              Cash on Delivery (COD) is currently the available payment method for your convenience. Additional payment options, including secure card payment via Safepay, may be added in the future. A valid phone number is required for all orders. 
            </p>
            <p className="mt-2">
              Orders are considered confirmed immediately upon placement. <strong>Please note that when card payments are active, card details are handled entirely by our payment provider and are never seen or stored by Solecraft directly.</strong>
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#0f0f1a] mb-4">5. Order Cancellation</h2>
            <p>
              You may request a cancellation for orders that have not yet shipped via your account dashboard. All cancellation requests are subject to admin review and approval. We cannot guarantee automatic or instant cancellations once an order has entered processing.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#0f0f1a] mb-4">6. Shipping & Delivery</h2>
            <p>
              For full details regarding shipping times, costs, and policies, please refer to our dedicated <a href="/shipping-policy" className="text-[#6C5CE7] hover:underline font-semibold">Shipping Policy</a>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#0f0f1a] mb-4">7. Returns & Refunds</h2>
            <p>
              Items may be returned within 14 days of delivery provided they are unworn, in their original packaging, and have all tags attached. Refunds for Cash on Delivery orders will be processed via bank transfer. Once additional payment methods such as card payments return, those refunds will be processed back to the original payment method.
            </p>
            <p className="mt-2 text-sm italic text-gray-500">
              Note: This is a placeholder policy and is subject to change based on finalized business terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#0f0f1a] mb-4">8. Intellectual Property</h2>
            <p>
              All content, branding, design, and imagery on this website belong exclusively to Solecraft. No part of this website may be reproduced, distributed, or transmitted without our prior written permission.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#0f0f1a] mb-4">9. Prohibited Use</h2>
            <p>
              You agree not to use our website for any unlawful purpose. This includes placing fraudulent orders, attempting to breach site security, or misusing the account system in any manner.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#0f0f1a] mb-4">10. Limitation of Liability</h2>
            <p>
              To the fullest extent permitted by law, Solecraft shall not be liable for any indirect, incidental, or consequential damages arising from your use of the site or products. We are not responsible for delivery delays caused by external courier services or payment processing delays outside of our control.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#0f0f1a] mb-4">11. Governing Law</h2>
            <p>
              These Terms of Service are governed by and construed in accordance with the laws of Pakistan.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#0f0f1a] mb-4">12. Changes to Terms</h2>
            <p>
              We reserve the right to modify these Terms of Service at any time. Your continued use of the website following any changes constitutes your acceptance of the new terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#0f0f1a] mb-4">13. Contact Us</h2>
            <p>
              If you have any questions regarding these Terms of Service, please contact us at:
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
