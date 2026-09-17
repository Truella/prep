import FadeUp from "@/shared/components/FadeUp";
import SectionHeading from "./SectionHeading";
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
            <SectionHeading accent="coral" className="text-4xl md:text-5xl leading-tight mb-6">
              Sit down and take the <em>test.</em>
            </SectionHeading>
            <p className="text-lg text-text-secondary leading-relaxed max-w-2xl mx-auto">
              Once your questions are in Prep, you get a CBT-style environment to take the test. Set a timer, work through your questions, select your answers, and submit when you&apos;re finished.
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