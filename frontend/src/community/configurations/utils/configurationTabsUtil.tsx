import AttendanceConfiguration from "~community/attendance/components/organisms/AttendanceConfiguration/AttendanceConfiguration";
import { AdminTypes } from "~community/common/types/AuthTypes";
import UserRolesTable from "~community/configurations/components/molecules/UserRolesTable/UserRolesTable";
import CrmConfigurations from "~community/configurations/components/organisms/CrmConfigurations/CrmConfigurations";
import LeaveConfigurations from "~community/configurations/components/organisms/LeaveConfigurations/LeaveConfigurations";
import OrganizationConfigurations from "~community/configurations/components/organisms/OrganizationConfigurations/OrganizationConfigurations";
import PeopleConfigurations from "~community/configurations/components/organisms/PeopleConfigurations/PeopleConfigurations";
import TimeConfigurations from "~community/configurations/components/organisms/TimeConfigurations/TimeConfigurations";
import { ConfigurationTab } from "~community/configurations/types/ConfigurationTabTypes";
import CrmConfigurationsV2 from "~community/crm/v2/components/organisms/CrmConfigurations/CrmConfigurations";

// Flip to true to serve the CRM configurations tab from the normalized v2 store surface.
const isCrmConfigurationsV2 = false;

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
      component: <OrganizationConfigurations />,
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
      component: isCrmConfigurationsV2 ? (
        <CrmConfigurationsV2 />
      ) : (
        <CrmConfigurations />
      ),
      position: 7
    },
    {
      id: "people",
      label: translateText(["tabs", "people"]),
      requiredRoles: [AdminTypes.SUPER_ADMIN, AdminTypes.PEOPLE_ADMIN],
      component: <PeopleConfigurations />,
      position: 8
    }
  ];
};
