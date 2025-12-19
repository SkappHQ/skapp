import { parse } from "cookie";
import { NextRequest, NextResponse } from "next/server";

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

const SESSION_COOKIE_NAME = "skapp-session";

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

/**
 * Extract session from request cookies
 * Note: In Edge runtime, we can't decrypt. We just check if session cookie exists.
 * Actual validation happens in API routes (Node.js runtime)
 */
function getSessionFromRequest(request: NextRequest): any | null {
  try {
    const cookieHeader = request.headers.get("cookie") || "";
    const cookies = parse(cookieHeader);
    const encryptedSession = cookies[SESSION_COOKIE_NAME];

    if (!encryptedSession) {
      return null;
    }

    // In middleware (Edge runtime), we can't decrypt
    // Just return a truthy value to indicate session exists
    // Actual session validation happens in API routes
    return { exists: true };
  } catch (error) {
    console.error("Error checking session from request:", error);
    return null;
  }
}

export default async function middleware(request: NextRequest) {
  const currentPath = request.nextUrl.pathname;

  // Public routes that don't require authentication
  const publicRoutes = [
    ROUTES.AUTH.SIGNIN,
    ROUTES.AUTH.SIGNUP,
    ROUTES.AUTH.ENTERPRISE_SIGNIN,
    ROUTES.AUTH.DOMAIN_VERIFICATION,
    ROUTES.AUTH.FORGOT_PASSWORD,
    ROUTES.AUTH.FORGET_PASSWORD,
    ROUTES.AUTH.VERIFY_RESET_PASSWORD,
    ROUTES.AUTH.VERIFY_FORGOT_OTP,
    ROUTES.AUTH.VERIFY_GUEST,
    ROUTES.AUTH.VERIFY_GUEST_OTP,
    ROUTES.AUTH.ERROR,
    ROUTES.MAINTENANCE,
    ROUTES.SIGN.DOCUMENT_ACCESS,
    ROUTES.AUTH.SYSTEM_UPDATE,
    "/redirect",
    "/api/auth" // Allow all auth API routes
  ];

  // Check if current path is a public route
  const isPublicRoute = publicRoutes.some((route) =>
    currentPath.startsWith(route)
  );

  // Allow public routes and sign document routes without auth check
  if (
    isPublicRoute ||
    currentPath.startsWith(ROUTES.SIGN.SIGN) ||
    currentPath.startsWith(ROUTES.SIGN.INFO)
  ) {
    return NextResponse.next();
  }

  // Get session from cookies
  const session = getSessionFromRequest(request);

  // Check if user is authenticated
  if (!session) {
    // Redirect to signin if not authenticated
    const url = new URL(ROUTES.AUTH.SIGNIN, request.url);
    url.searchParams.set("callbackUrl", currentPath);
    return NextResponse.redirect(url);
  }

  // Session exists, allow access
  // Role-based authorization and other checks are done client-side
  // This middleware only checks if user is authenticated (has session cookie)
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    "/((?!_next/static|_next/image|favicon|logo|image|public|.*\\..*|firebase-messaging-sw\\.js).*)"
  ]
};
