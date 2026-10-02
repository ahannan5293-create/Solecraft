'use client';

import React from 'react';
import Image from 'next/image';
import { ArrowRight, ShieldCheck, Truck, Heart } from 'lucide-react';

export default function ContactForm() {
  const trustBadges = [
    { icon: <ShieldCheck className="w-6 h-6 mb-3 text-[#0f0f1a]" />, text: '100% Secure' },
    { icon: <Truck className="w-6 h-6 mb-3 text-[#0f0f1a]" />, text: 'Fast Support' },
    { icon: <Heart className="w-6 h-6 mb-3 text-[#0f0f1a]" />, text: 'Customer First' },
  ];

  return (
    <section className="w-full bg-white pb-16 lg:pb-24">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        <div className="flex flex-col lg:flex-row gap-16 lg:gap-24">

          {/* Left: Form */}
          <div className="w-full lg:w-1/2 flex flex-col justify-center">
            <p className="text-[#6C5CE7] tracking-[0.2em] font-semibold text-sm uppercase mb-4">
              SEND US A MESSAGE
            </p>
            <h2 className="text-[#0f0f1a] font-extrabold text-4xl lg:text-5xl leading-tight tracking-[-0.02em] mb-4">
              Let's Talk
            </h2>
            <p className="text-gray-500 text-base leading-relaxed mb-10 max-w-lg">
              Have a question, feedback or just want to say hi? We'd love to hear from you.
            </p>

            <form className="flex flex-col gap-5">
              <div className="flex flex-col md:flex-row gap-5">
                <input
                  type="text"
                  placeholder="Full Name"
                  className="w-full bg-white border border-gray-200 rounded-xl px-5 py-4 text-sm outline-none focus:border-[#6C5CE7] focus:ring-1 focus:ring-[#6C5CE7] transition-all"
                />
                <input
                  type="email"
                  placeholder="Email Address"
                  className="w-full bg-white border border-gray-200 rounded-xl px-5 py-4 text-sm outline-none focus:border-[#6C5CE7] focus:ring-1 focus:ring-[#6C5CE7] transition-all"
                />
              </div>
              <div className="relative">
                <select className="w-full bg-white border border-gray-200 rounded-xl px-5 py-4 text-sm outline-none focus:border-[#6C5CE7] focus:ring-1 focus:ring-[#6C5CE7] transition-all appearance-none text-gray-500">
                  <option value="" disabled selected>Subject</option>
                  <option value="support">General Support</option>
                  <option value="returns">Returns & Exchanges</option>
                  <option value="shipping">Shipping Status</option>
                  <option value="other">Other</option>
                </select>
                <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 1.5L6 6.5L11 1.5" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>
              <textarea
                placeholder="Your Message"
                rows={5}
                className="w-full bg-white border border-gray-200 rounded-xl px-5 py-4 text-sm outline-none focus:border-[#6C5CE7] focus:ring-1 focus:ring-[#6C5CE7] transition-all resize-none"
              ></textarea>
              <button
                type="button"
                className="bg-[#6C5CE7] text-white rounded-xl flex items-center justify-center gap-3 px-8 py-4 text-sm font-semibold transition-transform hover:-translate-y-0.5 group w-fit mt-2"
              >
                Send Message
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </button>
            </form>
          </div>

          {/* Right: Graphic & Badges */}
          <div className="w-full lg:w-1/2 flex flex-col items-center">
            {/* Graphic Box */}
            <div className="w-full aspect-square md:aspect-[4/3] lg:aspect-square bg-[#f7f8fb] rounded-3xl relative overflow-hidden flex items-center justify-center mb-8">
              <div className="relative w-[110%] h-[110%] -mt-10">
                <Image src="/assets/images/contact/contact-v2.png" alt="Contact Us" fill className="object-contain drop-shadow-xl" priority />
              </div>
            </div>

            {/* Badges Row */}
            <div className="flex w-full justify-between px-4 md:px-10">
              {trustBadges.map((badge, i) => (
                <div key={i} className="flex flex-col items-center justify-center text-center">
                  {badge.icon}
                  <span className="text-xs font-semibold text-gray-600">{badge.text}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
