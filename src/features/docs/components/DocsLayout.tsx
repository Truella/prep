"use client";

import type { ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import DocsSidebar from "./DocsSidebar";
import ExternalNav from "@/shared/navigation/ExternalNav";

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
            className="w-full px-4 py-2.5 rounded-xl text-sm focus-visible:ring-2 focus-visible:ring-accent transition"
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
