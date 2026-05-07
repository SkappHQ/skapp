import { DateTime } from "luxon";

interface tenureType {
  startDate: string;
  endDate?: string;
  currentPosition?: boolean;
}

export const calculateTenure = ({
  startDate,
  endDate,
  currentPosition
}: tenureType) => {
  const start = DateTime.fromISO(startDate);
  const end = currentPosition
    ? DateTime.now()
    : DateTime.fromISO(endDate ?? "");

  const diff = end.diff(start, ["years", "months"]);

  const years = Math.floor(diff.years);
  const months = Math.floor(diff.months);

  const tenureYears = Math.max(years, 0);
  const tenureMonths = Math.max(months, 0);

  return tenureYears > 0
    ? `${tenureYears}y ${tenureMonths}m`
    : `${tenureMonths}m`;
};

/**
 * Formats a tenure duration into a human-readable label.
 * @param years - Number of years
 * @param months - Number of months
 * @param translateText - Translation function for i18n
 * @returns Formatted string like "2 years, 3 months" or "5 months"
 */
export const formatTenureLabel = (
  years: number,
  months: number,
  translateText: (keys: string[]) => string
): string => {
  const clampedYears = Math.max(0, Math.floor(years));
  const clampedMonths = Math.max(0, Math.min(11, Math.floor(months)));

  if (clampedYears === 0 && clampedMonths === 0) {
    return translateText(["less_than_a_month"]);
  }

  const parts: string[] = [];

  if (clampedYears > 0) {
    parts.push(
      `${clampedYears} ${clampedYears === 1 ? translateText(["year"]) : translateText(["years"])}`
    );
  }

  if (clampedMonths > 0) {
    parts.push(
      `${clampedMonths} ${clampedMonths === 1 ? translateText(["month"]) : translateText(["months"])}`
    );
  }

  return parts.join(", ");
};

/**
 * Calculates total months of tenure from a start date to an optional end date.
 */
export const getTenureInMonths = (
  startDate: string,
  endDate?: string
): number => {
  const start = DateTime.fromISO(startDate);
  const end = endDate ? DateTime.fromISO(endDate) : DateTime.now();

  if (!start.isValid || !end.isValid) {
    return 0;
  }

  const diff = end.diff(start, ["months"]);
  return Math.max(0, Math.floor(diff.months));
};
