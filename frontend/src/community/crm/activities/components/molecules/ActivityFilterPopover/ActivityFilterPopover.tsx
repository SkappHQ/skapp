import { ButtonV2, CloseIcon, IconButton } from "@rootcodelabs/skapp-ui";
import { FC, useState } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";
import ActivityChipFilterField from "~community/crm/activities/components/molecules/ActivityChipFilterField/ActivityChipFilterField";
import ActivityDateRangeField from "~community/crm/activities/components/molecules/ActivityDateRangeField/ActivityDateRangeField";
import ActivityTeamMemberField from "~community/crm/activities/components/molecules/ActivityTeamMemberField/ActivityTeamMemberField";
import {
  ActivityDateRange,
  ActivityFilterValues,
  ActivityTaskStatus
} from "~community/crm/activities/types/activityTypes";
import {
  areFilterValuesEqual,
  validateDateRange
} from "~community/crm/activities/utils/activityFilterUtil";
import { PRIORITY_OPTIONS } from "~community/crm/constants/taskConstants";
import { CrmPriorityEnum } from "~community/crm/enums/common";
import { CrmOwnerEntity } from "~community/crm/types/CrmCommonTypes";

export interface ActivityFilterPopoverProps {
  id: string;
  filters: ActivityFilterValues;
  teamMembers: CrmOwnerEntity[];
  isTeamMembersError: boolean;
  isTaskFilterShown: boolean;
  isDateRangeShown: boolean;
  isTeamMemberShown: boolean;
  timeZone?: string;
  onApply: (filters: ActivityFilterValues) => void;
  onClose: () => void;
}

const ActivityFilterPopover: FC<ActivityFilterPopoverProps> = ({
  id,
  filters,
  teamMembers,
  isTeamMembersError,
  isTaskFilterShown,
  isDateRangeShown,
  isTeamMemberShown,
  timeZone,
  onApply,
  onClose
}) => {
  const translateText = useTranslator("crmModule");
  const translateAria = useTranslator("crmAria");

  const TASK_STATUS_LABEL_KEYS: Record<ActivityTaskStatus, string> = {
    [ActivityTaskStatus.OVERDUE]: "overdue",
    [ActivityTaskStatus.TODAY]: "today",
    [ActivityTaskStatus.UPCOMING]: "upcoming",
    [ActivityTaskStatus.COMPLETED]: "completed"
  };

  const [selectedFilters, setSelectedFilters] =
    useState<ActivityFilterValues>(filters);

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

  const updateFilters = (
    clearedKeys: (keyof ActivityFilterValues)[],
    changes: ActivityFilterValues
  ): void => {
    setSelectedFilters((previous) => {
      const next = { ...previous };
      clearedKeys.forEach((key) => {
        delete next[key];
      });
      return { ...next, ...changes };
    });
  };

  const handleDateRangeChange = (dateRange: ActivityDateRange): void => {
    updateFilters(["fromDate", "toDate"], dateRange);
  };

  const handleOwnerChange = (ownerId: number | null): void => {
    updateFilters(["ownerId"], ownerId ? { ownerId } : {});
  };

  const handleTaskStatusChange = (
    value: ActivityTaskStatus | CrmPriorityEnum | null
  ): void => {
    updateFilters(
      ["taskStatus"],
      value ? { taskStatus: value as ActivityTaskStatus } : {}
    );
  };

  const handlePriorityChange = (
    value: ActivityTaskStatus | CrmPriorityEnum | null
  ): void => {
    updateFilters(
      ["priority"],
      value ? { priority: value as CrmPriorityEnum } : {}
    );
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

        {isTaskFilterShown && (
          <>
            <ActivityChipFilterField
              id={`${id}-task-status`}
              label={translateText([
                "activities",
                "toolbar",
                "filters",
                "taskStatus",
                "label"
              ])}
              options={Object.values(ActivityTaskStatus).map((status) => ({
                value: status,
                label: translateText([
                  "activities",
                  "toolbar",
                  "filters",
                  "taskStatus",
                  "options",
                  TASK_STATUS_LABEL_KEYS[status]
                ])
              }))}
              selectedValue={selectedFilters.taskStatus}
              onChange={handleTaskStatusChange}
            />

            <ActivityChipFilterField
              id={`${id}-priority`}
              label={translateText([
                "activities",
                "toolbar",
                "filters",
                "priority",
                "label"
              ])}
              options={PRIORITY_OPTIONS.map((option) => ({
                value: option.value,
                label: translateText(["common", "priorityOptions", option.key])
              }))}
              selectedValue={selectedFilters.priority}
              onChange={handlePriorityChange}
            />
          </>
        )}

        {isDateRangeShown && (
          <ActivityDateRangeField
            id={`${id}-date-range`}
            value={selectedFilters}
            timeZone={timeZone}
            onChange={handleDateRangeChange}
          />
        )}

        {isTeamMemberShown && (
          <ActivityTeamMemberField
            id={`${id}-team-member`}
            teamMembers={teamMembers}
            selectedOwnerId={selectedFilters.ownerId}
            isError={isTeamMembersError}
            onChange={handleOwnerChange}
          />
        )}
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
