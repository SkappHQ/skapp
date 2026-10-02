import { Box, Divider } from "@mui/material";
import { Tabs } from "@rootcodelabs/skapp-ui";
import { type NextPage } from "next";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import { useShallow } from "zustand/react/shallow";

import { useAuth } from "~community/auth/providers/AuthProvider";
import ContentLayout from "~community/common/components/templates/ContentLayout/ContentLayout";
import { appModes } from "~community/common/constants/configs";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { replaceTabQueryParam } from "~community/common/utils/commonUtil";
import UnsavedConfigChangesModal from "~community/configurations/components/molecules/UnsavedConfigChangesModal/UnsavedConfigChangesModal";
import { useConfigurationStore } from "~community/configurations/stores/configurationStore";
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

  useEffect(() => {
    if (!router.isReady) return;
    const tabParam = router.query.tab as string | undefined;
    if (tabParam && visibleTabs.some((tab) => tab.id === tabParam)) {
      setActiveTab(tabParam);
    }
  }, [router.isReady, router.query.tab]);

  const { hasUnsavedChanges, setHasUnsavedChanges } = useConfigurationStore(
    useShallow((state) => ({
      hasUnsavedChanges: state.hasUnsavedChanges,
      setHasUnsavedChanges: state.setHasUnsavedChanges
    }))
  );

  const [pendingTab, setPendingTab] = useState<string | null>(null);

  const switchTab = (id: string) => {
    setActiveTab(id);
    replaceTabQueryParam(router.asPath, id);
  };

  const handleTabChange = (id: string) => {
    if (id === activeTab) return;
    if (hasUnsavedChanges) {
      setPendingTab(id);
      return;
    }
    switchTab(id);
  };

  const handleStayOnPage = () => {
    setPendingTab(null);
  };

  const handleLeaveWithoutSaving = () => {
    if (pendingTab) {
      setHasUnsavedChanges(false);
      switchTab(pendingTab);
    }
    setPendingTab(null);
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
        <UnsavedConfigChangesModal
          isOpen={pendingTab !== null}
          onStay={handleStayOnPage}
          onLeave={handleLeaveWithoutSaving}
        />
      </Box>
    </ContentLayout>
  );
};

export default Configurations;
