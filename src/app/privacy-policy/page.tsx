import React from 'react'

import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | Solecraft',
  description: 'Learn how Solecraft collects, uses, and protects your personal data. We are committed to ensuring your privacy and security online.',
  openGraph: {
    title: 'Privacy Policy | Solecraft',
    description: 'Learn how Solecraft collects, uses, and protects your personal data. We are committed to ensuring your privacy and security online.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Privacy Policy | Solecraft',
    description: 'Learn how Solecraft collects, uses, and protects your personal data. We are committed to ensuring your privacy and security online.',
  }
};

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-[720px] mx-auto px-6 py-16 md:py-24">
        <h1 className="text-3xl md:text-4xl font-extrabold text-[#0f0f1a] mb-4">Privacy Policy</h1>
        <p className="text-sm font-semibold text-gray-500 mb-12 uppercase tracking-wider">
          Last updated: October 3, 2026
        </p>
        
        <div className="prose prose-gray max-w-none text-gray-600 leading-relaxed space-y-8">
          
          <section>
            <h2 className="text-xl font-bold text-[#0f0f1a] mb-4">1. Introduction</h2>
            <p>
              Welcome to Solecraft ("we", "us", "our"). This Privacy Policy explains what information we collect when you use our website, how we use it, and how we keep it safe. By accessing or using our website, you agree to the collection and use of your information in accordance with this policy.
            </p>
          </section>
          
          <section>
            <h2 className="text-xl font-bold text-[#0f0f1a] mb-4">2. Information We Collect</h2>
            <p>
              We collect information to provide you with a smooth and reliable shopping experience. This includes:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-2">
              <li><strong>Account Information:</strong> Your username, email address, and full name (if provided) when you sign up using your email or via Google OAuth.</li>
              <li><strong>Address Information:</strong> Any shipping addresses you save in your account for faster checkout.</li>
              <li><strong>Order History:</strong> A record of the items you have purchased and your order contents.</li>
              <li><strong>Contact Information:</strong> Your phone number, which is required for Cash on Delivery (COD) orders and optional otherwise.</li>
              <li><strong>Payment Information:</strong> For card payments, your card details are entered directly on Safepay's secure payment page. <strong>We do not receive, see, or store your credit or debit card details on Solecraft's servers.</strong> We only receive a payment reference and confirmation status from Safepay.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#0f0f1a] mb-4">3. How We Use Your Information</h2>
            <p>
              We strictly use your information for the operation of our store, including: fulfilling your orders, managing your account, providing order tracking and status updates, offering customer support, and improving the site's functionality. 
            </p>
            <p className="mt-2 font-semibold text-[#0f0f1a]">
              We do not sell your personal data to any third parties.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#0f0f1a] mb-4">4. Data Storage & Security</h2>
            <p>
              Your data is stored securely using Supabase, which hosts our database in Singapore. Your data is protected by strict access controls (Row Level Security), ensuring that you can only access your own personal data. All data transmitted between your device and our servers is encrypted in transit using HTTPS.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#0f0f1a] mb-4">5. Third-Party Services</h2>
            <p>
              We use a minimal set of trusted third-party services to operate Solecraft:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-2">
              <li><strong>Supabase:</strong> Provides our database, hosting, and secure authentication (login) infrastructure.</li>
              <li><strong>Google:</strong> Provides optional sign-in capabilities (Google OAuth).</li>
              <li><strong>Safepay:</strong> Processes all secure card payments in Pakistan (currently inactive).</li>
              <li><strong>Resend:</strong> Used to send transactional emails (e.g., order confirmations).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#0f0f1a] mb-4">6. Cookies</h2>
            <p>
              We use strictly necessary session cookies to keep you securely signed in to your account. <strong>We do not use any third-party advertising or tracking cookies.</strong> Your browsing activity on Solecraft is not tracked for marketing purposes.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#0f0f1a] mb-4">7. Your Rights</h2>
            <p>
              We voluntarily allow you to view, edit, or update your account information and saved shipping addresses at any time directly through your account dashboard. If you wish to permanently delete your account and associated data, you can request data deletion by contacting our customer support team.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#0f0f1a] mb-4">8. Data Retention</h2>
            <p>
              We retain your account data for as long as your account remains active. Order records are retained as needed for legitimate business, tax, and accounting purposes.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#0f0f1a] mb-4">9. Children's Privacy</h2>
            <p>
              Solecraft is not intended for users under the age of 18. We do not knowingly collect personal information from minors.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#0f0f1a] mb-4">10. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time to reflect changes in our practices. Material changes will be indicated by a revised "Last updated" date at the top of this page.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#0f0f1a] mb-4">11. Contact Us</h2>
            <p>
              If you have any questions or concerns about this Privacy Policy, please contact us at:
            </p>
            <p className="mt-2 font-medium text-[#6C5CE7]">
              privacy@solecraft.com
            </p>
          </section>

        </div>
      </div>
    </main>
  )
}
