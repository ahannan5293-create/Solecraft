'use client';

import React, { useRef, useState, useEffect } from 'react';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { Plus_Jakarta_Sans } from 'next/font/google';
import styles from '../shop/ShopHero.module.css';

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
});

export default function ContactHero() {
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
    { name: 'big-sphere', z: 3, file: '/assets/images/shop/big-sphere.png', outer: styles.outerBigSphere, inner: styles.animBigSphere, priority: true, width: '60%', height: '60%', top: '0', left: '33%', rotate: 0 },
    { name: 'glass-arc', z: 4, file: '/assets/images/shop/glass-arc.png', outer: styles.outerGlassArc, inner: styles.animGlassArc, priority: false, width: '40%', height: '40%', top: '15%', left: '38%', rotate: 0 },
    { name: 'spring', z: 5, file: '/assets/images/shop/spring.png', outer: styles.outerSpring, inner: styles.animSpring, priority: false, width: '30%', height: '30%', top: '33%', left: '35%', rotate: 0 },
    { name: 'chrome-ball', z: 6, file: '/assets/images/shop/chrome-ball.png', outer: styles.outerChromeBall, inner: styles.animChromeBall, priority: false, width: '30%', height: '30%', top: '27%', left: '37.5%', rotate: 0 },
    { name: 'capsule', z: 7, file: '/assets/images/shop/capsule.png', outer: styles.outerCapsule, inner: styles.animCapsule, priority: false, width: '32%', height: '32%', top: '36.5%', left: '58%', rotate: 0 },
    { name: 'torus-ring', z: 8, file: '/assets/images/shop/torus-ring.png', outer: styles.outerTorusRing, inner: styles.animTorusRing, priority: false, width: '25%', height: '25%', top: '30%', left: '72%', rotate: 0 },
    { name: 'ring-small', z: 9, file: '/assets/images/shop/ring-small.png', outer: styles.outerRingSmall, inner: styles.animRingSmall, priority: false, width: '25%', height: '25%', top: '53%', left: '72%', rotate: 0 },
    { name: 'bubble-small', z: 11, file: '/assets/images/shop/bubble-small.png', outer: styles.outerBubbleSmall, inner: styles.animBubbleSmall, priority: false, width: '30%', height: '30%', top: '13%', left: '67%', rotate: 0 },
    { name: 'bubble-core', z: 12, file: '/assets/images/shop/bubble-core.png', outer: styles.outerBubbleCore, inner: styles.animBubbleCore, priority: false, width: '17%', height: '17%', top: '17%', left: '69%', rotate: 0 },
    { name: 'sneaker', z: 13, file: '/assets/images/shop/sneaker.png', outer: styles.outerSneaker, inner: styles.animSneaker, priority: true, width: '50%', height: '50%', top: '18%', left: '37%', rotate: 0 },
  ];

  return (
    <section className={`w-full overflow-hidden relative ${plusJakarta.className}`}>

      {/* Container below 1024px stacks vertically. Above 1024px, it's layered */}
      <div className={`mx-auto px-6 lg:px-12 relative flex flex-col lg:block ${styles.heroWrap}`}>

        {/* Mobile / Tablet text block (stacked on top <1024px) */}
        <div className="block lg:hidden w-full pt-12 pb-8 z-20 relative text-center flex flex-col items-center">
          <p className="text-[#6C5CE7] tracking-[0.2em] font-semibold text-sm uppercase mb-4">
            GET IN TOUCH
          </p>
          <h1 className="text-[#0f0f1a] font-extrabold text-[9vw] leading-[1.05] tracking-[-0.03em] mb-4">
            We'd Love to<br />Hear From You
          </h1>
          <p className="text-gray-500 text-base leading-relaxed mb-8 max-w-[90%] mx-auto">
            Have a question, feedback or just want to say hi? Our team is here to help. Fill out the form or reach us through any of the channels below.
          </p>
          <button className="bg-[#0f0f1a] text-white rounded-xl flex items-center justify-center gap-3 px-8 py-4 text-sm font-semibold transition-transform hover:-translate-y-0.5 group">
            Send a Message
            <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
          </button>
        </div>

        {/* Stage Wrapper */}
        <div className={`w-full ${styles.heroStageWrap} z-10`}>
          {/* Shifted the whole stage to the right by modifying translate-x */}
          <div ref={stageRef} className={`w-[170%] shrink-0 max-w-none lg:w-[110cqw] translate-x-[-15%] lg:translate-x-[20%] aspect-[3/2] relative ${styles.stage} ${isPaused ? styles.paused : ''}`}>

            {/* Background image (z=1) */}
            <div className="absolute inset-0 z-[1] w-full h-full pointer-events-none">
              <Image
                src="/assets/images/shop/background.png"
                alt="Background"
                fill
                className="object-contain"
                sizes="(max-width: 1536px) 100vw, 1536px"
                priority
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

            {/* 3D Layers */}
            {layers.map((layer) => (
              <div key={layer.name} className={`absolute pointer-events-none z-[${layer.z}]`} style={{ zIndex: layer.z, position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
                <div className={`${styles.outer} ${layer.outer}`} style={{ position: 'absolute', width: layer.width, height: layer.height, top: layer.top, left: layer.left }}>
                  <div className={`${styles.inner} ${layer.inner}`} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
                    <Image
                      src={layer.file}
                      alt={layer.name}
                      fill
                      className="object-contain"
                      sizes="(max-width: 1536px) 100vw, 1536px"
                      priority={layer.priority}
                    />
                  </div>
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
          <div className="absolute left-6 lg:left-12 top-1/2 -translate-y-[60%] w-[35%] pointer-events-auto">
            <p className="text-[#6C5CE7] tracking-[0.2em] font-semibold text-[1cqw] uppercase mb-4">
              GET IN TOUCH
            </p>
            <h1 className="text-[#0f0f1a] font-extrabold text-[4.5cqw] leading-[1.05] tracking-[-0.03em] mb-6">
              We'd Love to<br />Hear From You
            </h1>
            <p className="text-gray-500 text-[1.1cqw] leading-relaxed mb-8 max-w-[95%]">
              Have a question, feedback or just want to say hi? Our team is here to help. Fill out the form or reach us through any of the channels below.
            </p>
            <button className="bg-[#0f0f1a] text-white rounded-xl flex items-center justify-center gap-3 px-[2cqw] py-[1cqw] text-[0.95cqw] font-semibold transition-transform hover:-translate-y-0.5 group w-fit">
              Send a Message
              <ArrowRight className="w-[1.2cqw] h-[1.2cqw] transition-transform group-hover:translate-x-1" />
            </button>
          </div>

        </div>
      </div>
    </section>
  );
}
