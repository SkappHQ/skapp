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

  const { isDrawerToggled } = useCommonStore((state) => ({
    isDrawerToggled: state.isDrawerExpanded
  }));

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
      <>
        <Grid container spacing={1}></Grid>

        <Grid
          size={{ xs: 12 }}
          sx={{
            marginTop: "1.5rem"
          }}
        >
          <IndividualEmployeeInboxView selectedUser={selectedUser} />
        </Grid>
      </>
    </PeopleLayout>
  );
};

export default IndividualEmployeeDocumentView;
