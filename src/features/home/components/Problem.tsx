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
            <SectionHeading accent="neutral" className="text-4xl md:text-5xl leading-tight mb-6">
              I already had the questions. Getting them into a CBT was the <em>problem.</em>
            </SectionHeading>
            <div className="space-y-4 text-lg text-text-secondary leading-relaxed">
              <p>
                I was preparing for CBT exams and already had questions from past papers and question banks. I wanted to practice with them in an actual CBT format, so I tried using Google Forms. The problem was getting hundreds of questions and answers into a usable quiz without typing everything by hand.
              </p>
              <p>
                I found tools that could import questions from CSV, but the free plans came with limits that made them difficult to use for a large question bank.
              </p>
              <p className="text-text-primary">
                So I built Prep.
              </p>
            </div>
          </div>

          {/* Visual Panel (approx 45%) */}
          <div className="lg:col-span-5 bg-surface rounded-3xl p-8 md:p-12 flex flex-col items-center justify-center min-h-[320px]">
            <div className="flex flex-col gap-3 w-full max-w-[240px]">
              {/* Box 1 */}
              <div className="bg-surface-raised rounded-xl p-4 flex items-center justify-center shadow-sm">
                <span className="text-sm font-medium text-text-primary font-mono">Spreadsheet</span>
              </div>
              
              {/* Arrow */}
              <div className="flex justify-center text-text-secondary py-1">
                <HugeiconsIcon icon={ArrowRight01Icon} size={20} className="rotate-90" />
              </div>
              
              {/* Box 2 */}
              <div className="bg-surface-raised rounded-xl p-4 flex items-center justify-center shadow-sm">
                <span className="text-sm font-medium text-text-secondary font-mono">Copy-paste</span>
              </div>
              
              {/* Arrow */}
              <div className="flex justify-center text-text-secondary py-1">
                <HugeiconsIcon icon={ArrowRight01Icon} size={20} className="rotate-90" />
              </div>
              
              {/* Box 3 */}
              <div className="bg-surface-raised rounded-xl p-4 flex items-center justify-center shadow-sm">
                <span className="text-sm font-medium text-text-primary font-mono">Form builder</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
