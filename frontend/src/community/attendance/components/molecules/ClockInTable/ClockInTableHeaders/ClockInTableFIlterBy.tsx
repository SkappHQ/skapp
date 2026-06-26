import { Box } from "@mui/material";
import { FC, MouseEvent } from "react";

import TableFilterButton from "~community/common/components/molecules/TableFilterButton/TableFilterButton";
import { FilterButtonTypes } from "~community/common/types/filterTypes";

interface Props {
  filterEl: HTMLElement | null;
  handleFilterClose: (value?: boolean) => void;
  handleFilterClick: (event: MouseEvent<HTMLElement>) => void;
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
const ClockInTableFIlterBy: FC<Props> = ({
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
      <TableFilterButton
        handleFilterClick={handleFilterClick}
        filterId={filterId}
        disabled={disabled}
      />
    </Box>
  );
};

export default ClockInTableFIlterBy;
