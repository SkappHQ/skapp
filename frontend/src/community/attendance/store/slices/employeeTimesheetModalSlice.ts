import { EmployeeTimesheetModalTypes } from "~community/attendance/enums/timesheetEnums";
import { EmployeeTimesheetModalSliceType } from "~community/attendance/types/attendanceSliceTypes";
import {
  CurrentAddTimeChangesType,
  DailyLogType,
  TimeAvailabilityType
} from "~community/attendance/types/timeSheetTypes";
import { SetType } from "~community/common/types/storeTypes";

export const employeeTimesheetModalSlice = (
  set: SetType<EmployeeTimesheetModalSliceType>
): EmployeeTimesheetModalSliceType => ({
  selectedDailyRecord: undefined,
  isEmployeeTimesheetModalOpen: false,
  timeAvailabilityForPeriod: {} as TimeAvailabilityType,
  currentAddTimeChanges: {} as CurrentAddTimeChangesType,
  employeeTimesheetModalType: EmployeeTimesheetModalTypes.ADD_TIME_ENTRY,

  setSelectedDailyRecord: (record: DailyLogType) =>
    set((state: EmployeeTimesheetModalSliceType) => ({
      ...state,
      selectedDailyRecord: record
    })),
  setIsEmployeeTimesheetModalOpen: (value: boolean) =>
    set((state: EmployeeTimesheetModalSliceType) => ({
      ...state,
      isEmployeeTimesheetModalOpen: value
    })),
  setEmployeeTimesheetModalType: (value: string) =>
    set((state: EmployeeTimesheetModalSliceType) => ({
      ...state,
      employeeTimesheetModalType: value
    })),
  setTimeAvailabilityForPeriod: (record: TimeAvailabilityType) =>
    set((state: EmployeeTimesheetModalSliceType) => ({
      ...state,
      timeAvailabilityForPeriod: record
    })),
  setCurrentAddTimeChanges: (value: CurrentAddTimeChangesType) =>
    set((state: EmployeeTimesheetModalSliceType) => ({
      ...state,
      currentAddTimeChanges: value
    }))
});
