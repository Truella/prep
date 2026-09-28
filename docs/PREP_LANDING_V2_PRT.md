# PREP — Landing Page V2 PRT

**Branch:** `feat/landing-v2`

Full landing page rebuild: color/font system (Fraunces + new dark/light palette), a 6-way palette switcher, hero rework (drop `HeroGrid`, add muted icon field), three new sections (Problem, CSV Import, CBT Experience), and a restructure of every existing section into an asymmetric bento layout with bold Fraunces italic headers. Nothing from the locked copy gets cut, only reshaped into the new visual system.

Grounded against current repo state: `src/features/home/components/`, `src/features/quiz-management/components/create/`, `src/features/quiz-bank/`, `src/shared/navigation/ExternalNav.tsx`, `app/page.tsx`, `app/globals.css`.

Standing rules for every commit below:
- Fraunces italic for section headings, one word per heading in `--color-accent`, not the whole heading.
- `HeroGrid`'s full-bleed interactive canvas stays hero-exclusive. No other section gets it.
- Any animation timing must use concrete millisecond values in the prompt, not vague fractions, this repo has a history of pacing bugs from underspecified timing.
- Every mock/visual must be grounded in a real component before being described. Do not invent UI that doesn't exist in the app.
- No em dashes in any user-facing copy.

---

## COMMIT LANDING2-1 — Color/font system (Fraunces + new palette)

**Commit:** `feat(theme): switch to Fraunces and new dark/light token values`

---PROMPT---
Read `app/globals.css` and `app/layout.tsx` in full first.

In `app/layout.tsx`, replace the `DM_Serif_Display` import from `next/font/google` with `Fraunces`, configured with `style: ["normal", "italic"]` and a reasonable weight/axis range for the variable font (this is a variable font, expose the full range rather than a single static weight). Keep the existing CSS variable name it's assigned to (`--font-display` or whatever the current variable is called) so nothing downstream needs to change its font reference.

In `app/globals.css`, update the token values. These live in two places that must stay in sync: the `.light` class block and the `@media (prefers-color-scheme: light)` block. Update both.

Dark (default, `:root` or `.dark`):
```
--color-bg: #0B0C0E;
--color-surface: #16181B;
--color-surface-raised: #1E2024;
--color-border: #2A2D31;
--color-text-primary: #F2EFE6;
--color-text-secondary: #9A9D97;
--color-accent: #5B8CFF;
--color-accent-dim: #16224A;
--color-error: #FF5C56;
```

Light:
```
--color-bg: #FAFBF8;
--color-surface: #FFFFFF;
--color-surface-raised: #F0EEE7;
--color-border: #E2E1D9;
--color-text-primary: #17181A;
--color-text-secondary: #63665F;
--color-accent: #2952E3;
--color-accent-dim: #E4EAFC;
--color-error: #D6322A;
```

`--color-error` is reserved strictly for incorrect-answer states in the quiz-taking and review UI, do not repurpose it as a general accent anywhere in this rebuild.

Do not touch component files in this commit, tokens and font only.
---PROMPT---

**Verify:** `npm run typecheck` passes. Manual: toggle dark/light, confirm both blocks produce matching results, confirm Fraunces loads (check network tab for the font file, check an italic heading renders in the wonky/expressive axis rather than falling back to a generic italic).

---

## COMMIT LANDING2-2 — Multi-palette CSS variables — SUPERSEDED

> **Superseded by `PREP_COLOR_SYSTEM.md` — palette-switcher retired, do not implement. See `PREP_COLOR_SYSTEM.md` for fixed per-concept hues.**

**Commit:** `feat(theme): add data-palette variants for six accent palettes` *(not implemented — retired)*

---PROMPT---
Read `app/globals.css` in full first, specifically how `.dark` and `.light` currently define token blocks.

Add six new attribute-selector blocks, `[data-palette="1"]` through `[data-palette="6"]`, each nested under both `.dark` and `.light` (twelve blocks total, or use a scoping pattern consistent with how `.dark`/`.light` already work, follow the existing pattern rather than inventing a new one). Each palette overrides `--color-bg`, `--color-surface`, `--color-accent` only, everything else (text colors, border, error) inherits from the base `.dark`/`.light` values already set in LANDING2-1, don't redefine them per palette.

