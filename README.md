# SYDD — Obsidian-Inspired Fitness & Nutrition Tracker

> **A focused, local-first personal health tracking application built for long-term consistency, granular strength logging, daily nutrition metrics, and private data ownership.**

---

## Overview

**SYDD** (Stay You, Daily Dedicated) is a production-quality progressive web application (PWA) designed to replace generic, bloated fitness trackers with a fast, private, obsidian-aesthetic interface.

It combines daily consistency tracking (GitHub-style 52-week activity heatmap), granular strength workout logging with sets, reps, and volume loads, full daily macronutrient tracking, curated workout routines, an audio synthesizer rest timer, and an automated filesystem synchronization service.

---

## Key Features

### 1. Daily Consistency & Activity Heatmap
- **52-Week Activity Heatmap**: Visualizes workout minutes, daily step goals, hydration, and habit completions with calibrated intensity scoring.
- **Streak Calculation**: Accurately computes consecutive active streaks and week-over-week consistency recap.
- **Day Detail Modal**: Deep dive into any calendar date to review logged workouts, granular sets, meals, water intake, and daily notes.

### 2. Strength & Workout Tracking
- **Granular Set Builder**: Log exercises with individual sets, reps, weight (kg/lbs), and completion toggles.
- **Precision Numeric Inputs**: React 19-compliant inline state synchronization eliminating decimal truncation bugs.
- **Exercise Catalog**: 60+ categorized exercises covering Chest, Back, Legs, Shoulders, Arms, and Core with equipment filters.
- **Volume Load Curves & Personal Records**: Computes volume loads ($weight \times reps$) and tracks peak records.

### 3. Workout Routines & Split Templates
- **Curated Starter Routines**: Built-in Push, Pull, and Legs templates with pre-configured exercises.
- **Custom Routine Creator**: Save any active workout as a reusable template directly from the log modal.
- **Routines Manager**: Manage and edit custom workout splits in Settings.

### 4. Built-in Audio Rest Timer
- **Zero-Dependency Synthesizer**: Uses the native HTML5 Web Audio API to generate pleasant dual-tone alert chimes ($880\text{ Hz} \rightarrow 1174\text{ Hz}$) on completion.
- **Configurable Intervals**: Quick presets (30s, 60s, 90s, 120s, 180s) with +30s bump controls.
- **Pill Minimization**: Can be minimized into a persistent floating pill while browsing other views.

### 5. Nutrition & Macro Tracking
- **Comprehensive Daily Metrics**: Track Calories (kcal), Protein (g), Carbohydrates (g), and Fat (g).
- **Macro Progress Summary**: Real-time progress bars comparing intake against configurable daily goals.
- **Recent Meals Quick-Fill**: Intelligent chip bar showing recently logged meals for 1-click re-logging.

### 6. Local-First Reliability & Device Sync
- **Instant Offline Operation**: Reads and writes synchronously to client storage with zero cloud latency.
- **Automated Background Sync**: Seamless 2-second debounced backup to the local Node.js persistence microservice.
- **Data Protection Safeguards**: Unit tests isolated to temporary sandbox directories; empty-state overwrite guards prevent accidental cloud wipes.
- **JSON & CSV Portability**: One-click full JSON export/import and injection-safe CSV export.

---

## Architecture & Codebase Structure

SYDD is organized as a clean modular workspace:

