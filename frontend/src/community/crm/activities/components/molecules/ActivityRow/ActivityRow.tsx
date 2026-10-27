import { FC } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";
import ActivityTypeIcon from "~community/crm/activities/components/atoms/ActivityTypeIcon/ActivityTypeIcon";
import { ACTIVITY_TYPE_LABEL_KEYS } from "~community/crm/activities/constants/activityConstants";
import {
  ActivityRow as ActivityRowData,
  ActivityType
} from "~community/crm/activities/types/activityTypes";
import { getActivityRowKey } from "~community/crm/activities/utils/activityFeedUtil";
import PriorityLabel from "~community/crm/components/atoms/PriorityLabel/PriorityLabel";

import ActivityRowCheckbox from "./ActivityRowCheckbox";
import ActivityRowSubtitle from "./ActivityRowSubtitle";

export interface ActivityRowProps {
  row: ActivityRowData;
  timeZone?: string;
  showCheckbox: boolean;
  onRowClick: (row: ActivityRowData) => void;
  onToggleComplete: (row: ActivityRowData, isCompleted: boolean) => void;
}

const ActivityRow: FC<ActivityRowProps> = ({
  row,
  timeZone,
  showCheckbox,
  onRowClick,
  onToggleComplete
}) => {
  const translateText = useTranslator("crmModule");
  const translateAria = useTranslator("crmAria");

  const rowId = `crm-activity-row-${getActivityRowKey(row)}`;
  const isTask = row.type === ActivityType.TASK;
  const isCompletedStyleApplied = isTask && row.isCompleted;

  return (
    <div
      id={rowId}
      className="relative flex items-center gap-4 p-3 min-w-0 min-h-[63px] bg-white hover:bg-secondary-background overflow-hidden"
    >
      <button
        id={`${rowId}-open`}
        type="button"
        aria-label={translateAria(["activities", "row", "openDetails"], {
          type: translateText([
            "activities",
            "types",
            ACTIVITY_TYPE_LABEL_KEYS[row.type]
          ]).toLowerCase(),
          subject: row.title
        })}
        className="absolute inset-0 cursor-pointer focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary-accent"
        onClick={() => onRowClick(row)}
      />

      {showCheckbox && isTask && (
        <div className="relative z-10">
          <ActivityRowCheckbox
            id={`${rowId}-checkbox`}
            subject={row.title}
            isCompleted={row.isCompleted}
            canComplete={row.canComplete}
            onToggle={(isCompleted) => onToggleComplete(row, isCompleted)}
          />
        </div>
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
        {isTask && row.priority && <PriorityLabel priority={row.priority} />}
      </div>
    </div>
  );
};

export default ActivityRow;
