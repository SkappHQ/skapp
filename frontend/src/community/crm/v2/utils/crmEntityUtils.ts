import {
  CrmCompanyEntity,
  CrmCompanyRecord,
  CrmContactEntity,
  CrmContactRecord,
  CrmDealEntity,
  CrmDealRecord,
  CrmOwnerEntity,
  CrmOwnerRecord,
  CrmStageEntity,
  CrmStageRecord,
  CrmTaskEntity,
  CrmTaskRecord,
  CrmTaskTypeEntity,
  CrmTaskTypeRecord
} from "~community/crm/v2/types/CrmCommonTypes";

export const mergeTasksRecord = (
  existingTasks: CrmTaskRecord,
  incomingTasks: CrmTaskRecord
): CrmTaskRecord => {
  const isAlreadyMerged = Object.keys(incomingTasks).every(
    (taskId) => existingTasks[Number(taskId)] === incomingTasks[Number(taskId)]
  );

  return isAlreadyMerged
    ? existingTasks
    : { ...existingTasks, ...incomingTasks };
};

export const mergeDealsRecord = (
  existingDeals: CrmDealRecord,
  incomingDeals: CrmDealRecord
): CrmDealRecord => {
  const isAlreadyMerged = Object.keys(incomingDeals).every(
    (dealId) => existingDeals[Number(dealId)] === incomingDeals[Number(dealId)]
  );

  return isAlreadyMerged
    ? existingDeals
    : { ...existingDeals, ...incomingDeals };
};

export const mergeCompaniesRecord = (
  existingCompanies: CrmCompanyRecord,
  incomingCompanies: CrmCompanyRecord
): CrmCompanyRecord => {
  const isAlreadyMerged = Object.keys(incomingCompanies).every(
    (companyId) =>
      existingCompanies[Number(companyId)] ===
      incomingCompanies[Number(companyId)]
  );

  return isAlreadyMerged
    ? existingCompanies
    : { ...existingCompanies, ...incomingCompanies };
};

export const toStagesRecord = (stages: CrmStageEntity[]): CrmStageRecord => {
  const stageRecord: CrmStageRecord = {};
  for (const stage of stages) {
    if (stage.id != null) {
      stageRecord[stage.id] = stage;
    }
  }
  return stageRecord;
};

export const toOwnersRecord = (owners: CrmOwnerEntity[]): CrmOwnerRecord => {
  const ownerRecord: CrmOwnerRecord = {};
  for (const owner of owners) {
    if (owner.employeeId != null) {
      ownerRecord[owner.employeeId] = owner;
    }
  }
  return ownerRecord;
};

export const toContactsRecord = (
  contacts: CrmContactEntity[]
): CrmContactRecord => {
  const contactRecord: CrmContactRecord = {};
  for (const contact of contacts) {
    if (contact.id != null) {
      contactRecord[contact.id] = contact;
    }
  }
  return contactRecord;
};

export const toTasksRecord = (tasks: CrmTaskEntity[]): CrmTaskRecord => {
  const taskRecord: CrmTaskRecord = {};
  for (const task of tasks) {
    if (task.id != null) {
      taskRecord[task.id] = task;
    }
  }
  return taskRecord;
};

export const toDealsRecord = (deals: CrmDealEntity[]): CrmDealRecord => {
  const dealRecord: CrmDealRecord = {};
  for (const deal of deals) {
    if (deal.id != null) {
      dealRecord[deal.id] = deal;
    }
  }
  return dealRecord;
};

export const toCompaniesRecord = (
  companies: CrmCompanyEntity[]
): CrmCompanyRecord => {
  const companyRecord: CrmCompanyRecord = {};
  for (const company of companies) {
    if (company.id != null) {
      companyRecord[company.id] = company;
    }
  }
  return companyRecord;
};

export const toTaskTypesRecord = (
  taskTypes: CrmTaskTypeEntity[]
): CrmTaskTypeRecord => {
  const taskTypeRecord: CrmTaskTypeRecord = {};
  for (const taskType of taskTypes) {
    if (taskType.id != null) {
      taskTypeRecord[taskType.id] = taskType;
    }
  }
  return taskTypeRecord;
};

export const collectMissingTaskDealIds = (
  tasks: CrmTaskEntity[],
  existingDeals: CrmDealRecord
): number[] => {
  const missingDealIds: number[] = [];

  for (const task of tasks) {
    if (
      task.dealId != null &&
      existingDeals[task.dealId] === undefined &&
      !missingDealIds.includes(task.dealId)
    ) {
      missingDealIds.push(task.dealId);
    }
  }

  return missingDealIds;
};

export const collectMissingTaskCompanyIds = (
  tasks: CrmTaskEntity[],
  existingCompanies: CrmCompanyRecord
): number[] => {
  const missingCompanyIds: number[] = [];

  for (const task of tasks) {
    if (
      task.companyId != null &&
      existingCompanies[task.companyId] === undefined &&
      !missingCompanyIds.includes(task.companyId)
    ) {
      missingCompanyIds.push(task.companyId);
    }
  }

  return missingCompanyIds;
};

export const replaceTaskIds = (tasks: CrmTaskEntity[]): number[] => {
  const taskIds: number[] = [];
  for (const task of tasks) {
    if (task.id != null) {
      taskIds.push(task.id);
    }
  }
  return taskIds;
};

export const appendTaskIds = (
  existingIds: number[],
  tasks: CrmTaskEntity[]
): number[] => {
  const seen = new Set(existingIds);
  const nextIds = [...existingIds];

  for (const task of tasks) {
    if (task.id != null && !seen.has(task.id)) {
      seen.add(task.id);
      nextIds.push(task.id);
    }
  }

  return nextIds;
};

export const prependTaskId = (
  existingTaskIds: number[],
  taskId: number
): number[] =>
  existingTaskIds.includes(taskId)
    ? existingTaskIds
    : [taskId, ...existingTaskIds];

export const removeTaskFromRecord = (
  existingTasks: CrmTaskRecord,
  taskId: number
): CrmTaskRecord => {
  if (existingTasks[taskId] === undefined) {
    return existingTasks;
  }

  const { [taskId]: _removedTask, ...remainingTasks } = existingTasks;
  return remainingTasks;
};

export const removeTaskId = (
  existingTaskIds: number[],
  taskId: number
): number[] =>
  existingTaskIds.includes(taskId)
    ? existingTaskIds.filter((existingTaskId) => existingTaskId !== taskId)
    : existingTaskIds;
