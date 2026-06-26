import {
  AttendanceSlotType,
  attendanceLeaveStatusTypes,
  attendanceStatusTypes
} from "./attendanceTypes";
import {
  CurrentAddTimeChangesType,
  DailyLogType,
  TimeAvailabilityType
} from "./timeSheetTypes";

interface actionsTypes {
  setAttendanceParams: (key: string, value: string) => void;
  setAttendanceLeaveStatus: (key: string, value: string | boolean) => void;
  setSlotType: (slotType: AttendanceSlotType) => AttendanceSlotType;
  setIsAttendanceModalOpen: (value: boolean) => void;
  setTimesheetRequestsFilters: (
    selectedFilters: Record<string, string[]>
  ) => void;
  resetTimesheetRequestParams: () => void;
  resetTimesheetRequestParamsToDefault: () => void;
  setTimesheetSelectedFilterLabels: (value: string[]) => void;
  setTimesheetRequestSelectedDates: (value: string[]) => void;
  setTimesheetRequestPagination: (page: number) => void;
  setTimesheetAnalyticsSelectedDates: (value: string[]) => void;
  setTimesheetAnalyticsMonthWeek: (value: string) => void;
  setTimesheetAnalyticsTeam: (value: number | string) => void;
  setTimesheetAnalyticsTeamName: (teamName: string) => void;
  setTimesheetAnalyticsPagination: (page: number) => void;
  setIsPreMidnightClockOutAlertOpen: (value: boolean) => void;
  setIsAutoClockOutMidnightModalOpen: (value: boolean) => void;
  setSelectedDailyRecord: (value: DailyLogType) => void;
  setIsEmployeeTimesheetModalOpen: (value: boolean) => void;
  setEmployeeTimesheetModalType: (value: string) => void;
  setEmployeeTimesheetRequestsFilters: (
    selectedFilters: Record<string, string[]>
  ) => void;
  setEmployeeTimesheetRequestSelectedDates: (value: string[]) => void;
  setEmployeeTimesheetSelectedFilterLabels: (value: string[]) => void;
  setEmployeeTimesheetRequestPagination: (page: number) => void;
  resetEmployeeTimesheetRequestParams: () => void;
  setTimeAvailabilityForPeriod: (value: TimeAvailabilityType) => void;
  setCurrentAddTimeChanges: (value: CurrentAddTimeChangesType) => void;
  setClockInType: (type: { [key: string]: (string | number)[] }) => void;
}

export interface AttendanceStore extends actionsTypes {
  attendanceParams: attendanceStatusTypes;
  attendanceLeaveStatus: attendanceLeaveStatusTypes;
  isAttendanceModalOpen: boolean;
  timesheetRequestsFilters: {
    status: string[];
  };
  selectedTimesheetFilterLabels: string[];
  timesheetRequestSelectedDates: string[];
  timesheetRequestParams: {
    status: string;
    startDate: string;
    endDate: string;
    page: number;
    size: number;
  };
  timesheetRequestsFilterValues: {
    status: { label: string; value: string }[];
  };
  timesheetAnalyticsParams: {
    startDate: string;
    endDate: string;
    isWeek: boolean;
    isMonth: boolean;
    teamId: number | string;
    page: number;
    size: number;
  };
  timesheetAnalyticsSelectedDates: string[];
  timesheetAnalyticsSelectedTeamName: string;
  isPreMidnightClockOutAlertOpen: boolean;
  isAutoClockOutMidnightModalOpen: boolean;
  selectedDailyRecord: DailyLogType | undefined;
  isEmployeeTimesheetModalOpen: boolean;
  employeeTimesheetModalType: string;
  employeeTimesheetRequestParams: {
    status: string;
    startDate: string;
    endDate: string;
    page: number;
    size: number;
  };
  employeeTimesheetRequestsFilters: {
    status: string[];
  };
  employeeTimesheetRequestSelectedDates: string[];
  employeeSelectedTimesheetFilterLabels: string[];
  employeeTimesheetRequestsFilterValues: {
    status: { label: string; value: string }[];
  };
  setTimesheetAnalyticsTeamName: (teamName: string) => void;
  timeAvailabilityForPeriod: TimeAvailabilityType;
  currentAddTimeChanges: CurrentAddTimeChangesType;
  clockInType: {
    [key: string]: (string | number)[];
  };
}
