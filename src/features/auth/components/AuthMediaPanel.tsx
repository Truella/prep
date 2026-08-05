"use client";

import FadeUp from "@/shared/components/FadeUp";
import QuizBuildMock from "./QuizBuildMock";

export default function AuthMediaPanel() {
  return (
    <div className="relative flex h-full min-h-0 items-center overflow-hidden bg-surface px-8 xl:px-12">
      <svg
        aria-hidden="true"
        className="absolute right-8 top-8 h-16 w-16 text-border"
        viewBox="0 0 64 64"
        fill="currentColor"
      >
        {[8, 24, 40, 56].flatMap((x) =>
          [8, 24, 40, 56].map((y) => <circle key={`${x}-${y}`} cx={x} cy={y} r="1.5" />),
        )}
      </svg>

      <div className="relative z-10 mx-auto mt-16 w-full max-w-md">
        <FadeUp>
          <p className="text-xs font-semibold uppercase tracking-widest text-accent">
            Quiz builder
          </p>
          <h1
            className="mt-2 text-3xl text-text-primary xl:text-4xl"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Build a quiz in minutes.
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-text-secondary">
            Add questions manually or upload a CSV, then share a ready-to-take practice test.
          </p>
        </FadeUp>
        <FadeUp delay={0.12} className="mt-6">
          <QuizBuildMock />
        </FadeUp>
      </div>
    </div>
  );
}
