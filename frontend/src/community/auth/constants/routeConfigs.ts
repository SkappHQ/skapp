import ROUTES from "../../common/constants/routes";
import {
  AdminTypes,
  EmployeeTypes,
  ManagerTypes,
  ROLE_SUPER_ADMIN,
  SenderTypes,
  SuperAdminType
} from "../../common/types/AuthTypes";

// Define common routes shared by all roles
export const commonRoutes = [
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
export const superAdminRoutes = {
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

export const adminRoutes = {
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

export const managerRoutes = {
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

export const employeeRoutes = {
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

export const senderRoutes = {
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
export const allowedRoutes: Record<
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

// Define the matcher patterns for protected routes
export const routeMatchers = [
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
];

export const config = {
  matcher: routeMatchers
};
