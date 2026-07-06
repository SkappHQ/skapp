import { FC } from "react";

import SkeletonShape from "~community/crm/components/atoms/SkeletonShape/SkeletonShape";
import TaskRowSkeleton from "~community/crm/components/molecules/TaskRow/TaskRowSkeleton";

interface Props {
  rowCount?: number;
}

const TaskListSkeleton: FC<Props> = ({ rowCount = 2 }) => (
  <div className="flex flex-col gap-4" aria-hidden="true">
    <div className="flex flex-col">
      <SkeletonShape circle className="h-3 w-15 mb-2" />
      <div className="border border-secondary-accent rounded-lg overflow-hidden divide-y divide-secondary-accent">
        {Array.from({ length: rowCount }).map((_, rowIndex) => (
          <TaskRowSkeleton key={rowIndex} />
        ))}
      </div>
    </div>
    <div className="flex flex-col">
      <SkeletonShape circle className="h-3 w-15 mb-2" />
      <div className="border border-secondary-accent rounded-lg overflow-hidden divide-y divide-secondary-accent">
        {Array.from({ length: rowCount }).map((_, rowIndex) => (
          <TaskRowSkeleton key={rowIndex} />
        ))}
      </div>
    </div>
    <div className="flex flex-col">
      <SkeletonShape circle className="h-3 w-15 mb-2" />
      <div className="border border-secondary-accent rounded-lg overflow-hidden divide-y divide-secondary-accent">
        {Array.from({ length: rowCount }).map((_, rowIndex) => (
          <TaskRowSkeleton key={rowIndex} />
        ))}
      </div>
    </div>
    <div className="flex flex-col">
      <SkeletonShape circle className="h-3 w-15 mb-2" />
      <div className="border border-secondary-accent rounded-lg overflow-hidden divide-y divide-secondary-accent">
        {Array.from({ length: rowCount }).map((_, rowIndex) => (
          <TaskRowSkeleton key={rowIndex} />
        ))}
      </div>
    </div>
  </div>
);

export default TaskListSkeleton;
