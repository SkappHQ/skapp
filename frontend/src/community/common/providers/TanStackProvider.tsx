import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useEffect, useState } from "react";

import {
  COMMON_ERROR_INVALID_TOKEN,
  COMMON_ERROR_SYSTEM_VERSION_MISMATCH,
  COMMON_ERROR_TOKEN_EXPIRED,
  COMMON_ERROR_USER_VERSION_MISMATCH
} from "~community/common/constants/errorMessageKeys";
import authFetch from "~community/common/utils/axiosInterceptor";

import { useAuth } from "../../auth/providers/AuthProvider";

const TanStackProvider = ({ children }: { children: ReactNode }) => {
  const { refreshAccessToken, signOut, user } = useAuth();

  const [queryClient] = useState(() => {
    return new QueryClient({
      defaultOptions: {
        mutations: {
          onMutate: async () => {
            if (!navigator.onLine) {
              throw new Error("Network error: No internet connection");
            }
          }
        }
      }
    });
  });

  const handleTokenRefresh = async () => {
    try {
      await refreshAccessToken();
      queryClient.invalidateQueries();
    } catch (error) {
      console.error("Token refresh failed:", error);
      await signOut();
    }
  };

  useEffect(() => {
    const interceptor = authFetch.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (
          error?.response?.data?.results?.[0]?.messageKey ===
            COMMON_ERROR_SYSTEM_VERSION_MISMATCH ||
          error?.response?.data?.results?.[0]?.messageKey ===
            COMMON_ERROR_USER_VERSION_MISMATCH
        ) {
          await handleTokenRefresh();
        }

        if (
          error?.response?.data?.results?.[0]?.messageKey ===
            COMMON_ERROR_TOKEN_EXPIRED ||
          error?.response?.data?.results?.[0]?.messageKey ===
            COMMON_ERROR_INVALID_TOKEN
        ) {
          console.log("Token expired or invalid, signing out...");
          await signOut();
        }

        if (error?.response?.status === 401) {
          return;
        }
        return Promise.reject(error);
      }
    );

    return () => {
      authFetch.interceptors.response.eject(interceptor);
    };
  }, [user, refreshAccessToken, signOut]);

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

export default TanStackProvider;
