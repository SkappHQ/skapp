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
  CrmPriorityEnum,
  CrmTaskTabEnum
} from "~community/crm/v2/enums/common";
import {
  CrmTaskEntity,
  CrmTaskRecord,
  CrmTaskTypeRecord
} from "~community/crm/v2/types/CrmCommonTypes";
import {
  CrmTaskTypeOption,
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

export const prependTaskId = (taskIds: number[], id: number): number[] =>
  taskIds.includes(id) ? taskIds : [id, ...taskIds];

export const updateTaskRecord = (
  existingTasks: CrmTaskRecord,
  newTasks: CrmTaskEntity[]
): CrmTaskRecord => {
  const updatedRecord: CrmTaskRecord = { ...existingTasks };
  for (const task of newTasks) {
    if (task.id == null) continue;
    updatedRecord[task.id] = { ...updatedRecord[task.id], ...task };
  }
  return updatedRecord;
};

export const resolveTasks = (
  taskIds: number[],
  tasks: CrmTaskRecord
): CrmTaskEntity[] =>
  taskIds
    .map((id) => tasks[id])
    .filter((task): task is CrmTaskEntity => Boolean(task));

export const getTaskTypeOptions = (
  taskTypes: CrmTaskTypeRecord
): CrmTaskTypeOption[] =>
  Object.values(taskTypes).map((taskType) => ({
    id: String(taskType.id),
    value: String(taskType.id),
    label: taskType.name.toLowerCase()
  }));

export const getTaskFormInitialValues = (
  task?: CrmTaskEntity
): CrmTaskEntity => ({
  name: task?.name ?? "",
  typeId: task?.typeId,
  priority: task?.priority ?? CrmPriorityEnum.MEDIUM,
  dueAt: task?.dueAt,
  ownerId: task?.ownerId,
  contactId: task?.contactId,
  dealId: task?.dealId,
  notes: task?.notes ?? ""
});

export const getTrimmedTaskValues = (values: CrmTaskEntity): CrmTaskEntity => ({
  name: values.name?.trim(),
  typeId: values.typeId,
  priority: values.priority,
  dueAt: values.dueAt,
  ownerId: values.ownerId,
  contactId: values.contactId,
  dealId: values.dealId,
  notes: values.notes?.trim()
});

export const getChangedTaskFields = (
  initialValues: CrmTaskEntity,
  currentValues: CrmTaskEntity
): CrmTaskEntity => {
  const changedFields: CrmTaskEntity = {};

  if (currentValues.name !== initialValues.name) {
    changedFields.name = currentValues.name;
  }

  if (currentValues.typeId !== initialValues.typeId) {
    changedFields.typeId = currentValues.typeId;
  }

  if (currentValues.priority !== initialValues.priority) {
    changedFields.priority = currentValues.priority;
  }

  if (currentValues.dueAt !== initialValues.dueAt) {
    changedFields.dueAt = currentValues.dueAt;
  }

  if (currentValues.ownerId !== initialValues.ownerId) {
    changedFields.ownerId = currentValues.ownerId;
  }

  if (currentValues.contactId !== initialValues.contactId) {
    changedFields.contactId = currentValues.contactId;
  }

  if (currentValues.dealId !== initialValues.dealId) {
    changedFields.dealId = currentValues.dealId;
  }

  if (currentValues.notes !== initialValues.notes) {
    changedFields.notes = currentValues.notes;
  }

  return changedFields;
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
  dueAt: string,
  isCompleted: boolean
): TaskDueDateInfo | null => {
  if (!dueAt) return null;

  const due = convertUTCStringToLocalDateTime(dueAt);
  const today = getCurrentDateAtMidnight();

  if (!isCompleted && due < today) {
    return {
      textKey: "dueDateOverdue",
      dayCount: getDayDifference(due, today),
      textColorClass: "text-semantic-red-text"
    };
  }

  if (!isCompleted && isDateTimeSimilar(due, today)) {
    return { textKey: "dueDateToday", textColorClass: "text-secondary-text" };
  }

  return {
    textKey: "dueDateDueOn",
    dateValue: formatDateTimeWithOrdinalIndicatorWithoutYear(due),
    textColorClass: "text-secondary-text"
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
): GroupedTaskIds => {
  const openTasks = tasks.filter((task) => !task.isCompleted);

  return groupTaskIdsByDueDate(
    tab === CrmTaskTabEnum.MY_TASKS
      ? openTasks.filter((task) => task.ownerId === userId)
      : openTasks
  );
};