```
SYDD/
├── frontend/                     # Next.js 16 Web Client & PWA
│   ├── src/
│   │   ├── app/                  # App Router, Layout, Root Styling & Manifest
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   ├── globals.css
│   │   │   └── manifest.webmanifest
│   │   ├── components/           # UI Components & Application Views
│   │   │   ├── views/
│   │   │   │   ├── OverviewView.tsx    # Daily dashboard, metrics & quick actions
│   │   │   │   ├── HistoryView.tsx     # Calendar heatmap, analytics & logs
│   │   │   │   └── SettingsView.tsx    # Goals, units, routine manager, backup & sync
│   │   │   ├── ActivityHeatmap.tsx     # 52-week SVG activity grid
│   │   │   ├── DayDetailModal.tsx      # Comprehensive day inspection modal
│   │   │   ├── MetricCard.tsx          # Stat cards with progress indicators
│   │   │   ├── QuickLogModal.tsx       # Multi-metric logging modal with routine auto-fill
│   │   │   ├── WorkoutSetBuilder.tsx   # Granular exercise sets and reps table
│   │   │   ├── RestTimer.tsx           # Web Audio API countdown timer
│   │   │   ├── Header.tsx              # Top navigation bar & sync indicator
│   │   │   └── ErrorBoundary.tsx       # Production crash protection
│   │   ├── context/
│   │   │   └── AppContext.tsx          # Reactive state store (useSyncExternalStore)
│   │   ├── lib/                  # Utilities, storage & domain logic
│   │   │   ├── calculations.ts         # Heatmap scores, streak, volume & macro math
│   │   │   ├── constants.ts            # Default routines, starter goals & presets
│   │   │   ├── dateUtils.ts            # Timezone-safe ISO date manipulation
│   │   │   ├── exercises.ts            # Curated exercise definitions catalog
│   │   │   ├── storage.ts              # LocalStorage validation, migration & CSV export
│   │   │   └── syncService.ts          # HTTP client for backend persistence
│   │   └── types/                      # Strict TypeScript definitions
│   │       └── index.ts
│   └── package.json
│
├── backend/                      # Node.js Persistence Microservice
│   ├── src/
│   │   ├── controllers/
│   │   │   └── syncController.ts       # Payload cardinality & integrity guards
│   │   ├── services/
│   │   │   └── storageService.ts       # Atomic file writes & backup rotation
│   │   ├── types/                      # Sync payload schemas
│   │   │   └── index.ts
│   │   ├── server.ts                   # Native HTTP server with strict CORS & headers
│   │   └── security.test.ts            # Endpoint security unit tests
│   ├── data/                           # Persistent storage (gitignored JSON backups)
│   │   ├── latest-backup.json
│   │   └── backups/
│   └── package.json
│
└── README.md
```

---

## Tech Stack

- **Frontend:** [Next.js 16](https://nextjs.org/) (App Router, Turbopack), [React 19](https://react.dev/), [TypeScript 5](https://www.typescriptlang.org/), [Tailwind CSS](https://tailwindcss.com/), [Lucide React](https://lucide.dev/).
- **Backend:** Native [Node.js](https://nodejs.org/) (`node:http`, `node:fs`, `node:crypto`) — zero heavy web framework dependencies.
- **Testing:** Node.js Native Test Runner (`tsx --test`) with 100% assertions across domain logic, schema migration, and API security.

---

## Getting Started

### Prerequisites
- Node.js 20.x or later
- npm 10.x or later

### 1. Installation

Clone the repository and install dependencies in both modules:

```bash
git clone https://github.com/Sidd-commits/SYDD.git
cd SYDD

# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install
```

### 2. Development

Run the backend persistence service:
```bash
cd backend
npm run dev
# Server listening on http://localhost:5000
```

In a separate terminal, run the Next.js frontend:
```bash
cd frontend
npm run dev
# Web app running on http://localhost:3000
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Verification & Testing

Both modules include automated test suites covering data migration, calculations, CSV sanitization, and sync security:

```bash
# Run frontend unit tests (35 tests)
cd frontend
npm test

# Run frontend linter
npm run lint

# Run frontend production build
npm run build

# Run backend unit tests (4 tests)
cd ../backend
npm test
```

---

## Data Privacy & Security

- **Zero Third-Party Telemetry:** No user data or analytics are transmitted to third-party advertising or tracking networks.
- **Formula Injection Defense:** CSV export automatically sanitizes spreadsheet formulas (`=`, `+`, `-`, `@`) to prevent CSV injection.
- **CORS & DoS Protection:** The backend limits JSON payload sizes to 5MB, validates array cardinality ($\le 50,000$ records), and restricts origins via strict CORS headers.
- **Isolated Sandboxes:** Unit tests run in temporary sandbox directories to guarantee that running test suites never alters or overwrites real user backup files.

---

## License

Private personal project. All rights reserved.
