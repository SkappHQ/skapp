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
import { CrmTaskTabEnum } from "~community/crm/v2/enums/common";
import {
  CrmContactEntity,
  CrmContactRecord,
  CrmOwnerEntity,
  CrmOwnerRecord,
  CrmTaskEntity,
  CrmTaskRecord,
  CrmTaskTypeRecord
} from "~community/crm/v2/types/CrmCommonTypes";
import {
  GroupedTaskIds,
  TaskDueDateInfo
} from "~community/crm/v2/types/CrmTypes";
import {
  isDueToday,
  isDueTomorrow,
  isOverdue
} from "~community/crm/v2/utils/taskValidations";

export const toTaskIds = (tasks: CrmTaskEntity[]): number[] => {
  const taskIds: number[] = [];
  for (const task of tasks) {
    if (task.id != null) {
      taskIds.push(task.id);
    }
  }
  return taskIds;
};

export const toTaskDealIds = (tasks: CrmTaskEntity[]): number[] => {
  const dealIds: number[] = [];
  for (const task of tasks) {
    if (task.dealId != null) {
      dealIds.push(task.dealId);
    }
  }
  return dealIds;
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

export const resolveTasks = (
  taskIds: number[],
  tasks: CrmTaskRecord
): CrmTaskEntity[] =>
  taskIds
    .map((id) => tasks[id])
    .filter((task): task is CrmTaskEntity => Boolean(task));

export const getSelectedTask = (
  tasks: CrmTaskRecord,
  taskId: number
): CrmTaskEntity => {
  return tasks[taskId];
};

export const getTaskOwner = (
  owners: CrmOwnerRecord,
  ownerId?: number
): CrmOwnerEntity | undefined => {
  if (ownerId === undefined) return undefined;
  return owners[ownerId];
};

export const getTaskContact = (
  contacts: CrmContactRecord,
  contactId?: number
): CrmContactEntity | undefined => {
  if (contactId === undefined) return undefined;
  return contacts[contactId];
};

export const getTaskTypeName = (
  taskTypes: CrmTaskTypeRecord,
  typeId?: number
): string | undefined => {
  if (typeId === undefined) return undefined;
  return taskTypes[typeId]?.name;
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

export const getTaskTypeIcon = (typeName?: string, size = 20): ReactElement =>
  createElement(
    TASK_TYPE_ICON_MAP[typeName?.toLowerCase() ?? ""] ??
      ChecklistVerificationFilledIcon,
    { width: size, height: size }
  );

export const getDueDateStatus = (
  dueAt?: string,
  isCompleted?: boolean
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

export const groupTaskIdsByDueDate = (
  tasks: CrmTaskEntity[]
): GroupedTaskIds => {
  const overdue: number[] = [];
  const dueToday: number[] = [];
  const dueTomorrow: number[] = [];
  const upcoming: number[] = [];

  for (const task of tasks) {
    if (task.id == null) continue;

    const localDueDate = task.dueAt
      ? convertUTCStringToLocalDateTime(task.dueAt).toISO()
      : null;

    if (!localDueDate) {
      upcoming.push(task.id);
    } else if (isOverdue(localDueDate)) {
      overdue.push(task.id);
    } else if (isDueToday(localDueDate)) {
      dueToday.push(task.id);
    } else if (isDueTomorrow(localDueDate)) {
      dueTomorrow.push(task.id);
    } else {
      upcoming.push(task.id);
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
  tasks: CrmTaskEntity[],
  tab: CrmTaskTabEnum,
  userId?: number
): GroupedTaskIds =>
  groupTaskIdsByDueDate(
    tab === CrmTaskTabEnum.MY_TASKS
      ? tasks.filter((task) => task.ownerId === userId)
      : tasks
  );
