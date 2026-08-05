"use client";

import FadeUp from "@/shared/components/FadeUp";
import AIReviewMock from "./AIReviewMock";

export default function AIReviewSection() {
  return (
    <section className="border-t border-border px-6 py-24">
      <div className="mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-[0.8fr_1.2fr]">
        <FadeUp>
          <p className="text-xs font-semibold uppercase tracking-widest text-accent">
            After every attempt
          </p>
          <h2
            className="mt-3 text-3xl md:text-4xl"
            style={{ fontFamily: "var(--font-display)" }}
          >
            See exactly what to review next.
          </h2>
          <p className="mt-5 max-w-md text-base leading-relaxed text-text-secondary">
            Turn your results into a focused study plan with feedback on weak areas,
            strengths, and the topics worth revisiting first.
          </p>
        </FadeUp>
        <FadeUp delay={0.1} className="flex justify-center lg:justify-end">
          <AIReviewMock />
        </FadeUp>
      </div>
    </section>
  );
}
