import React from 'react';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';

export default function ShopByCategory() {
  const categories = [
    {
      title: "Men",
      image: "/assets/images/home/sneakers.png",
      bg: "bg-[#f5f3ff]",
    },
    {
      title: "Women",
      image: "/assets/images/home/sneakers.png",
      bg: "bg-[#f5f3ff]",
    },
    {
      title: "Kids",
      image: "/assets/images/home/sneakers.png",
      bg: "bg-[#f5f3ff]",
    }
  ];

  return (
    <section className="w-full">
      <div className="flex flex-col lg:flex-row gap-12 items-start lg:items-center">
        
        {/* Left Content */}
        <div className="lg:w-1/4 pb-8 shrink-0">
          <p className="text-[#6C5CE7] tracking-widest font-bold text-[0.7rem] uppercase mb-4">
            Shop By Category
          </p>
          <h2 className="text-[#0f0f1a] font-extrabold text-5xl leading-[1.05] tracking-[-0.03em] mb-6">
            Find Your<br />Perfect Pair
          </h2>
          <p className="text-gray-500 text-base leading-relaxed mb-8 max-w-[90%]">
            Explore our curated collection of sneakers for men, women and kids.
          </p>
          <button className="bg-[#0f0f1a] text-white rounded-xl flex items-center justify-center gap-3 px-8 py-4 text-sm font-semibold transition-transform hover:-translate-y-0.5 group w-fit">
            Explore All
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>

        {/* Cards */}
        <div className="lg:w-3/4 w-full grid grid-cols-1 sm:grid-cols-3 gap-6">
          {categories.map((cat, i) => (
            <div key={i} className="group cursor-pointer">
              <div className={`${cat.bg} rounded-3xl relative overflow-hidden aspect-[4/5] flex items-center justify-center mb-5`}>
                <div className="relative w-4/5 h-4/5 transition-transform duration-500 group-hover:scale-105 group-hover:-translate-y-2">
                  <Image 
                    src={cat.image} 
                    alt={cat.title}
                    fill
                    className="object-contain drop-shadow-2xl"
                  />
                </div>
              </div>
              <div className="px-2">
                <h3 className="text-[#0f0f1a] font-extrabold text-2xl mb-2">{cat.title}</h3>
                <span className="text-[#6C5CE7] font-semibold text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                  Shop Now <ArrowRight className="w-4 h-4" />
                </span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
