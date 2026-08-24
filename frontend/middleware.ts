import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import {
  RefreshedSession,
  applyRefreshedSession,
  clearSessionCookies,
  refreshSessionAtEdge
} from "~community/auth/utils/edgeSessionUtils";
import {
  extractClaimsFromToken,
  isTokenExpired
} from "~community/auth/utils/tokenUtils";
import ROUTES, {
  employeeRestrictedRoutes,
  invoiceEmployeeRestrictedRoutes,
  managerRestrictedRoutes,
  nonSuperAdminRestrictedRoutes,
  userRolesRestrictedRoutes
} from "~community/common/constants/routes";
import {
  AdminTypes,
  EmployeeTypes,
  ManagerTypes,
  ROLE_SUPER_ADMIN,
  RepresentativeTypes,
  SenderTypes,
  SuperAdminType
} from "~community/common/types/AuthTypes";
import { checkRestrictedRoutesAndRedirect } from "~community/common/utils/commonUtil";
import { TenantStatusEnums } from "~enterprise/common/enums/Common";
import { isCoreOrProTier } from "~enterprise/common/utils/commonUtil";

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
  ROUTES.PROJECTS.BASE
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
    ROUTES.SIGN.CREATE_TEMPLATE,
    ROUTES.SIGN.TEMPLATE,
    ROUTES.AUTH.VERIFY,
    ROUTES.AUTH.VERIFY_SUCCESS,
    ROUTES.SETTINGS.MODULES,
    ROUTES.SETTINGS.PAYMENT,
    ROUTES.REMOVE_PEOPLE,
    ROUTES.PROJECTS.BASE,
    ROUTES.PROJECTS.GUESTS,
    ROUTES.PROJECTS.GUEST_REQUESTS,
    ROUTES.INVOICE.BASE,
    ROUTES.INVOICE.ALL_INVOICES,
    ROUTES.INVOICE.CUSTOMERS.BASE,
    ROUTES.CRM.BASE,
    ROUTES.PEOPLE.GOOGLE_IMPORT_SYNCING,
    ROUTES.PEOPLE.GOOGLE_IMPORT_REVIEW,
    ROUTES.PEOPLE.SYNC_CHANGES
  ]
};

const adminRoutes = {
  [AdminTypes.PEOPLE_ADMIN]: [ROUTES.PEOPLE.BASE, ROUTES.CONFIGURATIONS.BASE],
  [AdminTypes.LEAVE_ADMIN]: [ROUTES.LEAVE.BASE],
  [AdminTypes.ATTENDANCE_ADMIN]: [
    ROUTES.TIMESHEET.BASE,
    ROUTES.CONFIGURATIONS.BASE
  ],
  [AdminTypes.ESIGN_ADMIN]: [
    ROUTES.SIGN.CONTACTS,
    ROUTES.SIGN.CREATE_DOCUMENT,
    ROUTES.SIGN.CREATE_TEMPLATE,
    ROUTES.SIGN.TEMPLATE,
    ROUTES.SIGN.FOLDERS,
    ROUTES.SIGN.INBOX,
    ROUTES.SIGN.SENT,
    ROUTES.SIGN.SIGN,
    ROUTES.SIGN.INFO,
    ROUTES.SIGN.COMPLETE,
    ROUTES.CONFIGURATIONS.BASE
  ],
  [AdminTypes.INVOICE_ADMIN]: [
    ROUTES.INVOICE.BASE,
    ROUTES.INVOICE.ALL_INVOICES,
    ROUTES.INVOICE.CUSTOMERS.BASE,
    ROUTES.CONFIGURATIONS.BASE,
    ROUTES.INVOICE.CREATE.BASE
  ],
  [AdminTypes.PM_ADMIN]: [
    ROUTES.PROJECTS.BASE,
    ROUTES.PROJECTS.GUESTS,
    ROUTES.PROJECTS.GUEST_REQUESTS
  ],
  [AdminTypes.CRM_ADMIN]: [ROUTES.CRM.BASE, ROUTES.CONFIGURATIONS.BASE]
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
    ROUTES.SIGN.CREATE_TEMPLATE,
    ROUTES.SIGN.TEMPLATE,
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
  ],
  [ManagerTypes.CRM_SALES_MANAGER]: [ROUTES.CRM.BASE]
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
  ],
  [EmployeeTypes.PM_EMPLOYEE]: [...commonRoutes],
  [EmployeeTypes.PM_GUEST_EMPLOYEE]: [...commonRoutes],
  [RepresentativeTypes.CRM_SALES_REPRESENTATIVE]: [
    ROUTES.CRM.BASE,
    ...commonRoutes
  ]
};

