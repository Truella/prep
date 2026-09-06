# Landing Page V2 - Build Plan

This plan maps out the execution of the `PREP_LANDING_V2_PRT.md` specification directly on the current branch. Per your request, we will substitute `lucide-react` with **hugeicons**.

## Phase 1: Foundation (Theme & Setup)
1. **[LANDING2-1] Typography & Base Tokens:** Update `app/layout.tsx` to use the `Fraunces` font (normal/italic). Update `app/globals.css` with the new dark and light base palettes.
2. **[LANDING2-2] Multi-Palette CSS:** Add the 6 data-palette variants (earth, navy, rust, electric, emerald, indigo) in `app/globals.css`.
3. **[LANDING2-3] Palette Switcher:** Create `PaletteSwitcher.tsx` and integrate it into `ExternalNav.tsx` next to the theme toggle.

## Phase 2: Hero & Core Problems
4. **[LANDING2-4] Hero Rework:** Remove `HeroGrid` from `Hero.tsx`. Create `HeroIconField.tsx` using **hugeicons** (instead of lucide-react) for the faint background icons. Update hero copy.
5. **[LANDING2-5] Problem Section (New):** Create `Problem.tsx` (asymmetric bento layout) and mount it after the Hero.

## Phase 3: "How It Works" & Workflows
6. **[LANDING2-6] How It Works Rebuild:** 
   - Build new mocks (`BringQuestionsMock`, `TimerSettingsMock`, `ShareQuizMock`) and reuse `AIReviewStepMock`.
   - Rewrite `HowItWorks.tsx` as a 4-card asymmetric bento layout.
7. **[LANDING2-7] CSV Import Section (New):** Create `CSVImportMock.tsx` and `CSVImportSection.tsx` (auth-style 45/55 split).
8. **[LANDING2-8] CBT Experience Section (New):** Create `CBTExperienceMock.tsx` and `CBTExperienceSection.tsx` (full-width visual).

## Phase 4: Supporting Sections
9. **[LANDING2-9] AI Review Expansion:** Add the 3-card breakdown (strengths/gaps/next-steps) to the existing `AIReviewSection.tsx`.
10. **[LANDING2-10] Quiz Sharing Block:** Create a visually compact `QuizSharing.tsx` with a 3-card layout.
11. **[LANDING2-11] Quiz Bank Preview:** Restyle the existing `QuizBankPreview.tsx` to match the new bento treatment and update copy.
12. **[LANDING2-12] Features Updates:** Update copy for the 7 feature cards in `Features.tsx` (leave layout unchanged).
13. **[LANDING2-13] Use Cases (formerly WhoItsFor):** Rename `WhoItsFor.tsx` to `UseCases.tsx`, apply an asymmetric layout, and update copy.

## Phase 5: Final Touches
14. **[LANDING2-14] FAQ Copy:** Update FAQ questions/answers in `FAQSection.tsx` (excluding the pricing answer for now).
15. **[LANDING2-15] Final CTA:** Update headline and copy in `CTASection.tsx`.
16. **[LANDING2-16] Page Composition:** Update `app/page.tsx` with the final, ordered list of components and remove any unused imports.

---

**Notes:**
- All work will be performed directly on the current branch.
- Icons will strictly use `hugeicons`.
- We can tackle this in phases or sequentially step-by-step. Let me know when you're ready to begin Phase 1!
