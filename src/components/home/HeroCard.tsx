"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const DEMO_QUESTIONS = [
  {
    category: "Biology",
    level: "University",
    question: "Which enzyme is responsible for unwinding the DNA double helix during replication?",
    options: ["DNA Polymerase", "Helicase", "Ligase", "Primase"],
    correct: 1,
  },
  {
    category: "Mathematics",
    level: "Professional",
    question: "If f(x) = x³ - 3x² + 2x, what are the critical points of f?",
    options: ["x = 0 and x = 2", "x = 1 and x = 2", "x = 0 and x = 1", "x = -1 and x = 2"],
    correct: 0,
  },
  {
    category: "History",
    level: "Secondary",
    question: "The Treaty of Versailles, signed in 1919, formally ended which conflict?",
    options: ["The Crimean War", "World War I", "World War II", "The Franco-Prussian War"],
    correct: 1,
  },
  {
    category: "Technology",
    level: "Professional",
    question: "In computer networking, what does the acronym 'DNS' stand for?",
    options: ["Digital Network System", "Domain Name System", "Data Network Service", "Distributed Node Server"],
    correct: 1,
  },
  {
    category: "Economics",
    level: "University",
    question: "According to the law of demand, what happens to quantity demanded when price increases, ceteris paribus?",
    options: ["It increases", "It remains unchanged", "It decreases", "It doubles"],
    correct: 2,
  },
];

const OPTION_LABELS = ["A", "B", "C", "D"];

export default function HeroCard() {
  const [index, setIndex] = useState(0);
  const [highlightedAnswer, setHighlightedAnswer] = useState<number | null>(null);

  useEffect(() => {
    const highlightTimer = setTimeout(() => {
      setHighlightedAnswer(DEMO_QUESTIONS[index].correct);
    }, 1200);

    const advanceTimer = setTimeout(() => {
      setHighlightedAnswer(null);
      setIndex((prev) => (prev + 1) % DEMO_QUESTIONS.length);
    }, 3200);

    return () => {
      clearTimeout(highlightTimer);
      clearTimeout(advanceTimer);
    };
  }, [index]);

  const q = DEMO_QUESTIONS[index];

  return (
    <div className="relative w-full max-w-md">
      {/* Progress dots */}
      <div className="flex gap-1.5 mb-4 justify-end">
        {DEMO_QUESTIONS.map((_, i) => (
          <div
            key={i}
            className="h-1 rounded-full transition-all duration-300"
            style={{
              width: i === index ? "24px" : "6px",
              backgroundColor:
                i === index
                  ? "var(--color-accent)"
                  : "var(--color-border)",
            }}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="rounded-2xl border p-6 space-y-5"
          style={{
            backgroundColor: "var(--color-surface)",
            borderColor: "var(--color-border)",
          }}
        >
          {/* Category + level */}
          <div className="flex items-center gap-2">
            <span
              className="text-xs font-semibold px-2 py-0.5 rounded font-mono"
              style={{
                backgroundColor: "var(--color-accent-dim)",
                color: "var(--color-accent)",
              }}
            >
              {q.category}
            </span>
            <span
              className="text-xs"
              style={{ color: "var(--color-text-secondary)" }}
            >
              {q.level}
            </span>
          </div>

          {/* Question */}
          <p
            className="text-sm font-medium leading-relaxed"
            style={{ color: "var(--color-text-primary)" }}
          >
            {q.question}
          </p>

          {/* Options */}
          <div className="space-y-2">
            {q.options.map((option, i) => {
              const isCorrect = i === q.correct;
              const isHighlighted = highlightedAnswer !== null && isCorrect;

              return (
                <motion.div
                  key={i}
                  animate={
                    isHighlighted
                      ? {
                          backgroundColor: "var(--color-accent-dim)",
                          borderColor: "var(--color-accent)",
                        }
                      : {
                          backgroundColor: "var(--color-surface-raised)",
                          borderColor: "var(--color-border)",
                        }
                  }
                  transition={{ duration: 0.2, ease: "easeInOut" }}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg border text-sm"
                >
                  <span
                    className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold font-mono transition-all duration-200"
                    style={{
                      backgroundColor: isHighlighted
                        ? "var(--color-accent)"
                        : "var(--color-border)",
                      color: isHighlighted
                        ? "#0A0A0F"
                        : "var(--color-text-secondary)",
                    }}
                  >
                    {OPTION_LABELS[i]}
                  </span>
                  <span
                    style={{
                      color: isHighlighted
                        ? "var(--color-text-primary)"
                        : "var(--color-text-secondary)",
                    }}
                  >
                    {option}
                  </span>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}