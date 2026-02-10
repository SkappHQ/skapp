import { AdminTypes } from "~community/common/types/AuthTypes";
import { SettingsTab } from "~community/settings/types/SettingsTabTypes";

import AccountSettings from "../components/organisms/AccountSettings/AccountSettings";

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
        AdminTypes.LEAVE_ADMIN
      ],
      component: <AccountSettings />,
      position: 1
    }
  ];
};
