import { NextRouter } from "next/router";

import { User } from "~community/auth/utils/authUtils";

import ROUTES, {
  employeeRestrictedRoutes,
  invoiceEmployeeRestrictedRoutes,
  managerRestrictedRoutes
} from "../../common/constants/routes";
import {
  AdminTypes,
  EmployeeTypes,
  ManagerTypes,
  SenderTypes,
  SuperAdminType
} from "../../common/types/AuthTypes";
import { allowedRoutes } from "../constants/routeConfigs";

// Helper function to normalize path by removing community/enterprise prefix
const normalizePath = (currentPath: string): string => {
  let normalizedPath = currentPath;
  if (normalizedPath.startsWith("/community")) {
    normalizedPath = normalizedPath.replace("/community", "");
  } else if (normalizedPath.startsWith("/enterprise")) {
    normalizedPath = normalizedPath.replace("/enterprise", "");
  }
  return normalizedPath;
};

// Helper function to check restricted routes
export const checkRestrictedRoutes = (
  currentPath: string,
  restrictedRoutes: string[],
  requiredRole: string,
  roles: string[]
): boolean => {
  const normalizedPath = normalizePath(currentPath);

  return (
    restrictedRoutes.some((url) => normalizedPath.startsWith(url)) &&
    !roles.includes(requiredRole)
  );
};

// Check if route is publicly accessible (no auth required)
export const isPublicRoute = (currentPath: string): boolean => {
  const normalizedPath = normalizePath(currentPath);

  return (
    normalizedPath === ROUTES.SIGN.DOCUMENT_ACCESS ||
    normalizedPath.startsWith(ROUTES.SIGN.SIGN) ||
    normalizedPath.startsWith(ROUTES.SIGN.INFO)
  );
};

// Validate and handle route protection
export const validateRouteAccess = (
  user: User,
  currentPath: string,
  router: NextRouter
): boolean => {
  const normalizedPath = normalizePath(currentPath);

  // Allow public routes
  if (isPublicRoute(normalizedPath)) {
    return true;
  }

  const roles: (
    | AdminTypes
    | ManagerTypes
    | EmployeeTypes
    | SuperAdminType
    | SenderTypes
  )[] = user?.roles || [];

  const isPasswordChangedForTheFirstTime =
    user?.isPasswordChangedForTheFirstTime;

  // Password change check
  if (
    !isPasswordChangedForTheFirstTime &&
    normalizedPath !== ROUTES.AUTH.RESET_PASSWORD
  ) {
    router.push(ROUTES.AUTH.RESET_PASSWORD);
    return false;
  } else if (
    isPasswordChangedForTheFirstTime &&
    normalizedPath === ROUTES.AUTH.RESET_PASSWORD
  ) {
    router.push(ROUTES.DASHBOARD.BASE);
    return false;
  }

  // Leave manager specific check
  if (
    roles.includes(ManagerTypes.LEAVE_MANAGER) &&
    !roles.includes(AdminTypes.LEAVE_ADMIN) &&
    normalizedPath === `${ROUTES.LEAVE.TEAM_TIME_SHEET_ANALYTICS}/reports`
  ) {
    router.push(ROUTES.AUTH.UNAUTHORIZED);
    return false;
  }

  // Dashboard redirect for attendance employees
  if (
    normalizedPath.startsWith(ROUTES.DASHBOARD.BASE) &&
    !roles.includes(EmployeeTypes.LEAVE_EMPLOYEE) &&
    !roles.includes(ManagerTypes.PEOPLE_MANAGER) &&
    !roles.includes(ManagerTypes.ATTENDANCE_MANAGER)
  ) {
    if (roles.includes(EmployeeTypes.ATTENDANCE_EMPLOYEE)) {
      router.push(ROUTES.TIMESHEET.MY_TIMESHEET);
      return false;
    }
  }

  // Check if user has access to the current route
  const isAllowed = roles.some((role) =>
    allowedRoutes[role]?.some((url) => normalizedPath.startsWith(url))
  );

  if (isAllowed) {
    // Check sign route access
    if (
      normalizedPath.includes(ROUTES.SIGN.BASE) &&
      !roles.includes(EmployeeTypes.ESIGN_EMPLOYEE)
    ) {
      router.push(ROUTES.AUTH.UNAUTHORIZED);
      return false;
    }

    // Check integrations tier
    if (
      normalizedPath.startsWith(ROUTES.SETTINGS.INTEGRATIONS) &&
      user?.tier !== "PRO"
    ) {
      router.push(ROUTES.AUTH.UNAUTHORIZED);
      return false;
    }

    // Check manager restricted routes
    if (
      checkRestrictedRoutes(
        normalizedPath,
        managerRestrictedRoutes,
        AdminTypes.PEOPLE_ADMIN,
        roles
      )
    ) {
      router.push(ROUTES.AUTH.UNAUTHORIZED);
      return false;
    }

    // Check invoice employee restricted routes
    if (
      checkRestrictedRoutes(
        normalizedPath,
        invoiceEmployeeRestrictedRoutes,
        ManagerTypes.INVOICE_MANAGER,
        roles
      )
    ) {
      router.push(ROUTES.AUTH.UNAUTHORIZED);
      return false;
    }

    // Check employee restricted routes
    if (
      checkRestrictedRoutes(
        normalizedPath,
        employeeRestrictedRoutes,
        ManagerTypes.PEOPLE_MANAGER,
        roles
      )
    ) {
      router.push(ROUTES.AUTH.UNAUTHORIZED);
      return false;
    }

    return true;
  }

  // No access to this route
  if (normalizedPath !== ROUTES.AUTH.UNAUTHORIZED) {
    router.push(ROUTES.AUTH.UNAUTHORIZED);
    return false;
  }

  return true;
};
