import { Box } from "@mui/material";
import { type Theme, useTheme } from "@mui/system";
import {
  Dispatch,
  JSX,
  MouseEvent,
  SetStateAction,
  useEffect,
  useState
} from "react";

import Icon from "~community/common/components/atoms/Icon/Icon";
import IconButton from "~community/common/components/atoms/IconButton/IconButton";
import Popper from "~community/common/components/molecules/Popper/Popper";
import { IconName } from "~community/common/types/IconTypes";
import { MenuTypes } from "~community/common/types/MoleculeTypes";
import { Employee } from "~community/leave/types/TeamLeaveAnalyticsTypes";

import MultiselectEmployeeSearch from "../MultiselectEmployeeSearch/MultiselectEmployeeSearch";

interface Props {
  teamDetails: Employee[];
  selectedMembers: number[];
  setSelectedMembers: Dispatch<SetStateAction<number[]>>;
  isAll: boolean;
  setIsAll: Dispatch<SetStateAction<boolean>>;
}

const MultiselectEmployeeFilter = ({
  teamDetails,
  selectedMembers,
  setSelectedMembers,
  isAll,
  setIsAll
}: Props): JSX.Element => {
  const theme: Theme = useTheme();
  const [filterEl, setFilterEl] = useState<null | HTMLElement>(null);
  const [filterOpen, setFilterOpen] = useState<boolean>(false);
  const filterBeOpen: boolean = filterOpen && Boolean(filterEl);
  const filterId: string | undefined = filterBeOpen
    ? "filter-popper"
    : undefined;
  const [teamMembers, setTeamMembers] = useState<Employee[]>(teamDetails);

  const handleClick = (event: MouseEvent<HTMLElement>): void => {
    setFilterEl(event.currentTarget);
    setFilterOpen((previousOpen) => !previousOpen);
  };

  const handleFilterClose = (): void => {
    setFilterOpen(false);
  };

  useEffect(() => {
    setTeamMembers(teamDetails);
  }, [teamDetails]);

  return (
    <Box>
      <IconButton
        text={
          selectedMembers.length > 0
            ? `${String(selectedMembers.length)} selected`
            : "All"
        }
        icon={<Icon name={IconName.DROP_DOWN_ICON} />}
        buttonStyles={{
          bgcolor: theme.palette.grey[100],
          p: ".5rem .75rem",
          pl: ".625rem",
          marginX: ".125rem",
          border: "1px solid"
        }}
        isTextPermenent={true}
        onClick={(e: MouseEvent<HTMLElement>) => handleClick(e)}
      />
      <Popper
        anchorEl={filterEl}
        open={filterOpen}
        position={"bottom-end"}
        menuType={MenuTypes.FILTER}
        id={filterId}
        handleClose={handleFilterClose}
        timeout={300}
        containerStyles={{
          maxHeight: "20.25rem",
          width: "20rem",
          backgroundColor: theme.palette.notifyBadge.contrastText
        }}
      >
        <MultiselectEmployeeSearch
          teamDetails={teamDetails}
          selectedMembers={selectedMembers}
          setSelectedMembers={setSelectedMembers}
          isAll={isAll}
          setIsAll={setIsAll}
          teamMembers={teamMembers}
          setTeamMembers={setTeamMembers}
        />
      </Popper>
    </Box>
  );
};

export default MultiselectEmployeeFilter;
