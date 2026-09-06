"use client";

import FadeUp from "@/shared/components/FadeUp";
import AIReviewMock from "./AIReviewMock";

const BREAKDOWN_CARDS = [
  {
    title: "What you're good at",
    description: "See the topics and concepts you've consistently handled well.",
  },
  {
    title: "Where you're struggling",
    description: "Identify the topics behind the questions you're getting wrong.",
  },
  {
    title: "What to study next",
    description: "Get a focused list of areas to revisit before your next attempt.",
  },
];

export default function AIReviewSection() {
  return (
    <section className="border-t border-border px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <div className="grid items-center gap-14 lg:grid-cols-[0.8fr_1.2fr]">
          <FadeUp>
            <p className="text-xs font-semibold uppercase tracking-widest text-accent">
              After every attempt
            </p>
            <h2
              className="mt-3 text-3xl md:text-4xl leading-tight text-text-primary"
              style={{ fontFamily: "var(--font-display)" }}
            >
              A score tells you how you did. We help you figure out{" "}
              <span className="italic text-accent">why</span>.
            </h2>
            <p className="mt-5 max-w-md text-base leading-relaxed text-text-secondary">
              Finishing with 64% doesn&apos;t tell you what to do tomorrow.
              Prep&apos;s AI review looks at the questions you answered and the
              answers you selected to identify patterns in your performance.
            </p>
          </FadeUp>
          <FadeUp delay={0.1} className="flex justify-center lg:justify-end">
            <AIReviewMock />
          </FadeUp>
        </div>

        <div className="mt-14 grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
          {BREAKDOWN_CARDS.map((card, i) => (
            <FadeUp key={card.title} delay={i * 0.08} className="h-full">
              <div
                className="h-full rounded-2xl border p-7 space-y-3"
                style={{
                  backgroundColor: "var(--color-surface-raised)",
                  borderColor: "var(--color-border)",
                }}
              >
                <h3
                  className="font-semibold text-base"
                  style={{ color: "var(--color-text-primary)" }}
                >
                  {card.title}
                </h3>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: "var(--color-text-secondary)" }}
                >
                  {card.description}
                </p>
              </div>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}