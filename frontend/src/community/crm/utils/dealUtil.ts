import { DropdownOption } from "@rootcodelabs/skapp-ui";

interface OptionSource {
  employeeId: number;
}

interface ContactOptionSource {
  id: number;
  name: string;
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

export const buildContactOptions = <T extends ContactOptionSource>(
  items: T[]
): DropdownOption[] => {
  const toOption = (item: T): DropdownOption => ({
    id: item.id,
    value: item.id,
    label: item.name
  });

  return items.map(toOption);
};
