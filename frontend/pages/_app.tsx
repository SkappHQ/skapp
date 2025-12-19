import { Theme, ThemeProvider } from "@mui/material/styles";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { onValue, ref } from "firebase/database";
import App, { AppContext } from "next/app";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { I18nextProvider, useSSR } from "react-i18next";

import FullScreenLoader from "~community/common/components/molecules/FullScreenLoader/FullScreenLoader";
import BaseLayout from "~community/common/components/templates/BaseLayout/BaseLayout";
import { appModes } from "~community/common/constants/configs";
import ROUTES from "~community/common/constants/routes";
import { AuthProvider } from "~community/common/context/AuthContext";
import TanStackProvider from "~community/common/providers/TanStackProvider";
import { ToastProvider } from "~community/common/providers/ToastProvider";
import { WebSocketProvider } from "~community/common/providers/WebSocketProvider";
import { theme } from "~community/common/theme/theme";
import { themeSelector } from "~community/common/theme/themeSelector";
import { MyAppPropsType } from "~community/common/types/CommonTypes";
import { getDataFromLocalStorage } from "~community/common/utils/accessLocalStorage";
import "~enterprise/common/components/atoms/driverJsPopover/styles.css";
import {
  isNonProdMaintenanceMode,
  isProdMaintenanceMode
} from "~enterprise/common/constants/dbKeys";
import { database } from "~enterprise/common/utils/firebase";
import { initializeHotjar } from "~enterprise/common/utils/monitoring";
import i18n from "~i18n";

import "../styles/global.css";
import Error from "./_error";

function MyApp({
  Component,
  pageProps,
  initialI18nStore,
  initialLanguage
}: MyAppPropsType) {
  const [newTheme, setNewTheme] = useState<Theme>(theme);
  useSSR(initialI18nStore, initialLanguage);
  const router = useRouter();

  useEffect(() => {
    if (!database) return;

    const isMaintenanceMode =
      process.env.NEXT_PUBLIC_ENTERPRISE_MODE === "prod"
        ? isProdMaintenanceMode
        : isNonProdMaintenanceMode;

    const maintenanceRef = ref(database, isMaintenanceMode);

    const unsubscribe = onValue(maintenanceRef, (snapshot) => {
      const isMaintenanceMode = snapshot.val();

      if (
        isMaintenanceMode === true &&
        router.pathname !== ROUTES.MAINTENANCE
      ) {
        router.push(ROUTES.MAINTENANCE);
      }
    });

    return () => unsubscribe();
  }, [router]);

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

  function RouteChangeLoader() {
    const router = useRouter();

    const [loading, setLoading] = useState(false);

    useEffect(() => {
      const handleStart = (url: string): void => {
        url !== router.asPath && setLoading(true);
      };

      const handleComplete = (): void => {
        setLoading(false);
      };

      router.events.on("routeChangeStart", handleStart);
      router.events.on("routeChangeComplete", handleComplete);
      router.events.on("routeChangeError", handleComplete);

      return () => {
        router.events.off("routeChangeStart", handleStart);
        router.events.off("routeChangeComplete", handleComplete);
        router.events.off("routeChangeError", handleComplete);
      };
    }, [router.asPath, router.events]);

    return <>{loading && <FullScreenLoader />}</>;
  }

  const shouldUseWebSocketProvider =
    process.env.NEXT_PUBLIC_MODE !== appModes.ENTERPRISE;

  return (
    <AuthProvider>
      {shouldUseWebSocketProvider ? (
        <WebSocketProvider>
          <TanStackProvider>
            <ThemeProvider theme={newTheme}>
              <I18nextProvider i18n={i18n}>
                <ToastProvider>
                  <ErrorBoundary FallbackComponent={Error}>
                    <RouteChangeLoader />
                    <BaseLayout>
                      <Component {...pageProps} />
                    </BaseLayout>
                  </ErrorBoundary>
                </ToastProvider>
                <ReactQueryDevtools initialIsOpen={false} position="bottom" />
              </I18nextProvider>
            </ThemeProvider>
          </TanStackProvider>
        </WebSocketProvider>
      ) : (
        <TanStackProvider>
          <ThemeProvider theme={newTheme}>
            <I18nextProvider i18n={i18n}>
              <ToastProvider>
                <ErrorBoundary FallbackComponent={Error}>
                  <RouteChangeLoader />
                  <BaseLayout>
                    <Component {...pageProps} />
                  </BaseLayout>
                </ErrorBoundary>
              </ToastProvider>
              <ReactQueryDevtools initialIsOpen={false} position="bottom" />
            </I18nextProvider>
          </ThemeProvider>
        </TanStackProvider>
      )}
    </AuthProvider>
  );
}

MyApp.getInitialProps = async (appContext: AppContext) => {
  const appProps = await App.getInitialProps(appContext);

  if (typeof window === "undefined") {
    return {
      ...appProps,
      initialI18nStore: i18n.store.data,
      initialLanguage: i18n.language
    };
  }

  return { ...appProps };
};

export default MyApp;