Dark-mode values per palette:
```
[data-palette="1"] (earth):    bg #000000  surface #1F150C  accent #6B4A28 (muted, this palette has no vivid accent candidate in the source values, use the mid-brown at reduced saturation rather than forcing a fake vivid tone)
[data-palette="2"] (navy):     bg #0B2447  surface #19376D  accent #576CBC
[data-palette="3"] (rust):     bg #0C0C0C  surface #481E14  accent #F2613F
[data-palette="4"] (electric): bg #091540  surface #142050 (interpolated, sits between the palette's bg and accent tones)  accent #1B2CC1
[data-palette="5"] (emerald):  bg #18230F  surface #27391C  accent #1F7D53
[data-palette="6"] (indigo):   bg #080616  surface #1A1953  accent #2F2FE4
```

Light-mode values per palette: reuse the base light `--color-bg` (#FAFBF8) and `--color-surface` (#FFFFFF) from LANDING2-1 unchanged for all six, only override `--color-accent` with each palette's accent color from the table above. Do not invent six separate light-mode designs.

Do not touch component files in this commit, tokens only.
---PROMPT---

**Verify:** `npm run typecheck` passes. Manual: manually set `data-palette="1"` through `"6"` on `<html>` via devtools in both dark and light mode, confirm bg/surface/accent shift correctly and text stays legible against every combination, particularly palette 1's muted accent against both surface colors.

---

## COMMIT LANDING2-3 — Palette switcher component — SUPERSEDED

> **Superseded by `PREP_COLOR_SYSTEM.md` — palette-switcher retired, do not implement.**

**Commit:** `feat(nav): add palette switcher next to theme toggle` *(not implemented — retired)*

---PROMPT---
Read `src/shared/navigation/ExternalNav.tsx` in full first, specifically the theme toggle button around line 72 (desktop) and line 87 (mobile), and `src/lib/theme.ts` (or wherever `useTheme` lives) to see how theme state currently persists.

Create `src/shared/components/PaletteSwitcher.tsx`, a client component rendering a small circular button showing the current palette's accent color as a filled dot. Clicking it opens a popover (not a dropdown `<select>`, a positioned absolute panel) showing six dots, one per palette, using each palette's accent color from LANDING2-2. Clicking a dot sets `data-palette` on `document.documentElement` to that palette's number and closes the popover. Persist the selection the same way theme currently persists (check `useTheme`'s mechanism, likely localStorage plus a cookie for SSR, follow that exact pattern rather than inventing a new persistence method).

Default palette (no selection made yet) should be the current site colors, meaning no `data-palette` attribute set, falling through to the base `.dark`/`.light` values from LANDING2-1.

Mount `PaletteSwitcher` in `ExternalNav.tsx` immediately next to the existing theme toggle, both desktop and mobile zones.
---PROMPT---

**Verify:** `npm run typecheck` passes. Manual: switcher appears next to theme toggle on desktop and mobile, selecting a palette updates colors site-wide instantly, selection persists across a page reload, default state (no selection) matches current site colors exactly.

---

## COMMIT LANDING2-4 — Hero rework: drop HeroGrid, add muted icon field

**Commit:** `feat(home): replace hero dot grid with muted icon field, update copy`

---PROMPT---
Read `src/features/home/components/Hero.tsx`, `HeroCard.tsx`, and `HeroGrid.tsx` in full first.

Remove `HeroGrid` from `Hero.tsx` entirely (the import and the `<HeroGrid />` render), but do not delete `HeroGrid.tsx` from the repo yet, leave the file in place in case another section needs the technique later.

