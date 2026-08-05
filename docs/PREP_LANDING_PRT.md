# PREP — Landing Page PRT
**Branch:** `feat/hero-rework` (covers the full landing page pass, not just the hero, per decision to ship this as one PR)

Grounded against current repo structure (`src/features/home/components/`, `src/shared/navigation/`, `app/page.tsx`). HERO-1 through HERO-3 were written and grounded before the folder restructure and `feat/dashboard-ux` merge; both have since landed on `master` (`617d9bd`). Re-verify those three commits still apply cleanly before starting HERO-4, the underlying files haven't changed shape, but confirm rather than assume.

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

## COMMIT HERO-2 — Canvas dot grid with cursor-proximity glow (fixed background)
**Commit:** `feat(home): canvas dot grid background with cursor interaction`

Supersedes an earlier CSS radial-gradient/mask attempt at this, which failed for two reasons worth knowing going in: `mask-image` needs a `-webkit-mask-image` fallback or WebKit ignores it entirely and renders unmasked, and CSS masks can't do the kind of per-dot scale/position animation this needs anyway. This commit replaces that approach with canvas, don't try to patch the mask version.

---PROMPT---
Read `src/features/home/components/Hero.tsx` in full first, and remove any existing `.hero-grid` CSS (base layer, `::after` layer, and the pointer motion-value plumbing in `Hero.tsx`) before starting, this commit replaces that approach entirely rather than building on it.

Create a new client component, `src/features/home/components/HeroGrid.tsx`, rendering a `<canvas>` that fills its container. Reference implementation for the technique (not to copy verbatim, but the mechanics should match): a `requestAnimationFrame` loop draws a grid of dots at rest positions spaced ~28px apart. For each dot, compute distance from the current pointer position:

- Outside an impact radius (~100px): draw at a flat low alpha (~0.3) in a single muted color, no motion.
- Inside the impact radius: apply a smoothstep falloff based on distance (closer to cursor = stronger effect), increasing the dot's alpha and scale, and offsetting its position slightly in a small orbit/wobble around its rest point, this is what produces the "bounce like ripples" feel, not a static glow.
- On pointer leave, ease the effect back out over ~0.5-0.7s (a decay curve, not an instant snap to rest state).

Color: use `--color-text-secondary` or `--color-border` (resolve the CSS variable at draw time via `getComputedStyle`, since canvas can't read CSS custom properties directly) for both the resting and glowing dot color, same hue throughout, only alpha/scale/position change with proximity. Do not introduce `--color-accent` here.

Respect `prefers-reduced-motion`: when reduced motion is preferred, render the static grid at rest alpha only, skip the animation loop and pointer tracking entirely.

Performance: pause the `requestAnimationFrame` loop via `IntersectionObserver` when the canvas scrolls out of view, and clean up the loop and observer on unmount.

Positioning: render `HeroGrid` as `position: fixed`, `inset: 0`, low `z-index`, behind all page content, `pointer-events: none` on the canvas itself (track pointer position via a `window` listener, not canvas-relative events, so it keeps working positioned fixed under scrolling content). Since every section after the hero in `app/page.tsx` already has an opaque background, the fixed canvas will naturally be covered once the user scrolls past the hero, no sticky-wrapper or scroll-based show/hide logic needed.

Mount `HeroGrid` inside `Hero.tsx`, behind the existing two-column content.
---PROMPT---

**Verify:** `npm run typecheck` passes. Manual: dots sit quiet and muted at rest, brighten and wobble near the cursor with a soft settle on leave (not an instant snap), stay fixed while scrolling past the hero, animation pauses when hero is out of view (check via performance/rAF tab), static grid only when reduced-motion is on, no interference with clicks on hero buttons or the card.

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

---

## COMMIT HERO-4 — Hero headline correction and dot legibility fix
**Commit:** `fix(home): hero headline copy and dot grid legibility near text`

---PROMPT---
Read `src/features/home/components/Hero.tsx` in full first.

Replace the current headline copy. It must not imply AI generates or grades the quiz, that capability doesn't exist yet, the only AI feature in the product is post-attempt feedback (see `src/features/quiz-taking/hooks/useAIReview.ts` and `QuizResults.tsx` if you want to confirm what's actually real). Direction: lean into the practice-then-know-what-to-fix loop, not a generation claim. Pick something in the spirit of "Practice like it's real. Know exactly what to fix after." or similar, keep it tight, matches the existing headline's length and rhythm.

