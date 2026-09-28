"use client";

import FadeUp from "@/shared/components/FadeUp";
import SectionHeading from "./SectionHeading";
import AIReviewMock from "./AIReviewMock";

const BREAKDOWN_CARDS = [
  {
    title: "What you're good at",
    description: "See the topics and concepts you've consistently handled well.",
  },
  {
    title: "Where you're struggling",
    description: "Find the topics behind the questions you're getting wrong.",
  },
  {
    title: "What to study next",
    description: "Get a focused list of areas to revisit before your next attempt.",
  },
];

export default function AIReviewSection() {
  return (
    <section className="px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <div className="grid items-center gap-14 lg:grid-cols-[0.8fr_1.2fr]">
          <FadeUp>
            <SectionHeading
              accent="sky"
              eyebrow="After every attempt"
              className="mt-3 text-3xl md:text-4xl leading-tight"
            >
              A score tells you how you did. The review tells you what to do <em>next.</em>
            </SectionHeading>
            <p className="mt-5 max-w-md text-base leading-relaxed text-text-secondary">
              After an attempt, Prep looks at the questions you answered and the answers you selected to identify the areas you&apos;re doing well in and the ones you need to revisit.
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
                className="h-full rounded-2xl p-7 space-y-3"
                style={{
                  backgroundColor: "var(--color-sky-surface)",
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