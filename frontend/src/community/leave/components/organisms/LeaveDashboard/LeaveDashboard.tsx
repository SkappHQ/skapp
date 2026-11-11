import { Box, Stack, Theme, Typography, useTheme } from "@mui/material";
import Grid from "@mui/material/Grid2";
import { DateTime } from "luxon";
import { useRouter } from "next/router";
import { JSX, useEffect, useState } from "react";

import { useAuth } from "~community/auth/providers/AuthProvider";
import AnalyticCard from "~community/common/components/molecules/AnalyticCard/AnalyticCard";
import TeamSelector from "~community/common/components/molecules/TeamSelector/TeamSelector";
import ROUTES from "~community/common/constants/routes";
import { DATE_FORMAT } from "~community/common/constants/timeConstants";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { AdminTypes } from "~community/common/types/AuthTypes";
import {
  useGetAbsenceRate,
  useGetAvailability,
  useGetLeaveTypeBreakdownChartData,
  useGetPendingLeavesData,
  useGetResourceAvailability
} from "~community/leave/api/LeaveDashboard";
import {
  useGetPolicyAbsenceRate,
  useGetPolicyLeaveTypeBreakdown,
  useGetPolicyPendingLeaveCount
} from "~community/leave/api/PolicyLeaveApi";
import AbsenceRateCard from "~community/leave/components/molecules/AbsenceRateCard/AbsenceRateCard";
import AvailabilityCalendarWidget from "~community/leave/components/molecules/AvailabilityCalendar/AvailabilityCalendarWidget";
import AvailableChip from "~community/leave/components/molecules/LeaveDashboardChips/AvailableChip";
import AwayChip from "~community/leave/components/molecules/LeaveDashboardChips/AwayChip";
import HolidayChip from "~community/leave/components/molecules/LeaveDashboardChips/HolidayChip";
import LeaveTypeBreakdownChart from "~community/leave/components/molecules/LeaveUtilizationGraph/LeaveTypeBreakdownChart";
import PolicyOnLeaveTodayCard from "~community/leave/components/molecules/PolicyOnLeaveTodayCard/PolicyOnLeaveTodayCard";
import useLeavePoliciesEnabled from "~community/leave/hooks/useLeavePoliciesEnabled";
import { useLeaveStore } from "~community/leave/store/store";
import { AbsenceRateType } from "~community/leave/types/AnalyticsTypes";
import {
  LeaveRequest,
  ResourceAvailabilityRecord
} from "~community/leave/types/ResourceAvailabilityTypes";
import { getNewPendingLeaveRequestCount } from "~community/leave/utils/dashboardUtils";
import useGoogleAnalyticsEvent from "~enterprise/common/hooks/useGoogleAnalyticsEvent";
import { GoogleAnalyticsTypes } from "~enterprise/common/types/GoogleAnalyticsTypes";

import styles from "./styles";

