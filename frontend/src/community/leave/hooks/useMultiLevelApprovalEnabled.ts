import { useGetLeaveApprovalConfig } from "~community/leave/api/LeaveApprovalConfigApi";

interface UseMultiLevelApprovalEnabledResult {
  isMultiLevelApprovalEnabled: boolean;
  isLoading: boolean;
  isError: boolean;
}

const useMultiLevelApprovalEnabled = (): UseMultiLevelApprovalEnabledResult => {
  const { data, isLoading, isError } = useGetLeaveApprovalConfig();

  return {
    isMultiLevelApprovalEnabled: Boolean(data?.isMultiLevelApprovalEnabled),
    isLoading,
    isError
  };
};

export default useMultiLevelApprovalEnabled;
