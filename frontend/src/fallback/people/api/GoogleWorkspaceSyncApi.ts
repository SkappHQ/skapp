import type { GoogleConnectionStatusResponse } from "~enterprise/people/types/GoogleWorkspaceSyncTypes";

interface UseGetGoogleConnectionStatusReturn {
  data: GoogleConnectionStatusResponse | undefined;
  isLoading: boolean;
}

export const useGetGoogleConnectionStatus = (
  enabled: boolean = true
): UseGetGoogleConnectionStatusReturn => {
  return {
    data: undefined,
    isLoading: false
  };
};
