import {
  FilterListIcon,
  IconButton,
  Popper,
  Tabs
} from "@rootcodelabs/skapp-ui";
import { FC, MouseEvent, useState } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";
import ActivityFilterPopover from "~community/crm/activities/components/molecules/ActivityFilterPopover/ActivityFilterPopover";
import ActivitySearchField from "~community/crm/activities/components/molecules/ActivitySearchField/ActivitySearchField";
import {
  ACTIVITY_TABS,
  ACTIVITY_TOOLBAR_ID
} from "~community/crm/activities/constants/activityConstants";
import {
  ActivityFilterValues,
  ActivityTab,
  ActivityTeamMember
} from "~community/crm/activities/types/activityTypes";
import { countActiveFilters } from "~community/crm/activities/utils/activityFilterUtil";

export interface ActivityToolbarProps {
  id?: string;
  activeTab: ActivityTab;
  onTabChange: (tab: ActivityTab) => void;
  searchTerm: string;
  onSearchChange: (searchTerm: string) => void;
  resultCount: number | null;
  isManager: boolean;
  filters: ActivityFilterValues;
  onApplyFilters: (filters: ActivityFilterValues) => void;
  teamMembers: ActivityTeamMember[];
  isTeamMembersError: boolean;
  timeZone?: string;
}

const ActivityToolbar: FC<ActivityToolbarProps> = ({
  id = ACTIVITY_TOOLBAR_ID,
  activeTab,
  onTabChange,
  searchTerm,
  onSearchChange,
  resultCount,
  isManager,
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

  const filterButtonId = `${id}-filter-button`;
  const filterPopoverId = `${id}-filter-popover`;
  const activeFilterCount = countActiveFilters(filters);

  const tabs = ACTIVITY_TABS.map((tab) => ({
    id: tab.id,
    label: translateText(["activities", "tabs", tab.labelKey])
  }));

  const handleCloseFilters = () => {
    setFilterAnchorEl(null);
    document.getElementById(filterButtonId)?.focus();
  };

  const handleToggleFilters = (event: MouseEvent<HTMLElement>) => {
    setFilterAnchorEl(isFilterOpen ? null : event.currentTarget);
  };

  const searchPlaceholderKey =
    ACTIVITY_TABS.find((tab) => tab.id === activeTab)?.labelKey ??
    ACTIVITY_TABS[0].labelKey;

  return (
    <div id={id} className="flex flex-col gap-4">
      <div className="border-b border-secondary-accent">
        <Tabs
          tabs={tabs}
          activeTabId={activeTab}
          ariaLabel={translateAria(["activities", "tabs"])}
          onTabChange={(tabId: string) => onTabChange(tabId as ActivityTab)}
        />
      </div>

      <div className="flex items-center gap-3">
        {isManager && (
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
              ariaRole="presentation"
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
        )}

        <ActivitySearchField
          id={`${id}-search`}
          placeholder={translateText([
            "activities",
            "toolbar",
            "search",
            "placeholders",
            searchPlaceholderKey
          ])}
          searchTerm={searchTerm}
          onSearchChange={onSearchChange}
          resultCount={resultCount}
        />
      </div>
    </div>
  );
};

export default ActivityToolbar;
