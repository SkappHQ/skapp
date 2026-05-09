import { DropdownListType } from "~community/common/types/CommonTypes";
import { LeaveDurationTypes } from "~community/leave/enums/LeaveTypeEnums";
import { EmployeeType } from "~community/people/types/EmployeeTypes";

export interface CustomLeaveAllocationType {
  entitlementId: number;
  employeeId: number;
  name?: string;
  numberOfDaysOff: number;
  typeId: number;
  validFromDate?: string;
  validToDate?: string;
  assignedTo?: EmployeeType;
  totalDaysAllocated?: number;
  totalDaysUsed?: number;
}

export interface LeaveAllocation {
  entitlementId: number;
  employee: {
    employeeId: number;
    firstName: string;
    lastName: string;
    authPic: string;
  };
  totalDaysAllocated: number;
  leaveType: {
    typeId: number;
    emojiCode?: string;
    name: string;
  };
  validTo: string;
  validFrom: string;
  totalDaysUsed?: number;
}

export enum CustomLeaveAllocationModalTypes {
  NONE = "NONE",
  UNSAVED_ADD_LEAVE_ALLOCATION = "UNSAVED_ADD_LEAVE_ALLOCATION",
  EDIT_LEAVE_ALLOCATION = "EDIT_LEAVE_ALLOCATION",
  ADD_LEAVE_ALLOCATION = "ADD_LEAVE_ALLOCATION",
  CONFIRM_DELETE = "CONFIRM_DELETE"
}

export type ExtractedDataType = {
  typeId: number;
  name: string;
};
export interface LeaveTypesWithToggleType {
  labels: string[];
  toggle: Record<string, boolean>;
  colorArray: string[];
  transformedData: Record<string, string>;
  extractedData: ExtractedDataType[];
  allId: number[];
}

export interface LeaveType {
  typeId: number;
  name: LeaveTypes;
  emoji: string;
  color: string;
  calculationType: string;
  leaveDuration: string;
  autoApprovalEnabled: boolean;
  active: boolean;
  attachment: boolean;
  attachmentMandatory: boolean;
  commentMandatory: boolean;
  carryForwardEnabled: boolean;
}

export enum LeaveTypes {
  CASUAL = "Casual",
  ANNUAL = "Annual",
  MEDICAL = "Medical",
  MATERNITY = "Maternity",
  ACADEMIC = "Academic",
  CUSTOM = "Custom",
  SICK = "Sick"
}

export interface LeaveEntitlementDropdownListType extends DropdownListType {
  leaveDuration: LeaveDurationTypes;
}
