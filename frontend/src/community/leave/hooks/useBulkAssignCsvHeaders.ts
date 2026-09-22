import { useTranslator } from "~community/common/hooks/useTranslator";
import { BulkAssignCsvHeaders } from "~community/leave/types/LeavePolicyTypes";

const useBulkAssignCsvHeaders = (): BulkAssignCsvHeaders => {
  const translateText = useTranslator(
    "leaveModule",
    "leavePolicies",
    "bulkAssignModal"
  );

  return {
    employeeName: translateText(["employeeNameHeader"]),
    policyName: translateText(["policyNameHeader"]),
    effectiveDate: translateText(["effectiveDateHeader"])
  };
};

export default useBulkAssignCsvHeaders;
