import {
  SelectChangeEvent,
  Stack,
  Theme,
  Typography,
  useTheme
} from "@mui/material";
import { useState } from "react";

import AvatarChip from "~community/common/components/molecules/AvatarChip/AvatarChip";
import RoundedSelect from "~community/common/components/molecules/RoundedSelect/RoundedSelect";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useGetAllTeams } from "~community/people/api/TeamApi";
import { usePeopleStore } from "~community/people/store/store";
import { EmployeeType } from "~community/people/types/EmployeeTypes";
import { TeamNamesType } from "~community/people/types/TeamTypes";

import styles from "./styles";

interface Props {
  teamMember: EmployeeType;
  setTeamId?: (teamId: number) => void;
}

const ReassignMemberRow = ({ teamMember, setTeamId }: Props) => {
  const theme: Theme = useTheme();

  const classes = styles();

  const translateText = useTranslator("peopleModule", "teams");

  const { currentDeletingTeam } = usePeopleStore((state) => state);

  const [selectedTeam, setSelectedTeam] = useState<TeamNamesType | undefined>();

  const { data: allTeams } = useGetAllTeams();

  const filteredTeams = allTeams?.filter(
    (team) => team?.teamId !== currentDeletingTeam?.teamId
  );

  const teamOptions =
    filteredTeams?.map((team) => ({
      label: team?.teamName,
      value: team.teamId,
      disabled: false,
      ariaLabel: team?.teamName
    })) ?? [];

  const handleTeamSelectChange = (event: SelectChangeEvent) => {
    const selectedTeamId = event.target.value;

    const team = filteredTeams?.find(
      (team) => team.teamId.toString() === selectedTeamId.toString()
    );

    if (team !== undefined) {
      setSelectedTeam({
        teamId: team?.teamId ?? "",
        teamName: team?.teamName ?? ""
      });

      setTeamId && setTeamId(Number(selectedTeamId));
    }
  };

  return (
    <Stack
      direction="row"
      justifyContent="space-between"
      alignItems="center"
      aria-hidden={true}
    >
      <AvatarChip
        firstName={teamMember?.firstName}
        lastName={teamMember?.lastName}
        avatarUrl={teamMember?.avatarUrl}
        isResponsiveLayout={true}
        chipStyles={classes.avatarChip}
      />
      <Typography
        variant="body2"
        color={theme.palette.primary.dark}
        fontSize="0.75rem"
        lineHeight="1rem"
        whiteSpace="nowrap"
        overflow="hidden"
        textOverflow="ellipsis"
        sx={classes.jobTitle}
      >
        {`${teamMember?.jobLevel?.name ?? ""} ${teamMember?.jobRole?.name ?? ""}`}
      </Typography>
      <RoundedSelect
        id={`${teamMember.firstName}-team-select`}
        onChange={handleTeamSelectChange}
        options={teamOptions}
        value={
          selectedTeam?.teamId.toString() ?? translateText(["notAssigned"])
        }
        accessibility={{
          label: `${teamMember?.firstName} ${teamMember?.lastName}`
        }}
        renderValue={(selectedValue) => {
          const team = filteredTeams?.find(
            (team) => team.teamId.toString() === selectedValue.toString()
          );

          if (team !== undefined) {
            return team?.teamName;
          }

          return translateText(["notAssigned"]);
        }}
      />
    </Stack>
  );
};

export default ReassignMemberRow;
