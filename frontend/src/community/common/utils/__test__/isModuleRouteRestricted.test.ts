/**
 * `commonUtil` pulls in `next/server`, which needs the node environment
 * @jest-environment node
 */
import ROUTES from "~community/common/constants/routes";
import {
  AdminTypes,
  EmployeeTypes,
  ManagerTypes,
  ROLE_SUPER_ADMIN,
  RepresentativeTypes
} from "~community/common/types/AuthTypes";
import { isModuleRouteRestricted } from "~community/common/utils/commonUtil";

// Roles an employee keeps regardless of their module roles
const baseRoles: string[] = [
  EmployeeTypes.PEOPLE_EMPLOYEE,
  EmployeeTypes.LEAVE_EMPLOYEE,
  EmployeeTypes.ATTENDANCE_EMPLOYEE
];

describe("isModuleRouteRestricted", () => {
  describe("CRM downgraded to none", () => {
    it("restricts every CRM route", () => {
      expect(isModuleRouteRestricted(ROUTES.CRM.BASE, baseRoles)).toBe(true);
      expect(isModuleRouteRestricted(ROUTES.CRM.CONTACTS, baseRoles)).toBe(
        true
      );
      expect(isModuleRouteRestricted(ROUTES.CRM.COMPANIES, baseRoles)).toBe(
        true
      );
      expect(isModuleRouteRestricted(ROUTES.CRM.DEALS, baseRoles)).toBe(true);
      expect(isModuleRouteRestricted(ROUTES.CRM.TASKS, baseRoles)).toBe(true);
      expect(isModuleRouteRestricted("/crm/deals/123", baseRoles)).toBe(true);
    });

    it("restricts CRM for a super admin without a CRM role, matching the middleware", () => {
      expect(
        isModuleRouteRestricted(ROUTES.CRM.CONTACTS, [
          ...baseRoles,
          ROLE_SUPER_ADMIN
        ])
      ).toBe(true);
    });

    it("leaves the user's remaining modules alone", () => {
      expect(isModuleRouteRestricted(ROUTES.DASHBOARD.BASE, baseRoles)).toBe(
        false
      );
      expect(isModuleRouteRestricted(ROUTES.LEAVE.MY_REQUESTS, baseRoles)).toBe(
        false
      );
      expect(
        isModuleRouteRestricted(ROUTES.TIMESHEET.MY_TIMESHEET, baseRoles)
      ).toBe(false);
      expect(isModuleRouteRestricted(ROUTES.PEOPLE.DIRECTORY, baseRoles)).toBe(
        false
      );
      expect(isModuleRouteRestricted(ROUTES.SETTINGS.BASE, baseRoles)).toBe(
        false
      );
      expect(isModuleRouteRestricted(ROUTES.NOTIFICATIONS, baseRoles)).toBe(
        false
      );
    });
  });

  describe("CRM granted", () => {
    const crmRoles = [
      ...baseRoles,
      RepresentativeTypes.CRM_SALES_REPRESENTATIVE
    ];

    it("allows every CRM route", () => {
      expect(isModuleRouteRestricted(ROUTES.CRM.BASE, crmRoles)).toBe(false);
      expect(isModuleRouteRestricted(ROUTES.CRM.DEALS, crmRoles)).toBe(false);
      expect(isModuleRouteRestricted("/crm/deals/123", crmRoles)).toBe(false);
    });

    it("allows CRM for the higher CRM roles, which inherit the representative role", () => {
      expect(
        isModuleRouteRestricted(ROUTES.CRM.DEALS, [
          ...crmRoles,
          ManagerTypes.CRM_SALES_MANAGER
        ])
      ).toBe(false);
      expect(
        isModuleRouteRestricted(ROUTES.CRM.DEALS, [
          ...crmRoles,
          AdminTypes.CRM_ADMIN
        ])
      ).toBe(false);
    });
  });

  describe("the other module gates", () => {
    it("restricts invoice without the invoice manager role", () => {
      expect(isModuleRouteRestricted(ROUTES.INVOICE.BASE, baseRoles)).toBe(
        true
      );
      expect(
        isModuleRouteRestricted(ROUTES.INVOICE.ALL_INVOICES, [
          ...baseRoles,
          ManagerTypes.INVOICE_MANAGER
        ])
      ).toBe(false);
    });

    it("restricts projects without the pm employee role", () => {
      expect(isModuleRouteRestricted(ROUTES.PROJECTS.BASE, baseRoles)).toBe(
        true
      );
      expect(isModuleRouteRestricted(ROUTES.PROJECTS.GUESTS, baseRoles)).toBe(
        true
      );
      expect(
        isModuleRouteRestricted(ROUTES.PROJECTS.BASE, [
          ...baseRoles,
          EmployeeTypes.PM_EMPLOYEE
        ])
      ).toBe(false);
    });

    it("restricts leave and timesheet only when the base role is gone", () => {
      const noLeaveOrAttendance = [EmployeeTypes.PEOPLE_EMPLOYEE];

      expect(
        isModuleRouteRestricted(ROUTES.LEAVE.MY_REQUESTS, noLeaveOrAttendance)
      ).toBe(true);
      expect(
        isModuleRouteRestricted(
          ROUTES.TIMESHEET.MY_TIMESHEET,
          noLeaveOrAttendance
        )
      ).toBe(true);
      expect(isModuleRouteRestricted(ROUTES.LEAVE.MY_REQUESTS, baseRoles)).toBe(
        false
      );
    });
  });

  describe("routes outside the module gates", () => {
    it("never restricts them, whatever the roles", () => {
      [
        ROUTES.AUTH.SIGNIN,
        ROUTES.AUTH.UNAUTHORIZED,
        ROUTES.AUTH.RESET_PASSWORD,
        ROUTES.DASHBOARD.BASE,
        ROUTES.CONFIGURATIONS.BASE,
        ROUTES.PEOPLE.DIRECTORY,
        ROUTES.SIGN.INBOX,
        ROUTES.NOTIFICATIONS,
        ROUTES.SETTINGS.BASE
      ].forEach((route) => {
        expect(isModuleRouteRestricted(route, [])).toBe(false);
        expect(isModuleRouteRestricted(route, baseRoles)).toBe(false);
      });
    });
  });
});
