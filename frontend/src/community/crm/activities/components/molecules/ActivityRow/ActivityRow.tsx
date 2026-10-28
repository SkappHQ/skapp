import { Avatar } from "@rootcodelabs/skapp-ui";
import { FC } from "react";

import useGetImageUrl from "~community/common/hooks/useGetImageUrl";
import { useTranslator } from "~community/common/hooks/useTranslator";
import ActivityTypeIcon from "~community/crm/activities/components/atoms/ActivityTypeIcon/ActivityTypeIcon";
import {
  ActivityRow as ActivityRowData,
  ActivityType
} from "~community/crm/activities/types/activityTypes";
import { getActivityRowKey } from "~community/crm/activities/utils/activityFeedUtil";
import PriorityLabel from "~community/crm/components/atoms/PriorityLabel/PriorityLabel";
import { useCrmStore } from "~community/crm/store/store";
import { getOwnerName } from "~community/crm/utils/commonUtil";

import ActivityRowCheckbox from "./ActivityRowCheckbox";
import ActivityRowSubtitle from "./ActivityRowSubtitle";

export interface ActivityRowProps {
  row: ActivityRowData;
  timeZone?: string;
  isShowCheckbox: boolean;
  onRowClick: (row: ActivityRowData) => void;
  onToggleComplete: (row: ActivityRowData, isCompleted: boolean) => void;
}

const ActivityRow: FC<ActivityRowProps> = ({
  row,
  timeZone,
  isShowCheckbox,
  onRowClick,
  onToggleComplete
}) => {
  const translateText = useTranslator("crmModule");
  const translateAria = useTranslator("crmAria");

  const owners = useCrmStore((state) => state.owners);

  const { ownerId } = row;
  const owner = ownerId ? owners[ownerId] : null;
  const ownerImageUrl = useGetImageUrl([owner?.authPic ?? ""])[0];
  const ownerName = ownerId ? getOwnerName(owners, ownerId) : "";

  const rowId = `crm-activity-row-${getActivityRowKey(row)}`;
  const isTask = row.type === ActivityType.TASK;
  const isCompletedStyleApplied = isTask && row.isCompleted;
  const isStrikethroughApplied = isShowCheckbox && isCompletedStyleApplied;

  return (
    <div
      id={rowId}
      className="flex items-center gap-4 p-3 min-w-0 min-h-[63px] bg-white hover:bg-secondary-background overflow-hidden"
    >
      {isShowCheckbox && isTask && (
        <ActivityRowCheckbox
          id={`${rowId}-checkbox`}
          subject={row.title}
          isCompleted={row.isCompleted}
          onToggle={(isCompleted) => onToggleComplete(row, isCompleted)}
        />
      )}

      <button
        id={`${rowId}-open`}
        type="button"
        aria-label={translateAria(["activities", "row", "openDetails"], {
          type: translateText([
            "activities",
            "types",
            row.type.toLowerCase()
          ]).toLowerCase(),
          subject: row.title
        })}
        className="flex flex-1 items-center gap-3 min-w-0 self-stretch text-left cursor-pointer rounded focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-accent"
        onClick={() => onRowClick(row)}
      >
        <ActivityTypeIcon id={`${rowId}-type`} type={row.type} />

        <span className="flex flex-col flex-1 min-w-0">
          <span
            id={`${rowId}-subject`}
            className={`body2 truncate ${
              isCompletedStyleApplied ? "text-secondary-icon" : "text-black"
            } ${isStrikethroughApplied ? "line-through" : ""}`}
            title={row.title}
          >
            {row.title}
          </span>

          <ActivityRowSubtitle
            id={`${rowId}-subtitle`}
            row={row}
            timeZone={timeZone}
            isCompletedStyleApplied={isCompletedStyleApplied}
            isStrikethroughApplied={isStrikethroughApplied}
          />
        </span>
      </button>

      <div className="flex items-center gap-6 shrink-0">
        {isTask && row.priority && <PriorityLabel priority={row.priority} />}

        {owner && (
          <span
            className="inline-flex shrink-0"
            role="img"
            aria-label={translateAria(["activities", "row", "owner"], {
              name: ownerName
            })}
          >
            <Avatar
              id={`${rowId}-owner`}
              size="xs"
              src={ownerImageUrl ?? undefined}
              firstName={owner.firstName}
              lastName={owner.lastName}
            />
          </span>
        )}
      </div>
    </div>
  );
};

export default ActivityRow;