Create `src/features/home/components/HeroIconField.tsx`, a static (no animation, no pointer tracking) component rendering 5-7 outline SVG icons scattered at irregular absolute positions across the hero section: a timer/clock icon, a question mark icon, a checkmark icon, and a document/upload icon, all drawn from `lucide-react` (already a dependency) rather than custom SVGs. Render each at `opacity: 0.08` to `0.12` (vary slightly per icon, not uniform) using `--color-text-secondary` as the stroke color, sizes varying between 32px and 64px, rotated at small random angles (-15deg to 15deg) for visual variety. This is a background texture layer, it must not interfere with clicks on the hero content above it (`pointer-events: none`, positioned behind the text/card content, above `--color-bg`).

Mount `HeroIconField` in `Hero.tsx` where `HeroGrid` used to be. Keep `HeroCard` on the right exactly as-is, this commit does not touch the animated card.

Update the hero copy:
- Eyebrow: keep as-is (`CBT & MCQ Exam Practice`) unless LANDING2-copy review says otherwise, flag if unsure rather than guessing.
- Headline: `Turn your questions into CBT practice.`
- Sub-headline: `Upload your questions, build a quiz, and practice like it's the real exam. When you're done, Prep shows you what you know, what you're missing, and what to study next.`
- Primary CTA: `Create a quiz`
- Secondary CTA: `Take a quiz`
- Reassurance line: `Free to use. No account required to take a quiz.`
---PROMPT---

**Verify:** `npm run typecheck` passes. Manual: hero no longer shows the interactive dot grid, icons render faint and static in the background, `HeroCard`'s animation on the right is unaffected, hero remains legible and uncluttered at mobile widths, copy matches exactly.

---

## COMMIT LANDING2-5 — Problem section (new)

**Commit:** `feat(home): add Problem section`

---PROMPT---
Read `src/features/home/components/Hero.tsx` and `Features.tsx` for the existing bento/span-variance pattern before starting, this section should follow that pattern rather than reintroducing a plain centered block.

Create `src/features/home/components/Problem.tsx`. Two-panel asymmetric layout (roughly 60/40 or 55/45 split on desktop, stacked on mobile): one panel is a large color-blocked surface (`--color-surface`) containing the heading and copy, the other is a smaller panel with a simple static visual representing the "questions become copy-paste hell" idea, a plain arrow-flow of three small labeled boxes (`Spreadsheet` → `Copy-paste` → `Form builder`), not an illustration, styled with the existing card/border tokens.

Heading (Fraunces italic, one word in `--color-accent`): `You shouldn't have to build a whole quiz just to *practice*.` (accent word: practice)

Copy: `You already have the questions. Maybe they're in a spreadsheet. Maybe they're from a past paper. Maybe someone sent you a question bank. But turning those questions into an actual CBT usually means copying and pasting hundreds of questions into a form, or dealing with import tools that put limits on how much you can upload. Prep was built to remove that step.`

Mount `Problem` in `app/page.tsx` directly after `Hero`.
---PROMPT---

**Verify:** `npm run typecheck` passes. Manual: section renders correctly at mobile and desktop widths, heading's accent word displays in the current palette's accent color, asymmetric split doesn't collapse awkwardly at tablet widths.

---

## COMMIT LANDING2-6 — How It Works: asymmetric 4-step rebuild with per-step mocks

**Commit:** `feat(home): rebuild How It Works as 4 asymmetric cards with animated mocks`

This is the largest commit in this PRT, split into two prompts, mock components first, then the section that uses them.

---PROMPT---
Read `src/features/auth/components/QuizBuildMock.tsx` and `src/features/auth/constants/quizBuildMock.ts` in full first, along with `src/features/home/components/AIReviewMock.tsx`. These already contain the phase-based animation pattern (crossfade between scenes, `useLayoutEffect` + `useMotionValue` for cursor movement, char-count-derived typing speed) that every mock below should reuse, not reinvent.

Create three new small mock components in `src/features/home/components/how-it-works-mocks/`:

1. `BringQuestionsMock.tsx` — a trimmed, faster-looping (aim for a 6-8 second total loop, shorter than the full `QuizBuildMock`) excerpt of `QuizBuildMock`'s question-creation phase only. Reuse its constants/data where reasonable rather than writing new fake content.

