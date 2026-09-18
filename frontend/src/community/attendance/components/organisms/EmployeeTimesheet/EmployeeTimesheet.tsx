import { JSX, useMemo, useState } from "react";

import {
  useGetDailyLogs,
  useGetEmployeeWorkSummary,
  useGetTimeSheetRequests
} from "~community/attendance/api/AttendanceEmployeeApi";
import EmployeeTimesheetRequestTable from "~community/attendance/components/molecules/EmployeeTimesheetRequestTable/EmployeeTimesheetRequestTable";
import TimesheetDailyLog from "~community/attendance/components/molecules/TimesheetDailyLog/TimesheetDailyLog";
import TimesheetDailyLogFilter from "~community/attendance/components/molecules/TimesheetDailyLogFilter/TimesheetDailyLogFilter";
import EmployeeTimesheetPopupController from "~community/attendance/components/organisms/EmployeeTimesheetPopupController/EmployeeTimesheetPopupController";
import useManualEntryRestriction from "~community/attendance/hooks/useManualEntryRestriction";
import { downloadEmployeeDailyLogCsv } from "~community/attendance/utils/TimesheetCsvUtil";
import { useAuth } from "~community/auth/providers/AuthProvider";
import { dateValidation } from "~community/common/utils/validation";
import { useDefaultCapacity } from "~community/configurations/api/timeConfigurationApi";
import { L1EmployeeType } from "~community/people/types/PeopleTypes";

const EmployeeTimesheet = (): JSX.Element => {
  const [startTime, setStartTime] = useState<string>("");
  const [endTime, setEndTime] = useState<string>("");
  const { user } = useAuth();
  const { canDirectlyAddOrEditEntry } = useManualEntryRestriction();

  const { data: workSummaryData } = useGetEmployeeWorkSummary(
    startTime,
    endTime,
    dateValidation(startTime) && dateValidation(endTime)
  );
  const { data: dailyLogData, isLoading: isDailyLogLoading } = useGetDailyLogs(
    startTime,
    endTime,
    dateValidation(startTime) && dateValidation(endTime)
  );
  const { data: requestData, isLoading: isRequestLoading } =
    useGetTimeSheetRequests();

  const { data: timeConfigData } = useDefaultCapacity();

  const selfTargetEmployeeId = canDirectlyAddOrEditEntry
    ? user?.userId
    : undefined;

  const selfTargetEmployeeDetails: L1EmployeeType | undefined = useMemo(() => {
    if (!canDirectlyAddOrEditEntry || !user?.userId) return undefined;

    return {
      personal: {
        general: {
          firstName:
            user?.employee?.firstName || user?.name || user?.email || "",
          lastName: user?.employee?.lastName ?? ""
        }
      }
    };
  }, [
    canDirectlyAddOrEditEntry,
    user?.userId,
    user?.employee,
    user?.name,
    user?.email
  ]);

  return (
    <>
      <TimesheetDailyLogFilter
        setStartTime={setStartTime}
        setEndTime={setEndTime}
      />
      <TimesheetDailyLog
        workSummaryData={workSummaryData}
        dailyLogData={dailyLogData || []}
        downloadEmployeeDailyLogCsv={() => {
          downloadEmployeeDailyLogCsv(
            dailyLogData || [],
            user?.employee?.firstName || "",
            startTime,
            endTime
          );
        }}
        isDailyLogLoading={isDailyLogLoading}
        targetEmployeeId={selfTargetEmployeeId}
        targetEmployeeDetails={selfTargetEmployeeDetails}
        isSelfTargetEntry={canDirectlyAddOrEditEntry}
      />
      <EmployeeTimesheetRequestTable
        requestData={requestData}
        isRequestLoading={isRequestLoading}
        totalHours={timeConfigData?.[0]?.totalHours}
      />
      <EmployeeTimesheetPopupController />
    </>
  );
};

export default EmployeeTimesheet;
