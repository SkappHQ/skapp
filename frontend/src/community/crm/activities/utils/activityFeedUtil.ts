import { DateTime } from "luxon";

import { TranslatorFunctionType } from "~community/common/types/CommonTypes";
import {
  formatDateTimeWithOrdinalIndicatorWithoutYear,
  instantInZone,
  parseInstant
} from "~community/common/utils/dateTimeUtils";
import {
  ACTIVITY_BUCKET_ORDER,
  ACTIVITY_FIXED_BUCKET_KEYS,
  ACTIVITY_MONTH_HEADING_FORMAT,
  ACTIVITY_MONTH_KEY_FORMAT,
  ACTIVITY_TIME_FORMAT
} from "~community/crm/activities/constants/activityConstants";
import {
  ActivityBucket,
  ActivityBucketGroup,
  ActivityFeedResponse,
  ActivityMonthGroup,
  ActivityRelatedAssociation,
  ActivityRow,
  ActivityType
} from "~community/crm/activities/types/activityTypes";
import { isDueToday, isOverdue } from "~community/crm/utils/taskValidations";

export const getActivityRowKey = (row: ActivityRow): string =>
  `${row.type}-${row.id}`;

const getMonthAnchor = (row: ActivityRow): string | null =>
  row.occurredAt ?? row.completedAt ?? row.dueAt;

const groupByMonth = (
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
    rows
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

export const formatMonthHeading = (monthKey: string): string =>
  DateTime.fromFormat(monthKey, ACTIVITY_MONTH_KEY_FORMAT).toFormat(
    ACTIVITY_MONTH_HEADING_FORMAT
  );

const toMillis = (isoInstant: string): number =>
  parseInstant(isoInstant).toMillis();

const isInFuture = (isoInstant: string): boolean =>
  toMillis(isoInstant) >= DateTime.now().toMillis();

export const isRowOverdue = (row: ActivityRow, zone?: string): boolean =>
  row.type === ActivityType.TASK &&
  !row.isCompleted &&
  row.dueAt !== null &&
  isOverdue(row.dueAt, zone);

export const getRowSubtitle = (
  row: ActivityRow,
  translate: TranslatorFunctionType,
  zone?: string
): string => {
  if (row.type === ActivityType.TASK) {
    if (!row.dueAt) return "";

    if (isRowOverdue(row, zone)) {
      return translate(["activities", "row", "subtitle", "overdue"]);
    }

    if (isDueToday(row.dueAt, zone)) {
      return translate(["activities", "row", "subtitle", "dueToday"]);
    }

    return translate(["activities", "row", "subtitle", "dueOn"], {
      date: formatDateTimeWithOrdinalIndicatorWithoutYear(
        instantInZone(row.dueAt, zone)
      )
    });
  }

  if (row.type === ActivityType.MEETING && row.dueAt && isInFuture(row.dueAt)) {
    return translate(["activities", "row", "subtitle", "scheduledOn"], {
      date: formatDateTimeWithOrdinalIndicatorWithoutYear(
        instantInZone(row.dueAt, zone)
      )
    });
  }

  const happenedAt = row.occurredAt ?? row.dueAt;

  if (!happenedAt) return "";

  const zoned = instantInZone(happenedAt, zone);

  return translate(["activities", "row", "subtitle", "occurredAt"], {
    date: formatDateTimeWithOrdinalIndicatorWithoutYear(zoned),
    time: zoned.toFormat(ACTIVITY_TIME_FORMAT)
  });
};

export const getRelatedAssociationLabel = (
  link: ActivityRelatedAssociation,
  translate: TranslatorFunctionType
): string =>
  link.deleted
    ? translate(["activities", "row", "deletedAssociation"], {
        name: link.name
      })
    : link.name;
