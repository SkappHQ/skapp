import {
  TimeSheetRequestStates,
  TimesheetAnalyticsTabTypes
} from "~community/attendance/enums/timesheetEnums";
import { ManagerTimesheetFiltersSliceTypes } from "~community/attendance/types/attendanceSliceTypes";
import { SetType } from "~community/common/types/storeTypes";
import {
  getLocalDate,
  getStartAndEndOfCurrentMonth,
  getStartAndEndOfCurrentWeek
} from "~community/common/utils/dateTimeUtils";

const managerTimesheetFiltersSlice = (
  set: SetType<ManagerTimesheetFiltersSliceTypes>
): ManagerTimesheetFiltersSliceTypes => ({
  timesheetRequestsFilters: {
    status: []
  },
  timesheetRequestSelectedDates: [],
  selectedTimesheetFilterLabels: [],
  timesheetRequestParams: {
    status: TimeSheetRequestStates.PENDING,
    startDate: "",
    endDate: "",
    page: 1,
    size: 5
  },
  timesheetRequestsFilterValues: {
    status: [
      { label: "Pending", value: TimeSheetRequestStates.PENDING },
      { label: "Approved", value: TimeSheetRequestStates.APPROVED },
      { label: "Denied", value: TimeSheetRequestStates.DENIED },
      { label: "Cancelled", value: TimeSheetRequestStates.CANCELLED }
    ]
  },

  timesheetAnalyticsSelectedDates: [],
  timesheetAnalyticsParams: {
    startDate: "",
    endDate: "",
    isWeek: true,
    isMonth: false,
    teamId: -1,
    page: 0,
    size: 6
  },
  timesheetAnalyticsSelectedTeamName: "",

  setTimesheetRequestsFilters: (selectedFilters: Record<string, string[]>) => {
    set((state) => ({
      ...state,
      timesheetRequestsFilters: {
        ...state.timesheetRequestsFilters,
        status: selectedFilters?.status
      },
      timesheetRequestParams: {
        ...state.timesheetRequestParams,
        status: selectedFilters?.status
          ? selectedFilters?.status?.toString()
          : "",
        page: 1
      }
    }));
  },

  resetTimesheetRequestParams: () => {
    set((state) => ({
      timesheetRequestsFilters: {
        status: [] as string[]
      },
      selectedTimesheetFilterLabels: [] as string[],
      timesheetRequestParams: {
        ...state.timesheetRequestParams,
        status: "",
        page: 1
      }
    }));
  },

  resetTimesheetRequestParamsToDefault: () => {
    set((state) => ({
      timesheetRequestsFilters: {
        status: []
      },
      selectedTimesheetFilterLabels: [],
      timesheetRequestSelectedDates: [],
      timesheetRequestParams: {
        ...state.timesheetRequestParams,
        status: "",
        startDate: "",
        endDate: "",
        page: 1,
        size: 4
      }
    }));
  },

  setTimesheetSelectedFilterLabels: (value: string[]) => {
    set((state) => ({
      ...state,
      selectedTimesheetFilterLabels: value
    }));
  },

  setTimesheetRequestSelectedDates: (value: string[]) => {
    set((state) => ({
      ...state,
      timesheetRequestSelectedDates: value,
      timesheetRequestParams: {
        ...state.timesheetRequestParams,
        startDate: value[0],
        endDate: value[1],
        page: 1
      }
    }));
  },

  setTimesheetRequestPagination: (page: number) => {
    set((state) => ({
      ...state,
      timesheetRequestParams: {
        ...state.timesheetRequestParams,
        page
      }
    }));
  },

  setTimesheetAnalyticsSelectedDates: (value: string[]) => {
    set((state) => ({
      ...state,
      timesheetAnalyticsSelectedDates: value,
      timesheetAnalyticsParams: {
        ...state.timesheetAnalyticsParams,
        startDate: value[0],
        endDate: value[1],
        page: 0
      }
    }));
  },

  setTimesheetAnalyticsMonthWeek: (value: string) => {
    if (value === TimesheetAnalyticsTabTypes.WEEK) {
      const { startOfWeek, endOfWeek } = getStartAndEndOfCurrentWeek();
      set((state) => ({
        ...state,
        timesheetAnalyticsParams: {
          ...state.timesheetAnalyticsParams,
          startDate: getLocalDate(startOfWeek),
          endDate: getLocalDate(endOfWeek),
          isWeek: true,
          isMonth: false,
          page: 0
        }
      }));
    } else if (value === TimesheetAnalyticsTabTypes.MONTH) {
      const { startOfMonth, endOfMonth } = getStartAndEndOfCurrentMonth();
      set((state) => ({
        ...state,
        timesheetAnalyticsParams: {
          ...state.timesheetAnalyticsParams,
          startDate: getLocalDate(startOfMonth),
          endDate: getLocalDate(endOfMonth),
          isWeek: false,
          isMonth: true,
          page: 0
        }
      }));
    } else if (value === TimesheetAnalyticsTabTypes.RANGE) {
      set((state) => ({
        ...state,
        timesheetAnalyticsParams: {
          ...state.timesheetAnalyticsParams,
          isWeek: false,
          isMonth: false,
          page: 0
        }
      }));
    }
  },

  setTimesheetAnalyticsTeam: (teamId: string | number) => {
    set((state) => ({
      ...state,
      timesheetAnalyticsParams: {
        ...state.timesheetAnalyticsParams,
        teamId,
        page: 0
      }
    }));
  },

  setTimesheetAnalyticsPagination: (page: number) => {
    set((state) => ({
      ...state,
      timesheetAnalyticsParams: {
        ...state.timesheetAnalyticsParams,
        page
      }
    }));
  },

  setTimesheetAnalyticsTeamName: (teamName: string) => {
    set((state) => ({
      ...state,
      timesheetAnalyticsSelectedTeamName: teamName
    }));
  }
});

export default managerTimesheetFiltersSlice;
