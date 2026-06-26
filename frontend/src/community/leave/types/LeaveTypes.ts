import { DropdownListType } from "~community/common/types/CommonTypes";
import { LeaveDurationTypes } from "~community/leave/enums/LeaveTypeEnums";
import { EmploymentAllocationTypes } from "~community/people/types/AddNewResourceTypes";

export interface LeaveEntitlementDropdownListType extends DropdownListType {
  leaveDuration: LeaveDurationTypes;
}

export type LeaveCycleStartEndDatesType = {
  startDate: number;
  startMonth: number;
  endDate: number;
  endMonth: number;
  isDefault: boolean;
};

export interface leaveBulkUploadResponse {
  bulkRecordErrorLogs: bulkRecordErrorLogType[];
  bulkStatusSummary: bulkStatusSummary;
}

export interface bulkRecordErrorLogType {
  id: number;
  status: string;
  message: string;
}

export interface bulkStatusSummary {
  successCount: number;
  failedCount: number;
}

export enum EntitlementYears {
  CURRENT = "CURRENT",
  NEXT = "NEXT"
}

export interface Team {
  teamId: number;
  teamName: string;
  isSupervisor: boolean | null;
}
export interface Entitlement {
  carryForwardAmount: number;
  leaveTypeId: number;
  name: string;
  totalDaysAllocated: number;
  totalDaysUsed: number;
}
export enum AccountStatus {
  PENDING = " PENDING",
  COMPLETED = "COMPLETED",
  TERMINATED = "TERMINATED"
}
export interface Employee {
  employeeId: number;
  accountStatus: AccountStatus;
  firstName: string;
  lastName: string;
  employmentAllocation: EmploymentAllocationTypes;
  employmentStatus: "ACTIVE" | "INACTIVE";
  email?: string | null;
  phone?: string | null;
  designation?: string | null;
  jobTitle?: string | null;
  teams: Team[];
  employeeEducations?: Array<any>;
  employeeEmergencies?: Array<any>;
  employeeFamilies?: Array<any>;
  employeePersonalInfo?: any;
  employeeProgressions?: Array<any>;
  employeeVisas?: Array<any>;
  [key: string]: any;
}

export interface CarryForwardEntitlement {
  employee: Employee;
  entitlements: Entitlement[];
}
export type carryForwardLeaveEntitlmentResponseType = {
  items: CarryForwardEntitlement[];
  currentPage: number;
  totalItems: number;
  totalPages: number;
};

export interface LeaveStatusTypeFilter {
  status: string[];
  type: string[];
}

export interface LeaveRequestsFilterType {
  status: string[] | [];
  type: string[] | [];
  date: string;
}

export enum LeaveStatusTypes {
  APPROVED = "APPROVED",
  CANCELLED = "CANCELLED",
  DENIED = "DENIED",
  PENDING = "PENDING",
  REVOKED = "REVOKED",
  SUPERVISOR_NUDGED = "SUPERVISOR_NUDGED"
}

export interface EmployeeType {
  employeeId: number | string;
  name: string | null;
  lastName: string | null;
  designation: string | null;
  authPic: string | null;
}
