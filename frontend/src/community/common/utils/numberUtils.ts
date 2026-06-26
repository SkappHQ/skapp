export const roundNumber = (value: number): number => Math.round(value);

export const formatToFiveDecimalPlaces = (value: number): string => {
  return parseFloat(value.toFixed(5)).toString();
};
