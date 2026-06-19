import { EmptyStateTypeEnum } from "~community/common/enums/ComponentEnums";

type NumericValue = string | null;

export const formatValue = (value: NumericValue): string => {
  if (value == null || value === "") return "-";
  return `$${Number.parseFloat(value).toFixed(2)}`;
};

interface Id {
  id: number | string;
}

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
