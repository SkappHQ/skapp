import { Box } from "@mui/material";
import { Popper } from "@rootcodelabs/skapp-ui";
import { JSX } from "react";

import {
  MenuTypes,
  PopperAndTooltipPositionTypes
} from "~community/common/types/MoleculeTypes";
import { FilterButtonTypes } from "~community/common/types/filterTypes";
import { JobRole } from "~community/people/types/EmployeeTypes";

import EmployeeDataFIlterMenuItems from "../EmployeeDataFIlterMenuItems/EmployeeDataFIlterMenuItems";
import EmployeeDataSortMenuItems from "../EmployeeDataSortMenuItems/EmployeeDataSortMenuItems";

interface Props {
  anchorEl: null | HTMLElement;
  handleClose: () => void;
  position: PopperAndTooltipPositionTypes;
  menuType: MenuTypes;
  id: string | undefined;
  open: boolean;
  teamData?: { teams: FilterButtonTypes[] | undefined; isTeamLoading: boolean };
  roleData?: { roles: JobRole[] | undefined; isRoleLoading: boolean };
  scrollToTop: () => void;
  teams?: FilterButtonTypes[] | undefined;
  jobFamilies?: FilterButtonTypes[] | undefined;
}

const EmployeeDataMenu = ({
  anchorEl,
  handleClose,
  position,
  menuType,
  id,
  open,
  scrollToTop,
  teams,
  jobFamilies
}: Props): JSX.Element => {
  return (
    <Popper
      anchorEl={anchorEl}
      open={open}
      position={position}
      id={id}
      handleClose={handleClose}
      containerClassName={`rounded-4 overflow-y-auto shadow-lg max-h-[calc(100vh-2rem)] ${menuType === MenuTypes.SORT ? "w-[248px]" : "max-w-[832px] w-[calc(100vw-2rem)]"}`}
    >
      <Box>
        {menuType === MenuTypes.SORT ? (
          <EmployeeDataSortMenuItems
            handleClose={handleClose}
            scrollToTop={scrollToTop}
          />
        ) : (
          <EmployeeDataFIlterMenuItems
            handleClose={handleClose}
            scrollToTop={scrollToTop}
            teams={teams}
            jobFamilies={jobFamilies}
          />
        )}
      </Box>
    </Popper>
  );
};

export default EmployeeDataMenu;
