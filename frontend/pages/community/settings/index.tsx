import { Box, Divider } from "@mui/material";
import { Tabs } from "@rootcodelabs/skapp-ui";
import { type NextPage } from "next";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";

import { useAuth } from "~community/auth/providers/AuthProvider";
import ContentLayout from "~community/common/components/templates/ContentLayout/ContentLayout";
import { appModes } from "~community/common/constants/configs";
import ROUTES from "~community/common/constants/routes";
import { GlobalLoginMethod } from "~community/common/enums/CommonEnums";
import useSessionData from "~community/common/hooks/useSessionData";
import { useTranslator } from "~community/common/hooks/useTranslator";
import {
  AdminTypes,
  EmployeeTypes,
  ManagerTypes
} from "~community/common/types/AuthTypes";
import { replaceTabQueryParam } from "~community/common/utils/commonUtil";
import { getSettingsTabs } from "~community/settings/utils/settingsTabsUtil";
import { useGetEnvironment } from "~enterprise/common/hooks/useGetEnvironment";
import { useCommonEnterpriseStore } from "~enterprise/common/store/commonStore";
import { getEnterpriseSettingsTabs } from "~enterprise/settings/utils/settingsTabsUtil";

const Settings: NextPage = () => {
  const { user } = useAuth();
  const router = useRouter();
  const translateText = useTranslator("settings");
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

  useEffect(() => {
    if (!router.isReady) return;
    const tabParam = router.query.tab as string | undefined;
    if (tabParam && visibleTabs.some((tab) => tab.id === tabParam)) {
      setActiveTab(tabParam);
    }
  }, [router.isReady]);

  // Google Workspace OAuth always redirects the browser back to
  // /settings?google=connected (backend-hardcoded). Bounce straight to the
  // Directory import review screen instead of showing anything here. On
  // failure (denied consent or a failed token exchange) the backend instead
  // sends back ?google=error — forward that flag to the Directory page so
  // the failure toast shows up where the admin actually lands, not here.
  useEffect(() => {
    if (!router.isReady) return;
    if (router.query.google === "connected") {
      router.replace(ROUTES.PEOPLE.GOOGLE_IMPORT_REVIEW);
    } else if (router.query.google === "error") {
      router.replace({
        pathname: ROUTES.PEOPLE.DIRECTORY,
        query: { google: "error" }
      });
    }
  }, [router, router.isReady, router.query.google]);

  const handleTabChange = (id: string) => {
    setActiveTab(id);
    replaceTabQueryParam(router.asPath, id);
  };

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
