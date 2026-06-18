import { DropdownOption } from "@rootcodelabs/skapp-ui";

type NumericValue = string | null;

export const formatValue = (value: NumericValue): string => {
  if (value == null || value === "") return "-";
  return `$${Number.parseFloat(value).toFixed(2)}`;
};

interface Id {
  id: number | string;
}

const toDropdownOption = <T>(
  item: T,
  getId: (item: T) => number | string,
  getLabel: (item: T) => string
): DropdownOption => ({
  id: getId(item),
  value: getId(item),
  label: getLabel(item)
});

export const toDropdownOptions = <T>(
  items: T[],
  getId: (item: T) => number | string,
  getLabel: (item: T) => string
): DropdownOption[] =>
  items.map((item) => toDropdownOption(item, getId, getLabel));

export const toSelectedDropdownOption = <T>(
  item: T | null,
  getId: (item: T) => number | string,
  getLabel: (item: T) => string
): DropdownOption | null =>
  item ? toDropdownOption(item, getId, getLabel) : null;

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
