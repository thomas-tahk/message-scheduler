/**
 * Recurrence rule types for scheduling
 */

export type RecurrenceType = 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface RecurrenceRule {
  type: RecurrenceType;
  interval: number; // e.g., every 2 days, every 3 weeks
  daysOfWeek?: number[]; // 0-6 (Sunday-Saturday) for weekly recurrence
  dayOfMonth?: number; // 1-31 for monthly recurrence
  endDate?: string; // ISO date string
  count?: number; // Number of occurrences
}

/**
 * Helper to parse recurrence rule from JSON
 */
export function parseRecurrenceRule(json: any): RecurrenceRule | null {
  if (!json) return null;

  try {
    return json as RecurrenceRule;
  } catch {
    return null;
  }
}

/**
 * Calculate next run date based on recurrence rule
 */
export function calculateNextRun(
  currentDate: Date,
  rule: RecurrenceRule
): Date | null {
  const next = new Date(currentDate);

  switch (rule.type) {
    case 'daily':
      next.setDate(next.getDate() + rule.interval);
      break;

    case 'weekly':
      next.setDate(next.getDate() + (7 * rule.interval));
      break;

    case 'monthly':
      next.setMonth(next.getMonth() + rule.interval);
      break;

    case 'yearly':
      next.setFullYear(next.getFullYear() + rule.interval);
      break;

    default:
      return null;
  }

  // Check if we've exceeded the end date or count
  if (rule.endDate && next > new Date(rule.endDate)) {
    return null;
  }

  return next;
}
