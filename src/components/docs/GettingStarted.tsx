export default function GettingStarted() {
  return (
    <div className="space-y-8">
      <div>
        <h1
          className="text-3xl font-bold mb-3"
          style={{
            fontFamily: "var(--font-display)",
            color: "var(--color-text-primary)",
          }}
        >
          Getting Started
        </h1>
        <p style={{ color: "var(--color-text-secondary)" }}>
          PREP lets you create and share multiple-choice quizzes. Build questions
          manually or upload a CSV, then share a link with anyone.
        </p>
      </div>
      <div className="space-y-4">
        <h2
          className="text-xl font-semibold"
          style={{ color: "var(--color-text-primary)" }}
        >
          Three steps
        </h2>
        {[
          { n: "1", t: "Create an account", d: "Sign up and go to your dashboard." },
          { n: "2", t: "Build your quiz", d: "Add questions manually in the builder, or upload a CSV. Set an optional time limit." },
          { n: "3", t: "Share the link", d: "Copy the shareable link and send it to anyone. No account needed to take a quiz." },
        ].map((s) => (
          <div
            key={s.n}
            className="flex gap-4 p-4 rounded-2xl border"
            style={{
              backgroundColor: "var(--color-surface)",
              borderColor: "var(--color-border)",
            }}
          >
            <span
              className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm"
              style={{
                backgroundColor: "var(--color-surface-raised)",
                color: "var(--color-text-primary)",
              }}
            >
              {s.n}
            </span>
            <div>
              <p
                className="font-medium"
                style={{ color: "var(--color-text-primary)" }}
              >
                {s.t}
              </p>
              <p
                className="text-sm mt-0.5"
                style={{ color: "var(--color-text-secondary)" }}
              >
                {s.d}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}