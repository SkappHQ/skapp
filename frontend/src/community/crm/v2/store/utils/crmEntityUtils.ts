import {
  CrmCompanyEntity,
  CrmContactEntity,
  CrmDealEntity,
  CrmOwnerEntity,
  CrmStageEntity,
  CrmTaskEntity,
  CrmTaskTypeEntity
} from "~community/crm/v2/types/CrmCommonTypes";

export const replaceCompanyIds = (companies: CrmCompanyEntity[]): number[] =>
  companies
    .filter((company) => company.id != null)
    .map((company) => company.id!);

export const appendCompanyIds = (
  existingIds: number[],
  companies: CrmCompanyEntity[]
): number[] => {
  const seen = new Set(existingIds);
  const nextIds = [...existingIds];
  for (const company of companies) {
    if (company.id == null || seen.has(company.id)) continue;
    seen.add(company.id);
    nextIds.push(company.id);
  }
  return nextIds;
};

export const replaceContactIds = (contacts: CrmContactEntity[]): number[] =>
  contacts
    .filter((contact) => contact.id != null)
    .map((contact) => contact.id!);

export const appendContactIds = (
  existingIds: number[],
  contacts: CrmContactEntity[]
): number[] => {
  const seen = new Set(existingIds);
  const nextIds = [...existingIds];
  for (const contact of contacts) {
    if (contact.id == null || seen.has(contact.id)) continue;
    seen.add(contact.id);
    nextIds.push(contact.id);
  }
  return nextIds;
};

export const replaceDealIds = (deals: CrmDealEntity[]): number[] =>
  deals.filter((deal) => deal.id != null).map((deal) => deal.id!);

export const appendDealIds = (
  existingIds: number[],
  deals: CrmDealEntity[]
): number[] => {
  const seen = new Set(existingIds);
  const nextIds = [...existingIds];
  for (const deal of deals) {
    if (deal.id == null || seen.has(deal.id)) continue;
    seen.add(deal.id);
    nextIds.push(deal.id);
  }
  return nextIds;
};

export const replaceTaskIds = (tasks: CrmTaskEntity[]): number[] =>
  tasks.filter((task) => task.id != null).map((task) => task.id!);

export const appendTaskIds = (
  existingIds: number[],
  tasks: CrmTaskEntity[]
): number[] => {
  const seen = new Set(existingIds);
  const nextIds = [...existingIds];
  for (const task of tasks) {
    if (task.id == null || seen.has(task.id)) continue;
    seen.add(task.id);
    nextIds.push(task.id);
  }
  return nextIds;
};

export const replaceStageIds = (stages: CrmStageEntity[]): number[] =>
  stages.filter((stage) => stage.id != null).map((stage) => stage.id!);

export const appendStageIds = (
  existingIds: number[],
  stages: CrmStageEntity[]
): number[] => {
  const seen = new Set(existingIds);
  const nextIds = [...existingIds];
  for (const stage of stages) {
    if (stage.id == null || seen.has(stage.id)) continue;
    seen.add(stage.id);
    nextIds.push(stage.id);
  }
  return nextIds;
};

export const toOwnersRecord = (
  owners: CrmOwnerEntity[]
): Record<number, CrmOwnerEntity> => {
  const record: Record<number, CrmOwnerEntity> = {};
  for (const owner of owners) {
    record[owner.employeeId] = owner;
  }
  return record;
};

export const toStagesRecord = (
  stages: CrmStageEntity[]
): Record<number, CrmStageEntity> => {
  const record: Record<number, CrmStageEntity> = {};
  for (const stage of stages) {
    record[stage.id!] = stage;
  }
  return record;
};

export const toContactsRecord = (
  contacts: CrmContactEntity[]
): Record<number, CrmContactEntity> => {
  const record: Record<number, CrmContactEntity> = {};
  for (const contact of contacts) {
    record[contact.id!] = contact;
  }
  return record;
};

export const toTaskTypesRecord = (
  taskTypes: CrmTaskTypeEntity[]
): Record<number, CrmTaskTypeEntity> => {
  const record: Record<number, CrmTaskTypeEntity> = {};
  for (const taskType of taskTypes) {
    record[taskType.id] = taskType;
  }
  return record;
};
