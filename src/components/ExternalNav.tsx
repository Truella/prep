"use client";

import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { Sun01Icon, Moon01Icon } from "@hugeicons/core-free-icons";
import { useTheme } from "../lib/theme";

export default function ExternalNav() {
  const { setTheme, resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 border-b border-border bg-bg/80 backdrop-blur-md">
      <Link
        href="/"
        className="font-mono text-lg font-bold text-text-primary tracking-tight"
      >
        PREP
      </Link>

      <div className="flex items-center gap-6">
        <Link
          href="/take"
          className="text-sm text-text-secondary hover:text-text-primary transition"
        >
          Take a Quiz
        </Link>
        <Link
          href="/quiz-bank"
          className="text-sm text-text-secondary hover:text-text-primary transition"
        >
          Quiz Bank
        </Link>
        <Link
          href="/docs/getting-started"
          className="text-sm text-text-secondary hover:text-text-primary transition"
        >
          Docs
        </Link>
        <Link
          href="/auth"
          className="text-sm px-4 py-1.5 rounded-lg border border-border text-text-primary hover:bg-surface transition"
        >
          Sign in
        </Link>

        <button
          onClick={() => setTheme(isDark ? "light" : "dark")}
          aria-label="Toggle theme"
          className="w-8 h-8 flex items-center justify-center rounded-lg border border-border text-text-secondary hover:text-text-primary hover:bg-surface transition"
        >
          {resolvedTheme ? (
            <HugeiconsIcon icon={isDark ? Sun01Icon : Moon01Icon} size={16} />
          ) : (
            <span className="w-4" />
          )}
        </button>
      </div>
    </nav>
  );
}