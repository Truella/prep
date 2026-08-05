"use client";

import Link from "next/link";
import FadeUp from "@/shared/components/FadeUp";

export default function CTASection() {
  return (
    <section
      className="py-24 px-6"
      style={{ borderColor: "var(--color-border)" }}
    >
      <div className="max-w-2xl mx-auto text-center space-y-6">
        <FadeUp>
          <h2
            className="text-4xl md:text-5xl"
            style={{
              fontFamily: "var(--font-display)",
              color: "var(--color-text-primary)",
            }}
          >
            Your exam is coming.
          </h2>
          <p
            className="text-lg mt-3"
            style={{ color: "var(--color-text-secondary)" }}
          >
            Start practicing today. It&apos;s free.
          </p>
        </FadeUp>
        <FadeUp delay={0.1}>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Link
              href="/auth"
              className="px-8 py-4 rounded-xl font-semibold transition-all hover:opacity-90"
              style={{
                backgroundColor: "var(--color-accent)",
                color: "#0A0A0F",
              }}
            >
              Create your first quiz
            </Link>
            <Link
              href="/take"
              className="px-8 py-4 rounded-xl font-semibold border transition-all hover:bg-[var(--color-surface)]"
              style={{
                borderColor: "var(--color-border)",
                color: "var(--color-text-primary)",
              }}
            >
              Take a quiz
            </Link>
          </div>
        </FadeUp>
      </div>
    </section>
  );
}
