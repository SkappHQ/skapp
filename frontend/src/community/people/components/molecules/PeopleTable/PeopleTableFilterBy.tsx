import { Box } from "@mui/material";
import { FC, KeyboardEvent, MouseEvent } from "react";

import { MenuTypes } from "~community/common/types/MoleculeTypes";
import { FilterButtonTypes } from "~community/common/types/filterTypes";

import EmployeeDataMenu from "../EmployeeDataMenu/EmployeeDataMenu";
import EmployeeTableFilterButton from "../EmployeeTableFilterButton/EmployeeTableFilterButton";

interface Props {
  filterEl: HTMLElement | null;
  handleFilterClose: (value?: boolean) => void;
  handleFilterClick: (
    event: MouseEvent<HTMLElement> | KeyboardEvent<HTMLButtonElement>
  ) => void;
  disabled: boolean;
  filterId: string | undefined;
  teams?: FilterButtonTypes[] | undefined;
  jobFamilies?: FilterButtonTypes[] | undefined;
  teamData?: {
    teams: FilterButtonTypes[] | undefined;
    isTeamLoading: boolean;
  };
  filterOpen: boolean;
  scrollToTop: () => void;
}
const PeopleTableFilterBy: FC<Props> = ({
  filterEl,
  handleFilterClose,
  handleFilterClick,
  disabled,
  filterId,
  filterOpen,
  scrollToTop,
  teams,
  jobFamilies
}) => {
  return (
    <Box>
      <EmployeeTableFilterButton
        handleFilterClick={handleFilterClick}
        filterId={filterId}
        disabled={disabled}
      />
      <EmployeeDataMenu
        anchorEl={filterEl}
        handleClose={handleFilterClose}
        position="bottom-end"
        menuType={MenuTypes.FILTER}
        id={filterId}
        open={filterOpen}
        scrollToTop={scrollToTop}
        teams={teams}
        jobFamilies={jobFamilies}
      />
    </Box>
  );
};

export default PeopleTableFilterBy;
