"use client";

import Accordion, { type AccordionItem } from "@/shared/components/Accordion";
import FadeUp from "@/shared/components/FadeUp";

const FAQ_ITEMS: AccordionItem[] = [
  {
    question: "Does PREP cost anything?",
    answer:
      "PREP is free to use. You can create, share, and take quizzes without entering card details.",
  },
  {
    question: "Do quiz-takers need an account?",
    answer:
      "No. Anyone with the quiz link or code can start immediately without creating an account.",
  },
  {
    question: "How does the AI review work?",
    answer:
      "After an attempt, you can request feedback based on your results. It highlights strengths, weak areas, and what to review next; scoring itself is not done by AI.",
  },
  {
    question: "Can I reuse and share a quiz again?",
    answer:
      "Yes. Keep the same quiz for repeated practice and share its link with as many study groups as you need.",
  },
  {
    question: "Is there a question limit?",
    answer:
      "You can build substantial practice sets manually or by CSV. For the best taking experience, split very large syllabuses into focused quizzes.",
  },
];

export default function FAQSection() {
  return (
    <section className="border-t border-border px-6 py-24">
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
