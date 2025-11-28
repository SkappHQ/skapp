import ROUTES from "~community/common/constants/routes";
import {
  AdminTypes,
  EmployeeTypes,
  ManagerTypes,
  SenderTypes
} from "~community/common/types/AuthTypes";
import { IconName } from "~community/common/types/IconTypes";

const routes = [
  {
    id: "0",
    name: "Dashboard",
    url: ROUTES.DASHBOARD.BASE,
    icon: IconName.DASHBOARD_ICON,
    hasSubTree: false,
    requiredAuthLevel: [
      AdminTypes.SUPER_ADMIN,
      AdminTypes.PEOPLE_ADMIN,
      AdminTypes.LEAVE_ADMIN,
      AdminTypes.ATTENDANCE_ADMIN,
      ManagerTypes.PEOPLE_MANAGER,
      ManagerTypes.LEAVE_MANAGER,
      ManagerTypes.ATTENDANCE_MANAGER,
      EmployeeTypes.PEOPLE_EMPLOYEE,
      EmployeeTypes.LEAVE_EMPLOYEE,
      EmployeeTypes.ATTENDANCE_EMPLOYEE
    ]
  },
  {
    id: "1",
    name: "Timesheet",
    url: ROUTES.TIMESHEET.BASE,
    icon: IconName.TIME_SHEET_ICON,
    hasSubTree: true,
    requiredAuthLevel: [
      AdminTypes.SUPER_ADMIN,
      AdminTypes.ATTENDANCE_ADMIN,
      ManagerTypes.ATTENDANCE_MANAGER,
      EmployeeTypes.LEAVE_EMPLOYEE,
      EmployeeTypes.PEOPLE_EMPLOYEE,
      EmployeeTypes.ATTENDANCE_EMPLOYEE
    ],
    subTree: [
      {
        id: "1A",
        name: "My Timesheet",
        url: ROUTES.TIMESHEET.MY_TIMESHEET,
        hasSubTree: false,
        requiredAuthLevel: [
          AdminTypes.SUPER_ADMIN,
          AdminTypes.ATTENDANCE_ADMIN,
          ManagerTypes.ATTENDANCE_MANAGER,
          EmployeeTypes.LEAVE_EMPLOYEE,
          EmployeeTypes.PEOPLE_EMPLOYEE,
          EmployeeTypes.ATTENDANCE_EMPLOYEE
        ]
      },
      {
        id: "1B",
        name: "All Timesheets",
        url: ROUTES.TIMESHEET.ALL_TIMESHEETS,
        hasSubTree: false,
        requiredAuthLevel: [
          AdminTypes.SUPER_ADMIN,
          AdminTypes.ATTENDANCE_ADMIN,
          ManagerTypes.ATTENDANCE_MANAGER
        ]
      }
    ]
  },
  {
    id: "2",
    name: "Leave",
    url: ROUTES.LEAVE.BASE,
    icon: IconName.LEAVE_ICON,
    hasSubTree: true,
    requiredAuthLevel: [
      AdminTypes.SUPER_ADMIN,
      AdminTypes.PEOPLE_ADMIN,
      AdminTypes.LEAVE_ADMIN,
      AdminTypes.ATTENDANCE_ADMIN,
      ManagerTypes.PEOPLE_MANAGER,
      ManagerTypes.LEAVE_MANAGER,
      ManagerTypes.ATTENDANCE_MANAGER,
      EmployeeTypes.PEOPLE_EMPLOYEE,
      EmployeeTypes.LEAVE_EMPLOYEE,
      EmployeeTypes.ATTENDANCE_EMPLOYEE
    ],
    subTree: [
      {
        id: "2A",
        name: "My Requests",
        url: ROUTES.LEAVE.MY_REQUESTS,
        hasSubTree: false,
        requiredAuthLevel: [
          AdminTypes.SUPER_ADMIN,
          AdminTypes.PEOPLE_ADMIN,
          AdminTypes.LEAVE_ADMIN,
          AdminTypes.ATTENDANCE_ADMIN,
          ManagerTypes.PEOPLE_MANAGER,
          ManagerTypes.LEAVE_MANAGER,
          ManagerTypes.ATTENDANCE_MANAGER,
          EmployeeTypes.PEOPLE_EMPLOYEE,
          EmployeeTypes.LEAVE_EMPLOYEE,
          EmployeeTypes.ATTENDANCE_EMPLOYEE
        ]
      },
      {
        id: "2B",
        name: "All Leave Requests",
        url: ROUTES.LEAVE.LEAVE_REQUESTS,
        hasSubTree: false,
        requiredAuthLevel: [
          AdminTypes.SUPER_ADMIN,
          AdminTypes.LEAVE_ADMIN,
          ManagerTypes.LEAVE_MANAGER
        ]
      },
      {
        id: "2C",
        name: "Leave Entitlements",
        url: ROUTES.LEAVE.LEAVE_ENTITLEMENTS,
        hasSubTree: false,
        requiredAuthLevel: [AdminTypes.SUPER_ADMIN, AdminTypes.LEAVE_ADMIN]
      },
      {
        id: "2D",
        name: "Leave Types",
        url: ROUTES.LEAVE.LEAVE_TYPES,
        hasSubTree: false,
        requiredAuthLevel: [AdminTypes.SUPER_ADMIN, AdminTypes.LEAVE_ADMIN]
      }
    ]
  },
  {
    id: "3",
    name: "People",
    url: ROUTES.PEOPLE.BASE,
    icon: IconName.PEOPLE_ICON,
    hasSubTree: true,
    requiredAuthLevel: [
      AdminTypes.SUPER_ADMIN,
      AdminTypes.PEOPLE_ADMIN,
      ManagerTypes.PEOPLE_MANAGER,
      EmployeeTypes.LEAVE_EMPLOYEE,
      EmployeeTypes.PEOPLE_EMPLOYEE,
      EmployeeTypes.ATTENDANCE_EMPLOYEE
    ],
    subTree: [
      {
        id: "3A",
        name: "Directory",
        url: ROUTES.PEOPLE.DIRECTORY,
        hasSubTree: false,
        requiredAuthLevel: [
          AdminTypes.SUPER_ADMIN,
          AdminTypes.PEOPLE_ADMIN,
          ManagerTypes.PEOPLE_MANAGER,
          EmployeeTypes.LEAVE_EMPLOYEE,
          EmployeeTypes.PEOPLE_EMPLOYEE,
          EmployeeTypes.ATTENDANCE_EMPLOYEE
        ]
      },
      {
        id: "3B",
        name: "Teams",
        url: ROUTES.PEOPLE.TEAMS,
        hasSubTree: false,
        requiredAuthLevel: [
          AdminTypes.SUPER_ADMIN,
          AdminTypes.PEOPLE_ADMIN,
          ManagerTypes.PEOPLE_MANAGER
        ]
      },
      {
        id: "3C",
        name: "Job Families",
        url: ROUTES.PEOPLE.JOB_FAMILY,
        hasSubTree: false,
        requiredAuthLevel: [
          AdminTypes.SUPER_ADMIN,
          AdminTypes.PEOPLE_ADMIN,
          ManagerTypes.PEOPLE_MANAGER
        ]
      },
      {
        id: "3D",
        name: "Holidays",
        url: ROUTES.PEOPLE.HOLIDAYS,
        hasSubTree: false,
        requiredAuthLevel: [
          AdminTypes.SUPER_ADMIN,
          AdminTypes.PEOPLE_ADMIN,
          ManagerTypes.PEOPLE_MANAGER
        ]
      }
    ]
  },
  {
    id: "4",
    name: "Sign",
    url: ROUTES.SIGN.BASE,
    icon: IconName.DOCUMENTS_ICON,
    hasSubTree: true,
    requiredAuthLevel: [
      AdminTypes.SUPER_ADMIN,
      EmployeeTypes.ESIGN_EMPLOYEE,
      AdminTypes.ESIGN_ADMIN,
      SenderTypes.ESIGN_SENDER
    ],
    subTree: [
      {
        id: "4A",
        name: "Inbox",
        url: ROUTES.SIGN.INBOX,
        hasSubTree: false,
        requiredAuthLevel: [
          AdminTypes.SUPER_ADMIN,
          AdminTypes.ESIGN_ADMIN,
          SenderTypes.ESIGN_SENDER,
          EmployeeTypes.ESIGN_EMPLOYEE
        ]
      },
      {
        id: "4B",
        name: "Sent",
        url: ROUTES.SIGN.SENT,
        hasSubTree: false,
        requiredAuthLevel: [
          AdminTypes.SUPER_ADMIN,
          SenderTypes.ESIGN_SENDER,
          AdminTypes.ESIGN_ADMIN
        ]
      },
      {
        id: "4C",
        name: "Contacts",
        url: ROUTES.SIGN.CONTACTS,
        hasSubTree: false,
        requiredAuthLevel: [
          AdminTypes.SUPER_ADMIN,
          SenderTypes.ESIGN_SENDER,
          AdminTypes.ESIGN_ADMIN
        ]
      }
    ]
  },
  {
    id: "5",
    name: "Projects",
    url: ROUTES.PROJECTS.BASE,
    icon: IconName.PROJECTS_ICON,
    hasSubTree: true,
    badge: "New",
    requiredAuthLevel: [
      AdminTypes.SUPER_ADMIN,
      AdminTypes.PEOPLE_ADMIN,
      AdminTypes.LEAVE_ADMIN,
      AdminTypes.ATTENDANCE_ADMIN,
      ManagerTypes.PEOPLE_MANAGER,
      ManagerTypes.LEAVE_MANAGER,
      ManagerTypes.ATTENDANCE_MANAGER,
      EmployeeTypes.PEOPLE_EMPLOYEE,
      EmployeeTypes.LEAVE_EMPLOYEE,
      EmployeeTypes.ATTENDANCE_EMPLOYEE
    ],
    subTree: [
      {
        id: "5A",
        name: "All Projects",
        url: ROUTES.PROJECTS.BASE,
        hasSubTree: false,
        requiredAuthLevel: [
          AdminTypes.SUPER_ADMIN,
          AdminTypes.PEOPLE_ADMIN,
          AdminTypes.LEAVE_ADMIN,
          AdminTypes.ATTENDANCE_ADMIN,
          ManagerTypes.PEOPLE_MANAGER,
          ManagerTypes.LEAVE_MANAGER,
          ManagerTypes.ATTENDANCE_MANAGER,
          EmployeeTypes.PEOPLE_EMPLOYEE,
          EmployeeTypes.LEAVE_EMPLOYEE,
          EmployeeTypes.ATTENDANCE_EMPLOYEE
        ]
      },
      {
        id: "5B",
        name: "Guest Users",
        url: ROUTES.PROJECTS.GUESTS,
        hasSubTree: false,
        requiredAuthLevel: [
          AdminTypes.SUPER_ADMIN,
          AdminTypes.PEOPLE_ADMIN,
          AdminTypes.LEAVE_ADMIN,
          AdminTypes.ATTENDANCE_ADMIN,
          ManagerTypes.PEOPLE_MANAGER,
          ManagerTypes.LEAVE_MANAGER,
          ManagerTypes.ATTENDANCE_MANAGER,
          EmployeeTypes.PEOPLE_EMPLOYEE,
          EmployeeTypes.LEAVE_EMPLOYEE,
          EmployeeTypes.ATTENDANCE_EMPLOYEE
        ]
      }
    ]
  },
  {
    id: "6",
    name: "Invoices",
    url: ROUTES.INVOICE.BASE,
    icon: IconName.INVOICE_ICON,
    hasSubTree: true,
    requiredAuthLevel: [AdminTypes.SUPER_ADMIN, ManagerTypes.INVOICE_MANAGER],
    subTree: [
      {
        id: "6A",
        name: "All Invoices",
        url: ROUTES.INVOICE.ALL_INVOICES,
        hasSubTree: false,
        requiredAuthLevel: [
          AdminTypes.SUPER_ADMIN,
          ManagerTypes.INVOICE_MANAGER
        ]
      },
      {
        id: "6B",
        name: "Customers",
        url: ROUTES.INVOICE.CUSTOMERS.BASE,
        hasSubTree: false,
        requiredAuthLevel: [
          AdminTypes.SUPER_ADMIN,
          ManagerTypes.INVOICE_MANAGER
        ]
      }
    ]
  },
  {
    id: "7",
    name: "Configurations",
    url: ROUTES.CONFIGURATIONS.BASE,
    icon: IconName.CONFIGURATIONS_ICON,
    hasSubTree: true,
    requiredAuthLevel: [
      AdminTypes.SUPER_ADMIN,
      AdminTypes.ATTENDANCE_ADMIN,
      AdminTypes.INVOICE_ADMIN
    ],
    subTree: [
      {
        id: "7A",
        name: "Time",
        url: ROUTES.CONFIGURATIONS.TIME,
        hasSubTree: false,
        requiredAuthLevel: [AdminTypes.SUPER_ADMIN]
      },
      {
        id: "7B",
        name: "Attendance",
        url: ROUTES.CONFIGURATIONS.ATTENDANCE,
        hasSubTree: false,
        requiredAuthLevel: [AdminTypes.SUPER_ADMIN, AdminTypes.ATTENDANCE_ADMIN]
      },
      {
        id: "7C",
        name: "Sign",
        url: ROUTES.CONFIGURATIONS.SIGN,
        hasSubTree: false,
        requiredAuthLevel: [AdminTypes.SUPER_ADMIN, AdminTypes.ESIGN_ADMIN]
      },
      {
        id: "7D",
        name: "User Roles",
        url: ROUTES.CONFIGURATIONS.USER_ROLES,
        hasSubTree: false,
        requiredAuthLevel: [AdminTypes.SUPER_ADMIN]
      },
      {
        id: "7E",
        name: "Invoice",
        url: ROUTES.CONFIGURATIONS.INVOICE,
        hasSubTree: false,
        requiredAuthLevel: [AdminTypes.SUPER_ADMIN, AdminTypes.INVOICE_ADMIN]
      }
    ]
  },
  {
    id: "8",
    name: "Settings",
    url: ROUTES.SETTINGS.BASE,
    icon: IconName.SETTINGS_ICON,
    hasSubTree: true,
    requiredAuthLevel: [
      AdminTypes.SUPER_ADMIN,
      AdminTypes.PEOPLE_ADMIN,
      AdminTypes.LEAVE_ADMIN,
      AdminTypes.ATTENDANCE_ADMIN,
      ManagerTypes.PEOPLE_MANAGER,
      ManagerTypes.LEAVE_MANAGER,
      ManagerTypes.ATTENDANCE_MANAGER,
      EmployeeTypes.PEOPLE_EMPLOYEE,
      EmployeeTypes.LEAVE_EMPLOYEE,
      EmployeeTypes.ATTENDANCE_EMPLOYEE
    ],
    subTree: [
      {
        id: "8A",
        name: "Account Settings",
        url: ROUTES.SETTINGS.ACCOUNT,
        hasSubTree: false,
        requiredAuthLevel: [
          AdminTypes.SUPER_ADMIN,
          AdminTypes.PEOPLE_ADMIN,
          AdminTypes.LEAVE_ADMIN,
          AdminTypes.ATTENDANCE_ADMIN,
          ManagerTypes.PEOPLE_MANAGER,
          ManagerTypes.LEAVE_MANAGER,
          ManagerTypes.ATTENDANCE_MANAGER,
          EmployeeTypes.PEOPLE_EMPLOYEE,
          EmployeeTypes.LEAVE_EMPLOYEE,
          EmployeeTypes.ATTENDANCE_EMPLOYEE
        ]
      }
    ]
  }
];

export default routes;
