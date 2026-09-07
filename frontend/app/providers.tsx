"use client";

import { Theme, ThemeProvider } from "@mui/material/styles";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { onValue, ref } from "firebase/database";
import { usePathname, useRouter } from "next/navigation";
import { FC, ReactNode, Suspense, useEffect, useState } from "react";
import "react-day-picker/dist/style.css";
import { ErrorBoundary } from "react-error-boundary";
import { I18nextProvider } from "react-i18next";

import { AuthProvider } from "~community/auth/providers/AuthProvider";
import NavigationEventsBridge from "~community/common/components/atoms/NavigationEventsBridge/NavigationEventsBridge";
import BaseLayout from "~community/common/components/templates/BaseLayout/BaseLayout";
import { appModes } from "~community/common/constants/configs";
import ROUTES from "~community/common/constants/routes";
import TanStackProvider from "~community/common/providers/TanStackProvider";
import { ToastProvider } from "~community/common/providers/ToastProvider";
import { WebSocketProvider } from "~community/common/providers/WebSocketProvider";
import { theme } from "~community/common/theme/theme";
import { themeSelector } from "~community/common/theme/themeSelector";
import { getDataFromLocalStorage } from "~community/common/utils/accessLocalStorage";
import "~enterprise/common/components/atoms/driverJsPopover/styles.css";
import AnnouncementWrapper from "~enterprise/common/components/organisms/AnnouncementWrapper/AnnouncementWrapper";
import {
  isNonProdMaintenanceMode,
  isProdMaintenanceMode
} from "~enterprise/common/constants/dbKeys";
import { AnnouncementProvider } from "~enterprise/common/providers/AnnouncementProvider";
import { database } from "~enterprise/common/utils/firebase";
import { initializeHotjar } from "~enterprise/common/utils/monitoring";
import i18n from "~i18n";

import ErrorFallback from "./error-fallback";

interface Props {
  children: ReactNode;
}

const Providers: FC<Props> = ({ children }) => {
  const [newTheme, setNewTheme] = useState<Theme>(theme);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!database) return;

    const isMaintenanceMode =
      process.env.NEXT_PUBLIC_ENTERPRISE_MODE === "prod"
        ? isProdMaintenanceMode
        : isNonProdMaintenanceMode;

    const maintenanceRef = ref(database, isMaintenanceMode);

    const unsubscribe = onValue(maintenanceRef, (snapshot) => {
      const isMaintenanceMode = snapshot.val();

      if (isMaintenanceMode === true && pathname !== ROUTES.MAINTENANCE) {
        router.push(ROUTES.MAINTENANCE);
      }
    });

    return () => unsubscribe();
  }, [router, pathname]);

  useEffect(() => {
    if (getDataFromLocalStorage("brandingData")) {
      const selectedTheme = themeSelector(
        getDataFromLocalStorage("brandingData")?.brand_color?.primary.main ?? ""
      );
      setNewTheme(selectedTheme);
    } else {
      setNewTheme(theme);
    }

    if (process.env.NEXT_PUBLIC_MODE === appModes.ENTERPRISE) {
      initializeHotjar();
    }
  }, []);

  const shouldUseWebSocketProvider =
    process.env.NEXT_PUBLIC_MODE !== appModes.ENTERPRISE;

  return (
    <AuthProvider>
      {/* Reads useSearchParams, so it needs its own boundary. */}
      <Suspense fallback={null}>
        <NavigationEventsBridge />
      </Suspense>
      {shouldUseWebSocketProvider ? (
        <WebSocketProvider>
          <ToastProvider>
            <TanStackProvider>
              <ThemeProvider theme={newTheme}>
                <I18nextProvider i18n={i18n}>
                  <ErrorBoundary FallbackComponent={ErrorFallback}>
                    <BaseLayout>{children}</BaseLayout>
                  </ErrorBoundary>
                  <ReactQueryDevtools initialIsOpen={false} position="bottom" />
                </I18nextProvider>
              </ThemeProvider>
            </TanStackProvider>
          </ToastProvider>
        </WebSocketProvider>
      ) : (
        <ToastProvider>
          <TanStackProvider>
            <ThemeProvider theme={newTheme}>
              <I18nextProvider i18n={i18n}>
                <AnnouncementProvider>
                  <ErrorBoundary FallbackComponent={ErrorFallback}>
                    <BaseLayout>{children}</BaseLayout>
                  </ErrorBoundary>
                  <AnnouncementWrapper />
                </AnnouncementProvider>
                <ReactQueryDevtools initialIsOpen={false} position="bottom" />
              </I18nextProvider>
            </ThemeProvider>
          </TanStackProvider>
        </ToastProvider>
      )}
    </AuthProvider>
  );
};

export default Providers;
