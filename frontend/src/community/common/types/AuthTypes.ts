export type PasswordFieldTypes = "text" | "password";

export type PasswordFieldStates = {
  id: string;
  type: PasswordFieldTypes;
  isPasswordVisible: boolean;
};

export const ROLE_SUPER_ADMIN = "ROLE_SUPER_ADMIN";

export type SuperAdminType = typeof ROLE_SUPER_ADMIN;

export enum AdminTypes {
  SUPER_ADMIN = "ROLE_SUPER_ADMIN",
  PEOPLE_ADMIN = "ROLE_PEOPLE_ADMIN",
  LEAVE_ADMIN = "ROLE_LEAVE_ADMIN",
  ATTENDANCE_ADMIN = "ROLE_ATTENDANCE_ADMIN",
  ESIGN_ADMIN = "ROLE_ESIGN_ADMIN",
  INVOICE_ADMIN = "ROLE_INVOICE_ADMIN"
}

export enum EmployeeTypes {
  PEOPLE_EMPLOYEE = "ROLE_PEOPLE_EMPLOYEE",
  LEAVE_EMPLOYEE = "ROLE_LEAVE_EMPLOYEE",
  ATTENDANCE_EMPLOYEE = "ROLE_ATTENDANCE_EMPLOYEE",
  ESIGN_EMPLOYEE = "ROLE_ESIGN_EMPLOYEE"
}

export enum ManagerTypes {
  PEOPLE_MANAGER = "ROLE_PEOPLE_MANAGER",
  LEAVE_MANAGER = "ROLE_LEAVE_MANAGER",
  ATTENDANCE_MANAGER = "ROLE_ATTENDANCE_MANAGER",
  INVOICE_MANAGER = "ROLE_INVOICE_MANAGER"
}

export enum SenderTypes {
  ESIGN_SENDER = "ROLE_ESIGN_SENDER"
}

export type AuthEmployeeType = {
  employeeId: number;
  firstName: string;
  lastName?: string | undefined;
  avatarUrl?: string;
  jobTitle?: string | null;
  authPic?: string | null;
  accountStatus?: string;
  email?: string;
};

export interface OrganizationSetupStatus {
  isSignUpCompleted: boolean;
  isOrganizationSetupCompleted: boolean;
}
