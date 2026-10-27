# Product Requirements Document (PRD)
## SYDD — Fitness Consistency Tracker
**Version:** 1.0  
**Status:** MVP specification

## 1. Product summary
SYDD is a personal fitness dashboard that turns everyday health actions into a visual consistency record. Its signature feature is a GitHub-style activity heatmap: each day is represented by a green cell whose intensity reflects progress toward a configurable daily activity goal.

The app should make it easy to answer:
- How active have I been recently?
- Am I building a consistent routine?
- How close am I to today's goals?
- Which habits have I completed?
- What patterns can I see across weeks and months?

## 2. Target user
A person who wants a lightweight personal fitness tracker and habit dashboard, especially someone motivated by visible streaks and contribution graphs. The MVP is for one user on one device and must work well on a phone.

## 3. Product principles
1. Consistency over perfection: missed days are neutral data, not failure.
2. Clear and honest: manually entered values must be labelled as manual.
3. Fast logging: common updates should take only a few taps.
4. Responsive by default: mobile is a first-class experience.
5. Private by default: no public profile, social feed, or analytics tracking in MVP.
6. No medical claims: this is a wellness tracker, not a diagnostic or treatment tool.

## 4. Goals and non-goals
### Goals
- Record daily steps, calories consumed, water intake, and workouts.
- Let users set and edit daily goals.
- Track small recurring habits and mark them complete each day.
- Show a year-style activity heatmap with useful day details.
- Summarize today, the current week, and longer-term consistency.
- Persist data between browser sessions on the same device.
- Provide a usable, accessible mobile layout.

### Non-goals for MVP
- Automatic step counting from a phone sensor or wearable.
- Apple Health, Google Health Connect, Fitbit, Garmin, or other integrations.
- Medical advice, meal plans, or calorie recommendations.
- Social profiles, leaderboards, sharing, or following friends.
- Payments, subscriptions, or a complex cloud backend.
- AI coaching.
- Multi-user accounts or cross-device sync.

## 5. Core user journeys
### Journey A: First visit
1. User opens the app.
2. A short onboarding panel explains that values can be entered manually.
3. User chooses daily step, calorie, and water goals (defaults provided).
4. User lands on the dashboard with empty states and clear ways to log activity.
5. The app explains that data is stored locally in this MVP.

### Journey B: Log daily activity
1. User selects a metric card or quick-add action.
2. User enters a value or uses a small increment/decrement control.
3. User saves the entry.
4. The dashboard updates totals, goal progress, and the activity heatmap.
5. User can edit or delete the entry.

### Journey C: Complete a habit
1. User creates a habit such as “10-minute walk” or “Stretch”.
2. The habit appears in today's checklist.
3. User checks it off; the completion state and heatmap update.
4. User can uncheck it or edit/archive the habit.

### Journey D: Inspect history
1. User views the heatmap.
2. User selects a date/cell.
3. A tooltip or detail panel shows that day's steps, calorie intake, water, workout minutes, and completed habits.
4. User can navigate to a date and edit that day's entries.

### Journey E: Change goals
1. User opens Settings.
2. User edits one or more daily targets.
3. The dashboard recalculates progress against the new goals.
4. Historical raw entries remain unchanged.

## 6. MVP features and requirements

### 6.1 Dashboard
The main dashboard must include:
- Greeting/date header and a compact daily summary.
- Today's progress cards for steps, calories, water, and workout minutes.
- Progress indicators with current value, target, and remaining amount.
- A quick-log area for common actions.
- Today's habits checklist.
- A contribution-style activity heatmap.
- A weekly summary with completed goals or active days.
- A helpful empty state for users with no data.

### 6.2 Activity heatmap
- Display the current year by default; allow previous-year navigation if simple to implement.
- Each day is a cell, arranged in a GitHub-like week grid.
- Use a green intensity scale based on overall daily goal completion.
- A day with no entries must be visually distinguishable from a day with recorded zero activity.
- Selecting a cell opens a day-detail tooltip, popover, or panel.
- Include a legend and accessible text labels; colour must not be the only signal.
- Heatmap must scroll horizontally on small screens rather than compressing cells into unreadable sizes.
- Include a summary such as active days, current streak, and best streak.
- A “streak” is based on at least one configured activity/habit goal completed on a calendar day; define this clearly in the UI and code. Do not imply it is a medical or fitness achievement.

### 6.3 Steps
- Manual daily step entry.
- Configurable daily step target (default 8,000).
- Show progress and whether target is met.
- Support edit/delete for an entry.
- Do not imply steps are automatically detected.

### 6.4 Calories
- Record daily calories consumed as a single manual total for MVP.
- Configurable target (default 2,000 kcal) used only as a personal tracking reference.
- Label as “Calories consumed”, not “calories burned”.
- Avoid telling users how many calories they should eat; defaults are editable and are not medical advice.
- Allow correction of mistaken entries.

