"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Sun01Icon,
  Moon01Icon,
  Menu01Icon,
  Cancel01Icon,
} from "@hugeicons/core-free-icons";
import { useTheme } from "@/lib/theme";
import PaletteSwitcher from "@/shared/components/PaletteSwitcher";

const NAV_LINKS = [
  { href: "/take", label: "Take a Quiz" },
  { href: "/quiz-bank", label: "Quiz Bank" },
  { href: "/docs/getting-started", label: "Docs" },
];

const DESKTOP_NAV_LINKS = [{ href: "/", label: "Home" }, ...NAV_LINKS];

function isNavLinkActive(pathname: string, href: string) {
  return pathname === href || (href.startsWith("/docs") && pathname.startsWith("/docs"));
}

export default function ExternalNav() {
  const { setTheme, resolvedTheme } = useTheme();
  const pathname = usePathname();
  const isDark = resolvedTheme === "dark";
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 border-b border-border bg-bg/80 backdrop-blur-md">
      <Link
        href="/"
        className="font-mono text-lg font-bold text-text-primary tracking-tight"
      >
        PREP
      </Link>

      {/* Desktop nav */}
      <div className="absolute left-1/2 hidden -translate-x-1/2 sm:flex items-center gap-6">
        {DESKTOP_NAV_LINKS.map((link) => {
          const isActive = isNavLinkActive(pathname, link.href);

          return (
            <Link
              key={link.href}
              href={link.href}
              aria-current={isActive ? "page" : undefined}
              className={
                isActive
                  ? "text-sm text-text-primary font-medium transition"
                  : "text-sm text-text-secondary hover:text-text-primary transition"
              }
            >
              {link.label}
            </Link>
          );
        })}
      </div>

      <div className="hidden sm:flex items-center gap-6">
        <Link
          href="/auth"
          className="text-sm px-4 py-1.5 rounded-lg border border-border text-text-primary hover:bg-surface transition"
        >
          Sign in
        </Link>
        <button
          onClick={() => setTheme(isDark ? "light" : "dark")}
          aria-label="Toggle theme"
          className="w-8 h-8 flex items-center justify-center rounded-lg border border-border text-text-secondary hover:text-text-primary hover:bg-surface transition"
        >
          {resolvedTheme ? (
            <HugeiconsIcon icon={isDark ? Sun01Icon : Moon01Icon} size={16} />
          ) : (
            <span className="w-4" />
          )}
        </button>
        <PaletteSwitcher />
      </div>

      {/* Mobile — theme toggle + hamburger */}
      <div className="flex sm:hidden items-center gap-2">
        <button
          onClick={() => setTheme(isDark ? "light" : "dark")}
          aria-label="Toggle theme"
          className="w-8 h-8 flex items-center justify-center rounded-lg border border-border text-text-secondary hover:text-text-primary hover:bg-surface transition"
        >
          {resolvedTheme ? (
            <HugeiconsIcon icon={isDark ? Sun01Icon : Moon01Icon} size={16} />
          ) : (
            <span className="w-4" />
          )}
        </button>
        <PaletteSwitcher />
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
          className="w-8 h-8 flex items-center justify-center rounded-lg border border-border text-text-secondary hover:text-text-primary hover:bg-surface transition"
        >
          <HugeiconsIcon
            icon={menuOpen ? Cancel01Icon : Menu01Icon}
            size={16}
          />
        </button>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div
          className="absolute top-full left-0 right-0 flex sm:hidden flex-col gap-2 p-4 border-b border-border bg-bg/95 backdrop-blur-md"
          style={{ zIndex: 60 }}
        >
          {NAV_LINKS.map((link) => {
            const isActive = isNavLinkActive(pathname, link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                aria-current={isActive ? "page" : undefined}
                className={
                  isActive
                    ? "text-sm text-text-primary font-medium transition py-2"
                    : "text-sm text-text-secondary hover:text-text-primary transition py-2"
                }
              >
                {link.label}
              </Link>
            );
          })}
          <Link
            href="/auth"
            onClick={() => setMenuOpen(false)}
            className="text-sm px-4 py-2.5 rounded-lg border border-border text-text-primary hover:bg-surface transition text-center"
          >
            Sign in
          </Link>
        </div>
      )}
    </nav>
  );
}
