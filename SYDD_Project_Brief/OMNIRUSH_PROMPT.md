# Prompt to paste into OmniRush

I want you to implement **SYDD**, a responsive personal fitness consistency tracker. Read `README.md`, `PRD.md`, `UI_SPEC.md`, `DATA_MODEL.md`, `IMPLEMENTATION_PLAN.md`, and `AGENTS.md` first. Treat those files as the project specification.

## First response: planning only
Do not edit files yet. Inspect the repository and tell me:
1. What framework and files already exist.
2. Whether the folder is empty or contains an existing app.
3. The implementation architecture and routes.
4. The components and data modules you intend to create.
5. Any dependencies you want to add and why.
6. How you will test responsiveness, persistence, date handling, and the heatmap.
7. Any ambiguities or decisions that need my approval.

Wait for my approval before implementing.

## Implementation requirements
- Follow the documents as the source of truth.
- If the repository is empty, use Next.js App Router + TypeScript + Tailwind CSS.
- Build a polished, mobile-first UI with a GitHub-inspired green activity heatmap, but no copied GitHub branding.
- MVP is single-user, manual-entry, local-first. Use versioned localStorage behind a data-access abstraction.
- Build dashboard, history/date details, habits, and settings.
- Implement steps, calories consumed, water, workout minutes, editable goals, habit completions, export, and clear-data confirmation.
- Distinguish missing data from a logged zero.
- Make the heatmap keyboard accessible and horizontally scrollable on mobile without causing page-level overflow.
- Keep the heatmap scoring transparent; calories consumed must not be used as a positive fitness score.
- Do not implement authentication, cloud sync, database, wearable integration, third-party analytics, AI coaching, or paid services in the MVP.
- Do not add dependencies without telling me first.
- Do not read or transmit secrets from `.env` files. Do not connect external services.
- Ask before destructive commands, deleting files, or changing Git history.
- Keep Careful permission mode and ask me before running commands or making risky changes.

## Work sequence
Implement only Phase 1 from `IMPLEMENTATION_PLAN.md` after I approve the plan. Then stop and report:
- Files created/changed.
- Commands run and their results.
- What I should inspect manually.
- Any problems or decisions needed.

After I approve Phase 1, proceed through the remaining phases one at a time. Run relevant tests after each phase. Do not claim success without running the checks.
