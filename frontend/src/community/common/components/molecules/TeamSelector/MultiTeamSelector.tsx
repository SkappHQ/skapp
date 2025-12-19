import { Box, Chip } from "@mui/material";
import { type Theme, useTheme } from "@mui/material/styles";
import { useAuth } from "~community/common/context/AuthContext";
import { JSX, MouseEvent, useEffect, useState } from "react";

import CloseIcon from "~community/common/assets/Icons/CloseIcon";
import DropDownArrow from "~community/common/assets/Icons/DropdownArrow";
import Button from "~community/common/components/atoms/Button/Button";
import SortRow from "~community/common/components/atoms/SASortRow/SASortRow";
import Popper from "~community/common/components/molecules/Popper/Popper";
import { ZIndexEnums } from "~community/common/enums/CommonEnums";
import { ButtonStyle } from "~community/common/enums/ComponentEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { AdminTypes } from "~community/common/types/AuthTypes";
import { ManagerTeamType } from "~community/common/types/CommonTypes";
import { MenuTypes } from "~community/common/types/MoleculeTypes";
import {
  useGetAllManagerTeams,
  useGetAllTeams
} from "~community/people/api/TeamApi";
import { TeamType } from "~community/people/types/TeamTypes";

interface Props {
  setTeamIds: (ids: Array<number | string>) => void;
  setTeamNames?: (names: string[]) => void;
  moduleAdminType?: AdminTypes;
}

