# PREP — Color System & Per-Section Usage Direction

Replaces the single-accent dark-first system and the 6-palette switcher entirely (previously defined in `PREP_LANDING_V2_PRT.md` commits LANDING2-1 through LANDING2-3, discard those three commits, do not implement them). No switcher in this system, every token below is fixed.

## Principle

Color is assigned by concept, not by section or by decoration. The same idea reads the same color everywhere it appears across the app: AI Review is always sky blue whether it's on the landing page, the dashboard, or a stat card. This is a structural device (same logic as Jasper's Canvas-is-always-green pattern), not a "make it colorful" pass applied loosely per component.

**Carve-out:** the quiz-taking flow and results screen (`src/features/quiz-taking/`) do NOT use the section hues below. That flow stays visually quiet and uses only the functional tokens (correct/incorrect/neutral), so nothing competes with someone actually sitting a timed exam. This is a deliberate exception, not an oversight, do not "colorize" question cards, timer, or navigation with section hues.

---

## Base tokens (neutral, every page)

```css
/* Light */
--color-bg: #FCFBF7;
--color-surface: #FFFFFF;
--color-text-primary: #14152B;
--color-text-secondary: #5B5C72;
--color-border: #E7E5DD;

/* Dark */
--color-bg: #0B0C10;
--color-surface: #15161C;
--color-text-primary: #F4F2E8;
--color-text-secondary: #9C9DAE;
--color-border: #262832;
```

## Section hue tokens

Six hues, each with a light surface/accent pair and a dark surface/accent pair. Surface = background tint for a card/panel in that hue. Accent = the saturated version, used for icons, headings, buttons, borders within that hue's context.

```css
/* Sage — Create (quiz builder, CSV import) */
--color-sage-surface-light: #E3F3E1;
--color-sage-accent-light: #1F7A3D;
--color-sage-surface-dark: #14231A;
--color-sage-accent-dark: #4ADE80;

/* Coral — Practice (timer, CBT-taking) */
--color-coral-surface-light: #FDE6DE;
--color-coral-accent-light: #E4572E;
--color-coral-surface-dark: #2A160F;
--color-coral-accent-dark: #FF7A50;

/* Sky — AI Review */
--color-sky-surface-light: #E1EAFB;
--color-sky-accent-light: #2952E3;
--color-sky-surface-dark: #131B33;
--color-sky-accent-dark: #6E8CFF;

/* Amber — Share (public links, quiz bank) */
--color-amber-surface-light: #FBF0D2;
--color-amber-accent-light: #B8790E;
--color-amber-surface-dark: #241D0C;
--color-amber-accent-dark: #F2C14E;

/* Magenta — Account / Trust (auth) */
--color-magenta-surface-light: #FBE3F0;
--color-magenta-accent-light: #C2298A;
--color-magenta-surface-dark: #26121D;
--color-magenta-accent-dark: #F472B6;

/* Teal — Utility (FAQ, empty states, secondary chrome) */
--color-teal-surface-light: #DEF4F1;
--color-teal-accent-light: #0E7C74;
--color-teal-surface-dark: #0F211F;
--color-teal-accent-dark: #3DD9C9;
```

Note on Amber: pure bright yellow fails contrast as text/icon color on both light and dark surfaces. The accent value here is a deeper gold, not the bright yellow the surface tint implies, this is intentional, don't brighten it to "match" the surface more closely.

## Functional tokens (quiz-taking and results only)

```css
/* Light */
--color-correct: #1F7A3D;
--color-incorrect: #D6322A;

/* Dark */
--color-correct: #3DDC7A;
--color-incorrect: #FF5C56;
```

Grounded against real logic in `QuizResults.tsx`: scoring is `earnedPoints / totalPoints`, pass/fail threshold is a flat 70% (`passed = percentage >= 70`), not a multi-tier grade band. Use `--color-correct` for pass and `--color-incorrect` for fail, don't invent a third amber "close" tier, the product doesn't have one. Answered/unanswered state in `QuestionOverview.tsx` uses neutral base tokens (border/text-secondary for unanswered, text-primary/border for answered), not a hue, there is also no "flagged" question state in the current code, don't add flag-colored UI for a state that doesn't exist.

---

## Per-section direction

### Landing page

**Hero** — stays neutral (base tokens only). This is the entry point, establish the ink/paper tone before color arrives. The muted icon field from the discarded LANDING2-4 commit can stay conceptually (scattered outline icons, low opacity) but has no reason to use section hues, keep it neutral too. Color should feel like it "arrives" as the user scrolls, not appear immediately.

