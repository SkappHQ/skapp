import { SetType, SortKeyTypes } from "~community/common/types/CommonTypes";
import { LeaveStatusTypes } from "~community/leave/types/LeaveTypes";
import { LeaveRequestFiltersSliceTypes } from "~community/leave/types/SliceTypes";

const leaveRequestFilterSlice = (
  set: SetType<LeaveRequestFiltersSliceTypes>
): LeaveRequestFiltersSliceTypes => ({
  leaveRequestsFilter: {
    status: [LeaveStatusTypes.PENDING],
    type: [],
    date: ""
  },
  leaveRequestFilterOrder: [LeaveStatusTypes.PENDING],
  leaveRequestParams: {
    status: LeaveStatusTypes.PENDING,
    leaveType: "",
    startDate: "",
    endDate: "",
    page: 0,
    sortKey: SortKeyTypes.CREATED_DATE,
    size: "4"
  },

  handleLeaveRequestsSort: (key: string, value: string) => {
    set((state: LeaveRequestFiltersSliceTypes) => ({
      ...state,
      leaveRequestParams: {
        ...state.leaveRequestParams,
        page: 0,
        [key]: value
      }
    }));
  },

  setLeaveRequestsFilter: (key: string, value: string[] | string) => {
    set((state: LeaveRequestFiltersSliceTypes) => ({
      ...state,
      leaveRequestsFilter: {
        ...state.leaveRequestsFilter,
        [key]: value
      }
    }));
  },

  setLeaveRequestParams: (key: string, value: string | string[]) => {
    let types: string = "";
    if (typeof value !== "string") {
      for (const element of value) {
        const item: string = element.toString();
        const type: string = item + ",";
        types = types + type;
      }
    } else {
      types = value;
    }
    set((state: LeaveRequestFiltersSliceTypes) => ({
      ...state,
      leaveRequestParams: {
        ...state.leaveRequestParams,
        page: 0,
        [key]: types
      }
    }));
  },

  resetLeaveRequestParams: () => {
    set((state: LeaveRequestFiltersSliceTypes) => ({
      leaveRequestsFilter: {
        status: [] as string[],
        type: [] as string[],
        date: ""
      },
      leaveRequestFilterOrder: [] as string[],
      leaveRequestParams: {
        ...state.leaveRequestParams,
        status: "",
        leaveType: "",
        startDate: "",
        endDate: "",
        page: 0,
        size: "4"
      }
    }));
  },

  setLeaveRequestFilterOrder: (value: string[]) => {
    set((state: LeaveRequestFiltersSliceTypes) => ({
      ...state,
      leaveRequestFilterOrder: value
    }));
  },

  setPagination: (page: number) => {
    set((state: LeaveRequestFiltersSliceTypes) => ({
      ...state,
      leaveRequestParams: {
        ...state.leaveRequestParams,
        page
      }
    }));
  }
});

export default leaveRequestFilterSlice;
