import { useTranslator } from "~community/common/hooks/useTranslator";
import {
  BulkAssignResourceHeaders,
  BulkAssignTemplateHeaders
} from "~community/leave/types/LeavePolicyTypes";

const useBulkAssignTemplateHeaders = (): BulkAssignTemplateHeaders => {
  const translateText = useTranslator(
    "leaveModule",
    "leavePolicies",
    "bulkAssignModal"
  );

  return {
    employeeEmail: translateText(["employeeEmailHeader"]),
    policyId: translateText(["policyIdHeader"]),
    effectiveDate: translateText(["effectiveDateHeader"])
  };
};

export const useBulkAssignResourceHeaders = (): BulkAssignResourceHeaders => {
  const translateText = useTranslator(
    "leaveModule",
    "leavePolicies",
    "bulkAssignModal"
  );

  return {
    policyId: translateText(["policyIdHeader"]),
    policyName: translateText(["policyNameHeader"]),
    leaveType: translateText(["leaveTypeHeader"])
  };
};

export default useBulkAssignTemplateHeaders;