2. `TimerSettingsMock.tsx` — net new, no existing asset to trim. Ground this in `src/features/quiz-management/components/create/QuizMetadataForm.tsx`'s real `TimeLimitInput` and in `PublishSettingsModal.tsx`'s real visibility radio options (`Private` / `Public`, with the real descriptions `Accessible via link only. Not in Quiz Bank.` and `Listed in the Quiz Bank for anyone to discover.`). Animate: a timer input field being filled in (e.g. "30" appearing digit by digit over 400-600ms), then a brief pause (600ms), then the visibility radio selecting "Public" with a highlight transition (300ms). Total loop around 5-7 seconds before resetting.

3. `ShareQuizMock.tsx` — a trimmed excerpt of `QuizBuildMock`'s `ShareableLink` success-screen phase (the green check, "Quiz Published Successfully!" state), looped standalone rather than as the tail end of a longer sequence. Aim for a 4-5 second loop: link appears, a copy-icon click animation fires (200ms scale-down/up), a small "Copied!" toast appears for 1000ms, then resets.

4. `AIReviewStepMock.tsx` — reuse `AIReviewMock` directly, no changes needed, just import it.

Each mock should be sized to fit inside a card roughly 280-360px wide, smaller than their original contexts (auth panel, dedicated AI review section), so trim padding/scale accordingly rather than just shrinking the container around an unchanged mock.
---PROMPT---

---PROMPT---
Read the current `src/features/home/components/HowItWorks.tsx` in full first, then delete its SVG connector-path logic entirely (the `<path>` elements and coordinate-based dot positions), this rebuild replaces the 3-card connected-line layout, it does not extend it to 4.

Rewrite `HowItWorks.tsx` as an asymmetric 4-card bento grid (not a uniform `grid-cols-4`, vary spans, e.g. one card spans 2 columns while the others take 1, following the same span-variance approach `Features.tsx` already uses). Each card contains: a step number (`01`-`04`, monospace, `--color-accent`), a heading, a short description, and the corresponding mock from LANDING2-6's first prompt, rendered above or beside the text depending on the card's span.

Content:
- Step 1, `Bring your questions`: `Already have questions? Upload a CSV or add them manually using the quiz builder. No need to recreate your question bank from scratch.` — mock: `BringQuestionsMock`
- Step 2, `Make it a real practice test`: `Set your timer, choose your quiz settings, and get a CBT-style experience designed for actually practicing.` — mock: `TimerSettingsMock`
- Step 3, `Share it`: `Send one link to your friends, classmates, or study group. They can start taking the quiz without creating an account.` — mock: `ShareQuizMock`
- Step 4, `Find out what to study`: `See your score and get an AI-powered review of your attempt. Find your weak areas and go into your next attempt knowing what to focus on.` — mock: `AIReviewStepMock`

Heading above the grid (Fraunces italic, accent word): `From question bank to *practice* in minutes.`

Keep the existing "Create your first quiz" CTA link below the grid.
---PROMPT---

**Verify:** `npm run typecheck` passes. Manual: all 4 mocks loop independently without stutter, section is legible and doesn't feel cramped at mobile widths (mocks likely stack full-width per card on mobile), no leftover SVG connector artifacts from the old 3-step version, reduced-motion preference is respected by every mock (check each one degrades to a static frame, following the pattern already established in `AIReviewMock`/`QuizBuildMock`).

---

## COMMIT LANDING2-7 — CSV Import section (new)

**Commit:** `feat(home): add CSV Import section`

---PROMPT---
Read `src/features/quiz-management/components/create/UploadQuestionsForm.tsx` and `src/features/quiz-management/utils/csvParser.ts` in full first, ground the mock in what this form actually does (drag-and-drop or file-select, header validation against `Question`/`Option_A`-`Option_D`/`Correct_Answer`/optional `Points` columns).

Create `src/features/home/components/CSVImportMock.tsx`, a looping mock (aim for 6-8 second loop) showing: a CSV file being dropped or selected, a brief "parsing" state, then a checkmark confirming rows were imported with a count (e.g. "24 questions imported"). Keep it visually simple, this is a smaller supporting visual, not a full recreation of the upload form's UI chrome.

