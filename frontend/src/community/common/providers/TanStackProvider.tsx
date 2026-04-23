import { QueryClient, QueryClientProvider, onlineManager } from "@tanstack/react-query";
import { ReactNode, useCallback, useEffect, useState } from "react";

import { getNewAccessToken, signOut } from "~community/auth/utils/authUtils";
import {
  COMMON_ERROR_INVALID_TOKEN,
  COMMON_ERROR_SYSTEM_VERSION_MISMATCH,
  COMMON_ERROR_TOKEN_EXPIRED,
  COMMON_ERROR_USER_VERSION_MISMATCH
} from "~community/common/constants/errorMessageKeys";
import { ToastType } from "~community/common/enums/ComponentEnums";
import authFetch from "~community/common/utils/axiosInterceptor";

import { useAuth } from "../../auth/providers/AuthProvider";
import { useToast } from "./ToastProvider";

const TanStackProvider = ({ children }: { children: ReactNode }) => {
  const { user, checkAuth } = useAuth();
  const { setToastMessage } = useToast();
  
  const showOfflineToast = useCallback(() => {
    setToastMessage({
      open: true,
      toastType: ToastType.ERROR,
      title: "Oops! Something went wrong.",
      description:
        "No internet connection. Please check your network and try again.",
      isIcon: true
    });
  }, [setToastMessage]);

  const [queryClient] = useState(() => {
    return new QueryClient({
      defaultOptions: {
        mutations: {
          onMutate: async () => {
            if (!onlineManager.isOnline()) {
              showOfflineToast();
              throw new Error("Network error: No internet connection");
            }
          }
        }
      }
    });
  });

  useEffect(() => {
    const handleTokenRefresh = async () => {
      await getNewAccessToken();
      await checkAuth();
      queryClient.invalidateQueries();
    };

    const interceptor = authFetch.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (!onlineManager.isOnline()) {
          showOfflineToast();
          throw error;
        }

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
  }, [user, checkAuth, queryClient, showOfflineToast]);

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

export default TanStackProvider;
