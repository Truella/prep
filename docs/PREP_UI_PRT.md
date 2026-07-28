# PREP — External Pages UI Overhaul
**Branch:** `feat/ui-external-pages`

```bash
git checkout main && git pull
git checkout -b feat/ui-external-pages
```

> Single PR covering homepage, quiz bank, take a quiz, and docs.
> Install dependencies first before any file edits.

```bash
npm install framer-motion next-themes
```

---

## Design system summary

**Dark theme tokens:**
- Background: `#0A0A0F`
- Surface: `#141418`
- Surface raised: `#1E1E26`
- Border: `#2A2A35`
- Text primary: `#F5F0E8`
- Text secondary: `#9999A8`
- Accent: `#E8C547`
- Accent dim: `#3D3410`

**Light theme tokens:**
- Background: `#F7F5F0`
- Surface: `#FFFFFF`
- Surface raised: `#F0EDE6`
- Border: `#E2DDD4`
- Text primary: `#0A0A0F`
- Text secondary: `#6B6870`
- Accent: `#B8960A`
- Accent dim: `#FBF3D0`

**Fonts:**
- Display: `DM Serif Display` — hero headline and score reveals only
- UI: `Inter` — all interface text
- Mono: `JetBrains Mono` — timer, scores, CSV blocks, quiz IDs

**Motion:**
- Question card cycle: upward slide, 400ms, easeOut
- Answer highlight: 200ms fill, easeInOut
- Section entrance: staggered fade-up, 60ms stagger between items
- Theme transition: 300ms on background and text
- Card hover: 150ms scale 1.02

---

## COMMIT UI-1 — Token system, fonts, theme provider
**Commit:** `feat(ui): design tokens, fonts, and theme provider`

---PROMPT---
Set up the design system foundation. Three files change: `app/globals.css`, `app/layout.tsx`, and two new components.

**Install dependencies first (if not done):**
```bash
npm install framer-motion next-themes
```

**Update `app/globals.css`** — Tailwind 4 uses `@theme` for custom tokens. Replace the entire file with:

```css
@import "tailwindcss";

@theme {
  --color-bg: #0A0A0F;
  --color-surface: #141418;
  --color-surface-raised: #1E1E26;
  --color-border: #2A2A35;
  --color-text-primary: #F5F0E8;
  --color-text-secondary: #9999A8;
  --color-accent: #E8C547;
  --color-accent-dim: #3D3410;

  --font-display: "DM Serif Display", Georgia, serif;
  --font-ui: "Inter", system-ui, sans-serif;
  --font-mono: "JetBrains Mono", "Fira Code", monospace;
}

/* Light theme overrides */
.light {
  --color-bg: #F7F5F0;
  --color-surface: #FFFFFF;
  --color-surface-raised: #F0EDE6;
  --color-border: #E2DDD4;
  --color-text-primary: #0A0A0F;
  --color-text-secondary: #6B6870;
  --color-accent: #B8960A;
  --color-accent-dim: #FBF3D0;
}

* {
  transition: background-color 0.3s ease, border-color 0.3s ease, color 0.15s ease;
}

body {
  margin: 0;
  padding: 0;
  background-color: var(--color-bg);
  color: var(--color-text-primary);
  font-family: var(--font-ui);
}
```

**Update `app/layout.tsx`** — add `next-themes`, `next/font`, and the `ExternalNav`. Read the current file before editing:

```tsx
import type { Metadata } from "next";
import { DM_Serif_Display, Inter, JetBrains_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "../src/context/AuthContext";
import { Toaster } from "react-hot-toast";
import ErrorBoundary from "../src/components/ErrorBoundary";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-ui",
  display: "swap",
});

const dmSerifDisplay = DM_Serif_Display({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-display",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "PREP — CBT & MCQ Exam Practice",
    template: "%s — PREP",
  },
  description:
    "Build and share CBT practice tests. Upload your questions, set a timer, and get AI feedback on your weak areas.",
  openGraph: {
    type: "website",
    siteName: "PREP",
    title: "PREP — CBT & MCQ Exam Practice",
    description:
      "Build and share CBT practice tests. Upload your questions, set a timer, and get AI feedback on your weak areas.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${dmSerifDisplay.variable} ${jetbrainsMono.variable}`}
    >
      <body>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <AuthProvider>
            <Toaster position="top-right" reverseOrder={false} />
            <ErrorBoundary>{children}</ErrorBoundary>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
```

**Create `src/components/ExternalNav.tsx`** — shared nav for all external pages:

```tsx
"use client";

