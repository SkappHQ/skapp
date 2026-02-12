import { AdminTypes } from "~community/common/types/AuthTypes";
import { SettingsTab } from "~community/settings/types/SettingsTabTypes";

import AccountSettings from "../components/organisms/AccountSettings/AccountSettings";
import OrganizationSettings from "../components/organisms/OrganizationSettings/OrganizationSettings";

export const getSettingsTabs = (
  translateText: (keys: string[]) => string
): SettingsTab[] => {
  return [
    {
      id: "organization",
      label: translateText(["tabs", "organization"]),
      requiredRoles: [AdminTypes.SUPER_ADMIN],
      component: <OrganizationSettings />,
      position: 4
    },
    {
      id: "account",
      label: translateText(["tabs", "account"]),
      requiredRoles: [
        AdminTypes.SUPER_ADMIN,
        AdminTypes.PEOPLE_ADMIN,
        AdminTypes.ATTENDANCE_ADMIN,
        AdminTypes.LEAVE_ADMIN
      ],
      component: <AccountSettings />,
      position: 1
    }
  ];
};
