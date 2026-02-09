import { Box, Divider } from "@mui/material";
import { Tabs } from "@rootcodelabs/skapp-ui";
import { type NextPage } from "next";
import { useMemo, useState } from "react";

import AttendanceConfiguration from "~community/attendance/components/organisms/AttendanceConfiguration/AttendanceConfiguration";
import { useAuth } from "~community/auth/providers/AuthProvider";
import ContentLayout from "~community/common/components/templates/ContentLayout/ContentLayout";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { AdminTypes } from "~community/common/types/AuthTypes";
import UserRolesTable from "~community/configurations/components/molecules/UserRolesTable/UserRolesTable";
import TimeConfigurations from "~community/configurations/components/organisms/TimeConfigurations/TimeConfigurations";
import InvoiceConfigurations from "~enterprise/configurations/components/organisms/InvoiceConfigurations/InvoiceConfigurations";
import SignConfigurations from "~enterprise/configurations/components/organisms/signConfigurations/signConfigurations";

enum ConfigurationTabIds {
  TIME = "time",
  ATTENDANCE = "attendance",
  SIGN = "sign",
  USER_ROLES = "user-roles",
  INVOICE = "invoice"
}

const Configurations: NextPage = () => {
  const { user } = useAuth();
  const translateText = useTranslator("configurations");

  const allTabs = useMemo(
    () => [
      {
        id: ConfigurationTabIds.TIME,
        label: translateText(["tabs", "time"]),
        requiredRoles: [AdminTypes.SUPER_ADMIN]
      },
      {
        id: ConfigurationTabIds.ATTENDANCE,
        label: translateText(["tabs", "attendance"]),
        requiredRoles: [AdminTypes.SUPER_ADMIN, AdminTypes.ATTENDANCE_ADMIN]
      },
      {
        id: ConfigurationTabIds.SIGN,
        label: translateText(["tabs", "sign"]),
        requiredRoles: [AdminTypes.SUPER_ADMIN, AdminTypes.ESIGN_ADMIN]
      },
      {
        id: ConfigurationTabIds.USER_ROLES,
        label: translateText(["tabs", "userRoles"]),
        requiredRoles: [AdminTypes.SUPER_ADMIN]
      },
      {
        id: ConfigurationTabIds.INVOICE,
        label: translateText(["tabs", "invoice"]),
        requiredRoles: [AdminTypes.SUPER_ADMIN, AdminTypes.INVOICE_ADMIN]
      }
    ],
    [translateText]
  );

  const visibleTabs = useMemo(() => {
    const userRoles = user?.roles || [];
    return allTabs.filter((tab) => {
      return userRoles.some((role) =>
        tab.requiredRoles.includes(role as AdminTypes)
      );
    });
  }, [allTabs, user?.roles]);

  const [activeTab, setActiveTab] = useState<ConfigurationTabIds>(
    visibleTabs[0]?.id as ConfigurationTabIds
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case ConfigurationTabIds.TIME:
        return <TimeConfigurations />;
      case ConfigurationTabIds.ATTENDANCE:
        return <AttendanceConfiguration />;
      case ConfigurationTabIds.SIGN:
        return <SignConfigurations />;
      case ConfigurationTabIds.USER_ROLES:
        return <UserRolesTable />;
      case ConfigurationTabIds.INVOICE:
        return <InvoiceConfigurations />;
      default:
        return null;
    }
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
          onTabChange={(id) => setActiveTab(id as ConfigurationTabIds)}
          size="lg"
        />
        <Divider />
        {renderTabContent()}
      </Box>
    </ContentLayout>
  );
};

export default Configurations;