const senderRoutes = {
  [SenderTypes.ESIGN_SENDER]: [
    ROUTES.SIGN.CONTACTS,
    ROUTES.SIGN.CREATE_DOCUMENT,
    ROUTES.SIGN.CREATE_TEMPLATE,
    ROUTES.SIGN.TEMPLATE,
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
  | AdminTypes
  | ManagerTypes
  | EmployeeTypes
  | SuperAdminType
  | SenderTypes
  | RepresentativeTypes,
  string[]
> = {
  ...superAdminRoutes,
  ...adminRoutes,
  ...managerRoutes,
  ...employeeRoutes,
  ...senderRoutes,
  ...commonRoutes
};

const isUnguardedPath = (currentPath: string): boolean =>
  currentPath === ROUTES.SIGN.DOCUMENT_ACCESS ||
  currentPath.startsWith(ROUTES.SIGN.SIGN) ||
  currentPath.startsWith(ROUTES.SIGN.INFO);

function resolveRouteAccess(
  request: NextRequest,
  token: string | undefined,
  isPasswordChangedForTheFirstTime: string | undefined
) {
  const claims = extractClaimsFromToken(token || "");

  const currentPath = request.nextUrl.pathname;

  const roles: (
    | AdminTypes
    | ManagerTypes
    | EmployeeTypes
    | SuperAdminType
    | SenderTypes
    | RepresentativeTypes
  )[] = claims?.roles || [];

  if (currentPath === ROUTES.REMOVE_PEOPLE) {
    const tenantStatus = claims?.tenantStatus;
    const roles = claims?.roles || [];
    const isSuperAdmin = roles.includes(ROLE_SUPER_ADMIN);

    if (isSuperAdmin) {
      if (
        tenantStatus ===
          TenantStatusEnums.SUBSCRIPTION_CANCELED_USER_LIMIT_EXCEEDED ||
        tenantStatus === TenantStatusEnums.TRIAL_ENDED_USER_LIMIT_EXCEEDED
      ) {
        return NextResponse.next();
      } else {
        return NextResponse.redirect(
          new URL(ROUTES.DASHBOARD.BASE, request.url)
        );
      }
    }
  }

  if (
    isPasswordChangedForTheFirstTime === "false" &&
    currentPath !== ROUTES.AUTH.RESET_PASSWORD
  ) {
    return NextResponse.redirect(
      new URL(ROUTES.AUTH.RESET_PASSWORD, request.url)
    );
  } else if (
    isPasswordChangedForTheFirstTime === "true" &&
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
    allowedRoutes[role]?.some((url) => request.nextUrl.pathname.startsWith(url))
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
      !isCoreOrProTier(claims?.tier ? [claims.tier] : (claims?.tiers ?? []))
    ) {
      return NextResponse.redirect(
        new URL(ROUTES.AUTH.UNAUTHORIZED, request.url)
      );
    }

    if (
      request.nextUrl.pathname.startsWith(ROUTES.CRM.BASE) &&
      !roles.includes(RepresentativeTypes.CRM_SALES_REPRESENTATIVE)
    ) {
      return NextResponse.redirect(
        new URL(ROUTES.AUTH.UNAUTHORIZED, request.url)
      );
    }

    // Check super-admin restricted routes
    const nonSuperAdminRedirect = checkRestrictedRoutesAndRedirect(
      request,
      nonSuperAdminRestrictedRoutes,
      AdminTypes.SUPER_ADMIN,
      roles
    );
    if (nonSuperAdminRedirect) return nonSuperAdminRedirect;

    // Check manager restricted routes
    const managerRedirect = checkRestrictedRoutesAndRedirect(
      request,
      managerRestrictedRoutes,
      AdminTypes.PEOPLE_ADMIN,
      roles
    );
    if (managerRedirect) return managerRedirect;

    // Check user roles restricted routes (Super Admin only)
    const userRolesRedirect = checkRestrictedRoutesAndRedirect(
      request,
      userRolesRestrictedRoutes,
      ROLE_SUPER_ADMIN,
      roles
    );
    if (userRolesRedirect) return userRolesRedirect;

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
  if (currentPath !== ROUTES.AUTH.UNAUTHORIZED && token) {
    return NextResponse.redirect(
      new URL(ROUTES.AUTH.UNAUTHORIZED, request.url)
    );
  } else {
    return NextResponse.redirect(new URL(ROUTES.AUTH.SIGNIN, request.url));
  }
}

export async function middleware(request: NextRequest) {
  if (isUnguardedPath(request.nextUrl.pathname)) {
    return NextResponse.next();
  }

  let token = request.cookies.get("accessToken")?.value;
  let refreshedSession: RefreshedSession | null = null;
  let didAttemptRefresh = false;

  if (!token || isTokenExpired(token)) {
    didAttemptRefresh = true;
    refreshedSession = await refreshSessionAtEdge(request);
    token = refreshedSession?.accessToken;
  }

  const isPasswordChangedForTheFirstTime =
    refreshedSession?.isPasswordChangedForTheFirstTime !== undefined
      ? String(refreshedSession.isPasswordChangedForTheFirstTime)
      : request.cookies.get("isPasswordChangedForTheFirstTime")?.value;

  const response = resolveRouteAccess(
    request,
    token,
    isPasswordChangedForTheFirstTime
  );

  if (didAttemptRefresh && !refreshedSession) {
    return clearSessionCookies(response);
  }

  return applyRefreshedSession(response, refreshedSession);
}

// Configure which routes middleware should run on
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
    "/user-account",
    // Sign routes
    "/sign",
    "/sign/contacts/:path*",
    "/sign/create/:path*",
    "/sign/folders/:path*",
    "/sign/inbox/:path*",
    "/sign/sent/:path*",
    "/sign/template/:path*",
    "/sign/complete/:path*",
    // Project routes
    "/projects/:path*",
    // Invoice routes
    "/invoice",
    "/invoice/:path*",
    "/invoice/create/:path*",
    // CRM module routes
    "/crm",
    "/crm/:path*"
  ]
};
