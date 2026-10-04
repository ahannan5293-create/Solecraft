import React from 'react';
import ContactHero from '@/components/contact/ContactHero';
import ContactCards from '@/components/contact/ContactCards';
import ContactForm from '@/components/contact/ContactForm';
import ContactFAQ from '@/components/contact/ContactFAQ';
import Newsletter from '@/components/home/Newsletter';

import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Us | Solecraft',
  description: 'Get in touch with the Solecraft team. We are here to help with any questions, orders, or support you may need. We strive to reply within 24 hours.',
  openGraph: {
    title: 'Contact Us | Solecraft',
    description: 'Get in touch with the Solecraft team. We are here to help with any questions, orders, or support you may need. We strive to reply within 24 hours.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Contact Us | Solecraft',
    description: 'Get in touch with the Solecraft team. We are here to help with any questions, orders, or support you may need. We strive to reply within 24 hours.',
  }
};

export default function ContactPage() {
  return (
    <main className="w-full flex flex-col bg-white">
      <ContactHero />
      <ContactCards />
      <ContactForm />
      <ContactFAQ />
      
      {/* Reusing Newsletter from Home */}
      <div className="pt-8 pb-16 px-6 lg:px-12 max-w-[1400px] mx-auto w-full">
        <Newsletter variant="dark" />
      </div>
    </main>
  );
}
