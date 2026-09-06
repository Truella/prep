import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon } from "@hugeicons/core-free-icons";

export default function Problem() {
  return (
    <section className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6">
          {/* Text Panel (approx 55%) */}
          <div className="lg:col-span-7 bg-surface rounded-3xl p-8 md:p-12 border border-border flex flex-col justify-center">
            <h2 
              className="text-4xl md:text-5xl leading-tight text-text-primary mb-6"
              style={{ fontFamily: "var(--font-display)" }}
            >
              You shouldn&apos;t have to build a whole quiz just to <span className="italic text-accent">practice</span>.
            </h2>
            <p className="text-lg text-text-secondary leading-relaxed">
              You already have the questions. Maybe they&apos;re in a spreadsheet. Maybe they&apos;re from a past paper. Maybe someone sent you a question bank. But turning those questions into an actual CBT usually means copying and pasting hundreds of questions into a form, or dealing with import tools that put limits on how much you can upload. Prep was built to remove that step.
            </p>
          </div>

          {/* Visual Panel (approx 45%) */}
          <div className="lg:col-span-5 bg-surface rounded-3xl p-8 md:p-12 border border-border flex flex-col items-center justify-center min-h-[320px]">
            <div className="flex flex-col gap-3 w-full max-w-[240px]">
              {/* Box 1 */}
              <div className="bg-surface-raised border border-border rounded-xl p-4 flex items-center justify-center shadow-sm">
                <span className="text-sm font-medium text-text-primary font-mono">Spreadsheet</span>
              </div>
              
              {/* Arrow */}
              <div className="flex justify-center text-text-secondary py-1">
                <HugeiconsIcon icon={ArrowRight01Icon} size={20} className="rotate-90" />
              </div>
              
              {/* Box 2 */}
              <div className="bg-surface-raised border border-border rounded-xl p-4 flex items-center justify-center shadow-sm border-dashed">
                <span className="text-sm font-medium text-text-secondary font-mono">Copy-paste</span>
              </div>
              
              {/* Arrow */}
              <div className="flex justify-center text-text-secondary py-1">
                <HugeiconsIcon icon={ArrowRight01Icon} size={20} className="rotate-90" />
              </div>
              
              {/* Box 3 */}
              <div className="bg-surface-raised border border-border rounded-xl p-4 flex items-center justify-center shadow-sm">
                <span className="text-sm font-medium text-text-primary font-mono">Form builder</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
