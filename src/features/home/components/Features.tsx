"use client";

import FadeUp from "@/shared/components/FadeUp";

const FEATURES = [
  {
    title: "AI review",
    description:
      "Understand your weak areas and what to revisit after every attempt.",
    icon: "◈",
    hue: "sky",
  },
  {
    title: "Quiz builder",
    description:
      "Prefer to build from scratch? Add questions, options, answers, and settings directly in Prep.",
    icon: "+",
    hue: "sage",
  },
  {
    title: "Timed exams",
    description:
      "Practice against the clock and automatically submit when time runs out.",
    icon: "⏱",
    hue: "coral",
  },
  {
    title: "CSV import",
    description:
      "Turn an existing question bank into a quiz without typing every question manually.",
    icon: "↑",
    hue: "sage",
  },
  {
    title: "Shareable quizzes",
    description:
      "Send one link to your classmates, friends, or students.",
    icon: "⇢",
    hue: "amber",
  },
  {
    title: "Saved progress",
    description:
      "Close the tab and come back without losing your attempt.",
    icon: "◉",
    hue: "teal",
  },
  {
    title: "Public or private",
    description:
      "Share with everyone or keep your quiz restricted to the people you choose.",
    icon: "⊞",
    hue: "amber",
  },
];

const FEATURE_GROUPS = [
  {
    label: "Core Experience",
    prominent: true,
    features: [FEATURES[0], FEATURES[2], FEATURES[1]],
  },
  {
    label: "Study & Share",
    features: [FEATURES[3], FEATURES[4]],
  },
  {
    label: "Convenience",
    features: [FEATURES[6], FEATURES[5]],
  },
];

export default function Features() {
  return (
    <section
      className="py-24 px-6"
      style={{
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
            Built around the way CBT prep actually{" "}
            <span className="italic text-text-primary">works</span>.
          </h2>
        </FadeUp>

        <div className="space-y-10">
          {FEATURE_GROUPS.map((group, groupIndex) => (
            <div key={group.label}>
              <FadeUp delay={groupIndex * 0.05}>
                <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-text-secondary">
                  {group.label}
                </p>
              </FadeUp>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {group.features.map((feature, featureIndex) => (
                  <FadeUp
                    key={feature.title}
                    delay={0.08 + featureIndex * 0.12}
                    className="h-full"
                  >
                    <div
                      className={`h-full rounded-2xl space-y-3 ${
                        group.prominent ? "p-8 md:min-h-56" : "p-6"
                      }`}
                      style={{
                        backgroundColor: `var(--color-${feature.hue}-surface)`,
                      }}
                    >
                      <span
                        className={group.prominent ? "text-3xl" : "text-2xl"}
                        style={{ color: `var(--color-${feature.hue}-accent)` }}
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