const MultiTeamSelector = ({
  setTeamIds,
  setTeamNames,
  moduleAdminType
}: Props): JSX.Element => {
  const translateTexts = useTranslator("commonComponents", "multiTeamSelector");
  const theme: Theme = useTheme();

  const [selectedOptionNames, setSelectedOptionNames] = useState<string[]>([
    translateTexts(["allLabel"])
  ]);
  const [showOverlay, setShowOverlay] = useState<boolean>(false);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [selectedOptionIds, setSelectedOptionIds] = useState<number[]>([-1]);

  const { data: allTeamsData } = useGetAllTeams();
  const { data: managerAllTeamsData } = useGetAllManagerTeams();
  const { data } = useAuth();
  const [teamsData, setTeamsData] = useState<
    TeamType[] | undefined | ManagerTeamType[]
  >([]);

  const isTeamListEmpty = allTeamsData?.length === 0;

  const closeMenu = (): void => {
    setAnchorEl(null);
    setShowOverlay(false);
  };

  useEffect(() => {
    checkUserRole();
  }, [data, managerAllTeamsData]);

  const checkUserRole = () => {
    if (
      data?.user.roles?.includes(AdminTypes.SUPER_ADMIN) ||
      (moduleAdminType && data?.user.roles?.includes(moduleAdminType))
    ) {
      setTeamIds([-1]);
      setTeamsData(allTeamsData);
    } else {
      const managerTeamIds = managerAllTeamsData?.managerTeams?.length
        ? managerAllTeamsData.managerTeams.map((team) => team.teamId)
        : [-1];

      setTeamIds(managerTeamIds);
      setTeamsData(managerAllTeamsData?.managerTeams);
    }
  };

  const toggleSelectOption = (id: number): void => {
    if (id === 0) {
      // Select All employees/teams
      setSelectedOptionIds([-1]);
      setSelectedOptionNames([translateTexts(["allLabel"])]);
      setTeamIds([-1]);
      checkUserRole();

      setTeamNames && setTeamNames([translateTexts(["allLabel"])]);
    } else {
      // Toggle Team Selection
      const isSelected = selectedOptionIds.includes(id);
      const updatedSelectedIds = isSelected
        ? selectedOptionIds.filter((teamId) => teamId !== id)
        : [...selectedOptionIds.filter((teamId) => teamId !== -1), id]; // Remove -1 if selecting other teams

      const selectedTeams = updatedSelectedIds.map((teamId) =>
        teamsData?.find((team) => team.teamId === teamId)
      );

      const updatedSelectedNames = selectedTeams
        ?.map((team) => team?.teamName ?? "")
        .filter((name) => name);

      setSelectedOptionIds(updatedSelectedIds);
      setSelectedOptionNames(updatedSelectedNames ?? []);
      setTeamIds(updatedSelectedIds);
      setTeamNames && setTeamNames(updatedSelectedNames ?? []);
    }
  };

  const handleDelete = (teamName: string, teamId: number) => {
    const updatedSelectedNames = selectedOptionNames.filter(
      (name) => name !== teamName
    );
    const updatedSelectedIds = selectedOptionIds.filter((id) => id !== teamId);

    setSelectedOptionNames(updatedSelectedNames);
    setSelectedOptionIds(updatedSelectedIds);
    setTeamIds(updatedSelectedIds);
    setTeamNames && setTeamNames(updatedSelectedNames);

    // If all teams are deselected, reset to "All" label
    if (updatedSelectedIds.length === 0) {
      setSelectedOptionNames([translateTexts(["allLabel"])]);
      setSelectedOptionIds([-1]);
      setTeamIds([-1]);
    }
  };

  return (
    <>
      <Box
        sx={{
          paddingLeft: "1rem",
          display: "flex",
          justifyContent: "space-between",
          gap: 1
        }}
      >
        <Box display={"flex"} gap={1} alignItems={"center"}>
          {selectedOptionNames[0] !== translateTexts(["allLabel"]) &&
            selectedOptionNames?.map((option, index) => {
              return (
                <Chip
                  key={index}
                  label={option}
                  onDelete={() =>
                    handleDelete(option, selectedOptionIds[index])
                  }
                  deleteIcon={
                    <Box>
                      <CloseIcon fill={theme.palette.text.blackText} />
                    </Box>
                  }
                />
              );
            })}
        </Box>

        <Button
          label={
            !isTeamListEmpty
              ? selectedOptionNames.length > 1
                ? `${selectedOptionNames.length} ${translateTexts(["selected"])}`
                : selectedOptionNames[0]
              : data?.user.roles?.includes(AdminTypes.SUPER_ADMIN) ||
                  (moduleAdminType &&
                    data?.user.roles?.includes(moduleAdminType))
                ? translateTexts(["allLabel"])
                : translateTexts(["noTeamTxt"])
          }
          buttonStyle={
            !isTeamListEmpty
              ? ButtonStyle.TERTIARY
              : ButtonStyle.TERTIARY_OUTLINED
          }
          disabled={isTeamListEmpty}
          styles={{
            border: ".0625rem solid",
            borderColor: "grey.500",
            fontWeight: "400",
            fontSize: ".875rem",
            py: ".5rem",
            px: "1rem",
            color: isTeamListEmpty ? "text.darkText" : ""
          }}
          endIcon={<DropDownArrow />}
          onClick={(event: MouseEvent<HTMLElement>) => {
            setAnchorEl(event.currentTarget);
            setShowOverlay(true);
          }}
        />
      </Box>
      <Popper
        anchorEl={anchorEl}
        open={Boolean(showOverlay)}
        position={"bottom-end"}
        handleClose={() => closeMenu()}
        menuType={MenuTypes.SORT}
        isManager={true}
        disablePortal={true}
        id="popper"
        isFlip={true}
        timeout={300}
        containerStyles={{
          boxShadow: `0rem .55rem 1.25rem ${theme.palette.grey[300]}`,
          zIndex: ZIndexEnums.DEFAULT
        }}
      >
        <Box sx={{ backgroundColor: "common.white" }}>
          <SortRow
            text={translateTexts(["allLabel"])}
            selected={selectedOptionIds.length === 0}
            onClick={() => toggleSelectOption(0)}
          />
          {teamsData?.map((item) => (
            <SortRow
              key={item?.teamId}
              text={item?.teamName}
              selected={selectedOptionIds.includes(item?.teamId as number)}
              onClick={() => toggleSelectOption(item?.teamId as number)}
            />
          ))}
        </Box>
      </Popper>
    </>
  );
};

export default MultiTeamSelector;
