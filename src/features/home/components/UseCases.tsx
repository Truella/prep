"use client";

import FadeUp from "@/shared/components/FadeUp";

const USE_CASES = [
  {
    title: "Studying for an exam",
    description:
      "Turn past questions and your own question banks into CBT practice. Repeat until the format feels familiar.",
    large: true,
  },
  {
    title: "Studying with friends",
    description:
      "Build a quiz once. Send the link. Everyone takes the same test and compares their results.",
    large: false,
  },
  {
    title: "Teaching or tutoring",
    description:
      "Create practice tests for your students and give them a simple link to start.",
    large: false,
  },
];

export default function UseCases() {
  return (
    <section
      className="py-24 px-6"
      style={{
        borderColor: "var(--color-border)",
        backgroundColor: "var(--color-surface)",
      }}
    >
      <div className="max-w-6xl mx-auto">
        <FadeUp>
          <h2
            className="text-3xl md:text-4xl mb-12 leading-tight"
            style={{
              fontFamily: "var(--font-display)",
              color: "var(--color-text-primary)",
            }}
          >
            However you <span className="italic text-accent">study</span>, Prep fits in.
          </h2>
        </FadeUp>

        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 md:gap-6">
          {USE_CASES.filter((uc) => uc.large).map((uc) => (
            <FadeUp key={uc.title} className="md:col-span-4 h-full">
              <div
                className="h-full rounded-3xl border p-8 md:p-12 flex flex-col justify-center min-h-[260px]"
                style={{
                  backgroundColor: "var(--color-surface-raised)",
                  borderColor: "var(--color-border)",
                }}
              >
                <h3
                  className="text-2xl font-semibold mb-4"
                  style={{ color: "var(--color-text-primary)" }}
                >
                  {uc.title}
                </h3>
                <p
                  className="text-lg leading-relaxed max-w-md"
                  style={{ color: "var(--color-text-secondary)" }}
                >
                  {uc.description}
                </p>
              </div>
            </FadeUp>
          ))}

          <div className="md:col-span-2 grid grid-cols-1 gap-4 md:gap-6">
            {USE_CASES.filter((uc) => !uc.large).map((uc, i) => (
              <FadeUp key={uc.title} delay={0.1 + i * 0.08} className="h-full">
                <div
                  className="h-full rounded-3xl border p-6 space-y-3"
                  style={{
                    backgroundColor: "var(--color-surface-raised)",
                    borderColor: "var(--color-border)",
                  }}
                >
                  <h3
                    className="font-semibold text-base"
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
      </div>
    </section>
  );
}