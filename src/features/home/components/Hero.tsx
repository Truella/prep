"use client";

import Link from "next/link";
import HeroCard from "./HeroCard";
import HeroGrid from "./HeroGrid";

export default function Hero() {
  return (
    <section className="relative lg:h-dvh lg:max-h-240 overflow-hidden flex items-center pt-32 pb-24 px-6">
      <HeroGrid />
      <div className="relative z-10 max-w-6xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left — text */}
          <div className="space-y-8">
            <div className="space-y-2">
              <span className="text-xs font-mono font-semibold tracking-widest uppercase text-accent">
                CBT & MCQ Exam Practice
              </span>
              <h1
                className="text-5xl md:text-6xl leading-tight text-text-primary"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Practice the way you&apos;ll be tested.
              </h1>
            </div>

            <p className="text-lg leading-relaxed max-w-lg text-text-secondary">
              Build CBT practice tests from your own questions. Set a timer,
              share with your study group, and get AI feedback on exactly
              where you need to improve.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
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
            </div>

            <p className="text-xs text-text-secondary">
              Free to use. No card required.
            </p>
          </div>

          {/* Right — animated card */}
          <div className="flex justify-center lg:justify-end">
            <HeroCard />
          </div>
        </div>
      </div>
    </section>
  );
}
