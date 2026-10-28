import test from "node:test";
import assert from "node:assert";
import {
  formatISODate,
  parseISODate,
  addDays,
  differenceInDays,
  formatDisplayDate,
  buildHeatmapWeeks,
  getPast7Days,
} from "./dateUtils";

test("formatISODate formats dates to YYYY-MM-DD", () => {
  const d = new Date(2026, 4, 9); // May 9, 2026
  assert.strictEqual(formatISODate(d), "2026-05-09");
});

test("parseISODate parses YYYY-MM-DD to local midnight date", () => {
  const parsed = parseISODate("2026-10-27");
  assert.strictEqual(parsed.getFullYear(), 2026);
  assert.strictEqual(parsed.getMonth(), 9); // October = 9
  assert.strictEqual(parsed.getDate(), 27);
  assert.strictEqual(parsed.getHours(), 0);
});

test("addDays correctly handles month and year rollovers", () => {
  assert.strictEqual(addDays("2026-12-31", 1), "2027-01-01");
  assert.strictEqual(addDays("2026-01-01", -1), "2025-12-31");
  assert.strictEqual(addDays("2026-02-28", 1), "2026-03-01"); // Not a leap year
  assert.strictEqual(addDays("2024-02-28", 1), "2024-02-29"); // Leap year
});

test("differenceInDays computes day differences correctly", () => {
  assert.strictEqual(differenceInDays("2026-10-27", "2026-10-20"), 7);
  assert.strictEqual(differenceInDays("2026-10-20", "2026-10-27"), -7);
  assert.strictEqual(differenceInDays("2026-10-27", "2026-10-27"), 0);
});

test("formatDisplayDate gives sensible relative and absolute labels", () => {
  const formatted = formatDisplayDate("2026-01-15", "short");
  assert.ok(formatted.includes("Jan"));
});

test("buildHeatmapWeeks produces a valid 52 or 53 week layout", () => {
  const weeks = buildHeatmapWeeks(2026);
  assert.ok(weeks.length >= 52 && weeks.length <= 54, `Weeks count was ${weeks.length}`);
  // Every week should have exactly 7 days
  for (const w of weeks) {
    assert.strictEqual(w.days.length, 7);
  }
});

test("getPast7Days returns 7 consecutive days ending with reference date", () => {
  const days = getPast7Days("2026-10-27");
  assert.strictEqual(days.length, 7);
  assert.strictEqual(days[6], "2026-10-27");
  assert.strictEqual(days[0], "2026-10-21");
});
