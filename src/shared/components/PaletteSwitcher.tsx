"use client";

import { useEffect, useState, useRef } from "react";

const PALETTES = [
  { id: "1", color: "#6B4A28", name: "Earth" },
  { id: "2", color: "#576CBC", name: "Navy" },
  { id: "3", color: "#F2613F", name: "Rust" },
  { id: "4", color: "#1B2CC1", name: "Electric" },
  { id: "5", color: "#1F7D53", name: "Emerald" },
  { id: "6", color: "#2F2FE4", name: "Indigo" },
];

function getInitialPalette(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("palette");
}

export default function PaletteSwitcher() {
  const [open, setOpen] = useState(false);
  const [currentPalette, setCurrentPalette] = useState<string | null>(getInitialPalette);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (currentPalette) {
      document.documentElement.setAttribute("data-palette", currentPalette);
    }

    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [currentPalette]);

  const selectPalette = (id: string | null) => {
    setCurrentPalette(id);
    if (id) {
      document.documentElement.setAttribute("data-palette", id);
      localStorage.setItem("palette", id);
    } else {
      document.documentElement.removeAttribute("data-palette");
      localStorage.removeItem("palette");
    }
    setOpen(false);
  };

  return (
    <div className="relative flex items-center" ref={popoverRef}>
      <button
        onClick={() => setOpen(!open)}
        aria-label="Toggle palette"
        className="w-8 h-8 flex items-center justify-center rounded-lg border border-border text-text-secondary hover:text-text-primary hover:bg-surface transition"
      >
        <div className="w-3.5 h-3.5 rounded-full bg-accent" />
      </button>

      {open && (
        <div className="absolute top-full mt-2 right-0 p-2 rounded-xl border border-border bg-surface-raised shadow-lg z-50 flex flex-wrap gap-2 w-[140px]">
          {/* Default palette option */}
          <button
            onClick={() => selectPalette(null)}
            aria-label="Default Palette"
            className={`w-8 h-8 rounded-full flex items-center justify-center border transition ${
              currentPalette === null ? "border-text-primary" : "border-transparent hover:border-border"
            }`}
          >
            <div className="w-5 h-5 rounded-full bg-[#5B8CFF] dark:bg-[#5B8CFF]" />
          </button>
          
          {PALETTES.map((p) => (
            <button
              key={p.id}
              onClick={() => selectPalette(p.id)}
              aria-label={`Palette ${p.name}`}
              className={`w-8 h-8 rounded-full flex items-center justify-center border transition ${
                currentPalette === p.id ? "border-text-primary" : "border-transparent hover:border-border"
              }`}
            >
              <div
                className="w-5 h-5 rounded-full"
                style={{ backgroundColor: p.color }}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
