import { FC, KeyboardEvent } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";
import ActivityOwnerAvatar from "~community/crm/activities/components/atoms/ActivityOwnerAvatar/ActivityOwnerAvatar";
import ActivityPriorityMarker from "~community/crm/activities/components/atoms/ActivityPriorityMarker/ActivityPriorityMarker";
import ActivityTypeIcon from "~community/crm/activities/components/atoms/ActivityTypeIcon/ActivityTypeIcon";
import { ACTIVITY_TYPE_LABEL_KEYS } from "~community/crm/activities/constants/activityConstants";
import {
  ActivityRow as ActivityRowData,
  ActivityType
} from "~community/crm/activities/types/activityTypes";
import { getActivityRowKey } from "~community/crm/activities/utils/activityFeedUtil";

import ActivityRowCheckbox from "./ActivityRowCheckbox";
import ActivityRowSubtitle from "./ActivityRowSubtitle";

export interface ActivityRowProps {
  row: ActivityRowData;
  timeZone?: string;
  onRowClick: (row: ActivityRowData) => void;
  onToggleComplete: (row: ActivityRowData, isCompleted: boolean) => void;
}

const ActivityRow: FC<ActivityRowProps> = ({
  row,
  timeZone,
  onRowClick,
  onToggleComplete
}) => {
  const translateText = useTranslator("crmModule");
  const translateAria = useTranslator("crmAria");

  const rowId = `crm-activity-row-${getActivityRowKey(row)}`;
  const isTask = row.type === ActivityType.TASK;
  const isCompletedStyleApplied = isTask && row.isCompleted;

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget) return;

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onRowClick(row);
    }
  };

  return (
    <div
      id={rowId}
      role="button"
      tabIndex={0}
      aria-label={translateAria(["activities", "row", "openDetails"], {
        type: translateText([
          "activities",
          "types",
          ACTIVITY_TYPE_LABEL_KEYS[row.type]
        ]).toLowerCase(),
        subject: row.title
      })}
      className="relative flex items-center gap-4 p-3 min-w-0 min-h-[63px] bg-white hover:bg-secondary-background overflow-hidden cursor-pointer focus-visible:outline-2 focus-visible:outline-primary-accent"
      onClick={() => onRowClick(row)}
      onKeyDown={handleKeyDown}
    >
      {!isTask && <span aria-hidden="true" className="w-7 shrink-0" />}

      {isTask && (
        <ActivityRowCheckbox
          id={`${rowId}-checkbox`}
          subject={row.title}
          isCompleted={row.isCompleted}
          canComplete={row.canComplete}
          onToggle={(isCompleted) => onToggleComplete(row, isCompleted)}
        />
      )}

      <div className="flex flex-1 items-center gap-3 min-w-0">
        <ActivityTypeIcon id={`${rowId}-type`} type={row.type} />

        <div className="flex-1 min-w-0">
          <p
            id={`${rowId}-subject`}
            className={`body2 truncate ${
              isCompletedStyleApplied
                ? "line-through text-secondary-icon"
                : "text-black"
            }`}
            title={row.title}
          >
            {row.title}
          </p>

          <ActivityRowSubtitle
            id={`${rowId}-subtitle`}
            row={row}
            timeZone={timeZone}
            isCompletedStyleApplied={isCompletedStyleApplied}
          />
        </div>
      </div>

      <div className="flex items-center gap-6 shrink-0">
        {isTask && row.priority && (
          <ActivityPriorityMarker priority={row.priority} />
        )}

        {row.owner && (
          <ActivityOwnerAvatar id={`${rowId}-owner`} owner={row.owner} />
        )}
      </div>
    </div>
  );
};

export default ActivityRow;
