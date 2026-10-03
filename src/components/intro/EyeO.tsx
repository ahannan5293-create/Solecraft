"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useSpring, useTransform, MotionValue, useAnimationFrame } from "framer-motion";
import { INTRO_CONFIG } from "./intro.config";

type Ratios = {
  xRatio: number;
  yRatio: number;
  wRatio: number;
  hRatio: number;
};

let counterCache: Ratios | null = null;

function measureCounter(element: HTMLElement): Ratios {
  if (counterCache) return counterCache;
  
  try {
    const style = window.getComputedStyle(element);
    const fontSize = 400;
    const font = `${style.fontWeight} ${fontSize}px ${style.fontFamily}`;
    
    const canvas = document.createElement('canvas');
    const size = 800;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) throw new Error("No context");
    
    ctx.font = font;
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';
    
    const metrics = ctx.measureText('O');
    const advanceWidth = metrics.width;
    
    const cx = size / 2;
    const cy = size / 2;
    
    ctx.fillStyle = 'black';
    ctx.fillText('O', cx, cy);
    
    const imgData = ctx.getImageData(0, 0, size, size);
    const data = imgData.data;
    
    const getAlpha = (x: number, y: number) => {
      if (x < 0 || x >= size || y < 0 || y >= size) return 255;
      return data[(y * size + x) * 4 + 3];
    };
    
    let startX = cx;
    let startY = cy;
    
    if (getAlpha(startX, startY) > 0) {
      let found = false;
      for (let r = 1; r < 50 && !found; r++) {
        for (let angle = 0; angle < Math.PI * 2; angle += 0.5) {
          const testX = Math.round(cx + Math.cos(angle) * r);
          const testY = Math.round(cy + Math.sin(angle) * r);
          if (getAlpha(testX, testY) === 0) {
            startX = testX;
            startY = testY;
            found = true;
            break;
          }
        }
      }
      if (!found) throw new Error("No transparent center found");
    }
    
    const visited = new Uint8Array(size * size);
    const queue: [number, number][] = [[startX, startY]];
    visited[startY * size + startX] = 1;
    
    let minX = size, maxX = 0, minY = size, maxY = 0;
    
    let ptr = 0;
    while (ptr < queue.length) {
      const [x, y] = queue[ptr++];
      
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
      
      const neighbors = [[x+1, y], [x-1, y], [x, y+1], [x, y-1]];
      for (const [nx, ny] of neighbors) {
        if (nx >= 0 && nx < size && ny >= 0 && ny < size) {
          const idx = ny * size + nx;
          if (visited[idx] === 0) {
            visited[idx] = 1;
            if (getAlpha(nx, ny) === 0) {
              queue.push([nx, ny]);
            }
          }
        }
      }
    }
    
    const counterW = maxX - minX + 1;
    const counterH = maxY - minY + 1;
    const counterCX = minX + counterW / 2;
    const counterCY = minY + counterH / 2;
    
    const xRatio = (counterCX - (cx - advanceWidth / 2)) / advanceWidth;
    const yRatio = (counterCY - (cy - fontSize / 2)) / fontSize;
    const wRatio = counterW / advanceWidth;
    const hRatio = counterH / fontSize;
    
    counterCache = { xRatio, yRatio, wRatio, hRatio };
    return counterCache;
  } catch (e) {
    return {
      xRatio: INTRO_CONFIG.FALLBACK_COUNTER_X,
      yRatio: INTRO_CONFIG.FALLBACK_COUNTER_Y,
      wRatio: INTRO_CONFIG.FALLBACK_COUNTER_WIDTH,
      hRatio: INTRO_CONFIG.FALLBACK_COUNTER_HEIGHT
    };
  }
}

