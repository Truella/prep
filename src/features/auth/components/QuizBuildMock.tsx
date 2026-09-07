"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { QUIZ_BUILD_PHASE_DURATIONS } from "../constants/quizBuildMock";
import BuilderState from "./quiz-build-mock/BuilderState";
import SuccessState from "./quiz-build-mock/SuccessState";

export default function QuizBuildMock() {
  const containerRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  const [phase, setPhase] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.1 },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (reducedMotion || !isVisible) return;
    const timer = window.setTimeout(
      () => setPhase((current) => (current + 1) % QUIZ_BUILD_PHASE_DURATIONS.length),
      QUIZ_BUILD_PHASE_DURATIONS[phase],
    );
    return () => window.clearTimeout(timer);
  }, [isVisible, phase, reducedMotion]);

  const successPhase = QUIZ_BUILD_PHASE_DURATIONS.length - 1;
  const showingSuccess = reducedMotion || phase === successPhase;

  return (
    <div ref={containerRef} className="w-full max-w-md">
      <div className="relative overflow-hidden rounded-2xl border border-border bg-surface-raised p-5 shadow-2xl shadow-black/10">
        <div aria-hidden="true" className="invisible">
          <BuilderState phase={4} />
        </div>
        <div className="absolute inset-5">
          <AnimatePresence mode="wait">
            <motion.div
              key={showingSuccess ? "success" : "builder"}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {showingSuccess ? <SuccessState /> : <BuilderState phase={phase} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
      {!reducedMotion && (
        <div className="mt-3 flex justify-center gap-1.5">
          {QUIZ_BUILD_PHASE_DURATIONS.map((_, index) => (
            <span
              key={index}
              className={`h-1 rounded-full transition-all duration-300 ${
                phase === index ? "w-5 bg-sage-accent" : "w-1.5 bg-border"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
