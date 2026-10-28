import { FC } from "react";

import ActivityRowSkeleton from "~community/crm/activities/components/molecules/ActivityRow/ActivityRowSkeleton";
import SkeletonShape from "~community/crm/components/atoms/SkeletonShape/SkeletonShape";

interface ActivityFeedSkeletonProps {
  id: string;
  message: string;
  groupCount?: number;
  rowCount?: number;
  isShowCheckbox?: boolean;
}

const ActivityFeedSkeleton: FC<ActivityFeedSkeletonProps> = ({
  id,
  message,
  groupCount = 3,
  rowCount = 4,
  isShowCheckbox = false
}) => {
  const groupIndexes = [...Array(groupCount).keys()];
  const rowIndexes = [...Array(rowCount).keys()];

  return (
    <div id={id} role="status" aria-busy={true} aria-live="polite">
      <span className="sr-only">{message}</span>
      <div className="flex flex-col gap-4" aria-hidden="true">
        {groupIndexes.map((groupIndex) => (
          <div className="flex flex-col" key={`${id}-group-${groupIndex}`}>
            <SkeletonShape circle className="h-3 w-16 mb-2" />
            <div className="border border-secondary-accent rounded-lg overflow-hidden divide-y divide-secondary-accent">
              {rowIndexes.map((rowIndex) => (
                <ActivityRowSkeleton
                  key={`${id}-row-${rowIndex}`}
                  isShowCheckbox={isShowCheckbox}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActivityFeedSkeleton;
