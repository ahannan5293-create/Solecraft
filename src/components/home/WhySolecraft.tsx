import React from 'react';
import { ArrowRight, Star } from 'lucide-react';

export default function WhySolecraft() {
  return (
    <section className="w-full bg-white rounded-3xl p-12 lg:p-20 border border-gray-100 shadow-sm flex flex-col items-center text-center">
      
      <p className="text-[#6C5CE7] tracking-widest font-bold text-[0.7rem] uppercase mb-4">
        Why Solecraft
      </p>
      
      <h2 className="text-[#0f0f1a] font-extrabold text-4xl lg:text-5xl leading-[1.1] tracking-[-0.03em] mb-6 max-w-2xl">
        More Than Just Sneakers
      </h2>
      
      <p className="text-gray-500 text-base leading-relaxed mb-8 max-w-2xl">
        At Solecraft, we're more than just a store — we're a community of sneaker lovers. We're here to bring you the best styles, the latest drops, and a space where your passion for sneakers lives.
      </p>
      
      <button className="text-[#6C5CE7] text-base font-semibold flex items-center gap-2 hover:text-[#5a4bd1] transition-colors group mb-16">
        Learn More
        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
      </button>

      {/* Stats row */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-12 sm:gap-24 w-full pt-12 border-t border-gray-100">
        
        <div className="flex flex-col items-center text-center">
          <h3 className="text-[#0f0f1a] font-extrabold text-4xl mb-1">10K+</h3>
          <p className="text-gray-400 text-sm font-medium">Happy Customers</p>
        </div>
        
        <div className="flex flex-col items-center text-center">
          <h3 className="text-[#0f0f1a] font-extrabold text-4xl mb-1">50+</h3>
          <p className="text-gray-400 text-sm font-medium">Exclusive Styles</p>
        </div>
        
        <div className="flex flex-col items-center text-center">
          <h3 className="text-[#0f0f1a] font-extrabold text-4xl mb-2">
            4.8/5
          </h3>
          <p className="text-gray-400 text-sm font-medium mb-3">Average Rating</p>
          <div className="flex gap-1 text-[#6C5CE7]">
            {[1,2,3,4,5].map(i => <Star key={i} className="w-4 h-4 fill-current" />)}
          </div>
        </div>

      </div>

    </section>
  );
}
