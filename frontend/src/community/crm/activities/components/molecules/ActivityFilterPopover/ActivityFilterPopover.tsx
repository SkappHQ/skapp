import { ButtonV2, CloseIcon, IconButton } from "@rootcodelabs/skapp-ui";
import { FC, useState } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";
import ActivityDateRangeField from "~community/crm/activities/components/molecules/ActivityDateRangeField/ActivityDateRangeField";
import ActivityTeamMemberField from "~community/crm/activities/components/molecules/ActivityTeamMemberField/ActivityTeamMemberField";
import {
  ActivityDateRange,
  ActivityFeedFilters
} from "~community/crm/activities/types/activityTypes";
import {
  areFilterValuesEqual,
  validateDateRange
} from "~community/crm/activities/utils/activityFilterUtil";
import { CrmOwnerEntity } from "~community/crm/types/CrmCommonTypes";

export interface ActivityFilterPopoverProps {
  id: string;
  filters: ActivityFeedFilters;
  teamMembers: CrmOwnerEntity[];
  isTeamMembersError: boolean;
  timeZone?: string;
  onApply: (filters: ActivityFeedFilters) => void;
  onClose: () => void;
}

const ActivityFilterPopover: FC<ActivityFilterPopoverProps> = ({
  id,
  filters,
  teamMembers,
  isTeamMembersError,
  timeZone,
  onApply,
  onClose
}) => {
  const translateText = useTranslator("crmModule");
  const translateAria = useTranslator("crmAria");

  const [selectedFilters, setSelectedFilters] =
    useState<ActivityFeedFilters>(filters);

  const isRangeValid = validateDateRange(selectedFilters);
  const isChanged = !areFilterValuesEqual(selectedFilters, filters);
  const isApplyDisabled = !isChanged || !isRangeValid;
  const isResetDisabled =
    areFilterValuesEqual(selectedFilters, {}) &&
    areFilterValuesEqual(filters, {});

  const handleApply = (): void => {
    onApply(selectedFilters);
    onClose();
  };

  const handleReset = (): void => {
    setSelectedFilters({});
    onApply({});
    onClose();
  };

  const handleDateRangeChange = (dateRange: ActivityDateRange): void => {
    setSelectedFilters((previous) => ({
      ...(previous.ownerId ? { ownerId: previous.ownerId } : {}),
      ...dateRange
    }));
  };

  const handleOwnerChange = (ownerId: number | null): void => {
    setSelectedFilters((previous) => ({
      ...(previous.fromDate ? { fromDate: previous.fromDate } : {}),
      ...(previous.toDate ? { toDate: previous.toDate } : {}),
      ...(ownerId ? { ownerId } : {})
    }));
  };

  return (
    <div
      id={id}
      className="flex max-h-[765px] min-h-0 w-[25.5rem] max-w-[calc(100vw-2rem)] flex-col rounded-2xl bg-white shadow-lg"
    >
      <div className="flex min-h-0 flex-col gap-5 overflow-y-auto px-5 pt-5 pb-4">
        <div className="flex items-center justify-between">
          <h2 className="h2">
            {translateText(["activities", "toolbar", "filters", "title"])}
          </h2>
          <IconButton
            id={`${id}-close`}
            type="button"
            variant="no-background"
            icon={<CloseIcon />}
            aria-label={translateAria([
              "activities",
              "toolbar",
              "closeFilters"
            ])}
            onClick={onClose}
          />
        </div>

        <ActivityDateRangeField
          id={`${id}-date-range`}
          value={selectedFilters}
          timeZone={timeZone}
          onChange={handleDateRangeChange}
        />

        <ActivityTeamMemberField
          id={`${id}-team-member`}
          teamMembers={teamMembers}
          selectedOwnerId={selectedFilters.ownerId}
          isError={isTeamMembersError}
          onChange={handleOwnerChange}
        />
      </div>

      <div className="grid grid-cols-2 gap-3 border-t border-secondary-accent px-5 pt-4 pb-5">
        <ButtonV2
          id={`${id}-reset`}
          type="button"
          variant="secondary"
          isFullWidth
          disabled={isResetDisabled}
          onClick={handleReset}
        >
          {translateText(["activities", "toolbar", "filters", "reset"])}
        </ButtonV2>
        <ButtonV2
          id={`${id}-apply`}
          type="button"
          variant="primary"
          isFullWidth
          disabled={isApplyDisabled}
          onClick={handleApply}
        >
          {translateText(["activities", "toolbar", "filters", "apply"])}
        </ButtonV2>
      </div>
    </div>
  );
};

export default ActivityFilterPopover;
