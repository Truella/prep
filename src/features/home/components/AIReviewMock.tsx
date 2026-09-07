"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
} from "framer-motion";
import {
  AI_REVIEW_MOCK_DATASETS,
  PHASE_DURATIONS,
  type AIReviewMockDataset,
} from "../constants/aiReviewMock";

function ResultsCard({
  dataset,
  showCursor = false,
}: {
  dataset: AIReviewMockDataset;
  showCursor?: boolean;
}) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const cursorX = useMotionValue(0);
  const cursorY = useMotionValue(0);
  const cursorScale = useMotionValue(1);
  const buttonScale = useMotionValue(1);
  const rippleOpacity = useMotionValue(0);
  const rippleScale = useMotionValue(0.4);

  useLayoutEffect(() => {
    if (!showCursor) return;

    const cursor = cursorRef.current;
    const button = buttonRef.current;
    if (!cursor || !button) return;

    const cursorRect = cursor.getBoundingClientRect();
    const buttonRect = button.getBoundingClientRect();
    const targetX =
      buttonRect.left + buttonRect.width / 2 - (cursorRect.left + cursorRect.width / 2);
    const targetY =
      buttonRect.top + buttonRect.height / 2 - (cursorRect.top + cursorRect.height / 2);

    const travelX = animate(cursorX, targetX, { duration: 0.65, ease: "easeInOut" });
    const travelY = animate(cursorY, targetY, { duration: 0.65, ease: "easeInOut" });
    const contactAnimations: Array<{ stop: () => void }> = [];
    let active = true;

    Promise.all([travelX, travelY]).then(() => {
      if (!active) return;

      contactAnimations.push(
        animate(buttonScale, [1, 0.96, 0.96, 1], {
          duration: 0.55,
          times: [0, 0.364, 0.636, 1],
          ease: "easeOut",
        }),
        animate(cursorScale, [1, 0.72, 0.72, 1], {
          duration: 0.55,
          times: [0, 0.364, 0.636, 1],
          ease: "easeOut",
        }),
        animate(rippleOpacity, [0, 0.8, 0], {
          duration: 0.55,
          times: [0, 0.364, 1],
          ease: "easeOut",
        }),
        animate(rippleScale, [0.4, 1.6, 1.8], {
          duration: 0.55,
          times: [0, 0.364, 1],
          ease: "easeOut",
        }),
      );
    });

    return () => {
      active = false;
      travelX.stop();
      travelY.stop();
      contactAnimations.forEach((animation) => animation.stop());
    };
  }, [
    buttonScale,
    cursorScale,
    cursorX,
    cursorY,
    rippleOpacity,
    rippleScale,
    showCursor,
  ]);

  return (
    <motion.div
      className="relative flex h-full flex-col items-center justify-center text-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <span
        className="rounded px-2 py-0.5 font-mono text-xs font-semibold"
        style={{ backgroundColor: "var(--color-sky-surface)", color: "var(--color-sky-accent)" }}
      >
        {dataset.category}
      </span>
      <p className="mt-3 text-xs font-semibold uppercase tracking-widest text-text-secondary">
        Practice quiz complete
      </p>
      <p className="mt-5 font-mono text-6xl font-bold text-text-primary">
        {dataset.percentage}%
      </p>
      <p className="mt-2 text-sm text-text-secondary">
        {dataset.earnedPoints} out of {dataset.totalPoints} points earned
      </p>
      <motion.button
        ref={buttonRef}
        type="button"
        tabIndex={-1}
        className="mt-7 rounded-xl px-6 py-3 text-sm font-semibold"
        style={{
          backgroundColor: "var(--color-sky-accent)",
          color: "var(--color-bg)",
          scale: buttonScale,
        }}
      >
        Get AI Review
      </motion.button>

      {showCursor && (
        <motion.div
          ref={cursorRef}
          aria-hidden="true"
          className="absolute left-[20%] top-[20%] h-4 w-4 rounded-full border-2"
          style={{
            backgroundColor: "var(--color-text-primary)",
            borderColor: "var(--color-bg)",
            boxShadow: "0 0 0 4px color-mix(in srgb, var(--color-sky-accent) 35%, transparent)",
            x: cursorX,
            y: cursorY,
            scale: cursorScale,
          }}
        >
          <motion.span
            className="absolute -inset-2 rounded-full border border-sky-accent"
            style={{ opacity: rippleOpacity, scale: rippleScale }}
          />
        </motion.div>
      )}
    </motion.div>
  );
}

