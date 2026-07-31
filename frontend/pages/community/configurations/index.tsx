import { Box, Divider } from "@mui/material";
import { Tabs } from "@rootcodelabs/skapp-ui";
import { type NextPage } from "next";
import { useRouter } from "next/router";
import { useMemo, useState } from "react";

import { useAuth } from "~community/auth/providers/AuthProvider";
import ContentLayout from "~community/common/components/templates/ContentLayout/ContentLayout";
import { appModes } from "~community/common/constants/configs";
import useSessionData from "~community/common/hooks/useSessionData";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { getConfigurationTabs } from "~community/configurations/utils/configurationTabsUtil";
import { useGetEnvironment } from "~enterprise/common/hooks/useGetEnvironment";
import PeopleConfigurations from "~enterprise/configurations/components/organisms/PeopleConfigurations/PeopleConfigurations";
import { getEnterpriseConfigurationTabs } from "~enterprise/configurations/utils/configurationTabsUtil";
import { useGetGoogleConnectionStatus } from "~enterprise/people/api/GoogleWorkspaceSyncApi";

const Configurations: NextPage = () => {
  const { user } = useAuth();
  const router = useRouter();
  const translateText = useTranslator("configurations");
  const environment = useGetEnvironment();
  const isEnterprise = environment === appModes.ENTERPRISE;
  const { isSuperAdmin } = useSessionData();

  const { connectionStatus: googleConnectionStatus } =
    useGetGoogleConnectionStatus(isEnterprise && isSuperAdmin);

  const allTabs = useMemo(
    () =>
      isEnterprise
        ? getEnterpriseConfigurationTabs(translateText)
        : getConfigurationTabs(translateText),
    [translateText, isEnterprise]
  );

  const visibleTabsBeforeOverride = useMemo(() => {
    const userRoles = user?.roles || [];
    return allTabs.filter((tab) => {
      if (!tab.requiredRoles.some((role) => userRoles.includes(role)))
        return false;
      if (tab.id === "people") return googleConnectionStatus.isConnected;
      return true;
    });
  }, [allTabs, user?.roles, googleConnectionStatus]);

  const [activeTab, setActiveTab] = useState(visibleTabsBeforeOverride[0]?.id);

  const handlePeopleDisconnected = () => {
    setActiveTab((current) => {
      if (current !== "people") return current;
      const fallback = allTabs.find((tab) => tab.id !== "people");
      return fallback ? fallback.id : current;
    });
  };

  const visibleTabs = useMemo(
    () =>
      visibleTabsBeforeOverride.map((tab) =>
        tab.id === "people"
          ? {
              ...tab,
              component: (
                <PeopleConfigurations onDisconnected={handlePeopleDisconnected} />
              )
            }
          : tab
      ),
    [visibleTabsBeforeOverride]
  );

  const handleTabChange = (id: string) => {
    setActiveTab(id);
    const basePath = router.asPath.split("?")[0];
    router.replace(
      { pathname: router.pathname, query: { ...router.query, tab: id } },
      `${basePath}?tab=${id}`,
      { shallow: true, scroll: false }
    );
  };

  return (
    <ContentLayout
      pageHead={translateText(["pageHead"])}
      title={translateText(["title"])}
      isDividerVisible={false}
    >
      <Box
        sx={{ display: "flex", flexDirection: "column", gap: 2.5, paddingY: 3 }}
      >
        <Tabs
          tabs={visibleTabs}
          activeTabId={activeTab}
          onTabChange={handleTabChange}
          size="lg"
        />
        <Divider />
        {visibleTabs.find((tab) => tab.id === activeTab)?.component}
      </Box>
    </ContentLayout>
  );
};

export default Configurations;
