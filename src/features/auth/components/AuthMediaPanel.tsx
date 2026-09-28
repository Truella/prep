"use client";

import FadeUp from "@/shared/components/FadeUp";
import QuizBuildMock from "./QuizBuildMock";

export default function AuthMediaPanel() {
  return (
    <div className="relative flex h-full min-h-0 items-center overflow-hidden bg-sage-surface px-8 xl:px-12">
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
          <h1
            className="text-3xl text-text-primary xl:text-4xl leading-tight font-display"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Build a quiz without the <em style={{ color: "var(--color-sage-accent)", fontStyle: "italic" }}>busywork.</em>
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-text-secondary" style={{ fontFamily: "var(--font-ui)" }}>
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