const LeaveDashboard = (): JSX.Element => {
  const translateText = useTranslator("leaveModule", "dashboard");
  const availabilityModalText = useTranslator(
    "leaveModule",
    "myRequests",
    "teamAvailabilityModal"
  );
  const [teamId, setTeamId] = useState<string | number>("");
  const [teamName, setTeamName] = useState<string>(translateText(["all"]));
  const [isFetchingEnabled, setIsFetchingEnabled] = useState<boolean>(false);
  const { user } = useAuth();
  const theme: Theme = useTheme();
  const classes = styles(theme);
  const router = useRouter();
  const {
    viewedPendingLeaveCount,
    setViewedPendingLeaveCount,
    setPendingLeaveCount,
    setIsManagerModal,
    setIsOnLeaveModalOpen,
    setOnLeaveModalTitle,
    setTodaysAvailability
  } = useLeaveStore((state) => state);

  const { isLeavePoliciesEnabled, isLoading: isPolicyConfigLoading } =
    useLeavePoliciesEnabled();

  const isPolicyConfigReady = isFetchingEnabled && !isPolicyConfigLoading;
  const isLegacyAvailabilityEnabled =
    isPolicyConfigReady && !isLeavePoliciesEnabled;
  const isLegacyTeamDataEnabled = isLegacyAvailabilityEnabled && teamId !== "";
  const isPolicyDataEnabled = isPolicyConfigReady && isLeavePoliciesEnabled;

  const today = DateTime.now().toFormat(DATE_FORMAT);

  const { data: todaysAvailability } = useGetAvailability(
    teamId,
    today,
    isLegacyAvailabilityEnabled
  );

  const { data: todaysResourceAvailability } = useGetResourceAvailability(
    teamId,
    today,
    today,
    isLegacyAvailabilityEnabled
  );

  const { data: pendingLeaves } = useGetPendingLeavesData(
    teamId,
    isLegacyTeamDataEnabled
  );

  const { data: policyPendingLeaveCount } = useGetPolicyPendingLeaveCount(
    teamId,
    isPolicyDataEnabled
  );

  const legacyAbsenceRate = useGetAbsenceRate(teamId, isLegacyTeamDataEnabled);

  const policyAbsenceRate = useGetPolicyAbsenceRate(
    Number(teamId),
    isPolicyDataEnabled && teamId !== ""
  );

  const absenceRate: AbsenceRateType | undefined = isLeavePoliciesEnabled
    ? policyAbsenceRate.data
    : legacyAbsenceRate.data?.[0];
  const absenceRateQuery = isLeavePoliciesEnabled
    ? policyAbsenceRate
    : legacyAbsenceRate;
  const isAbsenceRateLoading =
    isPolicyConfigLoading || absenceRateQuery.isLoading;

  const legacyBreakdown = useGetLeaveTypeBreakdownChartData(
    teamId,
    isLegacyTeamDataEnabled
  );

  const policyBreakdown = useGetPolicyLeaveTypeBreakdown(
    teamId,
    isPolicyDataEnabled
  );

  const breakdown = isLeavePoliciesEnabled ? policyBreakdown : legacyBreakdown;
  const isBreakdownLoading = isPolicyConfigLoading || breakdown.isLoading;

  useGoogleAnalyticsEvent({
    onMountEventType: GoogleAnalyticsTypes.GA4_LEAVE_DASHBOARD_VIEWED,
    triggerOnMount: true
  });

  const currentPendingLeaveCount: number | undefined = isLeavePoliciesEnabled
    ? policyPendingLeaveCount?.pendingCount
    : pendingLeaves?.[0]?.items?.length;

  const isPendingLeavesExpandable =
    !isPolicyConfigLoading && !!currentPendingLeaveCount;

  const newPendingRequests = getNewPendingLeaveRequestCount(
    currentPendingLeaveCount,
    viewedPendingLeaveCount
  );

  const todaysAwayEmployees: LeaveRequest[] =
    todaysResourceAvailability?.find(
      (record: ResourceAvailabilityRecord) => record.actualDate === today
    )?.leaveRequests ?? [];

  const handleTodaysAvailabilityModalOpen = (): void => {
    setTodaysAvailability(todaysAwayEmployees);
    setOnLeaveModalTitle(availabilityModalText(["awayToday"]));
    setIsOnLeaveModalOpen(true);
    setIsManagerModal(true);
  };

  const handlePendingLeavesExpand = (): void => {
    setPendingLeaveCount(currentPendingLeaveCount ?? 0);
    setViewedPendingLeaveCount(currentPendingLeaveCount ?? 0);
    router.replace(ROUTES.LEAVE.LEAVE_PENDING);
  };

  const renderPendingLeavesContent = (): JSX.Element | null => {
    if (isPolicyConfigLoading) {
      return null;
    }

    if (!isPendingLeavesExpandable) {
      return <Typography sx={classes.analytic}>{"-"}</Typography>;
    }

    return (
      <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
        <Typography sx={classes.analytic}>
          {currentPendingLeaveCount}
        </Typography>
        {newPendingRequests > 0 && (
          <Stack
            sx={{
              flexDirection: "row",
              gap: 1,
              alignItems: "center",
              backgroundColor: theme.palette.amber.mid,
              padding: "0.25rem .75rem",
              borderRadius: 10,
              height: "2rem"
            }}
          >
            <Typography
              sx={{ color: theme.palette.amber.chipText }}
              variant="caption"
            >
              {`${newPendingRequests} ${translateText(["newRequest"])}`}
            </Typography>
          </Stack>
        )}
      </div>
    );
  };

  useEffect(() => {
    if (user) setIsFetchingEnabled(true);
  }, [user, teamId]);

  const resourceDetails = () => {
    if (todaysAvailability[0]?.holidayResponseDtos?.length > 0) {
      return (
        <HolidayChip
          text={todaysAvailability[0]?.holidayResponseDtos[0]?.name}
        />
      );
    }
    if (
      todaysAvailability[0]?.adminOnLeaveDto?.onlineCount > 0 ||
      todaysAvailability[0]?.adminOnLeaveDto?.onLeaveCount > 0
    ) {
      if (todaysAvailability[0]?.adminOnLeaveDto?.onLeaveCount === 0) {
        return (
          <Box sx={{ display: "flex", gap: 1, alignItems: "center", pt: 1 }}>
            <AvailableChip text={translateText(["allAvailable"])} />
          </Box>
        );
      } else if (todaysAvailability[0]?.adminOnLeaveDto?.onlineCount === 0) {
        return (
          <Box sx={{ display: "flex", gap: 1, alignItems: "center", pt: 1 }}>
            <AwayChip text={translateText(["allAway"])} />
          </Box>
        );
      } else {
        return (
          <Box sx={{ display: "flex", gap: 1 }}>
            {todaysAvailability[0]?.adminOnLeaveDto?.onlineCount > 0 && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <Typography sx={classes.analytic}>
                  {todaysAvailability[0]?.adminOnLeaveDto?.onlineCount}
                </Typography>
                <AvailableChip text={translateText(["available"])} />
              </Box>
            )}

            {todaysAvailability[0]?.adminOnLeaveDto?.onLeaveCount > 0 && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <Typography sx={classes.analytic}>
                  {todaysAvailability[0]?.adminOnLeaveDto?.onLeaveCount ?? "-"}
                </Typography>
                <AwayChip text={translateText(["away"])} />
              </Box>
            )}
          </Box>
        );
      }
    } else {
      return <Typography sx={classes.analytic}>{"-"}</Typography>;
    }
  };

  const renderTodaysAvailabilityCard = () => {
    if (isPolicyConfigLoading) {
      return (
        <AnalyticCard
          title={translateText(["todayAvailability"]) ?? ""}
          isExpandable={false}
        />
      );
    }

    if (isLeavePoliciesEnabled) {
      return (
        <PolicyOnLeaveTodayCard teamId={teamId} enabled={isFetchingEnabled} />
      );
    }

    return (
      <AnalyticCard
        title={translateText(["todayAvailability"]) ?? ""}
        isExpandable={!!todaysAvailability}
        onExpand={handleTodaysAvailabilityModalOpen}
        accessibility={{
          tabIndex: 0,
          role: "button"
        }}
      >
        {todaysAvailability && resourceDetails()}
      </AnalyticCard>
    );
  };

  return (
    <Box sx={classes.container}>
      <Box sx={classes.header}>
        <Typography style={{ textTransform: "uppercase" }}>
          {` ${translateText(["records"])} ${
            teamId === -1 ? translateText(["all"]) : `${teamName}`
          }`}
        </Typography>
        <TeamSelector
          setTeamId={setTeamId}
          setTeamName={setTeamName}
          moduleAdminType={AdminTypes.LEAVE_ADMIN}
        />
      </Box>
      <Grid container spacing={1}>
        <Grid sx={{ width: { xs: "100%", md: "32.5%" } }}>
          {renderTodaysAvailabilityCard()}
        </Grid>
        <Grid sx={{ width: { xs: "100%", md: "32.5%" } }}>
          <AnalyticCard
            title={translateText(["pendingLeaves"]) ?? ""}
            isExpandable={isPendingLeavesExpandable}
            onExpand={handlePendingLeavesExpand}
            accessibility={{
              tabIndex: 0,
              role: "button"
            }}
          >
            {renderPendingLeavesContent()}
          </AnalyticCard>
        </Grid>

        <Grid sx={{ width: { xs: "100%", md: "32.5%" } }}>
          <AbsenceRateCard
            absenceRate={absenceRate}
            isLoading={isAbsenceRateLoading}
            isError={absenceRateQuery.isError}
          />
        </Grid>
      </Grid>
      <AvailabilityCalendarWidget teams={teamId} />
      <LeaveTypeBreakdownChart
        datasets={breakdown.data}
        isLoading={isBreakdownLoading}
        error={breakdown.error}
      />
    </Box>
  );
};

export default LeaveDashboard;
