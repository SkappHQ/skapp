import { Stack } from "@mui/material";
import { type Theme, useTheme } from "@mui/material/styles";
import { JSX, useState } from "react";

import { TimesheetAnalyticsTabTypes } from "~community/attendance/enums/timesheetEnums";
import { useAttendanceStore } from "~community/attendance/store/attendanceStore";
import { TimeRecordDataResponseType } from "~community/attendance/types/timeSheetTypes";
import Icon from "~community/common/components/atoms/Icon/Icon";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { IconName } from "~community/common/types/IconTypes";

import EmployeeTimeRecordsTable from "../EmployeeTimeRecordsTable/EmployeeTimeRecordsTable";
import TimeSheetFilters from "../TimeSheetFilters/TimeSheetFilters";
import TimesheetStatCard from "../TimesheetStatCard/TimesheetStatCard";

interface Props {
  recordData: TimeRecordDataResponseType;
  exportRecordData: TimeRecordDataResponseType;
  workSummaryData?: Record<string, string>;
  isManager?: boolean;
  isRecordLoading?: boolean;
  isTeamSelectionAvailable?: boolean;
  selectedTeamName?: string;
  isExportRecordDataLoading?: boolean;
}

const TimesheetAnalytics = ({
  recordData,
  workSummaryData,
  isExportRecordDataLoading,
  exportRecordData,
  isManager,
  isRecordLoading,
  isTeamSelectionAvailable,
  selectedTeamName
}: Props): JSX.Element => {
  const translateText = useTranslator("attendanceModule", "timesheet");
  const theme: Theme = useTheme();
  const { timesheetAnalyticsSelectedTeamName } = useAttendanceStore(
    (state) => state
  );

  const [selectedTab, setSelectedTab] = useState(
    TimesheetAnalyticsTabTypes.WEEK
  );

  return (
    <>
      <TimeSheetFilters
        selectedTab={selectedTab}
        setSelectedTab={setSelectedTab}
        isTeamSelectionAvailable={isManager && isTeamSelectionAvailable}
        containerStyles={{
          marginBottom: isManager ? "" : "1.5rem"
        }}
      />
      {isManager && (
        <Stack
          flexDirection={"row"}
          justifyContent={"space-between"}
          alignItems={"center"}
          gap={"1.5rem"}
          paddingY={"1.5rem"}
        >
          <TimesheetStatCard
            title={translateText(["workedHoursKpiLabel"])}
            time={workSummaryData?.workedHours as string}
            icon={
              <Icon
                name={IconName.TIME_SHEET_ICON}
                fill={theme.palette.secondary.dark}
              />
            }
          />
          <TimesheetStatCard
            title={translateText(["breakHoursKpiLabel"])}
            time={workSummaryData?.breakHours as string}
            icon={
              <Icon
                name={IconName.LEAVE_ICON}
                fill={theme.palette.secondary.dark}
              />
            }
          />
        </Stack>
      )}
      <EmployeeTimeRecordsTable
        recordData={recordData}
        exportRecordData={exportRecordData}
        isExportRecordDataLoading={isExportRecordDataLoading}
        isRecordLoading={isRecordLoading}
        teamName={selectedTeamName || timesheetAnalyticsSelectedTeamName}
      />
    </>
  );
};

export default TimesheetAnalytics;
