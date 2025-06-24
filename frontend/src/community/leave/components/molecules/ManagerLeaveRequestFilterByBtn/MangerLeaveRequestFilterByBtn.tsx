import { Stack, Theme, Typography, useTheme } from "@mui/material";
import { MouseEvent, useState } from "react";

import FilterIcon from "~community/common/assets/Icons/FilterIcon";
import IconButton from "~community/common/components/atoms/IconButton/IconButton";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { FilterButtonTypes } from "~community/common/types/CommonTypes";
import { MenuTypes } from "~community/common/types/MoleculeTypes";
import LeaveRequestMenu from "~community/leave/components/molecules/LeaveRequestMenu/LeaveRequestMenu";
import { useLeaveStore } from "~community/leave/store/store";
import ShowSelectedFilters from "~community/people/components/molecules/ShowSelectedFilters/ShowSelectedFilters";

interface Props {
  leaveTypeButtons: FilterButtonTypes[];
  onClickReset: () => void;
  removeFilters: (label?: string) => void;
}

const ManagerLeaveRequestFilterByBtn = ({
  leaveTypeButtons,
  onClickReset,
  removeFilters
}: Props) => {
  const theme: Theme = useTheme();

  const translateAria = useTranslator("commonAria", "components");

  const { leaveRequestFilterOrder } = useLeaveStore((state) => ({
    leaveRequestFilterOrder: state.leaveRequestFilterOrder
  }));

  const [filterEl, setFilterEl] = useState<null | HTMLElement>(null);
  const [filterOpen, setFilterOpen] = useState<boolean>(false);

  const filterBeOpen: boolean = filterOpen && Boolean(filterEl);
  const filterId = filterBeOpen ? "filter-popper" : undefined;

  const handleFilterClick = (event: MouseEvent<HTMLElement>): void => {
    setFilterEl(event.currentTarget);
    setFilterOpen((previousOpen) => !previousOpen);
  };

  const handleFilterClose = (): void => {
    setFilterEl(null);
    setFilterOpen(false);
  };

  return (
    <>
      {" "}
      <Stack direction="row" alignItems="center" gap={0.5}>
        {leaveRequestFilterOrder.length > 0 && (
          <Typography sx={{ whiteSpace: "nowrap" }}>Filter:</Typography>
        )}
        <ShowSelectedFilters
          filterOptions={leaveRequestFilterOrder}
          onDeleteIcon={removeFilters}
        />
        <IconButton
          id="filter-icon-btn"
          icon={<FilterIcon />}
          onClick={handleFilterClick}
          ariaLabel={translateAria(["filterBtn"])}
          title={translateAria(["filterBtn"])}
          buttonStyles={{
            border: "0.0625rem solid",
            borderColor: "grey.500",
            bgcolor: theme.palette.grey[100],
            p: "0.625rem 1.25rem",
            transition: "0.2s ease",
            "&:hover": {
              boxShadow: `inset 0 0 0 0.125rem ${theme.palette.grey[500]}`
            }
          }}
          aria-describedby={filterId}
          dataProps={{
            "aria-label":
              "Filter: Pressing enter on this button opens a menu where you can choose to filter by leave status, leave type and date."
          }}
        />
      </Stack>
      <LeaveRequestMenu
        anchorEl={filterEl}
        handleClose={handleFilterClose}
        position="bottom-end"
        menuType={MenuTypes.FILTER}
        id={filterId}
        open={filterOpen}
        leaveTypeButtons={leaveTypeButtons}
        onReset={onClickReset}
      />
    </>
  );
};

export default ManagerLeaveRequestFilterByBtn;
