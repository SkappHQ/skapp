import { DropdownOption } from "@rootcodelabs/skapp-ui";

import { CrmOwnerEntity } from "~community/crm/v2/types/CrmCommonTypes";
import { CrmContactLookupItem } from "~community/crm/v2/types/CrmTypes";

export const findById = <T>(
  items: T[],
  id: number | string,
  getId: (item: T) => number | string
): T | null => items.find((item) => getId(item) === id) ?? null;

export const buildContactOptions = (
  items: CrmContactLookupItem[]
): DropdownOption[] =>
  items.map((item) => ({
    id: item.id,
    value: item.id,
    label: item.company?.name ? `${item.name} ${item.company.name}` : item.name
  }));

export const buildOwnerOptions = (
  items: CrmOwnerEntity[],
  selectedItem: CrmOwnerEntity | null,
  getLabel: (item: CrmOwnerEntity) => string
): DropdownOption[] => {
  const toOption = (item: CrmOwnerEntity): DropdownOption => ({
    id: item.employeeId,
    value: item.employeeId,
    label: getLabel(item)
  });

  const base = items.map(toOption);

  const isSelectedMissing =
    selectedItem &&
    !items.some((item) => item.employeeId === selectedItem.employeeId);

  return isSelectedMissing ? [toOption(selectedItem), ...base] : base;
};
