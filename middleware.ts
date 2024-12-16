import { NextRequestWithAuth, withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

import ROUTES from "~community/common/constants/routes";
import {
  AdminTypes,
  EmployeeTypes,
  ManagerTypes,
  ROLE_SUPER_ADMIN,
  SuperAdminType
} from "~community/common/types/AuthTypes";

// Define common routes shared by all roles
const commonRoutes = [
  ROUTES.DASHBOARD.BASE,
  ROUTES.SETTINGS,
  ROUTES.AUTH.RESET_PASSWORD,
  ROUTES.AUTH.UNAUTHORIZED,
  ROUTES.PEOPLE.ACCOUNT,
  ROUTES.NOTIFICATIONS
];

// Specific role-based routes
const superAdminRoutes = {
  [ROLE_SUPER_ADMIN]: [ROUTES.ORGANIZATION.SETUP, ROUTES.CONFIGURATIONS.BASE]
};

const adminRoutes = {
  [AdminTypes.PEOPLE_ADMIN]: [ROUTES.PEOPLE.BASE],
  [AdminTypes.LEAVE_ADMIN]: [ROUTES.LEAVE.BASE],
  [AdminTypes.ATTENDANCE_ADMIN]: [
    ROUTES.TIMESHEET.BASE,
    ROUTES.CONFIGURATIONS.ATTENDANCE
  ]
};

const managerRoutes = {
  [ManagerTypes.PEOPLE_MANAGER]: [ROUTES.PEOPLE.BASE],
  [ManagerTypes.LEAVE_MANAGER]: [
    ROUTES.LEAVE.LEAVE_REQUESTS,
    ROUTES.LEAVE.TEAM_TIME_SHEET_ANALYTICS
  ],
  [ManagerTypes.ATTENDANCE_MANAGER]: [
    ROUTES.TIMESHEET.ALL_TIMESHEETS,
    ROUTES.TIMESHEET.TIMESHEET_ANALYTICS
  ]
};

const employeeRoutes = {
  [EmployeeTypes.PEOPLE_EMPLOYEE]: [ROUTES.PEOPLE.DIRECTORY, ...commonRoutes],
  [EmployeeTypes.LEAVE_EMPLOYEE]: [ROUTES.LEAVE.MY_REQUESTS, ...commonRoutes],
  [EmployeeTypes.ATTENDANCE_EMPLOYEE]: [
    ROUTES.TIMESHEET.MY_TIMESHEET,
    ...commonRoutes
  ]
};

// Merging all routes into one allowedRoutes object
const allowedRoutes: Record<
  AdminTypes | ManagerTypes | EmployeeTypes | SuperAdminType,
  string[]
> = {
  ...superAdminRoutes,
  ...adminRoutes,
  ...managerRoutes,
  ...employeeRoutes
};

export default withAuth(
  async function middleware(request: NextRequestWithAuth) {
    const { token } = request.nextauth;

    const roles: (
      | AdminTypes
      | ManagerTypes
      | EmployeeTypes
      | SuperAdminType
    )[] = token?.roles || [];

    const isPasswordChangedForTheFirstTime =
      token?.isPasswordChangedForTheFirstTime;
    if (
      !(
        isPasswordChangedForTheFirstTime ||
        request.nextUrl.pathname === ROUTES.AUTH.RESET_PASSWORD
      )
    ) {
      return NextResponse.redirect(
        new URL(ROUTES.AUTH.RESET_PASSWORD, request.url)
      );
    } else if (
      isPasswordChangedForTheFirstTime &&
      request.nextUrl.pathname === ROUTES.AUTH.RESET_PASSWORD
    ) {
      return NextResponse.redirect(new URL(ROUTES.DASHBOARD.BASE, request.url));
    }

    const isAllowed = roles.some((role) =>
      allowedRoutes[role]?.some((url) =>
        request.nextUrl.pathname.startsWith(url)
      )
    );

    if (isAllowed) {
      return NextResponse.next();
    }

    // Redirect to /unauthorized if no access
    return NextResponse.redirect(
      new URL(ROUTES.AUTH.UNAUTHORIZED, request.url)
    );
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token
    }
  }
);

// Define the matcher patterns for this middleware
export const config = {
  matcher: [
    // All community routes
    "/community/:path*",
    // Super admin routes
    "/setup-organization/:path*",
    // Common routes
    "/dashboard/:path*",
    "/configurations/:path*",
    "/settings",
    "/notifications",
    "/account",
    "/reset-password",
    "/unauthorized",
    // Module routes
    "/leave/:path*",
    "/people/:path*",
    "/timesheet/:path*"
  ]
};
