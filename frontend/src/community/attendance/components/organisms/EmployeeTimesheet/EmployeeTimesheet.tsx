import { useAuth } from "~community/common/context/AuthContext";
import { JSX, useState } from "react";

import {
  useGetDailyLogs,
  useGetEmployeeWorkSummary,
  useGetTimeSheetRequests
} from "~community/attendance/api/AttendanceEmployeeApi";
import EmployeeTimesheetRequestTable from "~community/attendance/components/molecules/EmployeeTimesheetRequestTable/EmployeeTimesheetRequestTable";
import TimesheetDailyLog from "~community/attendance/components/molecules/TimesheetDailyLog/TimesheetDailyLog";
import TimesheetDailyLogFilter from "~community/attendance/components/molecules/TimesheetDailyLogFilter/TimesheetDailyLogFilter";
import EmployeeTimesheetPopupController from "~community/attendance/components/organisms/EmployeeTimesheetPopupController/EmployeeTimesheetPopupController";
import { downloadEmployeeDailyLogCsv } from "~community/attendance/utils/TimesheetCsvUtil";
import { dateValidation } from "~community/common/utils/validation";
import { useDefaultCapacity } from "~community/configurations/api/timeConfigurationApi";

const EmployeeTimesheet = (): JSX.Element => {
  const [startTime, setStartTime] = useState<string>("");
  const [endTime, setEndTime] = useState<string>("");
  const { data: session } = useAuth();

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
            session?.user.employee?.firstName || "",
            startTime,
            endTime
          );
        }}
        isDailyLogLoading={isDailyLogLoading}
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
