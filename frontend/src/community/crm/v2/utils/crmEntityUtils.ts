import {
  CrmContactEntity,
  CrmContactRecord,
  CrmOwnerEntity,
  CrmOwnerRecord,
  CrmStageEntity,
  CrmStageRecord,
  CrmTaskTypeEntity,
  CrmTaskTypeRecord
} from "~community/crm/v2/types/CrmCommonTypes";

export const toStagesRecord = (stages: CrmStageEntity[]): CrmStageRecord => {
  const record: CrmStageRecord = {};
  for (const stage of stages) {
    if (stage.id == null) continue;
    record[stage.id] = stage;
  }
  return record;
};

export const replaceStageIds = (stages: CrmStageEntity[]): number[] => {
  const stageIds: number[] = [];
  for (const stage of stages) {
    if (stage.id == null) continue;
    stageIds.push(stage.id);
  }
  return stageIds;
};

export const toContactsRecord = (
  contacts: CrmContactEntity[]
): CrmContactRecord => {
  const record: CrmContactRecord = {};
  for (const contact of contacts) {
    if (contact.id == null) continue;
    record[contact.id] = contact;
  }
  return record;
};

export const toOwnersRecord = (owners: CrmOwnerEntity[]): CrmOwnerRecord => {
  const record: CrmOwnerRecord = {};
  for (const owner of owners) {
    record[owner.employeeId] = owner;
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
