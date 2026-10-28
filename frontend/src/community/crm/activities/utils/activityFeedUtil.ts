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
  ActivityCallResponse,
  ActivityEmailResponse,
  ActivityFeedResponse,
  ActivityMeetingResponse,
  ActivityRow,
  ActivitySection,
  ActivitySectionGroup,
  ActivityTaskResponse,
  ActivityType
} from "~community/crm/activities/types/activityTypes";
import { isDueToday, isOverdue } from "~community/crm/utils/taskValidations";

export const getActivityRowKey = (row: ActivityRow): string =>
  `${row.type}-${row.id}`;

const isInFuture = (isoInstant: string): boolean =>
  parseInstant(isoInstant) >= DateTime.now();

const isRowOverdue = (row: ActivityRow, zone?: string): boolean =>
  row.type === ActivityType.TASK &&
  !row.isCompleted &&
  row.dueAt !== null &&
  isOverdue(row.dueAt, zone);

const getRowSection = (row: ActivityRow, zone?: string): ActivitySection => {
  if (isRowOverdue(row, zone)) return ActivitySection.OVERDUE;

  let scheduledAt = row.dueAt;

  if (row.type === ActivityType.MEETING) {
    scheduledAt = row.startAt && isInFuture(row.startAt) ? row.startAt : null;
  }

  if (!row.isCompleted && scheduledAt) {
    if (isDueToday(scheduledAt, zone)) return ActivitySection.TODAY;

    if (isInFuture(scheduledAt)) return ActivitySection.UPCOMING;
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

    const anchor = row.loggedAt ?? row.startAt ?? row.completedAt ?? row.dueAt;

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

  if (
    row.type === ActivityType.MEETING &&
    row.startAt &&
    isInFuture(row.startAt)
  ) {
    return translate(["activities", "row", "subtitle", "scheduledOn"], {
      date: formatDateTimeWithOrdinalIndicatorWithoutYear(
        instantInZone(row.startAt, zone)
      )
    });
  }

  const happenedAt = row.loggedAt ?? row.startAt;

  if (!happenedAt) return "";

  const zoned = instantInZone(happenedAt, zone);

  return translate(["activities", "row", "subtitle", "occurredAt"], {
    date: formatDateTimeWithOrdinalIndicatorWithoutYear(zoned),
    time: zoned.toFormat(TIME_FORMAT_12_HOUR)
  });
};

export const toCallRow = (call: ActivityCallResponse): ActivityRow => ({
  id: call.id,
  type: ActivityType.CALL,
  title: call.subject,
  dueAt: null,
  loggedAt: call.loggedAt,
  startAt: null,
  completedAt: null,
  isCompleted: false,
  priority: null,
  ownerId: call.ownerId,
  dealId: call.dealId,
  companyId: call.companyId,
  contactIds: call.contactId ? [call.contactId] : [],
  canComplete: false
});

export const toEmailRow = (email: ActivityEmailResponse): ActivityRow => ({
  id: email.id,
  type: ActivityType.EMAIL,
  title: email.subject,
  dueAt: null,
  loggedAt: email.loggedAt,
  startAt: null,
  completedAt: null,
  isCompleted: false,
  priority: null,
  ownerId: email.ownerId,
  dealId: email.dealId,
  companyId: email.companyId,
  contactIds: email.contactIds,
  canComplete: false
});

export const toMeetingRow = (
  meeting: ActivityMeetingResponse
): ActivityRow => ({
  id: meeting.id,
  type: ActivityType.MEETING,
  title: meeting.name,
  dueAt: null,
  loggedAt: null,
  startAt: meeting.startAt,
  completedAt: null,
  isCompleted: false,
  priority: null,
  ownerId: meeting.ownerId,
  dealId: meeting.dealId,
  companyId: meeting.companyId,
  contactIds: meeting.contactIds,
  canComplete: false
});

export const toTaskRow = (task: ActivityTaskResponse): ActivityRow => ({
  id: task.id,
  type: ActivityType.TASK,
  title: task.name,
  dueAt: task.dueAt,
  loggedAt: null,
  startAt: null,
  completedAt: task.completedAt,
  isCompleted: task.isCompleted,
  priority: task.priority,
  ownerId: task.ownerId,
  dealId: task.dealId,
  companyId: task.companyId,
  contactIds: task.contactId ? [task.contactId] : [],
  canComplete: false
});

export const toSingleFeedPage = (
  rows: ActivityRow[]
): ActivityFeedResponse[] => [
  { items: rows, currentPage: 0, totalItems: rows.length, totalPages: 1 }
];
