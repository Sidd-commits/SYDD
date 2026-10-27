import { ISODate } from "@/types";

/**
 * Formats a local Date object into YYYY-MM-DD string without UTC timezone drift.
 */
export function formatISODate(date: Date): ISODate {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Returns today's date in local calendar as YYYY-MM-DD.
 */
export function getTodayISODate(): ISODate {
  return formatISODate(new Date());
}

/**
 * Safely parses YYYY-MM-DD into a local Date set to 00:00:00 local time.
 */
export function parseISODate(iso: ISODate): Date {
  const parts = iso.split("-").map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) {
    return new Date();
  }
  return new Date(parts[0], parts[1] - 1, parts[2], 0, 0, 0, 0);
}

/**
 * Adds or subtracts days to an ISODate in the local calendar.
 */
export function addDays(iso: ISODate, days: number): ISODate {
  const d = parseISODate(iso);
  d.setDate(d.getDate() + days);
  return formatISODate(d);
}

/**
 * Difference in calendar days between two ISODates (isoA - isoB).
 */
export function differenceInDays(isoA: ISODate, isoB: ISODate): number {
  const dateA = parseISODate(isoA);
  const dateB = parseISODate(isoB);
  const msDiff = dateA.getTime() - dateB.getTime();
  return Math.round(msDiff / (1000 * 60 * 60 * 24));
}

/**
 * Returns user-friendly formatted date string.
 */
export function formatDisplayDate(
  iso: ISODate,
  style: "relative" | "short" | "medium" | "full" = "medium"
): string {
  const today = getTodayISODate();
  const diff = differenceInDays(today, iso);

  if (style === "relative") {
    if (diff === 0) return "Today";
    if (diff === 1) return "Yesterday";
    if (diff === -1) return "Tomorrow";
    if (diff > 1 && diff < 7) return `${diff} days ago`;
  }

  const d = parseISODate(iso);
  if (style === "short") {
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }
  if (style === "full") {
    return d.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Returns day of week (0 = Sunday, 1 = Monday, ... 6 = Saturday)
 */
export function getDayOfWeek(iso: ISODate): number {
  return parseISODate(iso).getDay();
}

/**
 * Returns all ISODates for a given year in sequential order.
 */
export function getYearDates(year: number): ISODate[] {
  const dates: ISODate[] = [];
  const start = new Date(year, 0, 1, 0, 0, 0, 0);
  const end = new Date(year, 11, 31, 0, 0, 0, 0);

  const current = new Date(start);
  while (current <= end) {
    dates.push(formatISODate(current));
    current.setDate(current.getDate() + 1);
  }
  return dates;
}

/**
 * Generates the full 52-53 week grid layout for the contribution heatmap.
 * Starts from the Sunday/Monday before the year's Jan 1 to the end of the year or current week.
 * Uses Monday as the start of week (standard ISO/GitHub style) for clean rows.
 */
export type HeatmapWeek = {
  weekNumber: number;
  monthLabel?: string;
  days: {
    date: ISODate;
    dayOfWeek: number; // 0=Mon, 1=Tue, ... 6=Sun
    isCurrentYear: boolean;
    isFuture: boolean;
  }[];
};

export function buildHeatmapWeeks(year: number, referenceToday?: ISODate): HeatmapWeek[] {
  const today = referenceToday || `${year}-12-31`;
  const jan1 = new Date(year, 0, 1, 0, 0, 0, 0);
  const dec31 = new Date(year, 11, 31, 0, 0, 0, 0);

  // Determine starting Monday: (jan1.getDay() + 6) % 7 gives 0 for Mon, 6 for Sun
  const jan1DayOfWeek = (jan1.getDay() + 6) % 7; // Monday = 0
  const gridStart = new Date(jan1);
  gridStart.setDate(gridStart.getDate() - jan1DayOfWeek);

  // Determine ending Sunday
  const dec31DayOfWeek = (dec31.getDay() + 6) % 7;
  const gridEnd = new Date(dec31);
  gridEnd.setDate(gridEnd.getDate() + (6 - dec31DayOfWeek));

  const weeks: HeatmapWeek[] = [];
  let current = new Date(gridStart);
  let weekIndex = 0;
  let lastMonthSeen = -1;

  while (current <= gridEnd) {
    const days = [];
    let weekMonthLabel: string | undefined = undefined;

    for (let d = 0; d < 7; d++) {
      const iso = formatISODate(current);
      const isCurrentYear = current.getFullYear() === year;
      const isFuture = iso > today;

      // Assign month label to the first week that contains a day of that new month in the target year
      if (isCurrentYear && current.getMonth() !== lastMonthSeen && current.getDate() <= 7) {
        lastMonthSeen = current.getMonth();
        weekMonthLabel = current.toLocaleDateString("en-US", { month: "short" });
      }

      days.push({
        date: iso,
        dayOfWeek: d,
        isCurrentYear,
        isFuture,
      });

      current.setDate(current.getDate() + 1);
    }

    weeks.push({
      weekNumber: weekIndex++,
      monthLabel: weekMonthLabel,
      days,
    });
  }

  return weeks;
}

/**
 * Returns past 7 days ending on today (for weekly recap).
 */
export function getPast7Days(referenceDate: ISODate = getTodayISODate()): ISODate[] {
  const dates: ISODate[] = [];
  for (let i = 6; i >= 0; i--) {
    dates.push(addDays(referenceDate, -i));
  }
  return dates;
}
