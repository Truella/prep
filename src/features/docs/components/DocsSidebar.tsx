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
