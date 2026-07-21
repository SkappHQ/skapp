interface DealAccessSession {
  userId?: number;
  isCrmAdmin?: boolean;
  isCrmSalesManager?: boolean;
}

export const canAccessDeal = (
  ownerEmployeeId: number,
  { userId, isCrmAdmin, isCrmSalesManager }: DealAccessSession
): boolean =>
  Boolean(isCrmAdmin || isCrmSalesManager) || ownerEmployeeId === userId;
