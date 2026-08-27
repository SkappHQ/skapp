import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import {
  ACCESS_TOKEN_COOKIE_NAME,
  IS_PASSWORD_CHANGED_COOKIE_NAME
} from "~community/auth/constants/authConstants";
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

type UserRole =
  | AdminTypes
  | ManagerTypes
  | EmployeeTypes
  | SuperAdminType
  | SenderTypes
  | RepresentativeTypes;

// Merging all routes into one allowedRoutes object
const allowedRoutes: Record<UserRole, string[]> = {
  ...superAdminRoutes,
  ...adminRoutes,
  ...managerRoutes,
  ...employeeRoutes,
  ...senderRoutes,
  ...commonRoutes
};

const isUnguardedPath = (currentPath: string): boolean =>
  currentPath === ROUTES.SIGN.DOCUMENT_ACCESS;

const isPrefetchRequest = (request: NextRequest): boolean =>
  request.headers.get("next-router-prefetch") !== null ||
  request.headers.get("purpose") === "prefetch";

interface RouteAccessContext {
  request: NextRequest;
  currentPath: string;
  claims: Record<string, any>;
  roles: UserRole[];
  isPasswordChangedForTheFirstTime: string | undefined;
}

type AccessGuard = (context: RouteAccessContext) => NextResponse | null;

const REMOVE_PEOPLE_ALLOWED_TENANT_STATUSES: TenantStatusEnums[] = [
  TenantStatusEnums.SUBSCRIPTION_CANCELED_USER_LIMIT_EXCEEDED,
  TenantStatusEnums.TRIAL_ENDED_USER_LIMIT_EXCEEDED
];

// Roles that keep the dashboard as their landing page
const DASHBOARD_ALLOWED_ROLES: UserRole[] = [
  EmployeeTypes.LEAVE_EMPLOYEE,
  ManagerTypes.PEOPLE_MANAGER,
  ManagerTypes.ATTENDANCE_MANAGER
];

const RESTRICTED_ROUTE_RULES: { routes: string[]; requiredRole: string }[] = [
  {
    routes: nonSuperAdminRestrictedRoutes,
    requiredRole: AdminTypes.SUPER_ADMIN
  },
  { routes: managerRestrictedRoutes, requiredRole: AdminTypes.PEOPLE_ADMIN },
  { routes: userRolesRestrictedRoutes, requiredRole: ROLE_SUPER_ADMIN },
  {
    routes: invoiceEmployeeRestrictedRoutes,
    requiredRole: ManagerTypes.INVOICE_MANAGER
  },
  {
    routes: employeeRestrictedRoutes,
    requiredRole: ManagerTypes.PEOPLE_MANAGER
  }
];

const redirectTo = (request: NextRequest, path: string): NextResponse =>
  NextResponse.redirect(new URL(path, request.url));

const redirectToUnauthorized = (request: NextRequest): NextResponse =>
  redirectTo(request, ROUTES.AUTH.UNAUTHORIZED);

// Super admins over their user limit are the only ones allowed to remove people
const resolveRemovePeopleAccess: AccessGuard = ({
  request,
  currentPath,
  claims,
  roles
}) => {
  if (currentPath !== ROUTES.REMOVE_PEOPLE) return null;

  if (!roles.includes(ROLE_SUPER_ADMIN)) return null;

  if (REMOVE_PEOPLE_ALLOWED_TENANT_STATUSES.includes(claims?.tenantStatus)) {
    return NextResponse.next();
  }

  return redirectTo(request, ROUTES.DASHBOARD.BASE);
};

const resolveFirstTimePasswordAccess: AccessGuard = ({
  request,
  currentPath,
  isPasswordChangedForTheFirstTime
}) => {
  const isOnResetPassword = currentPath === ROUTES.AUTH.RESET_PASSWORD;

  if (isPasswordChangedForTheFirstTime === "false" && !isOnResetPassword) {
    return redirectTo(request, ROUTES.AUTH.RESET_PASSWORD);
  }

  if (isPasswordChangedForTheFirstTime === "true" && isOnResetPassword) {
    return redirectTo(request, ROUTES.DASHBOARD.BASE);
  }

  return null;
};

// Leave reports are for leave admins only
const resolveLeaveReportAccess: AccessGuard = ({
  request,
  currentPath,
  roles
}) =>
  roles.includes(ManagerTypes.LEAVE_MANAGER) &&
  !roles.includes(AdminTypes.LEAVE_ADMIN) &&
  currentPath === `${ROUTES.LEAVE.TEAM_TIME_SHEET_ANALYTICS}/reports`
    ? redirectToUnauthorized(request)
    : null;

