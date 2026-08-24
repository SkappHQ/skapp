import { concatStrings } from "~community/common/utils/commonUtil";
import {
  CrmContactEntity,
  CrmContactRecord,
  CrmDealEntity,
  CrmDealRecord,
  CrmOwnerEntity,
  CrmOwnerRecord,
  CrmStageEntity,
  CrmStageRecord,
  CrmTaskTypeEntity,
  CrmTaskTypeRecord
} from "~community/crm/v2/types/CrmCommonTypes";

export const getOwnerName = (owner: CrmOwnerEntity): string => {
  const nameParts = [owner.firstName];
  if (owner.lastName !== undefined) {
    nameParts.push(owner.lastName);
  }
  return concatStrings(nameParts);
};

export const getContactName = (contact: CrmContactEntity): string => {
  const nameParts: string[] = [];
  if (contact.firstName !== undefined) {
    nameParts.push(contact.firstName);
  }
  if (contact.lastName !== undefined) {
    nameParts.push(contact.lastName);
  }
  return concatStrings(nameParts);
};

export const getOwnerById = (owners: CrmOwnerRecord, ownerId?: number) => {
  if (ownerId !== undefined) {
    return owners[ownerId];
  }
};

export const getContactNameById = (
  contacts: CrmContactRecord,
  contactId?: number
) => {
  if (contactId !== undefined) {
    return getContactName(contacts[contactId]);
  }
};

export const getDealNameById = (deals: CrmDealRecord, dealId?: number) => {
  if (dealId !== undefined) {
    return deals[dealId].name;
  }
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

export const toDealsRecord = (deals: CrmDealEntity[]): CrmDealRecord => {
  const dealRecord: CrmDealRecord = {};
  for (const deal of deals) {
    if (deal.id !== undefined) {
      dealRecord[deal.id] = deal;
    }
  }
  return dealRecord;
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
