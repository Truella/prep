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
  CLICK_PRESS_MS,
  CLICK_TRAVEL_MS,
  OPTION_FADE_MS,
  OPTION_STAGGER_MS,
  QUIZ_BUILD_MOCK,
  QUIZ_BUILD_PHASE_DURATIONS,
  TYPING_RATE_MS,
} from "../constants/quizBuildMock";

const OPTION_LABELS = ["A", "B", "C", "D"];

function Typewriter({ text }: { text: string }) {
  const [length, setLength] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setLength((current) => {
        if (current >= text.length) {
          window.clearInterval(timer);
          return current;
        }
        return current + 1;
      });
    }, TYPING_RATE_MS);
    return () => window.clearInterval(timer);
  }, [text]);

  return <>{text.slice(0, length)}</>;
}

function ToolbarButton({
  label,
  target,
}: {
  label: string;
  target: boolean;
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
    if (!target) return;
    const cursor = cursorRef.current;
    const button = buttonRef.current;
    if (!cursor || !button) return;

    const cursorRect = cursor.getBoundingClientRect();
    const buttonRect = button.getBoundingClientRect();
    const targetX =
      buttonRect.left + buttonRect.width / 2 - (cursorRect.left + cursorRect.width / 2);
    const targetY =
      buttonRect.top + buttonRect.height / 2 - (cursorRect.top + cursorRect.height / 2);
    const travelX = animate(cursorX, targetX, {
      duration: CLICK_TRAVEL_MS / 1000,
      ease: "easeInOut",
    });
    const travelY = animate(cursorY, targetY, {
      duration: CLICK_TRAVEL_MS / 1000,
      ease: "easeInOut",
    });
    const contactAnimations: Array<{ stop: () => void }> = [];
    let active = true;

    Promise.all([travelX, travelY]).then(() => {
      if (!active) return;
      const duration = CLICK_PRESS_MS / 1000;
      contactAnimations.push(
        animate(buttonScale, [1, 0.95, 1], { duration, times: [0, 0.5, 1] }),
        animate(cursorScale, [1, 0.72, 1], { duration, times: [0, 0.5, 1] }),
        animate(rippleOpacity, [0, 0.8, 0], { duration }),
        animate(rippleScale, [0.4, 1.6], { duration }),
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
    target,
  ]);

  const isPublish = label === "Publish";
  return (
    <div className="relative flex-1">
      <motion.button
        ref={buttonRef}
        type="button"
        tabIndex={-1}
        className={`w-full rounded-lg px-2 py-2 text-[10px] font-semibold ${
          isPublish
            ? "bg-accent text-bg"
            : "border border-border text-text-primary"
        }`}
        style={{ scale: buttonScale }}
      >
        {label}
      </motion.button>
      {target && (
        <motion.div
          ref={cursorRef}
          aria-hidden="true"
          className="absolute -left-8 -top-10 h-3.5 w-3.5 rounded-full border-2 border-bg bg-text-primary"
          style={{ x: cursorX, y: cursorY, scale: cursorScale }}
        >
          <motion.span
            className="absolute -inset-2 rounded-full border border-accent"
            style={{ opacity: rippleOpacity, scale: rippleScale }}
          />
        </motion.div>
      )}
    </div>
  );
}

function CollapsedQuestion({ shouldAnimate }: { shouldAnimate: boolean }) {
  return (
    <motion.div
      className="flex items-center gap-2.5 rounded-xl border border-border bg-surface px-3 py-2.5"
      initial={shouldAnimate ? { opacity: 0, y: 14 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: OPTION_FADE_MS / 1000, ease: "easeOut" }}
    >
      <svg className="h-3.5 w-3.5 shrink-0 text-text-secondary" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
      </svg>
      <span className="w-6 shrink-0 text-xs font-semibold text-text-secondary">Q2</span>
      <span className="min-w-0 flex-1 truncate text-xs text-text-primary">
        {QUIZ_BUILD_MOCK.secondQuestion}
      </span>
      <span className="text-[10px] text-text-secondary">1pt</span>
    </motion.div>
  );
}

function BuilderState({ phase }: { phase: number }) {
  const titleComplete = phase > 0;
  const questionVisible = phase >= 1;
  const questionComplete = phase > 1;
  const optionsVisible = phase >= 2;
  const secondQuestionVisible = phase >= 4;

  return (
    <div className="space-y-3">
      <div className="flex gap-1.5 border-b border-border">
        <span className="-mb-px border-b-2 border-text-primary px-3 py-1.5 text-xs font-medium text-text-primary">Build manually</span>
        <span className="px-3 py-1.5 text-xs font-medium text-text-secondary">Upload CSV</span>
      </div>
      <div>
        <label className="mb-1.5 block text-xs font-medium text-text-secondary">Quiz Title</label>
        <div className="h-10 rounded-lg border border-border bg-surface px-3 py-2.5 text-xs text-text-primary">
          {titleComplete ? QUIZ_BUILD_MOCK.title : <Typewriter text={QUIZ_BUILD_MOCK.title} />}
          {!titleComplete && <span className="ml-0.5 animate-pulse text-accent">|</span>}
        </div>
      </div>

      {questionVisible && (
        <div className="overflow-hidden rounded-xl border border-border bg-surface">
          <div className="flex items-center gap-2.5 px-3 py-2.5">
            <span className="text-xs font-semibold text-text-secondary">Q1</span>
            <span className="min-w-0 flex-1 text-xs text-text-primary">
              {questionComplete ? QUIZ_BUILD_MOCK.question : <Typewriter text={QUIZ_BUILD_MOCK.question} />}
            </span>
            <span className="text-[10px] text-text-secondary">1pt</span>
          </div>
          {optionsVisible && (
            <div className="space-y-2 border-t border-border px-3 pb-3 pt-2.5">
              {QUIZ_BUILD_MOCK.options.map((option, index) => {
                const isCorrect = index === QUIZ_BUILD_MOCK.correctAnswerIndex;
                return (
                  <motion.div
                    key={option}
                    className="flex items-center gap-2"
                    initial={phase === 2 ? { opacity: 0, x: -8 } : false}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      delay: phase === 2 ? (index * OPTION_STAGGER_MS) / 1000 : 0,
                      duration: OPTION_FADE_MS / 1000,
                    }}
                  >
                    <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[10px] font-bold ${isCorrect ? "border-text-primary bg-text-primary text-bg" : "border-border text-text-secondary"}`}>
                      {OPTION_LABELS[index]}
                    </span>
                    <span className="flex-1 rounded-lg border border-border bg-surface-raised px-2.5 py-1.5 text-xs text-text-primary">{option}</span>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {secondQuestionVisible && <CollapsedQuestion shouldAnimate={phase === 4} />}
      {optionsVisible && (
        <div className="flex gap-2 pt-1">
          <ToolbarButton label="+ Add Question" target={phase === 3} />
          <ToolbarButton label="Save as Draft" target={false} />
          <ToolbarButton label="Publish" target={phase === 5} />
        </div>
      )}
    </div>
  );
}

function SuccessState() {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const showTimer = window.setTimeout(() => setCopied(true), 700);
    const hideTimer = window.setTimeout(() => setCopied(false), 1500);
    return () => {
      window.clearTimeout(showTimer);
      window.clearTimeout(hideTimer);
    };
  }, []);

  return (
    <div className="rounded-2xl border border-green-500/20 bg-green-500/10 p-5 backdrop-blur-xl">
      <div className="mb-4 flex items-start gap-3">
        <div className="rounded-lg bg-green-500/20 p-2 text-green-400">
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
            <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-text-primary">Quiz Published Successfully!</h3>
          <p className="mt-1 text-xs text-text-secondary">Share this link with students to take the quiz</p>
        </div>
      </div>
      <div className="flex gap-2">
        <div className="min-w-0 flex-1 truncate rounded-xl border border-border bg-surface px-3 py-2.5 text-xs text-text-primary">
          {QUIZ_BUILD_MOCK.shareableLink}
        </div>
        <button type="button" tabIndex={-1} className="flex items-center gap-1 rounded-xl bg-text-primary px-3 py-2 text-xs font-semibold text-bg">
          {copied && <span aria-hidden="true">✓</span>}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <div className="mt-4 flex items-center justify-between gap-3 border-t border-green-500/20 pt-4">
        <p className="text-xs text-text-secondary">
          Share code: <span className="ml-1 font-mono font-bold text-text-primary">{QUIZ_BUILD_MOCK.shareCode}</span>
        </p>
        <button type="button" tabIndex={-1} className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-text-primary">Copy code</button>
      </div>
    </div>
  );
}

export default function QuizBuildMock() {
  const containerRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  const [phase, setPhase] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) => setIsVisible(entry.isIntersecting), { threshold: 0.1 });
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
  return (
    <div ref={containerRef} className="w-full max-w-md">
      <div className="relative min-h-[430px] overflow-hidden rounded-2xl border border-border bg-surface-raised p-5 shadow-2xl shadow-black/10">
        <AnimatePresence mode="wait">
          <motion.div
            key={reducedMotion ? "static" : phase}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {reducedMotion || phase === successPhase ? <SuccessState /> : <BuilderState phase={phase} />}
          </motion.div>
        </AnimatePresence>
      </div>
      {!reducedMotion && (
        <div className="mt-3 flex justify-center gap-1.5">
          {QUIZ_BUILD_PHASE_DURATIONS.map((_, index) => (
            <span key={index} className={`h-1 rounded-full transition-all duration-300 ${phase === index ? "w-5 bg-accent" : "w-1.5 bg-border"}`} />
          ))}
        </div>
      )}
    </div>
  );
}
