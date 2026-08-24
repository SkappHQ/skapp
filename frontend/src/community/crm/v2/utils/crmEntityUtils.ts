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

/**
 * Folds a freshly loaded batch into the record already in the store, so an
 * entity stays cached once loaded. Which entities are on display is the id
 * arrays' job - switching tabs or re-searching swaps the ids, it never has to
 * evict entities another view may still be reading.
 *
 * The record it was given comes back untouched when the batch adds nothing, so
 * a caller that reads the record, merges and writes it back settles instead of
 * feeding itself a new reference on every pass.
 */
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

export const mergeContactsRecord = (
  existingContacts: CrmContactRecord,
  incomingContacts: CrmContactRecord
): CrmContactRecord => {
  const isAlreadyMerged = Object.keys(incomingContacts).every(
    (contactId) =>
      existingContacts[Number(contactId)] ===
      incomingContacts[Number(contactId)]
  );

  return isAlreadyMerged
    ? existingContacts
    : { ...existingContacts, ...incomingContacts };
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

/**
 * The ids a batch lookup needs. Distinct, so one request covers every task
 * pointing at the same deal or company.
 */
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

export const collectMissingTaskContactIds = (
  tasks: CrmTaskEntity[],
  existingContacts: CrmContactRecord
): number[] => {
  const missingContactIds: number[] = [];

  for (const task of tasks) {
    if (
      task.contactId != null &&
      existingContacts[task.contactId] === undefined &&
      !missingContactIds.includes(task.contactId)
    ) {
      missingContactIds.push(task.contactId);
    }
  }

  return missingContactIds;
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

/**
 * Fresh load, search or filter change: the order comes straight from the
 * response.
 */
export const replaceTaskIds = (tasks: CrmTaskEntity[]): number[] => {
  const taskIds: number[] = [];
  for (const task of tasks) {
    if (task.id != null) {
      taskIds.push(task.id);
    }
  }
  return taskIds;
};

/**
 * Load-more: extends the existing order, skipping ids already present so a
 * re-emitted cached page cannot duplicate a row.
 */
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

/**
 * Create: puts the new task at the head of the displayed order so it shows
 * without the list being refetched. The grouping decides where it finally sits.
 */
export const prependId = (existingIds: number[], id: number): number[] =>
  existingIds.includes(id) ? existingIds : [id, ...existingIds];

/**
 * Delete: drops the task itself. The records are otherwise only ever merged
 * into, so a deleted task would sit there until a full reload without this.
 */
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

/**
 * The matching half of the delete: takes the id out of the displayed order so
 * the row stops rendering.
 */
export const removeId = (existingIds: number[], id: number): number[] =>
  existingIds.includes(id)
    ? existingIds.filter((existingId) => existingId !== id)
    : existingIds;
