"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import DemoQuizOptions from "./DemoQuizOptions";

const QUESTIONS = [
  {
    text: "Which OSI layer routes packets?",
    options: ["Data Link", "Network", "Transport", "Session"],
    answer: 1,
  },
  {
    text: "What does CBT stand for?",
    options: ["Online MCQ test", "Certified basic test", "Computer-based testing", "Adaptive exam"],
    answer: 2,
  },
];

const LOOP_TICKS = 8;
const START_SECONDS = 4 * 60 + 58;

function formatTimer(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

export default function CBTExperienceMock() {
  const reducedMotion = useReducedMotion();
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (reducedMotion) return;
    const interval = setInterval(() => {
      setTick((t) => (t + 1) % LOOP_TICKS);
    }, 1000);
    return () => clearInterval(interval);
  }, [reducedMotion]);

  const questionIndex = tick < 4 ? 0 : 1;
  const question = QUESTIONS[questionIndex];
  const revealed = questionIndex === 0 ? (tick >= 1 ? question.answer : undefined) : question.answer;
  const timerSeconds = Math.max(START_SECONDS - tick, 0);
  const ratio = timerSeconds / 300;

  return (
    <div aria-hidden="true" className="w-full max-w-[420px] mx-auto min-h-[420px] bg-surface-raised rounded-2xl p-5 overflow-hidden relative shadow-sm flex flex-col">
      {/* Header: timer + progress */}
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs text-text-secondary font-medium">
          Practice Quiz
        </span>
        <span
          className={`font-mono text-base font-bold tabular-nums ${
            ratio > 0.5 ? "text-coral-accent" : ratio > 0.2 ? "text-text-primary" : "text-error"
          }`}
        >
          {formatTimer(timerSeconds)}
        </span>
      </div>
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs text-text-secondary">
          Question {questionIndex + 1} of 24
        </span>
        <span className="text-xs text-text-secondary">
          {problemProgress(questionIndex).toFixed(0)}%
        </span>
      </div>
      <div className="w-full h-1.5 bg-border rounded-full overflow-hidden mb-4">
        <motion.div
          className="h-full bg-coral-accent rounded-full"
          animate={{ width: `${problemProgress(questionIndex)}%` }}
          transition={{ duration: 0.4 }}
        />
      </div>

      {/* Question */}
      <div className="flex-1 min-h-0 space-y-3">
        <AnimatePresence mode="wait">
          <motion.div
            key={questionIndex}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.35 }}
            className="h-full flex flex-col"
          >
            <h3 className="text-sm font-semibold text-text-primary leading-snug mb-3">
              {question.text}
            </h3>
            <div className="flex-1">
              <DemoQuizOptions options={question.options} highlightedIndex={revealed} tone="exam" staggerEntrance />
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
        <span className="text-xs text-text-secondary font-mono">
          A–D: select &middot; Enter: next
        </span>
        <div className="flex items-center gap-2">
          <span className="px-4 py-2 rounded-lg border border-border text-xs font-semibold text-text-secondary bg-surface">
            Previous
          </span>
          <motion.span
            key={questionIndex}
            initial={{ scale: 0.96 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3 }}
            className="px-5 py-2 rounded-lg bg-coral-accent text-bg text-xs font-semibold"
          >
            Next
          </motion.span>
        </div>
      </div>
    </div>
  );
}

function problemProgress(questionIndex: number) {
  return ((questionIndex + 1) / 24) * 100;
}
