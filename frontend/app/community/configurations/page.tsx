import { Box, Divider } from "@mui/material";
import { Tabs } from "@rootcodelabs/skapp-ui";
import { type NextPage } from "next";
import { useRouter } from "next/router";
import { useMemo, useState } from "react";

import { useAuth } from "~community/auth/providers/AuthProvider";
import ContentLayout from "~community/common/components/templates/ContentLayout/ContentLayout";
import { appModes } from "~community/common/constants/configs";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { replaceTabQueryParam } from "~community/common/utils/commonUtil";
import { getConfigurationTabs } from "~community/configurations/utils/configurationTabsUtil";
import useLeavePoliciesEnabled from "~community/leave/hooks/useLeavePoliciesEnabled";
import { useGetEnvironment } from "~enterprise/common/hooks/useGetEnvironment";
import { getEnterpriseConfigurationTabs } from "~enterprise/configurations/utils/configurationTabsUtil";

const Configurations: NextPage = () => {
  const { user } = useAuth();
  const router = useRouter();
  const translateText = useTranslator("configurations");
  const environment = useGetEnvironment();
  const isEnterprise = environment === appModes.ENTERPRISE;
  const { isLeavePoliciesEnabled } = useLeavePoliciesEnabled();

  const allTabs = useMemo(
    () =>
      isEnterprise
        ? getEnterpriseConfigurationTabs(translateText)
        : getConfigurationTabs(translateText),
    [translateText, isEnterprise]
  );

  const visibleTabs = useMemo(() => {
    const userRoles = user?.roles || [];
    return allTabs.filter(
      (tab) =>
        tab.requiredRoles.some((role) => userRoles.includes(role)) &&
        !(tab.id === "leave" && isLeavePoliciesEnabled)
    );
  }, [allTabs, user?.roles, isLeavePoliciesEnabled]);

  const [activeTab, setActiveTab] = useState(visibleTabs[0]?.id);

  const handleTabChange = (id: string) => {
    setActiveTab(id);
    replaceTabQueryParam(router.asPath, id);
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
