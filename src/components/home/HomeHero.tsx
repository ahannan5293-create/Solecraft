'use client';

import React, { useRef, useState, useEffect } from 'react';
import Image from 'next/image';
import { ArrowRight, Truck, ShieldCheck, RefreshCcw } from 'lucide-react';
import { Plus_Jakarta_Sans } from 'next/font/google';
import styles from './HomeHero.module.css';

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
});

export default function HomeHero() {
  const stageRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        setIsPaused(!entries[0].isIntersecting);
      },
      { threshold: 0.1 }
    );

    observer.observe(stage);
    return () => observer.disconnect();
  }, []);

  const layers = [
    { name: 'big-sphere', z: 3, file: 'big-sphere.png', outer: styles.outer, inner: styles.animBigSphere, width: '57%', height: '57%', top: '0', left: '25%', rotate: 0 },
    { name: 'glass-arc', z: 4, file: 'glass-arc.png', outer: styles.outer, inner: '', width: '40%', height: '40%', top: '2.5%', left: '25%', rotate: 0 },
    { name: 'glass-disc', z: 5, file: 'glass-disc-sphere.png', outer: styles.outer, inner: '', width: '50%', height: '50%', top: '35%', left: '-26%', rotate: 0 },
    { name: 'torus', z: 6, file: 'torus.png', outer: styles.outer, inner: styles.animTorus, width: '22%', height: '22%', top: '25%', left: '65%', rotate: 20 },
    { name: 'chrome-ball', z: 7, file: 'chrome-ball.png', outer: styles.outer, inner: '', width: '22%', height: '22%', top: '41.5%', left: '35%', rotate: 0 },
    { name: 'glass-cone', z: 8, file: 'glass-cone.png', outer: styles.outer, inner: '', width: '100%', height: '100%', top: '-10%', left: '2%', rotate: -3 },
    { name: 'spring', z: 9, file: 'spring.png', outer: styles.outer, inner: '', width: '37%', height: '37%', top: '26%', left: '21%', rotate: 0 },
    { name: 'bubble-small', z: 11, file: 'bubble-small.png', outer: styles.outer, inner: styles.animBubble, width: '30%', height: '30%', top: '12%', left: '42%', rotate: 0 },
    { name: 'sneakers', z: 12, file: 'sneakers.png', outer: styles.outer, inner: styles.animSneaker, width: '58%', height: '58%', top: '6%', left: '24%', rotate: -12 },
  ];

  return (
    <section className={`w-full overflow-hidden relative ${plusJakarta.className}`}>

      {/* Container below 1024px stacks vertically. Above 1024px, it's layered */}
      <div className={`mx-auto px-6 lg:px-12 relative flex flex-col lg:block ${styles.heroWrap}`}>

        {/* Mobile / Tablet text block (stacked on top <1024px) */}
        <div className="block lg:hidden w-full pt-12 pb-8 z-20 relative text-center flex flex-col items-center">
          <p className="text-[#6C5CE7] tracking-[0.2em] font-semibold text-sm uppercase mb-4">
            Step Into More
          </p>
          <h1 className="text-[#0f0f1a] font-extrabold text-[9vw] leading-[1.05] tracking-[-0.03em] mb-4">
            Premium Sneakers<br />for Every Style
          </h1>
          <p className="text-gray-500 text-base leading-relaxed mb-8 max-w-[90%] mx-auto">
            Discover the perfect blend of comfort, style and performance. Step into a world where every pair tells your story.
          </p>
          <button className="bg-[#0f0f1a] text-white rounded-xl flex items-center justify-center gap-3 px-8 py-4 text-sm font-semibold transition-transform hover:-translate-y-0.5 group">
            Shop Now
            <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
          </button>
        </div>

        {/* Stage Wrapper */}
        <div className={`w-full ${styles.heroStageWrap} z-10`}>
          <div ref={stageRef} className={`w-[170%] shrink-0 max-w-none lg:w-[130cqw] translate-x-[-3%] lg:translate-x-[12%] aspect-[3/2] relative ${styles.stage} ${isPaused ? styles.paused : ''}`}>

            {/* Background image (z=1) */}
            <div
              className="absolute z-[1] pointer-events-none"
              style={{ width: '90%', height: '90%', top: '0%', left: '5%' }}
            >
              <Image
                src="/assets/images/home/background-v2.png"
                alt="Background"
                fill
                className="object-contain"
                style={{ transform: 'rotate(0deg) scale(1.2)' }}
                sizes="(max-width: 1536px) 100vw, 1536px"
                priority
              />
            </div>

            {/* 3D Layers */}
            {layers.map((layer) => (
              <div key={layer.name} className={layer.outer} style={{ zIndex: layer.z }}>
                <div className={`absolute ${layer.inner}`} style={{ width: layer.width, height: layer.height, top: layer.top, left: layer.left }}>
                  <Image
                    src={`/assets/images/home/${layer.file}`}
                    alt={layer.name}
                    fill
                    className="object-contain"
                    style={{ transform: `rotate(${layer.rotate || 0}deg)` }}
                    sizes="(max-width: 1536px) 100vw, 1536px"
                    priority
                  />
                </div>
              </div>
            ))}

          </div>
        </div>
      </div>

      {/* Desktop Absolute Overlays - MOVED OUTSIDE heroWrap to avoid double padding */}
      <div className="absolute inset-0 pointer-events-none hidden lg:block z-20">
        <div className="max-w-[1400px] h-full mx-auto relative px-6 lg:px-12">

          {/* Desktop Text Overlay */}
          <div className="absolute left-6 lg:left-12 top-1/2 -translate-y-[60%] w-[40%] pointer-events-auto">
            <p className="text-[#6C5CE7] tracking-[0.2em] font-semibold text-[1cqw] uppercase mb-4">
              Step Into More
            </p>
            <h1 className="text-[#0f0f1a] font-extrabold text-[4.5cqw] leading-[1.05] tracking-[-0.03em] mb-6">
              Premium Sneakers<br />for Every Style
            </h1>
            <p className="text-gray-500 text-[1.1cqw] leading-relaxed mb-8 max-w-[85%]">
              Discover the perfect blend of comfort, style and performance. Step into a world where every pair tells your story.
            </p>
            <button className="bg-[#0f0f1a] text-white rounded-xl flex items-center justify-center gap-3 px-[2cqw] py-[1cqw] text-[0.95cqw] font-semibold transition-transform hover:-translate-y-0.5 group w-fit">
              Shop Now
              <ArrowRight className="w-[1.2cqw] h-[1.2cqw] transition-transform group-hover:translate-x-1" />
            </button>
          </div>

          {/* Desktop Stats Overlay - Removed as per user request */}
        </div>
      </div>
    </section>
  );
}
