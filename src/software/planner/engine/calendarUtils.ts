import { ProjectCalendar } from '../types';

/**
 * Standard default calendar (Mon-Fri 8 hrs/day)
 */
export const DEFAULT_CALENDAR: ProjectCalendar = {
  id: 'standard',
  name: 'Standard Working Calendar (Mon-Fri)',
  workingDays: [1, 2, 3, 4, 5], // Monday through Friday
  workingHoursPerDay: 8,
  holidays: [
    { id: 'h1', name: 'New Year Day', date: '2026-01-01' },
    { id: 'h2', name: 'Labor Day', date: '2026-05-01' },
    { id: 'h3', name: 'National Day', date: '2026-10-01' },
  ],
};

/**
 * Check if a given date is a working day
 */
export function isWorkingDay(dateStr: string, calendar: ProjectCalendar = DEFAULT_CALENDAR): boolean {
  if (!dateStr) return false;
  const date = new Date(dateStr + 'T00:00:00');
  if (isNaN(date.getTime())) return false;

  const dayOfWeek = date.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
  if (!calendar.workingDays.includes(dayOfWeek)) {
    return false;
  }

  // Check holidays
  const isHoliday = calendar.holidays.some((h) => h.date === dateStr);
  return !isHoliday;
}

/**
 * Format Date object or YYYY-MM-DD string to YYYY-MM-DD
 */
export function formatDate(date: Date | string): string {
  if (typeof date === 'string') {
    if (date.length === 10 && date.includes('-')) return date;
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    return d.toISOString().split('T')[0];
  }
  return date.toISOString().split('T')[0];
}

/**
 * Get next working day if current date is a non-working day
 */
export function getNextWorkingDay(dateStr: string, calendar: ProjectCalendar = DEFAULT_CALENDAR): string {
  let current = new Date(dateStr + 'T00:00:00');
  while (!isWorkingDay(formatDate(current), calendar)) {
    current.setDate(current.getDate() + 1);
  }
  return formatDate(current);
}

/**
 * Add N working days to start date to calculate finish date
 */
export function addWorkingDays(
  startDateStr: string,
  days: number,
  calendar: ProjectCalendar = DEFAULT_CALENDAR
): string {
  if (days <= 0) return startDateStr;
  let current = new Date(startDateStr + 'T00:00:00');

  // ensure starting on a working day
  if (!isWorkingDay(formatDate(current), calendar)) {
    current = new Date(getNextWorkingDay(formatDate(current), calendar) + 'T00:00:00');
  }

  let remaining = days - 1; // Start day counts as day 1
  while (remaining > 0) {
    current.setDate(current.getDate() + 1);
    if (isWorkingDay(formatDate(current), calendar)) {
      remaining--;
    }
  }

  return formatDate(current);
}

/**
 * Calculate working days between start date and finish date inclusive
 */
export function getWorkingDaysBetween(
  startDateStr: string,
  finishDateStr: string,
  calendar: ProjectCalendar = DEFAULT_CALENDAR
): number {
  if (!startDateStr || !finishDateStr) return 0;
  let start = new Date(startDateStr + 'T00:00:00');
  let finish = new Date(finishDateStr + 'T00:00:00');

  if (start > finish) return 0;

  let count = 0;
  let curr = new Date(start);
  while (curr <= finish) {
    if (isWorkingDay(formatDate(curr), calendar)) {
      count++;
    }
    curr.setDate(curr.getDate() + 1);
  }
  return Math.max(1, count);
}

/**
 * Calculate calendar days difference (for rough calculations or non-working day modes)
 */
export function getCalendarDaysDiff(startStr: string, finishStr: string): number {
  const start = new Date(startStr + 'T00:00:00');
  const finish = new Date(finishStr + 'T00:00:00');
  const diffTime = finish.getTime() - start.getTime();
  return Math.max(0, Math.round(diffTime / (1000 * 3600 * 24))) + 1;
}

/**
 * Parse date string cleanly
 */
export function parseDate(dateStr: string): Date {
  return new Date(dateStr + 'T00:00:00');
}
