import FadeUp from "@/shared/components/FadeUp";
import CSVImportMock from "./CSVImportMock";

export default function CSVImportSection() {
  return (
    <section className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div
          className="rounded-3xl p-8 md:p-14"
          style={{ backgroundColor: "var(--color-sage-surface)" }}
        >
        <div className="grid grid-cols-1 lg:grid-cols-[45%_55%] gap-10 md:gap-14 lg:items-center">
          <FadeUp className="flex justify-center lg:justify-start">
            <CSVImportMock />
          </FadeUp>
          <FadeUp delay={0.1}>
            <h2
              className="text-4xl md:text-5xl leading-tight text-text-primary mb-6"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Already have the questions? Don&apos;t <span className="italic text-sage-accent">type</span> them again.
            </h2>
            <p className="text-lg text-text-secondary leading-relaxed">
              Got a spreadsheet full of questions? A past-paper question bank? Notes you&apos;ve already organized? Upload your CSV and Prep turns it into a ready-to-take CBT.
            </p>
            <p className="mt-4 text-sm text-text-secondary">
              Generous upload limits, no restrictive row caps like standard form-builder extensions.
            </p>
          </FadeUp>
        </div>
        </div>
      </div>
    </section>
  );
}