function AnalyzingCard({ dataset }: { dataset: AIReviewMockDataset }) {
  return (
    <motion.div
      className="relative flex h-full flex-col items-center justify-center overflow-hidden text-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: [0.55, 1, 0.55] }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1.2, repeat: Infinity }}
    >
      <p className="font-mono text-4xl font-bold text-text-primary">
        {dataset.percentage}%
      </p>
      <p className="mt-4 text-sm text-text-secondary">Analyzing your responses...</p>
      <motion.div
        className="absolute inset-x-0 top-0 h-px"
        style={{
          backgroundColor: "var(--color-sky-accent)",
          boxShadow: "0 0 18px 4px var(--color-sky-surface)",
        }}
        animate={{ top: ["0%", "100%"] }}
        transition={{ duration: 1.3, repeat: Infinity, ease: "linear" }}
      />
    </motion.div>
  );
}

function ReviewCard({
  dataset,
  shouldAnimate = true,
}: {
  dataset: AIReviewMockDataset;
  shouldAnimate?: boolean;
}) {
  return (
    <motion.div
      className="h-full"
      initial={shouldAnimate ? { opacity: 0 } : false}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <p className="text-xs font-semibold uppercase tracking-widest text-sky-accent">
        Your AI review
      </p>
      <h3 className="mt-3 text-xl font-semibold text-text-primary">Focus your next session</h3>
      <div className="mt-6 space-y-4">
        {dataset.reviewPoints.map((point, index) => (
          <motion.div
            key={point}
            className="flex gap-3 text-sm leading-relaxed text-text-secondary"
            initial={shouldAnimate ? { opacity: 0, x: -10 } : false}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: shouldAnimate ? 0.2 + index * 0.25 : 0 }}
          >
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-sky-accent" />
            <span>{point}</span>
          </motion.div>
        ))}
      </div>
      <motion.p
        className="mt-7 border-t border-border pt-5 text-sm font-medium text-text-primary"
        initial={shouldAnimate ? { opacity: 0, y: 8 } : false}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: shouldAnimate ? 1.05 : 0 }}
      >
        {dataset.recommendation}
      </motion.p>
    </motion.div>
  );
}

export default function AIReviewMock() {
  const containerRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  const [phase, setPhase] = useState(0);
  const [datasetIndex, setDatasetIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const dataset = AI_REVIEW_MOCK_DATASETS[datasetIndex];

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

    const timer = window.setTimeout(() => {
      if (phase === PHASE_DURATIONS.length - 1) {
        setDatasetIndex((current) => (current + 1) % AI_REVIEW_MOCK_DATASETS.length);
        setPhase(0);
        return;
      }
      setPhase(phase + 1);
    }, PHASE_DURATIONS[phase]);
    return () => window.clearTimeout(timer);
  }, [phase, isVisible, reducedMotion]);

  return (
    <div ref={containerRef} className="w-full max-w-lg">
      <div
        className="relative overflow-hidden rounded-2xl p-7 sm:p-9"
        style={{
          backgroundColor: "var(--color-surface-raised)",
        }}
      >
        {reducedMotion ? (
          <ReviewCard dataset={dataset} shouldAnimate={false} />
        ) : (
          <>
            <div aria-hidden="true" className="invisible grid">
              {AI_REVIEW_MOCK_DATASETS.map((sizingDataset) => (
                <div
                  key={sizingDataset.category}
                  className="col-start-1 row-start-1"
                >
                  <ReviewCard dataset={sizingDataset} shouldAnimate={false} />
                </div>
              ))}
            </div>
            <div className="absolute inset-7 sm:inset-9">
              <AnimatePresence>
                <motion.div
                  key={phase}
                  className="absolute inset-0"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.45 }}
                >
                  {phase === 0 && <ResultsCard dataset={dataset} />}
                  {phase === 1 && <ResultsCard dataset={dataset} showCursor />}
                  {phase === 2 && <AnalyzingCard dataset={dataset} />}
                  {phase === 3 && <ReviewCard dataset={dataset} />}
                </motion.div>
              </AnimatePresence>
            </div>
          </>
        )}
      </div>
      {!reducedMotion && (
        <div className="mt-4 flex justify-center gap-1.5">
          {PHASE_DURATIONS.map((_, index) => (
            <span
              key={index}
              className="h-1 rounded-full transition-all duration-300"
              style={{
                width: phase === index ? 24 : 6,
                backgroundColor:
                  phase === index ? "var(--color-sky-accent)" : "var(--color-border)",
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
