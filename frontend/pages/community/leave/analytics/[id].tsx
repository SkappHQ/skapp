// TODO: Can move this page and time sheet analytics page to a single page and handle logic from one component. need to be refactored later
import { Box, Stack, Typography } from "@mui/material";
import Grid from "@mui/material/Grid2";
import { type Theme, useTheme } from "@mui/material/styles";
import { NextPage } from "next";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";

import {
  useGetClockInOutGraphData,
  useGetLateArrivalsGraphData,
  useGetWorkHourGraphData
} from "~community/attendance/api/AttendanceApi";
import ClockInOutGraph from "~community/attendance/components/molecules/Graphs/ClockInOutGraph";
import LateArrivalsGraph from "~community/attendance/components/molecules/Graphs/LateArrivalsGraph";
import WorkHourGraph from "~community/attendance/components/molecules/Graphs/WorkHourGraph";
import ManagerTimesheet from "~community/attendance/components/organisms/ManagerTimesheet/ManagerTImesheet";
import {
  clockInOutGraphTypes,
  lateArrivalsGraphTypes
} from "~community/attendance/utils/echartOptions/constants";
import { useAuth } from "~community/auth/providers/AuthProvider";
import Button from "~community/common/components/atoms/Button/Button";
import Icon from "~community/common/components/atoms/Icon/Icon";
import AvatarGroup from "~community/common/components/molecules/AvatarGroup/AvatarGroup";
import BoxStepper from "~community/common/components/molecules/BoxStepper/BoxStepper";
import ContentLayout from "~community/common/components/templates/ContentLayout/ContentLayout";
import { ButtonStyle } from "~community/common/enums/ComponentEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { AdminTypes, ManagerTypes } from "~community/common/types/AuthTypes";
import { AnalyticsTypes } from "~community/common/types/CommonTypes";
import { IconName } from "~community/common/types/IconTypes";
import {
  getCurrentMonth,
  getLocalDate,
  getMonthName,
  getTimeOffset
} from "~community/common/utils/dateTimeUtils";
import TeamLeaveAnalyticsContent from "~community/leave/components/organisms/TeamLeaveAnalyticsContent/TeamLeaveAnalyticsContent";
import { useLeaveStore } from "~community/leave/store/store";
import { Employee } from "~community/leave/types/TeamLeaveAnalyticsTypes";
import { useGetTeamDetailsById } from "~community/people/api/TeamApi";

