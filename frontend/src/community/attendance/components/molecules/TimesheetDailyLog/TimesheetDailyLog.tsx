import { Box, Stack } from "@mui/material";
import { JSX } from "react";

import { DailyLogType } from "~community/attendance/types/timeSheetTypes";
import Icon from "~community/common/components/atoms/Icon/Icon";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { IconName } from "~community/common/types/IconTypes";

import TimesheetDailyRecordTable from "../TimesheetDailyRecordTable/TimesheetDailyRecordTable";
import TimesheetStatCard from "../TimesheetStatCard/TimesheetStatCard";

interface Props {
  workSummaryData: Record<string, string>;
  dailyLogData: DailyLogType[];
  downloadEmployeeDailyLogCsv: () => void;
  isDailyLogLoading?: boolean;
}

const TimesheetDailyLog = ({
  workSummaryData,
  dailyLogData,
  downloadEmployeeDailyLogCsv,
  isDailyLogLoading = false
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
          icon={<Icon name={IconName.TIME_SHEET_ICON} />}
        />
        <TimesheetStatCard
          title={translateText(["breakHoursKpiLabel"])}
          time={workSummaryData?.breakHours}
          icon={<Icon name={IconName.LEAVE_ICON} />}
        />
      </Stack>
      <TimesheetDailyRecordTable
        dailyLogData={dailyLogData}
        downloadEmployeeDailyLogCsv={downloadEmployeeDailyLogCsv}
        isDailyLogLoading={isDailyLogLoading}
      />
    </Box>
  );
};

export default TimesheetDailyLog;
