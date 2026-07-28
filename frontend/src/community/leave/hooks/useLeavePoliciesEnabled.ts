import { useGetLeavePolicyConfig } from "~community/leave/api/LeavePolicyApi";

interface UseLeavePoliciesEnabledOptions {
  enabled?: boolean;
}

interface UseLeavePoliciesEnabledResult {
  isLeavePoliciesEnabled: boolean;
  isLoading: boolean;
  isError: boolean;
}

const useLeavePoliciesEnabled = (
  options?: UseLeavePoliciesEnabledOptions
): UseLeavePoliciesEnabledResult => {
  const { data, isLoading, isError } = useGetLeavePolicyConfig(
    options?.enabled ?? true
  );

  return {
    isLeavePoliciesEnabled: Boolean(data?.enabled),
    isLoading,
    isError
  };
};

export default useLeavePoliciesEnabled;
