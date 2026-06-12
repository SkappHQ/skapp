import {
  MutationCache,
  QueryClient,
  QueryClientProvider,
  onlineManager
} from "@tanstack/react-query";
import { ReactNode, useCallback, useEffect, useRef, useState } from "react";

import { getNewAccessToken, signOut } from "~community/auth/utils/authUtils";
import {
  COMMON_ERROR_INVALID_TOKEN,
  COMMON_ERROR_SYSTEM_VERSION_MISMATCH,
  COMMON_ERROR_TOKEN_EXPIRED,
  COMMON_ERROR_USER_VERSION_MISMATCH
} from "~community/common/constants/errorMessageKeys";
import { ToastType } from "~community/common/enums/ComponentEnums";
import authFetch from "~community/common/utils/axiosInterceptor";
import { NetworkOfflineError } from "~community/common/types/ErrorTypes";

import { useAuth } from "../../auth/providers/AuthProvider";
import { useToast } from "./ToastProvider";
import { useTranslator } from "../hooks/useTranslator";

const TanStackProvider = ({ children }: { children: ReactNode }) => {
  const { user, checkAuth } = useAuth();
  const { setToastMessage } = useToast();
  const translateText = useTranslator("networkError");
  const offlineToastShown = useRef(false);

  const showOfflineToast = useCallback(() => {
    if (offlineToastShown.current) return;
    offlineToastShown.current = true;
    
    setToastMessage({
      open: true,
      toastType: ToastType.ERROR,
      title: translateText(["title"]),
      description: translateText(["description"]),
      isIcon: true
    });

    setTimeout(() => {
      offlineToastShown.current = false;
    }, 3000);
  }, [setToastMessage, translateText]);

  const showOfflineToastRef = useRef(showOfflineToast);

  useEffect(() => {
    showOfflineToastRef.current = showOfflineToast;
  }, [showOfflineToast]);

  const [queryClient] = useState(() => {
    return new QueryClient({
      mutationCache: new MutationCache({
        onError: (error) => {
          if (error instanceof NetworkOfflineError) {
            setTimeout(() => {
              showOfflineToastRef.current();
            }, 0);
            return;
          }
        }
      }),
      defaultOptions: {
        mutations: {
          onMutate: async () => {
            if (!onlineManager.isOnline()) {
              throw new NetworkOfflineError();
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
