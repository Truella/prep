"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

export interface DropdownOption {
  value: string;
  label: string;
}

interface DropdownProps {
  value: string;
  onChange: (value: string) => void;
  options: DropdownOption[];
  placeholder?: string;
  ariaLabel?: string;
  className?: string;
  buttonClassName?: string;
}

export default function Dropdown({
  value,
  onChange,
  options,
  placeholder = "Select...",
  ariaLabel,
  className = "",
  buttonClassName = "",
}: DropdownProps) {
  const [open, setOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const reducedMotion = useReducedMotion();

  const selected = options.find((o) => o.value === value) ?? null;

  const close = () => {
    setOpen(false);
    setFocusedIndex(-1);
    buttonRef.current?.focus();
  };

  useEffect(() => {
    if (!open) return;
    const idx = options.findIndex((o) => o.value === value);
    setFocusedIndex(idx >= 0 ? idx : 0);
  }, [open, value, options]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setFocusedIndex(-1);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  useEffect(() => {
    if (!open || focusedIndex < 0) return;
    const el = listRef.current?.querySelector(`[data-index="${focusedIndex}"]`) as HTMLElement | null;
    el?.scrollIntoView({ block: "nearest" });
  }, [focusedIndex, open]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open) {
      if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        setOpen(true);
      }
      return;
    }
    if (e.key === "Escape") {
      e.preventDefault();
      close();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setFocusedIndex((prev) => (prev + 1) % options.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setFocusedIndex((prev) => (prev - 1 + options.length) % options.length);
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (focusedIndex >= 0) {
        onChange(options[focusedIndex].value);
        close();
      }
    } else if (e.key === "Tab") {
      setOpen(false);
    }
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <button
        ref={buttonRef}
        type="button"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        onKeyDown={handleKeyDown}
        className={`w-full flex items-center justify-between gap-2 px-4 py-2.5 rounded-xl text-sm text-left transition focus:outline-none focus:ring-2 focus:ring-text-primary/10 ${buttonClassName}`}
        style={{
          backgroundColor: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          color: selected ? "var(--color-text-primary)" : "var(--color-text-secondary)",
        }}
      >
        <span className="truncate">{selected ? selected.label : placeholder}</span>
        <svg
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
          aria-hidden
          className={`shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
          style={{ color: "var(--color-text-secondary)" }}
        >
          <path d="M3 5L7 9L11 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      <AnimatePresence>
        {open && (
          <motion.ul
            ref={listRef}
            role="listbox"
            aria-label={ariaLabel}
            initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -6 }}
            animate={reducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
            exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -6 }}
            transition={{ duration: reducedMotion ? 0.12 : 0.16 }}
            className="absolute z-30 mt-2 w-full max-h-64 overflow-auto rounded-xl border shadow-lg py-1 thin-scrollbar"
            style={{
              backgroundColor: "var(--color-surface)",
              borderColor: "var(--color-border)",
              scrollbarWidth: "thin",
              scrollbarColor: "var(--color-border) transparent",
            } as React.CSSProperties}
          >
            {options.map((opt, idx) => {
              const isSelected = opt.value === value;
              const isFocused = idx === focusedIndex;
              return (
                <li
                  key={opt.value}
                  data-index={idx}
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {
                    onChange(opt.value);
                    close();
                  }}
                  onMouseEnter={() => setFocusedIndex(idx)}
                  className={`px-4 py-2.5 text-sm cursor-pointer transition flex items-center justify-between ${isSelected ? "font-semibold" : ""}`}
                  style={{
                    backgroundColor: isFocused
                      ? "var(--color-surface-raised)"
                      : isSelected
                        ? "color-mix(in srgb, var(--color-surface-raised) 80%, transparent)"
                        : "transparent",
                    color: isSelected ? "var(--color-text-primary)" : "var(--color-text-secondary)",
                  }}
                >
                  <span>{opt.label}</span>
                  {isSelected && (
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                      <path d="M3 7L6 10L11 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </li>
              );
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
