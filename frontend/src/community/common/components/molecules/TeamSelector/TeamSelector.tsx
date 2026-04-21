import { Box } from "@mui/material";
import { type Theme, useTheme } from "@mui/material/styles";
import { JSX, MouseEvent, useEffect, useState } from "react";

import { useAuth } from "~community/auth/providers/AuthProvider";
import DropDownArrow from "~community/common/assets/Icons/DropdownArrow";
import Button from "~community/common/components/atoms/Button/Button";
import SortRow from "~community/common/components/atoms/SASortRow/SASortRow";
import Popper from "~community/common/components/molecules/Popper/Popper";
import { ZIndexEnums } from "~community/common/enums/CommonEnums";
import {
  ButtonSizes,
  ButtonStyle
} from "~community/common/enums/ComponentEnums";
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
  setTeamId: (id: number | string) => void;
  setTeamName?: (name: string) => void;
  moduleAdminType?: AdminTypes;
}

const TeamSelector = ({
  setTeamId,
  setTeamName,
  moduleAdminType
}: Props): JSX.Element => {
  const translateTexts = useTranslator("attendanceModule", "timesheet");
  const theme: Theme = useTheme();

  const [showOverlay, setShowOverlay] = useState<boolean>(false);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [selectedOptionId, setSelectedOptionId] = useState<number>(0);

  const { data: allTeamsData } = useGetAllTeams();
  const { data: managerAllTeamsData } = useGetAllManagerTeams();
  const { user } = useAuth();
  const [teamsData, setTeamsData] = useState<
    TeamType[] | undefined | ManagerTeamType[]
  >([]);

  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const isTeamListEmpty = teamsData?.length === 0;
  const [selectedOptionName, setSelectedOptionName] = useState<string>("");
  const closeMenu = (): void => {
    setAnchorEl(null);
    setShowOverlay(false);
  };

  useEffect(() => {
    checkUserRole();
  }, [user, managerAllTeamsData, allTeamsData]);

  const checkUserRole = () => {
    if (
      user?.roles?.includes(AdminTypes.SUPER_ADMIN) ||
      (moduleAdminType && user?.roles?.includes(moduleAdminType))
    ) {
      setIsAdmin(true);
      setTeamId(-1);
      setTeamsData(allTeamsData);
      setSelectedOptionName(
        allTeamsData?.length !== 0 ? translateTexts(["allLabel"]) : ""
      );
    } else {
      setTeamId(-1);
      setTeamsData(managerAllTeamsData?.managerTeams);
      setIsAdmin(false);
      setSelectedOptionName(
        managerAllTeamsData?.managerTeams.length !== 0
          ? translateTexts(["allLabel"])
          : translateTexts(["noTeamTxt"])
      );
    }
  };

  const onSelectOption = (id: number): void => {
    if (id !== 0) {
      const selectedTeam = teamsData?.find((item) => item?.teamId === id);
      if (selectedTeam) {
        setSelectedOptionName(selectedTeam?.teamName);
        setSelectedOptionId(id);
        setShowOverlay(false);
        setTeamId(id);
        setTeamName && setTeamName(selectedTeam?.teamName);
      }
    } else {
      setTeamId(-1);
      setSelectedOptionName(translateTexts(["allLabel"]));
      setSelectedOptionId(0);
      setShowOverlay(false);
      setTeamName && setTeamName(translateTexts(["allLabel"]));
    }
  };

  return (
    <>
      <Box sx={{ paddingLeft: "1rem" }}>
        <Button
          label={
            !isTeamListEmpty ? selectedOptionName : translateTexts(["allLabel"])
          }
          buttonStyle={ButtonStyle.TERTIARY_OUTLINED}
          size={ButtonSizes.MEDIUM}
          disabled={isTeamListEmpty && !isAdmin}
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
        ariaLabel="Your teams"
        styles={{
          boxShadow: `0rem .55rem 1.25rem ${theme.palette.grey[300]}`,
          zIndex: ZIndexEnums.DEFAULT
        }}
      >
        <Box
          sx={{
            backgroundColor: "common.white"
          }}
        >
          <SortRow
            text={translateTexts(["allLabel"])}
            selected={selectedOptionId === 0}
            onClick={() => {
              onSelectOption(0);
            }}
          />
          {teamsData?.map((item) => (
            <SortRow
              key={item?.teamId}
              text={item?.teamName}
              selected={selectedOptionId === item?.teamId}
              onClick={() => {
                onSelectOption(item?.teamId as number);
              }}
            />
          ))}
        </Box>
      </Popper>
    </>
  );
};

export default TeamSelector;
