# PREP — Hero Section PRT
**Branch:** `feat/hero-rework`

Grounded against current repo structure (`src/features/home/components/`, `src/shared/navigation/`).

---

## COMMIT HERO-1 — Screen-height hero with max-height cap
**Commit:** `feat(home): screen-height hero with max-height cap`

---PROMPT---
Read `src/features/home/components/Hero.tsx` in full first.

Change the `<section>` wrapper so the hero fills the viewport on load instead of sizing to content. Use `min-height: 100dvh` (not `vh`, avoids mobile browser-chrome jump), and cap it with a `max-height` around 900-1000px for tall/ultra-wide screens so content doesn't float in empty space. Center the existing grid content vertically within that space (`flex` + `items-center` on the section, or equivalent).

Keep the existing `pt-32` top padding logic in mind, since `ExternalNav` is `fixed` and the hero needs to clear it. Don't change the two-column grid, text content, or `HeroCard` itself in this commit, layout height only.
---PROMPT---

**Verify:** Manual: hero fills the screen on load at common viewport heights (short laptop, tall desktop), doesn't overflow past max-height on a 1440p+ display, content still clears the fixed nav.

---

## COMMIT HERO-2 — Scantron grid background with cursor interaction
**Commit:** `feat(home): scantron grid background for hero`

---PROMPT---
Read `src/features/home/components/Hero.tsx` and `app/globals.css` in full first. Framer Motion is already a project dependency (see `HeroCard.tsx` for the existing usage pattern), use it rather than adding anything new.

Add a background layer to the hero section: a faint dot grid, evenly spaced, styled like a scantron/bubble-sheet (small circles, not squares or plain dots), using `--color-border` or a similarly muted existing token at low opacity so it reads as texture, not decoration. Keep it mostly static.

Add one restrained interactive moment: as the cursor moves over the hero, dots near the cursor brighten slightly (via a radial-gradient mask or per-dot opacity driven by distance from pointer position), fading back out as the cursor moves away. This should read as a subtle glow following the cursor, not a particle system, no dots moving, spawning, or trailing.

Respect `prefers-reduced-motion`: when reduced motion is preferred, render the static grid only, skip the pointer-tracking effect entirely (check the existing `@media (prefers-reduced-motion: no-preference)` block in `globals.css` for the project's convention here).

Background layer must sit behind the existing two-column content (text left, `HeroCard` right) without interfering with pointer events on links/buttons, use `pointer-events-none` on the grid layer itself and track cursor position at the section level.
---PROMPT---

**Verify:** `npm run typecheck` passes. Manual: grid visible but subtle in both themes, brightens near cursor, static when reduced-motion is on, doesn't block clicks on hero buttons or the card.

---

## COMMIT HERO-3 — Three-zone nav with Home link
**Commit:** `feat(nav): three-zone external nav layout`

---PROMPT---
Read `src/shared/navigation/ExternalNav.tsx` in full first.

Restructure the desktop nav (the `hidden sm:flex` block and its surrounding layout) into three zones instead of the current logo-left / everything-else-right layout:
- Left: existing `PREP` logo link
- Center: nav links, add a `Home` link (`href: "/"`) to the front of the existing `NAV_LINKS` array so it reads Home, Take a Quiz, Quiz Bank, Docs
- Right: Sign in link + theme toggle button, unchanged in content, just repositioned

Use the nav's existing `flex items-center justify-between` container as the outer three-zone structure (left / center / right groups), centering the middle group with something like `absolute left-1/2 -translate-x-1/2` or a three-column grid, whichever fits more cleanly with the existing `fixed` + `backdrop-blur-md` nav without breaking the mobile hamburger layout, which stays as is.

Don't change the mobile (`sm:hidden`) nav or dropdown, this commit is desktop-only.
---PROMPT---

**Verify:** `npm run lint` passes. Manual: at desktop widths, logo stays left, links visually centered independent of logo/right-side width, Sign in + theme toggle stay right, Home link navigates to `/`. Mobile nav unchanged.
