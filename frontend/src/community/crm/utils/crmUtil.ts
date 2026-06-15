type NumericValue = string | null;

export const formatValue = (value: NumericValue): string => {
  if (value == null || value === "") return "-";
  return `$${Number.parseFloat(value).toFixed(2)}`;
};

interface Identifiable {
  id: number | string;
}

export const prioritizeListIds = <T extends Identifiable>(
  items: T[],
  priorityIds: number[]
): { prioritized: T[]; others: T[] } => {
  return items.reduce<{ prioritized: T[]; others: T[] }>(
    (groups, item) => {
      const key = priorityIds.includes(Number(item.id)) ? "prioritized" : "others";

      groups[key].push(item);
      return groups;
    },
    { prioritized: [], others: [] }
  );
};
