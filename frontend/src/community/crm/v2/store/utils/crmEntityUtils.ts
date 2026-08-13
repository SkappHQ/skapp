import {
  CrmContactEntity,
  CrmOwnerEntity,
  CrmStageEntity,
  CrmTaskTypeEntity
} from "~community/crm/v2/types/CrmCommonTypes";

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
