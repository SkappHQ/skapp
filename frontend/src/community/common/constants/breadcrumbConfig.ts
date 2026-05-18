import { BreadcrumbItem } from "@rootcodelabs/skapp-ui";

import ROUTES from "./routes";

/**
 * Static breadcrumb definitions keyed by route path.
 * Each entry is an array of BreadcrumbItem where the last item has no href (current page).
 * Dynamic routes are handled separately via `dynamicBreadcrumbPatterns`.
 */
const carryForwardBreadcrumbs: BreadcrumbItem[] = [
  { label: "leave" },
  {
    label: "leaveEntitlements",
    href: ROUTES.LEAVE.LEAVE_ENTITLEMENTS
  },
  { label: "carryForwardingBalance" }
];

const breadcrumbConfig: Record<string, BreadcrumbItem[]> = {
  // ── Dashboard ──
  [ROUTES.DASHBOARD.ATTENDANCE.CLOCK_IN_SUMMARY]: [
    { label: "dashboard" },
    { label: "attendance" },
    { label: "clockInSummary" }
  ],
  [ROUTES.DASHBOARD.ATTENDANCE.LATE_ARRIVALS_SUMMARY]: [
    { label: "dashboard" },
    { label: "attendance" },
    { label: "lateArrivalsSummary" }
  ],
  [ROUTES.DASHBOARD.LEAVE.RESOURCE_AVAILABILITY]: [
    { label: "dashboard" },
    { label: "leave" },
    { label: "resourceAvailability" }
  ],

  // ── Timesheet ──
  [ROUTES.TIMESHEET.BASE]: [{ label: "timesheet" }],
  [ROUTES.TIMESHEET.MY_TIMESHEET]: [
    { label: "timesheet" },
    { label: "myTimesheet" }
  ],
  [ROUTES.TIMESHEET.ALL_TIMESHEETS]: [
    { label: "timesheet" },
    { label: "allTimesheets" }
  ],
  [ROUTES.TIMESHEET.TIMESHEET_REQUESTS]: [
    { label: "timesheet" },
    {
      label: "allTimesheets",
      href: ROUTES.TIMESHEET.ALL_TIMESHEETS
    },
    { label: "timeEntryRequests" }
  ],
  [ROUTES.TIMESHEET.TIMESHEET_ANALYTICS]: [
    { label: "timesheet", href: ROUTES.TIMESHEET.BASE },
    { label: "timesheetAnalytics" }
  ],

  // ── Leave ──
  [ROUTES.LEAVE.BASE]: [{ label: "leave" }],
  [ROUTES.LEAVE.MY_REQUESTS]: [
    { label: "leave" },
    { label: "myLeaveRequests" }
  ],
  [ROUTES.LEAVE.LEAVE_REQUESTS]: [
    { label: "leave" },
    { label: "allLeaveRequests" }
  ],
  [ROUTES.LEAVE.LEAVE_PENDING]: [
    { label: "leave" },
    { label: "pendingLeaveRequests" }
  ],
  [ROUTES.LEAVE.LEAVE_ENTITLEMENTS]: [
    { label: "leave" },
    { label: "leaveEntitlements" }
  ],
  [ROUTES.LEAVE.CARRY_FORWARD_BALANCES]: carryForwardBreadcrumbs,
  [ROUTES.LEAVE.CARRY_FORWARD]: carryForwardBreadcrumbs,
  [ROUTES.LEAVE.TYPES]: [{ label: "leave" }, { label: "leaveTypes" }],
  [ROUTES.LEAVE.ADD_EDIT_TYPES]: [
    { label: "leave" },
    { label: "leaveTypes", href: ROUTES.LEAVE.TYPES },
    { label: "addLeaveType" }
  ],
  [ROUTES.LEAVE.LEAVE_ANALYTICS]: [
    { label: "leave" },
    { label: "leaveAnalytics" }
  ],

  // ── People ──
  [ROUTES.PEOPLE.DIRECTORY]: [
    { label: "people", href: ROUTES.PEOPLE.BASE },
    { label: "directory" }
  ],
  [ROUTES.PEOPLE.ADD]: [
    { label: "people" },
    { label: "directory", href: ROUTES.PEOPLE.DIRECTORY },
    { label: "addTeamMembers" }
  ],
  [ROUTES.PEOPLE.ADD_NEW_RESOURCE]: [
    { label: "people" },
    { label: "directory", href: ROUTES.PEOPLE.DIRECTORY },
    { label: "addNewResource" }
  ],
  [ROUTES.PEOPLE.PENDING]: [
    { label: "people" },
    { label: "directory", href: ROUTES.PEOPLE.DIRECTORY },
    { label: "pendingInvitations" }
  ],
  [ROUTES.PEOPLE.TEAMS]: [
    { label: "people", href: ROUTES.PEOPLE.BASE },
    { label: "teams" }
  ],
  [ROUTES.PEOPLE.JOB_FAMILY]: [
    { label: "people", href: ROUTES.PEOPLE.BASE },
    { label: "jobFamilies" }
  ],
  [ROUTES.PEOPLE.HOLIDAYS]: [
    { label: "people", href: ROUTES.PEOPLE.BASE },
    { label: "holidays" }
  ],

  // ── Sign ──
  [ROUTES.SIGN.INBOX]: [{ label: "sign" }, { label: "inbox" }],
  [ROUTES.SIGN.SENT]: [{ label: "sign" }, { label: "sent" }],
  [ROUTES.SIGN.CONTACTS]: [{ label: "sign" }, { label: "contacts" }],
  [ROUTES.SIGN.TEMPLATE]: [{ label: "sign" }, { label: "templates" }],
  [ROUTES.SIGN.CREATE_TEMPLATE]: [
    { label: "sign" },
    { label: "templates", href: ROUTES.SIGN.TEMPLATE },
    { label: "createTemplate" }
  ],

  // ── Projects ──
  [ROUTES.PROJECTS.BASE]: [{ label: "projects" }, { label: "allProjects" }],
  [ROUTES.PROJECTS.GUESTS]: [
    { label: "projects", href: ROUTES.PROJECTS.BASE },
    { label: "guestUsers" }
  ],

  // ── Invoices ──
  [ROUTES.INVOICE.BASE]: [{ label: "invoices" }],
  [ROUTES.INVOICE.ALL_INVOICES]: [
    { label: "invoices" },
    { label: "allInvoices" }
  ],
  [ROUTES.INVOICE.CUSTOMERS.BASE]: [
    { label: "invoices" },
    { label: "customers" }
  ],

  // ── Configurations ──
  [ROUTES.CONFIGURATIONS.USER_ROLES]: [
    { label: "configurations", href: ROUTES.CONFIGURATIONS.BASE },
    { label: "moduleRoles" }
  ],
  [ROUTES.CONFIGURATIONS.ATTENDANCE]: [
    { label: "configurations", href: ROUTES.CONFIGURATIONS.BASE },
    { label: "attendance" }
  ],
  [ROUTES.CONFIGURATIONS.TIME]: [
    { label: "configurations", href: ROUTES.CONFIGURATIONS.BASE },
    { label: "time" }
  ],
  [ROUTES.CONFIGURATIONS.SIGN]: [
    { label: "configurations", href: ROUTES.CONFIGURATIONS.BASE },
    { label: "esignature" }
  ],
  [ROUTES.CONFIGURATIONS.INVOICE]: [
    { label: "configurations", href: ROUTES.CONFIGURATIONS.BASE },
    { label: "invoice" }
  ],

  // ── Settings ──
  [ROUTES.SETTINGS.ACCOUNT]: [
    { label: "settings", href: ROUTES.SETTINGS.BASE },
    { label: "account" }
  ],
  [ROUTES.SETTINGS.BILLING]: [
    { label: "settings", href: ROUTES.SETTINGS.BASE },
    { label: "billing" }
  ],
  [ROUTES.SETTINGS.MODULES]: [
    { label: "settings", href: ROUTES.SETTINGS.BASE },
    { label: "modules" }
  ],
  [ROUTES.SETTINGS.INTEGRATIONS]: [
    { label: "settings", href: ROUTES.SETTINGS.BASE },
    { label: "integrations" }
  ],

  // ── Accounts ──
  [ROUTES.PEOPLE.ACCOUNT]: [{ label: "account" }],
  [ROUTES.PEOPLE.USER_ACCOUNT]: [{ label: "account" }]
};

