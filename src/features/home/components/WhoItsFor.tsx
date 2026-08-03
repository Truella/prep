"use client";

import FadeUp from "@/shared/components/FadeUp";

const USE_CASES = [
  {
    title: "Solo exam prep",
    description:
      "Build your own question bank from past papers and textbook chapters. Practice under timed conditions until the format feels familiar.",
  },
  {
    title: "Study groups",
    description:
      "One person creates the quiz, everyone else takes it. Compare scores, discuss the questions you all got wrong.",
  },
  {
    title: "Educators",
    description:
      "Set practice tests for your students without managing accounts. Share a link, they take it, you share results.",
  },
];

export default function WhoItsFor() {
  return (
    <section
      className="py-24 px-6 border-t"
      style={{
        borderColor: "var(--color-border)",
        backgroundColor: "var(--color-surface)",
      }}
    >
      <div className="max-w-6xl mx-auto">
        <FadeUp>
          <h2
            className="text-3xl mb-12"
            style={{
              fontFamily: "var(--font-display)",
              color: "var(--color-text-primary)",
            }}
          >
            Built for how people actually study.
          </h2>
        </FadeUp>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {USE_CASES.map((uc, i) => (
            <FadeUp key={i} delay={i * 0.1}>
              <div
                className="p-6 rounded-2xl border h-full space-y-3"
                style={{
                  backgroundColor: "var(--color-surface-raised)",
                  borderColor: "var(--color-border)",
                }}
              >
                <h3
                  className="font-semibold text-sm"
                  style={{ color: "var(--color-text-primary)" }}
                >
                  {uc.title}
                </h3>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: "var(--color-text-secondary)" }}
                >
                  {uc.description}
                </p>
              </div>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}
