type NumericValue = string | null;

export const formatValue = (value: NumericValue): string => {
  if (value == null || value === "") return "-";
  return `$${Number.parseFloat(value).toFixed(2)}`;
};

interface Identified {
  id: number | string;
}

export const prioritizeListIds = <T extends Identified>(
  items: T[],
  priorityIds: number[]
): { prioritized: T[]; others: T[] } => {
  const prioritySet = new Set(priorityIds.map(String));

  const prioritized = items.filter((item) => prioritySet.has(String(item.id)));
  const others = items.filter((item) => !prioritySet.has(String(item.id)));

  return { prioritized, others };
};