Create `src/features/home/components/CSVImportSection.tsx`, two-panel layout matching the auth screen's split pattern (media panel one side, text panel the other, roughly 45/55), reusing `CSVImportMock` in the media panel.

Heading (Fraunces italic, accent word): `Already have the questions? Don't *type* them again.`

Copy: `Got a spreadsheet full of questions? A past-paper question bank? Notes you've already organized? Upload your CSV and Prep turns it into a ready-to-take CBT.` Follow with a small reassurance line stating generous upload limits without an unlimited claim: `Generous upload limits, no restrictive row caps like standard form-builder extensions.` (do not use the word "unlimited" or "limitless" anywhere in this copy, the product enforces a 250-question cap per quiz, decided separately, this line should not contradict that even implicitly).

Mount `CSVImportSection` in `app/page.tsx` directly after `HowItWorks`.
---PROMPT---

**Verify:** `npm run typecheck` passes. Manual: mock loops correctly, section layout matches the established two-panel pattern from the auth screen at desktop widths and stacks cleanly on mobile, copy does not imply unlimited uploads.

---

## COMMIT LANDING2-8 — CBT Experience section (new)

**Commit:** `feat(home): add CBT Experience section`

---PROMPT---
Read the real quiz-taking interface first, `src/features/quiz-taking/` in full, specifically whatever component renders the timer, question navigation, and submit/auto-submit behavior, before building any mock of it.

Create `src/features/home/components/CBTExperienceMock.tsx`, grounded in what you find, a looping mock showing a countdown timer ticking down, a question with options, and a next-question transition. Keep timing concrete: timer digits changing every 1000ms is realistic and doesn't need acceleration, but the overall loop should reset every 8-10 seconds so it doesn't feel like a real long countdown.

