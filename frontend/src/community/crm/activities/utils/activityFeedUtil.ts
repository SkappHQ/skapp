import { DateTime } from "luxon";
import type { DateRange as PickerDateRange } from "react-day-picker";

import { TranslatorFunctionType } from "~community/common/types/CommonTypes";
import {
  getOrdinalIndicator,
  instantInZone,
  parseInstant
} from "~community/common/utils/dateTimeUtils";
import {
  ACTIVITY_BUCKET_ORDER,
  ACTIVITY_DATE_FORMAT,
  ACTIVITY_FIXED_BUCKET_KEYS,
  ACTIVITY_MONTH_ABBREVIATIONS,
  ACTIVITY_MONTH_HEADING_FORMAT,
  ACTIVITY_MONTH_KEY_FORMAT,
  ACTIVITY_TIME_FORMAT
} from "~community/crm/activities/constants/activityConstants";
import {
  ActivityBucket,
  ActivityBucketGroup,
  ActivityFeedResponse,
  ActivityLink,
  ActivityMonthGroup,
  ActivityRow,
  ActivityType,
  DateRange
} from "~community/crm/activities/types/activityTypes";

export const getActivityRowKey = (row: ActivityRow): string =>
  `${row.type}-${row.id}`;

export const getMonthAnchor = (row: ActivityRow): string | null => {
  if (row.isCompleted && row.completedAt) return row.completedAt;

  return row.occurredAt ?? row.dueAt;
};

const toMillis = (isoInstant: string): number =>
  parseInstant(isoInstant).toMillis();

export const groupByMonth = (
  pages: ActivityFeedResponse[],
  zone?: string
): ActivityMonthGroup[] => {
  const seenKeys = new Set<string>();
  const groups = new Map<string, ActivityRow[]>();

  for (const page of pages) {
    for (const row of page.byMonth?.items ?? []) {
      const rowKey = getActivityRowKey(row);
      const anchor = getMonthAnchor(row);

      if (seenKeys.has(rowKey) || !anchor) continue;

      seenKeys.add(rowKey);

      const monthKey = instantInZone(anchor, zone).toFormat(
        ACTIVITY_MONTH_KEY_FORMAT
      );
      const monthRows = groups.get(monthKey) ?? [];

      monthRows.push(row);
      groups.set(monthKey, monthRows);
    }
  }

  return Array.from(groups, ([monthKey, rows]) => ({
    monthKey,
    rows: [...rows].sort(
      (first, second) =>
        toMillis(getMonthAnchor(second) ?? "") -
        toMillis(getMonthAnchor(first) ?? "")
    )
  })).sort((first, second) => second.monthKey.localeCompare(first.monthKey));
};

export const getVisibleBuckets = (
  pages: ActivityFeedResponse[],
  zone?: string
): ActivityBucketGroup[] => {
  const [firstPage] = pages;

  if (!firstPage) return [];

  return ACTIVITY_BUCKET_ORDER.flatMap((bucket): ActivityBucketGroup[] => {
    if (bucket === ActivityBucket.BY_MONTH) {
      return groupByMonth(pages, zone).map((group) => ({
        id: `month-${group.monthKey}`,
        bucket,
        monthKey: group.monthKey,
        rows: group.rows
      }));
    }

    return [
      {
        id: bucket.toLowerCase(),
        bucket,
        monthKey: null,
        rows: firstPage[ACTIVITY_FIXED_BUCKET_KEYS[bucket]] ?? []
      }
    ];
  }).filter((group) => group.rows.length > 0);
};

export const countBucketRows = (groups: ActivityBucketGroup[]): number =>
  groups.reduce((total, group) => total + group.rows.length, 0);

export const formatMonthHeading = (monthKey: string): string =>
  DateTime.fromFormat(monthKey, ACTIVITY_MONTH_KEY_FORMAT).toFormat(
    ACTIVITY_MONTH_HEADING_FORMAT
  );

export const formatActivityDate = (dateTime: DateTime): string =>
  `${dateTime.day}${getOrdinalIndicator(dateTime.day)} ${
    ACTIVITY_MONTH_ABBREVIATIONS[dateTime.month - 1]
  }`;

const isInFuture = (isoInstant: string): boolean =>
  toMillis(isoInstant) >= DateTime.now().toMillis();

export const getRowSubtitle = (
  row: ActivityRow,
  translate: TranslatorFunctionType,
  zone?: string
): string => {
  if (row.type === ActivityType.TASK) {
    if (row.isCompleted && row.completedAt) {
      return translate(["row", "subtitle", "completedOn"], {
        date: formatActivityDate(instantInZone(row.completedAt, zone))
      });
    }

    if (!row.dueAt) return "";

    return translate(["row", "subtitle", "dueOn"], {
      date: formatActivityDate(instantInZone(row.dueAt, zone))
    });
  }

  if (row.type === ActivityType.MEETING && row.dueAt && isInFuture(row.dueAt)) {
    return translate(["row", "subtitle", "scheduledOn"], {
      date: formatActivityDate(instantInZone(row.dueAt, zone))
    });
  }

  const happenedAt = row.occurredAt ?? row.dueAt;

  if (!happenedAt) return "";

  const zoned = instantInZone(happenedAt, zone);

  return translate(["row", "subtitle", "occurredAt"], {
    date: formatActivityDate(zoned),
    time: zoned.toFormat(ACTIVITY_TIME_FORMAT)
  });
};

export const getLinkLabel = (
  link: ActivityLink,
  translate: TranslatorFunctionType
): string =>
  link.deleted
    ? translate(["row", "deletedLink"], { name: link.name })
    : link.name;

const parseDateValue = (value: string): DateTime =>
  DateTime.fromFormat(value, ACTIVITY_DATE_FORMAT);

export const validateDateRange = (range: DateRange): boolean => {
  if (!range.from || !range.to) return true;

  const from = parseDateValue(range.from);
  const to = parseDateValue(range.to);

  if (!from.isValid || !to.isValid) return false;

  return to.toMillis() >= from.toMillis();
};

export const toPickerDateRange = (range: DateRange): PickerDateRange => {
  const pickerRange: Partial<PickerDateRange> = {};

  if (range.from) pickerRange.from = parseDateValue(range.from).toJSDate();
  if (range.to) pickerRange.to = parseDateValue(range.to).toJSDate();

  return pickerRange as PickerDateRange;
};

export const fromPickerDateRange = (range?: PickerDateRange): DateRange => ({
  from: range?.from
    ? DateTime.fromJSDate(range.from).toFormat(ACTIVITY_DATE_FORMAT)
    : null,
  to: range?.to
    ? DateTime.fromJSDate(range.to).toFormat(ACTIVITY_DATE_FORMAT)
    : null
});

export const isDateRangeEmpty = (range: DateRange): boolean =>
  !range.from && !range.to;
