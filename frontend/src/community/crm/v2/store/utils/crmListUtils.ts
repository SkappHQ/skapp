interface WithId {
  id?: number;
}

export interface ListWriteResult<T> {
  map: Record<number, T>;
  ids: number[];
}

const mergeInto = <T extends WithId>(
  map: Record<number, T>,
  incoming: T[]
): Record<number, T> => {
  const next = { ...map };
  for (const item of incoming) {
    if (item.id == null) continue;
    next[item.id] = { ...next[item.id], ...item };
  }
  return next;
};

export const appendToList = <T extends WithId>(
  map: Record<number, T>,
  ids: number[],
  incoming: T[]
): ListWriteResult<T> => {
  const seen = new Set(ids);
  const nextIds = [...ids];

  for (const item of incoming) {
    if (item.id == null || seen.has(item.id)) continue;
    seen.add(item.id);
    nextIds.push(item.id);
  }

  return { map: mergeInto(map, incoming), ids: nextIds };
};

export const replaceList = <T extends WithId>(
  map: Record<number, T>,
  incoming: T[]
): ListWriteResult<T> => ({
  map: mergeInto(map, incoming),
  ids: incoming
    .filter((item): item is T & { id: number } => item.id != null)
    .map((item) => item.id)
});