import Link from "next/link";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function ExternalNav() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

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
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            aria-label="Toggle theme"
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface)] transition text-sm"
          >
            {theme === "dark" ? "☀" : "☾"}
          </button>
        )}
      </div>
    </nav>
  );
}
```
---PROMPT---

**Verify:** `npx tsc --noEmit` passes. App loads. Theme toggle switches between dark and light — background and text colours change with a smooth transition. PREP wordmark is visible in the nav.

---

## COMMIT UI-2 — Homepage
**Commit:** `feat(ui): homepage redesign with animated hero`

---PROMPT---
Rewrite `app/page.tsx` completely. This is a Server Component — do not add `"use client"`. Interactive parts (the animated hero card, section animations) are extracted into client components.

**The 5 demo questions for the hero carousel** — one per category/level, display-only, never touch the DB:

```ts
const DEMO_QUESTIONS = [
  {
    category: "Biology",
    level: "University",
    question: "Which enzyme is responsible for unwinding the DNA double helix during replication?",
    options: ["DNA Polymerase", "Helicase", "Ligase", "Primase"],
    correct: 1,
  },
  {
    category: "Mathematics",
    level: "Professional",
    question: "If f(x) = x³ - 3x² + 2x, what are the critical points of f?",
    options: ["x = 0 and x = 2", "x = 1 and x = 2", "x = 0 and x = 1", "x = -1 and x = 2"],
    correct: 0,
  },
  {
    category: "History",
    level: "Secondary",
    question: "The Treaty of Versailles, signed in 1919, formally ended which conflict?",
    options: ["The Crimean War", "World War I", "World War II", "The Franco-Prussian War"],
    correct: 1,
  },
  {
    category: "Technology",
    level: "Professional",
    question: "In computer networking, what does the acronym 'DNS' stand for?",
    options: ["Digital Network System", "Domain Name System", "Data Network Service", "Distributed Node Server"],
    correct: 1,
  },
  {
    category: "Economics",
    level: "University",
    question: "According to the law of demand, what happens to quantity demanded when price increases, ceteris paribus?",
    options: ["It increases", "It remains unchanged", "It decreases", "It doubles"],
    correct: 2,
  },
];
```

**Create `src/components/home/HeroCard.tsx`** — the animated question carousel:

```tsx
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const DEMO_QUESTIONS = [
  {
    category: "Biology",
    level: "University",
    question: "Which enzyme is responsible for unwinding the DNA double helix during replication?",
    options: ["DNA Polymerase", "Helicase", "Ligase", "Primase"],
    correct: 1,
  },
  {
    category: "Mathematics",
    level: "Professional",
    question: "If f(x) = x³ - 3x² + 2x, what are the critical points of f?",
    options: ["x = 0 and x = 2", "x = 1 and x = 2", "x = 0 and x = 1", "x = -1 and x = 2"],
    correct: 0,
  },
  {
    category: "History",
    level: "Secondary",
    question: "The Treaty of Versailles, signed in 1919, formally ended which conflict?",
    options: ["The Crimean War", "World War I", "World War II", "The Franco-Prussian War"],
    correct: 1,
  },
  {
    category: "Technology",
    level: "Professional",
    question: "In computer networking, what does the acronym 'DNS' stand for?",
    options: ["Digital Network System", "Domain Name System", "Data Network Service", "Distributed Node Server"],
    correct: 1,
  },
  {
    category: "Economics",
    level: "University",
    question: "According to the law of demand, what happens to quantity demanded when price increases, ceteris paribus?",
    options: ["It increases", "It remains unchanged", "It decreases", "It doubles"],
    correct: 2,
  },
];

const OPTION_LABELS = ["A", "B", "C", "D"];

