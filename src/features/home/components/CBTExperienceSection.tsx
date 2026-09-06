import FadeUp from "@/shared/components/FadeUp";
import CBTExperienceMock from "./CBTExperienceMock";

export default function CBTExperienceSection() {
  return (
    <section className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <FadeUp>
          <div
            className="rounded-3xl border p-8 md:p-14 lg:p-16 text-center"
            style={{
              backgroundColor: "var(--color-surface)",
              borderColor: "var(--color-border)",
            }}
          >
            <h2
              className="text-4xl md:text-5xl leading-tight text-text-primary mb-6"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Practice the way you&apos;ll actually be <span className="italic text-accent">tested</span>.
            </h2>
            <p className="text-lg text-text-secondary leading-relaxed max-w-2xl mx-auto">
              Google Forms is great for collecting responses. Prep is built for practicing exams. Use a countdown timer, move through questions, submit your attempt, and see your results when you&apos;re done.
            </p>
            <div className="mt-12">
              <CBTExperienceMock />
            </div>
          </div>
        </FadeUp>
      </div>
    </section>
  );
}