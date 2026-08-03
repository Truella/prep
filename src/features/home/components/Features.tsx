"use client";

import FadeUp from "@/shared/components/FadeUp";

const FEATURES = [
  {
    title: "Timed practice",
    description:
      "Set a countdown that matches your real exam conditions. Auto-submits when time runs out.",
    icon: "⏱",
  },
  {
    title: "AI performance review",
    description:
      "After each attempt, get a breakdown of your strengths and the specific topics you need to revisit.",
    icon: "◈",
  },
  {
    title: "CSV upload",
    description:
      "Turn your notes or past paper questions into a quiz in seconds. One spreadsheet, ready to share.",
    icon: "↑",
  },
  {
    title: "Public quiz bank",
    description:
      "Browse quizzes shared by others. Filter by subject and difficulty. No account needed to take.",
    icon: "⊞",
  },
  {
    title: "Share with anyone",
    description:
      "One link. Your study group can take the quiz immediately — no sign-up required for takers.",
    icon: "⇢",
  },
  {
    title: "Progress saved",
    description:
      "Close the tab and pick up exactly where you left off. Your answers are saved automatically.",
    icon: "◉",
  },
];

export default function Features() {
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
            Everything you need to prepare.
          </h2>
        </FadeUp>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((f, i) => (
            <FadeUp key={i} delay={i * 0.07}>
              <div
                className="p-6 rounded-2xl border space-y-3 h-full"
                style={{
                  backgroundColor: "var(--color-surface-raised)",
                  borderColor: "var(--color-border)",
                }}
              >
                <span
                  className="text-2xl"
                  style={{ color: "var(--color-accent)" }}
                >
                  {f.icon}
                </span>
                <h3
                  className="font-semibold text-sm"
                  style={{ color: "var(--color-text-primary)" }}
                >
                  {f.title}
                </h3>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: "var(--color-text-secondary)" }}
                >
                  {f.description}
                </p>
              </div>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}
