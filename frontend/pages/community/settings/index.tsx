import { Box, Divider } from "@mui/material";
import { Tabs } from "@rootcodelabs/skapp-ui";
import { useQueryClient } from "@tanstack/react-query";
import { type NextPage } from "next";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";

import { useAuth } from "~community/auth/providers/AuthProvider";
import ContentLayout from "~community/common/components/templates/ContentLayout/ContentLayout";
import { OBOARDING_LOGOCOLORLOADER_DURATION } from "~community/common/constants/commonConstants";
import { appModes } from "~community/common/constants/configs";
import ROUTES from "~community/common/constants/routes";
import { SUCCESS } from "~community/common/constants/stringConstants";
import { GlobalLoginMethod } from "~community/common/enums/CommonEnums";
import { ToastType } from "~community/common/enums/ComponentEnums";
import useSessionData from "~community/common/hooks/useSessionData";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import {
  AdminTypes,
  EmployeeTypes,
  ManagerTypes
} from "~community/common/types/AuthTypes";
import { getSettingsTabs } from "~community/settings/utils/settingsTabsUtil";
import LogoColorLoader from "~enterprise/common/components/molecules/LogoColorLoader/LogoColorLoader";
import { useGetEnvironment } from "~enterprise/common/hooks/useGetEnvironment";
import { useCommonEnterpriseStore } from "~enterprise/common/store/commonStore";
import { getEnterpriseSettingsTabs } from "~enterprise/settings/utils/settingsTabsUtil";

const Settings: NextPage = () => {
  const { user } = useAuth();
  const router = useRouter();
  const translateText = useTranslator("settings");
  const billingTranslateText = useTranslator("settingEnterprise", "billing");
  const { setToastMessage } = useToast();
  const queryClient = useQueryClient();
  const environment = useGetEnvironment();
  const isEnterprise = environment === appModes.ENTERPRISE;
  const { isEmployee } = useSessionData();

  const { globalLoginMethod } = useCommonEnterpriseStore((state) => ({
    globalLoginMethod: state.globalLoginMethod
  }));

  const shouldShowIntegrationsTitle =
    (globalLoginMethod === GlobalLoginMethod.GOOGLE ||
      globalLoginMethod === GlobalLoginMethod.MICROSOFT) &&
    isEmployee;

  const pageTitle = shouldShowIntegrationsTitle
    ? translateText(["integrationTitle"])
    : translateText(["title"]);

  const allTabs = useMemo(
    () =>
      isEnterprise
        ? getEnterpriseSettingsTabs(translateText)
        : getSettingsTabs(translateText),
    [translateText, isEnterprise]
  );

  const visibleTabs = useMemo(() => {
    const userRoles = user?.roles || [];
    return allTabs.filter((tab) => {
      return userRoles.some((role) =>
        tab.requiredRoles.includes(
          role as AdminTypes | ManagerTypes | EmployeeTypes
        )
      );
    });
  }, [allTabs, user?.roles]);

  const [activeTab, setActiveTab] = useState(visibleTabs[0]?.id);

  const [showLoader, setShowLoader] = useState(() => {
    if (typeof globalThis !== "undefined" && globalThis.location) {
      const params = new URLSearchParams(globalThis.location.search);
      return params.get("status") === SUCCESS;
    }
    return false;
  });

  // Handle billing cancel notification
  useEffect(() => {
    if (typeof globalThis !== "undefined" && globalThis.location) {
      const params = new URLSearchParams(globalThis.location.search);
      if (params.get("status") === "cancel") {
        setToastMessage({
          toastType: ToastType.ERROR,
          title: billingTranslateText(["subscriptionErrorToastTitle"]),
          description: billingTranslateText([
            "subscriptionErrorToastDescription"
          ]),
          open: true
        });
      }
    }
  }, [setToastMessage, billingTranslateText]);

  // Handle billing success loader + toast + reset
  useEffect(() => {
    if (showLoader) {
      const params = new URLSearchParams(globalThis.location?.search || "");
      if (params.get("status") === SUCCESS) {
        const timer = setTimeout(() => {
          setShowLoader(false);
          setToastMessage({
            toastType: ToastType.SUCCESS,
            title: billingTranslateText(["subscriptionSuccessToastTitle"]),
            description: billingTranslateText([
              "subscriptionSuccessToastDescription"
            ]),
            open: true
          });
          void queryClient.invalidateQueries();
          void router.push(`${ROUTES.SETTINGS.BASE}?tab=billing`);
        }, OBOARDING_LOGOCOLORLOADER_DURATION);
        return () => clearTimeout(timer);
      } else {
        setShowLoader(false);
      }
    }
  }, [showLoader, billingTranslateText, setToastMessage, queryClient, router]);

  useEffect(() => {
    if (!router.isReady) return;
    const tabParam = router.query.tab as string | undefined;
    if (tabParam && visibleTabs.some((tab) => tab.id === tabParam)) {
      setActiveTab(tabParam);
    }
  }, [router.isReady]);

  const handleTabChange = (id: string) => {
    setActiveTab(id);
    const basePath = router.asPath.split("?")[0];
    globalThis.history.replaceState(null, "", `${basePath}?tab=${id}`);
  };

  if (showLoader) {
    return <LogoColorLoader />;
  }

  return (
    <ContentLayout
      pageHead={translateText(["pageHead"])}
      title={pageTitle}
      isDividerVisible={false}
    >
      <Box
        sx={{ display: "flex", flexDirection: "column", gap: 2.5, paddingY: 3 }}
      >
        {visibleTabs.length > 1 && (
          <Tabs
            tabs={visibleTabs}
            activeTabId={activeTab}
            onTabChange={handleTabChange}
            size="lg"
          />
        )}
        <Divider />
        {visibleTabs.find((tab) => tab.id === activeTab)?.component}
      </Box>
    </ContentLayout>
  );
};

export default Settings;
