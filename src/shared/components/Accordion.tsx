"use client";

import { useId, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { PlusSignIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

export interface AccordionItem {
  question: string;
  answer: string;
}

interface AccordionProps {
  items: AccordionItem[];
  allowMultiple?: boolean;
  headingLevel?: 2 | 3 | 4 | 5 | 6;
}

export default function Accordion({
  items,
  allowMultiple = true,
  headingLevel = 3,
}: AccordionProps) {
  const idPrefix = useId();
  const [openItems, setOpenItems] = useState<Set<number>>(new Set());
  const Heading = `h${headingLevel}` as "h2" | "h3" | "h4" | "h5" | "h6";

  function toggleItem(index: number) {
    setOpenItems((current) => {
      const next = allowMultiple ? new Set(current) : new Set<number>();
      if (current.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-surface">
      {items.map((item, index) => {
        const isOpen = openItems.has(index);
        const buttonId = `${idPrefix}-button-${index}`;
        const panelId = `${idPrefix}-panel-${index}`;

        return (
          <div key={item.question} className={index ? "border-t border-border" : ""}>
            <Heading>
              <button
                id={buttonId}
                type="button"
                className="flex w-full items-center justify-between gap-6 px-5 py-5 text-left font-semibold text-text-primary focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-accent sm:px-6"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => toggleItem(index)}
              >
                <span>{item.question}</span>
                <motion.span
                  className="shrink-0 text-text-secondary"
                  animate={{ rotate: isOpen ? 45 : 0 }}
                  transition={{ duration: 0.2 }}
                  aria-hidden="true"
                >
                  <HugeiconsIcon icon={PlusSignIcon} size={20} />
                </motion.span>
              </button>
            </Heading>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  id={panelId}
                  role="region"
                  aria-labelledby={buttonId}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  className="overflow-hidden"
                >
                  <p className="px-5 pb-5 pr-14 text-sm leading-relaxed text-text-secondary sm:px-6 sm:pb-6 sm:pr-16">
                    {item.answer}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
