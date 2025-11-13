import { Grid2 as Grid } from "@mui/material";
import { FC, useMemo, useState } from "react";

import { useGetIndividualUtilization } from "~community/attendance/api/AttendanceAdminApi";
import { useGetDailyLogsByEmployeeId } from "~community/attendance/api/AttendanceEmployeeApi";
import { useGetIndividualWorkHourGraphData } from "~community/attendance/api/attendanceManagerApi";
import PeopleLayout from "~community/common/components/templates/PeopleLayout/PeopleLayout";
import useSessionData from "~community/common/hooks/useSessionData";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useCommonStore } from "~community/common/stores/commonStore";
import {
  getCurrentMonth,
  getMonthName,
  getStartAndEndDateOfTheMonth
} from "~community/common/utils/dateTimeUtils";
import dailyLogMockData from "~enterprise/attendance/data/dailyLogMockData";
import managerUtilizationMockData from "~enterprise/attendance/data/managerUtilizationMockData.json";
import workHoursGraphMockData from "~enterprise/attendance/data/workHoursGraphMockData.json";

import IndividualEmployeeInboxView from "./IndividualEmployeeInboxView";

interface Props {
  selectedUser: number;
}

const IndividualEmployeeDocumentView: FC<Props> = ({ selectedUser }) => {
  const translateText = useTranslator("attendanceModule", "timesheet");

  const { employeeDetails, isProTier } = useSessionData();

  const { isDrawerToggled } = useCommonStore((state) => ({
    isDrawerToggled: state.isDrawerExpanded
  }));

  const [month, setMonth] = useState(isProTier ? getCurrentMonth() : 1);

  const { data: dailyLogData, isLoading: isDailyLogLoading } =
    useGetDailyLogsByEmployeeId(
      getStartAndEndDateOfTheMonth().start,
      getStartAndEndDateOfTheMonth().end,
      selectedUser,
      isProTier
    );

  const dailyLogs = useMemo(() => {
    return isProTier ? dailyLogData : dailyLogMockData;
  }, [isProTier, dailyLogData]);

  const { data: managerUtilizationData } = useGetIndividualUtilization(
    selectedUser,
    isProTier
  );

  const managerUtilizations = useMemo(() => {
    return isProTier ? managerUtilizationData : managerUtilizationMockData;
  }, [isProTier, managerUtilizationData]);

  const { data: workHoursGraphData, isLoading: isWorkHoursGraphLoading } =
    useGetIndividualWorkHourGraphData(
      getMonthName(month)?.toUpperCase(),
      selectedUser,
      isProTier
    );

  const employeeWorkHoursDataset = useMemo(() => {
    return isProTier ? workHoursGraphData : workHoursGraphMockData;
  }, [isProTier, workHoursGraphData]);

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
      {/* <UpgradeOverlay> */}
      <>
        <Grid container spacing={1}></Grid>

        <Grid
          size={{ xs: 12 }}
          sx={{
            marginTop: "1.5rem"
          }}
        >
          <IndividualEmployeeInboxView selectedUser={2} />
        </Grid>
      </>
      {/* </UpgradeOverlay> */}
    </PeopleLayout>
  );
};

export default IndividualEmployeeDocumentView;
