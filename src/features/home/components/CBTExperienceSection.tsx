import FadeUp from "@/shared/components/FadeUp";
import CBTExperienceMock from "./CBTExperienceMock";

export default function CBTExperienceSection() {
  return (
    <section className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <FadeUp>
          <div
            className="rounded-3xl p-8 md:p-14 lg:p-16 text-center"
            style={{
              backgroundColor: "var(--color-coral-surface)",
            }}
          >
            <h2
              className="text-4xl md:text-5xl leading-tight text-text-primary mb-6"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Sit down and take the test.
            </h2>
            <p className="text-lg text-text-secondary leading-relaxed max-w-2xl mx-auto">
              Prep gives you the parts that matter when you&apos;re practicing for a CBT: your questions, a timer, clear answer choices, and a simple way to move through the test and submit it when you&apos;re finished.
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