"use client";

import HeroCard from "./HeroCard";

export default function Hero() {
  return (
    <section className="pt-32 pb-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left — text */}
          <div className="space-y-8">
            <div className="space-y-2">
              <span
                className="text-xs font-mono font-semibold tracking-widest uppercase"
                style={{ color: "var(--color-accent)" }}
              >
                CBT & MCQ Exam Practice
              </span>
              <h1
                className="text-5xl md:text-6xl leading-tight"
                style={{
                  fontFamily: "var(--font-display)",
                  color: "var(--color-text-primary)",
                }}
              >
                Practice the way you&apos;ll be tested.
              </h1>
            </div>

            <p
              className="text-lg leading-relaxed max-w-lg"
              style={{ color: "var(--color-text-secondary)" }}
            >
              Build CBT practice tests from your own questions. Set a timer,
              share with your study group, and get AI feedback on exactly
              where you need to improve.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href="/auth"
                className="px-7 py-3.5 rounded-xl font-semibold text-sm transition-all hover:opacity-90"
                style={{
                  backgroundColor: "var(--color-accent)",
                  color: "#0A0A0F",
                }}
              >
                Start building free
              </a>
              <a
                href="/quiz-bank"
                className="px-7 py-3.5 rounded-xl font-semibold text-sm border transition-all hover:bg-[var(--color-surface)]"
                style={{
                  borderColor: "var(--color-border)",
                  color: "var(--color-text-primary)",
                }}
              >
                Browse Quiz Bank
              </a>
            </div>

            <p
              className="text-xs"
              style={{ color: "var(--color-text-secondary)" }}
            >
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