export default function HeroCard() {
  const [index, setIndex] = useState(0);
  const [highlightedAnswer, setHighlightedAnswer] = useState<number | null>(null);

  useEffect(() => {
    // Highlight correct answer after 1.2s, then advance after another 1.8s
    const highlightTimer = setTimeout(() => {
      setHighlightedAnswer(DEMO_QUESTIONS[index].correct);
    }, 1200);

    const advanceTimer = setTimeout(() => {
      setHighlightedAnswer(null);
      setIndex((prev) => (prev + 1) % DEMO_QUESTIONS.length);
    }, 3200);

    return () => {
      clearTimeout(highlightTimer);
      clearTimeout(advanceTimer);
    };
  }, [index]);

  const q = DEMO_QUESTIONS[index];

  return (
    <div className="relative w-full max-w-md">
      {/* Progress dots */}
      <div className="flex gap-1.5 mb-4 justify-end">
        {DEMO_QUESTIONS.map((_, i) => (
          <div
            key={i}
            className="h-1 rounded-full transition-all duration-300"
            style={{
              width: i === index ? "24px" : "6px",
              backgroundColor:
                i === index
                  ? "var(--color-accent)"
                  : "var(--color-border)",
            }}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="rounded-2xl border p-6 space-y-5"
          style={{
            backgroundColor: "var(--color-surface)",
            borderColor: "var(--color-border)",
          }}
        >
          {/* Category + level */}
          <div className="flex items-center gap-2">
            <span
              className="text-xs font-semibold px-2 py-0.5 rounded font-mono"
              style={{
                backgroundColor: "var(--color-accent-dim)",
                color: "var(--color-accent)",
              }}
            >
              {q.category}
            </span>
            <span
              className="text-xs"
              style={{ color: "var(--color-text-secondary)" }}
            >
              {q.level}
            </span>
          </div>

          {/* Question */}
          <p
            className="text-sm font-medium leading-relaxed"
            style={{ color: "var(--color-text-primary)" }}
          >
            {q.question}
          </p>

          {/* Options */}
          <div className="space-y-2">
            {q.options.map((option, i) => {
              const isCorrect = i === q.correct;
              const isHighlighted = highlightedAnswer !== null && isCorrect;

              return (
                <motion.div
                  key={i}
                  animate={
                    isHighlighted
                      ? {
                          backgroundColor: "var(--color-accent-dim)",
                          borderColor: "var(--color-accent)",
                        }
                      : {
                          backgroundColor: "var(--color-surface-raised)",
                          borderColor: "var(--color-border)",
                        }
                  }
                  transition={{ duration: 0.2, ease: "easeInOut" }}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg border text-sm"
                >
                  <span
                    className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold font-mono transition-all duration-200"
                    style={{
                      backgroundColor: isHighlighted
                        ? "var(--color-accent)"
                        : "var(--color-border)",
                      color: isHighlighted
                        ? "#0A0A0F"
                        : "var(--color-text-secondary)",
                    }}
                  >
                    {OPTION_LABELS[i]}
                  </span>
                  <span
                    style={{
                      color: isHighlighted
                        ? "var(--color-text-primary)"
                        : "var(--color-text-secondary)",
                    }}
                  >
                    {option}
                  </span>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
```

**Create `src/components/home/FadeUp.tsx`** — reusable entrance animation wrapper:

```tsx
"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

export default function FadeUp({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, ease: "easeOut", delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
```

**Rewrite `app/page.tsx`:**

```tsx
import Link from "next/link";
import ExternalNav from "../src/components/ExternalNav";
import HeroCard from "../src/components/home/HeroCard";
import FadeUp from "../src/components/home/FadeUp";

const FEATURES = [
  {
    title: "Timed practice",
    description:
      "Set a countdown that matches your real exam conditions. Auto-submits when time runs out.",
    icon: "⏱",
  },
  {
    title: "AI performance review",
    description:
      "After each attempt, get a breakdown of your strengths and the specific topics you need to revisit.",
    icon: "◈",
  },
  {
    title: "CSV upload",
    description:
      "Turn your notes or past paper questions into a quiz in seconds. One spreadsheet, ready to share.",
    icon: "↑",
  },
  {
    title: "Public quiz bank",
    description:
      "Browse quizzes shared by others. Filter by subject and difficulty. No account needed to take.",
    icon: "⊞",
  },
  {
    title: "Share with anyone",
    description:
      "One link. Your study group can take the quiz immediately — no sign-up required for takers.",
    icon: "⇢",
  },
  {
    title: "Progress saved",
    description:
      "Close the tab and pick up exactly where you left off. Your answers are saved automatically.",
    icon: "◉",
  },
];

const STEPS = [
  {
    label: "Add your questions",
    description:
      "Build a question set manually or upload a CSV from your notes or past papers. Set an optional time limit.",
  },
  {
    label: "Share the link",
    description:
      "Copy the link and send it to your study group. No account needed to take the quiz.",
  },
  {
    label: "Review your results",
    description:
      "See your score, question-by-question breakdown, and an AI analysis of where you need to focus.",
  },
];

const USE_CASES = [
  {
    title: "Solo exam prep",
    description:
      "Build your own question bank from past papers and textbook chapters. Practice under timed conditions until the format feels familiar.",
  },
  {
    title: "Study groups",
    description:
      "One person creates the quiz, everyone else takes it. Compare scores, discuss the questions you all got wrong.",
  },
  {
    title: "Educators",
    description:
      "Set practice tests for your students without managing accounts. Share a link, they take it, you share results.",
  },
];

const SAMPLE_QUIZZES = [
  { title: "Cell Biology — Chapter 3", category: "Biology", difficulty: "Intermediate", taken: 142 },
  { title: "WAEC Mathematics 2023", category: "Mathematics", difficulty: "Advanced", taken: 891 },
  { title: "Introduction to Microeconomics", category: "Economics", difficulty: "Beginner", taken: 204 },
];

const DIFFICULTY_STYLES: Record<string, string> = {
  Beginner: "text-green-500 bg-green-500/10 border-green-500/20",
  Intermediate: "text-yellow-500 bg-yellow-500/10 border-yellow-500/20",
  Advanced: "text-red-500 bg-red-500/10 border-red-500/20",
};

export default function Home() {
  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "var(--color-bg)" }}
    >
      <ExternalNav />

      {/* Hero */}
      <section className="pt-32 pb-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left — text */}
            <div className="space-y-8">
              <div className="space-y-2">
                <span
                  className="text-xs font-mono font-semibold tracking-widest uppercase"
                  style={{ color: "var(--color-accent)" }}
                >
                  CBT &amp; MCQ Exam Practice
                </span>
                <h1
                  className="text-5xl md:text-6xl leading-tight"
                  style={{
                    fontFamily: "var(--font-display)",
                    color: "var(--color-text-primary)",
                  }}
                >
                  Practice the way you&apos;ll be tested.
                </h1>
              </div>

              <p
                className="text-lg leading-relaxed max-w-lg"
                style={{ color: "var(--color-text-secondary)" }}
              >
                Build CBT practice tests from your own questions. Set a timer,
                share with your study group, and get AI feedback on exactly
                where you need to improve.
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href="/auth"
                  className="px-7 py-3.5 rounded-xl font-semibold text-sm transition-all hover:opacity-90"
                  style={{
                    backgroundColor: "var(--color-accent)",
                    color: "#0A0A0F",
                  }}
                >
                  Start building free
                </Link>
                <Link
                  href="/quiz-bank"
                  className="px-7 py-3.5 rounded-xl font-semibold text-sm border transition-all hover:bg-[var(--color-surface)]"
                  style={{
                    borderColor: "var(--color-border)",
                    color: "var(--color-text-primary)",
                  }}
                >
                  Browse Quiz Bank
                </Link>
              </div>

              <p
                className="text-xs"
                style={{ color: "var(--color-text-secondary)" }}
              >
                Free to use. No card required.
              </p>
            </div>

            {/* Right — animated card */}
            <div className="flex justify-center lg:justify-end">
              <HeroCard />
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section
        className="py-24 px-6 border-t"
        style={{ borderColor: "var(--color-border)" }}
      >
        <div className="max-w-6xl mx-auto">
          <FadeUp>
            <h2
              className="text-3xl mb-2"
              style={{
                fontFamily: "var(--font-display)",
                color: "var(--color-text-primary)",
              }}
            >
              How it works
            </h2>
            <p
              className="text-sm mb-12"
              style={{ color: "var(--color-text-secondary)" }}
            >
              From your notes to a full practice test in minutes.
            </p>
          </FadeUp>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {STEPS.map((step, i) => (
              <FadeUp key={i} delay={i * 0.1}>
                <div className="space-y-3">
                  <span
                    className="text-xs font-mono font-bold"
                    style={{ color: "var(--color-accent)" }}
                  >
                    0{i + 1}
                  </span>
                  <h3
                    className="font-semibold text-base"
                    style={{ color: "var(--color-text-primary)" }}
                  >
                    {step.label}
                  </h3>
                  <p
                    className="text-sm leading-relaxed"
                    style={{ color: "var(--color-text-secondary)" }}
                  >
                    {step.description}
                  </p>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section
        className="py-24 px-6 border-t"
        style={{
          borderColor: "var(--color-border)",
          backgroundColor: "var(--color-surface)",
        }}
      >
        <div className="max-w-6xl mx-auto">
          <FadeUp>
            <h2
              className="text-3xl mb-12"
              style={{
                fontFamily: "var(--font-display)",
                color: "var(--color-text-primary)",
              }}
            >
              Everything you need to prepare.
            </h2>
          </FadeUp>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f, i) => (
              <FadeUp key={i} delay={i * 0.07}>
                <div
                  className="p-6 rounded-2xl border space-y-3 h-full"
                  style={{
                    backgroundColor: "var(--color-surface-raised)",
                    borderColor: "var(--color-border)",
                  }}
                >
                  <span
                    className="text-2xl"
                    style={{ color: "var(--color-accent)" }}
                  >
                    {f.icon}
                  </span>
                  <h3
                    className="font-semibold text-sm"
                    style={{ color: "var(--color-text-primary)" }}
                  >
                    {f.title}
                  </h3>
                  <p
                    className="text-sm leading-relaxed"
                    style={{ color: "var(--color-text-secondary)" }}
                  >
                    {f.description}
                  </p>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* Quiz Bank preview */}
      <section
        className="py-24 px-6 border-t"
        style={{ borderColor: "var(--color-border)" }}
      >
        <div className="max-w-6xl mx-auto">
          <FadeUp className="flex items-end justify-between mb-10">
            <div>
              <h2
                className="text-3xl mb-2"
                style={{
                  fontFamily: "var(--font-display)",
                  color: "var(--color-text-primary)",
                }}
              >
                From the Quiz Bank
              </h2>
              <p
                className="text-sm"
                style={{ color: "var(--color-text-secondary)" }}
              >
                Practice with quizzes shared by other students.
              </p>
            </div>
            <Link
              href="/quiz-bank"
              className="text-sm font-medium hidden sm:block"
              style={{ color: "var(--color-accent)" }}
            >
              Browse all →
            </Link>
          </FadeUp>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {SAMPLE_QUIZZES.map((quiz, i) => (
              <FadeUp key={i} delay={i * 0.1}>
                <div
                  className="p-5 rounded-2xl border space-y-3"
                  style={{
                    backgroundColor: "var(--color-surface)",
                    borderColor: "var(--color-border)",
                  }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3
                      className="font-semibold text-sm leading-snug"
                      style={{ color: "var(--color-text-primary)" }}
                    >
                      {quiz.title}
                    </h3>
                    <span
                      className={`shrink-0 text-xs font-medium px-2 py-0.5 rounded border ${DIFFICULTY_STYLES[quiz.difficulty]}`}
                    >
                      {quiz.difficulty}
                    </span>
                  </div>
                  <span
                    className="inline-block text-xs px-2 py-0.5 rounded font-mono"
                    style={{
                      backgroundColor: "var(--color-surface-raised)",
                      color: "var(--color-text-secondary)",
                    }}
                  >
                    {quiz.category}
                  </span>
                  <p
                    className="text-xs"
                    style={{ color: "var(--color-text-secondary)" }}
                  >
                    {quiz.taken.toLocaleString()} taken
                  </p>
                </div>
              </FadeUp>
            ))}
          </div>

          <div className="mt-6 sm:hidden text-center">
            <Link
              href="/quiz-bank"
              className="text-sm font-medium"
              style={{ color: "var(--color-accent)" }}
            >
              Browse all →
            </Link>
          </div>
        </div>
      </section>

      {/* Who it's for */}
      <section
        className="py-24 px-6 border-t"
        style={{
          borderColor: "var(--color-border)",
          backgroundColor: "var(--color-surface)",
        }}
      >
        <div className="max-w-6xl mx-auto">
          <FadeUp>
            <h2
              className="text-3xl mb-12"
              style={{
                fontFamily: "var(--font-display)",
                color: "var(--color-text-primary)",
              }}
            >
              Built for how people actually study.
            </h2>
          </FadeUp>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {USE_CASES.map((uc, i) => (
              <FadeUp key={i} delay={i * 0.1}>
                <div
                  className="p-6 rounded-2xl border h-full space-y-3"
                  style={{
                    backgroundColor: "var(--color-surface-raised)",
                    borderColor: "var(--color-border)",
                  }}
                >
                  <h3
                    className="font-semibold text-sm"
                    style={{ color: "var(--color-text-primary)" }}
                  >
                    {uc.title}
                  </h3>
                  <p
                    className="text-sm leading-relaxed"
                    style={{ color: "var(--color-text-secondary)" }}
                  >
                    {uc.description}
                  </p>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* CTA strip */}
      <section
        className="py-24 px-6 border-t"
        style={{ borderColor: "var(--color-border)" }}
      >
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <FadeUp>
            <h2
              className="text-4xl md:text-5xl"
              style={{
                fontFamily: "var(--font-display)",
                color: "var(--color-text-primary)",
              }}
            >
              Your exam is coming.
            </h2>
            <p
              className="text-lg mt-3"
              style={{ color: "var(--color-text-secondary)" }}
            >
              Start practicing today. It&apos;s free.
            </p>
          </FadeUp>
          <FadeUp delay={0.1}>
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <Link
                href="/auth"
                className="px-8 py-4 rounded-xl font-semibold transition-all hover:opacity-90"
                style={{
                  backgroundColor: "var(--color-accent)",
                  color: "#0A0A0F",
                }}
              >
                Create your first quiz
              </Link>
              <Link
                href="/take"
                className="px-8 py-4 rounded-xl font-semibold border transition-all hover:bg-[var(--color-surface)]"
                style={{
                  borderColor: "var(--color-border)",
                  color: "var(--color-text-primary)",
                }}
              >
                Take a quiz
              </Link>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* Footer */}
      <footer
        className="py-8 px-6 border-t"
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
    </div>
  );
}
```
---PROMPT---

**Verify:** Homepage loads with the new layout. Hero card animates through all 5 questions — correct answer highlights in amber, then slides to the next. Theme toggle switches between dark and light. All 6 sections render. Links navigate correctly.

---

## COMMIT UI-3 — Quiz Bank page
**Commit:** `feat(ui): quiz bank redesign`

---PROMPT---
Update `src/views/QuizBankView.tsx` and `src/components/quiz-bank/QuizBankCard.tsx` and `src/components/quiz-bank/QuizBankFilters.tsx`. Read all three files before editing.

**Update `src/views/QuizBankView.tsx`:**

```tsx
"use client";

import { useQuizBank } from "../hooks/useQuizBank";
import QuizBankFilters from "../components/quiz-bank/QuizBankFilters";
import QuizBankCard from "../components/quiz-bank/QuizBankCard";
import ExternalNav from "../components/ExternalNav";
import FadeUp from "../components/home/FadeUp";
import Link from "next/link";

export default function QuizBankView() {
  const {
    quizzes,
    loading,
    error,
    filters,
    setFilter,
    searchQuery,
    setSearchQuery,
  } = useQuizBank();

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--color-bg)" }}>
      <ExternalNav />

      <div className="max-w-6xl mx-auto px-6 pt-32 pb-24 space-y-10">
        <FadeUp>
          <div className="space-y-1">
            <h1
              className="text-4xl"
              style={{
                fontFamily: "var(--font-display)",
                color: "var(--color-text-primary)",
              }}
            >
              Quiz Bank
            </h1>
            <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
              Browse and take public quizzes created by the community.
            </p>
          </div>
        </FadeUp>

        <FadeUp delay={0.1}>
          <QuizBankFilters
            category={filters.category}
            difficulty={filters.difficulty}
            sort={filters.sort}
            searchQuery={searchQuery}
            onCategoryChange={(v) => setFilter("category", v)}
            onDifficultyChange={(v) => setFilter("difficulty", v)}
            onSortChange={(v) => setFilter("sort", v)}
            onSearchChange={setSearchQuery}
          />
        </FadeUp>

        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-48 rounded-2xl animate-pulse"
                style={{ backgroundColor: "var(--color-surface)" }}
              />
            ))}
          </div>
        )}

        {error && (
          <div
            className="text-center py-16 text-sm"
            style={{ color: "var(--color-text-secondary)" }}
          >
            Failed to load quizzes. Try refreshing.
          </div>
        )}

        {!loading && !error && quizzes.length === 0 && (
          <div className="text-center py-16 space-y-3">
            <p className="text-2xl">◎</p>
            <p className="font-medium" style={{ color: "var(--color-text-primary)" }}>
              No quizzes found
            </p>
            <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
              Try adjusting your filters, or{" "}
              <Link href="/auth" style={{ color: "var(--color-accent)" }}>
                create the first one
              </Link>
              .
            </p>
          </div>
        )}

        {!loading && !error && quizzes.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {quizzes.map((quiz, i) => (
              <FadeUp key={quiz.id} delay={i * 0.04}>
                <QuizBankCard quiz={quiz} />
              </FadeUp>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
```

**Update `src/components/quiz-bank/QuizBankCard.tsx`:**

```tsx
"use client";

import Link from "next/link";
import type { PublicQuiz } from "../../lib/types";

const DIFFICULTY_STYLES: Record<string, string> = {
  Beginner: "text-green-500 border-green-500/20 bg-green-500/10",
  Intermediate: "text-yellow-500 border-yellow-500/20 bg-yellow-500/10",
  Advanced: "text-red-500 border-red-500/20 bg-red-500/10",
};

export default function QuizBankCard({ quiz }: { quiz: PublicQuiz }) {
  const stars = Math.round(quiz.average_rating ?? 0);

  return (
    <div
      className="group rounded-2xl border p-5 space-y-4 flex flex-col transition-all duration-150 hover:scale-[1.02]"
      style={{
        backgroundColor: "var(--color-surface)",
        borderColor: "var(--color-border)",
      }}
    >
      <div className="flex items-start justify-between gap-2 flex-1">
        <div className="space-y-2 flex-1">
          <h3
            className="font-semibold text-sm leading-snug"
            style={{ color: "var(--color-text-primary)" }}
          >
            {quiz.title}
          </h3>

          {quiz.description && (
            <p
              className="text-xs line-clamp-2 leading-relaxed"
              style={{ color: "var(--color-text-secondary)" }}
            >
              {quiz.description}
            </p>
          )}

          <div className="flex items-center gap-2 flex-wrap">
            {quiz.category && (
              <span
                className="text-xs px-2 py-0.5 rounded font-mono"
                style={{
                  backgroundColor: "var(--color-surface-raised)",
                  color: "var(--color-text-secondary)",
                }}
              >
                {quiz.category}
              </span>
            )}
            {quiz.difficulty && (
              <span
                className={`text-xs font-medium px-2 py-0.5 rounded border ${DIFFICULTY_STYLES[quiz.difficulty] ?? ""}`}
              >
                {quiz.difficulty}
              </span>
            )}
          </div>
        </div>
      </div>

      <div
        className="flex items-center justify-between text-xs pt-2 border-t"
        style={{
          borderColor: "var(--color-border)",
          color: "var(--color-text-secondary)",
        }}
      >
        <span>
          {"★".repeat(stars)}{"☆".repeat(5 - stars)}{" "}
          {quiz.average_rating ? quiz.average_rating.toFixed(1) : "—"}
        </span>
        <span>{quiz.times_taken.toLocaleString()} taken</span>
      </div>

      <Link
        href={`/quiz/${quiz.id}`}
        className="block w-full text-center px-4 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-90"
        style={{
          backgroundColor: "var(--color-accent)",
          color: "#0A0A0F",
        }}
      >
        Take Quiz
      </Link>
    </div>
  );
}
```

**Update `src/components/quiz-bank/QuizBankFilters.tsx`** — apply token system to all inputs and selects. The structure stays identical, just replace the hardcoded Tailwind color classes with CSS variable inline styles matching the token system. Input and select elements should use `backgroundColor: "var(--color-surface)"`, `borderColor: "var(--color-border)"`, `color: "var(--color-text-primary)"`. Keep all existing props and logic unchanged.

**Update `app/quiz-bank/page.tsx`** — add metadata:
```tsx
import type { Metadata } from "next";
import QuizBankView from "../../src/views/QuizBankView";

export const metadata: Metadata = {
  title: "Quiz Bank",
  description: "Browse and take public quizzes created by the community.",
};

export default function QuizBankPage() {
  return <QuizBankView />;
}
```
---PROMPT---

**Verify:** Quiz Bank page loads with the new layout and `ExternalNav`. Cards use amber Take Quiz button. Loading state shows skeleton cards. Empty state has the action link. Token system applies — light mode works correctly.

---

## COMMIT UI-4 — Take a Quiz entry page
**Commit:** `feat(ui): take a quiz entry page redesign`

---PROMPT---
Update `src/components/quiz/TakeQuizInputClient.tsx`. Read the current file before editing. Keep all existing logic (input state, router push, ID extraction from URL, form submit). Only the visual layer changes.

```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import ExternalNav from "../ExternalNav";

export default function TakeQuizInputClient() {
  const [input, setInput] = useState("");
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!input.trim()) {
      toast.error("Please enter a quiz link or ID");
      return;
    }

    let quizId = input.trim();

    if (input.includes("/quiz/")) {
      const parts = input.split("/quiz/");
      quizId = parts[1].split("?")[0];
    }

    if (!quizId) {
      toast.error("Invalid quiz link or ID");
      return;
    }

    router.push(`/quiz/${quizId}`);
  };

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: "var(--color-bg)" }}
    >
      <ExternalNav />

      <div className="flex-1 flex items-center justify-center px-6 pt-20">
        <div className="w-full max-w-sm space-y-8">
          {/* Wordmark */}
          <div className="text-center space-y-2">
            <p
              className="text-xs font-mono font-semibold tracking-widest uppercase"
              style={{ color: "var(--color-accent)" }}
            >
              PREP
            </p>
            <h1
              className="text-3xl"
              style={{
                fontFamily: "var(--font-display)",
                color: "var(--color-text-primary)",
              }}
            >
              Take a quiz
            </h1>
            <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
              Paste a quiz link or enter an ID to start.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="https://prep.app/quiz/..."
              autoFocus
              className="w-full px-4 py-3.5 rounded-xl text-sm focus:outline-none transition"
              style={{
                backgroundColor: "var(--color-surface)",
                border: "1px solid var(--color-border)",
                color: "var(--color-text-primary)",
              }}
            />
            <button
              type="submit"
              className="w-full px-6 py-3.5 rounded-xl font-semibold text-sm transition-all hover:opacity-90"
              style={{
                backgroundColor: "var(--color-accent)",
                color: "#0A0A0F",
              }}
            >
              Start Quiz
            </button>
          </form>

          <div className="text-center space-y-2">
            <p className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
              or
            </p>
            <Link
              href="/quiz-bank"
              className="text-sm font-medium"
              style={{ color: "var(--color-accent)" }}
            >
              Browse public quizzes →
            </Link>
          </div>

          <div className="text-center">
            <Link
              href="/"
              className="text-xs transition"
              style={{ color: "var(--color-text-secondary)" }}
            >
              ← Back to home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
```
---PROMPT---

**Verify:** Take a quiz page renders with `ExternalNav`. Form submission still works — entering a quiz ID navigates to `/quiz/:id`. Light mode applies correctly.

---

## COMMIT UI-5 — Docs token pass
**Commit:** `feat(ui): docs pages token system and ExternalNav`

---PROMPT---
Apply the token system to the docs section. Read `src/components/docs/DocsLayout.tsx`, `src/components/docs/DocsSidebar.tsx`, and `app/docs/[section]/page.tsx` before editing.

**Update `src/components/docs/DocsLayout.tsx`** — add `ExternalNav`, apply token system:

```tsx
"use client";

import type { ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import DocsSidebar from "./DocsSidebar";
import ExternalNav from "../ExternalNav";

const SECTIONS = [
  { slug: "getting-started", label: "Getting Started" },
  { slug: "csv-guide", label: "CSV Guide" },
  { slug: "troubleshooting", label: "Troubleshooting" },
  { slug: "question-tips", label: "Tips for Good Questions" },
];

export default function DocsLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const currentSlug =
    SECTIONS.find(
      (s) =>
        pathname === `/docs/${s.slug}` ||
        (s.slug === "getting-started" && pathname === "/docs"),
    )?.slug ?? "getting-started";

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "var(--color-bg)", color: "var(--color-text-primary)" }}
    >
      <ExternalNav />

      <div className="max-w-5xl mx-auto px-6 pt-28 pb-16">
        {/* Mobile section select */}
        <div className="md:hidden mb-6">
          <select
            aria-label="Documentation section"
            value={currentSlug}
            onChange={(e) => router.push(`/docs/${e.target.value}`)}
            className="w-full px-4 py-2.5 rounded-xl text-sm focus:outline-none transition"
            style={{
              backgroundColor: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              color: "var(--color-text-primary)",
            }}
          >
            {SECTIONS.map((s) => (
              <option key={s.slug} value={s.slug}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-12">
          <div className="hidden md:block">
            <DocsSidebar />
          </div>
          <main className="flex-1 min-w-0">{children}</main>
        </div>
      </div>
    </div>
  );
}
```

**Update `src/components/docs/DocsSidebar.tsx`** — apply token system to active/inactive states:

```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const SECTIONS = [
  { slug: "getting-started", label: "Getting Started" },
  { slug: "csv-guide", label: "CSV Guide" },
  { slug: "troubleshooting", label: "Troubleshooting" },
  { slug: "question-tips", label: "Tips for Good Questions" },
];

export default function DocsSidebar() {
  const pathname = usePathname();

  return (
    <nav className="w-52 shrink-0">
      <p
        className="text-xs font-mono font-semibold tracking-widest uppercase mb-4"
        style={{ color: "var(--color-accent)" }}
      >
        Docs
      </p>
      <ul className="space-y-0.5">
        {SECTIONS.map((s) => {
          const isActive =
            pathname === `/docs/${s.slug}` ||
            (s.slug === "getting-started" && pathname === "/docs");
          return (
            <li key={s.slug}>
              <Link
                href={`/docs/${s.slug}`}
                aria-current={isActive ? "page" : undefined}
                className="block px-3 py-2 rounded-lg text-sm transition"
                style={{
                  backgroundColor: isActive
                    ? "var(--color-accent-dim)"
                    : "transparent",
                  color: isActive
                    ? "var(--color-accent)"
                    : "var(--color-text-secondary)",
                  fontWeight: isActive ? 500 : 400,
                }}
              >
                {s.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
```

**Update the docs content components** — `GettingStarted.tsx`, `Troubleshooting.tsx`, `QuestionTips.tsx`, `CSVGuide.tsx`. Read each file before editing.

For each component, replace hardcoded color classes with CSS variable inline styles:
- `text-white` → `color: "var(--color-text-primary)"`
- `text-gray-300` / `text-gray-400` → `color: "var(--color-text-secondary)"`
- `bg-white/5 border border-white/10` → `backgroundColor: "var(--color-surface)"`, `border: "1px solid var(--color-border)"`
- `text-red-400` on error strings in Troubleshooting → keep as-is, it's semantic
- In `CSVGuide.tsx`: `<pre>` and `<code>` blocks use `fontFamily: "var(--font-mono)"`
- Buttons in `CSVGuide.tsx` (Copy, Download, Validate): use `backgroundColor: "var(--color-surface-raised)"`, `border: "1px solid var(--color-border)"`, `color: "var(--color-text-primary)"` for secondary buttons; the Validate button uses `backgroundColor: "var(--color-accent)"`, `color: "#0A0A0F"` as the primary action

Do not change any logic, content, or interactive behaviour in any docs component.
---PROMPT---

**Verify:** All four docs pages render with `ExternalNav`. Sidebar active state shows amber highlight. Light mode applies correctly across all docs pages. CSV validator still works. Sample download still works.

---

## PR Description
**Summary**
Full external pages UI overhaul. Token-based design system with dark/light theme switching via `next-themes`. DM Serif Display for display headings, JetBrains Mono for data/code, Inter for UI text. Homepage rebuilt with 6 content sections and an animated hero carousel cycling through 5 CBT-style demo questions across different categories and levels — correct answer highlights in amber then slides to the next question via Framer Motion. Quiz Bank gets a proper grid layout with skeleton loading, a redesigned empty state, and updated cards with amber CTAs. Take a Quiz entry page simplified and focused. Docs section gets ExternalNav and full token system pass with amber active states on the sidebar.

**New dependencies**
- `framer-motion`
- `next-themes`

**Changed files**
- `app/globals.css`
- `app/layout.tsx`
- `app/page.tsx`
- `app/quiz-bank/page.tsx`
- `src/components/ExternalNav.tsx` (new)
- `src/components/home/HeroCard.tsx` (new)
- `src/components/home/FadeUp.tsx` (new)
- `src/components/quiz/TakeQuizInputClient.tsx`
- `src/views/QuizBankView.tsx`
- `src/components/quiz-bank/QuizBankCard.tsx`
- `src/components/quiz-bank/QuizBankFilters.tsx`
- `src/components/docs/DocsLayout.tsx`
- `src/components/docs/DocsSidebar.tsx`
- `src/components/docs/GettingStarted.tsx`
- `src/components/docs/CSVGuide.tsx`
- `src/components/docs/Troubleshooting.tsx`
- `src/components/docs/QuestionTips.tsx`

**Checklist**
- [] `npm install framer-motion next-themes` completed
- [] `npx tsc --noEmit` passes
- [] `npx next lint` passes
- [] Hero card cycles through all 5 questions with amber highlight animation
- [] Theme toggle switches dark/light on all external pages
- [] All external page links navigate correctly
- [] Light mode readable and consistent across all 4 pages
- [] No `console.log` statements
- [] Branch up to date with `main`
