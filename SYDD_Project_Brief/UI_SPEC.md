# UI and UX Specification
## SYDD

## 1. Visual direction
Create a polished, minimal fitness dashboard inspired by the clarity of GitHub's contribution graph, but do not copy GitHub branding. The app should feel calm, modern, personal, and motivating—not like a medical portal or an aggressive gamification app.

### Design keywords
- Clean cards, clear hierarchy, generous spacing.
- Warm neutral or near-white background.
- Dark readable text.
- Green as the primary progress colour, with accessible neutral states.
- Subtle borders and shadows; avoid heavy gradients and neon.
- Use one consistent icon library already in the project; do not add a second.
- Avoid emoji as interface icons.

## 2. Navigation
Desktop:
- Left sidebar or compact top navigation with: Overview, History, Habits, Settings.
- Main content in a centered container with sensible max width.
- User/profile area can be a local “Personal tracker” label; no account feature is required.

Mobile:
- Compact header.
- Bottom navigation for Overview, History, Habits, Settings, or another clear touch-friendly navigation pattern.
- Buttons at least 44px high where practical.
- Cards stack into one column.
- Avoid tiny labels and cramped charts.

## 3. Overview dashboard
Order:
1. Header: “Your consistency, at a glance” plus current date.
2. Daily summary: completed goals / active goals, plus current streak if meaningful.
3. Metric cards:
   - Steps: current / target, progress bar or ring, quick-add/edit.
   - Calories consumed: current / target, clearly informational.
   - Water: current / target, +250 ml and +500 ml actions.
   - Workout: minutes recorded, add workout action.
4. “Today's habits” checklist with completion count and add-habit action.
5. “Your activity” heatmap with year selector, legend, and summary.
6. Weekly recap: steps average, water average, workout minutes, active days. Handle no-data state gracefully.

## 4. Heatmap interactions
- Desktop: display 7 rows by week columns, weekday labels, month labels.
- Mobile: retain readable cells and horizontal scrolling within the heatmap container.
- Hover: tooltip with date and short summary.
- Keyboard/tap: select a cell to open a day-detail panel.
- Include an explicit legend such as “No data”, “Some activity”, “Good progress”, “Goal reached”.
- Use text labels and accessible descriptions in addition to green intensity.
- Do not make a blank day look like an explicitly failed day.
- Use a subtle selected outline, visible focus state, and a clear close action for details.

## 5. Forms and interactions
- Quick logging should use small forms or inline controls, not complex multi-step dialogs.
- Numeric input should show units and validate values.
- Save/cancel actions must be clear.
- Editing should preload the existing value.
- Deleting an entry should confirm when data will be lost.
- Habit completion should be a single tap/click and support undo by toggling it off.
- Toasts or inline feedback should confirm successful saves without interrupting the user.

## 6. Empty states
When there is no history:
- Explain that the heatmap will fill as the user logs activity.
- Offer a “Log today's activity” action.
- Do not fill the heatmap with fabricated activity.
- If demo data exists, label it clearly and provide a way to remove it.

## 7. Accessibility
- Maintain WCAG-friendly contrast where practical.
- All controls work with keyboard and have visible focus.
- Icons have accessible labels.
- Do not rely on green colour alone.
- Respect reduced-motion preferences.
- Use semantic headings and form labels.
- Charts and heatmap cells expose date and value summaries to assistive technology.

## 8. Responsive acceptance checks
Test at widths 320px, 375px, 768px, 1024px, and 1440px.
- No page-level horizontal overflow.
- Heatmap may scroll horizontally within its own container.
- Dialogs fit small screens and can scroll vertically.
- Navigation remains usable with touch.
- Main action remains easy to reach on mobile.
