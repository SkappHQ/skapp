import {
  convertUTCStringToLocalDateTime,
  formatDateTimeWithOrdinalIndicatorWithoutYear,
  getCurrentDateAtMidnight,
  getDayDifference,
  isDateTimeSimilar
} from "~community/common/utils/dateTimeUtils";
import { CrmTaskTabEnum } from "~community/crm/v2/enums/common";
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

export interface CrmTaskLinks {
  companies?: CrmCompanyRecord;
  contacts?: CrmContactRecord;
  deals?: CrmDealRecord;
}

const linkTaskToCompany = (
  companies: CrmCompanyRecord,
  companyId: number,
  taskId: number
): CrmCompanyRecord => {
  const company = companies[companyId];

  if (company?.taskIds === undefined) return companies;

  const taskIds = appendId(company.taskIds, taskId);

  if (taskIds === company.taskIds) return companies;

  return { ...companies, [companyId]: { ...company, taskIds } };
};

const linkTaskToContact = (
  contacts: CrmContactRecord,
  contactId: number,
  taskId: number
): CrmContactRecord => {
  const contact = contacts[contactId];

  if (contact?.taskIds === undefined) return contacts;

  const taskIds = appendId(contact.taskIds, taskId);

  if (taskIds === contact.taskIds) return contacts;

  return { ...contacts, [contactId]: { ...contact, taskIds } };
};

const linkTaskToDeal = (
  deals: CrmDealRecord,
  dealId: number,
  taskId: number
): CrmDealRecord => {
  const deal = deals[dealId];

  if (deal?.taskIds === undefined) return deals;

  const taskIds = appendId(deal.taskIds, taskId);

  if (taskIds === deal.taskIds) return deals;

  return { ...deals, [dealId]: { ...deal, taskIds } };
};

export const linkTaskToRelatedEntities = (
  task: CrmTaskEntity,
  companies?: CrmCompanyRecord,
  contacts?: CrmContactRecord,
  deals?: CrmDealRecord
): CrmTaskLinks => {
  const { id: taskId, companyId, contactId, dealId } = task;

  if (taskId === undefined) {
    return { companies, contacts, deals };
  }

  const links: CrmTaskLinks = { companies, contacts, deals };

  if (companies !== undefined && companyId !== undefined) {
    links.companies = linkTaskToCompany(companies, companyId, taskId);
  }

  if (contacts !== undefined && contactId !== undefined) {
    links.contacts = linkTaskToContact(contacts, contactId, taskId);
  }

  if (deals !== undefined && dealId !== undefined) {
    links.deals = linkTaskToDeal(deals, dealId, taskId);
  }

  return links;
};

export const parseDueDate = (dueAt?: string): Date | undefined => {
  if (dueAt !== undefined) {
    return convertUTCStringToLocalDateTime(dueAt).toJSDate();
  }
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
