"use client";

import Accordion, { type AccordionItem } from "@/shared/components/Accordion";
import FadeUp from "@/shared/components/FadeUp";
import SectionHeading from "./SectionHeading";

const FAQ_ITEMS: AccordionItem[] = [
  {
    question: "Does Prep generate questions for me?",
    answer:
      "No. Prep works with questions you already have. You can upload them from a CSV or add them manually.",
  },
  {
    question: "How can I add questions?",
    answer:
      "You can upload a CSV question bank or create a quiz manually and add your questions through the quiz builder.",
  },
  {
    question: "Do quiz takers need an account?",
    answer:
      "No. People can take a shared quiz without creating an account.",
  },
  {
    question: "Can I make my quiz private?",
    answer:
      "Yes. You can choose whether your quiz is public or private.",
  },
  {
    question: "How does the AI review work?",
    answer:
      "After you finish a quiz, Prep reviews the questions and answers from your attempt to identify areas you're doing well in, areas you're struggling with, and what you should revisit.",
  },
  {
    question: "Can I set a timer?",
    answer:
      "Yes. You can set a timer for your quiz and practice under timed conditions.",
  },
  {
    question: "Can I reuse a quiz?",
    answer:
      "Yes. Once you've created a quiz, you can use it again for another practice attempt.",
  },
  {
    question: "What can I upload?",
    answer:
      "You can upload your question bank as a CSV file.",
  },
  {
    question: "Is there a limit on how many questions I can upload?",
    answer:
      "Prep supports large question banks without the restrictive row limits commonly found in free CSV import tools.",
  },
];

export default function FAQSection() {
  return (
    <section className="px-6 py-24">
      <div className="mx-auto max-w-3xl">
        <FadeUp>
          <SectionHeading accent="teal" className="text-3xl">
            Questions, <em>answered.</em>
          </SectionHeading>
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
