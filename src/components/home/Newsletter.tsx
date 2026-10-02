import React from 'react';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import styles from './HomeHero.module.css';

export default function Newsletter({ variant = 'light', title }: { variant?: 'light' | 'dark', title?: string }) {
  const isDark = variant === 'dark';

  if (isDark) {
    return (
      <section className="w-full relative overflow-hidden rounded-2xl bg-[#8a7ae5]">
        <div className="flex flex-col lg:flex-row items-center justify-between py-8 px-10 lg:px-12 relative z-10 w-full h-full min-h-[140px]">

          {/* Left Text */}
          <div className="w-full lg:w-auto relative z-20 flex-shrink-0 mb-6 lg:mb-0">
            <h2 className="text-white font-extrabold text-[32px] tracking-tight mb-1 leading-tight">
              {title || 'Join Our Community'}
            </h2>
            <p className="text-white/90 text-[15px] leading-relaxed max-w-[420px]">
              Be the first to know about new drops, exclusive offers and sneaker news.
            </p>
          </div>

          {/* Center Form */}
          <div className="w-full lg:w-auto relative z-20 flex-1 flex justify-start lg:justify-center lg:pr-24">
            <form className="flex w-full max-w-[440px] bg-white rounded-xl p-1.5 shadow-sm">
              <input
                type="email"
                placeholder="Your email address"
                className="flex-1 bg-transparent border-none outline-none px-5 text-sm text-gray-700 placeholder-gray-400"
                required
              />
              <button type="submit" className="bg-[#0f0f1a] text-white rounded-xl px-6 py-2.5 text-sm font-medium flex items-center gap-2 hover:bg-gray-800 transition-colors">
                Subscribe
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>

          {/* Right Images */}
          <div className="hidden lg:block absolute right-0 top-0 bottom-0 w-64 pointer-events-none">
            <div className={`absolute right-[12] top-[-110] w-100 h-100 ${styles.animBubbleSmall}`}>
              <Image src="/assets/images/shop/bubble-small.png" alt="" fill className="object-contain" />
            </div>
            <div className={`absolute right-2 -bottom-38 w-150 h-150 ${styles.animRingSmall}`}>
              <Image src="/assets/images/shop/ring-small.png" alt="" fill className="object-contain" />
            </div>
          </div>

        </div>
      </section>
    );
  }

  // Light variant
  return (
    <section className="w-full relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#ece9ff] to-[#e1dbff] border border-[#e1dbff]">
      <div className="flex flex-col lg:flex-row items-center justify-between p-10 lg:p-16 relative z-10">

        {/* Left */}
        <div className="lg:w-1/2 w-full mb-8 lg:mb-0 relative z-20">
          <h2 className="text-[#0f0f1a] font-extrabold text-3xl md:text-4xl tracking-[-0.03em] mb-3">
            {title || 'Stay in the Loop'}
          </h2>
          <p className="text-gray-600 text-sm leading-relaxed max-w-sm mb-8">
            Get the latest drops, exclusive offers and sneaker news straight to your inbox.
          </p>

          <form className="flex w-full max-w-md bg-white rounded-xl p-1.5 shadow-sm">
            <input
              type="email"
              placeholder="Your email address..."
              className="flex-1 bg-transparent border-none outline-none px-6 text-sm text-gray-700 placeholder-gray-400"
              required
            />
            <button type="submit" className="bg-[#0f0f1a] text-white rounded-xl px-6 py-3 text-xs font-semibold flex items-center gap-2 hover:bg-gray-800 transition-colors">
              Subscribe
              <ArrowRight className="w-3 h-3" />
            </button>
          </form>
        </div>

        {/* Right Images */}
        <div className="hidden lg:block absolute right-0 top-0 bottom-0 w-1/3 pointer-events-none">
          <div className={`absolute right-12 top-[10%] w-32 h-32 ${styles.animBigSphere}`}>
            <Image src="/assets/images/home/big-sphere.png" alt="" fill className="object-contain opacity-90" />
          </div>
          <div className={`absolute right-32 bottom-[-10%] w-48 h-48 ${styles.animGlassArc}`}>
            <Image src="/assets/images/home/glass-arc.png" alt="" fill className="object-contain opacity-80" />
          </div>
        </div>

      </div>
    </section>
  );
}
