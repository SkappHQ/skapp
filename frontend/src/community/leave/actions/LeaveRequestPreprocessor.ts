import {
  LeaveRequestItemsType,
  LeaveRequestResultsType,
  LeaveStatusTypes
} from "../types/LeaveRequestTypes";
import {
  getLeaveRequestStatus,
  getLeaveRequestsLeaveState,
  getStartEndDate
} from "../utils/LeavePreprocessors";

export function leaveRequestPreProcessor(
  data: LeaveRequestResultsType
): LeaveRequestResultsType {
  const preProcessedData = data?.items?.map(
    (request: LeaveRequestItemsType) => {
      return {
        ...request,
        leaveRequestDates: getStartEndDate(request.startDate, request.endDate),
        status: getLeaveRequestStatus(request.status) as LeaveStatusTypes,
        leaveState: getLeaveRequestsLeaveState(
          request.startDate,
          request.endDate,
          request.leaveState
        )
      };
    }
  );
  return { ...data, items: preProcessedData };
}
