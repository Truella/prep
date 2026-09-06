"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import HeroCard from "./HeroCard";
import HeroIconField from "./HeroIconField";

export default function Hero() {
  const reducedMotion = useReducedMotion();
  const entrance = (delay: number, x = 0, y = 0) => ({
    initial: {
      opacity: 0,
      x: reducedMotion ? 0 : x,
      y: reducedMotion ? 0 : y,
    },
    animate: { opacity: 1, x: 0, y: 0 },
    transition: {
      duration: reducedMotion ? 0 : 0.55,
      delay: reducedMotion ? 0 : delay,
      ease: "easeOut" as const,
    },
  });

  return (
    <section className="relative lg:h-dvh lg:max-h-240 overflow-hidden flex items-center pt-32 pb-24 px-6">
      <HeroIconField />
      <div className="relative z-10 max-w-6xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left — text */}
          <div className="relative space-y-8">
            <div
              className="absolute -inset-x-10 -inset-y-14 -z-10 pointer-events-none"
              style={{
                backgroundColor: "var(--color-bg)",
                maskImage:
                  "radial-gradient(ellipse at center, black 35%, transparent 75%)",
                WebkitMaskImage:
                  "radial-gradient(ellipse at center, black 35%, transparent 75%)",
                transition: "background-color 0.3s ease",
              }}
            />
            <div className="space-y-2">
              <motion.span
                className="inline-block text-xs font-mono font-semibold tracking-widest uppercase text-accent"
                {...entrance(0.05, -16)}
              >
                CBT & MCQ Exam Practice
              </motion.span>
              <motion.h1
                className="text-5xl md:text-6xl leading-tight text-text-primary"
                style={{ fontFamily: "var(--font-display)" }}
                {...entrance(0.18, -32)}
              >
                Turn your questions into CBT practice.
              </motion.h1>
            </div>

            <motion.p
              className="text-lg leading-relaxed max-w-lg text-text-secondary"
              {...entrance(0.34, -24)}
            >
              Upload your questions, build a quiz, and practice like it&apos;s the real exam. When you&apos;re done, Prep shows you what you know, what you&apos;re missing, and what to study next.
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row gap-3"
              {...entrance(0.5, 0, 18)}
            >
              <Link
                href="/auth"
                className="px-7 py-3.5 rounded-xl text-center font-semibold text-sm transition-all hover:opacity-90 bg-accent text-bg"
              >
                Create a quiz
              </Link>
              <Link
                href="/take"
                className="px-7 py-3.5 rounded-xl text-center font-semibold text-sm border border-border text-text-primary transition hover:bg-surface"
              >
                Take a quiz
              </Link>
            </motion.div>

            <motion.p
              className="text-xs text-text-secondary"
              {...entrance(0.62, -10)}
            >
              Free to use. No account required to take a quiz.
            </motion.p>
          </div>

          {/* Right — animated card */}
          <motion.div
            className="flex justify-center lg:justify-end"
            {...entrance(0.75, 32)}
          >
            <HeroCard />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
