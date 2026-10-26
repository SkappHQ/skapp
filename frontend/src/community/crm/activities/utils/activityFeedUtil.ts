import { DateTime } from "luxon";

import {
  FULL_MONTH_YEAR_FORMAT,
  TIME_FORMAT_12_HOUR,
  YEAR_MONTH_FORMAT
} from "~community/common/constants/timeConstants";
import { TranslatorFunctionType } from "~community/common/types/CommonTypes";
import {
  formatDateTimeWithOrdinalIndicatorWithoutYear,
  instantInZone,
  parseInstant
} from "~community/common/utils/dateTimeUtils";
import { ACTIVITY_SECTION_ORDER } from "~community/crm/activities/constants/activityConstants";
import {
  ActivityRow,
  ActivitySection,
  ActivitySectionGroup,
  ActivityType
} from "~community/crm/activities/types/activityTypes";
import { isDueToday, isOverdue } from "~community/crm/utils/taskValidations";

export const getActivityRowKey = (row: ActivityRow): string =>
  `${row.type}-${row.id}`;

const toMillis = (isoInstant: string): number =>
  parseInstant(isoInstant).toMillis();

const isInFuture = (isoInstant: string): boolean =>
  toMillis(isoInstant) >= DateTime.now().toMillis();

const isRowOverdue = (row: ActivityRow, zone?: string): boolean =>
  row.type === ActivityType.TASK &&
  !row.isCompleted &&
  row.dueAt !== null &&
  isOverdue(row.dueAt, zone);

const getRowSection = (row: ActivityRow, zone?: string): ActivitySection => {
  if (isRowOverdue(row, zone)) return ActivitySection.OVERDUE;

  if (!row.isCompleted && row.dueAt) {
    if (isDueToday(row.dueAt, zone)) return ActivitySection.TODAY;

    if (isInFuture(row.dueAt)) return ActivitySection.UPCOMING;
  }

  return ActivitySection.BY_MONTH;
};

export const getActivitySections = (
  rows: ActivityRow[],
  zone?: string
): ActivitySectionGroup[] => {
  const fixedSectionRows: Record<ActivitySection, ActivityRow[]> = {
    [ActivitySection.OVERDUE]: [],
    [ActivitySection.TODAY]: [],
    [ActivitySection.UPCOMING]: [],
    [ActivitySection.BY_MONTH]: []
  };
  const monthGroups = new Map<string, ActivityRow[]>();

  for (const row of rows) {
    const section = getRowSection(row, zone);

    if (section !== ActivitySection.BY_MONTH) {
      fixedSectionRows[section].push(row);
      continue;
    }

    const anchor = row.occurredAt ?? row.completedAt ?? row.dueAt;

    if (!anchor) continue;

    const monthKey = instantInZone(anchor, zone).toFormat(YEAR_MONTH_FORMAT);
    const monthRows = monthGroups.get(monthKey);

    if (monthRows) {
      monthRows.push(row);
    } else {
      monthGroups.set(monthKey, [row]);
    }
  }

  return ACTIVITY_SECTION_ORDER.flatMap((section): ActivitySectionGroup[] => {
    if (section === ActivitySection.BY_MONTH) {
      return Array.from(monthGroups, ([monthKey, monthRows]) => ({
        id: `month-${monthKey}`,
        section,
        monthKey,
        rows: monthRows
      }));
    }

    return [
      {
        id: section.toLowerCase(),
        section,
        monthKey: null,
        rows: fixedSectionRows[section]
      }
    ];
  }).filter((group) => group.rows.length > 0);
};

export const formatMonthHeading = (monthKey: string): string =>
  DateTime.fromFormat(monthKey, YEAR_MONTH_FORMAT).toFormat(
    FULL_MONTH_YEAR_FORMAT
  );

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
    time: zoned.toFormat(TIME_FORMAT_12_HOUR)
  });
};
