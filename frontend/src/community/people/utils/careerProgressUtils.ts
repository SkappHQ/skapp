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
