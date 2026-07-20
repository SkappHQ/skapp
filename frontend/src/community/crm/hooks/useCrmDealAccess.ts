import { useCallback } from "react";

import { ToastType } from "~community/common/enums/ComponentEnums";
import useSessionData from "~community/common/hooks/useSessionData";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";

interface UseCrmDealAccessReturn {
  ensureDealAccess: (ownerEmployeeId: number) => boolean;
  hasFullDealAccess: boolean;
}

export const useCrmDealAccess = (): UseCrmDealAccessReturn => {
  const { userId, isCrmAdmin, isCrmSalesManager } = useSessionData();
  const { setToastMessage } = useToast();
  const translateText = useTranslator("crmModule", "common", "permissionToast");

  const hasFullDealAccess = Boolean(isCrmAdmin || isCrmSalesManager);

  const canAccessDeal = useCallback(
    (ownerEmployeeId: number): boolean =>
      hasFullDealAccess || ownerEmployeeId === userId,
    [hasFullDealAccess, userId]
  );

  const ensureDealAccess = useCallback(
    (ownerEmployeeId: number): boolean => {
      if (canAccessDeal(ownerEmployeeId)) {
        return true;
      }

      setToastMessage({
        open: true,
        toastType: ToastType.WARN,
        title: translateText(["title"]),
        description: translateText(["description"])
      });

      return false;
    },
    [canAccessDeal]
  );

  return { ensureDealAccess, hasFullDealAccess };
};
