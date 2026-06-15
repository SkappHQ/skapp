export const getChangedFields = <T extends object>(
  values: T,
  initialValues: T
): Partial<T> =>
  Object.fromEntries(
    (Object.keys(values) as Array<keyof T>)
      .filter((key) => !Object.is(values[key], initialValues[key]))
      .map((key) => [key, values[key]])
  ) as Partial<T>;
