export const formatCurrency = (
  value: string | number | null | undefined
): string => {
  if (value == null || value === "") return "-";
  const parsed = typeof value === "number" ? value : Number.parseFloat(value);
  if (Number.isNaN(parsed) || parsed === 0) return "-";
  return `$${parsed.toFixed(2)}`;
};