Create `src/features/home/components/CBTExperienceSection.tsx`, full-width panel (not split, this one leads with the visual larger since it's establishing the core "this isn't a form" distinction).

Heading (Fraunces italic, accent word): `Practice the way you'll actually be *tested*.`

Copy: `Google Forms is great for collecting responses. Prep is built for practicing exams. Use a countdown timer, move through questions, submit your attempt, and see your results when you're done.`

Mount `CBTExperienceSection` in `app/page.tsx` directly after `CSVImportSection`.
---PROMPT---

**Verify:** `npm run typecheck` passes. Manual: mock accurately reflects the real quiz-taking flow's core mechanics (timer, question, options), no invented UI elements that don't exist in the real quiz-taking screen, section reads clearly at mobile widths.

---

## COMMIT LANDING2-9 — AI Review: add 3-card breakdown

**Commit:** `feat(home): add strengths/gaps/next-steps card row to AI Review section`

---PROMPT---
Read `src/features/home/components/AIReviewSection.tsx` in full first. Keep the existing layout (heading/copy left, `AIReviewMock` right) but add a new row of 3 small cards below that pairing, spanning the section's full width.

New heading text (replaces the current one, Fraunces italic, accent word): `A score tells you how you did. We help you figure out *why*.`

New supporting copy: `Finishing with 64% doesn't tell you what to do tomorrow. Prep's AI review looks at the questions you answered and the answers you selected to identify patterns in your performance.`

Three cards below, equal width, using the existing card/border token pattern:
- `What you're good at` — `See the topics and concepts you've consistently handled well.`
- `Where you're struggling` — `Identify the topics behind the questions you're getting wrong.`
- `What to study next` — `Get a focused list of areas to revisit before your next attempt.`

Do not modify `AIReviewMock.tsx` itself in this commit.
---PROMPT---

**Verify:** `npm run typecheck` passes. Manual: 3-card row renders below the existing heading/mock pairing, cards are equal width and readable at mobile widths (stack to single column), existing `AIReviewMock` animation is unaffected.

---

## COMMIT LANDING2-10 — Quiz Sharing block

**Commit:** `feat(home): add compact Quiz Sharing block`

---PROMPT---
Read `src/features/home/components/AIReviewSection.tsx` and `Features.tsx` for card-pattern reference first.

Create `src/features/home/components/QuizSharing.tsx`, a compact section (not a full heavy section like the others, this should read visually lighter, less vertical padding than the surrounding sections). Heading (Fraunces italic, accent word): `One quiz. One link. Everyone can *practice*.` Copy: `Create a quiz once and send it wherever you want. Make it public for anyone to discover, or keep it private and share it with only the people you choose.`

Below that, 3 small cards:
- `Study group` — `Create a quiz for your friends and compare how everyone performs.`
- `Class` — `Give your classmates a practice test without making everyone create an account.`
- `Personal` — `Build your own question bank and come back whenever you need another attempt.`

Mount `QuizSharing` in `app/page.tsx` directly after `AIReviewSection`.
---PROMPT---

**Verify:** `npm run typecheck` passes. Manual: section reads as visually lighter/more compact than the sections around it, 3-card row stacks correctly on mobile.

---

## COMMIT LANDING2-11 — Quiz Bank preview: restyle and reword

**Commit:** `feat(home): restyle Quiz Bank preview to bento treatment, update copy`

---PROMPT---
Read `src/features/home/components/QuizBankPreview.tsx` in full first. This component fetches real public quizzes from Supabase, do not change the data-fetching logic (the `supabase.from("quizzes")` query, `getAttemptCounts`, loading state), restyle the presentation only.

Update the heading (Fraunces italic, accent word) from `From the Quiz Bank` to: `Don't have questions yet? Start with someone else's.`

Update the supporting copy to: `Browse quizzes shared by other Prep users and find something to practice.`

Restyle the 3-card grid to match the bento card treatment established elsewhere in this rebuild (check border/shadow/hover treatment used in `Problem.tsx` or the `HowItWorks` cards from LANDING2-6 for the current pattern), rather than leaving the original plain grid styling. Keep `QuizBankCard` itself unchanged, wrapper/grid styling only.
---PROMPT---

**Verify:** `npm run typecheck` passes. Manual: real quiz data still loads and displays correctly, loading skeleton still works, "Browse all" link still points to `/quiz-bank`, visual treatment matches the rest of the rebuilt page.

---

## COMMIT LANDING2-12 — Features: reword only

**Commit:** `chore(home): update Features copy`

---PROMPT---
Read `src/features/home/components/Features.tsx` in full first. Keep the existing grid structure and span-variance entirely as-is, copy only.

New heading (Fraunces italic, accent word): `Built around the way CBT prep actually *works*.`

Update the 7 feature cards to:
- `CSV import` — `Turn an existing question bank into a quiz without typing every question manually.`
- `Quiz builder` — `Prefer to build from scratch? Add questions, options, answers, and settings directly in Prep.`
- `Timed exams` — `Practice against the clock and automatically submit when time runs out.`
- `Shareable quizzes` — `Send one link to your classmates, friends, or students.`
- `Public or private` — `Share with everyone or keep your quiz restricted to the people you choose.`
- `Saved progress` — `Close the tab and come back without losing your attempt.`
- `AI review` — `Understand your weak areas and what to revisit after every attempt.`

Match each new description to whichever card slot currently holds that feature, don't reorder the grid's span pattern in this commit.
---PROMPT---

**Verify:** `npm run typecheck` passes. Manual: all 7 cards display the updated copy, existing span/grid layout unchanged.

---

## COMMIT LANDING2-13 — Use Cases: reshape and reword

**Commit:** `feat(home): reshape WhoItsFor into asymmetric Use Cases layout, update copy`

---PROMPT---
Read `src/features/home/components/WhoItsFor.tsx` in full first. Rename the component file and export to `UseCases.tsx` (update the import in `app/page.tsx` accordingly).

Change the current even `grid-cols-3` to an asymmetric layout, one larger card and two smaller stacked cards (or similar visual imbalance, follow the bento pattern established in earlier commits rather than keeping equal-weight cards).

New heading (Fraunces italic, accent word): `However you *study*, Prep fits in.`

Update the 3 cards:
- `Studying for an exam` — `Turn past questions and your own question banks into CBT practice. Repeat until the format feels familiar.`
- `Studying with friends` — `Build a quiz once. Send the link. Everyone takes the same test and compares their results.`
- `Teaching or tutoring` — `Create practice tests for your students and give them a simple link to start.`
---PROMPT---

**Verify:** `npm run typecheck` passes. Manual: asymmetric layout renders correctly at desktop and collapses sensibly on mobile, `app/page.tsx` import updated and builds clean.

---

## COMMIT LANDING2-14 — FAQ: update copy

**Commit:** `chore(home): update FAQ questions and answers`

---PROMPT---
Read `src/features/home/components/FAQSection.tsx` in full first, keep the existing `Accordion` structure unchanged, copy only.

Replace the FAQ entries with:
- `Does Prep generate questions for me?` → `Not currently. Prep is designed for the questions you already have. You can upload them through CSV or create them manually using the quiz builder.`
- `How can I add questions?` → `You can either add questions manually through the quiz builder or upload them using a CSV file.`
- `Do quiz takers need an account?` → `No. You can share a quiz link and people can take it without creating an account.`
- `Can I make my quiz private?` → `Yes. You can choose whether your quiz is publicly available or private.`
- `How does the AI review work?` → `After you submit a quiz, Prep uses the questions and your selected answers as context to analyze your performance and highlight areas you should revisit.`
- `Can I set a timer?` → `Yes. You can set a countdown to simulate exam conditions. The quiz automatically submits when the timer runs out.`
- `Can I reuse a quiz?` → `Yes. Once you've created a quiz, you can share and take it again.`
- `What can I upload?` → `Prep currently supports CSV files formatted for quiz questions, with a generous per-quiz limit.`
- `Is there a limit on how many questions I can upload?` → `Yes, quizzes are capped at 250 questions, well above what a typical practice test needs, this keeps things fast without the restrictive low caps of standard form-builder extensions.`
- `Is Prep free?` → PLACEHOLDER, do not write an answer here, leave this entry out of the array until the real pricing answer is provided, flag this in the PR description rather than guessing.
---PROMPT---

**Verify:** `npm run typecheck` passes. Manual: accordion still expands/collapses correctly, all entries except the pricing one are present, pricing entry intentionally omitted with a note left in the PR description.

---

## COMMIT LANDING2-15 — Final CTA: update copy

**Commit:** `chore(home): update final CTA copy`

---PROMPT---
Read `src/features/home/components/CTASection.tsx` in full first, keep structure, copy only.

Headline (Fraunces italic, accent word): `You already have the *questions*.`
Sub-headline: `Now turn them into practice. Build your first CBT in minutes.`
CTA: `Create a quiz`
---PROMPT---

**Verify:** `npm run typecheck` passes. Manual: copy displays correctly, CTA link still points to `/auth` (or wherever the current button routes).

---

## COMMIT LANDING2-16 — Page composition: final section order

**Commit:** `chore(home): reorder landing page sections`

---PROMPT---
Read `app/page.tsx` in full first.

Update the import list and render order to:
```
ExternalNav
Hero
Problem
HowItWorks
CSVImportSection
CBTExperienceSection
AIReviewSection
QuizSharing
QuizBankPreview
Features
UseCases
FAQSection
CTASection
Footer
```

This is the final commit in the PRT, every component referenced here should already exist from LANDING2-1 through LANDING2-15. If any import is missing, stop and flag it rather than creating a stub.
---PROMPT---

**Verify:** `npm run typecheck` and `npm run lint` both pass. Manual: full page scroll-through in both dark and light mode, all three trial palettes spot-checked, every section renders in the correct order with no console errors, no leftover references to `HeroGrid` or the old 3-step `HowItWorks` connector logic anywhere in the page.

---

## Open items carried forward, not resolved in this PRT

- FAQ pricing answer (LANDING2-14) needs the real answer before ship.
- `HeroGrid.tsx` is left in the repo unused after LANDING2-4, decide separately whether to delete it or keep it for a future section.
