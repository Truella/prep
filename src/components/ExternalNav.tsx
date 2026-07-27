"use client";

import Link from "next/link";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";

export default function ExternalNav() {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    setMounted(true);
  }, []);

  const currentTheme = mounted ? resolvedTheme : "dark";

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)] bg-[var(--color-bg)]/80 backdrop-blur-md">
      <Link
        href="/"
        className="font-mono text-lg font-bold text-[var(--color-text-primary)] tracking-tight"
      >
        PREP
      </Link>

      <div className="flex items-center gap-6">
        <Link
          href="/take"
          className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition"
        >
          Take a Quiz
        </Link>
        <Link
          href="/quiz-bank"
          className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition"
        >
          Quiz Bank
        </Link>
        <Link
          href="/docs/getting-started"
          className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition"
        >
          Docs
        </Link>
        <Link
          href="/auth"
          className="text-sm px-4 py-1.5 rounded-lg border border-[var(--color-border)] text-[var(--color-text-primary)] hover:bg-[var(--color-surface)] transition"
        >
          Sign in
        </Link>

        {mounted && (
          <button
            onClick={() => setTheme(currentTheme === "dark" ? "light" : "dark")}
            aria-label="Toggle theme"
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface)] transition text-sm"
          >
            {currentTheme === "dark" ? "☀" : "☾"}
          </button>
        )}
      </div>
    </nav>
  );
}