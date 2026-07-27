import AttendanceConfiguration from "~community/attendance/components/organisms/AttendanceConfiguration/AttendanceConfiguration";
import { User } from "~community/auth/utils/authUtils";
import { AdminTypes } from "~community/common/types/AuthTypes";
import UserRolesTable from "~community/configurations/components/molecules/UserRolesTable/UserRolesTable";
import CrmConfigurations from "~community/configurations/components/organisms/CrmConfigurations/CrmConfigurations";
import LeaveConfigurations from "~community/configurations/components/organisms/LeaveConfigurations/LeaveConfigurations";
import TimeConfigurations from "~community/configurations/components/organisms/TimeConfigurations/TimeConfigurations";
import WorkLocationsTable from "~community/configurations/components/organisms/WorkLocationsTable/WorkLocationsTable";
import { ConfigurationTab } from "~community/configurations/types/ConfigurationTabTypes";

export const hasRequiredRole = (
  tab: ConfigurationTab,
  userRoles: NonNullable<User["roles"]>
): boolean => tab.requiredRoles.some((role) => userRoles.includes(role));

export const getFallbackTabId = (
  visibleTabs: ConfigurationTab[],
  activeTabId?: string
): string | undefined => {
  if (activeTabId && visibleTabs.some((tab) => tab.id === activeTabId)) {
    return undefined;
  }
  return visibleTabs[0]?.id;
};

export const getConfigurationTabs = (
  translateText: (keys: string[]) => string
): ConfigurationTab[] => {
  return [
    {
      id: "organization",
      label: translateText(["tabs", "organization"]),
      requiredRoles: [
        AdminTypes.SUPER_ADMIN,
        AdminTypes.ATTENDANCE_ADMIN,
        AdminTypes.PEOPLE_ADMIN
      ],
      component: <WorkLocationsTable />,
      position: 2
    },
    {
      id: "time",
      label: translateText(["tabs", "time"]),
      requiredRoles: [AdminTypes.SUPER_ADMIN],
      component: <TimeConfigurations />,
      position: 3
    },
    {
      id: "attendance",
      label: translateText(["tabs", "attendance"]),
      requiredRoles: [AdminTypes.SUPER_ADMIN, AdminTypes.ATTENDANCE_ADMIN],
      component: <AttendanceConfiguration />,
      position: 1
    },
    {
      id: "leave",
      label: translateText(["tabs", "leave"]),
      requiredRoles: [AdminTypes.SUPER_ADMIN, AdminTypes.LEAVE_ADMIN],
      component: <LeaveConfigurations />,
      position: 1.5
    },
    {
      id: "user-roles",
      label: translateText(["tabs", "userRoles"]),
      requiredRoles: [AdminTypes.SUPER_ADMIN],
      component: <UserRolesTable />,
      position: 6
    },
    {
      id: "crm",
      label: translateText(["tabs", "crm"]),
      requiredRoles: [AdminTypes.SUPER_ADMIN, AdminTypes.CRM_ADMIN],
      component: <CrmConfigurations />,
      position: 7
    }
  ];
};
