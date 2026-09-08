"use client";

import Link from "next/link";
import FadeUp from "@/shared/components/FadeUp";
import BringQuestionsMock from "./how-it-works-mocks/BringQuestionsMock";
import TimerSettingsMock from "./how-it-works-mocks/TimerSettingsMock";
import ShareQuizMock from "./how-it-works-mocks/ShareQuizMock";
import AIReviewStepMock from "./how-it-works-mocks/AIReviewStepMock";

const STEPS = [
  {
    number: "01",
    title: "Bring your questions",
    description:
      "Start with whatever you've already got — a spreadsheet, a past paper, a bank someone sent you. This part takes minutes, not the afternoon.",
    Mock: BringQuestionsMock,
    wide: true,
    surface: "var(--color-sage-surface)",
    accent: "var(--color-sage-accent)",
  },
  {
    number: "02",
    title: "Make it a real practice test",
    description:
      "Decide how real it feels. Set the timer, pick your settings, then sit the test like it's exam day.",
    Mock: TimerSettingsMock,
    wide: false,
    surface: "var(--color-coral-surface)",
    accent: "var(--color-coral-accent)",
  },
  {
    number: "03",
    title: "Share it",
    description:
      "The moment it leaves your hands. One link and your friends, classmates, or study group are taking the same test — no accounts, no setup.",
    Mock: ShareQuizMock,
    wide: false,
    surface: "var(--color-amber-surface)",
    accent: "var(--color-amber-accent)",
  },
  {
    number: "04",
    title: "Find out what to study",
    description:
      "Where the score becomes a study plan. Prep reads your attempt and tells you exactly what to revisit next.",
    Mock: AIReviewStepMock,
    wide: true,
    surface: "var(--color-sky-surface)",
    accent: "var(--color-sky-accent)",
  },
];

export default function HowItWorks() {
  return (
    <section className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <FadeUp>
          <h2
            className="text-4xl md:text-5xl mb-12"
            style={{
              fontFamily: "var(--font-display)",
              color: "var(--color-text-primary)",
            }}
          >
            From question bank to practice in <span className="italic text-coral-accent">minutes</span>.
          </h2>
        </FadeUp>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6">
          {STEPS.map((step, i) => {
            const Mock = step.Mock;
            return (
              <FadeUp
                key={step.number}
                delay={i * 0.08}
                className={`h-full ${step.wide ? "md:col-span-7" : "md:col-span-5"}`}
              >
                <div
                  className={`h-full rounded-3xl p-6 md:p-8 flex gap-6 ${
                    step.wide ? "flex-col md:flex-row md:items-center" : "flex-col"
                  }`}
                  style={{
                    backgroundColor: step.surface,
                  }}
                >
                  <div className="flex-1 min-w-0">
                    <span
                      className="text-xs font-mono font-bold inline-block mb-3"
                      style={{ color: step.accent }}
                    >
                      {step.number}
                    </span>
                    <h3
                      className="font-semibold text-base mb-2"
                      style={{ color: "var(--color-text-primary)" }}
                    >
                      {step.title}
                    </h3>
                    <p
                      className="text-sm leading-relaxed"
                      style={{ color: "var(--color-text-secondary)" }}
                    >
                      {step.description}
                    </p>
                  </div>
                  <div className="flex-shrink-0 w-full md:w-[320px]">
                    <Mock />
                  </div>
                </div>
              </FadeUp>
            );
          })}
        </div>

        <FadeUp delay={0.3} className="mt-10 text-center">
          <Link
            href="/auth"
            className="inline-block rounded-xl px-7 py-3.5 text-sm font-semibold transition-opacity hover:opacity-90"
            style={{
              backgroundColor: "var(--color-sage-accent)",
              color: "var(--color-bg)",
            }}
          >
            Create your first quiz
          </Link>
        </FadeUp>
      </div>
    </section>
  );
}