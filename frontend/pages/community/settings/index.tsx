import { Box, Divider } from "@mui/material";
import { Tabs } from "@rootcodelabs/skapp-ui";
import { type NextPage } from "next";
import { useMemo, useState } from "react";

import { useAuth } from "~community/auth/providers/AuthProvider";
import ContentLayout from "~community/common/components/templates/ContentLayout/ContentLayout";
import { appModes } from "~community/common/constants/configs";
import { useTranslator } from "~community/common/hooks/useTranslator";
import {
  AdminTypes,
  EmployeeTypes,
  ManagerTypes
} from "~community/common/types/AuthTypes";
import { getSettingsTabs } from "~community/settings/utils/settingsTabsUtil";
import { useGetEnvironment } from "~enterprise/common/hooks/useGetEnvironment";
import { getEnterpriseSettingsTabs } from "~enterprise/settings/utils/settingsTabsUtil";

const Settings: NextPage = () => {
  const { user } = useAuth();
  const translateText = useTranslator("settings");
  const environment = useGetEnvironment();
  const isEnterprise = environment === appModes.ENTERPRISE;

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
          onTabChange={(id) => setActiveTab(id)}
          size="lg"
        />
        <Divider />
        {visibleTabs.find((tab) => tab.id === activeTab)?.component}
      </Box>
    </ContentLayout>
  );
};

export default Settings;
