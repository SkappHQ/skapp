import { Box, Stack } from "@mui/material";
import { LeaveIcon, TimesheetIcon } from "@rootcodelabs/skapp-ui";
import { JSX } from "react";

import { DailyLogType } from "~community/attendance/types/timeSheetTypes";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { L1EmployeeType } from "~community/people/types/PeopleTypes";

import TimesheetDailyRecordTable from "../TimesheetDailyRecordTable/TimesheetDailyRecordTable";
import TimesheetStatCard from "../TimesheetStatCard/TimesheetStatCard";

interface Props {
  workSummaryData: Record<string, string>;
  dailyLogData: DailyLogType[];
  downloadEmployeeDailyLogCsv: () => void;
  isDailyLogLoading?: boolean;
  targetEmployeeId?: number;
  targetEmployeeDetails?: L1EmployeeType;
  isSelfTargetEntry?: boolean;
}

const TimesheetDailyLog = ({
  workSummaryData,
  dailyLogData,
  downloadEmployeeDailyLogCsv,
  isDailyLogLoading = false,
  targetEmployeeId,
  targetEmployeeDetails,
  isSelfTargetEntry
}: Props): JSX.Element => {
  const translateText = useTranslator("attendanceModule", "timesheet");

  return (
    <Box>
      <Stack
        flexDirection={"row"}
        justifyContent={"space-between"}
        alignItems={"center"}
        gap={"1.5rem"}
        paddingY={"1.5rem"}
      >
        <TimesheetStatCard
          title={translateText(["workedHoursKpiLabel"])}
          time={workSummaryData?.workedHours}
          icon={<TimesheetIcon />}
        />
        <TimesheetStatCard
          title={translateText(["breakHoursKpiLabel"])}
          time={workSummaryData?.breakHours}
          icon={<LeaveIcon width={16} height={16} />}
        />
      </Stack>
      <TimesheetDailyRecordTable
        dailyLogData={dailyLogData}
        downloadEmployeeDailyLogCsv={downloadEmployeeDailyLogCsv}
        isDailyLogLoading={isDailyLogLoading}
        targetEmployeeId={targetEmployeeId}
        targetEmployeeDetails={targetEmployeeDetails}
        isSelfTargetEntry={isSelfTargetEntry}
      />
    </Box>
  );
};

export default TimesheetDailyLog;
