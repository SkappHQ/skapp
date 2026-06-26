import { Box, Chip, Stack, Theme, Typography, useTheme } from "@mui/material";
import { DateTime } from "luxon";
import { useMemo } from "react";

import AvatarChip from "~community/common/components/molecules/AvatarChip/AvatarChip";
import AvatarGroup from "~community/common/components/molecules/AvatarGroup/AvatarGroup";
import { daysTypes } from "~community/common/constants/stringConstants";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { LeaveStates } from "~community/common/types/CommonTypes";
import { AvatarPropTypes } from "~community/common/types/MoleculeTypes";
import { getEmoji } from "~community/common/utils/commonUtil";
import { ResourceAvailabilityPayload } from "~community/leave/types/MyRequests";
import {
  getDuration,
  getLeavePeriod
} from "~community/leave/utils/myRequests/leaveSummaryUtils";
import { useGetMyManagers } from "~community/people/api/PeopleApi";
import { L4ManagerType } from "~community/people/types/PeopleTypes";

import styles from "./styles";

interface Props {
  workingDays: daysTypes[];
  resourceAvailability: ResourceAvailabilityPayload[] | undefined;
  leaveTypeName: string;
  leaveTypeEmoji: string;
  leaveDuration: LeaveStates;
  startDate: DateTime;
  endDate: DateTime;
}

const LeaveSummary = ({
  workingDays,
  resourceAvailability,
  leaveTypeName,
  leaveTypeEmoji,
  leaveDuration,
  startDate,
  endDate
}: Props) => {
  const commonTranslateText = useTranslator("durations");

  const translateText = useTranslator(
    "leaveModule",
    "myRequests",
    "applyLeaveModal",
    "leaveSummary"
  );

  const theme: Theme = useTheme();
  const classes = styles(theme);

  const { data: myManagers } = useGetMyManagers();

  const primaryManager = useMemo(() => {
    if (!myManagers || myManagers.length === 0) return null;
    return myManagers.find((manager) => manager.isPrimaryManager === true);
  }, [myManagers]);

  const otherManagers = useMemo(() => {
    if (!myManagers || myManagers.length === 0) return [];
    return myManagers.filter((manager) => manager.isPrimaryManager === false);
  }, [myManagers]);

  const duration = useMemo(() => {
    return getDuration({
      workingDays: workingDays,
      resourceAvailability: resourceAvailability,
      leaveState: leaveDuration,
      translateText: commonTranslateText,
      startDate: startDate,
      endDate: endDate
    });
  }, [commonTranslateText, leaveDuration]);

  const supervisorNames = useMemo(() => {
    const allManagers = [primaryManager, ...otherManagers].filter(Boolean);
    return allManagers
      .map((manager) => `${manager?.firstName} ${manager?.lastName}`)
      .join(", ");
  }, [primaryManager, otherManagers]);

  return (
    <Stack sx={classes.wrapper}>
      <Typography tabIndex={0} variant="body1">
        {translateText(["title"])}
      </Typography>
      <Stack sx={classes.container}>
        <Stack sx={classes.row} tabIndex={0}>
          <Typography variant="body2" sx={classes.label}>
            {translateText(["type"])}
          </Typography>
          <Chip
            label={leaveTypeName}
            icon={
              <Typography component="span" aria-hidden="true">
                {getEmoji(leaveTypeEmoji)}
              </Typography>
            }
            sx={classes.chip}
          />
        </Stack>

        <Stack sx={classes.row} tabIndex={0}>
          <Typography variant="body2" sx={classes.label}>
            {translateText(["duration"])}
          </Typography>
          <Stack sx={classes.chipWrapper}>
            <Chip label={duration} sx={classes.chip} />
            {startDate ? (
              <Chip
                label={getLeavePeriod(startDate, endDate)}
                sx={classes.chip}
              />
            ) : (
              <></>
            )}
          </Stack>
        </Stack>
        <Stack sx={classes.row} tabIndex={0}>
          <Typography variant="body2" sx={classes.label}>
            {translateText(["recipient"])}
          </Typography>
          <Box aria-label={supervisorNames} role="region">
            <Stack sx={classes.chipWrapper} aria-hidden="true">
              <AvatarChip
                key={primaryManager?.employeeId ?? ""}
                firstName={primaryManager?.firstName ?? ""}
                lastName={primaryManager?.lastName ?? ""}
                avatarUrl={primaryManager?.authPic ?? ""}
                chipStyles={classes.chipStyles}
              />

              {otherManagers.length > 0 && (
                <AvatarChip
                  key={otherManagers[0]?.employeeId ?? ""}
                  firstName={otherManagers[0]?.firstName ?? ""}
                  lastName={otherManagers[0]?.lastName ?? ""}
                  avatarUrl={otherManagers[0]?.authPic ?? ""}
                  chipStyles={classes.chipStyles}
                />
              )}
              {otherManagers.length > 1 && (
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
                    }
                  }}
                  avatars={
                    otherManagers
                      ? otherManagers.slice(1).map(
                          (manager: L4ManagerType) =>
                            ({
                              firstName: manager?.firstName,
                              lastName: manager?.lastName,
                              image: manager?.authPic
                            }) as AvatarPropTypes
                        )
                      : []
                  }
                  max={1}
                  isHoverModal={true}
                />
              )}
            </Stack>
          </Box>
        </Stack>
      </Stack>
    </Stack>
  );
};

export default LeaveSummary;