Fix dot grid legibility behind the left-column text block: add a soft gradient overlay (`--color-bg` fading to transparent, positioned behind the text column, above the `HeroGrid` canvas, `pointer-events: none`) so the grid doesn't compete with the headline and body copy. Simplest approach: an absolutely positioned div with a `radial-gradient` or `linear-gradient` background sitting behind the text content only, not the full section, `HeroCard` on the right should keep the grid visible behind it.
---PROMPT---

**Verify:** Manual: headline no longer implies AI generation, dots visibly recede behind the text column while staying visible elsewhere in the hero.

---

## COMMIT HERO-5 — Remove standalone "Take a quiz" section
**Commit:** `refactor(home): remove TakeAQuizStrip, superseded by /take`

Confirmed before writing this: `TakeQuizInputClient.tsx` (used by `app/take/page.tsx`) already contains the same code/link resolution logic as `TakeAQuizStrip.tsx` (same `CODE_REGEX`, same Supabase lookup, same `router.push` targets). The hero's "Take a quiz" CTA already links to `/take`, not to this section. This is a clean duplicate removal, not a logic migration.

---PROMPT---
Delete `src/features/home/components/TakeAQuizStrip.tsx`. Remove its import and usage from `app/page.tsx`. Confirm no other file imports `TakeAQuizStrip` before deleting (repo-wide search).
---PROMPT---

**Verify:** `npm run typecheck` passes. Manual: landing page no longer shows the standalone quiz-code input section, hero's "Take a quiz" CTA still routes to `/take` and still works there.

---

## COMMIT HERO-6 — Connected workflow treatment for "How it works"
**Commit:** `feat(home): connected workflow layout for How it works`

---PROMPT---
Read `src/features/home/components/HowItWorks.tsx` in full first.

Replace the current `grid grid-cols-1 md:grid-cols-3 gap-8` card layout on desktop (`md:` and up) with a connected-workflow treatment: discrete step cards joined by routed lines, similar to a GitHub Actions workflow graph or an ER-diagram table relationship, not a single straight arrow between cards. Concretely: an SVG (or absolutely positioned line elements) drawn behind/between the three cards with orthogonal (right-angle) connector segments and a small terminator dot at each connection point, using `--color-border` for the line color, `--color-accent` only at the terminator dots.

On mobile (below `md:`), fall back to a vertical timeline: a single vertical line on the left with a dot at each step, cards stacked to its right, rather than the connector grid, which only makes sense at 3-column width.

Trim the three step descriptions to be shorter (roughly: "Create questions manually or upload a CSV. Add an optional timer." / "Share a link. Anyone can join instantly, no account required." / "Get your score, breakdown, and AI feedback on what to review."), keep the existing `01`/`02`/`03` mono numbering and hover-lift behavior as is.

Add a small CTA below the three steps: "Create your first quiz" linking to `/auth`, matching the existing accent-button style used elsewhere (see `CTASection.tsx` for the pattern).
---PROMPT---

**Verify:** `npm run typecheck` passes. Manual: desktop shows connected steps with routed lines and terminator dots, mobile shows a vertical timeline instead of the connector grid, CTA present and links to `/auth`.

---

## COMMIT HERO-7 — Regroup and reorder "Everything you need"
**Commit:** `refactor(home): group and reorder features by category`

---PROMPT---
Read `src/features/home/components/Features.tsx` in full first.