**Problem** — stays neutral. This section describes the pain point (copy-paste hell), deliberately the plainest section on the page. The contrast between this section's plainness and the color that follows is the point, don't undercut it by adding hue here.

**How It Works** (4 steps) — each step card uses its matching hue: Step 1 "Bring your questions" = Sage, Step 2 "Make it a real practice test" = Coral, Step 3 "Share it" = Amber, Step 4 "Find out what to study" = Sky. Card background = that hue's surface tint, heading/icon = that hue's accent. This is the first section where color appears, should read as a clear shift from the neutral Hero/Problem above it.

**CSV Import** — Sage (Create concept).

**CBT Experience** — Coral (Practice concept).

**AI Review** — Sky. The 3-card breakdown (What you're good at / Where you're struggling / What to study next) all share Sky, don't split them into three different hues, they're one concept.

**Quiz Sharing** — Amber.

**Quiz Bank Preview** — Amber, same family as Quiz Sharing since both are the "public/shared" concept. Real card data comes from `QuizBankCard`, apply the surface tint to the section wrapper/card chrome, not to the live quiz thumbnail content itself.

**Features** (7 cards) — this section shows the full concept range at once, map each card to its matching hue rather than picking one hue for the whole section: CSV import = Sage, Quiz builder = Sage, Timed exams = Coral, Shareable quizzes = Amber, Public or private = Amber, Saved progress = Teal, AI review = Sky. This becomes the section where the full palette is visible together, a deliberate payoff after seeing each hue individually earlier on the page.

**Use Cases** — mixed by audience-to-concept fit, not one flat hue: "Studying for an exam" = Coral (practice), "Studying with friends" = Amber (share), "Teaching or tutoring" = Magenta (this is the first appearance of Magenta on the landing page, an educator managing student access is closer to the account/trust concept than to any of the other four).

**FAQ** — Teal (utility/informational).

**Final CTA** — mostly neutral (base tokens), with Sage as a single accent on the primary CTA button, since the action is "Create a quiz."

**Nav and Footer** — stay neutral. Chrome should not compete with section color, especially since nav is fixed/persistent while section colors change underneath it as the user scrolls.

### Dashboard (`src/features/dashboard/`)

- **Draft quiz state** (`QuizRow`, draft badge) — Sage.
- **Published quiz state** (`QuizRow`, published badge) — Amber, matches the "share" concept since publishing makes a quiz shareable.
- **Stat cards** on `Dashboard.tsx` — if stats are broken out individually (total quizzes, total attempts, average score, published count), map each to its matching concept: total quizzes/drafts = Sage, total attempts = Coral, average score or AI-review-related stat = Sky, published/shared count = Amber. If stats stay as a single flat row, don't force individual hues onto a layout that wasn't built for it, ask before restructuring the stat row just to fit this scheme.
- **Empty-state banner** (zero drafts and zero published, per the earlier SubZero-restructure decision) — Teal, an empty state should read as informational/neutral encouragement, not alarming or attention-grabbing.
- **Sidebar** — stays neutral. It's persistent chrome like the landing page nav, same reasoning.

### Auth (`src/features/auth/`)

- **Media panel** (`QuizBuildMock` showcase) — Sage, since the mock demonstrates quiz creation.
- **Account/security-adjacent messaging**, if any exists on the auth screen (e.g. "your data stays private" type copy) — Magenta.
- **Form panel itself** — stays neutral, the form inputs shouldn't carry section-hue backgrounds, only the media panel and any trust-messaging accents do.

### Quiz-taking and Results (`src/features/quiz-taking/`)

No section hues. Functional tokens only:
- `QuestionCard.tsx` selected/unselected option states — neutral base tokens.
- `QuestionOverview.tsx` answered/unanswered indicators — neutral base tokens (per real code, no flagged state exists).
- `QuizResults.tsx` pass/fail — `--color-correct` / `--color-incorrect` only, no third tier.
- `QuizTimer.tsx` — neutral, unless the product later adds a "low time remaining" warning state, which would be a new functional token to define separately, not a borrowed section hue.

---

## Open items

- Confirm whether Dashboard stat cards are individually broken out or a single flat row before applying per-stat hues, don't restructure the layout just to fit the color scheme.
- If a "low time remaining" timer warning state is wanted later, that's a new functional token, define it separately from this palette rather than reusing Coral (which means Practice generally, not urgency specifically).
