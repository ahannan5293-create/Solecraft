'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { ArrowRight, Leaf, Award, Truck, Headset } from 'lucide-react';
import { Plus_Jakarta_Sans } from 'next/font/google';
import styles from './ShopHero.module.css';

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '600', '800'],
});

export default function ShopHero() {
  const stageRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [isReducedMotion, setIsReducedMotion] = useState(false);
  const [isDesktop, setIsDesktop] = useState(true);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setIsReducedMotion(mediaQuery.matches);
    const listener = (e: MediaQueryListEvent) => setIsReducedMotion(e.matches);
    mediaQuery.addEventListener('change', listener);

    const checkDesktop = () => setIsDesktop(window.innerWidth >= 768);
    checkDesktop();
    window.addEventListener('resize', checkDesktop);

    return () => {
      mediaQuery.removeEventListener('change', listener);
      window.removeEventListener('resize', checkDesktop);
    };
  }, []);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsPaused(false);
        } else {
          setIsPaused(true);
        }
      },
      { threshold: 0 }
    );
    observer.observe(stage);
    return () => observer.disconnect();
  }, []);



  const layers = [
    { name: 'big-sphere', z: 3, file: 'big-sphere.png', outer: styles.outerBigSphere, inner: styles.animBigSphere, priority: true, mobile: true, width: '60%', height: '60%', top: '0', left: '33%' },
    { name: 'glass-arc', z: 4, file: 'glass-arc.png', outer: styles.outerGlassArc, inner: styles.animGlassArc, priority: false, mobile: false, width: '40%', height: '40%', top: '15%', left: '38%' },
    { name: 'spring', z: 5, file: 'spring.png', outer: styles.outerSpring, inner: styles.animSpring, priority: false, mobile: false, width: '30%', height: '30%', top: '33%', left: '35%' },
    { name: 'chrome-ball', z: 6, file: 'chrome-ball.png', outer: styles.outerChromeBall, inner: styles.animChromeBall, priority: false, mobile: false, width: '30%', height: '30%', top: '27%', left: '37.5%' },
    { name: 'capsule', z: 7, file: 'capsule.png', outer: styles.outerCapsule, inner: styles.animCapsule, priority: false, mobile: false, width: '32%', height: '32%', top: '36.5%', left: '58%' },
    { name: 'torus-ring', z: 8, file: 'torus-ring.png', outer: styles.outerTorusRing, inner: styles.animTorusRing, priority: false, mobile: true, width: '25%', height: '25%', top: '30%', left: '72%' },
    { name: 'ring-small', z: 9, file: 'ring-small.png', outer: styles.outerRingSmall, inner: styles.animRingSmall, priority: false, mobile: false, width: '25%', height: '25%', top: '53%', left: '72%' },
    { name: 'bubble-small', z: 11, file: 'bubble-small.png', outer: styles.outerBubbleSmall, inner: styles.animBubbleSmall, priority: false, mobile: true, width: '30%', height: '30%', top: '13%', left: '67%' },
    { name: 'bubble-core', z: 12, file: 'bubble-core.png', outer: styles.outerBubbleCore, inner: styles.animBubbleCore, priority: false, mobile: true, width: '17%', height: '17%', top: '17%', left: '69%' },
    { name: 'sneaker', z: 13, file: 'sneaker.png', outer: styles.outerSneaker, inner: styles.animSneaker, priority: true, mobile: true, width: '50%', height: '50%', top: '18%', left: '37%' },
  ];

  return (
    <section className={`w-full overflow-hidden bg-white relative ${plusJakarta.className}`}>

      {/* Container below 1024px stacks vertically. Above 1024px, it's layered */}
      <div className={`mx-auto px-6 lg:px-12 relative flex flex-col lg:block ${styles.heroWrap}`}>

        {/* Bubble Standalone (hidden on mobile) */}
        <div className={`w-[150cqw] translate-x-[-10cqw] hidden lg:block ${styles.bubbleLargeStandalone} ${styles.animBubbleLarge} pointer-events-none`}>
          <Image src="/assets/images/shop/bubble-large.png" alt="" fill className="object-contain" sizes="14vw" />
        </div>

        {/* Mobile / Tablet text block (stacked on top <1024px) */}
        <div className="block lg:hidden w-full pt-12 pb-8 z-20 relative text-center flex flex-col items-center">
          <p className="text-[#6C5CE7] tracking-[0.2em] font-semibold text-sm uppercase mb-4">
            Step Into More
          </p>
          <h1 className="text-[#0f0f1a] font-extrabold text-[9vw] leading-[1.05] tracking-[-0.03em] mb-4">
            Premium Sneakers<br />for Every Style
          </h1>
          <p className="text-gray-500 text-base leading-relaxed mb-8 max-w-[90%] mx-auto">
            Discover the latest collection of sneakers, designed for comfort, style and performance.
          </p>
          <button className="bg-[#0f0f1a] text-white flex items-center justify-center gap-3 px-8 py-4 text-sm font-semibold transition-transform hover:-translate-y-0.5 group rounded-xl">
            Shop Now
            <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
          </button>
        </div>

        {/* Stage Wrapper */}
        <div
          className={`w-full ${styles.heroStageWrap} z-10`}
        >
          <div
            ref={stageRef}
            className={`w-[150%] shrink-0 max-w-none lg:w-[100cqw] translate-x-[-13%] lg:translate-x-[-10%] aspect-[3/2] relative ${styles.stage} ${isPaused ? styles.paused : ''}`}
          >
            {/* Background image (z=1) */}
            <div className="absolute inset-0 z-[1] w-full h-full pointer-events-none">
              <Image
                src="/assets/images/shop/background.png"
                alt=""
                fill
                priority
                className="object-contain"
                sizes="(max-width: 1536px) 100vw, 1536px"
                aria-hidden="true"
              />
            </div>

            {/* Soft shadow (z=2) */}
            <div className="absolute z-[2] w-full h-full pointer-events-none" style={{ inset: 0 }}>
              <div className={`absolute inset-0 w-full h-full ${styles.innerShadow}`}>
                <div
                  className="absolute rounded-full"
                  style={{
                    left: '48%',
                    top: '84%',
                    width: '30cqw',
                    height: '4cqw',
                    transform: 'translate(-50%, -50%)',
                    background: 'radial-gradient(ellipse, rgba(90,70,200,0.35) 0%, transparent 70%)',
                    filter: 'blur(4px)',
                  }}
                />
              </div>
            </div>

            {/* Render all layer images */}
            {layers.map((layer) => (
              <div
                key={layer.name}
                className={`absolute pointer-events-none z-[${layer.z}] ${!layer.mobile ? 'hidden lg:block' : ''}`}
                style={{ zIndex: layer.z, position: 'absolute', inset: 0, width: '100%', height: '100%' }}
              >
                <div
                  className={`${styles.outer} ${layer.outer}`}
                  style={{ position: 'absolute', width: layer.width, height: layer.height, top: layer.top, left: layer.left }}
                >
                  <div
                    className={`${styles.inner} ${layer.inner}`}
                    style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
                  >
                    <Image
                      src={`/assets/images/shop/${layer.file}`}
                      alt=""
                      fill
                      priority={layer.priority}
                      loading={layer.priority ? undefined : "lazy"}
                      className="object-contain"
                      sizes="(max-width: 1536px) 100vw, 1536px"
                      aria-hidden="true"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>

        {/* Mobile / Tablet Features Grid */}
        <div className="flex lg:hidden grid grid-cols-2 gap-y-8 gap-x-4 pb-12 pt-4 bg-white z-20 relative border-t border-gray-100 mt-8">
          <div className="flex flex-col items-center text-center gap-3">
            <div className="flex items-center justify-center rounded-full bg-[#f4f2ff] w-12 h-12">
              <Leaf className="text-[#6C5CE7] w-6 h-6" strokeWidth={1.5} />
            </div>
            <div>
              <div className="text-[#0f0f1a] font-bold text-sm">Premium Quality</div>
              <div className="text-gray-500 text-xs">Built to last</div>
            </div>
          </div>

          <div className="flex flex-col items-center text-center gap-3">
            <div className="flex items-center justify-center rounded-full bg-[#f4f2ff] w-12 h-12">
              <Award className="text-[#6C5CE7] w-6 h-6" strokeWidth={1.5} />
            </div>
            <div>
              <div className="text-[#0f0f1a] font-bold text-sm">Trend-Forward Styles</div>
              <div className="text-gray-500 text-xs">Modern designs</div>
            </div>
          </div>

          <div className="flex flex-col items-center text-center gap-3">
            <div className="flex items-center justify-center rounded-full bg-[#f4f2ff] w-12 h-12">
              <Truck className="text-[#6C5CE7] w-6 h-6" strokeWidth={1.5} />
            </div>
            <div>
              <div className="text-[#0f0f1a] font-bold text-sm">Secure Shopping</div>
              <div className="text-gray-500 text-xs">100% protected</div>
            </div>
          </div>

          <div className="flex flex-col items-center text-center gap-3">
            <div className="flex items-center justify-center rounded-full bg-[#f4f2ff] w-12 h-12">
              <Headset className="text-[#6C5CE7] w-6 h-6" strokeWidth={1.5} />
            </div>
            <div>
              <div className="text-[#0f0f1a] font-bold text-sm">24/7 Support</div>
              <div className="text-gray-500 text-xs">We're here to help</div>
            </div>
          </div>
        </div>

      </div>

      {/* Desktop Absolute Overlay Layer for Text/Stats */}
      <div className="hidden lg:block absolute inset-0 z-20 pointer-events-none">
        <div className="max-w-[1400px] mx-auto px-12 relative w-full h-full flex items-center justify-between">

          {/* Desktop Text Overlay */}
          <div className="flex flex-col pointer-events-auto max-w-[30%]">
            <p className="text-[#6C5CE7] tracking-[0.2em] font-semibold text-[1cqw] uppercase mb-[1cqw]">
              Step Into More
            </p>
            <h1 className="text-[#0f0f1a] font-extrabold text-[3.2cqw] leading-[1.05] tracking-[-0.03em] mb-[1.2cqw]">
              Premium Sneakers<br />for Every Style
            </h1>
            <p className="text-gray-500 text-[1.1cqw] leading-relaxed mb-[2.5cqw] max-w-[85%]">
              Discover the latest collection of sneakers, designed for comfort, style and performance.
            </p>
            <button className="bg-[#0f0f1a] text-white flex items-center justify-center gap-2 text-[0.95cqw] font-semibold transition-transform hover:-translate-y-0.5 group rounded-xl"
              style={{ width: '10cqw', height: '4.2cqw' }}
            >
              Shop Now
              <ArrowRight className="w-[1.2cqw] h-[1.2cqw] transition-transform group-hover:translate-x-1" />
            </button>
          </div>

          {/* Desktop Stats Overlay */}
          <div className="flex flex-col gap-[2.2cqw] pointer-events-auto">
            <div className="flex items-center gap-[1.2cqw]">
              <div className="flex items-center justify-center rounded-full bg-[#f4f2ff] w-[4cqw] h-[4cqw] shrink-0">
                <Leaf className="text-[#6C5CE7] w-[2cqw] h-[2cqw]" strokeWidth={1.5} />
              </div>
              <div className="flex flex-col">
                <span className="text-[#0f0f1a] font-bold text-[1cqw]">Premium Quality</span>
                <span className="text-gray-500 text-[0.85cqw]">Built to last</span>
              </div>
            </div>

            <div className="flex items-center gap-[1.2cqw]">
              <div className="flex items-center justify-center rounded-full bg-[#f4f2ff] w-[4cqw] h-[4cqw] shrink-0">
                <Award className="text-[#6C5CE7] w-[2cqw] h-[2cqw]" strokeWidth={1.5} />
              </div>
              <div className="flex flex-col">
                <span className="text-[#0f0f1a] font-bold text-[1cqw]">Trend-Forward Styles</span>
                <span className="text-gray-500 text-[0.85cqw]">Modern designs</span>
              </div>
            </div>

            <div className="flex items-center gap-[1.2cqw]">
              <div className="flex items-center justify-center rounded-full bg-[#f4f2ff] w-[4cqw] h-[4cqw] shrink-0">
                <Truck className="text-[#6C5CE7] w-[2cqw] h-[2cqw]" strokeWidth={1.5} />
              </div>
              <div className="flex flex-col">
                <span className="text-[#0f0f1a] font-bold text-[1cqw]">Secure Shopping</span>
                <span className="text-gray-500 text-[0.85cqw]">100% protected</span>
              </div>
            </div>

            <div className="flex items-center gap-[1.2cqw]">
              <div className="flex items-center justify-center rounded-full bg-[#f4f2ff] w-[4cqw] h-[4cqw] shrink-0">
                <Headset className="text-[#6C5CE7] w-[2cqw] h-[2cqw]" strokeWidth={1.5} />
              </div>
              <div className="flex flex-col">
                <span className="text-[#0f0f1a] font-bold text-[1cqw]">24/7 Support</span>
                <span className="text-gray-500 text-[0.85cqw]">We're here to help</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
