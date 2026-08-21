export const formatDealAmount = (amount: string | null | undefined): string => {
  if (amount == null || amount === "") return "-";
  const parsed = Number.parseFloat(amount);
  if (Number.isNaN(parsed) || parsed === 0) return "-";
  return `$${parsed.toFixed(2)}`;
};
