import { EmployeeTimesheetFilterSliceTypes } from "~community/attendance/types/attendanceSliceTypes";
import { SetType } from "~community/common/types/storeTypes";

const employeeTimesheetFilterSlice = (
  set: SetType<EmployeeTimesheetFilterSliceTypes>
): EmployeeTimesheetFilterSliceTypes => ({
  employeeTimesheetRequestsFilters: {
    status: []
  },
  employeeTimesheetRequestSelectedDates: [],
  employeeSelectedTimesheetFilterLabels: [],
  employeeTimesheetRequestParams: {
    status: "",
    startDate: "",
    endDate: "",
    page: 0,
    size: 4
  },
  employeeTimesheetRequestsFilterValues: {
    status: [
      { label: "Pending", value: "PENDING" },
      { label: "Approved", value: "APPROVED" },
      { label: "Denied", value: "DENIED" },
      { label: "Cancelled", value: "CANCELLED" }
    ]
  },

  setEmployeeTimesheetRequestsFilters: (
    selectedFilters: Record<string, string[]>
  ) => {
    set((state) => ({
      ...state,
      employeeTimesheetRequestsFilters: {
        ...state.employeeTimesheetRequestsFilters,
        status: selectedFilters?.status
      },
      employeeTimesheetRequestParams: {
        ...state.employeeTimesheetRequestParams,
        status: selectedFilters?.status
          ? selectedFilters?.status?.toString()
          : "",
        page: 0
      }
    }));
  },

  resetEmployeeTimesheetRequestParams: () => {
    set((state) => ({
      employeeTimesheetRequestsFilters: {
        status: [] as string[]
      },
      employeeSelectedTimesheetFilterLabels: [] as string[],
      employeeTimesheetRequestParams: {
        ...state.employeeTimesheetRequestParams,
        status: "",
        page: 0,
        size: 4
      }
    }));
  },

  setEmployeeTimesheetSelectedFilterLabels: (value: string[]) => {
    set((state) => ({
      ...state,
      employeeSelectedTimesheetFilterLabels: value
    }));
  },

  setEmployeeTimesheetRequestSelectedDates: (value: string[]) => {
    set((state) => ({
      ...state,
      employeeTimesheetRequestSelectedDates: value,
      employeeTimesheetRequestParams: {
        ...state.employeeTimesheetRequestParams,
        startDate: value[0],
        endDate: value[1],
        page: 0
      }
    }));
  },

  setEmployeeTimesheetRequestPagination: (page: number) => {
    set((state) => ({
      ...state,
      employeeTimesheetRequestParams: {
        ...state.employeeTimesheetRequestParams,
        page
      }
    }));
  }
});

export default employeeTimesheetFilterSlice;
