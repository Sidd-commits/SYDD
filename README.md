# SYDD — Personal Fitness Consistency Tracker

> **Pronunciation:** “Sid”  
> **Tagline:** *Show up. Stack days.*

SYDD is a responsive, privacy-first personal fitness consistency tracker inspired by GitHub's contribution graph. It helps you build lasting momentum by recording daily steps, hydration, workouts, calories consumed, and recurring micro-habits, visualizing your consistency as a vibrant green activity grid.

---

## Key Features

- **GitHub-Style Consistency Grid**:
  - Full 52/53-week heatmap visualization arranged in 7 rows with month and weekday labels.
  - Transparent non-medical scoring formula based on active targets (steps, water, workouts, habits).
  - Explicit distinction between unrecorded days and logged zero-progress days.
  - Interactive day selection with inspection popover, keyboard navigation, and full accessibility.
  - Horizontally scrollable on mobile devices without causing page-level overflow.
- **Daily Focus Dashboard**:
  - Today's progress cards for Daily Steps, Hydration (+250 ml / +500 ml quick-actions), Workouts, and Calories Consumed (informational intake benchmark).
  - Rolling 7-day weekly recap with average steps, water, total workout minutes, and active days.
  - Habit checklist with instant single-tap completion and progress bars.
- **Micro-Habit Manager**:
  - Create, rename, archive, and unarchive recurring habits (e.g., mobility stretch, post-lunch walk).
  - Archiving preserves past completion records in historical grids while keeping today's list focused.
- **Comprehensive History**:
  - Chronological log of all recorded days with filters (All Days vs Active Days Only) and date picker.
  - Detailed Day Inspector to review workouts, daily notes, and modify past records.
- **Configurable Settings & Data Ownership**:
  - Customizable daily targets for steps, water, calories consumed, and workout minutes.
  - One-click JSON backup export and import with schema validation.
  - Activity export to CSV for spreadsheets.
  - 45-day realistic sample demo data loader.
  - Safe data wipe with confirmation modal.
- **100% Private & Local-First**:
  - All data is stored locally in your browser's `localStorage` (`sydd:data:v1`).
  - Zero external servers, cloud trackers, or analytics.

---

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router, Turbopack, React 19)
- **Language**: [TypeScript](https://www.typescriptlang.org/) (Strict Mode)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Test Runner**: Node.js Native Test Runner (`node:test`) powered by `tsx`
- **Persistence**: Safe versioned local storage with data migration fallbacks

---

## Getting Started

### 1. Prerequisites
Ensure you have Node.js 18.17+ or Node 20+ installed:
```bash
node -v
npm -v
```

### 2. Installation
Install project dependencies:
```bash
npm install
```

### 3. Running the Development Server
Start the local Next.js server on port 3000:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your web browser.

### 4. Running the Test Suite
Run the 18 automated unit tests covering date utilities, persistence parsing, edge cases, and heatmap calculations:
```bash
npm test
```

### 5. Production Build & Typecheck
Run the TypeScript compiler and compile the production bundle:
```bash
npx tsc --noEmit
npm run build
```

---

## Data Model & Transparent Scoring

### Heatmap Scoring Formula
Cell color levels reflect the average progress of configured activity goals for that day:
- **Steps Progress**: `min(steps / stepsTarget, 1.0)`
- **Water Progress**: `min(water / waterTarget, 1.0)`
- **Habits Progress**: `completedHabits / activeHabits` (if habits exist and were active)
- **Workout Progress**: `min(workoutMinutes / workoutTarget, 1.0)` (if workout tracking is enabled)
- **Calories Consumed**: Purely informational personal tracking. Does **not** inflate or penalize fitness scores (eating less is never rewarded as fitness).

### Color Levels:
- **Level -1 (No Data)**: Dashed neutral cell
- **Level 0 (0% Progress)**: Pale neutral cell (activity logged, 0% target progress)
- **Level 1 (1–49% Progress)**: Light green
- **Level 2 (50–74% Progress)**: Medium green
- **Level 3 (75–99% Progress)**: Deep green
- **Level 4 (Goal Reached / 100%+)**: Vibrant emerald green

---

## Health & Wellness Disclaimer
SYDD is a personal consistency and habit tracker. It is designed solely for self-motivation and personal routine tracking. It does not measure physical steps automatically through hardware sensors, nor does it provide medical, diagnostic, dietary, or clinical advice.
