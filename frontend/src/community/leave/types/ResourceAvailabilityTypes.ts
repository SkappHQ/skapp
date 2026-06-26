import {
  LeaveRequestStates,
  LeaveStates
} from "~community/common/types/CommonTypes";

import { leaveDurationTypes } from "./LeaveTypes";

export interface LeaveType {
  typeId: number;
  name: string;
  emojiCode: string;
  colorCode: string;
}

export interface Employee {
  employeeId: number;
  firstName: string;
  lastName: string;
  middleName?: string | null;
  authPic: string;
}

export interface LeaveRequest {
  leaveRequestId: number;
  leaveState: LeaveStates;
  status: LeaveRequestStates;
  startDate: string;
  endDate: string;
  leaveType: LeaveType;
  employee: Employee;
  reviewer?: Employee | null;
}

export interface Holiday {
  id: string;
  name: string;
  holidayDuration: leaveDurationTypes;
}

export interface ResourceAvailabilityRecord {
  date: string;
  actualDate: string;
  dayOfWeek: string;
  leaveCount: number;
  availableCount: number;
  leaveRequests: LeaveRequest[];
  holidays: Holiday[];
}