const TeamTimeSheetAnalytics: NextPage = () => {
  const theme: Theme = useTheme();
  const router = useRouter();
  const translateText = useTranslator("attendanceModule", "dashboards");

  const [activeStep, setActiveStep] = useState("leaveAnalytics");

  const { user } = useAuth();

  const isLeaveManager = user?.roles?.includes(
    ManagerTypes.LEAVE_MANAGER || AdminTypes.LEAVE_ADMIN
  );

  const isAttendanceManager = user?.roles?.includes(
    ManagerTypes.ATTENDANCE_MANAGER || AdminTypes.ATTENDANCE_ADMIN
  );

  const [clockInOutDataCategory, setClockInOutDataCategory] = useState(
    clockInOutGraphTypes.CLOCKIN.value
  );
  const [lateArrivalDataCategory, setLateArrivalDataCategory] = useState(
    lateArrivalsGraphTypes.WEEKLY.value
  );
  const [selectedDate, setSelectedDate] = useState<Date[]>([new Date()]);
  const [month, setMonth] = useState(getCurrentMonth());

  const [teamId, setTeamId] = useState<number | string>("");
  const [teamName, setTeamName] = useState<string>("");

  const { setReportsParams } = useLeaveStore();

  useEffect(() => {
    if (router.query.id) {
      setTeamId(Number(router.query.id));
    }
    if (router.query.teamName) {
      setTeamName(router.query.teamName as string);
    }
  }, [router.isReady, router.query.id]);

  const { data: clockInOutGraphData, isLoading: isClockInOutGraphLoading } =
    useGetClockInOutGraphData(
      clockInOutDataCategory,
      teamId as string | number,
      getTimeOffset(),
      getLocalDate(selectedDate[0])
    );

  const { data: lateArrivalsGraphData, isLoading: isLateArrivalsGraphLoading } =
    useGetLateArrivalsGraphData(
      teamId as string | number,
      lateArrivalDataCategory
    );

  const { data: workHoursGraphData, isLoading: isworkHoursGraphLoading } =
    useGetWorkHourGraphData(
      getMonthName(month)?.toUpperCase(),
      teamId as string | number
    );

  const steps = [
    ...(isLeaveManager
      ? [{ id: AnalyticsTypes.LEAVE, label: translateText(["stepLeave"]) }]
      : []),
    ...(isAttendanceManager
      ? [{ id: AnalyticsTypes.TIME, label: translateText(["stepTimeSheet"]) }]
      : [])
  ];

  const { data: teamDetails } = useGetTeamDetailsById(Number(teamId));

  const teamMemberCount = teamDetails?.employees?.length;

  const getComponent = useCallback(() => {
    switch (activeStep) {
      case AnalyticsTypes.LEAVE:
        return <TeamLeaveAnalyticsContent teamId={teamId as number} />;
      case AnalyticsTypes.TIME:
        return (
          <>
            <Grid container spacing={1}>
              <Grid sx={{ flexBasis: { xs: "100%", md: "49%" } }}>
                <ClockInOutGraph
                  chartData={
                    clockInOutGraphData ?? { preProcessedData: [], labels: [] }
                  }
                  dataCategory={clockInOutDataCategory}
                  setDataCategory={setClockInOutDataCategory}
                  setTeamId={setTeamId}
                  isDataLoading={isClockInOutGraphLoading}
                  selectedDate={selectedDate}
                  setSelectedDate={setSelectedDate}
                />
              </Grid>
              <Grid sx={{ flexBasis: { xs: "100%", md: "50%" } }}>
                <LateArrivalsGraph
                  chartData={
                    lateArrivalsGraphData ?? {
                      preProcessedData: [],
                      labels: []
                    }
                  }
                  dataCategory={lateArrivalDataCategory}
                  setDataCategory={setLateArrivalDataCategory}
                  withTeamFilter={true}
                  setTeamId={setTeamId}
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
                data={
                  workHoursGraphData ?? { preProcessedData: [], labels: [] }
                }
                isLoading={isworkHoursGraphLoading}
                title={translateText(["attendanceDashboard.workHours"])}
                month={month}
                setMonth={setMonth}
              />
            </Box>

            <Box
              sx={{
                marginTop: { xs: ".5rem", md: "1rem" },
                marginBottom: { xs: "1rem", md: "2rem" }
              }}
            >
              <ManagerTimesheet
                showRequestTable={false}
                isTeamSelectionAvailable={true}
                selectedTeamName={teamName}
              />
            </Box>
          </>
        );
      default:
        <></>;
    }
  }, [
    activeStep,
    teamId,
    clockInOutGraphData,
    lateArrivalsGraphData,
    workHoursGraphData,
    teamDetails,
    month,
    translateText
  ]);

  return (
    <ContentLayout
      title={""}
      onBackClick={() => router.back()}
      pageHead={""}
      isBackButtonVisible
      isDividerVisible={false}
      customRightContent={
        data?.user.roles?.includes(AdminTypes.LEAVE_ADMIN) &&
        activeStep === AnalyticsTypes.LEAVE ? (
          <Button
            buttonStyle={ButtonStyle.TERTIARY}
            label={translateText(["viewFullReport"])}
            endIcon={<Icon name={IconName.RIGHT_ARROW_ICON} />}
            onClick={() => {
              setReportsParams("teamId", teamId);
              router.push("/leave/analytics/reports");
            }}
          />
        ) : undefined
      }
    >
      <>
        <Stack>
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            flexDirection="column"
            mb={2}
          >
            <Typography variant="h1" sx={{ mb: "1rem" }}>
              {teamName}
            </Typography>
            <AvatarGroup
              componentStyles={{
                ".MuiAvatarGroup-avatar": {
                  bgcolor: theme.palette.grey[100],
                  color: theme.palette.primary.dark,
                  fontSize: "0.875rem",
                  height: "2.5rem",
                  width: "2.5rem",
                  fontWeight: 400,
                  flexDirection: "row-reverse"
                },
                mb: "0.5rem"
              }}
              avatars={
                teamDetails?.employees?.map((employees: Employee) => ({
                  firstName: employees?.employee?.firstName,
                  lastName: employees?.employee?.lastName,
                  image: employees?.employee?.authPic
                })) ?? []
              }
              max={6}
            />
            <Typography variant="body1">
              {teamMemberCount}{" "}
              {teamMemberCount > 1
                ? translateText(["members"])
                : translateText(["members"])}
            </Typography>
          </Box>
          <BoxStepper
            activeStep={steps.findIndex((s) => s.id === activeStep)}
            steps={steps.map((step) => step.label)}
            onStepClick={(step) => {
              const selectedStep = steps.find((s) => s.label === step)?.id;
              if (selectedStep) {
                setActiveStep(selectedStep);
              }
            }}
            useStringIdentifier
            stepperStyles={{
              marginBottom: "1.75rem"
            }}
          />
        </Stack>
        {router.isReady && getComponent()}
      </>
    </ContentLayout>
  );
};

export default TeamTimeSheetAnalytics;
