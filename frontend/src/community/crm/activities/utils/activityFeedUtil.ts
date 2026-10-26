import { DateTime } from "luxon";

import { TranslatorFunctionType } from "~community/common/types/CommonTypes";
import {
  formatDateTimeWithOrdinalIndicatorWithoutYear,
  instantInZone,
  parseInstant
} from "~community/common/utils/dateTimeUtils";
import {
  ACTIVITY_BUCKET_ORDER,
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

const getDueBucket = (
  row: ActivityRow,
  zone?: string
): ActivityBucket | null => {
  if (!row.dueAt || row.isCompleted) return null;

  if (row.type !== ActivityType.TASK && !isInFuture(row.dueAt)) return null;

  if (isOverdue(row.dueAt, zone)) return ActivityBucket.OVERDUE;

  return isDueToday(row.dueAt, zone)
    ? ActivityBucket.TODAY
    : ActivityBucket.UPCOMING;
};

const getDueMillis = (row: ActivityRow): number =>
  row.dueAt ? toMillis(row.dueAt) : 0;

const sortByDueDate = (
  rows: ActivityRow[],
  bucket: ActivityBucket
): ActivityRow[] =>
  [...rows].sort((first, second) =>
    bucket === ActivityBucket.OVERDUE
      ? getDueMillis(second) - getDueMillis(first)
      : getDueMillis(first) - getDueMillis(second)
  );

const groupByMonth = (
  rows: ActivityRow[],
  zone?: string
): ActivityMonthGroup[] => {
  const groups = new Map<string, ActivityRow[]>();

  rows
    .flatMap((row) => {
      const anchor = getMonthAnchor(row);

      return anchor ? [{ row, anchor }] : [];
    })
    .sort((first, second) => toMillis(second.anchor) - toMillis(first.anchor))
    .forEach(({ row, anchor }) => {
      const monthKey = instantInZone(anchor, zone).toFormat(
        ACTIVITY_MONTH_KEY_FORMAT
      );

      groups.set(monthKey, [...(groups.get(monthKey) ?? []), row]);
    });

  return Array.from(groups, ([monthKey, monthRows]) => ({
    monthKey,
    rows: monthRows
  })).sort((first, second) => second.monthKey.localeCompare(first.monthKey));
};

export const getVisibleBuckets = (
  rows: ActivityFeedResponse,
  zone?: string
): ActivityBucketGroup[] => {
  const dueRows = new Map<ActivityBucket, ActivityRow[]>();
  const monthRows: ActivityRow[] = [];

  rows.forEach((row) => {
    const bucket = getDueBucket(row, zone);

    if (!bucket) {
      monthRows.push(row);
      return;
    }

    dueRows.set(bucket, [...(dueRows.get(bucket) ?? []), row]);
  });

  return ACTIVITY_BUCKET_ORDER.flatMap((bucket): ActivityBucketGroup[] => {
    if (bucket === ActivityBucket.BY_MONTH) {
      return groupByMonth(monthRows, zone).map((group) => ({
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
        rows: sortByDueDate(dueRows.get(bucket) ?? [], bucket)
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
