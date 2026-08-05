"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import FadeUp from "@/shared/components/FadeUp";

const STEPS = [
  {
    label: "Add your questions",
    description:
      "Create questions manually or upload a CSV. Add an optional timer.",
  },
  {
    label: "Share the link",
    description:
      "Share a link. Anyone can join instantly, no account required.",
  },
  {
    label: "Review your results",
    description:
      "Get your score, breakdown, and AI feedback on what to review.",
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

        <div className="relative pl-8 md:pl-0">
          <div
            className="absolute left-1.5 top-6 bottom-6 w-px md:hidden"
            style={{ backgroundColor: "var(--color-border)" }}
          />
          <svg
            aria-hidden="true"
            className="absolute inset-0 hidden h-full w-full md:block"
            preserveAspectRatio="none"
            viewBox="0 0 1000 180"
          >
            <path
              d="M 310 90 H 326 V 45 H 337"
              fill="none"
              stroke="var(--color-border)"
              strokeWidth="2"
              vectorEffect="non-scaling-stroke"
            />
            <path
              d="M 663 135 H 674 V 90 H 690"
              fill="none"
              stroke="var(--color-border)"
              strokeWidth="2"
              vectorEffect="non-scaling-stroke"
            />
            {[
              [310, 90],
              [337, 45],
              [663, 135],
              [690, 90],
            ].map(([cx, cy]) => (
              <circle
                key={`${cx}-${cy}`}
                cx={cx}
                cy={cy}
                r="4"
                fill="var(--color-accent)"
                vectorEffect="non-scaling-stroke"
              />
            ))}
          </svg>

          <div className="relative grid grid-cols-1 gap-8 md:grid-cols-3">
            {STEPS.map((step, i) => (
              <FadeUp key={step.label} delay={i * 0.1} className="relative h-full">
                <span
                  className="absolute -left-[1.875rem] top-6 z-10 h-3 w-3 rounded-full md:hidden"
                  style={{ backgroundColor: "var(--color-accent)" }}
                />
                <motion.div
                  className="h-full rounded-2xl border p-6 space-y-3 cursor-default"
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

        <FadeUp delay={0.3} className="mt-10 text-center">
          <Link
            href="/auth"
            className="inline-block rounded-xl px-7 py-3.5 text-sm font-semibold transition-opacity hover:opacity-90"
            style={{
              backgroundColor: "var(--color-accent)",
              color: "var(--color-bg)",
            }}
          >
            Create your first quiz
          </Link>
        </FadeUp>
      </div>
    </section>
  );
}
