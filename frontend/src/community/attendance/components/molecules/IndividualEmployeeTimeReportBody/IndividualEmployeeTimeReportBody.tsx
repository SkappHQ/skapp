import { Grid2 as Grid } from "@mui/material";
import { FC, useMemo, useState } from "react";

import { useGetIndividualUtilization } from "~community/attendance/api/AttendanceAdminApi";
import { useGetDailyLogsByEmployeeId } from "~community/attendance/api/AttendanceEmployeeApi";
import { useGetIndividualWorkHourGraphData } from "~community/attendance/api/attendanceManagerApi";
import WorkHourGraph from "~community/attendance/components/molecules/Graphs/WorkHourGraph";
import TimeUtilizationCard from "~community/attendance/components/molecules/TimeUtilizationCard/TimeUtilizationCard";
import TimesheetDailyRecordTable from "~community/attendance/components/molecules/TimesheetDailyRecordTable/TimesheetDailyRecordTable";
import { TimeUtilizationTrendTypes } from "~community/attendance/types/timeSheetTypes";
import { downloadEmployeeDailyLogCsv } from "~community/attendance/utils/TimesheetCsvUtil";
import PeopleLayout from "~community/common/components/templates/PeopleLayout/PeopleLayout";
import useSessionData from "~community/common/hooks/useSessionData";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useCommonStore } from "~community/common/stores/commonStore";
import { roundNumberToX } from "~community/common/utils/commonUtil";
import {
  getCurrentMonth,
  getMonthName,
  getStartAndEndDateOfTheMonth
} from "~community/common/utils/dateTimeUtils";
import dailyLogMockData from "~enterprise/attendance/data/dailyLogMockData";
import managerUtilizationMockData from "~enterprise/attendance/data/managerUtilizationMockData.json";
import workHoursGraphMockData from "~enterprise/attendance/data/workHoursGraphMockData.json";
import UpgradeOverlay from "~enterprise/common/components/molecules/UpgradeOverlay/UpgradeOverlay";
import useTier from "~enterprise/common/hooks/useTier";

interface Props {
  selectedUser: number;
}

const IndividualEmployeeTimeReportSection: FC<Props> = ({ selectedUser }) => {
  const translateText = useTranslator("attendanceModule", "timesheet");

  const { isAtLeastCoreTier } = useTier();

  const { employeeDetails } = useSessionData();

  const { isDrawerToggled } = useCommonStore((state) => ({
    isDrawerToggled: state.isDrawerExpanded
  }));

  const [month, setMonth] = useState(isAtLeastCoreTier ? getCurrentMonth() : 1);

  const { data: dailyLogData, isLoading: isDailyLogLoading } =
    useGetDailyLogsByEmployeeId(
      getStartAndEndDateOfTheMonth().start,
      getStartAndEndDateOfTheMonth().end,
      selectedUser,
      isAtLeastCoreTier
    );

  const dailyLogs = useMemo(() => {
    return isAtLeastCoreTier ? dailyLogData : dailyLogMockData;
  }, [isAtLeastCoreTier, dailyLogData]);

  const { data: managerUtilizationData } = useGetIndividualUtilization(
    selectedUser,
    isAtLeastCoreTier
  );

  const managerUtilizations = useMemo(() => {
    return isAtLeastCoreTier
      ? managerUtilizationData
      : managerUtilizationMockData;
  }, [isAtLeastCoreTier, managerUtilizationData]);

  const { data: workHoursGraphData, isLoading: isWorkHoursGraphLoading } =
    useGetIndividualWorkHourGraphData(
      getMonthName(month)?.toUpperCase(),
      selectedUser,
      isAtLeastCoreTier
    );

  const employeeWorkHoursDataset = useMemo(() => {
    return isAtLeastCoreTier ? workHoursGraphData : workHoursGraphMockData;
  }, [isAtLeastCoreTier, workHoursGraphData]);

  return (
    <PeopleLayout
      title={""}
      containerStyles={{
        padding: "0",
        margin: "0 auto",
        height: "auto",
        maxWidth: isDrawerToggled ? "90rem" : "103.125rem"
      }}
      showDivider={false}
      pageHead={translateText(["individualTimeSheetAnalytics.title"])}
    >
      <UpgradeOverlay>
        <>
          <Grid container spacing={1}>
            <Grid size={{ xs: 2 }}>
              <TimeUtilizationCard
                lastThirtyDayChange={
                  roundNumberToX(managerUtilizations?.lastThirtyDayChange, 1) ??
                  "--"
                }
                trend={
                  managerUtilizations?.toString()?.startsWith("-")
                    ? TimeUtilizationTrendTypes.TREND_DOWN
                    : TimeUtilizationTrendTypes.TREND_UP
                }
                percentage={
                  roundNumberToX(managerUtilizations?.percentage, 1) ?? "--"
                }
              />
            </Grid>
            <Grid size={{ xs: 10 }}>
              <WorkHourGraph
                data={
                  employeeWorkHoursDataset ?? {
                    preProcessedData: [],
                    labels: []
                  }
                }
                isLoading={isWorkHoursGraphLoading}
                title={translateText([
                  "individualTimeSheetAnalytics.workHours"
                ])}
                month={month}
                setMonth={setMonth}
              />
            </Grid>
          </Grid>

          <Grid
            size={{ xs: 12 }}
            sx={{
              marginTop: "1.5rem"
            }}
          >
            <TimesheetDailyRecordTable
              dailyLogData={dailyLogs || []}
              downloadEmployeeDailyLogCsv={() => {
                downloadEmployeeDailyLogCsv(
                  dailyLogs || [],
                  employeeDetails?.firstName || "",
                  getStartAndEndDateOfTheMonth().start,
                  getStartAndEndDateOfTheMonth().end
                );
              }}
              isDailyLogLoading={isDailyLogLoading}
            />
          </Grid>
        </>
      </UpgradeOverlay>
    </PeopleLayout>
  );
};

export default IndividualEmployeeTimeReportSection;
