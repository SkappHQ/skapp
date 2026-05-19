export const formatCurrency = (value: number): string => {
  if (value === 0) return "$0";
  if (value >= 1000) return `$${(value / 1000).toFixed(0)}k`;
  return `$${value}`;
};

export const formatDealAmount = (amount: string | null): string => {
  if (!amount) return "—";
  const num = parseFloat(amount);
  if (isNaN(num)) return "—";
  if (num === 0) return "$0";
  return num >= 1000 ? `$${(num / 1000).toFixed(0)}k` : `$${num}`;
};

/** Full amount without abbreviation — used in deal accordion cards */
export const formatDealAmountFull = (amount: string | null): string => {
  if (!amount) return "—";
  const num = parseFloat(amount);
  if (isNaN(num)) return "—";
  return `$${num}`;
};
