"use client";

import Accordion, { type AccordionItem } from "@/shared/components/Accordion";
import FadeUp from "@/shared/components/FadeUp";

const FAQ_ITEMS: AccordionItem[] = [
  {
    question: "Does Prep generate questions for me?",
    answer:
      "Not currently. Prep is designed for the questions you already have. You can upload them through CSV or create them manually using the quiz builder.",
  },
  {
    question: "How can I add questions?",
    answer:
      "You can either add questions manually through the quiz builder or upload them using a CSV file.",
  },
  {
    question: "Do quiz takers need an account?",
    answer:
      "No. You can share a quiz link and people can take it without creating an account.",
  },
  {
    question: "Can I make my quiz private?",
    answer:
      "Yes. You can choose whether your quiz is publicly available or private.",
  },
  {
    question: "How does the AI review work?",
    answer:
      "After you submit a quiz, Prep uses the questions and your selected answers as context to analyze your performance and highlight areas you should revisit.",
  },
  {
    question: "Can I set a timer?",
    answer:
      "Yes. You can set a countdown to simulate exam conditions. The quiz automatically submits when the timer runs out.",
  },
  {
    question: "Can I reuse a quiz?",
    answer:
      "Yes. Once you've created a quiz, you can share and take it again.",
  },
  {
    question: "What can I upload?",
    answer:
      "Prep currently supports CSV files formatted for quiz questions, with a generous per-quiz limit.",
  },
  {
    question: "Is there a limit on how many questions I can upload?",
    answer:
      "Yes, quizzes are capped at 250 questions, well above what a typical practice test needs. This keeps things fast without the restrictive low caps of standard form-builder extensions.",
  },
];

export default function FAQSection() {
  return (
    <section className="px-6 py-24">
      <div className="mx-auto max-w-3xl">
        <FadeUp>
          <h2
            className="text-3xl text-text-primary"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Questions, answered.
          </h2>
          <p className="mb-10 mt-3 text-sm text-text-secondary">
            What to know before creating or taking your first quiz.
          </p>
        </FadeUp>
        <FadeUp delay={0.1}>
          <Accordion items={FAQ_ITEMS} allowMultiple={false} headingLevel={3} />
        </FadeUp>
      </div>
    </section>
  );
}
