import ROUTES from "~community/common/constants/routes";
import {
  AdminTypes,
  EmployeeTypes,
  ManagerTypes,
  SuperAdminType
} from "~community/common/types/AuthTypes";

import { GlobalLoginMethod } from "../enums/CommonEnums";
import { IconName } from "../types/IconTypes";
import routes from "./data/routes";

type Role = AdminTypes | ManagerTypes | EmployeeTypes | SuperAdminType;

interface Props {
  userRoles: Role[] | undefined;
  globalLoginMethod: GlobalLoginMethod;
  tenantID?: string;
  organizationCalendarGoogleStatus?: boolean;
  organizationCalendarMicrosoftStatus?: boolean;
}

const getEnterpriseDrawerRoutes = ({
  userRoles,
  globalLoginMethod,
  organizationCalendarGoogleStatus,
  organizationCalendarMicrosoftStatus
}: Props) => {
  const userSpecificRoutes = routes.map((route) => {
    const isSuperAdmin = userRoles?.includes(AdminTypes.SUPER_ADMIN);

    const hasAdminOrManagerRoles = userRoles?.some((role) =>
      [...Object.values(AdminTypes), ...Object.values(ManagerTypes)].includes(
        role as AdminTypes | ManagerTypes
      )
    );

    if (route.name === "Settings") {
      if (
        !isSuperAdmin &&
        !hasAdminOrManagerRoles &&
        (globalLoginMethod === GlobalLoginMethod.GOOGLE ||
          globalLoginMethod === GlobalLoginMethod.MICROSOFT)
      ) {
        if (
          (globalLoginMethod === GlobalLoginMethod.GOOGLE &&
            organizationCalendarGoogleStatus === false) ||
          globalLoginMethod === GlobalLoginMethod.MICROSOFT
        ) {
          return null;
        }

        return {
          id: route?.id,
          name: "Integrations",
          url: ROUTES.SETTINGS.BASE,
          icon: IconName.INTEGRATIONS_ICON,
          hasSubTree: false,
          requiredAuthLevel: [
            EmployeeTypes.PEOPLE_EMPLOYEE,
            EmployeeTypes.LEAVE_EMPLOYEE,
            EmployeeTypes.ATTENDANCE_EMPLOYEE
          ],
          subTree: []
        };
      }

      return {
        id: "8",
        name: "Settings",
        url: ROUTES.SETTINGS.BASE,
        icon: IconName.SETTINGS_ICON,
        hasSubTree: false,
        requiredAuthLevel: [
          AdminTypes.SUPER_ADMIN,
          AdminTypes.PEOPLE_ADMIN,
          AdminTypes.LEAVE_ADMIN,
          AdminTypes.ATTENDANCE_ADMIN,
          ManagerTypes.PEOPLE_MANAGER,
          ManagerTypes.LEAVE_MANAGER,
          ManagerTypes.ATTENDANCE_MANAGER,
          EmployeeTypes.PEOPLE_EMPLOYEE,
          EmployeeTypes.LEAVE_EMPLOYEE,
          EmployeeTypes.ATTENDANCE_EMPLOYEE
        ],
        subTree: []
      };
    }

    return route;
  });

  return userSpecificRoutes;
};

export default getEnterpriseDrawerRoutes;
