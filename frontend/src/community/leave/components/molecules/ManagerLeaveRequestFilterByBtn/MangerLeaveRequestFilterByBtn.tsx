import { FilterIcon, IconButton } from "@rootcodelabs/skapp-ui";
import { MouseEvent, useState } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";
import { FilterButtonTypes } from "~community/common/types/CommonTypes";
import { MenuTypes } from "~community/common/types/MoleculeTypes";
import LeaveRequestMenu from "~community/leave/components/molecules/LeaveRequestMenu/LeaveRequestMenu";
import { useLeaveStore } from "~community/leave/store/store";

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
  const translateAria = useTranslator("commonAria", "components");

  const { leaveRequestFilterOrder } = useLeaveStore((state) => ({
    leaveRequestFilterOrder: state.leaveRequestFilterOrder
  }));

  const [filterEl, setFilterEl] = useState<null | HTMLElement>(null);
  const [filterOpen, setFilterOpen] = useState<boolean>(false);

  const filterBeOpen: boolean = filterOpen && Boolean(filterEl);
  const filterId = filterBeOpen ? "filter-popper" : undefined;

  const filterCount = leaveRequestFilterOrder.length;
  const hasFilters = filterCount > 0;

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
        <IconButton
          id="filter-icon-btn"
          icon={
            <FilterIcon
              fill={hasFilters ? "var(--color-primary-accent)" : undefined}
            />
          }
          onClick={handleFilterClick}
          aria-label={translateAria(["filterBtn"])}
          aria-describedby={filterId}
          variant={hasFilters ? "outlined" : "default"}
          isRounded={true}
          badge={hasFilters ? { count: filterCount, show: true } : undefined}
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
