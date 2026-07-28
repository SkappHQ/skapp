import { useGetLeavePolicyConfig } from "~community/leave/api/LeavePolicyApi";

interface UseLeavePoliciesEnabledResult {
  isLeavePoliciesEnabled: boolean;
  isLoading: boolean;
  isError: boolean;
}

const useLeavePoliciesEnabled = (
  enabled = true
): UseLeavePoliciesEnabledResult => {
  const { data, isLoading, isError } = useGetLeavePolicyConfig(enabled);

  return {
    isLeavePoliciesEnabled: Boolean(data?.enabled),
    isLoading,
    isError
  };
};

export default useLeavePoliciesEnabled;
