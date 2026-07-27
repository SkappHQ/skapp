import { useGetLeavePolicyConfig } from "~community/leave/api/LeavePolicyApi";

interface UseLeavePoliciesEnabledOptions {
  enabled?: boolean;
}

interface UseLeavePoliciesEnabledResult {
  isLeavePoliciesEnabled: boolean;
  isLoading: boolean;
}

const useLeavePoliciesEnabled = (
  options?: UseLeavePoliciesEnabledOptions
): UseLeavePoliciesEnabledResult => {
  const { data, isLoading } = useGetLeavePolicyConfig(options?.enabled ?? true);

  return {
    isLeavePoliciesEnabled: Boolean(data?.enabled),
    isLoading
  };
};

export default useLeavePoliciesEnabled;