export default function EyeO({ 
  pointerX, 
  pointerY, 
  blinkState 
}: { 
  pointerX: MotionValue<number>;
  pointerY: MotionValue<number>;
  blinkState: MotionValue<number>;
}) {
  const containerRef = useRef<HTMLSpanElement>(null);
  const [ratio, setRatio] = useState<Ratios | null>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  
  const irisX = useSpring(0, { stiffness: INTRO_CONFIG.SPRING_STIFFNESS, damping: INTRO_CONFIG.SPRING_DAMPING });
  const irisY = useSpring(0, { stiffness: INTRO_CONFIG.SPRING_STIFFNESS, damping: INTRO_CONFIG.SPRING_DAMPING });
  
  const browY = useSpring(0, { stiffness: INTRO_CONFIG.SPRING_STIFFNESS, damping: INTRO_CONFIG.SPRING_DAMPING });
  const browRotate = useSpring(0, { stiffness: INTRO_CONFIG.SPRING_STIFFNESS, damping: INTRO_CONFIG.SPRING_DAMPING });

  const scaleY = useTransform(blinkState, [0, 1], [0.1, 1]);
  const openOpacity = useTransform(blinkState, [0, 0.1, 1], [0, 1, 1]);
  const closedOpacity = useTransform(blinkState, [0, 0.1, 1], [1, 0, 0]);

  useEffect(() => {
    if (!containerRef.current) return;
    
    const updateSize = () => {
      const el = containerRef.current;
      if (!el) return;
      const r = measureCounter(el);
      setRatio(r);
      setSize({ w: el.offsetWidth, h: el.offsetHeight });
    };
    
    updateSize();
    // Font ready might change size
    document.fonts.ready.then(updateSize);
    
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  useAnimationFrame(() => {
    if (!containerRef.current || !ratio || size.w === 0) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width * ratio.xRatio;
    const centerY = rect.top + rect.height * ratio.yRatio;
    
    const dx = pointerX.get() - centerX;
    const dy = pointerY.get() - centerY;
    const distance = Math.sqrt(dx*dx + dy*dy);
    const angle = Math.atan2(dy, dx);
    
    const counterW = rect.width * ratio.wRatio;
    const irisR = (counterW * INTRO_CONFIG.IRIS_RATIO) / 2;
    const maxTravel = (counterW / 2) - irisR - INTRO_CONFIG.IRIS_MAX_TRAVEL_OFFSET;
    const travel = Math.min(Math.max(0, maxTravel), distance * 0.12);
    
    irisX.set(Math.cos(angle) * travel);
    irisY.set(Math.sin(angle) * travel);
    
    let bY = 0;
    if (dy < 0) {
      bY = Math.max(-6, dy * 0.05);
    } else {
      bY = Math.min(4, dy * 0.05);
    }
    
    // Add blink dip
    bY += (1 - blinkState.get()) * 3;
    browY.set(bY);
    
    const r = Math.max(-6, Math.min(6, (dx / window.innerWidth) * 12));
    browRotate.set(r);
  });

  if (!ratio || size.w === 0) {
    return (
      <span ref={containerRef} className="relative inline-block leading-none">
        O
      </span>
    );
  }

  const counterW = size.w * ratio.wRatio;
  const counterH = size.h * ratio.hRatio;
  const counterL = size.w * ratio.xRatio - counterW / 2;
  const counterT = size.h * ratio.yRatio - counterH / 2;
  
  // Shrink counter slightly to avoid covering ink
  const inset = 2;
  
  return (
    <span ref={containerRef} className="relative inline-block leading-none">
      {/* Eyebrow */}
      <motion.div 
        className="absolute bottom-[110%] left-0 w-full pointer-events-none origin-bottom"
        style={{ y: browY, rotate: browRotate }}
      >
        <svg viewBox="0 0 100 40" className="w-full h-auto overflow-visible">
          <path 
            d="M 10 30 Q 50 15 90 30" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth={100 * INTRO_CONFIG.BROW_THICKNESS_RATIO} 
            strokeLinecap="round" 
          />
        </svg>
      </motion.div>
      
      <motion.span
        className="relative inline-block leading-none"
        style={{ 
          scaleY,
          opacity: openOpacity,
          transformOrigin: `50% ${ratio.yRatio * 100}%` 
        }}
      >
        O
        
        {/* Eye Contents */}
        <div 
          className="absolute overflow-hidden"
          style={{
            left: counterL + inset,
            top: counterT + inset,
            width: counterW - inset * 2,
            height: counterH - inset * 2,
            // Use 50% border radius if it's elliptical. 
            // For Space Grotesk, the counter is often a squircle, but 50% looks fine when inset.
            borderRadius: "50%",
          }}
        >
          {/* Sclera */}
          <div className="absolute inset-0 bg-white" />
          
          {/* Iris & Glint */}
          <motion.div 
            className="absolute rounded-full bg-[#0f0f1a]"
            style={{
              width: counterW * INTRO_CONFIG.IRIS_RATIO,
              height: counterW * INTRO_CONFIG.IRIS_RATIO,
              left: "50%",
              top: "50%",
              marginLeft: -(counterW * INTRO_CONFIG.IRIS_RATIO) / 2,
              marginTop: -(counterW * INTRO_CONFIG.IRIS_RATIO) / 2,
              x: irisX,
              y: irisY,
            }}
          >
            <div 
              className="absolute bg-white rounded-full"
              style={{
                width: `${INTRO_CONFIG.GLINT_RATIO * 100}%`,
                height: `${INTRO_CONFIG.GLINT_RATIO * 100}%`,
                top: "20%",
                right: "25%",
              }}
            />
          </motion.div>
        </div>
      </motion.span>
      
      {/* Closed Eye Curve */}
      <motion.div 
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        style={{ opacity: closedOpacity }}
      >
        <svg viewBox="0 0 100 100" className="w-[120%] h-[120%] overflow-visible text-[#0f0f1a]">
          <path 
            d={INTRO_CONFIG.CLOSED_CURVE === "up" ? "M 10,60 Q 50,30 90,60" : "M 10,40 Q 50,70 90,40"}
            fill="none"
            stroke="currentColor"
            strokeWidth={12}
            strokeLinecap="round"
          />
        </svg>
      </motion.div>
    </span>
  );
}
