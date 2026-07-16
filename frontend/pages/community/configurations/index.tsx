import { Box, Divider } from "@mui/material";
import { Tabs } from "@rootcodelabs/skapp-ui";
import { type NextPage } from "next";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";

import { useAuth } from "~community/auth/providers/AuthProvider";
import ContentLayout from "~community/common/components/templates/ContentLayout/ContentLayout";
import { appModes } from "~community/common/constants/configs";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { AdminTypes } from "~community/common/types/AuthTypes";
import { getConfigurationTabs } from "~community/configurations/utils/configurationTabsUtil";
import { useGetEnvironment } from "~enterprise/common/hooks/useGetEnvironment";
import { getEnterpriseConfigurationTabs } from "~enterprise/configurations/utils/configurationTabsUtil";
import { useGetGoogleConnectionStatus } from "~enterprise/people/api/GoogleWorkspaceSyncApi";

const Configurations: NextPage = () => {
  const { user } = useAuth();
  const router = useRouter();
  const translateText = useTranslator("configurations");
  const environment = useGetEnvironment();
  const isEnterprise = environment === appModes.ENTERPRISE;
  const isSuperAdmin = !!user?.roles?.includes(AdminTypes.SUPER_ADMIN);

  const { data: googleConnectionStatus } = useGetGoogleConnectionStatus(
    isEnterprise && isSuperAdmin
  );

  const allTabs = useMemo(
    () =>
      isEnterprise
        ? getEnterpriseConfigurationTabs(translateText)
        : getConfigurationTabs(translateText),
    [translateText, isEnterprise]
  );

  const visibleTabs = useMemo(() => {
    const userRoles = user?.roles || [];
    return allTabs.filter((tab) => {
      const hasRequiredRole = userRoles.some((role) =>
        tab.requiredRoles.includes(role as AdminTypes)
      );
      if (!hasRequiredRole) return false;
      if (tab.id === "people") return !!googleConnectionStatus?.connected;
      return true;
    });
  }, [allTabs, user?.roles, googleConnectionStatus]);

  const [activeTab, setActiveTab] = useState(visibleTabs[0]?.id);

  useEffect(() => {
    if (!router.isReady || visibleTabs?.length === 0) return;
    const tabParam = router.query.tab as string | undefined;
    if (tabParam && visibleTabs.some((tab) => tab.id === tabParam)) {
      if (tabParam !== activeTab) {
        setActiveTab(tabParam);
      }
    }
  }, [router.isReady, router.query.tab, visibleTabs]);

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
