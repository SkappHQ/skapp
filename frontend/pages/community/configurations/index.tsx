import { type NextPage } from "next";
import { useMemo } from "react";

import AttendanceConfiguration from "~community/attendance/components/organisms/AttendanceConfiguration/AttendanceConfiguration";
import { useAuth } from "~community/auth/providers/AuthProvider";
import TabsContainer from "~community/common/components/molecules/Tabs/Tabs";
import ContentLayout from "~community/common/components/templates/ContentLayout/ContentLayout";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { AdminTypes } from "~community/common/types/AuthTypes";
import { TabItem } from "~community/common/types/TabsTypes";
import UserRolesTable from "~community/configurations/components/molecules/UserRolesTable/UserRolesTable";
import TimeConfigurations from "~community/configurations/components/organisms/TimeConfigurations/TimeConfigurations";
import InvoiceConfigurations from "~enterprise/configurations/components/organisms/InvoiceConfigurations/InvoiceConfigurations";
import SignConfigurations from "~enterprise/configurations/components/organisms/signConfigurations/signConfigurations";

const Configurations: NextPage = () => {
  const { user } = useAuth();
  const translateText = useTranslator("configurations");

  const allTabs = useMemo<Array<TabItem & { requiredRoles: AdminTypes[] }>>(
    () => [
      {
        label: "Time",
        content: <TimeConfigurations />,
        requiredRoles: [AdminTypes.SUPER_ADMIN]
      },
      {
        label: "Attendance",
        content: <AttendanceConfiguration />,
        requiredRoles: [AdminTypes.SUPER_ADMIN, AdminTypes.ATTENDANCE_ADMIN]
      },
      {
        label: "Sign",
        content: <SignConfigurations />,
        requiredRoles: [AdminTypes.SUPER_ADMIN, AdminTypes.ESIGN_ADMIN]
      },
      {
        label: "User Roles",
        content: <UserRolesTable />,
        requiredRoles: [AdminTypes.SUPER_ADMIN]
      },
      {
        label: "Invoice",
        content: <InvoiceConfigurations />,
        requiredRoles: [AdminTypes.SUPER_ADMIN, AdminTypes.INVOICE_ADMIN]
      }
    ],
    []
  );

  const visibleTabs = useMemo<TabItem[]>(() => {
    const userRoles = user?.roles || [];
    return allTabs
      .filter((tab) => {
        return userRoles.some((role) =>
          tab.requiredRoles.includes(role as AdminTypes)
        );
      })
      .map(({ label, content }) => ({ label, content }));
  }, [allTabs, user?.roles]);

  return (
    <ContentLayout
      pageHead={translateText(["pageHead"])}
      title={translateText(["title"])}
      isDividerVisible={true}
    >
      <TabsContainer tabs={visibleTabs} />
    </ContentLayout>
  );
};

export default Configurations;
