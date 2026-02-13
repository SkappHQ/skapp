import AttendanceConfiguration from "~community/attendance/components/organisms/AttendanceConfiguration/AttendanceConfiguration";
import { AdminTypes } from "~community/common/types/AuthTypes";
import UserRolesTable from "~community/configurations/components/molecules/UserRolesTable/UserRolesTable";
import TimeConfigurations from "~community/configurations/components/organisms/TimeConfigurations/TimeConfigurations";
import { ConfigurationTab } from "~community/configurations/types/ConfigurationTabTypes";

export const getConfigurationTabs = (
  translateText: (keys: string[]) => string
): ConfigurationTab[] => {
  return [
    {
      id: "time",
      label: translateText(["tabs", "time"]),
      requiredRoles: [AdminTypes.SUPER_ADMIN],
      component: <TimeConfigurations />,
      position: 1
    },
    {
      id: "attendance",
      label: translateText(["tabs", "attendance"]),
      requiredRoles: [AdminTypes.SUPER_ADMIN, AdminTypes.ATTENDANCE_ADMIN],
      component: <AttendanceConfiguration />,
      position: 2
    },
    {
      id: "user-roles",
      label: translateText(["tabs", "userRoles"]),
      requiredRoles: [AdminTypes.SUPER_ADMIN, AdminTypes.PEOPLE_ADMIN],
      component: <UserRolesTable />,
      position: 4
    }
  ];
};