### 6.5 Water
- Record water intake in millilitres, with quick-add buttons such as +250 ml and +500 ml.
- Configurable daily target (default 2,000 ml).
- Show today's total and target progress.

### 6.6 Workouts
- Add a workout entry with activity type, duration in minutes, optional notes, and date.
- Support types such as walking, running, cycling, strength, yoga, and other.
- Show total workout minutes for the selected day.
- No automatic calorie-burn estimates.

### 6.7 Habits and tasks
- Users can create, rename, archive, and delete personal habits.
- Examples: stretch, morning walk, mobility, sleep routine, or take a break from sitting.
- Each habit can be marked complete per date and toggled off.
- Optional reminder time can be stored as a preference, but actual notifications are not required for MVP.
- Deleting a habit should explain whether historical completions are retained or removed; prefer archiving to preserve history.

### 6.8 History and editing
- User can select a date from the heatmap or date picker.
- User can review and edit daily records.
- Dates must be handled consistently in the user's local timezone.
- Do not silently overwrite unrelated metrics when editing one metric.

### 6.9 Settings
- Edit step, calorie, and water goals.
- Choose units where relevant (ml/litre display; minutes for workouts).
- Export data as JSON or CSV.
- Clear all local data only after a clear confirmation step.
- Explain that the MVP stores data in this browser/device and does not sync to another device.

### 6.10 Data persistence
- Persist records across refreshes and browser restarts.
- Use local storage for the MVP, behind a small data-access abstraction.
- Handle malformed or missing stored data gracefully.
- Include a sample/demo mode only if clearly labelled and easy to reset.
- No network calls or third-party analytics are required for MVP.

## 7. Suggested default goals
These are editable starting values, not medical recommendations:
- Steps: 8,000/day
- Calories consumed: 2,000 kcal/day
- Water: 2,000 ml/day
- Workout: 30 minutes/day (optional goal, off by default if it makes the dashboard too busy)

Users should be able to change or disable targets.

## 8. Heatmap scoring suggestion
Use a transparent, non-medical score for colour intensity:
- Step progress: steps / step goal, capped at 1
- Water progress: water / water goal, capped at 1
- Habit progress: completed active habits / active habits, capped at 1 (omit if no habits exist)
- Workout progress: workout minutes / workout goal, capped at 1 (only if workout goal is enabled)
- Calories should not increase a “fitness score”; calorie intake is informational and personal-target tracking can be visually separate.

Average only the enabled/available components. Map the resulting score to 0–4 green levels. A day with no recorded activity should remain “no data”, not level zero, unless the user explicitly logged data. Document the formula in code and a small UI tooltip. Do not reward lower calorie intake or imply that eating less is better.

## 9. Functional requirements
- All forms have validation and clear error messages.
- Numeric values cannot be negative; impose reasonable upper bounds to catch accidental input.
- Dates are validated and saved in a consistent ISO date format (`YYYY-MM-DD`).
- All interactive controls work with keyboard navigation.
- Every icon-only button has an accessible name.
- Data remains after refresh.
- Empty, loading, success, and error states are designed.
- Destructive actions require confirmation.
- Layout supports narrow mobile screens (320px width and above) and desktop.
- No dead links, placeholder buttons, or non-functional primary actions.

## 10. Non-functional requirements
- TypeScript strict mode where applicable.
- Components are small and reusable.
- Good contrast and visible focus states.
- Semantic HTML and appropriate ARIA labels.
- Avoid unnecessary dependencies.
- No secrets in source control.
- Clear separation between UI, calculations, and persistence.
- Provide a README with setup/run/test instructions.
- Tests for core calculations, persistence parsing, date handling, and habit completion.

## 11. Success criteria
The MVP is accepted when:
1. A new user can set goals and log steps in under one minute.
2. Steps, water, calories, workouts, and habits can be added, edited, and deleted as specified.
3. Heatmap updates immediately after an entry is saved.
4. Selecting a heatmap cell shows accurate details for that date.
5. Data survives refresh and browser restart on the same browser/device.
6. Mobile layout is usable without horizontal page overflow; only the heatmap itself may scroll horizontally.
7. Export creates a usable file; clear-data requires confirmation.
8. Core tests pass and there are no console errors in normal flows.
9. The UI clearly states that entries are manual and data is local to the device.
10. The app does not claim to measure steps automatically or provide medical advice.

## 12. Future roadmap (not MVP)
- Optional account and encrypted cloud sync.
- Google Health Connect / Apple Health integration, subject to platform capabilities and permissions.
- Wearable integrations.
- Meal-level calorie logging and food search.
- Sleep tracking.
- Custom dashboards and date-range comparisons.
- Reminders/notifications.
- Installable Progressive Web App (PWA).
- Optional AI summaries, only with explicit user consent and transparent data handling.