/**
 * Dynamic route patterns for breadcrumbs.
 * Each entry has a regex pattern to match against the current path,
 * and a function that returns the BreadcrumbItem[] for the matched route.
 */
export const dynamicBreadcrumbPatterns: Array<{
  pattern: RegExp;
  getBreadcrumbs: (matches: RegExpMatchArray) => BreadcrumbItem[];
}> = [
  // People / Directory / Edit Employee Profile
  {
    pattern: /^\/people\/directory\/edit\/(.+)$/,
    getBreadcrumbs: () => [
      { label: "people" },
      { label: "directory", href: ROUTES.PEOPLE.DIRECTORY },
      { label: "editEmployeeProfile" }
    ]
  },
  {
    pattern: /^\/people\/directory\/edit-all-information\/(.+)$/,
    getBreadcrumbs: () => [
      { label: "people" },
      { label: "directory", href: ROUTES.PEOPLE.DIRECTORY },
      { label: "editEmployeeProfile" }
    ]
  },
  // Leave Types / Edit Leave Type
  {
    pattern: /^\/leave\/types\/(.+)$/,
    getBreadcrumbs: () => [
      { label: "leave" },
      { label: "leaveTypes", href: ROUTES.LEAVE.TYPES },
      { label: "editLeaveType" }
    ]
  },
  // Leave Analytics / [id]
  {
    pattern: /^\/leave\/analytics\/(.+)$/,
    getBreadcrumbs: () => [{ label: "leave" }, { label: "leaveAnalytics" }]
  },
  // Sign / Inbox / Envelope Details
  {
    pattern: /^\/sign\/inbox\/envelope\/(.+)$/,
    getBreadcrumbs: () => [
      { label: "sign" },
      { label: "inbox", href: ROUTES.SIGN.INBOX },
      { label: "envelopeDetails" }
    ]
  },
  // Sign / Sent / Envelope Details
  {
    pattern: /^\/sign\/sent\/envelope\/(.+)$/,
    getBreadcrumbs: () => [
      { label: "sign" },
      { label: "sent", href: ROUTES.SIGN.SENT },
      { label: "envelopeDetails" }
    ]
  },
  // Sign / Templates / Edit Template
  {
    pattern: /^\/sign\/template\/(.+)$/,
    getBreadcrumbs: () => [
      { label: "sign" },
      { label: "templates", href: ROUTES.SIGN.TEMPLATE },
      { label: "editTemplate" }
    ]
  },
  // Configurations / user-roles / [module]
  {
    pattern: /^\/configurations\/user-roles\/(.+)$/,
    getBreadcrumbs: (matches) => {
      const moduleName = matches[1];
      const moduleLabels: Record<string, string> = {
        attendance: "attendanceModuleRoles",
        people: "peopleModuleRoles",
        leave: "leaveModuleRoles",
        esign: "esignatureModuleRoles",
        invoice: "invoiceModuleRoles",
        "project-management": "projectManagementModuleRoles"
      };
      const label =
        moduleLabels[moduleName] || `breadcrumbs.${moduleName}ModuleRoles`;
      return [
        {
          label: "configurations",
          href: ROUTES.CONFIGURATIONS.BASE
        },
        { label }
      ];
    }
  },
  // Invoice / Customers / Customer Details / Projects (must precede customer-details pattern)
  {
    pattern: /^\/invoice\/customers\/customer-details\/projects\/(.+)$/,
    getBreadcrumbs: () => [
      { label: "invoices" },
      { label: "customers", href: ROUTES.INVOICE.CUSTOMERS.BASE },
      { label: "customerDetails" }
    ]
  },
  // Invoice / Customers / Customer Details
  {
    pattern: /^\/invoice\/customers\/customer-details\/(.+)$/,
    getBreadcrumbs: () => [
      { label: "invoices" },
      { label: "customers", href: ROUTES.INVOICE.CUSTOMERS.BASE },
      { label: "customerDetails" }
    ]
  },
  // Invoice / Create
  {
    pattern: /^\/invoice\/create\/(.+)$/,
    getBreadcrumbs: () => [
      { label: "invoices" },
      { label: "allInvoices", href: ROUTES.INVOICE.ALL_INVOICES },
      { label: "createInvoice" }
    ]
  },
  // Invoice / View (Preview)
  {
    pattern: /^\/invoice\/view\/(.+)$/,
    getBreadcrumbs: () => [
      { label: "invoices" },
      { label: "allInvoices", href: ROUTES.INVOICE.ALL_INVOICES },
      { label: "previewInvoice" }
    ]
  },
  // People / Individual Profile
  {
    pattern: /^\/people\/individual\/(.+)$/,
    getBreadcrumbs: () => [
      { label: "people" },
      { label: "directory", href: ROUTES.PEOPLE.DIRECTORY },
      { label: "employeeProfile" }
    ]
  },
  // People / Holidays / Sub-routes
  {
    pattern: /^\/people\/holidays\/(.+)$/,
    getBreadcrumbs: () => [
      { label: "people" },
      { label: "holidays", href: ROUTES.PEOPLE.HOLIDAYS },
      { label: "holidayDetails" }
    ]
  }
];

export default breadcrumbConfig;
