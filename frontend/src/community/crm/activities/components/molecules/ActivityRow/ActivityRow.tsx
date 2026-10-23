import { FC } from "react";

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

  return (
    <div className="relative flex items-center gap-4 p-3 min-w-0 min-h-[63px] bg-white hover:bg-secondary-background overflow-hidden">
      <button
        id={rowId}
        type="button"
        aria-label={translateAria(["activities", "row", "openDetails"], {
          type: translateText([
            "activities",
            "types",
            ACTIVITY_TYPE_LABEL_KEYS[row.type]
          ]).toLowerCase(),
          subject: row.subject
        })}
        className="absolute inset-0 w-full h-full cursor-pointer focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary-accent"
        onClick={() => onRowClick(row)}
      />

      {!isTask && <span aria-hidden="true" className="w-7 shrink-0" />}

      {isTask && (
        <div className="relative pointer-events-auto">
          <ActivityRowCheckbox
            id={`${rowId}-checkbox`}
            subject={row.subject}
            isCompleted={row.isCompleted}
            canComplete={row.canComplete}
            onToggle={(isCompleted) => onToggleComplete(row, isCompleted)}
          />
        </div>
      )}

      <div className="relative flex flex-1 items-center gap-3 min-w-0 pointer-events-none">
        <ActivityTypeIcon id={`${rowId}-type`} type={row.type} />

        <div className="flex-1 min-w-0">
          <p
            id={`${rowId}-subject`}
            className={`body2 truncate ${
              isCompletedStyleApplied
                ? "line-through text-secondary-icon"
                : "text-black"
            }`}
            title={row.subject}
          >
            {row.subject}
          </p>

          <ActivityRowSubtitle
            id={`${rowId}-subtitle`}
            row={row}
            timeZone={timeZone}
            isCompletedStyleApplied={isCompletedStyleApplied}
          />
        </div>
      </div>

      <div className="relative flex items-center gap-6 shrink-0 pointer-events-none">
        {isTask && row.priority && (
          <ActivityPriorityMarker priority={row.priority} />
        )}

        {row.owner && (
          <div className="pointer-events-auto">
            <ActivityOwnerAvatar id={`${rowId}-owner`} owner={row.owner} />
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityRow;
