# SYDD — Project Brief

**Brand pronunciation:** “Sid”  
**Tagline:** *Show up. Stack days.*

SYDD is a responsive, personal fitness consistency tracker inspired by GitHub's contribution graph. It helps a user build consistency by recording daily steps, calorie intake, hydration, workouts, and small health habits, then visualizing activity as a green contribution grid.

## Product direction
- Personal-first, mobile-friendly, calm and motivating.
- Make consistency visible without shaming users for missed days.
- Manual entry first; no claims of automatic step counting or medical accuracy.
- Build a functional MVP before adding integrations, social features, or AI coaching.

## Documents
- `PRD.md` — product requirements and scope.
- `UI_SPEC.md` — page structure, responsive behaviour, and visual direction.
- `DATA_MODEL.md` — suggested data entities and calculations.
- `IMPLEMENTATION_PLAN.md` — phased build plan and acceptance criteria.
- `OMNIRUSH_PROMPT.md` — prompt to paste into OmniRush.
- `AGENTS.md` — repository-level instructions for the coding agent.

## Recommended first run
1. Create a new empty project folder and open it in OmniRush.
2. Add these files to the root of the project.
3. Select Careful permission mode and review every command/file change.
4. Paste the contents of `OMNIRUSH_PROMPT.md` into OmniRush.
5. Ask it to inspect the brief and propose a plan before it starts coding.
6. Approve the plan, implement in phases, and run tests after each phase.

## Suggested stack
Use the existing stack if the project folder already contains a working app. If empty, use:
- Next.js (App Router) + TypeScript
- Tailwind CSS
- Recharts only if a chart genuinely improves the interface
- Local storage for the first, single-device prototype
- A storage abstraction so local storage can later be replaced by a database and authentication

Do not add a real backend, third-party health integration, or paid service during the first MVP unless explicitly requested.


## Brand direction

- Product name: **SYDD** (pronounced “Sid”).
- Tagline: **Show up. Stack days.**
- Brand personality: minimal, focused, personal, and developer-friendly.
- Visual identity: a restrained green activity grid, clean typography, and a polished dashboard; avoid generic gym imagery and overly flashy gradients.
- Keep the product name and tagline consistent across the interface, document titles, page metadata, and README.
