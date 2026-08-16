import {
  CrmCompanyEntity,
  CrmCompanyRecord,
  CrmContactEntity,
  CrmContactRecord,
  CrmDealEntity,
  CrmDealRecord,
  CrmOwnerEntity,
  CrmOwnerRecord,
  CrmTaskEntity,
  CrmTaskRecord,
  CrmTaskTypeEntity,
  CrmTaskTypeRecord
} from "~community/crm/v2/types/CrmCommonTypes";

/**
 * The task endpoints still nest the related records inside each task instead of
 * sending id references. They are typed with the entity each one becomes, since
 * every entity field is optional.
 */
type CrmTaskApiShape = CrmTaskEntity & {
  owner?: CrmOwnerEntity;
  contact?: CrmContactEntity & { company?: CrmCompanyEntity };
  deal?: CrmDealEntity;
};

/**
 * Keeps only the id references on the task itself. The nested records are
 * lifted into their own store records by the `to*FromTasks` builders below, so
 * one payload never lands in two places.
 */
export const toTaskEntity = (task: CrmTaskApiShape): CrmTaskEntity => ({
  id: task.id,
  name: task.name,
  priority: task.priority,
  isCompleted: task.isCompleted,
  dueAt: task.dueAt,
  notes: task.notes,
  typeId: task.typeId,
  ownerId: task.owner?.employeeId ?? task.ownerId,
  contactId: task.contact?.id ?? task.contactId,
  companyId: task.contact?.company?.id ?? task.companyId,
  dealId: task.deal?.id ?? task.dealId
});

export const toTasksRecord = (tasks: CrmTaskApiShape[]): CrmTaskRecord => {
  const record: CrmTaskRecord = {};
  for (const task of tasks) {
    if (task.id === undefined) continue;
    record[task.id] = toTaskEntity(task);
  }
  return record;
};

export const toOwnersFromTasks = (tasks: CrmTaskApiShape[]): CrmOwnerRecord => {
  const record: CrmOwnerRecord = {};
  for (const task of tasks) {
    const owner = task.owner;
    if (owner?.employeeId === undefined) continue;
    record[owner.employeeId] = owner;
  }
  return record;
};

export const toContactsFromTasks = (
  tasks: CrmTaskApiShape[]
): CrmContactRecord => {
  const record: CrmContactRecord = {};
  for (const task of tasks) {
    const contact = task.contact;
    if (contact?.id === undefined) continue;
    record[contact.id] = {
      ...contact,
      companyId: contact.company?.id ?? contact.companyId
    };
  }
  return record;
};

export const toCompaniesFromTasks = (
  tasks: CrmTaskApiShape[]
): CrmCompanyRecord => {
  const record: CrmCompanyRecord = {};
  for (const task of tasks) {
    const company = task.contact?.company;
    if (company?.id === undefined) continue;
    record[company.id] = company;
  }
  return record;
};

export const toDealsFromTasks = (tasks: CrmTaskApiShape[]): CrmDealRecord => {
  const record: CrmDealRecord = {};
  for (const task of tasks) {
    const deal = task.deal;
    if (deal?.id === undefined) continue;
    record[deal.id] = deal;
  }
  return record;
};

export const toTaskTypesRecord = (
  taskTypes: CrmTaskTypeEntity[]
): CrmTaskTypeRecord => {
  const record: CrmTaskTypeRecord = {};
  for (const taskType of taskTypes) {
    record[taskType.id] = taskType;
  }
  return record;
};

/**
 * Fresh load, search or filter change: the order comes straight from the
 * response.
 */
export const replaceTaskIds = (tasks: CrmTaskEntity[]): number[] => {
  const taskIds: number[] = [];
  for (const task of tasks) {
    if (task.id === undefined) continue;
    taskIds.push(task.id);
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
    if (task.id === undefined || seen.has(task.id)) continue;
    seen.add(task.id);
    nextIds.push(task.id);
  }

  return nextIds;
};
