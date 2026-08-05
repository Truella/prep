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

const FEATURE_GROUPS = [
  {
    label: "Core Experience",
    prominent: true,
    features: [FEATURES[1], FEATURES[0]],
  },
  {
    label: "Study & Share",
    features: [FEATURES[2], FEATURES[4]],
  },
  {
    label: "Convenience",
    features: [FEATURES[3], FEATURES[5]],
  },
];

export default function Features() {
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
            className="text-3xl mb-12"
            style={{
              fontFamily: "var(--font-display)",
              color: "var(--color-text-primary)",
            }}
          >
            Everything you need to prepare.
          </h2>
        </FadeUp>

        <div className="space-y-10">
          {FEATURE_GROUPS.map((group, groupIndex) => (
            <div key={group.label}>
              <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-text-secondary">
                {group.label}
              </p>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {group.features.map((feature, featureIndex) => (
                  <FadeUp
                    key={feature.title}
                    delay={(groupIndex * 2 + featureIndex) * 0.07}
                  >
                    <div
                      className={`h-full rounded-2xl border space-y-3 ${
                        group.prominent ? "p-8 md:min-h-56" : "p-6"
                      }`}
                      style={{
                        backgroundColor: "var(--color-surface-raised)",
                        borderColor: "var(--color-border)",
                      }}
                    >
                      <span
                        className={group.prominent ? "text-3xl" : "text-2xl"}
                        style={{ color: "var(--color-accent)" }}
                      >
                        {feature.icon}
                      </span>
                      <h3
                        className={`font-semibold ${group.prominent ? "text-base" : "text-sm"}`}
                        style={{ color: "var(--color-text-primary)" }}
                      >
                        {feature.title}
                      </h3>
                      <p
                        className="text-sm leading-relaxed"
                        style={{ color: "var(--color-text-secondary)" }}
                      >
                        {feature.description}
                      </p>
                    </div>
                  </FadeUp>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
