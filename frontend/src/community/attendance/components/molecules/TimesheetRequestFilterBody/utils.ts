import type { DateRange } from "react-day-picker";

import { DATE_FORMAT } from "~community/common/constants/timeConstants";
import {
  convertDateToFormat,
  convertYYYYMMDDToDateTime,
  getFirstDateOfYear
} from "~community/common/utils/dateTimeUtils";

/** Store `["YYYY-MM-DD", "YYYY-MM-DD"]` → `DateRange` (either side may be ""). */
export const toDateRange = (dates: string[]): DateRange | undefined => {
  const [from, to] = dates;
  if (!from && !to) return undefined;
  return {
    from: convertYYYYMMDDToDateTime(from).toJSDate(),
    to: convertYYYYMMDDToDateTime(to).toJSDate()
  };
};

/** `DateRange` → store `["YYYY-MM-DD", "YYYY-MM-DD"]` (empty strings when unset). */
export const fromDateRange = (range?: DateRange): string[] => [
  range?.from ? convertDateToFormat(range.from, DATE_FORMAT) : "",
  range?.to ? convertDateToFormat(range.to, DATE_FORMAT) : ""
];

/**
 * skapp-ui's DateRangePicker has no minDate prop, so the calendar itself can't
 * grey out prior years. Clamp here instead to preserve the current-year-only
 * constraint the legacy filter enforced via minDate.
 */
export const clampToCurrentYear = (
  range?: DateRange
): DateRange | undefined => {
  if (!range) return range;
  const yearStart = getFirstDateOfYear(new Date().getFullYear()).toJSDate();
  const clamp = (date?: Date) => (date && date < yearStart ? yearStart : date);
  return { from: clamp(range.from), to: clamp(range.to) };
};
