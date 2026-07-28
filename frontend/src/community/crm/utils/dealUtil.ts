import { DropdownOption } from "@rootcodelabs/skapp-ui";

import { CrmContactLookup } from "~community/crm/types/CommonTypes";
import { getContactFullName } from "~community/crm/utils/contactUtil";

interface OptionSource {
  employeeId: number;
}

export const buildOwnerOptions = <T extends OptionSource>(
  items: T[],
  selectedItem: T | null,
  getLabel: (item: T) => string
): DropdownOption[] => {
  const toOption = (item: T): DropdownOption => ({
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

export const buildContactOptions = (
  items: CrmContactLookup[]
): DropdownOption[] => {
  const toOption = (item: CrmContactLookup): DropdownOption => ({
    id: item.id,
    value: item.id,
    label: item.company?.name
      ? `${getContactFullName(item)} ${item.company.name}`
      : getContactFullName(item)
  });

  return items.map(toOption);
};
