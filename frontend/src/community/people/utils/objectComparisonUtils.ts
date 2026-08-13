const getDefinedKeys = (value: Record<string, unknown>): string[] =>
  Object.keys(value).filter((key) => value[key] !== undefined);

export const isValueEqual = (value: unknown, other: unknown): boolean => {
  if (value === other) {
    return true;
  }

  if (
    typeof value !== "object" ||
    typeof other !== "object" ||
    value === null ||
    other === null
  ) {
    return false;
  }

  if (Array.isArray(value) || Array.isArray(other)) {
    if (!Array.isArray(value) || !Array.isArray(other)) {
      return false;
    }

    return (
      value.length === other.length &&
      value.every((item, index) => isValueEqual(item, other[index]))
    );
  }

  const valueRecord = value as Record<string, unknown>;
  const otherRecord = other as Record<string, unknown>;

  const valueKeys = getDefinedKeys(valueRecord);
  const otherKeys = getDefinedKeys(otherRecord);

  return (
    valueKeys.length === otherKeys.length &&
    valueKeys.every(
      (key) =>
        otherKeys.includes(key) &&
        isValueEqual(valueRecord[key], otherRecord[key])
    )
  );
};
