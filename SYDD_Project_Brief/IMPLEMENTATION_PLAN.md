# Implementation Plan
## SYDD MVP

Implement in small, reviewable phases. Do not generate the entire app in one unreviewed pass.

## Phase 0 — Inspect and plan
- Inspect existing files and identify the current framework.
- If the folder is empty, use Next.js App Router + TypeScript + Tailwind.
- Present the proposed architecture, routes, components, dependencies, and file plan before coding.
- Do not overwrite existing work without explaining why.

**Gate:** Human approves plan.

## Phase 1 — App shell and design system
- Create responsive layout and navigation.
- Build Overview, History, Habits, and Settings page shells.
- Establish typography, spacing, colour tokens, card styles, buttons, form controls, and focus states.
- Add a clear local-data privacy note.
- No backend or third-party service.

**Gate:** Run app; verify responsive layout at 320px, 375px, 768px, and desktop.

## Phase 2 — Data model and persistence
- Implement typed data model and versioned local-storage service.
- Add safe parsing/default initialization and validation.
- Add unit tests for storage and date helpers.
- Add export JSON and CSV if feasible in this phase.

**Gate:** Data survives refresh; malformed storage does not crash app.

## Phase 3 — Daily logging
- Implement steps and calories manual-entry forms.
- Implement water quick-add and editing.
- Implement workout create/edit/delete and daily total.
- Add validation and feedback states.

**Gate:** All values persist, edit correctly, and update the dashboard.

## Phase 4 — Habits and goals
- Implement habit create, rename, complete/uncomplete, archive.
- Implement settings and editable daily goals.
- Preserve historical completion records when a habit is archived.
- Add confirmation for destructive actions.

**Gate:** Habit completion and goal changes behave correctly across dates.

## Phase 5 — Activity heatmap and history
- Build year-style contribution grid.
- Add month/weekday labels, legend, responsive horizontal scrolling, keyboard focus, and date details.
- Implement transparent scoring and no-data states.
- Add selected-date editing.

**Gate:** Test dates around year boundaries and leap years; heatmap matches daily records.

## Phase 6 — Polish and QA
- Add loading, empty, success, and error states.
- Test keyboard use, contrast, and narrow screens.
- Fix console warnings/errors.
- Add README instructions and final acceptance checklist.
- Run lint, typecheck, tests, and production build.

**Gate:** All tests pass; no broken primary actions.

## Required final report from the coding agent
1. What was implemented.
2. Files created or changed.
3. Commands run and their results.
4. Tests/lint/typecheck/build results.
5. Known limitations.
6. Exact local run instructions.
7. Any decisions that require human approval.
8. Confirmation that no secrets or external services were added.

## Scope discipline
Do not add authentication, cloud sync, wearable APIs, paid services, AI coaching, social features, or a database during the MVP unless explicitly approved. If a requirement is ambiguous, ask before making a high-impact choice.
