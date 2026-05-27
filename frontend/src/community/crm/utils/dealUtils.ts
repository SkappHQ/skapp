import { DEAL_DEFAULT_CURRENCY } from "~community/crm/constants/dealConstants";

export const formatDealAmount = (
  amount: string | number | null | undefined
): string => {
  const parsed = Number(amount);
  if (!Number.isFinite(parsed) || parsed < 0) return "-";
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: DEAL_DEFAULT_CURRENCY
  }).format(parsed);
};
