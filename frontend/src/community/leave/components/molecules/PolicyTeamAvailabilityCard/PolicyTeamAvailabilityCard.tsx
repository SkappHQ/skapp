import {
  Chip,
  SelectChangeEvent,
  Stack,
  Theme,
  Typography,
  useTheme
} from "@mui/material";
import { useMemo } from "react";

import Icon from "~community/common/components/atoms/Icon/Icon";
import AvatarGroupWithLabel from "~community/common/components/molecules/AvatarGroupWithLabel/AvatarGroupWithLabel";
import RoundedSelect from "~community/common/components/molecules/RoundedSelect/RoundedSelect";
import { ZIndexEnums } from "~community/common/enums/CommonEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { IconName } from "~community/common/types/IconTypes";
import { mergeSx } from "~community/common/utils/commonUtil";
import styles from "~community/leave/components/molecules/TeamAvailabilityCard/styles";
import { PolicyLeaveModalEnums } from "~community/leave/enums/PolicyLeaveEnums";
import { usePolicyLeaveStore } from "~community/leave/store/policyLeaveStore";
import { ResourceAvailabilityPayload } from "~community/leave/types/MyRequests";
import {
  getAvailabilityInfo,
  getEmployeesWithLeaveRequests,
  getTeamAvailabilityData,
  getTotalLeaveCount
} from "~community/leave/utils/myRequests/teamAvailabilityCardUtils";
import { TeamNamesType } from "~community/people/types/TeamTypes";

interface Props {
  teams: TeamNamesType[] | undefined;
  resourceAvailability: ResourceAvailabilityPayload[] | undefined;
}

const PolicyTeamAvailabilityCard = ({ teams, resourceAvailability }: Props) => {
  const theme: Theme = useTheme();
  const classes = styles(theme);

  const translateText = useTranslator(
    "leaveModule",
    "myRequests",
    "teamAvailabilityCard"
  );
  const translateAria = useTranslator("leaveAria", "applyLeave");

  const {
    selectedDates,
    selectedTeam,
    setSelectedTeam,
    setTeamAvailabilityData,
    setModalType
  } = usePolicyLeaveStore((state) => ({
    selectedDates: state.selectedDates,
    selectedTeam: state.selectedTeam,
    setSelectedTeam: state.setSelectedTeam,
    setTeamAvailabilityData: state.setTeamAvailabilityData,
    setModalType: state.setModalType
  }));

  const cardData = useMemo(() => {
    const teamAvailabilityData = getTeamAvailabilityData({
      selectedDates,
      resourceAvailability
    });

    setTeamAvailabilityData(teamAvailabilityData);

    return teamAvailabilityData;
  }, [selectedDates, resourceAvailability, setTeamAvailabilityData]);

  const totalLeaveCount = useMemo(
    () => getTotalLeaveCount(cardData),
    [cardData]
  );

  const totalAvailableCount = useMemo(() => {
    if (
      selectedDates.length === 1 ||
      (selectedDates.length === 2 && totalLeaveCount === 0)
    ) {
      return cardData?.[0]?.availableCount;
    }
  }, [cardData, selectedDates, totalLeaveCount]);

  const teamsDropdownOptions = useMemo(
    () =>
      teams?.map((team) => ({
        label: team.teamName,
        value: team.teamId
      })) ?? [],
    [teams]
  );

  const handleTeamSelect = (event: SelectChangeEvent) => {
    const teamId = event.target.value;
    setSelectedTeam(teams?.find((team) => team.teamId === teamId) ?? null);
  };

  const renderSelectedTeam = (value: string) =>
    teamsDropdownOptions.find((option) => option.value === Number(value))
      ?.label;

  const handleViewDetailsClick = () => {
    setModalType(PolicyLeaveModalEnums.TEAM_AVAILABILITY);
  };

  return (
    <Stack
      sx={mergeSx([
        classes.wrapper,
        {
          backgroundColor: totalLeaveCount
            ? theme.palette.grey[100]
            : theme.palette.greens.lightTertiary,
          border: totalLeaveCount
            ? `0.0625rem solid ${theme.palette.grey[500]}`
            : `0.0625rem solid ${theme.palette.greens.darkBoarder}`
        }
      ])}
    >
      <Stack sx={classes.rowOne}>
        <Typography variant="h3">{translateText(["title"])}</Typography>
        <RoundedSelect
          id="policy-team-availability-card-team-select"
          onChange={handleTeamSelect}
          value={selectedTeam?.teamId?.toString() ?? ""}
          options={teamsDropdownOptions}
          renderValue={renderSelectedTeam}
          accessibility={{
            label: translateAria(["teamAvailabilityCard", "dropdown"])
          }}
          customStyles={{
            menuProps: {
              sx: { zIndex: ZIndexEnums.POPUP }
            }
          }}
        />
      </Stack>
      <Stack sx={classes.rowTwo}>
        <Typography variant="body2">
          {getAvailabilityInfo({ selectedDates, cardData, translateText })}
        </Typography>
      </Stack>
      <Stack sx={classes.rowThree}>
        <Stack sx={classes.leftContent}>
          {totalAvailableCount ? (
            <>
              <Typography variant="h2">{totalAvailableCount}</Typography>
              <Chip
                label={translateText(["available"])}
                size="small"
                sx={classes.chip}
              />
            </>
          ) : (
            <></>
          )}
          <AvatarGroupWithLabel
            avatars={getEmployeesWithLeaveRequests(cardData)}
            max={5}
            label={translateText(["away"])}
            componentStyles={classes.componentStyles}
          />
        </Stack>
        {totalLeaveCount !== 0 ? (
          <Stack sx={classes.rightContent} onClick={handleViewDetailsClick}>
            <Typography variant="caption">
              {translateText(["viewDetails"])}
            </Typography>
            <Icon name={IconName.RIGHT_ARROW_ICON} />
          </Stack>
        ) : (
          <></>
        )}
      </Stack>
    </Stack>
  );
};

export default PolicyTeamAvailabilityCard;
