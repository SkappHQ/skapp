import ROUTES from "~community/common/constants/routes";
import { GlobalLoginMethod } from "~community/common/enums/CommonEnums";
import {
  AdminTypes,
  EmployeeTypes,
  ManagerTypes,
  SenderTypes,
  SuperAdminType
} from "~community/common/types/AuthTypes";
import routes from "~community/common/utils/data/routes";
import getEnterpriseDrawerRoutes from "~community/common/utils/getEnterpriseDrawerRoutes";
import { TierEnum } from "~enterprise/common/enums/Common";

type Role = AdminTypes | ManagerTypes | EmployeeTypes | SuperAdminType;

interface Props {
  userRoles: Role[] | undefined;
  tier: string;
  isEnterprise: boolean;
  globalLoginMethod: GlobalLoginMethod;
  tenantID?: string;
  organizationCalendarGoogleStatus?: boolean;
  organizationCalendarMicrosoftStatus?: boolean;
}

const getDrawerRoutes = ({
  userRoles,
  tier,
  isEnterprise,
  globalLoginMethod,
  tenantID,
  organizationCalendarGoogleStatus,
  organizationCalendarMicrosoftStatus
}: Props) => {
  const allRoutes = isEnterprise
    ? getEnterpriseDrawerRoutes({
        userRoles,
        globalLoginMethod,
        tenantID,
        organizationCalendarGoogleStatus,
        organizationCalendarMicrosoftStatus
      })
    : routes;

  const userSpecificRoutes = allRoutes
    ?.map((route) => {
      const isAuthorized = route?.requiredAuthLevel?.some((requiredRole) =>
        userRoles?.includes(requiredRole as Role)
      );

      if (route?.name === "Dashboard") {
        if (
          !userRoles?.includes(EmployeeTypes.LEAVE_EMPLOYEE) &&
          !userRoles?.includes(ManagerTypes.PEOPLE_MANAGER) &&
          !userRoles?.includes(ManagerTypes.ATTENDANCE_MANAGER)
        ) {
          return null;
        }
        const isLeaveEmployeeWithoutManagerOrAdminRole =
          userRoles?.includes(EmployeeTypes.LEAVE_EMPLOYEE) &&
          !userRoles?.some((role) =>
            [ManagerTypes.LEAVE_MANAGER, AdminTypes.LEAVE_ADMIN].includes(
              role as ManagerTypes | AdminTypes
            )
          );

        if (isLeaveEmployeeWithoutManagerOrAdminRole) {
          const hasAdditionalRolesForLeaveEmployee = userRoles?.some((role) =>
            [
              ManagerTypes.PEOPLE_MANAGER,
              ManagerTypes.ATTENDANCE_MANAGER,
              EmployeeTypes.LEAVE_EMPLOYEE
            ].includes(role as ManagerTypes)
          );

          if (hasAdditionalRolesForLeaveEmployee) {
            return {
              id: route?.id,
              name: route?.name,
              url: ROUTES.DASHBOARD.BASE,
              icon: route?.icon,
              hasSubTree: false,
              badge: route?.badge
            };
          }

          return;
        }
      }

      if (route?.name === "People") {
        const isNotPeopleEmployee = userRoles?.some((role) =>
          [AdminTypes.PEOPLE_ADMIN, ManagerTypes.PEOPLE_MANAGER].includes(
            role as AdminTypes | ManagerTypes
          )
        );

        if (
          !isNotPeopleEmployee &&
          userRoles?.includes(EmployeeTypes.PEOPLE_EMPLOYEE)
        ) {
          return {
            id: route?.id,
            name: route?.name,
            url: ROUTES.PEOPLE.DIRECTORY,
            icon: route?.icon,
            hasSubTree: false,
            badge: route?.badge
          };
        }
      }

      if (route?.name === "Timesheet") {
        if (!userRoles?.includes(EmployeeTypes.ATTENDANCE_EMPLOYEE)) {
          return null;
        }

        const isNotAttendanceEmployee = userRoles?.some((role) =>
          [
            AdminTypes.ATTENDANCE_ADMIN,
            ManagerTypes.ATTENDANCE_MANAGER
          ].includes(role as AdminTypes | ManagerTypes)
        );

        if (
          !isNotAttendanceEmployee &&
          userRoles?.includes(EmployeeTypes.ATTENDANCE_EMPLOYEE)
        ) {
          return {
            id: route?.id,
            name: route?.name,
            url: ROUTES.TIMESHEET.MY_TIMESHEET,
            icon: route?.icon,
            hasSubTree: false,
            badge: route?.badge
          };
        }
      }

      if (route?.name === "Leave") {
        if (!userRoles?.includes(EmployeeTypes.LEAVE_EMPLOYEE)) {
          return null;
        }
        const isLeaveEmployeeWithoutManagerOrAdminRole =
          userRoles?.includes(EmployeeTypes.LEAVE_EMPLOYEE) &&
          !userRoles?.some((role) =>
            [ManagerTypes.LEAVE_MANAGER, AdminTypes.LEAVE_ADMIN].includes(
              role as ManagerTypes | AdminTypes
            )
          );

        if (isLeaveEmployeeWithoutManagerOrAdminRole) {
          const hasAdditionalRolesForLeaveEmployee =
            userRoles?.includes(EmployeeTypes.LEAVE_EMPLOYEE) &&
            userRoles?.some((role) =>
              [
                ManagerTypes.PEOPLE_MANAGER,
                ManagerTypes.ATTENDANCE_MANAGER,
                AdminTypes.PEOPLE_ADMIN,
                AdminTypes.ATTENDANCE_ADMIN
              ].includes(role as ManagerTypes | AdminTypes)
            );

          if (hasAdditionalRolesForLeaveEmployee) {
            return {
              id: route?.id,
              name: "My Leave Requests",
              url: ROUTES.LEAVE.MY_REQUESTS,
              icon: route?.icon,
              hasSubTree: false,
              badge: route?.badge
            };
          }

          return;
        }
      }

      if (route?.name === "Invoices") {
        const isInvoiceManager = userRoles?.includes(
          ManagerTypes.INVOICE_MANAGER
        );

        if (!isInvoiceManager) {
          return null;
        }
      }

      if (route?.name === "Settings") {
        const isSuperAdmin = userRoles?.includes(AdminTypes.SUPER_ADMIN);

        if (isSuperAdmin) {
          const subRoutes = route?.subTree?.filter((subRoute) => {
            if (subRoute.name === "Integrations") {
              return tier === TierEnum.PRO;
            }

            return subRoute.requiredAuthLevel?.some((requiredRole) =>
              userRoles?.includes(requiredRole as Role)
            );
          });

          return {
            id: route?.id,
            name: route?.name,
            url: ROUTES.SETTINGS.BASE,
            icon: route?.icon,
            hasSubTree: route?.hasSubTree,
            subTree: subRoutes,
            badge: route?.badge
          };
        }

        if (!isSuperAdmin) {
          return {
            id: route?.id,
            name: route?.name,
            url: ROUTES.SETTINGS.ACCOUNT,
            icon: route?.icon,
            hasSubTree: false,
            badge: route?.badge
          };
        }
      }

      if (route?.name === "Configurations") {
        const isSuperAdmin = userRoles?.some((role) =>
          [AdminTypes.SUPER_ADMIN].includes(role as AdminTypes)
        );

        if (isSuperAdmin) {
          const subRoutes = route?.subTree?.filter((subRoute) => {
            if (
              subRoute.name === "Attendance" &&
              !userRoles?.includes(EmployeeTypes.ATTENDANCE_EMPLOYEE)
            ) {
              return false;
            }
            if (
              subRoute.name === "Sign" &&
              !userRoles?.includes(EmployeeTypes.ESIGN_EMPLOYEE)
            ) {
              return false;
            }
            return subRoute.requiredAuthLevel?.some((requiredRole) =>
              userRoles?.includes(requiredRole as Role)
            );
          });

          return {
            id: route?.id,
            name: route?.name,
            url: ROUTES.CONFIGURATIONS.BASE,
            icon: route?.icon,
            hasSubTree: route?.hasSubTree,
            subTree: subRoutes
          };
        }

        const isEsignAdmin = userRoles?.some((role) =>
          [AdminTypes.ESIGN_ADMIN].includes(role as AdminTypes)
        );

        if (isEsignAdmin) {
          const subRoutes = route?.subTree?.filter((subRoute) => {
            if (
              subRoute.name === "Sign" &&
              !userRoles?.includes(EmployeeTypes.ESIGN_EMPLOYEE)
            ) {
              return false;
            }
            return subRoute.requiredAuthLevel?.some((requiredRole) =>
              userRoles?.includes(requiredRole as Role)
            );
          });

          return {
            id: route?.id,
            name: route?.name,
            url: ROUTES.CONFIGURATIONS.BASE,
            icon: route?.icon,
            hasSubTree: route?.hasSubTree,
            subTree: subRoutes,
            badge: route?.badge
          };
        }
      }

      if (route?.name === "Sign") {
        if (!userRoles?.includes(EmployeeTypes.ESIGN_EMPLOYEE)) {
          return null;
        }

        const isEsignEmployeeWithoutManagerOrAdminRole = userRoles?.some(
          (role) =>
            [SenderTypes.ESIGN_SENDER, AdminTypes.ESIGN_ADMIN].includes(
              role as AdminTypes | SenderTypes
            )
        );

        if (!isEsignEmployeeWithoutManagerOrAdminRole) {
          return {
            id: route?.id,
            name: "Inbox",
            url: ROUTES.SIGN.INBOX,
            icon: route?.icon,
            hasSubTree: false,
            badge: route?.badge
          };
        }
      }

      if (isAuthorized && route?.hasSubTree) {
        const subRoutes = route?.subTree?.filter((subRoute) =>
          subRoute.requiredAuthLevel?.some((requiredRole) =>
            userRoles?.includes(requiredRole as Role)
          )
        );

        if (subRoutes && subRoutes?.length > 0) {
          return {
            id: route?.id,
            name: route?.name,
            url: route?.url,
            icon: route?.icon,
            hasSubTree: route?.hasSubTree,
            subTree: subRoutes,
            badge: route?.badge
          };
        }
      } else if (isAuthorized) {
        return {
          id: route?.id,
          name: route?.name,
          url: route?.url,
          icon: route?.icon,
          hasSubTree: route?.hasSubTree,
          badge: route?.badge
        };
      }
    })
    .filter(Boolean);

  return userSpecificRoutes;
};

export default getDrawerRoutes;
