import { formatDateWithOrdinalSuffix } from "~community/common/utils/dateTimeUtils";
import { LeaveEntitlementBalanceType } from "~community/leave/types/LeaveEntitlementTypes";

// Returns: "Available 10 / 20, Effective from 1st January 2025, Expired to 31st December 2025"
export const createLeaveEntitlementAccessibleDescription = (
  leaveEntitlementBalance: LeaveEntitlementBalanceType[] | undefined,
  translateText: (keys: string[]) => string | undefined
): string | undefined => {
  const availableLabel = translateText(["available"]);
  const effectiveFromLabel = translateText(["effectiveFrom"]);
  const expiredToLabel = translateText(["expiredTo"]);

  const descriptions = leaveEntitlementBalance
    ?.map((entitlement) => {
      const available =
        entitlement.totalDaysAllocated - entitlement.totalDaysUsed;
      const total = entitlement.totalDaysAllocated;
      const validFrom = formatDateWithOrdinalSuffix(entitlement.validFrom);
      const validTo = formatDateWithOrdinalSuffix(entitlement.validTo);

      return `${availableLabel} ${available} / ${total}, ${effectiveFromLabel} ${validFrom}, ${expiredToLabel} ${validTo}`;
    })
    .join(". ");

  return descriptions;
};
