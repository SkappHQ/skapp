import {
  CrmOwnerEntity,
  CrmOwnerRecord,
  CrmStageEntity,
  CrmStageRecord,
  CrmTaskTypeEntity,
  CrmTaskTypeRecord
} from "~community/crm/v2/types/CrmCommonTypes";

const isEmptyValue = (value?: string | number) =>
  value === undefined || Number(value) === 0;

export const formatTableValue = (value?: string | number, prefix = "") =>
  isEmptyValue(value) ? "-" : `${prefix}${value}`;

export const formatMonetaryValue = (value?: string) => {
  if (isEmptyValue(value)) return "-";

  const parsed = Number(value);

  if (Number.isNaN(parsed)) return "-";

  return `$${value?.split(".")[0]}`;
};

export const formatMonetaryValueWithDecimals = (value?: string | number) => {
  if (isEmptyValue(value)) return "-";

  const parsed = Number(value);

  if (Number.isNaN(parsed)) return "-";

  return `$${parsed.toFixed(2)}`;
};

export const appendId = (ids: number[] | undefined, id: number): number[] => {
  if (ids === undefined) {
    return [id];
  }

  return ids.includes(id) ? ids : [...ids, id];
};

export const getOwnerById = (
  owners: CrmOwnerRecord,
  ownerId?: number
): CrmOwnerEntity | undefined => {
  if (ownerId !== undefined) {
    return owners[ownerId];
  }
};

export const updateOwnerRecord = (
  existingOwners: CrmOwnerRecord,
  newOwners: CrmOwnerEntity[]
): CrmOwnerRecord => {
  const updatedRecord: CrmOwnerRecord = { ...existingOwners };
  for (const owner of newOwners) {
    updatedRecord[owner.employeeId] = {
      ...updatedRecord[owner.employeeId],
      ...owner
    };
  }
  return updatedRecord;
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

export const getOrderedStages = (stages: CrmStageRecord): CrmStageEntity[] =>
  Object.values(stages).sort(
    (a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0)
  );

export const getBoardStageIds = (stages: CrmStageRecord): number[] =>
  getOrderedStages(stages)
    .map((stage) => stage.id)
    .filter((id): id is number => id != null);

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
