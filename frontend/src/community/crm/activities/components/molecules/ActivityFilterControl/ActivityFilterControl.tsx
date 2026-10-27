import { FilterListIcon, IconButton, Popper } from "@rootcodelabs/skapp-ui";
import { FC, MouseEvent, useState } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";
import ActivityFilterPopover from "~community/crm/activities/components/molecules/ActivityFilterPopover/ActivityFilterPopover";
import {
  ActivityFeedFilters,
  ActivityTeamMember
} from "~community/crm/activities/types/activityTypes";

interface ActivityFilterControlProps {
  id: string;
  filters: ActivityFeedFilters;
  onApplyFilters: (filters: ActivityFeedFilters) => void;
  teamMembers: ActivityTeamMember[];
  isTeamMembersError: boolean;
  timeZone?: string;
}

const ActivityFilterControl: FC<ActivityFilterControlProps> = ({
  id,
  filters,
  onApplyFilters,
  teamMembers,
  isTeamMembersError,
  timeZone
}) => {
  const translateText = useTranslator("crmModule");
  const translateAria = useTranslator("crmAria");

  const [filterAnchorEl, setFilterAnchorEl] = useState<HTMLElement | null>(
    null
  );

  const isFilterOpen = filterAnchorEl !== null;
  const filterButtonId = `${id}-button`;
  const filterPopoverId = `${id}-popover`;
  const activeFilterCount =
    Number(Boolean(filters.ownerId)) +
    Number(Boolean(filters.fromDate || filters.toDate));

  const handleCloseFilters = () => {
    setFilterAnchorEl(null);
    document.getElementById(filterButtonId)?.focus();
  };

  const handleToggleFilters = (event: MouseEvent<HTMLElement>) => {
    setFilterAnchorEl(isFilterOpen ? null : event.currentTarget);
  };

  return (
    <div>
      <IconButton
        id={filterButtonId}
        type="button"
        icon={<FilterListIcon />}
        variant="transparent"
        shape="square"
        aria-label={translateAria([
          "activities",
          "toolbar",
          activeFilterCount > 0 ? "openFiltersActive" : "openFilters"
        ])}
        aria-haspopup="dialog"
        aria-expanded={isFilterOpen}
        aria-controls={isFilterOpen ? filterPopoverId : ""}
        badge={{ count: activeFilterCount, show: activeFilterCount > 0 }}
        onClick={handleToggleFilters}
      />

      <Popper
        id={`${filterPopoverId}-popper`}
        open={isFilterOpen}
        anchorEl={filterAnchorEl}
        position="bottom-start"
        containerClassName="rounded-2xl shadow-lg"
        ariaRole="dialog"
        ariaLabel={translateText(["activities", "toolbar", "filters", "title"])}
        handleClose={handleCloseFilters}
      >
        <ActivityFilterPopover
          id={filterPopoverId}
          filters={filters}
          teamMembers={teamMembers}
          isTeamMembersError={isTeamMembersError}
          timeZone={timeZone}
          onApply={onApplyFilters}
          onClose={handleCloseFilters}
        />
      </Popper>
    </div>
  );
};

export default ActivityFilterControl;
