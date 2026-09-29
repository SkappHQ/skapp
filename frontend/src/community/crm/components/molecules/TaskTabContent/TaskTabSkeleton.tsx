import { FC } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";
import SkeletonShape from "~community/crm/components/atoms/SkeletonShape/SkeletonShape";
import TaskRowSkeleton from "~community/crm/components/molecules/TaskRow/TaskRowSkeleton";

interface Props {
  rowCount: number;
  groupCount: number;
}

const TaskTabSkeleton: FC<Props> = ({ rowCount, groupCount }) => {
  const translateText = useTranslator("crmModule");

  return (
    <div role="status" aria-busy={true} aria-live="polite">
      <span className="sr-only">
        {translateText(["tasks", "table", "infiniteScrollLoadingMessage"])}
      </span>
      <div className="flex flex-col gap-4" aria-hidden="true">
        {Array.from({ length: groupCount }).map((_, groupIndex) => (
          <div className="flex flex-col" key={groupIndex}>
            <SkeletonShape circle className="h-3 w-16 mb-2" />
            <div className="border border-secondary-accent rounded-lg overflow-hidden divide-y divide-secondary-accent">
              {Array.from({ length: rowCount }).map((_, rowIndex) => (
                <TaskRowSkeleton key={rowIndex} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TaskTabSkeleton;
