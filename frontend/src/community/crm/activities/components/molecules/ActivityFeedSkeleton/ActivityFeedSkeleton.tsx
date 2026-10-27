import { FC } from "react";

import ActivityRowSkeleton from "~community/crm/activities/components/molecules/ActivityRow/ActivityRowSkeleton";
import { ACTIVITY_SKELETON_CONFIG } from "~community/crm/activities/constants/activityConstants";
import SkeletonShape from "~community/crm/components/atoms/SkeletonShape/SkeletonShape";

interface ActivityFeedSkeletonProps {
  id: string;
  message: string;
  groupCount?: number;
  rowCount?: number;
  showCheckbox?: boolean;
}

const ActivityFeedSkeleton: FC<ActivityFeedSkeletonProps> = ({
  id,
  message,
  groupCount = ACTIVITY_SKELETON_CONFIG.groupCount,
  rowCount = ACTIVITY_SKELETON_CONFIG.rowCount,
  showCheckbox = false
}) => {
  const groupIds = Array.from(
    { length: groupCount },
    (_, groupIndex) => `${id}-group-${groupIndex}`
  );
  const rowIds = Array.from(
    { length: rowCount },
    (_, rowIndex) => `${id}-row-${rowIndex}`
  );

  return (
    <div id={id} role="status" aria-busy={true} aria-live="polite">
      <span className="sr-only">{message}</span>
      <div className="flex flex-col gap-4" aria-hidden="true">
        {groupIds.map((groupId) => (
          <div className="flex flex-col" key={groupId}>
            <SkeletonShape circle className="h-3 w-16 mb-2" />
            <div className="border border-secondary-accent rounded-lg overflow-hidden divide-y divide-secondary-accent">
              {rowIds.map((rowId) => (
                <ActivityRowSkeleton key={rowId} showCheckbox={showCheckbox} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActivityFeedSkeleton;
