const ROUTES = {
  AUTH: {
    SIGNUP: "/signup",
    SIGNIN: "/signin",
    ENTERPRISE_SIGNIN: "/enterprise/signin",
    DOMAIN_VERIFICATION: "/enterprise/domain-verification",
    RESET_PASSWORD: "/reset-password",
    UNAUTHORIZED: "/unauthorized",
    ERROR: "/_error",
    FORGOT_PASSWORD: "/forgot-password",
    VERIFY: "/verify/email",
    VERIFY_SUCCESS: "/verify/success",
    VERIFY_RESET_PASSWORD: "/verify/reset-password",
    VERIFY_FORGOT_OTP: "/verify/reset-password",
    VERIFY_GUEST: "/verify/guest",
    VERIFY_GUEST_OTP: "/verify/guest-otp",
    FORGET_PASSWORD: "/forget-password",
    SYSTEM_UPDATE: "/system-update"
  },
  ORGANIZATION: {
    SETUP: "/setup-organization",
    MODULE_SELECTION: "/module-selection"
  },
  NOTIFICATIONS: "/notifications",
  INTEGRATIONS: "/integrations",
  SETTINGS: {
    BASE: "/settings",
    BILLING: "/settings/billing",
    ACCOUNT: "/settings/account",
    MODULES: "/settings/modules",
    INTEGRATIONS: "/settings/integrations",
    PAYMENT: "/payment"
  },
  TIMESHEET: {
    BASE: "/timesheet",
    MY_TIMESHEET: "/timesheet/my-timesheet",
    ALL_TIMESHEETS: "/timesheet/all-timesheets",
    TIMESHEET_REQUESTS: "/timesheet/timesheet-requests",
    TIMESHEET_ANALYTICS: "/timesheet/analytics"
  },
  LEAVE: {
    BASE: "/leave",
    LEAVE_ANALYTICS: "/leave/leave-analytics",
    MY_REQUESTS: "/leave/my-requests",
    LEAVE_REQUESTS: "/leave/leave-requests",
    TYPES: "/leave/types",
    LEAVE_ENTITLEMENTS: "/leave/entitlements/leave-entitlements",
    LEAVE_PENDING: "/leave/pending-leave",
    CARRY_FORWARD_BALANCES: "/leave/entitlements/carry-forward-balances",
    ADD_EDIT_TYPES: "/leave/types/add-edit",
    LEAVE_TYPES: "/leave/types",
    ADD_EDIT_LEAVE_TYPES: (slug: string) => `/leave/types/${slug}`,
    TEAM_TIME_SHEET_ANALYTICS: `/leave/analytics`,
    CARRY_FORWARD: "/leave/carry-forward-balances"
  },
  PEOPLE: {
    BASE: "/people",
    DIRECTORY: "/people/directory",
    JOB_FAMILY: "/people/job-family",
    TEAMS: "/people/teams",
    HOLIDAYS: "/people/holidays",
    INDIVIDUAL: "/people/individual",
    ACCOUNT: "/account",
    ADD_NEW_RESOURCE: "/people/directory/add-new-resource",
    EDIT_ALL_INFORMATION: (id: any) =>
      `/people/directory/edit-all-information/${id}`,
    PENDING: "/people/directory/pending",
    USER_ACCOUNT: "/user-account",
    EDIT: (id: any) => `/people/directory/edit/${id}`,
    ADD: "/people/directory/add"
  },
  CONFIGURATIONS: {
    BASE: "/configurations",
    ATTENDANCE: "/configurations/attendance",
    TIME: "/configurations/time",
    USER_ROLES: "/configurations/user-roles",
    SIGN: "/configurations/esign",
    USER_ROLES_MODULE: (module: string) =>
      `/configurations/user-roles/${module}`,
    INVOICE: "/configurations/invoice"
  },
  DASHBOARD: {
    BASE: "/dashboard",
    ATTENDANCE: {
      CLOCK_IN_SUMMARY: "/dashboard/attendance/clock-in-summary",
      LATE_ARRIVALS_SUMMARY: "/dashboard/attendance/late-arrivals-summary"
    },
    LEAVE: {
      RESOURCE_AVAILABILITY: "/dashboard/leave/resource-availability"
    }
  },
  MAINTENANCE: "/maintenance",
  SIGN: {
    BASE: "/sign",
    INBOX: "/sign/inbox",
    SENT: "/sign/sent",
    FOLDERS: "/sign/folders",
    CONTACTS: "/sign/contacts",
    CREATE_DOCUMENT: "/sign/create",
    SIGN: "/sign/sign",
    REVIEW: "/sign/review",
    INFO: "/sign/info",
    DOCUMENT_ACCESS: "/sign/document/access",
    COMPLETE: "/sign/complete",
    SENT_INFO: {
      BASE: "/sign/sent/envelope",
      ID: (id: number) => `/sign/sent/envelope/${id}`
    },
    INBOX_INFO: {
      BASE: "/sign/inbox/envelope",
      ID: (id: number) => `/sign/inbox/envelope/${id}`
    }
  },
  REMOVE_PEOPLE: "/remove-people",
  CHANGE_SUPERVISORS: "/change-supervisors",
  SUBSCRIPTION: "/subscription",
  PROJECTS: {
    BASE: "/projects/list",
    GUESTS: "/projects/guests"
  },
  INVOICE: {
    BASE: "/invoice",
    ALL_INVOICES: "/invoice/allInvoices",
    CUSTOMERS: {
      BASE: "/invoice/customers",
      CUSTOMER_DETAILS: (id: number) =>
        `/invoice/customers/customer-details/${id}`,
      PROJECTS: {
        BASE: "/invoice/customers/customer-details/projects",
        ID: (id: number) => `/invoice/customers/customer-details/projects/${id}`
      }
    },
    CREATE: {
      BASE: "/invoice/create",
      ID: (id: any) => `/invoice/create/${id}`
    },
    VIEW: {
      BASE: "/invoice/view",
      ID: (id: any) => `/invoice/view/${id}`
    }
  }
};

export default ROUTES;

const RESCRITED_DYNAMIC_ROUTES = {
  PEOPLE: {
    EDIT: "/people/directory/edit/"
  },
  INVOICE: {
    CREATE: "/invoice/create/",
    VIEW: "/invoice/view/"
  }
};

export const invoiceEmployeeRestrictedRoutes = [
  RESCRITED_DYNAMIC_ROUTES.INVOICE.CREATE,
  RESCRITED_DYNAMIC_ROUTES.INVOICE.VIEW
];

export const employeeRestrictedRoutes = [
  RESCRITED_DYNAMIC_ROUTES.PEOPLE.EDIT,
  ROUTES.PEOPLE.ADD
];

export const managerRestrictedRoutes = [ROUTES.PEOPLE.ADD];
