import { useGetLeavePolicyConfig } from "~community/leave/api/LeavePolicyApi";

interface UseLeavePoliciesEnabledResult {
  isLeavePoliciesEnabled: boolean;
  isLoading: boolean;
}

const useLeavePoliciesEnabled = (): UseLeavePoliciesEnabledResult => {
  const { data, isLoading } = useGetLeavePolicyConfig();

  return {
    isLeavePoliciesEnabled: Boolean(data?.enabled),
    isLoading
  };
};

export default useLeavePoliciesEnabled;
