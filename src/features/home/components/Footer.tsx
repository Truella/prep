"use client";

import Link from "next/link";

export default function Footer() {
  return (
    <footer
      className="py-8 px-6"
      style={{
        borderColor: "var(--color-border)",
        backgroundColor: "var(--color-surface)",
      }}
    >
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <span
          className="font-mono text-sm font-bold"
          style={{ color: "var(--color-text-primary)" }}
        >
          PREP
        </span>
        <div className="flex gap-6">
          <Link
            href="/docs/getting-started"
            className="text-xs transition hover:text-[var(--color-text-primary)]"
            style={{ color: "var(--color-text-secondary)" }}
          >
            Docs
          </Link>
          <Link
            href="/quiz-bank"
            className="text-xs transition hover:text-[var(--color-text-primary)]"
            style={{ color: "var(--color-text-secondary)" }}
          >
            Quiz Bank
          </Link>
          <Link
            href="/auth"
            className="text-xs transition hover:text-[var(--color-text-primary)]"
            style={{ color: "var(--color-text-secondary)" }}
          >
            Sign in
          </Link>
        </div>
      </div>
    </footer>
  );
}
