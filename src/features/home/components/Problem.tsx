import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon } from "@hugeicons/core-free-icons";
import SectionHeading from "./SectionHeading";

export default function Problem() {
  return (
    <section className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6">
          {/* Text Panel (approx 55%) */}
          <div className="lg:col-span-7 bg-surface rounded-3xl p-8 md:p-12 flex flex-col justify-center">
            <SectionHeading accent="sage" className="text-4xl md:text-5xl leading-tight mb-6">
              You already have the questions. Getting them into a CBT is the <em>problem.</em>
            </SectionHeading>
            <div className="space-y-4 text-lg text-text-secondary leading-relaxed">
              <p>
                You have questions from past papers and question banks and want to practice them in a real CBT format. Turning hundreds of questions and answers into a usable test means entering everything by hand.
              </p>
              <p>
                Tools that import from CSV help, but their free-tier limits make them impractical for larger question banks.
              </p>
              <p className="text-text-primary">So I built Prep.</p>
            </div>
          </div>

          {/* Visual Panel (approx 45%) — transformation story */}
          <div className="lg:col-span-5 bg-surface rounded-3xl p-8 md:p-10 flex flex-col items-center justify-center min-h-[380px]">
            <div className="flex flex-col items-center w-full max-w-[280px] gap-2">
              {/* Top: Your questions */}
              <div className="w-full bg-surface-raised rounded-2xl p-5 shadow-sm border border-border/40">
                <p className="text-xs font-mono font-semibold tracking-widest uppercase text-text-secondary text-center mb-3">
                  Your questions
                </p>
                <div className="flex flex-col gap-2">
                  <div className="rounded-lg bg-surface border border-border/40 px-3 py-2 text-center">
                    <span className="text-xs font-medium text-text-secondary">Spreadsheet</span>
                  </div>
                  <div className="rounded-lg bg-surface border border-border/40 px-3 py-2 text-center">
                    <span className="text-xs font-medium text-text-secondary">Past papers</span>
                  </div>
                  <div className="rounded-lg bg-surface border border-border/40 px-3 py-2 text-center">
                    <span className="text-xs font-medium text-text-secondary">Question bank</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-center text-text-secondary py-0.5">
                <HugeiconsIcon icon={ArrowRight01Icon} size={20} className="rotate-90" />
              </div>

              {/* Middle: Prep */}
              <div className="rounded-full bg-text-primary text-bg px-6 py-2 shadow-sm">
                <span className="text-xs font-mono font-bold tracking-widest">PREP</span>
              </div>

              <div className="flex justify-center text-text-secondary py-0.5">
                <HugeiconsIcon icon={ArrowRight01Icon} size={20} className="rotate-90" />
              </div>

              {/* Bottom: CBT practice */}
              <div className="w-full bg-surface-raised rounded-2xl p-5 shadow-sm border border-border/40">
                <p className="text-xs font-mono font-semibold tracking-widest uppercase text-text-secondary text-center mb-3">
                  CBT practice
                </p>
                <div className="flex flex-wrap justify-center gap-1.5">
                  <span className="rounded-full bg-surface border border-border/40 px-2.5 py-1 text-xs font-medium text-text-secondary">
                    Questions
                  </span>
                  <span className="rounded-full bg-surface border border-border/40 px-2.5 py-1 text-xs font-medium text-text-secondary">
                    Timer
                  </span>
                  <span className="rounded-full bg-surface border border-border/40 px-2.5 py-1 text-xs font-medium text-text-secondary">
                    Navigation
                  </span>
                  <span className="rounded-full bg-surface border border-border/40 px-2.5 py-1 text-xs font-medium text-text-secondary">
                    Score
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
