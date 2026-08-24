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
import {
  isDueToday,
  isDueTomorrow,
  isOverdue
} from "~community/crm/utils/taskValidations";
import { CrmTaskTabEnum } from "~community/crm/v2/enums/common";

import {
  CrmOwnerEntity,
  CrmTaskEntity,
  CrmTaskRecord,
  CrmTaskTypeRecord
} from "../types/CrmCommonTypes";

export const toTaskIds = (tasks: CrmTaskEntity[]): number[] => {
  const taskIds: number[] = [];
  for (const task of tasks) {
    if (task.id != null) {
      taskIds.push(task.id);
    }
  }
  return taskIds;
};

export const mergeTasks = (
  existing: CrmTaskRecord,
  incoming: CrmTaskEntity[]
): CrmTaskRecord => {
  const merged: CrmTaskRecord = { ...existing };
  for (const task of incoming) {
    if (task.id == null) continue;
    merged[task.id] = { ...merged[task.id], ...task };
  }
  return merged;
};

export const prependTaskId = (taskIds: number[], id: number): number[] =>
  taskIds.includes(id) ? taskIds : [id, ...taskIds];

export const removeTaskId = (taskIds: number[], id: number): number[] =>
  taskIds.filter((taskId) => taskId !== id);

export const removeTaskFromRecord = (
  tasks: CrmTaskRecord,
  id: number
): CrmTaskRecord => {
  if (!(id in tasks)) return tasks;
  const next = { ...tasks };
  delete next[id];
  return next;
};

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

export const getTaskTypeName = (
  typeId: number | undefined,
  taskTypes: CrmTaskTypeRecord
): string | undefined =>
  typeId === undefined ? undefined : taskTypes[typeId]?.name;

export const isCrmTaskTab = (value: string): value is CrmTaskTabEnum =>
  (Object.values(CrmTaskTabEnum) as string[]).includes(value);

export const getOwnerFullName = (owner: CrmOwnerEntity | undefined): string =>
  owner === undefined
    ? ""
    : [owner.firstName, owner.lastName].filter(Boolean).join(" ");

export const getChangedTaskFields = (
  newValues: CrmTaskEntity,
  originalValues: CrmTaskEntity
): Omit<CrmTaskEntity, "id"> => {
  const changedFields: Omit<CrmTaskEntity, "id"> = {};

  if (newValues.name !== originalValues.name) {
    changedFields.name = newValues.name?.trim();
  }
  if (newValues.typeId !== originalValues.typeId) {
    changedFields.typeId = newValues.typeId;
  }
  if (newValues.dueAt !== originalValues.dueAt) {
    changedFields.dueAt = newValues.dueAt;
  }
  if (newValues.priority !== originalValues.priority) {
    changedFields.priority = newValues.priority;
  }
  if (newValues.contactId !== originalValues.contactId) {
    changedFields.contactId = newValues.contactId;
  }
  if (newValues.dealId !== originalValues.dealId) {
    changedFields.dealId = newValues.dealId;
  }
  if (newValues.ownerId !== originalValues.ownerId) {
    changedFields.ownerId = newValues.ownerId;
  }
  if (newValues.notes !== originalValues.notes) {
    changedFields.notes = newValues.notes?.trim();
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
