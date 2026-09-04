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
  CrmCompanyRecord,
  CrmContactRecord,
  CrmDealRecord,
  CrmTaskEntity,
  CrmTaskRecord,
  CrmTaskTypeRecord
} from "~community/crm/v2/types/CrmCommonTypes";
import {
  CrmTaskTypeOption,
  GroupedTasks,
  TaskDueDateInfo
} from "~community/crm/v2/types/CrmTypes";
import { appendId } from "~community/crm/v2/utils/commonUtil";
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

export const groupTasksByDueDate = (tasks: CrmTaskEntity[]): GroupedTasks => {
  const overdue: CrmTaskEntity[] = [];
  const dueToday: CrmTaskEntity[] = [];
  const dueTomorrow: CrmTaskEntity[] = [];
  const upcoming: CrmTaskEntity[] = [];

  for (const task of tasks) {
    const localDueDate = task.dueAt
      ? convertUTCStringToLocalDateTime(task.dueAt).toISO()
      : null;

    if (!localDueDate) {
      upcoming.push(task);
    } else if (isOverdue(localDueDate)) {
      overdue.push(task);
    } else if (isDueToday(localDueDate)) {
      dueToday.push(task);
    } else if (isDueTomorrow(localDueDate)) {
      dueTomorrow.push(task);
    } else {
      upcoming.push(task);
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
): GroupedTasks => {
  const openTasks = tasks.filter((task) => !task.isCompleted);

  return groupTasksByDueDate(
    tab === CrmTaskTabEnum.MY_TASKS
      ? openTasks.filter((task) => task.ownerId === userId)
      : openTasks
  );
};

export const getTaskTypeName = (
  taskTypes: CrmTaskTypeRecord,
  typeId?: number
) => {
  if (typeId !== undefined) {
    return taskTypes[typeId].name;
  }
};

export const normalizeTasks = (items: CrmTaskEntity[]) => {
  const tasks: CrmTaskRecord = {};
  const taskIds: number[] = [];

  items.forEach((task) => {
    if (task.id !== undefined) {
      tasks[task.id] = task;
      taskIds.push(task.id);
    }
  });

  return { tasks, taskIds };
};

export const parseDueDate = (dueAt?: string) => {
  if (dueAt !== undefined) {
    return convertUTCStringToLocalDateTime(dueAt).toJSDate();
  }
};

export const getTaskFormInitialValues = (
  selectedContactId: number | null,
  currentUserId?: string | number
): CrmTaskEntity => {
  const initialValues: CrmTaskEntity = {
    name: "",
    priority: CrmPriorityEnum.MEDIUM,
    notes: ""
  };

  if (selectedContactId !== null) {
    initialValues.contactId = selectedContactId;
  }

  if (currentUserId !== undefined) {
    initialValues.ownerId = Number(currentUserId);
  }

  return initialValues;
};

export const getTrimmedTaskValues = (task: CrmTaskEntity): CrmTaskEntity => ({
  ...task,
  name: task.name?.trim(),
  notes: task.notes?.trim()
});

export const linkTaskToRelatedEntities = (
  task: CrmTaskEntity,
  companies?: CrmCompanyRecord,
  contacts?: CrmContactRecord,
  deals?: CrmDealRecord
) => {
  const taskId = task.id;
  const linked = { companies, contacts, deals };

  if (taskId === undefined) {
    return linked;
  }

  if (companies !== undefined && task.companyId !== undefined) {
    const company = companies[task.companyId];

    if (company !== undefined) {
      linked.companies = {
        ...companies,
        [task.companyId]: {
          ...company,
          taskIds: appendId(company.taskIds ?? [], taskId)
        }
      };
    }
  }

  if (contacts !== undefined && task.contactId !== undefined) {
    const contact = contacts[task.contactId];

    if (contact !== undefined) {
      linked.contacts = {
        ...contacts,
        [task.contactId]: {
          ...contact,
          taskIds: appendId(contact.taskIds ?? [], taskId)
        }
      };
    }
  }

  if (deals !== undefined && task.dealId !== undefined) {
    const deal = deals[task.dealId];

    if (deal !== undefined) {
      linked.deals = {
        ...deals,
        [task.dealId]: {
          ...deal,
          taskIds: appendId(deal.taskIds ?? [], taskId)
        }
      };
    }
  }

  return linked;
};

export const updateTask = (
  tasks: CrmTaskRecord,
  taskId: number,
  updatedFields: CrmTaskEntity
): CrmTaskRecord => ({
  ...tasks,
  [taskId]: { ...tasks[taskId], ...updatedFields }
});

export interface CrmTaskCompletion {
  taskId: number;
  isCompleted: boolean;
}

export const applyTaskCompletion = (
  tasks: CrmTaskRecord,
  { taskId, isCompleted }: CrmTaskCompletion
): CrmTaskRecord => updateTask(tasks, taskId, { isCompleted });
