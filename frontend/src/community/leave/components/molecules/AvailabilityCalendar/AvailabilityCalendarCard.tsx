import { Typography } from "@mui/material";
import Grid from "@mui/material/Grid2";
import { Box } from "@mui/system";
import { DateTime } from "luxon";
import { JSX } from "react";

import AvatarGroup from "~community/common/components/molecules/AvatarGroup/AvatarGroup";
import { DATE_FORMAT } from "~community/common/constants/timeConstants";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { shouldActivateButton } from "~community/common/utils/keyboardUtils";
import { useLeaveStore } from "~community/leave/store/store";
import { LeaveRequest } from "~community/leave/types/ResourceAvailabilityTypes";

import AvailableChip from "../LeaveDashboardChips/AvailableChip";
import AwayChip from "../LeaveDashboardChips/AwayChip";
import HolidayChip from "../LeaveDashboardChips/HolidayChip";

interface AvailabilityCalendarCardProps {
  day: string;
  dateAndMonth: string;
  avatarGroupMaxCount?: number;
  holidays: { id: string; name: string; holidayDuration: string }[];
  availableCount: number;
  unavailableCount: number;
  onLeaveEmployees: LeaveRequest[];
  cards: number;
  actualDate: string;
}

const AvailabilityCalendarCard = ({
  day,
  dateAndMonth,
  holidays,
  availableCount,
  unavailableCount,
  onLeaveEmployees,
  cards,
  actualDate
}: AvailabilityCalendarCardProps): JSX.Element => {
  const translateText = useTranslator(
    "leaveModule",
    "myRequests",
    "teamAvailabilityModal"
  );

  const {
    setIsManagerModal,
    setIsOnLeaveModalOpen,
    setOnLeaveModalTitle,
    setTodaysAvailability
  } = useLeaveStore((state) => ({
    setIsManagerModal: state.setIsManagerModal,
    setIsOnLeaveModalOpen: state.setIsOnLeaveModalOpen,
    setOnLeaveModalTitle: state.setOnLeaveModalTitle,
    setTodaysAvailability: state.setTodaysAvailability
  }));

  const handleOnLeaveModalOpen = () => {
    setIsManagerModal(true);
    setIsOnLeaveModalOpen(true);
    setOnLeaveModalTitle(translateText(["onLeaveTitle"], { date: actualDate }));
    setTodaysAvailability(onLeaveEmployees);
  };

  const isToday = () => {
    const date = DateTime.now().toFormat(DATE_FORMAT);
    return actualDate === date ? true : false;
  };

  const transformLeaveRequests = (leaveRequests: LeaveRequest[]) => {
    return leaveRequests?.map((request: LeaveRequest) => ({
      firstName: request.employee.firstName,
      lastName: request.employee.lastName,
      image: request.employee.authPic || "",
      leaveState: request.leaveState
    }));
  };

  const resourceDetails = () => {
    if (holidays?.length > 0) {
      return <HolidayChip text={holidays[0]?.name} />;
    }

    if (onLeaveEmployees?.length > 0) {
      return (
        <Box
          sx={{
            display: "flex",
            gap: onLeaveEmployees?.length > 1 && cards === 7 ? 0.6 : 2,
            alignItems: "center"
          }}
        >
          <AvatarGroup
            componentStyles={{ justifyContent: "start" }}
            avatars={transformLeaveRequests(onLeaveEmployees)}
            max={cards === 7 ? 1 : 3}
            avatarStyles={{ marginRight: "-0.8rem" }}
            total={onLeaveEmployees?.length}
          />
          <AwayChip text="Away" />
        </Box>
      );
    }

    if (unavailableCount === 0 && availableCount === 0) {
      <></>;
    } else if (unavailableCount === 0) {
      return (
        <Box sx={{ display: "flex", gap: 1, alignItems: "center", pt: 1 }}>
          <AvailableChip text="All available" />
        </Box>
      );
    } else if (availableCount === 0) {
      return (
        <Box sx={{ display: "flex", gap: 1, alignItems: "center", pt: 1 }}>
          <AwayChip text="Full team away" />
        </Box>
      );
    }
  };

  return (
    <Grid
      size={12 / cards}
      sx={{
        minHeight: "120px",
        height: "auto",
        display: "flex"
      }}
    >
      <Box
        sx={{
          borderRadius: 1.5,
          padding: 1,
          backgroundColor: isToday() ? "secondary.main" : "grey.100",
          border: "1px solid",
          borderColor: isToday() ? "secondary.dark" : "grey.300",
          display: "flex",
          width: "100%",
          height: "100%",
          flexDirection: "column",
          cursor: "pointer"
        }}
        tabIndex={0}
        role="button"
        onKeyDown={(e) => {
          if (shouldActivateButton(e.key)) {
            handleOnLeaveModalOpen();
          }
        }}
        onClick={() => {
          handleOnLeaveModalOpen();
        }}
      >
        <Box
          sx={{
            width: "100%",
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between"
          }}
        >
          <Box
            sx={{
              width: "100%",
              display: "flex",
              flexDirection: "row",
              alignItems: "center",

              justifyContent: "flex-start"
            }}
          >
            {isToday() && (
              <Box
                sx={{
                  width: "0.5rem",
                  height: "0.5rem",
                  borderRadius: "50%",
                  marginBottom: "0.125rem",
                  marginRight: "0.25rem",
                  backgroundColor: "secondary.dark"
                }}
              />
            )}
            <Typography
              fontSize={12}
              lineHeight={"1.125rem"}
              sx={{ mb: ".125rem" }}
              color="text.secondary"
            >
              {dateAndMonth}
            </Typography>
          </Box>
        </Box>
        <Typography
          fontSize={12}
          lineHeight={"1.125rem"}
          sx={{ mb: ".125rem" }}
          color="primary.dark"
        >
          {day}
        </Typography>
        <Box> {resourceDetails()}</Box>
      </Box>
    </Grid>
  );
};

export default AvailabilityCalendarCard;
