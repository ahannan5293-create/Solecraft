'use client';

import React from 'react';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import styles from './PromoBanner.module.css';

export default function PromoBanner() {
  return (
    <div className="w-full relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#ece9ff] to-[#e1dbff] min-h-[320px] flex items-center px-8 lg:px-16 mb-24 border border-[#e1dbff]">

      {/* Left side text content */}
      <div className="relative z-10 w-full lg:w-1/2 py-10">
        <p className="text-[#6C5CE7] tracking-widest font-bold text-xs uppercase mb-3">
          LIMITED TIME
        </p>
        <h2 className="text-[#0f0f1a] font-extrabold text-4xl sm:text-5xl lg:text-[3.5rem] leading-[1.05] tracking-[-0.03em] mb-4">
          Up to 40% Off
        </h2>
        <p className="text-gray-600 text-base sm:text-lg leading-relaxed mb-8 max-w-[400px]">
          Upgrade your style with our exclusive collection. Don't miss out!
        </p>
        <button className="bg-[#0f0f1a] text-white flex items-center justify-center gap-3 px-8 py-4 text-sm font-semibold transition-transform hover:-translate-y-0.5 group rounded-xl w-fit">
          Shop Sale
          <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
        </button>
      </div>

      {/* Right side images */}
      <div className="hidden lg:block absolute inset-y-0 right-0 w-1/2 overflow-hidden pointer-events-none">
        <div className="relative w-full h-full">

          {/* Sneaker */}
          <div className={`absolute right-12 top-1/2 -translate-y-1/2 w-[450px] h-[350px] z-10 ${styles.floatAnim} ${styles.floatAnimSneaker}`}>
            <Image
              src="/assets/images/shop/sneaker.png"
              alt=""
              fill
              className="object-contain drop-shadow-2xl"
              sizes="450px"
            />
          </div>

          {/* Bubble Large (reusing core) */}
          <div className={`absolute right-[8%] top-[15%] w-24 h-24 z-0 ${styles.floatAnim} ${styles.floatAnim1}`}>
            <Image
              src="/assets/images/shop/bubble-core.png"
              alt=""
              fill
              className="object-contain opacity-70 blur-[1px]"
              sizes="96px"
            />
          </div>

          {/* Ring */}
          <div className={`absolute right-[3%] bottom-[-55%] w-150 h-150 z-20 rotate-[-30deg] ${styles.floatAnim} ${styles.floatAnim2}`}>
            <Image
              src="/assets/images/shop/ring-small.png"
              alt=""
              fill
              className="object-contain opacity-80"
              sizes="128px"
            />
          </div>

          {/* Bubble Small */}
          <div className={`absolute right-[50%] top-[20%] w-70 h-70 z-0 ${styles.floatAnim} ${styles.floatAnim3}`}>
            <Image
              src="/assets/images/shop/bubble-small.png"
              alt=""
              fill
              className="object-contain opacity-90"
              sizes="48px"
            />
          </div>

          {/* Chrome Ball */}
          <div className={`absolute right-[10%] bottom-[60%] w-40 h-40 z-0 ${styles.floatAnim} ${styles.floatAnim3}`}>
            <Image
              src="/assets/images/shop/chrome-ball.png"
              alt=""
              fill
              className="object-contain opacity-80"
              sizes="80px"
            />
          </div>

          {/* Torus Ring */}
          <div className={`absolute right-[15%] top-[60%] w-28 h-28 z-20 ${styles.floatAnim} ${styles.floatAnim1}`}>
            <Image
              src="/assets/images/shop/torus-ring.png"
              alt=""
              fill
              className="object-contain opacity-80"
              sizes="112px"
            />
          </div>

        </div>
      </div>

    </div>
  );
}
