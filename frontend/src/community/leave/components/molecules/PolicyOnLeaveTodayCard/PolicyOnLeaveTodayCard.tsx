import { Box, Typography } from "@mui/material";
import { FC, JSX } from "react";

import AnalyticCard from "~community/common/components/molecules/AnalyticCard/AnalyticCard";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useGetPolicyEmployeesOnLeaveToday } from "~community/leave/api/PolicyLeaveApi";
import AvailableChip from "~community/leave/components/molecules/LeaveDashboardChips/AvailableChip";
import AwayChip from "~community/leave/components/molecules/LeaveDashboardChips/AwayChip";
import HolidayChip from "~community/leave/components/molecules/LeaveDashboardChips/HolidayChip";
import { PolicyOnLeaveTodayStatus } from "~community/leave/enums/PolicyLeaveEnums";
import { PolicyEmployeesOnLeaveType } from "~community/leave/types/PolicyLeaveTypes";
import { getPolicyOnLeaveTodayStatus } from "~community/leave/utils/policyLeave/policyLeaveUtils";

import styles from "./styles";

interface Props {
  teamId: number | string;
  enabled: boolean;
}

const PolicyOnLeaveTodayCard: FC<Props> = ({ teamId, enabled }) => {
  const translateText = useTranslator("leaveModule", "dashboard");
  const classes = styles();

  const { data: onLeaveToday } = useGetPolicyEmployeesOnLeaveToday(
    teamId,
    enabled
  );

  const renderCount = (count: number, chip: JSX.Element): JSX.Element => (
    <Box sx={classes.count}>
      <Typography sx={classes.analytic}>{count}</Typography>
      {chip}
    </Box>
  );

  const renderContent = (
    availability: PolicyEmployeesOnLeaveType
  ): JSX.Element => {
    switch (getPolicyOnLeaveTodayStatus(availability)) {
      case PolicyOnLeaveTodayStatus.NON_WORKING_DAY:
        return <HolidayChip text={availability.holidays?.[0]?.name ?? ""} />;
      case PolicyOnLeaveTodayStatus.ALL_AVAILABLE:
        return (
          <Box sx={classes.chipRow}>
            <AvailableChip text={translateText(["allAvailable"])} />
          </Box>
        );
      case PolicyOnLeaveTodayStatus.ALL_AWAY:
        return (
          <Box sx={classes.chipRow}>
            <AwayChip text={translateText(["allAway"])} />
          </Box>
        );
      case PolicyOnLeaveTodayStatus.PARTIALLY_AWAY:
        return (
          <Box sx={classes.counts}>
            {renderCount(
              availability.onlineCount ?? 0,
              <AvailableChip text={translateText(["available"])} />
            )}
            {renderCount(
              availability.onLeaveCount ?? 0,
              <AwayChip text={translateText(["away"])} />
            )}
          </Box>
        );
      default:
        return <Typography sx={classes.analytic}>{"-"}</Typography>;
    }
  };

  return (
    <AnalyticCard
      title={translateText(["todayAvailability"]) ?? ""}
      isExpandable={false}
    >
      {onLeaveToday && renderContent(onLeaveToday)}
    </AnalyticCard>
  );
};

export default PolicyOnLeaveTodayCard;
