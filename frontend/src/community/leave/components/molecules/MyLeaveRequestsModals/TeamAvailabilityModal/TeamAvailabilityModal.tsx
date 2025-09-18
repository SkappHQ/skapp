import { Chip, Stack, Theme, Typography, useTheme } from "@mui/material";

import Button from "~community/common/components/atoms/Button/Button";
import Icon from "~community/common/components/atoms/Icon/Icon";
import AvatarGroup from "~community/common/components/molecules/AvatarGroup/AvatarGroup";
import { ButtonStyle } from "~community/common/enums/ComponentEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { removeLetters } from "~community/common/regex/regexPatterns";
import { IconName } from "~community/common/types/IconTypes";
import { mergeSx } from "~community/common/utils/commonUtil";
import { MyRequestModalEnums } from "~community/leave/enums/MyRequestEnums";
import { useLeaveStore } from "~community/leave/store/store";

import styles from "./styles";

const TeamAvailabilityModal = () => {
  const theme: Theme = useTheme();
  const classes = styles(theme);

  const translateText = useTranslator(
    "leaveModule",
    "myRequests",
    "teamAvailabilityModal"
  );

  const { teamAvailabilityData, setMyLeaveRequestModalType } = useLeaveStore();

  return (
    <Stack sx={classes.wrapper}>
      <Stack sx={classes.header}>
        <Typography
          variant="body1"
          sx={mergeSx([classes.column, classes.date])}
        >
          {translateText(["date"])}
        </Typography>
        <Typography
          variant="body1"
          sx={mergeSx([classes.column, classes.awayMembers])}
        >
          {translateText(["awayMembers"])}
        </Typography>
      </Stack>
      <Stack sx={classes.body}>
        {teamAvailabilityData?.map((data) => (
          <Stack key={data.date} sx={classes.row}>
            <Stack sx={classes.date}>
              <Typography variant="body1">
                {removeLetters(data.date)}
              </Typography>
              <Typography variant="body1" color={theme.palette.primary.dark}>
                {data.dayOfWeek}
              </Typography>
            </Stack>
            <Stack sx={classes.awayMembers}>
              {data?.holidays.length > 0 ? (
                <Chip
                  label={
                    data.holidays.length > 1
                      ? `${data.holidays[0].name} +${data.holidays.length}`
                      : data.holidays[0].name
                  }
                  variant="outlined"
                  sx={classes.holidayChip}
                />
              ) : data.leaveCount === 0 ? (
                <Chip
                  label={translateText(["fullTeamAvailable"])}
                  variant="filled"
                  sx={classes.availableChip}
                />
              ) : data.availableCount === 0 ? (
                <Chip
                  label={translateText(["fullTeamAway"])}
                  variant="filled"
                  sx={classes.awayChip}
                />
              ) : (
                <AvatarGroup
                  avatars={data.employees}
                  componentStyles={classes.componentStyles}
                  isHoverModal = {true}
                />
              )}
            </Stack>
          </Stack>
        ))}
      </Stack>
      <Button
        buttonStyle={ButtonStyle.TERTIARY}
        label={translateText(["goBackBtn"])}
        startIcon={<Icon name={IconName.LEFT_ARROW_ICON} />}
        onClick={() =>
          setMyLeaveRequestModalType(MyRequestModalEnums.APPLY_LEAVE)
        }
      />
    </Stack>
  );
};

export default TeamAvailabilityModal;
