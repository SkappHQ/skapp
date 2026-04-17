import { BreadcrumbItem } from "@rootcodelabs/skapp-ui";

import ROUTES from "./routes";

/**
 * Static breadcrumb definitions keyed by route path.
 * Each entry is an array of BreadcrumbItem where the last item has no href (current page).
 * * Dynamic routes are handled separately via `dynamicBreadcrumbPatterns`,
 */
const breadcrumbConfig: Record<string, BreadcrumbItem[]> = {
  // ── Dashboard ──
  [ROUTES.DASHBOARD.BASE]: [{ label: "Dashboard" }],
  [ROUTES.DASHBOARD.ATTENDANCE.CLOCK_IN_SUMMARY]: [
    { label: "Dashboard", href: ROUTES.DASHBOARD.BASE },
    { label: "Attendance" },
    { label: "Clock-in Summary" }
  ],
  [ROUTES.DASHBOARD.ATTENDANCE.LATE_ARRIVALS_SUMMARY]: [
    { label: "Dashboard", href: ROUTES.DASHBOARD.BASE },
    { label: "Attendance" },
    { label: "Late Arrivals Summary" }
  ],
  [ROUTES.DASHBOARD.LEAVE.RESOURCE_AVAILABILITY]: [
    { label: "Dashboard", href: ROUTES.DASHBOARD.BASE },
    { label: "Leave" },
    { label: "Resource Availability" }
  ],

  // ── Timesheet ──
  [ROUTES.TIMESHEET.BASE]: [{ label: "Timesheet" }],
  [ROUTES.TIMESHEET.MY_TIMESHEET]: [
    { label: "Timesheet", href: ROUTES.TIMESHEET.BASE },
    { label: "My Timesheet" }
  ],
  [ROUTES.TIMESHEET.ALL_TIMESHEETS]: [
    { label: "Timesheet", href: ROUTES.TIMESHEET.BASE },
    { label: "All Timesheets" }
  ],
  [ROUTES.TIMESHEET.TIMESHEET_REQUESTS]: [
    { label: "Timesheet", href: ROUTES.TIMESHEET.BASE },
    { label: "All Timesheets", href: ROUTES.TIMESHEET.ALL_TIMESHEETS },
    { label: "Time Entry Requests" }
  ],
  [ROUTES.TIMESHEET.TIMESHEET_ANALYTICS]: [
    { label: "Timesheet", href: ROUTES.TIMESHEET.BASE },
    { label: "Timesheet Analytics" }
  ],

  // ── Leave ──
  [ROUTES.LEAVE.BASE]: [{ label: "Leave" }],
  [ROUTES.LEAVE.MY_REQUESTS]: [
    { label: "Leave", href: ROUTES.LEAVE.BASE },
    { label: "My Leave Requests" }
  ],
  [ROUTES.LEAVE.LEAVE_REQUESTS]: [
    { label: "Leave", href: ROUTES.LEAVE.BASE },
    { label: "All Leave Requests" }
  ],
  [ROUTES.LEAVE.LEAVE_PENDING]: [
    { label: "Leave", href: ROUTES.LEAVE.BASE },
    { label: "Pending Leave Requests" }
  ],
  [ROUTES.LEAVE.LEAVE_ENTITLEMENTS]: [
    { label: "Leave", href: ROUTES.LEAVE.BASE },
    { label: "Leave Entitlements" }
  ],
  [ROUTES.LEAVE.CARRY_FORWARD_BALANCES]: [
    { label: "Leave", href: ROUTES.LEAVE.BASE },
    {
      label: "Leave Entitlements",
      href: ROUTES.LEAVE.LEAVE_ENTITLEMENTS
    },
    { label: "Carry Forwarding Balance" }
  ],
  [ROUTES.LEAVE.CARRY_FORWARD]: [
    { label: "Leave", href: ROUTES.LEAVE.BASE },
    {
      label: "Leave Entitlements",
      href: ROUTES.LEAVE.LEAVE_ENTITLEMENTS
    },
    { label: "Carry Forwarding Balance" }
  ],
  [ROUTES.LEAVE.TYPES]: [
    { label: "Leave", href: ROUTES.LEAVE.BASE },
    { label: "Leave Types" }
  ],
  [ROUTES.LEAVE.ADD_EDIT_TYPES]: [
    { label: "Leave", href: ROUTES.LEAVE.BASE },
    { label: "Leave Types", href: ROUTES.LEAVE.TYPES },
    { label: "Add Leave Type" }
  ],
  [ROUTES.LEAVE.LEAVE_ANALYTICS]: [
    { label: "Leave", href: ROUTES.LEAVE.BASE },
    { label: "Leave Analytics" }
  ],

  // ── People ──
  [ROUTES.PEOPLE.DIRECTORY]: [
    { label: "People", href: ROUTES.PEOPLE.DIRECTORY },
    { label: "Directory" }
  ],
  [ROUTES.PEOPLE.ADD]: [
    { label: "People", href: ROUTES.PEOPLE.DIRECTORY },
    { label: "Directory", href: ROUTES.PEOPLE.DIRECTORY },
    { label: "Add Team Members" }
  ],
  [ROUTES.PEOPLE.ADD_NEW_RESOURCE]: [
    { label: "People", href: ROUTES.PEOPLE.DIRECTORY },
    { label: "Directory", href: ROUTES.PEOPLE.DIRECTORY },
    { label: "Add Team Members" }
  ],
  [ROUTES.PEOPLE.PENDING]: [
    { label: "People", href: ROUTES.PEOPLE.DIRECTORY },
    { label: "Directory", href: ROUTES.PEOPLE.DIRECTORY },
    { label: "Pending Invitations" }
  ],
  [ROUTES.PEOPLE.TEAMS]: [
    { label: "People", href: ROUTES.PEOPLE.DIRECTORY },
    { label: "Teams" }
  ],
  [ROUTES.PEOPLE.JOB_FAMILY]: [
    { label: "People", href: ROUTES.PEOPLE.DIRECTORY },
    { label: "Job Families" }
  ],
  [ROUTES.PEOPLE.HOLIDAYS]: [
    { label: "People", href: ROUTES.PEOPLE.DIRECTORY },
    { label: "Holidays" }
  ],

  // ── Sign ──
  [ROUTES.SIGN.INBOX]: [
    { label: "Sign", href: ROUTES.SIGN.INBOX },
    { label: "Inbox" }
  ],
  [ROUTES.SIGN.SENT]: [
    { label: "Sign", href: ROUTES.SIGN.INBOX },
    { label: "Sent" }
  ],
  [ROUTES.SIGN.CONTACTS]: [
    { label: "Sign", href: ROUTES.SIGN.INBOX },
    { label: "Contacts" }
  ],
  [ROUTES.SIGN.TEMPLATE]: [
    { label: "Sign", href: ROUTES.SIGN.INBOX },
    { label: "Templates" }
  ],
  [ROUTES.SIGN.CREATE_TEMPLATE]: [
    { label: "Sign", href: ROUTES.SIGN.INBOX },
    { label: "Templates", href: ROUTES.SIGN.TEMPLATE },
    { label: "Create Template" }
  ],

  // ── Projects ──
  [ROUTES.PROJECTS.BASE]: [
    { label: "Projects", href: ROUTES.PROJECTS.BASE },
    { label: "All Projects" }
  ],
  [ROUTES.PROJECTS.GUESTS]: [
    { label: "Projects", href: ROUTES.PROJECTS.BASE },
    { label: "Guest Users" }
  ],

  // ── Invoices ──
  [ROUTES.INVOICE.ALL_INVOICES]: [
    { label: "Invoices", href: ROUTES.INVOICE.ALL_INVOICES },
    { label: "All Invoices" }
  ],
  [ROUTES.INVOICE.CUSTOMERS.BASE]: [
    { label: "Invoices", href: ROUTES.INVOICE.ALL_INVOICES },
    { label: "Customers" }
  ],

  // ── Configurations ──
  [ROUTES.CONFIGURATIONS.BASE]: [{ label: "Configurations" }],
  [ROUTES.CONFIGURATIONS.USER_ROLES]: [
    { label: "Configurations", href: ROUTES.CONFIGURATIONS.BASE },
    { label: "Module Roles" }
  ],
  [ROUTES.CONFIGURATIONS.ATTENDANCE]: [
    { label: "Configurations", href: ROUTES.CONFIGURATIONS.BASE },
    { label: "Attendance" }
  ],
  [ROUTES.CONFIGURATIONS.TIME]: [
    { label: "Configurations", href: ROUTES.CONFIGURATIONS.BASE },
    { label: "Time" }
  ],
  [ROUTES.CONFIGURATIONS.SIGN]: [
    { label: "Configurations", href: ROUTES.CONFIGURATIONS.BASE },
    { label: "Esignature" }
  ],
  [ROUTES.CONFIGURATIONS.INVOICE]: [
    { label: "Configurations", href: ROUTES.CONFIGURATIONS.BASE },
    { label: "Invoice" }
  ],

  // ── Settings ──
  [ROUTES.SETTINGS.BASE]: [{ label: "Settings" }],
  [ROUTES.SETTINGS.ACCOUNT]: [
    { label: "Settings", href: ROUTES.SETTINGS.BASE },
    { label: "Account" }
  ],
  [ROUTES.SETTINGS.BILLING]: [
    { label: "Settings", href: ROUTES.SETTINGS.BASE },
    { label: "Billing" }
  ],
  [ROUTES.SETTINGS.MODULES]: [
    { label: "Settings", href: ROUTES.SETTINGS.BASE },
    { label: "Modules" }
  ],
  [ROUTES.SETTINGS.INTEGRATIONS]: [
    { label: "Settings", href: ROUTES.SETTINGS.BASE },
    { label: "Integrations" }
  ],

  // ── Notifications ──
  [ROUTES.NOTIFICATIONS]: [{ label: "Notifications" }],

  // ── Accounts ──
  [ROUTES.PEOPLE.ACCOUNT]: [{ label: "Account" }],
  [ROUTES.PEOPLE.USER_ACCOUNT]: [{ label: "Account" }]
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
      { label: "People", href: ROUTES.PEOPLE.DIRECTORY },
      { label: "Directory", href: ROUTES.PEOPLE.DIRECTORY },
      { label: "Edit Employee Profile" }
    ]
  },
  {
    pattern: /^\/people\/directory\/edit-all-information\/(.+)$/,
    getBreadcrumbs: () => [
      { label: "People", href: ROUTES.PEOPLE.DIRECTORY },
      { label: "Directory", href: ROUTES.PEOPLE.DIRECTORY },
      { label: "Edit Employee Profile" }
    ]
  },
  // Leave Types / Edit Leave Type
  {
    pattern: /^\/leave\/types\/(.+)$/,
    getBreadcrumbs: () => [
      { label: "Leave", href: ROUTES.LEAVE.BASE },
      { label: "Leave Types", href: ROUTES.LEAVE.TYPES },
      { label: "Edit Leave Type" }
    ]
  },
  // Leave Analytics / [id]
  {
    pattern: /^\/leave\/analytics\/(.+)$/,
    getBreadcrumbs: () => [
      { label: "Leave", href: ROUTES.LEAVE.BASE },
      { label: "Leave Analytics" }
    ]
  },
  // Sign / Inbox / Envelope Details
  {
    pattern: /^\/sign\/inbox\/envelope\/(.+)$/,
    getBreadcrumbs: () => [
      { label: "Sign", href: ROUTES.SIGN.INBOX },
      { label: "Inbox", href: ROUTES.SIGN.INBOX },
      { label: "Envelope Details" }
    ]
  },
  // Sign / Sent / Envelope Details
  {
    pattern: /^\/sign\/sent\/envelope\/(.+)$/,
    getBreadcrumbs: () => [
      { label: "Sign", href: ROUTES.SIGN.INBOX },
      { label: "Sent", href: ROUTES.SIGN.SENT },
      { label: "Envelope Details" }
    ]
  },
  // Sign / Templates / Edit Template
  {
    pattern: /^\/sign\/template\/(\d+)$/,
    getBreadcrumbs: () => [
      { label: "Sign", href: ROUTES.SIGN.INBOX },
      { label: "Templates", href: ROUTES.SIGN.TEMPLATE },
      { label: "Edit Template" }
    ]
  },
  // Configurations / user-roles / [module]
  {
    pattern: /^\/configurations\/user-roles\/(.+)$/,
    getBreadcrumbs: (matches) => {
      const moduleName = matches[1];
      const moduleLabels: Record<string, string> = {
        attendance: "Attendance Module Roles",
        people: "People Module Roles",
        leave: "Leave Module Roles",
        esign: "Esignature Module Roles",
        invoice: "Invoice Module Roles",
        "project-management": "Project Management Module Roles"
      };
      const label = moduleLabels[moduleName] || `${moduleName} Module Roles`;
      return [
        { label: "Configurations", href: ROUTES.CONFIGURATIONS.BASE },
        { label }
      ];
    }
  },
  // Invoice / Customers / Customer Details
  {
    pattern: /^\/invoice\/customers\/customer-details\/(\d+)$/,
    getBreadcrumbs: () => [
      { label: "Invoices", href: ROUTES.INVOICE.ALL_INVOICES },
      { label: "Customers", href: ROUTES.INVOICE.CUSTOMERS.BASE },
      { label: "Customer Details" }
    ]
  },
  // Invoice / Create
  {
    pattern: /^\/invoice\/create\/(.+)$/,
    getBreadcrumbs: () => [
      { label: "Invoices", href: ROUTES.INVOICE.ALL_INVOICES },
      { label: "All Invoices", href: ROUTES.INVOICE.ALL_INVOICES },
      { label: "Create Invoice" }
    ]
  },
  // Invoice / View (Preview)
  {
    pattern: /^\/invoice\/view\/(.+)$/,
    getBreadcrumbs: () => [
      { label: "Invoices", href: ROUTES.INVOICE.ALL_INVOICES },
      { label: "All Invoices", href: ROUTES.INVOICE.ALL_INVOICES },
      { label: "Preview Invoice" }
    ]
  },
  // Invoice / Customers / Customer Details / Projects
  {
    pattern: /^\/invoice\/customers\/customer-details\/projects\/(\d+)$/,
    getBreadcrumbs: () => [
      { label: "Invoices", href: ROUTES.INVOICE.ALL_INVOICES },
      { label: "Customers", href: ROUTES.INVOICE.CUSTOMERS.BASE },
      { label: "Customer Details" }
    ]
  }
];

export default breadcrumbConfig;
