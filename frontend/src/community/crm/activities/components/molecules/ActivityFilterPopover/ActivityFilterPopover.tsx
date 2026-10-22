import { ButtonV2, CloseIcon, IconButton } from "@rootcodelabs/skapp-ui";
import { FC, KeyboardEvent, useEffect, useState } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";
import ActivityDateRangeField from "~community/crm/activities/components/molecules/ActivityDateRangeField/ActivityDateRangeField";
import ActivityTeamMemberField from "~community/crm/activities/components/molecules/ActivityTeamMemberField/ActivityTeamMemberField";
import { EMPTY_ACTIVITY_FILTERS } from "~community/crm/activities/constants/activityConstants";
import {
  ActivityFilterValues,
  ActivityTeamMember
} from "~community/crm/activities/types/activityTypes";
import { validateDateRange } from "~community/crm/activities/utils/activityFeedUtil";
import { areFilterValuesEqual } from "~community/crm/activities/utils/activityFilterUtil";

export interface ActivityFilterPopoverProps {
  id: string;
  filters: ActivityFilterValues;
  teamMembers: ActivityTeamMember[];
  isTeamMembersError: boolean;
  timeZone?: string;
  onApply: (filters: ActivityFilterValues) => void;
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

  const [draft, setDraft] = useState<ActivityFilterValues>(filters);

  useEffect(() => {
    document.getElementById(id)?.focus();
  }, [id]);

  const isRangeValid = validateDateRange(draft.dateRange);
  const isChanged = !areFilterValuesEqual(draft, filters);
  const isApplyDisabled = !isChanged || !isRangeValid;

  const handleApply = () => {
    onApply(draft);
    onClose();
  };

  const handleReset = () => {
    setDraft(EMPTY_ACTIVITY_FILTERS);
    onApply(EMPTY_ACTIVITY_FILTERS);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape" && !event.defaultPrevented) {
      event.preventDefault();
      onClose();
    }
  };

  return (
    <div
      id={id}
      role="dialog"
      aria-modal={false}
      aria-labelledby={`${id}-title`}
      tabIndex={-1}
      onKeyDown={handleKeyDown}
      className="flex max-h-[765px] min-h-0 w-[25.5rem] max-w-[calc(100vw-2rem)] flex-col rounded-2xl bg-white shadow-lg focus:outline-none"
    >
      <div className="flex min-h-0 flex-col gap-5 overflow-y-auto px-5 pt-5 pb-4">
        <div className="flex items-center justify-between">
          <h2 id={`${id}-title`} className="h2">
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
          value={draft.dateRange}
          timeZone={timeZone}
          onChange={(dateRange) => setDraft({ ...draft, dateRange })}
        />

        <ActivityTeamMemberField
          id={`${id}-team-member`}
          teamMembers={teamMembers}
          selectedOwnerId={draft.ownerId}
          isError={isTeamMembersError}
          onChange={(ownerId) => setDraft({ ...draft, ownerId })}
        />
      </div>

      <div className="grid grid-cols-2 gap-3 border-t border-secondary-accent px-5 pt-4 pb-5">
        <ButtonV2
          id={`${id}-reset`}
          type="button"
          variant="secondary"
          isFullWidth
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
