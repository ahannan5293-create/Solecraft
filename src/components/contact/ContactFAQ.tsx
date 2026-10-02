'use client';

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import StoreMap from './StoreMap';

const faqs = [
  {
    question: 'How long does shipping take?',
    answer: 'Standard shipping usually takes 3-5 business days. Express shipping is available at checkout for 1-2 business day delivery. International shipping times vary by location.'
  },
  {
    question: 'Can I return or exchange my order?',
    answer: 'Yes, we offer free returns and exchanges within 30 days of delivery. The item must be unworn and in its original packaging.'
  },
  {
    question: 'Do you ship internationally?',
    answer: 'Yes, we ship to over 50 countries worldwide. Shipping costs and delivery times are calculated at checkout based on your location.'
  },
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit cards (Visa, MasterCard, Amex), PayPal, Apple Pay, and Google Pay. We also offer buy now, pay later options in select countries.'
  }
];

export default function ContactFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="w-full bg-white py-16 lg:py-24">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        <div className="flex flex-col lg:flex-row gap-16 lg:gap-24">
          
          {/* Left: Map Area */}
          <div className="w-full lg:w-1/2 flex flex-col">
            <StoreMap />
          </div>

          {/* Right: FAQ */}
          <div className="w-full lg:w-1/2 flex flex-col justify-center">
            <p className="text-[#6C5CE7] tracking-[0.2em] font-semibold text-sm uppercase mb-4">
              QUICK QUESTIONS
            </p>
            <h2 className="text-[#0f0f1a] font-extrabold text-4xl lg:text-5xl leading-tight tracking-[-0.02em] mb-4">
              Frequently Asked<br/>Questions
            </h2>
            <p className="text-gray-500 text-base leading-relaxed mb-10 max-w-lg">
              Find answers to common questions about our products, shipping, returns and more.
            </p>

            <div className="flex flex-col gap-4">
              {faqs.map((faq, index) => {
                const isOpen = openIndex === index;
                return (
                  <div 
                    key={index} 
                    className={`border rounded-2xl transition-colors ${isOpen ? 'border-[#6C5CE7] bg-[#f7f8fb]' : 'border-gray-200 bg-white'}`}
                  >
                    <button
                      className="w-full flex items-center justify-between p-5 text-left"
                      onClick={() => toggleFaq(index)}
                    >
                      <span className="font-semibold text-[#0f0f1a] text-sm md:text-base pr-4">
                        {faq.question}
                      </span>
                      <ChevronDown 
                        className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180 text-[#6C5CE7]' : ''}`} 
                        strokeWidth={2}
                      />
                    </button>
                    
                    <div 
                      className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[200px] opacity-100' : 'max-h-0 opacity-0'}`}
                    >
                      <p className="px-5 pb-5 text-gray-500 text-sm leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
