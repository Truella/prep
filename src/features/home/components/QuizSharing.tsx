import FadeUp from "@/shared/components/FadeUp";

const CARDS = [
  {
    title: "Study group",
    description: "Create a quiz for your friends and compare how everyone performs.",
  },
  {
    title: "Class",
    description: "Drop a practice test in the class group chat and compare scores before the real thing.",
  },
  {
    title: "Personal",
    description: "Build your own question bank and come back whenever you need another attempt.",
  },
];

export default function QuizSharing() {
  return (
    <section className="py-16 px-6">
      <div className="max-w-6xl mx-auto">
        <FadeUp className="max-w-2xl">
          <h2
            className="text-3xl md:text-4xl leading-tight text-text-primary mb-4"
            style={{ fontFamily: "var(--font-display)" }}
          >
            One quiz. One link. Everyone can{" "}
            <span className="italic text-amber-accent">practice</span>.
          </h2>
          <p className="text-base text-text-secondary leading-relaxed">
            Create a quiz once and send it wherever you want. Make it public for
            anyone to discover, or keep it private and share it with only the
            people you choose.
          </p>
        </FadeUp>

        <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {CARDS.map((card, i) => (
            <FadeUp key={card.title} delay={i * 0.08} className="h-full">
              <div
                className="h-full rounded-2xl p-5 space-y-2"
                style={{
                  backgroundColor: "var(--color-amber-surface)",
                }}
              >
                <h3
                  className="font-semibold text-sm"
                  style={{ color: "var(--color-text-primary)" }}
                >
                  {card.title}
                </h3>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: "var(--color-text-secondary)" }}
                >
                  {card.description}
                </p>
              </div>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}