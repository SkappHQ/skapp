import { DayOfWeek } from "~community/common/enums/CommonEnums";
import { LeaveStates } from "~community/common/types/CommonTypes";
import { LeaveStatusEnums } from "~community/leave/enums/MyRequestEnums";
import { LeaveTypeType } from "~community/leave/types/AddLeaveTypes";
import { HolidayDurationType } from "~community/people/types/HolidayTypes";

export interface LeaveAllocationDataTypes {
  entitlementId: number;
  leaveType: LeaveTypeType;
  validFrom: string;
  validTo: string;
  isActive: boolean;
  totalDaysAllocated: number;
  totalDaysUsed: number;
  balanceInDays: number;
  reason: null;
  isManual: null;
  isOverride: null;
  employee: null;
}

export interface ResourceAvailabilityParamTypes {
  teams: number | null;
  startDate: string;
  endDate: string;
}

export interface EmployeeType {
  employeeId: number;
  firstName: string;
  lastName: string;
  middleName: string;
  authPic: string;
}

export interface LeaveRequestType {
  employee: EmployeeType;
  endDate: string;
  leaveRequestId: number;
  leaveState: LeaveStates;
  leaveType: {
    typeId: number;
    name: string;
    emojiCode: string;
    colorCode: string;
  };
  reviewer: EmployeeType | null;
  startDate: string;
  status: LeaveStatusEnums;
}

export interface HolidayType {
  id: number;
  name: string;
  holidayDuration: HolidayDurationType;
}

export interface ResourceAvailabilityPayload {
  date: string;
  dayOfWeek: DayOfWeek;
  leaveCount: number;
  availableCount: number;
  leaveRequests: LeaveRequestType[];
  holidays: HolidayType[];
}

export interface MyLeaveRequestPayloadType {
  leaveRequestId: number;
  startDate: string;
  endDate: string;
  leaveType: {
    typeId: number;
    name: string;
    emojiCode: string;
    colorCode: string;
  };
  leaveState: LeaveStates;
  status: LeaveStatusEnums;
  isViewed: boolean | null;
  durationDays: number;
  requestDesc: string;
}

export interface TeamAvailabilityDataType {
  date: string;
  dayOfWeek: DayOfWeek;
  leaveCount: number;
  availableCount: number;
  employees: {
    firstName: string;
    lastName: string;
    image: string;
    leaveState: LeaveStates;
  }[];
  holidays: HolidayType[];
}

export interface LeaveRequestPayloadType {
  typeId: number;
  startDate: string;
  endDate: string;
  leaveState: LeaveStates;
  requestDesc: string;
  attachments: string[];
}

export interface LeaveEntitlementsCardType {
  entitlementId: number;
  leaveType: SummarizedLeaveType;
  totalDaysAllocated: number;
  balanceInDays: number;
}

export interface SummarizedLeaveType {
  typeId: number;
  name: string;
  emojiCode: string;
  colorCode: string;
}
