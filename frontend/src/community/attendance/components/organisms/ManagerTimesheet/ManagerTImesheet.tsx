import { JSX } from "react";

import {
  useGetManagerTimeRecords,
  useGetManagerTimeSheetRequests,
  useGetManagerWorkSummary
} from "~community/attendance/api/attendanceManagerApi";
import ManagerTimesheetRequestTable from "~community/attendance/components/molecules/ManagerTimesheetRequestTable/ManagerTimesheetRequestTable";
import TimesheetAnalytics from "~community/attendance/components/molecules/TimesheetAnalytics/TimesheetAnalytics";
import EmployeeTimesheetPopupController from "~community/attendance/components/organisms/EmployeeTimesheetPopupController/EmployeeTimesheetPopupController";
import useApproveDenyTimeRequest from "~community/attendance/hooks/useApproveDenyTimeRequest";
import { TimeRecordDataResponseType } from "~community/attendance/types/timeSheetTypes";
import { TableNames } from "~community/common/enums/Table";
import { useDefaultCapacity } from "~community/configurations/api/timeConfigurationApi";

interface ManagerTimesheetProps {
  showRequestTable?: boolean;
  isTeamSelectionAvailable?: boolean;
  selectedTeamName?: string;
}

const ManagerTimesheet = ({
  showRequestTable = true,
  isTeamSelectionAvailable = true,
  selectedTeamName
}: ManagerTimesheetProps): JSX.Element => {
  const { data: recordData, isLoading: isRecordLoading } =
    useGetManagerTimeRecords();
  const { data: workSummaryData } = useGetManagerWorkSummary();

  const {
    approveTimesheetRequest,
    declineTimesheetRequest,
    isApproveDenyLoading
  } = useApproveDenyTimeRequest();

  const { data: requestData, isLoading: isRequestLoading } =
    useGetManagerTimeSheetRequests();

  const { data: timeConfigData } = useDefaultCapacity();

  return (
    <>
      <EmployeeTimesheetPopupController />
      <TimesheetAnalytics
        recordData={recordData as TimeRecordDataResponseType}
        workSummaryData={workSummaryData}
        isManager={true}
        isRecordLoading={isRecordLoading}
        isTeamSelectionAvailable={isTeamSelectionAvailable}
        selectedTeamName={selectedTeamName}
      />
      {showRequestTable && (
        <ManagerTimesheetRequestTable
          requestData={requestData}
          isRequestLoading={isRequestLoading}
          totalHours={timeConfigData?.[0]?.totalHours}
          hasFullList={false}
          approveTimesheetRequest={approveTimesheetRequest}
          declineTimesheetRequest={declineTimesheetRequest}
          isApproveDenyLoading={isApproveDenyLoading}
          tableName={TableNames.REQUESTS_AWAITING_FOR_APPROVAL}
        />
      )}
    </>
  );
};

export default ManagerTimesheet;
