"use client";

import Link from "next/link";
import FadeUp from "@/shared/components/FadeUp";
import SectionHeading from "./SectionHeading";
import HeroIconField from "./HeroIconField";

export default function CTASection() {
  return (
    <section
      className="relative overflow-hidden py-24 px-6"
    >
      <HeroIconField sparse />
      <div className="relative z-10 max-w-2xl mx-auto text-center space-y-6">
        <FadeUp>
          <SectionHeading accent="sage" className="text-4xl md:text-5xl">
            You already have the <em>questions.</em>
          </SectionHeading>
          <p
            className="text-lg mt-3"
            style={{ color: "var(--color-text-secondary)" }}
          >
            Turn them into a CBT and start practicing.
          </p>
        </FadeUp>
        <FadeUp delay={0.1}>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Link
              href="/auth"
              className="px-8 py-4 rounded-xl font-semibold transition-all hover:opacity-90"
              style={{
                backgroundColor: "var(--color-sage-accent)",
                color: "var(--color-bg)",
              }}
            >
              Create a quiz
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
