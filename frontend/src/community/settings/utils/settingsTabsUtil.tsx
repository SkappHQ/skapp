import { AdminTypes, EmployeeTypes, ManagerTypes } from "~community/common/types/AuthTypes";
import { SettingsTab } from "~community/settings/types/SettingsTabTypes";

import AccountSettings from "../components/organisms/AccountSettings/AccountSettings";
import OrganizationSettings from "../components/organisms/OrganizationSettings/OrganizationSettings";

export const getSettingsTabs = (
  translateText: (keys: string[]) => string
): SettingsTab[] => {
  return [
    {
      id: "account",
      label: translateText(["tabs", "account"]),
      requiredRoles: [
        AdminTypes.SUPER_ADMIN,
        AdminTypes.PEOPLE_ADMIN,
        AdminTypes.ATTENDANCE_ADMIN,
        AdminTypes.LEAVE_ADMIN,
        ManagerTypes.PEOPLE_MANAGER,
        ManagerTypes.LEAVE_MANAGER,
        ManagerTypes.ATTENDANCE_MANAGER,
        EmployeeTypes.PEOPLE_EMPLOYEE,
        EmployeeTypes.LEAVE_EMPLOYEE,
        EmployeeTypes.ATTENDANCE_EMPLOYEE
      ],
      component: <AccountSettings />,
      position: 1
    },
    {
      id: "organization",
      label: translateText(["tabs", "organization"]),
      requiredRoles: [AdminTypes.SUPER_ADMIN],
      component: <OrganizationSettings />,
      position: 4
    }
  ];
};
