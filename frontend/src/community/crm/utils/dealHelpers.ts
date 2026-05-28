export const formatDealAmountWithCurrency = (
  amount: string | null,
  currencyCode: string | null
): string => {
  if (!amount) return "—";
  return currencyCode ? `${amount} ${currencyCode}` : amount;
};