Regroup the existing six `FEATURES` entries into three categories, reorder AI first within its group, and keep every existing feature's title/description/icon as is, this is a grouping and ordering change, not a rewrite of the copy:

- **Core Experience** (2 items): AI performance review, Timed practice
- **Study & Share** (2 items): CSV upload, Share with anyone
- **Convenience** (2 items): Public quiz bank, Progress saved

Render each group under its own small label (e.g. a `text-xs uppercase tracking-wide` heading in `--color-text-secondary`, matching the weight used for category labels elsewhere like `HeroCard`'s category badge), with the first group's cards visually larger or more prominent than the other two, achieved via CSS grid spans (e.g. first group at `md:grid-cols-2` with taller/more padded cards, remaining groups at `md:grid-cols-3` with the existing compact card size), not by hardcoding different pixel dimensions per card.
---PROMPT---

**Verify:** `npm run typecheck` passes. Manual: AI performance review is the first feature shown, three visual groups are distinguishable, Core Experience group reads as more prominent than the other two.

---

## COMMIT HERO-8 — AI review preview component
**Commit:** `feat(home): animated AI review preview section`

Grounded against the real product behavior, not an invented mockup: `QuizResults.tsx` shows `{percentage}%` (rounded) and `"{earnedPoints} out of {totalPoints} points earned"`, pass threshold is 70%. The AI review itself (`useAIReview.ts`) returns a free-form string, but `renderReview()` in `QuizResults.tsx` already parses it into real paragraphs and bullet lists client-side, so a mock showing bulleted takeaways is an honest simplification, not an invented UI. Build this by mirroring the existing pattern in `src/features/home/components/HeroCard.tsx` (fixed-height static container, `AnimatePresence mode="wait"` swapping states via an `index` cycled with `setTimeout`, staggered `motion.div` children), don't invent a different animation approach.

Build this as a standalone, generically-named component (not landing-page-specific internally), it's intended to be reused in the auth page's media panel in a later, separate PR.

---PROMPT---
Read `src/features/home/components/HeroCard.tsx` in full first, this commit follows the same structural pattern (fixed-height container, `AnimatePresence`, `setTimeout`-driven state cycling, staggered children).

Create `src/features/home/components/AIReviewMock.tsx` (generic name, not landing-page-specific, since it will be reused elsewhere in a later PR). A fixed-height card cycling through four states on a loop, roughly 9s total:

1. **Results state** (~3s hold): a quiz result card showing a percentage score (mono font, matches how `QuizResults.tsx` renders `{percentage}%`), "X out of Y points earned" below it, and a "Get AI Review" button. This state must not imply AI computed the score, the score is just displayed as a given fact.
2. **Cursor click** (~0.5s): a small synthetic cursor (a plain circle with a subtle ring, absolutely positioned, animated via Framer Motion's `animate` prop to move toward the "Get AI Review" button) arrives and does a brief scale-down + ripple pulse on contact.
3. **Analyzing state** (~1.5s): a scanning/pulse visual treatment over the card (a horizontal line sweeping down, or a subtle pulsing opacity on the card content), signals processing without a generic spinner.
4. **AI review reveal** (~4s hold, longest of the four): a staggered bullet list of 2-3 short "weak area" style lines fading in one at a time, followed by a single one-line recommendation, styled consistent with how `renderReview()` in `QuizResults.tsx` renders bullets (small dot marker, `text-sm`, `text-gray-300`-equivalent using the existing color tokens instead of hardcoded gray).

After state 4, crossfade back to state 1 and loop.

Respect `prefers-reduced-motion`: skip the cycle and animation entirely, render state 4 (the AI review reveal) statically, that's the state actually proving the product claim.

Pause the animation cycle via `IntersectionObserver` when the component is scrolled out of view, same discipline as `HeroGrid` from HERO-2.

Create a new section component `src/features/home/components/AIReviewSection.tsx` that wraps `AIReviewMock` with a heading and short supporting copy (e.g. "See exactly what to review next" / one sentence on the AI feedback loop), matching the existing section shell pattern (`py-24 px-6 border-t`, `max-w-6xl mx-auto`, `FadeUp` on the heading) used by `Features.tsx` and `HowItWorks.tsx`.
---PROMPT---

**Verify:** `npm run typecheck` passes. Manual: cycles through all four states correctly, cursor animates and clicks convincingly, reveal state shows bulleted content, loops cleanly, pauses when scrolled out of view, reduced-motion shows the static reveal state only.

---

## COMMIT HERO-9 — Custom Accordion component and inline FAQ section
**Commit:** `feat(shared): custom accordion component, used by FAQ section`

Hand-rolled, not Radix/shadcn, this component is simple enough (toggle state, height/opacity animation) that a dependency isn't worth it. Framer Motion is already a project dependency (see `HeroCard.tsx`), use it for the expand/collapse animation rather than CSS transitions on `height: auto`, which doesn't animate natively.

A future, separate pass will replace the app's native `<select>` elements (nine of them across `DocsLayout.tsx`, `QuizBankFilters.tsx`, `PublishModal.tsx`, `PublishSettingsModal.tsx`, `MetaEditor.tsx`) with a custom `Select` built on `@radix-ui/react-select` rather than hand-rolled, that one needs real keyboard nav, positioning, and ARIA listbox behavior Radix already solves correctly. Not part of this commit, don't touch those files here.

---PROMPT---
Create `src/shared/components/Accordion.tsx`. A reusable accordion: an `AccordionItem` (or a single component taking an array of `{ question, answer }` items, whichever fits more naturally as a single-file component without over-abstracting) rendering a row with a clickable header (question text plus a chevron/plus icon from `@hugeicons/core-free-icons`, matching icons already used elsewhere in the repo) and an expandable content panel.

Expand/collapse via Framer Motion (`motion.div` with `animate`/`initial` on `height` and `opacity`, or `AnimatePresence` wrapping the content, follow whichever pattern is cleaner given how `HeroCard.tsx` already uses these). Chevron rotates on open. Only track open/closed per item, allow multiple items open at once unless a single-open-at-a-time behavior is clearly better for FAQ specifically, use your judgment but keep the component itself capable of either via a prop rather than hardcoding one behavior.

Style with existing tokens: `--color-border` for dividers, `--color-surface` for the row background, `--color-text-primary`/`--color-text-secondary` for question/answer text. Include proper accessibility basics: `aria-expanded` on the header button, and the content panel referenced via `aria-controls`/`id`.

Then create `src/features/home/components/FAQSection.tsx` using this `Accordion`. 4-6 question/answer pairs covering things a first-time visitor would actually ask (does it cost anything, do quiz-takers need an account, how does the AI review work, can quizzes be reused/shared again, is there a question limit), matching the existing section shell pattern (`py-24 px-6 border-t`, `max-w-6xl mx-auto` or narrower for readability, `FadeUp` on the heading).
---PROMPT---

**Verify:** `npm run typecheck` passes. `npm run lint` passes. Manual: each FAQ item expands/collapses independently with a smooth height animation (not an instant snap), keyboard-focusable and togglable via Enter/Space, styling matches the rest of the page.

---

## COMMIT HERO-10 — Reorder landing page sections
**Commit:** `refactor(home): reorder landing page sections`

---PROMPT---
Read `app/page.tsx` in full first.

Reorder the sections to: `Hero` → `HowItWorks` → `Features` → `AIReviewSection` (new, from HERO-8) → `QuizBankPreview` → `FAQSection` (new, from HERO-9) → `WhoItsFor` → `CTASection` → `Footer`. `TakeAQuizStrip` is already removed (HERO-5). Update imports accordingly.
---PROMPT---

**Verify:** `npm run typecheck` passes. `npm run lint` passes. `npm run test` passes. Manual: full page scroll shows sections in the new order, nothing broken by the reorder.