// Attendance-only employees land on their timesheet instead of the dashboard
const resolveDashboardAccess: AccessGuard = ({
  request,
  currentPath,
  roles
}) => {
  if (!currentPath.startsWith(ROUTES.DASHBOARD.BASE)) return null;

  if (roles.some((role) => DASHBOARD_ALLOWED_ROLES.includes(role))) return null;

  if (!roles.includes(EmployeeTypes.ATTENDANCE_EMPLOYEE)) return null;

  return redirectTo(request, ROUTES.TIMESHEET.MY_TIMESHEET);
};

const resolveSignAccess: AccessGuard = ({ request, currentPath, roles }) =>
  currentPath.includes(ROUTES.SIGN.BASE) &&
  !roles.includes(EmployeeTypes.ESIGN_EMPLOYEE)
    ? redirectToUnauthorized(request)
    : null;

const resolveIntegrationsAccess: AccessGuard = ({
  request,
  currentPath,
  claims
}) =>
  currentPath.startsWith(ROUTES.SETTINGS.INTEGRATIONS) &&
  !isCoreOrProTier(claims?.tier ? [claims.tier] : (claims?.tiers ?? []))
    ? redirectToUnauthorized(request)
    : null;

const resolveCrmAccess: AccessGuard = ({ request, currentPath, roles }) =>
  currentPath.startsWith(ROUTES.CRM.BASE) &&
  !roles.includes(RepresentativeTypes.CRM_SALES_REPRESENTATIVE)
    ? redirectToUnauthorized(request)
    : null;

const resolveRestrictedRouteAccess: AccessGuard = ({ request, roles }) => {
  for (const { routes, requiredRole } of RESTRICTED_ROUTE_RULES) {
    const redirect = checkRestrictedRoutesAndRedirect(
      request,
      routes,
      requiredRole,
      roles
    );

    if (redirect) return redirect;
  }

  return null;
};

// Guards that apply to every request, regardless of role-based route access
const ROUTE_ACCESS_GUARDS: AccessGuard[] = [
  resolveRemovePeopleAccess,
  resolveFirstTimePasswordAccess,
  resolveLeaveReportAccess,
  resolveDashboardAccess
];

// Guards that only apply once the path is allowed for one of the user's roles
const ALLOWED_ROUTE_GUARDS: AccessGuard[] = [
  resolveSignAccess,
  resolveIntegrationsAccess,
  resolveCrmAccess,
  resolveRestrictedRouteAccess
];

const runAccessGuards = (
  guards: AccessGuard[],
  context: RouteAccessContext
): NextResponse | null => {
  for (const guard of guards) {
    const response = guard(context);

    if (response) return response;
  }

  return null;
};

const isRouteAllowedForRoles = ({
  currentPath,
  roles
}: RouteAccessContext): boolean =>
  roles.some((role) =>
    allowedRoutes[role]?.some((url) => currentPath.startsWith(url))
  );

function resolveRouteAccess(
  request: NextRequest,
  token: string | undefined,
  isPasswordChangedForTheFirstTime: string | undefined
): NextResponse {
  const claims = extractClaimsFromToken(token || "");

  const context: RouteAccessContext = {
    request,
    currentPath: request.nextUrl.pathname,
    claims,
    roles: claims?.roles || [],
    isPasswordChangedForTheFirstTime
  };

  const guardResponse = runAccessGuards(ROUTE_ACCESS_GUARDS, context);

  if (guardResponse) return guardResponse;

  if (isRouteAllowedForRoles(context)) {
    return (
      runAccessGuards(ALLOWED_ROUTE_GUARDS, context) ?? NextResponse.next()
    );
  }

  // Redirect to /unauthorized if no access
  if (context.currentPath !== ROUTES.AUTH.UNAUTHORIZED && token) {
    return redirectToUnauthorized(request);
  }

  return redirectTo(request, ROUTES.AUTH.SIGNIN);
}

export async function middleware(request: NextRequest): Promise<NextResponse> {
  if (isUnguardedPath(request.nextUrl.pathname)) {
    return NextResponse.next();
  }

  let token = request.cookies.get(ACCESS_TOKEN_COOKIE_NAME)?.value;
  let refreshedSession: RefreshedSession | null = null;
  let isSessionRejected = false;

  if ((!token || isTokenExpired(token)) && !isPrefetchRequest(request)) {
    const refreshResult = await refreshSessionAtEdge(request);

    if (refreshResult.status === "success") {
      refreshedSession = refreshResult.session;
      token = refreshedSession.accessToken;
    } else {
      isSessionRejected = refreshResult.status === "unauthorized";
    }
  }

  const isPasswordChangedForTheFirstTime = request.cookies.get(
    IS_PASSWORD_CHANGED_COOKIE_NAME
  )?.value;

  const response = resolveRouteAccess(
    request,
    token,
    isPasswordChangedForTheFirstTime
  );

  if (isSessionRejected) {
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
