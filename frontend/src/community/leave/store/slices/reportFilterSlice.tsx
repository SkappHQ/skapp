import {
  SortKeyTypes,
  SortOrderTypes
} from "~community/common/types/CommonTypes";
import { MenuitemsDataTypes } from "~community/common/types/filterTypes";
import { ReportsParams } from "~community/leave/types/LeaveReportTypes";

const reportsFiltersSlice = (set: any): any => ({
  reportsFilter: {
    leaveType: []
  },
  reportsFilterOrder: [],
  reportsFilterOrderIds: [],
  reportsParams: {
    year: new Date().getFullYear().toString(),
    leaveTypeId: "-1",
    jobRoleId: "",
    teamId: "1",
    page: 0,
    size: 5,
    sortKey: SortKeyTypes.NAME,
    sortOrder: SortOrderTypes.ASC,
    leaveStatus: ""
  },
  menuItems: [] as MenuitemsDataTypes[],

  setReportsParams: (key: string, value: any) => {
    set((state: any) => {
      return {
        ...state,
        reportsParams: {
          ...state.reportsParams,
          [key]: value
        }
      };
    });
  },

  setReportsFilter: (key: string, value: string | string[]) => {
    set((state: any) => {
      return {
        ...state,
        reportsFilter: {
          ...state.reportsFilter,
          [key]: value
        }
      };
    });
  },

  setReportsFilterOrder: (value: string[]) => {
    set((state: any) => {
      return {
        ...state,
        reportsFilterOrder: value
      };
    });
  },

  setReportsFilterOrderIds: (value: string[]) => {
    set((state: any) => {
      return {
        ...state,
        reportsFilterOrderIds: value
      };
    });
  },

  setReportsPagination: (value: number) => {
    set((state: any) => ({
      ...state,
      reportsParams: {
        ...state.reportsParams,
        page: value
      }
    }));
  },

  setMenuItems: (value: MenuitemsDataTypes[]) => {
    set((state: any) => ({
      ...state,
      menuItems: value
    }));
  },

  resetReportsParams: () => {
    set((state: { reportsParams: ReportsParams }) => ({
      reportsParams: {
        year: new Date().getFullYear().toString(),
        leaveTypeId: "-1",
        jobRoleId: "",
        teamId: state.reportsParams?.teamId ?? "",
        page: 0,
        size: 5,
        sortKey: SortKeyTypes.NAME,
        sortOrder: SortOrderTypes.ASC,
        leaveStatus: ""
      }
    }));
  },

  resetReportsFilter: () => {
    set({
      reportsFilter: {
        leaveType: []
      }
    });
  },

  resetReportsFilterOrder: () => {
    set({
      reportsFilterOrder: []
    });
  },

  resetReportsFilterOrderIds: () => {
    set({
      reportsFilterOrderIds: []
    });
  }
});

export default reportsFiltersSlice;
