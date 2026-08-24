import { concatStrings } from "~community/common/utils/commonUtil";
import {
  CURRENCY_PREFIX,
  EMPTY_PLACEHOLDER
} from "~community/crm/v2/constants/commonConstants";
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

const isEmptyValue = (value?: string | number) =>
  value === undefined || Number(value) === 0;

export const formatTableValue = (value?: string | number, prefix = "") =>
  isEmptyValue(value) ? EMPTY_PLACEHOLDER : `${prefix}${value}`;

export const formatMonetaryValue = (value?: string) => {
  if (isEmptyValue(value)) return EMPTY_PLACEHOLDER;

  return `${CURRENCY_PREFIX}${value?.split(".")[0]}`;
};

export const formatMonetaryValueWithDecimals = (value?: string | number) =>
  isEmptyValue(value)
    ? EMPTY_PLACEHOLDER
    : `${CURRENCY_PREFIX}${Number(value).toFixed(2)}`;

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

export const toDealsRecord = (deals: CrmDealEntity[]): CrmDealRecord => {
  const dealRecord: CrmDealRecord = {};
  for (const deal of deals) {
    if (deal.id !== undefined) {
      dealRecord[deal.id] = deal;
    }
  }
  return dealRecord;
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
