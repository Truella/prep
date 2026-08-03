"use client";

import { motion } from "framer-motion";
import FadeUp from "@/shared/components/FadeUp";

const STEPS = [
  {
    label: "Add your questions",
    description:
      "Build a question set manually or upload a CSV from your notes or past papers. Set an optional time limit.",
  },
  {
    label: "Share the link",
    description:
      "Copy the link and send it to your study group. No account needed to take the quiz.",
  },
  {
    label: "Review your results",
    description:
      "See your score, question-by-question breakdown, and an AI analysis of where you need to focus.",
  },
];

export default function HowItWorks() {
  return (
    <section
      className="py-24 px-6"
      style={{ borderColor: "var(--color-border)" }}
    >
      <div className="max-w-6xl mx-auto">
        <FadeUp>
          <h2
            className="text-3xl mb-2"
            style={{
              fontFamily: "var(--font-display)",
              color: "var(--color-text-primary)",
            }}
          >
            How it works
          </h2>
          <p
            className="text-sm mb-12"
            style={{ color: "var(--color-text-secondary)" }}
          >
            From your notes to a full practice test in minutes.
          </p>
        </FadeUp>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {STEPS.map((step, i) => (
            <FadeUp key={i} delay={i * 0.1}>
              <motion.div
                className="rounded-2xl border p-6 space-y-3 cursor-default"
                style={{
                  backgroundColor: "var(--color-surface)",
                  borderColor: "var(--color-border)",
                }}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
              >
                <motion.span
                  className="text-xs font-mono font-bold inline-block"
                  style={{ color: "var(--color-accent)" }}
                  whileHover={{ scale: 1.15 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                >
                  0{i + 1}
                </motion.span>
                <h3
                  className="font-semibold text-base"
                  style={{ color: "var(--color-text-primary)" }}
                >
                  {step.label}
                </h3>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: "var(--color-text-secondary)" }}
                >
                  {step.description}
                </p>
              </motion.div>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}
