import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useEffect, useState } from "react";

import {
  COMMON_ERROR_INVALID_TOKEN,
  COMMON_ERROR_SYSTEM_VERSION_MISMATCH,
  COMMON_ERROR_TOKEN_EXPIRED,
  COMMON_ERROR_USER_VERSION_MISMATCH
} from "~community/common/constants/errorMessageKeys";
import { signOut, useAuth } from "~community/common/context/AuthContext";
import authFetch from "~community/common/utils/axiosInterceptor";

import ROUTES from "../constants/routes";

const TanStackProvider = ({ children }: { children: ReactNode }) => {
  const { update, data: session } = useAuth();

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
      await update();
      queryClient.invalidateQueries();
    } catch (error) {
      console.error("Token refresh failed:", error);
      await signOut({
        redirect: true,
        callbackUrl: ROUTES.AUTH.SYSTEM_UPDATE
      });
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
  }, [session, update]);

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

export default TanStackProvider;
