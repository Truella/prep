"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { supabase } from "@/lib/supabase";

const CODE_REGEX = /^[A-Z0-9]{6}$/;

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export default function TakeQuizModal({ isOpen, onClose }: Props) {
  const [input, setInput] = useState("");
  const [resolving, setResolving] = useState(false);
  const router = useRouter();
  const reducedMotion = useReducedMotion();
  const modalRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const cancelledRef = useRef(false);

  const handleClose = () => {
    if (resolving) return;
    cancelledRef.current = true;
    onClose();
  };

  useEffect(() => {
    if (isOpen) {
      triggerRef.current = document.activeElement as HTMLElement | null;
      cancelledRef.current = false;
      const frame = requestAnimationFrame(() => {
        const el = modalRef.current?.querySelector<HTMLElement>('input, button, a, [tabindex]:not([tabindex="-1"])');
        el?.focus();
      });
      const onKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          e.preventDefault();
          handleClose();
          return;
        }
        if (e.key === "Tab" && modalRef.current) {
          const focusable = Array.from(
            modalRef.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])')
          ).filter((el) => el.offsetParent !== null);
          if (focusable.length === 0) {
            e.preventDefault();
            return;
          }
          const first = focusable[0];
          const last = focusable[focusable.length - 1];
          if (e.shiftKey) {
            if (document.activeElement === first) {
              e.preventDefault();
              last.focus();
            }
          } else if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      };
      document.addEventListener("keydown", onKeyDown);
      return () => {
        cancelAnimationFrame(frame);
        document.removeEventListener("keydown", onKeyDown);
      };
    } else {
      const trigger = triggerRef.current;
      if (trigger) {
        trigger.focus();
        triggerRef.current = null;
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
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

    const candidateCode = quizId.toUpperCase();
    if (CODE_REGEX.test(candidateCode)) {
      setResolving(true);
      cancelledRef.current = false;
      const { data, error } = await supabase
        .from("quizzes")
        .select("id")
        .eq("code", candidateCode)
        .maybeSingle();
      setResolving(false);

      if (cancelledRef.current) return;

      if (error || !data) {
        toast.error("No quiz found with that code");
        return;
      }
      router.push(`/quiz/${data.id}`);
      return;
    }

    router.push(`/quiz/${quizId}`);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={handleClose}
            aria-hidden="true"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reducedMotion ? 0 : 0.2 }}
          />

          {/* Modal wrapper — centered on desktop, bottom sheet on mobile */}
          <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4 pointer-events-none">
            <motion.div
              ref={modalRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby="take-quiz-title"
              className="pointer-events-auto w-full bg-surface sm:max-w-sm sm:rounded-2xl rounded-t-3xl sm:rounded-t-2xl border border-border shadow-2xl max-h-[min(55vh,520px)] sm:max-h-none overflow-y-auto"
              style={{
                backgroundColor: "var(--color-surface)",
                borderColor: "var(--color-border)",
              }}
              initial={
                reducedMotion
                  ? { opacity: 0 }
                  : { y: "100%", opacity: 0 }
              }
              animate={
                reducedMotion
                  ? { opacity: 1 }
                  : { y: "0%", opacity: 1 }
              }
              exit={
                reducedMotion
                  ? { opacity: 0 }
                  : { y: "100%", opacity: 0 }
              }
              transition={
                reducedMotion
                  ? { duration: 0.15 }
                  : { type: "spring", damping: 30, stiffness: 340, opacity: { duration: 0.2 } }
              }
            >
              <div className="p-6 sm:p-7 space-y-6">
                {/* Drag handle — mobile only */}
                <div className="sm:hidden flex justify-center -mt-1 mb-1">
                  <span className="h-1.5 w-10 rounded-full bg-border" />
                </div>

                {/* Close button */}
                <button
                  onClick={handleClose}
                  aria-label="Close"
                  disabled={resolving}
                  className="absolute right-4 top-4 sm:right-5 sm:top-5 w-8 h-8 flex items-center justify-center rounded-full border border-border text-text-secondary hover:text-text-primary hover:bg-surface-raised transition disabled:opacity-50"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                    <path d="M1 1L13 13M13 1L1 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                  </svg>
                </button>

                {/* Header */}
                <div className="text-center space-y-2 pr-6">
                  <p
                    className="text-xs font-mono font-semibold tracking-widest uppercase"
                    style={{ color: "var(--color-text-secondary)" }}
                  >
                    PREP
                  </p>
                  <h2
                    id="take-quiz-title"
                    className="text-2xl"
                    style={{ fontFamily: "var(--font-display)", color: "var(--color-text-primary)" }}
                  >
                    Take a quiz
                  </h2>
                  <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
                    Paste a quiz link or enter an ID to start.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-3">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="https://prep.app/quiz/... or code"
                    autoFocus
                    className="w-full px-4 py-3.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-text-primary/10 transition"
                    style={{
                      backgroundColor: "var(--color-surface-raised)",
                      border: "1px solid var(--color-border)",
                      color: "var(--color-text-primary)",
                    }}
                  />
                  <button
                    type="submit"
                    disabled={resolving}
                    className="w-full px-6 py-3.5 rounded-xl font-semibold text-sm transition-all hover:opacity-90 disabled:opacity-50"
                    style={{
                      backgroundColor: "var(--color-text-primary)",
                      color: "var(--color-bg)",
                    }}
                  >
                    {resolving ? "Looking up..." : "Start Quiz"}
                  </button>
                </form>

                <div className="text-center space-y-2">
                  <p className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
                    or
                  </p>
                  <Link
                    href="/quiz-bank"
                    onClick={handleClose}
                    className="text-sm font-medium"
                    style={{ color: "var(--color-text-primary)" }}
                  >
                    Browse public quizzes →
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
