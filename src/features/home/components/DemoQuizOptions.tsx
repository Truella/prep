"use client";

import { motion } from "framer-motion";

// Shared A–D option rows used by the hero demo card and the CBT experience
// mock. Same structure and highlight semantics, different tone per context.
// All classes are static literals so Tailwind picks them up from this file.
const DEMO_QUIZ_OPTION_TONES = {
  hero: {
    row: "flex items-center gap-3 px-3 py-2.5 rounded-lg border text-sm transition-colors duration-300",
    rowActive: "border-magenta-accent bg-magenta-surface",
    rowIdle: "border-border bg-surface-raised",
    chip: "shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold font-mono",
    chipActive: "bg-magenta-accent text-bg",
    chipIdle: "bg-border text-text-secondary",
    text: "",
    textActive: "text-text-primary",
    textIdle: "text-text-secondary",
  },
  exam: {
    row: "flex items-start gap-3 px-3 py-2.5 rounded-xl border transition-colors duration-300",
    rowActive: "border-coral-accent bg-coral-surface",
    rowIdle: "border-border bg-surface",
    chip: "shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold font-mono",
    chipActive: "bg-coral-accent text-bg",
    chipIdle: "bg-surface-raised text-text-secondary",
    text: "flex-1 pt-0.5 text-sm text-left",
    textActive: "text-text-primary",
    textIdle: "text-text-primary",
  },
} as const;

interface DemoQuizOptionsProps {
  options: string[];
  highlightedIndex?: number | null;
  tone: keyof typeof DEMO_QUIZ_OPTION_TONES;
  staggerEntrance?: boolean;
}

export default function DemoQuizOptions({
  options,
  highlightedIndex = null,
  tone,
  staggerEntrance = false,
}: DemoQuizOptionsProps) {
  const t = DEMO_QUIZ_OPTION_TONES[tone];

  return (
    <div className="space-y-2">
      {options.map((option, index) => {
        const highlighted = highlightedIndex === index;
        const letter = String.fromCharCode(65 + index);

        return (
          <motion.div
            key={index}
            initial={staggerEntrance ? { opacity: 0, y: 16 } : false}
            animate={{ opacity: 1, y: 0 }}
            transition={
              staggerEntrance
                ? { duration: 0.35, ease: "easeOut", delay: 0.24 + index * 0.08 }
                : undefined
            }
            className={`${t.row} ${highlighted ? t.rowActive : t.rowIdle}`}
          >
            <span className={`${t.chip} ${highlighted ? t.chipActive : t.chipIdle}`}>
              {letter}
            </span>
            <span className={`${t.text} ${highlighted ? t.textActive : t.textIdle}`}>
              {option}
            </span>
          </motion.div>
        );
      })}
    </div>
  );
}
