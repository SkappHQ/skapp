import { ColorOption, DropdownOption } from "@rootcodelabs/skapp-ui";

import { EmptyStateTypeEnum } from "~community/common/enums/ComponentEnums";
import { formatEmptyString } from "~community/common/utils/commonUtil";
import {
  CrmContactFormValues,
  CrmDealResponseType,
  CrmDealStageCreatePayload,
  CrmDealStageFormTypes,
  EditContactPayload
} from "~community/crm/types/CommonTypes";

import { STAGE_COLOR_MAP } from "../constants/stageConstants";

type NumericValue = string | null;

export const formatValue = (value: NumericValue): string => {
  if (value == null || value === "") return "-";
  const parsed = Number.parseFloat(value);
  if (parsed === 0) return "-";
  return `$${parsed.toFixed(2)}`;
};

export const mergeDealUpdate = (
  deals: CrmDealResponseType[],
  update: CrmDealResponseType
): CrmDealResponseType[] =>
  deals.some((deal) => deal.id === update.id)
    ? deals.map((deal) => (deal.id === update.id ? update : deal))
    : [...deals, update];

export const getChangedContactFields = (
  newValues: CrmContactFormValues,
  originalValues: CrmContactFormValues
): Partial<EditContactPayload> => {
  const changedFields: Partial<EditContactPayload> = {};

  if (newValues.firstName !== originalValues.firstName) {
    changedFields.firstName = newValues.firstName;
  }
  if (newValues.lastName !== originalValues.lastName) {
    changedFields.lastName = formatEmptyString(newValues.lastName);
  }
  if (newValues.email !== originalValues.email) {
    changedFields.email = newValues.email;
  }
  if (newValues.contactNumber !== originalValues.contactNumber) {
    changedFields.contactNumber = newValues.contactNumber;
  }
  if (newValues.companyId !== originalValues.companyId) {
    changedFields.companyId = newValues.companyId;
  }
  if (newValues.ownerId !== originalValues.ownerId) {
    changedFields.ownerId = newValues.ownerId;
  }

  return changedFields;
};

export const getChangedDealStageFields = (
  newValues: CrmDealStageFormTypes,
  originalValues: CrmDealStageFormTypes
): Partial<CrmDealStageCreatePayload> => {
  const changedFields: Partial<CrmDealStageCreatePayload> = {};

  const newName = newValues.name.trim();
  const originalName = originalValues.name.trim();
  const newDescription = newValues.description.trim() || null;
  const originalDescription = originalValues.description.trim() || null;

  if (newName !== originalName) {
    changedFields.name = newName;
  }
  if (newDescription !== originalDescription) {
    changedFields.description = newDescription;
  }
  if (newValues.color !== originalValues.color) {
    changedFields.color = newValues.color;
  }

  return changedFields;
};

interface Id {
  id: number | string;
}

type DropdownMappable = { id: number | string; label: string };

const toDropdownOption = (item: DropdownMappable): DropdownOption => ({
  id: item.id,
  value: item.id,
  label: item.label
});

export const toDropdownOptions = (
  items: DropdownMappable[]
): DropdownOption[] => items.map(toDropdownOption);

export const toSelectedDropdownOption = (
  item: DropdownMappable | null
): DropdownOption | null => (item ? toDropdownOption(item) : null);

export const findById = <T>(
  items: T[],
  id: number | string,
  getId: (item: T) => number | string
): T | null => items.find((item) => getId(item) === id) ?? null;

export const mergeWithExisting = <T extends Id>(
  existing: T[],
  incoming: T[]
): T[] =>
  incoming.map((item) => {
    const current = existing.find((entry) => entry.id === item.id);
    return current ? { ...current, ...item } : item;
  });

export const groupItemsByPriority = <T extends Id>(
  items: T[],
  priorityIds: number[]
): { prioritized: T[]; deprioritized: T[] } => {
  const prioritySet = new Set(priorityIds.map(String));

  const prioritized = items.filter((item) => prioritySet.has(String(item.id)));
  const deprioritized = items.filter(
    (item) => !prioritySet.has(String(item.id))
  );

  return { prioritized, deprioritized };
};

export const getEmptyStateType = (searchTerm: string): EmptyStateTypeEnum =>
  searchTerm.trim() === ""
    ? EmptyStateTypeEnum.NO_DATA
    : EmptyStateTypeEnum.NO_SEARCH_RESULTS;

export const dealStageColors: ColorOption[] = Object.entries(
  STAGE_COLOR_MAP
).map(([key, color]) => ({
  id: key,
  name: key,
  value: key,
  color
}));
