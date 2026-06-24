import { DropdownOption } from "@rootcodelabs/skapp-ui";

import { EmptyStateTypeEnum } from "~community/common/enums/ComponentEnums";
import { CrmContactFormValues } from "~community/crm/types/CommonTypes";

type NumericValue = string | null;

export const formatValue = (value: NumericValue): string => {
  if (value == null || value === "") return "-";
  return `$${Number.parseFloat(value).toFixed(2)}`;
};

export const getChangedContactFields = (
  newValues: CrmContactFormValues,
  originalValues: CrmContactFormValues
): Partial<CrmContactFormValues> => {
  const changedFields: Partial<CrmContactFormValues> = {};

  if (newValues.name !== originalValues.name) {
    changedFields.name = newValues.name;
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
