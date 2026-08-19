import {
  ChecklistVerificationFilledIcon,
  EmailFilledIcon,
  MeetingFilledIcon,
  PhoneFilledIcon
} from "@rootcodelabs/skapp-ui";
import { ComponentType, ReactElement, SVGProps, createElement } from "react";

import {
  convertUTCStringToLocalDateTime,
  formatDateTimeWithOrdinalIndicatorWithoutYear,
  getCurrentDateAtMidnight,
  getDayDifference,
  isDateTimeSimilar
} from "~community/common/utils/dateTimeUtils";
import { PRIORITY_OPTIONS } from "~community/crm/constants/taskConstants";
import { CrmTaskFormTypes } from "~community/crm/types/CommonTypes";
import {
  isDueToday,
  isDueTomorrow,
  isOverdue
} from "~community/crm/utils/taskValidations";
import {
  CrmPriorityEnum,
  CrmTaskTabEnum
} from "~community/crm/v2/enums/common";
import {
  CrmOwnerEntity,
  CrmTaskEntity,
  CrmTaskRecord,
  CrmTaskTypeRecord
} from "~community/crm/v2/types/CrmCommonTypes";

export interface TaskDueDateInfo {
  textKey: string;
  dateValue?: string;
  dayCount?: number;
  colorClass: string;
}

export const getDueDateStatus = (
  dueAt: string | undefined,
  isCompleted: boolean | undefined
): TaskDueDateInfo | null => {
  if (!dueAt) return null;

  const due = convertUTCStringToLocalDateTime(dueAt);
  const today = getCurrentDateAtMidnight();

  if (!isCompleted && due < today) {
    return {
      textKey: "dueDateOverdue",
      dayCount: getDayDifference(due, today),
      colorClass: "text-semantic-red-text"
    };
  }

  if (!isCompleted && isDateTimeSimilar(due, today)) {
    return { textKey: "dueDateToday", colorClass: "text-secondary-text" };
  }

  return {
    textKey: "dueDateDueOn",
    dateValue: formatDateTimeWithOrdinalIndicatorWithoutYear(due),
    colorClass: "text-secondary-text"
  };
};

const TASK_TYPE_ICON_MAP: Record<
  string,
  ComponentType<SVGProps<SVGSVGElement>>
> = {
  email: EmailFilledIcon,
  call: PhoneFilledIcon,
  meeting: MeetingFilledIcon,
  other: ChecklistVerificationFilledIcon
};

export const getTaskTypeIcon = (
  typeName: string | undefined,
  size = 20
): ReactElement =>
  createElement(
    TASK_TYPE_ICON_MAP[typeName?.toLowerCase() ?? ""] ??
      ChecklistVerificationFilledIcon,
    { width: size, height: size }
  );

export const getPriorityConfig = (
  priority: CrmPriorityEnum | undefined
): { icon: ReactElement; bgColor: string; textColor: string } | null => {
  const option = PRIORITY_OPTIONS.find((o) => o.value === priority);
  if (!option) return null;

  return {
    icon: createElement(option.IconComponent),
    bgColor: option.backgroundColor,
    textColor: option.textColor
  };
};

export const getTaskTypeName = (
  typeId: number | undefined,
  taskTypes: CrmTaskTypeRecord
): string | undefined =>
  typeId === undefined ? undefined : taskTypes[typeId]?.name;

export const getOwnerFullName = (owner: CrmOwnerEntity | undefined): string =>
  owner === undefined
    ? ""
    : [owner.firstName, owner.lastName].filter(Boolean).join(" ");

/**
 * Builds the edit payload from only the fields the user actually changed.
 * The form holds cleared fields as `null`; the entity is optional-only, so they
 * are sent as `undefined`.
 */
export const getChangedTaskFields = (
  newValues: CrmTaskFormTypes,
  originalValues: CrmTaskFormTypes
): Omit<CrmTaskEntity, "id"> => {
  const changedFields: Omit<CrmTaskEntity, "id"> = {};

  if (newValues.name !== originalValues.name) {
    changedFields.name = newValues.name.trim();
  }
  if (newValues.type?.id !== originalValues.type?.id) {
    changedFields.typeId = newValues.type?.id;
  }
  if (newValues.dueDate !== originalValues.dueDate) {
    changedFields.dueAt = newValues.dueDate ?? undefined;
  }
  if (newValues.priority !== originalValues.priority) {
    changedFields.priority = newValues.priority;
  }
  if (newValues.contactId !== originalValues.contactId) {
    changedFields.contactId = newValues.contactId ?? undefined;
  }
  if (newValues.dealId !== originalValues.dealId) {
    changedFields.dealId = newValues.dealId ?? undefined;
  }
  if (newValues.owner !== originalValues.owner) {
    changedFields.ownerId = newValues.owner ?? undefined;
  }
  if (newValues.notes !== originalValues.notes) {
    changedFields.notes = newValues.notes.trim();
  }

  return changedFields;
};

export interface GroupedTaskIds {
  overdue: number[];
  dueToday: number[];
  dueTomorrow: number[];
  upcoming: number[];
  isOpenTasksEmpty: boolean;
}

/**
 * Groups the given order of task ids by due date. The ids are resolved against
 * the task record so the grouping follows whatever the store currently holds.
 */
export const groupTaskIdsByDueDate = (
  taskIds: number[],
  tasks: CrmTaskRecord
): GroupedTaskIds => {
  const overdue: number[] = [];
  const dueToday: number[] = [];
  const dueTomorrow: number[] = [];
  const upcoming: number[] = [];

  for (const taskId of taskIds) {
    const dueAt = tasks[taskId]?.dueAt;
    const localDueDate = dueAt
      ? convertUTCStringToLocalDateTime(dueAt).toISO()
      : null;

    if (!localDueDate) {
      upcoming.push(taskId);
    } else if (isOverdue(localDueDate)) {
      overdue.push(taskId);
    } else if (isDueToday(localDueDate)) {
      dueToday.push(taskId);
    } else if (isDueTomorrow(localDueDate)) {
      dueTomorrow.push(taskId);
    } else {
      upcoming.push(taskId);
    }
  }

  return {
    overdue,
    dueToday,
    dueTomorrow,
    upcoming,
    isOpenTasksEmpty:
      overdue.length === 0 &&
      dueToday.length === 0 &&
      dueTomorrow.length === 0 &&
      upcoming.length === 0
  };
};

/**
 * These are the open-task tabs, so a task ticked complete drops out of the
 * groups as soon as the store says it is completed - the list is not refetched
 * to work that out. The my-tasks tab narrows further to the signed-in user's
 * own tasks.
 */
export const getTaskGroups = (
  taskIds: number[],
  tasks: CrmTaskRecord,
  tab: CrmTaskTabEnum,
  userId: number | undefined
): GroupedTaskIds => {
  const openTaskIds = taskIds.filter(
    (taskId) => tasks[taskId]?.isCompleted !== true
  );

  const visibleTaskIds =
    tab === CrmTaskTabEnum.MY_TASKS
      ? openTaskIds.filter((taskId) => tasks[taskId]?.ownerId === userId)
      : openTaskIds;

  return groupTaskIdsByDueDate(visibleTaskIds, tasks);
};
