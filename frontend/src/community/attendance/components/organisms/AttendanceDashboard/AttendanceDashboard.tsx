import { Box, Theme, Typography, useTheme } from "@mui/material";
import Grid from "@mui/material/Grid2";
import { JSX, useEffect, useState } from "react";

import {
  useGetAttendanceDashboardAnalytics,
  useGetClockInOutGraphData,
  useGetLateArrivalsGraphData,
  useGetWorkHourGraphData
} from "~community/attendance/api/AttendanceApi";
import ClockInOutGraph from "~community/attendance/components/molecules/Graphs/ClockInOutGraph";
import { ClockInOutGraphTypes } from "~community/attendance/enums/dashboardEnums";
import {
  clockInOutGraphTypes,
  lateArrivalsGraphTypes
} from "~community/attendance/utils/echartOptions/constants";
import { useAuth } from "~community/common/auth/AuthProvider";
import TeamSelector from "~community/common/components/molecules/TeamSelector/TeamSelector";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { AdminTypes } from "~community/common/types/AuthTypes";
import {
  getCurrentMonth,
  getLocalDate,
  getMonthName,
  getTimeOffset
} from "~community/common/utils/dateTimeUtils";

import AttendanceCard from "../../molecules/AttendanceCard/AttendanceCard";
import LateArrivalsGraph from "../../molecules/Graphs/LateArrivalsGraph";
import WorkHourGraph from "../../molecules/Graphs/WorkHourGraph";

const AttendanceDashboard = (): JSX.Element => {
  const translateText = useTranslator("attendanceModule", "dashboards");
  const translateTextAria = useTranslator("attendanceAria", "dashboards");

  const [selectedDate, setSelectedDate] = useState<Date[]>([new Date()]);
  const [month, setMonth] = useState(getCurrentMonth());
  const [clockInOutDataCategory, setClockInOutDataCategory] = useState(
    clockInOutGraphTypes.CLOCKIN.value
  );
  const [lateArrivalDataCategory, setLateArrivalDataCategory] = useState(
    lateArrivalsGraphTypes.WEEKLY.value
  );
  const [teamId, setTeamId] = useState<number | string>("");
  const [teamName, setTeamName] = useState<string>(
    translateText(["attendanceDashboard.all"])
  );
  const [isFetchingEnabled, setIsFetchingEnabled] = useState<boolean>(false);

  const { user } = useAuth();
  const theme: Theme = useTheme();

  useEffect(() => {
    if (user || teamId) setIsFetchingEnabled(true);
  }, [user, teamId]);

  // fetch data for the analytics cards
  const { data: analyticsData } = useGetAttendanceDashboardAnalytics(
    teamId.toString(),
    isFetchingEnabled
  );

  // fetch data for clockin clock out graph
  const { data: clockInOutGraphData, isLoading: isClockInOutGraphLoading } =
    useGetClockInOutGraphData(
      clockInOutDataCategory,
      teamId,
      getTimeOffset(),
      getLocalDate(selectedDate[0]),
      isFetchingEnabled
    );

  // fetch data for late arrivals graph
  const { data: lateArrivalsGraphData, isLoading: isLateArrivalsGraphLoading } =
    useGetLateArrivalsGraphData(
      teamId,
      lateArrivalDataCategory,
      isFetchingEnabled
    );

  // fetch data for average worked hours graph
  const { data: workHoursGraphData, isLoading: isworkHoursGraphLoading } =
    useGetWorkHourGraphData(
      getMonthName(month)?.toUpperCase(),
      teamId,
      isFetchingEnabled
    );

  return (
    <Box>
      <Box
        sx={{
          border: `0.0625rem solid ${theme.palette.grey[200]}`,
          p: { xs: 1, md: 2 },
          borderRadius: "0.75rem"
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            justifyContent: "space-between",
            marginBottom: ".75rem"
          }}
        >
          <Typography style={{ textTransform: "uppercase" }}>
            {` ${translateText(["attendanceDashboard.records"])} ${
              teamId === -1
                ? translateText(["attendanceDashboard.all"])
                : `${teamName}`
            }`}
          </Typography>
          <Box sx={{ mt: { xs: 1, md: 0 } }}>
            {" "}
            <TeamSelector
              moduleAdminType={AdminTypes.ATTENDANCE_ADMIN}
              setTeamId={setTeamId}
              setTeamName={setTeamName}
            />
          </Box>
        </Box>
        <Grid container spacing={1}>
          <Grid sx={{ flexBasis: { xs: "100%", md: "49%" } }}>
            <Box sx={{ marginBottom: { xs: ".5rem", md: "1rem" } }}>
              <AttendanceCard
                title={translateText(["attendanceDashboard.card1Title"])}
                analytic1={analyticsData?.clockIns?.actualClockIns}
                analytic2={analyticsData?.clockIns?.expectedClockIns}
                type={ClockInOutGraphTypes.CLOCK_IN}
                iconAriaLabel={translateTextAria([
                  "todaysClockInsExtendedView"
                ])}
              />
            </Box>
          </Grid>
          <Grid sx={{ flexBasis: { xs: "100%", md: "50%" } }}>
            <Box sx={{ marginBottom: { xs: ".5rem", md: "1rem" } }}>
              <AttendanceCard
                title={translateText(["attendanceDashboard.card2Title"])}
                analytic1={analyticsData?.lateArrivals?.lateArrivalCount}
                type=""
                iconAriaLabel={translateTextAria([
                  "todaysLateArrivalsExtendedView"
                ])}
              />
            </Box>
          </Grid>
        </Grid>
        <Grid container spacing={1}>
          <Grid sx={{ flexBasis: { xs: "100%", md: "49%" } }}>
            <ClockInOutGraph
              chartData={
                clockInOutGraphData ?? { preProcessedData: [], labels: [] }
              }
              dataCategory={clockInOutDataCategory}
              setDataCategory={setClockInOutDataCategory}
              isDataLoading={isClockInOutGraphLoading}
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
            />
          </Grid>
          <Grid sx={{ flexBasis: { xs: "100%", md: "50%" } }}>
            <LateArrivalsGraph
              chartData={
                lateArrivalsGraphData ?? { preProcessedData: [], labels: [] }
              }
              dataCategory={lateArrivalDataCategory}
              setDataCategory={setLateArrivalDataCategory}
              withTeamFilter={true}
              isDataLoading={isLateArrivalsGraphLoading}
            />
          </Grid>
        </Grid>
        <Box
          sx={{
            marginTop: { xs: ".5rem", md: "1rem" },
            marginBottom: { xs: "1rem", md: "2rem" }
          }}
        >
          <WorkHourGraph
            data={workHoursGraphData ?? { preProcessedData: [], labels: [] }}
            isLoading={isworkHoursGraphLoading}
            title={translateText(["attendanceDashboard.workHours"])}
            month={month}
            setMonth={setMonth}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default AttendanceDashboard;
