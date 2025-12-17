import { NextRequestWithAuth, withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

import ROUTES, {
  employeeRestrictedRoutes,
  invoiceEmployeeRestrictedRoutes,
  managerRestrictedRoutes
} from "~community/common/constants/routes";
import {
  AdminTypes,
  EmployeeTypes,
  ManagerTypes,
  ROLE_SUPER_ADMIN,
  SenderTypes,
  SuperAdminType
} from "~community/common/types/AuthTypes";
import { checkRestrictedRoutesAndRedirect } from "~community/common/utils/commonUtil";

// Define common routes shared by all roles
const commonRoutes = [
  ROUTES.DASHBOARD.BASE,
  ROUTES.SETTINGS.BASE,
  ROUTES.AUTH.RESET_PASSWORD,
  ROUTES.AUTH.UNAUTHORIZED,
  ROUTES.PEOPLE.ACCOUNT,
  ROUTES.PEOPLE.USER_ACCOUNT,
  ROUTES.NOTIFICATIONS,
  ROUTES.INTEGRATIONS,
  ROUTES.AUTH.VERIFY_RESET_PASSWORD,
  ROUTES.PROJECTS.BASE,
  ROUTES.PROJECTS.GUESTS
];

// Specific role-based routes
const superAdminRoutes = {
  [ROLE_SUPER_ADMIN]: [
    ROUTES.ORGANIZATION.SETUP,
    ROUTES.CONFIGURATIONS.BASE,
    ROUTES.ORGANIZATION.MODULE_SELECTION,
    ROUTES.SETTINGS.BILLING,
    ROUTES.SIGN.CONTACTS,
    ROUTES.SIGN.CREATE_DOCUMENT,
    ROUTES.SIGN.FOLDERS,
    ROUTES.SIGN.INBOX,
    ROUTES.SIGN.SENT,
    ROUTES.AUTH.VERIFY,
    ROUTES.AUTH.VERIFY_SUCCESS,
    ROUTES.SETTINGS.MODULES,
    ROUTES.SETTINGS.PAYMENT,
    ROUTES.REMOVE_PEOPLE,
    ROUTES.SUBSCRIPTION,
    ROUTES.PROJECTS.BASE,
    ROUTES.PROJECTS.GUESTS,
    ROUTES.INVOICE.BASE,
    ROUTES.INVOICE.ALL_INVOICES,
    ROUTES.INVOICE.CUSTOMERS.BASE,
    ROUTES.SUBSCRIPTION,
    ROUTES.CONFIGURATIONS.INVOICE
  ]
};

const adminRoutes = {
  [AdminTypes.PEOPLE_ADMIN]: [ROUTES.PEOPLE.BASE],
  [AdminTypes.LEAVE_ADMIN]: [ROUTES.LEAVE.BASE],
  [AdminTypes.ATTENDANCE_ADMIN]: [
    ROUTES.TIMESHEET.BASE,
    ROUTES.CONFIGURATIONS.ATTENDANCE
  ],
  [AdminTypes.ESIGN_ADMIN]: [
    ROUTES.SIGN.CONTACTS,
    ROUTES.SIGN.CREATE_DOCUMENT,
    ROUTES.SIGN.FOLDERS,
    ROUTES.SIGN.INBOX,
    ROUTES.SIGN.SENT,
    ROUTES.SIGN.SIGN,
    ROUTES.SIGN.INFO,
    ROUTES.SIGN.COMPLETE,
    ROUTES.CONFIGURATIONS.SIGN
  ],
  [AdminTypes.INVOICE_ADMIN]: [
    ROUTES.INVOICE.BASE,
    ROUTES.INVOICE.ALL_INVOICES,
    ROUTES.INVOICE.CUSTOMERS.BASE,
    ROUTES.CONFIGURATIONS.INVOICE,
    ROUTES.INVOICE.CREATE.BASE
  ]
};

const managerRoutes = {
  [ManagerTypes.PEOPLE_MANAGER]: [ROUTES.PEOPLE.BASE],
  [ManagerTypes.LEAVE_MANAGER]: [
    ROUTES.LEAVE.LEAVE_REQUESTS,
    ROUTES.LEAVE.TEAM_TIME_SHEET_ANALYTICS,
    ROUTES.LEAVE.LEAVE_PENDING,
    ROUTES.PEOPLE.INDIVIDUAL
  ],
  [ManagerTypes.ATTENDANCE_MANAGER]: [
    ROUTES.TIMESHEET.ALL_TIMESHEETS,
    ROUTES.TIMESHEET.TIMESHEET_ANALYTICS,
    ROUTES.PEOPLE.INDIVIDUAL
  ],
  [SenderTypes.ESIGN_SENDER]: [
    ROUTES.SIGN.CONTACTS,
    ROUTES.SIGN.CREATE_DOCUMENT,
    ROUTES.SIGN.FOLDERS,
    ROUTES.SIGN.INBOX,
    ROUTES.SIGN.SENT,
    ROUTES.SIGN.SIGN,
    ROUTES.SIGN.INFO,
    ROUTES.SIGN.COMPLETE
  ],
  [ManagerTypes.INVOICE_MANAGER]: [
    ROUTES.INVOICE.BASE,
    ROUTES.INVOICE.ALL_INVOICES,
    ROUTES.INVOICE.CUSTOMERS.BASE,
    ROUTES.INVOICE.CREATE.BASE
  ]
};

const employeeRoutes = {
  [EmployeeTypes.PEOPLE_EMPLOYEE]: [
    ROUTES.PEOPLE.DIRECTORY,
    ROUTES.PEOPLE.INDIVIDUAL,
    ROUTES.PEOPLE.BASE,
    ...commonRoutes
  ],
  [EmployeeTypes.LEAVE_EMPLOYEE]: [ROUTES.LEAVE.MY_REQUESTS, ...commonRoutes],
  [EmployeeTypes.ATTENDANCE_EMPLOYEE]: [
    ROUTES.TIMESHEET.MY_TIMESHEET,
    ...commonRoutes
  ],
  [EmployeeTypes.ESIGN_EMPLOYEE]: [
    ROUTES.SIGN.INBOX,
    ROUTES.SIGN.SIGN,
    ROUTES.SIGN.INFO,
    ROUTES.SIGN.COMPLETE,
    ...commonRoutes
  ]
};

const senderRoutes = {
  [SenderTypes.ESIGN_SENDER]: [
    ROUTES.SIGN.CONTACTS,
    ROUTES.SIGN.CREATE_DOCUMENT,
    ROUTES.SIGN.FOLDERS,
    ROUTES.SIGN.INBOX,
    ROUTES.SIGN.SENT,
    ROUTES.SIGN.SIGN,
    ROUTES.SIGN.INFO,
    ROUTES.SIGN.COMPLETE
  ]
};

// Merging all routes into one allowedRoutes object
const allowedRoutes: Record<
  AdminTypes | ManagerTypes | EmployeeTypes | SuperAdminType | SenderTypes,
  string[]
> = {
  ...superAdminRoutes,
  ...adminRoutes,
  ...managerRoutes,
  ...employeeRoutes,
  ...senderRoutes,
  ...commonRoutes
};

export default withAuth(
  async function middleware(request: NextRequestWithAuth) {
    const currentPath = request.nextUrl.pathname;

    if (
      currentPath === ROUTES.SIGN.DOCUMENT_ACCESS ||
      currentPath.startsWith(ROUTES.SIGN.SIGN) ||
      currentPath.startsWith(ROUTES.SIGN.INFO)
    ) {
      return NextResponse.next();
    }
    const { token } = request.nextauth;

    const roles: (
      | AdminTypes
      | ManagerTypes
      | EmployeeTypes
      | SuperAdminType
      | SenderTypes
    )[] = token?.roles || [];

    const isPasswordChangedForTheFirstTime =
      token?.isPasswordChangedForTheFirstTime;

    if (
      !isPasswordChangedForTheFirstTime &&
      currentPath !== ROUTES.AUTH.RESET_PASSWORD
    ) {
      return NextResponse.redirect(
        new URL(ROUTES.AUTH.RESET_PASSWORD, request.url)
      );
    } else if (
      isPasswordChangedForTheFirstTime &&
      currentPath === ROUTES.AUTH.RESET_PASSWORD
    ) {
      return NextResponse.redirect(new URL(ROUTES.DASHBOARD.BASE, request.url));
    }

    if (
      roles.includes(ManagerTypes.LEAVE_MANAGER) &&
      !roles.includes(AdminTypes.LEAVE_ADMIN) &&
      currentPath === `${ROUTES.LEAVE.TEAM_TIME_SHEET_ANALYTICS}/reports`
    ) {
      return NextResponse.redirect(
        new URL(ROUTES.AUTH.UNAUTHORIZED, request.url)
      );
    }

    if (
      currentPath.startsWith(ROUTES.DASHBOARD.BASE) &&
      !roles.includes(EmployeeTypes.LEAVE_EMPLOYEE) &&
      !roles.includes(ManagerTypes.PEOPLE_MANAGER) &&
      !roles.includes(ManagerTypes.ATTENDANCE_MANAGER)
    ) {
      if (roles.includes(EmployeeTypes.ATTENDANCE_EMPLOYEE)) {
        return NextResponse.redirect(
          new URL(ROUTES.TIMESHEET.MY_TIMESHEET, request.url)
        );
      }
    }

    const isAllowed = roles.some((role) =>
      allowedRoutes[role]?.some((url) =>
        request.nextUrl.pathname.startsWith(url)
      )
    );

    if (isAllowed) {
      if (
        request.nextUrl.pathname.includes(ROUTES.SIGN.BASE) &&
        !roles.includes(EmployeeTypes.ESIGN_EMPLOYEE)
      ) {
        return NextResponse.redirect(
          new URL(ROUTES.AUTH.UNAUTHORIZED, request.url)
        );
      }

      if (
        request.nextUrl.pathname.startsWith(ROUTES.SETTINGS.INTEGRATIONS) &&
        token?.tier !== "PRO"
      ) {
        return NextResponse.redirect(
          new URL(ROUTES.AUTH.UNAUTHORIZED, request.url)
        );
      }

      // Check manager restricted routes
      const managerRedirect = checkRestrictedRoutesAndRedirect(
        request,
        managerRestrictedRoutes,
        AdminTypes.PEOPLE_ADMIN,
        roles
      );
      if (managerRedirect) return managerRedirect;

      // Check invoice employee restricted routes
      const invoiceEmployeeRedirect = checkRestrictedRoutesAndRedirect(
        request,
        invoiceEmployeeRestrictedRoutes,
        ManagerTypes.INVOICE_MANAGER,
        roles
      );
      if (invoiceEmployeeRedirect) return invoiceEmployeeRedirect;

      // Check employee restricted routes
      const employeeRedirect = checkRestrictedRoutesAndRedirect(
        request,
        employeeRestrictedRoutes,
        ManagerTypes.PEOPLE_MANAGER,
        roles
      );
      if (employeeRedirect) return employeeRedirect;

      return NextResponse.next();
    }

    // Redirect to /unauthorized if no access
    if (currentPath !== ROUTES.AUTH.UNAUTHORIZED) {
      return NextResponse.redirect(
        new URL(ROUTES.AUTH.UNAUTHORIZED, request.url)
      );
    }
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
    "/module-selection",
    "/payment",
    // Common routes
    "/dashboard/:path*",
    "/configurations/:path*",
    "/settings/:path*",
    "/notifications",
    "/account",
    "/reset-password",
    "/unauthorized",
    "/verify/email",
    "/verify/success",
    // Module routes
    "/leave/:path*",
    "/people/:path*",
    "/timesheet/:path*",
    "/remove-people",
    "/integrations",
    "/subscription",
    "/user-account",
    // Sign routes
    "/sign",
    "/sign/contacts/:path*",
    "/sign/create/:path*",
    "/sign/folders/:path*",
    "/sign/inbox/:path*",
    "/sign/sent/:path*",
    "/sign/complete/:path*",
    // Project routes
    "/projects/:path*",
    // Invoice routes
    "/invoice",
    "/invoice/:path*",
    "/invoice/create/:path*"
  ]
};
