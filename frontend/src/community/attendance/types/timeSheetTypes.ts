import { DateTime } from "luxon";

import { daysTypes } from "~community/common/constants/stringConstants";
import { LeaveStates } from "~community/common/types/CommonTypes";

export interface TimesheetEmployeeType {
  employeeId: number;
  firstName: string;
  lastName: string;
  avatarUrl: string;
}

export interface TimeRecordType {
  date: string;
  timeRecordId: number;
  leaveRequest?: {
    leaveState: LeaveStates;
    leaveType: {
      emojiCode: string;
      name: string;
    };
  };
  workedHours: number;
}

export interface TimeRecordDataType {
  timeRecords: TimeRecordType[];
  employee?: {
    employee?: {
      firstName?: string;
      lastName?: string;
      authPic?: string;
      employeeId?: number;
      designation?: string;
      jobLevel?: {
        name?: string;
      };
      jobRole?: {
        name?: string;
      };
      teams: {
        team: {
          teamName?: string;
        };
      }[];
    };
  };
}
export interface ManagerTimesheetHeaderType {
  headerDate: string;
  headerDateObject: Date;
}

export interface TimeRecordDataResponseType {
  items: TimeRecordDataType[];
  headerList?: ManagerTimesheetHeaderType[];
  totalItems: number;
  totalPages: number;
}

export interface TimeRecordParamsType {
  startDate: string;
  endDate: string;
  page?: number;
  size?: number;
  isExport?: boolean;
  teamId?: number;
  startDateOfYear?: string | DateTime<boolean>;
  endDateOfYear?: string | DateTime<boolean>;
}

export interface TeamTimeRecordParamsType {
  teamId: number;
  startDate: string;
  endDate: string;
  page?: number;
  size?: number;
  isExport?: boolean;
  startOfYear?: string | DateTime<boolean>;
  endOfYear?: string | DateTime<boolean>;
}

export interface TimeRequestDataType {
  initialClockIn?: string | number | null;
  initialClockOut?: string | number | null;
  requestedEndTime: string | number;
  requestedStartTime: string | number;
  status: string;
  timeRecord?: {
    date: string;
    timeRecordId: number;
    workedHours: number;
  };
  timeRequestId: number;
  workHours: number;
  employee?: {
    firstName?: string;
    lastName?: string;
    authPic?: string | null;
    employeeId?: number;
  };
  date?: string;
  requestType?: string;
}

export interface TimeRequestDataResponseType {
  items: TimeRequestDataType[];
  currentPage: number;
  totalItems: number;
  totalPages: number;
}

export interface TimeSlotsType {
  slotType: string;
  startTime: string;
  endTime: string;
  isManualEntry: boolean;
  isActiveRightNow?: boolean;
  timeSlotId?: string;
}

export interface LeaveRequestType {
  leaveRequestId: number;
  startDate: string;
  endDate: string;
  leaveType: {
    typeId: number;
    name: string;
    leaveDuration: string;
    emojiCode: string;
    colorCode: string;
    isCommentMandatory: boolean;
    isAttachmentMandatory: boolean;
    isAttachment: boolean;
  };
  leaveState: string;
  status: string;
  isViewed: boolean;
  durationDays: number;
  requestDesc: string;
  createdDate: string;
}

export interface HolidayType {
  name: string;
  holidayDuration: string;
}

export interface DailyLogType {
  timeRecordId: number;
  date: string;
  day: daysTypes;
  workedHours: number;
  breakHours: number;
  timeSlots: TimeSlotsType[];
  leaveRequest: LeaveRequestType | null;
  holiday: HolidayType | null;
}

export interface TimeAvailabilityType {
  date: string;
  editTimeRequests: {
    timeRequestId: string;
  };
  holiday: {
    date: string;
    holidayDuration: string;
  }[];
  leaveRequest: {
    leaveRequestId: string;
    leaveState: string;
    leaveType: {
      name: string;
      emoji: string;
    };
  }[];
  manualEntryRequests: {
    timeRequestId: string;
  }[];
  timeSlotsExists: boolean;
}

export interface CurrentAddTimeChangesType {
  timeEntryDate: string;
  fromTime: string;
  toTime: string;
}

export interface FilterChipType {
  label: string;
  value: string;
}

export interface ManualEntryPayloadType {
  recordId?: number;
  startTime: string;
  endTime: string;
  zoneId?: string;
}

export interface TimeEntryFormValueType {
  timeEntryDate: string;
  fromTime: string;
  toTime: string;
}

export interface TimeRequestParamsType {
  status: string;
  startDate: string;
  endDate: string;
  page: number;
  size: number;
  startDateOfYear?: string | DateTime<boolean>;
  endDateOfYear?: string | DateTime<boolean>;
}

export const TimeUtilizationTrendTypes = {
  TREND_UP: "up",
  TREND_DOWN: "down"
};
