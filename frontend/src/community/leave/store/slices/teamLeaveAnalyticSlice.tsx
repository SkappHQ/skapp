import {
  SetType,
  SortKeyTypes,
  SortOrderTypes
} from "~community/common/types/CommonTypes";
import { getDateForPeriod } from "~community/common/utils/dateTimeUtils";
import { TeamLeaveAnalyticSliceTypes } from "~community/leave/types/SliceTypes";

const teamLeaveAnalyticSlice = (
  set: SetType<TeamLeaveAnalyticSliceTypes>
): TeamLeaveAnalyticSliceTypes => ({
  teamLeaveAnalyticSelectedDates: [],
  teamLeaveAnalyticParams: {
    status: null,
    leaveType: null,
    startDate: getDateForPeriod("year", "start"),
    endDate: getDateForPeriod("year", "end"),
    teamMemberIds: null,
    page: 0,
    sortKey: SortKeyTypes.CREATED_DATE,
    sortOrder: SortOrderTypes.ASC,
    size: "4",
    isExport: true
  },
  setTeamLeaveAnalyticsParams: (key: string, value: string | string[]) => {
    set((state: TeamLeaveAnalyticSliceTypes) => ({
      ...state,
      teamLeaveAnalyticParams: {
        ...state.teamLeaveAnalyticParams,
        page: 0,
        [key]: Array.isArray(value) ? value.join(",") : value
      }
    }));
  },
  resetTeamLeaveAnalyticsParams: () => {
    set((state: TeamLeaveAnalyticSliceTypes) => ({
      teamLeaveAnalyticParams: {
        ...state.teamLeaveAnalyticParams,
        status: null,
        leaveType: null,
        startDate: getDateForPeriod("year", "start"),
        endDate: getDateForPeriod("year", "end"),
        teamMemberIds: null,
        page: 0,
        size: "4"
      }
    }));
  },
  setTeamLeaveAnalyticSelectedDates: (value: string[]) => {
    set((state: TeamLeaveAnalyticSliceTypes) => ({
      ...state,
      teamLeaveAnalyticSelectedDates: value,
      teamLeaveAnalyticParams: {
        ...state.teamLeaveAnalyticParams,
        startDate: value[0],
        endDate: value[1],
        page: 0
      }
    }));
  },
  setTeamLeaveAnalyticsPagination: (page: number) => {
    set((state: TeamLeaveAnalyticSliceTypes) => ({
      ...state,
      teamLeaveAnalyticParams: {
        ...state.teamLeaveAnalyticParams,
        page
      }
    }));
  }
});

export default teamLeaveAnalyticSlice;
