import {
  CrmIndustryEntity,
  CrmIndustryRecord,
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

  return `$${value?.split(".")[0]}`;
};

export const formatMonetaryValueWithDecimals = (value?: string | number) =>
  isEmptyValue(value) ? "-" : `$${Number(value).toFixed(2)}`;

export const formatCurrency = (
  value: string | number | null | undefined
): string => {
  if (value == null || value === "") return "-";
  const parsed = typeof value === "number" ? value : Number.parseFloat(value);
  if (Number.isNaN(parsed) || parsed === 0) return "-";
  return `$${parsed.toFixed(2)}`;
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

export const toStagesRecord = (stages: CrmStageEntity[]): CrmStageRecord => {
  const stageRecord: CrmStageRecord = {};
  for (const stage of stages) {
    if (stage.id != null) {
      stageRecord[stage.id] = stage;
    }
  }
  return stageRecord;
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

export const toIndustriesRecord = (
  industries: CrmIndustryEntity[]
): CrmIndustryRecord => {
  const industryRecord: CrmIndustryRecord = {};
  for (const industry of industries) {
    if (industry.id != null) {
      industryRecord[industry.id] = industry;
    }
  }
  return industryRecord;
};
