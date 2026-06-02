import { MouseEvent, useState } from "react";

import FilterIconButton from "~community/common/components/atoms/FilterIconButton/FilterIconButton";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { FilterButtonTypes } from "~community/common/types/CommonTypes";
import { MenuTypes } from "~community/common/types/MoleculeTypes";
import LeaveRequestMenu from "~community/leave/components/molecules/LeaveRequestMenu/LeaveRequestMenu";
import { useLeaveStore } from "~community/leave/store/store";

interface Props {
  leaveTypeButtons: FilterButtonTypes[];
  onClickReset: () => void;
}

const ManagerLeaveRequestFilterByBtn = ({
  leaveTypeButtons,
  onClickReset
}: Props) => {
  const translateAria = useTranslator("commonAria", "components");

  const { leaveRequestFilterOrder } = useLeaveStore((state) => ({
    leaveRequestFilterOrder: state.leaveRequestFilterOrder
  }));

  const [filterEl, setFilterEl] = useState<null | HTMLElement>(null);
  const [filterOpen, setFilterOpen] = useState<boolean>(false);

  const filterBeOpen: boolean = filterOpen && Boolean(filterEl);
  const filterId = filterBeOpen ? "filter-popper" : undefined;

  const filterCount = leaveRequestFilterOrder.length;

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
      <div className="flex flex-row items-center gap-1">
        <FilterIconButton
          id="filter-icon-btn"
          filterCount={filterCount}
          onClick={handleFilterClick}
          aria-label={translateAria(["filterBtn"])}
          aria-describedby={filterId}
        />
      </div>
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
