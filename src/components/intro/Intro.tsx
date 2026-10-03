"use client";

import { useEffect, useState, useRef } from "react";
import { motion, useMotionValue, animate, useReducedMotion } from "framer-motion";
import { INTRO_CONFIG } from "./intro.config";
import EyeO from "./EyeO";

export default function Intro() {
  const [mounted, setMounted] = useState(false);
  const [phase, setPhase] = useState<"entering" | "waiting" | "leaving" | "done">("entering");
  
  const phaseRef = useRef<"entering" | "waiting" | "leaving" | "done">("entering");
  const startedRef = useRef(false);
  
  const reducedMotion = useReducedMotion();
  
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const blinkState = useMotionValue(0); // 0 = closed, 1 = open

  const advance = (toPhase: "entering" | "waiting" | "leaving" | "done") => {
    if (
      (phaseRef.current === "entering" && toPhase === "waiting") ||
      (phaseRef.current === "waiting" && toPhase === "leaving") ||
      (phaseRef.current === "leaving" && toPhase === "done")
    ) {
      if (INTRO_CONFIG.DEBUG_INTRO) {
        console.debug(`[intro] Phase transition: ${phaseRef.current} -> ${toPhase}`);
      }
      phaseRef.current = toPhase;
      setPhase(toPhase);
    }
  };

  useEffect(() => {
    if (startedRef.current || (window as any)._introDoneThisSession) return;
    startedRef.current = true;
    
    setMounted(true);
    let shouldPlay = false;
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const forceIntro = urlParams.get('intro') === '1';
      const seen = sessionStorage.getItem('intro-seen');
      
      if (forceIntro) {
        urlParams.delete('intro');
        const newUrl = window.location.pathname + (urlParams.toString() ? '?' + urlParams.toString() : '') + window.location.hash;
        window.history.replaceState({}, '', newUrl);
      }
      
      if (forceIntro || (!seen && !reducedMotion)) {
        shouldPlay = true;
      }
    } catch (e) {}
    
    if (!shouldPlay) {
      try {
        sessionStorage.setItem('intro-seen', '1');
      } catch(e) {}
      (window as any)._introDoneThisSession = true;
      delete document.documentElement.dataset.intro;
      advance("done");
      return;
    }
    
    // Lock scroll immediately
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
  }, [reducedMotion]);

  useEffect(() => {
    if (phaseRef.current === "done") return;
    
    let active = true;
    const timers: any[] = [];
    const clearTimers = () => timers.forEach(clearTimeout);
    let idleTimer: any;

    const doCleanup = () => {
      active = false;
      clearTimers();
      window.removeEventListener('keydown', handleKey);
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('pointermove', onPointerMove);
      if (idleTimer) clearTimeout(idleTimer);
    };

    const triggerHandoff = () => {
      if (phaseRef.current !== "waiting") return;
      advance("leaving");
      
      try { sessionStorage.setItem('intro-seen', '1'); } catch (e) {}
      (window as any)._introDoneThisSession = true;
      
      if (INTRO_CONFIG.DEBUG_INTRO) {
        console.debug("[intro] Triggering handoff");
      }
      
      advance("done");
      delete document.documentElement.dataset.intro;
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
      doCleanup();
      
      // Move focus for accessibility
      const h1 = document.querySelector("h1");
      const main = document.querySelector("main");
      if (h1) {
        h1.setAttribute("tabindex", "-1");
        (h1 as HTMLElement).focus({ preventScroll: true });
      } else if (main) {
        main.setAttribute("tabindex", "-1");
        (main as HTMLElement).focus({ preventScroll: true });
      }
    };
    
    // Expose skip for button click
    (window as any)._skipIntro = triggerHandoff;

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === 'End') {
        if (e.key === ' ') e.preventDefault();
        triggerHandoff();
      }
    };

    const handleWheel = (e: WheelEvent) => {
      if (e.deltaY > 20) {
        triggerHandoff();
      }
    };

    let touchStartY = 0;
    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
    };
    const handleTouchMove = (e: TouchEvent) => {
      // Prevent scrolling while intro is active
      if (phaseRef.current !== "done") {
        e.preventDefault();
      }
      const touchY = e.touches[0].clientY;
      if (touchStartY - touchY > 40) {
        triggerHandoff();
      }
    };

    window.addEventListener('keydown', handleKey);
    window.addEventListener('wheel', handleWheel, { passive: true });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    
    let isIdle = true;
    const onPointerMove = (e: PointerEvent) => {
      pointerX.set(e.clientX);
      pointerY.set(e.clientY);
      isIdle = false;
      if (idleTimer) clearTimeout(idleTimer);
      idleTimer = setTimeout(() => { isIdle = true; }, INTRO_CONFIG.IDLE_WAIT);
    };
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    
    pointerX.set(window.innerWidth / 2);
    pointerY.set(window.innerHeight / 2);
    
    const saccadeLoop = async () => {
      while (active) {
        if (isIdle) {
           const w = window.innerWidth;
           const h = window.innerHeight;
           const targets = [
             { x: w * 0.2, y: h * 0.5 },
             { x: w * 0.8, y: h * 0.5 },
             { x: w * 0.3, y: h * 0.2 },
             { x: w * 0.5, y: h * 0.5 },
           ];
           for (const t of targets) {
             if (!active || !isIdle) break;
             pointerX.set(t.x);
             pointerY.set(t.y);
             await new Promise(r => { const id = setTimeout(r, INTRO_CONFIG.LOOK_HOLD_MIN + Math.random() * (INTRO_CONFIG.LOOK_HOLD_MAX - INTRO_CONFIG.LOOK_HOLD_MIN)); timers.push(id); });
           }
        } else {
           await new Promise(r => { const id = setTimeout(r, 100); timers.push(id); });
        }
      }
    };
    
    const blinkLoop = async () => {
      while (active) {
        await new Promise(r => { const id = setTimeout(r, INTRO_CONFIG.BLINK.MIN_INTERVAL + Math.random() * (INTRO_CONFIG.BLINK.MAX_INTERVAL - INTRO_CONFIG.BLINK.MIN_INTERVAL)); timers.push(id); });
        if (!active) break;
        
        animate(blinkState, 0, { duration: INTRO_CONFIG.BLINK.CLOSE / 1000, ease: INTRO_CONFIG.EASE_IN_OUT });
        await new Promise(r => { const id = setTimeout(r, INTRO_CONFIG.BLINK.CLOSE); timers.push(id); });
        if (!active) break;
        
        animate(blinkState, 1, { duration: INTRO_CONFIG.BLINK.OPEN / 1000, ease: INTRO_CONFIG.EASE_IN_OUT });
        
        if (Math.random() < INTRO_CONFIG.BLINK.DOUBLE_CHANCE) {
          await new Promise(r => { const id = setTimeout(r, INTRO_CONFIG.BLINK.OPEN + 50); timers.push(id); });
          if (!active) break;
          animate(blinkState, 0, { duration: INTRO_CONFIG.BLINK.CLOSE / 1000, ease: INTRO_CONFIG.EASE_IN_OUT });
          await new Promise(r => { const id = setTimeout(r, INTRO_CONFIG.BLINK.CLOSE); timers.push(id); });
          if (!active) break;
          animate(blinkState, 1, { duration: INTRO_CONFIG.BLINK.OPEN / 1000, ease: INTRO_CONFIG.EASE_IN_OUT });
        }
      }
    };
    
    const startAnimation = () => {
      if (!active) return;
      
      timers.push(setTimeout(() => {
        animate(blinkState, 1, { duration: 0.25, ease: INTRO_CONFIG.EASE_IN_OUT });
        saccadeLoop();
        blinkLoop();
        
        timers.push(setTimeout(() => {
          advance("waiting");
        }, 100)); // allow eyes to open slightly before waiting state
      }, INTRO_CONFIG.TIMELINE.EYES_OPEN_START));
    };

    let fontReady = false;
    document.fonts.ready.then(() => {
      if (!fontReady) {
        fontReady = true;
        startAnimation();
      }
    });
    
    timers.push(setTimeout(() => {
      if (!fontReady) {
        fontReady = true;
        startAnimation();
      }
    }, INTRO_CONFIG.TIMELINE.MAX_FONT_WAIT));
    
    return doCleanup;
  }, []);

  if (!mounted || phase === "done") return null;

  return (
    <div 
      id="intro"
      className="fixed inset-0 z-[8000] bg-white flex flex-col items-center justify-center font-bold uppercase text-[#0f0f1a]"
    >
      <div className="sr-only" aria-live="polite">Loading Solecraft</div>
      
      <div className="relative z-10 flex flex-col sm:flex-row text-[18.5vw] sm:text-[9vw] leading-[0.8] tracking-tight">
        <div className="flex justify-center">
          {Array.from("SOLE").map((char, i) => {
            const index = i;
            return (
              <motion.span
                key={`sole-${i}`}
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: index * (INTRO_CONFIG.TIMELINE.STAGGER / 1000), duration: 0.6, ease: INTRO_CONFIG.EASE_IN_OUT }}
                className="inline-block"
              >
                {INTRO_CONFIG.EYE_INDEXES.includes(index) ? (
                  <EyeO pointerX={pointerX} pointerY={pointerY} blinkState={blinkState} />
                ) : (
                  char
                )}
              </motion.span>
            );
          })}
        </div>
        
        <div className="flex justify-center">
          {Array.from("CRAFT").map((char, i) => {
            const index = i + 4;
            return (
              <motion.span
                key={`craft-${i}`}
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: index * (INTRO_CONFIG.TIMELINE.STAGGER / 1000), duration: 0.6, ease: INTRO_CONFIG.EASE_IN_OUT }}
                className="inline-block text-[#6C5CE7]"
              >
                {char}
              </motion.span>
            );
          })}
        </div>
      </div>
      
      {phase === "waiting" && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: INTRO_CONFIG.TIMELINE.HINT_FADE_IN / 1000, duration: 1 }}
          onClick={() => (window as any)._skipIntro?.()}
          className="absolute bottom-12 flex flex-col items-center gap-2 cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0f0f1a] rounded-md p-2"
          data-cursor="link"
        >
          <span className="sr-only" aria-live="polite">Scroll down to enter the shop.</span>
          <span className="text-xs tracking-widest" aria-hidden="true">SCROLL</span>
          <motion.div
            animate={{ y: [0, 4, 0] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
            aria-hidden="true"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </motion.div>
        </motion.button>
      )}

      <button 
        onClick={() => (window as any)._skipIntro?.()}
        className="absolute bottom-8 right-8 touch-target px-6 py-3 rounded-full border border-gray-200 bg-white text-[#0f0f1a] text-sm font-medium hover:bg-gray-50 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0f0f1a] focus-visible:outline-offset-2 z-[8001]"
        data-cursor="link"
      >
        Skip
      </button>
    </div>
  );
}
