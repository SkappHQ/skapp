import type { CrmLimitationResponse } from "~enterprise/crm/types/CrmLimitTypes";

interface UseGetCrmLimitationReturn {
  data: CrmLimitationResponse | undefined;
  isSuccess: boolean;
  isLoading: boolean;
  refetch: () => Promise<{ data: CrmLimitationResponse | undefined }>;
}

export const useGetCrmLimitation = (): UseGetCrmLimitationReturn => {
  return {
    data: undefined,
    isSuccess: true,
    isLoading: false,
    refetch: async () => ({ data: undefined })
  };
};
