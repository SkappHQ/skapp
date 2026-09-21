import { FC } from "react";

import SkeletonShape from "~community/crm/v2/components/atoms/SkeletonShape/SkeletonShape";
import TaskRowSkeleton from "~community/crm/v2/components/molecules/TaskRow/TaskRowSkeleton";

const DealSidePanelSkeleton: FC = () => (
  <div className="flex flex-col gap-6 w-full" aria-hidden="true">
    <SkeletonShape className="h-5 w-48" />

    <div className="flex gap-6 items-start">
      <div className="flex-1 flex flex-col gap-6 min-w-0">
        <div className="flex flex-col gap-1">
          <SkeletonShape className="h-2.5 w-20" />
          <SkeletonShape className="h-px w-full" />
          <SkeletonShape className="h-2.5 w-12" />
        </div>

        <div className="flex flex-col gap-3">
          <SkeletonShape className="h-2.5 w-10" />
          <hr className="border-secondary-accent" />
          <div className="border border-secondary-accent rounded-lg divide-y divide-secondary-accent overflow-hidden">
            <TaskRowSkeleton />
            <TaskRowSkeleton />
            <TaskRowSkeleton />
          </div>
        </div>
      </div>

      <div className="w-1/3 flex flex-col gap-4 shrink-0">
        <SkeletonShape className="h-9 w-[55%] rounded-lg" />
        <div className="border border-secondary-accent rounded-lg p-3 flex flex-col gap-3">
          {[0, 1, 2, 3].map((index) => (
            <div key={index} className="flex items-center justify-between">
              <SkeletonShape className="h-2.5 w-14" />
              <SkeletonShape className="h-2.5 w-20" />
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

export default DealSidePanelSkeleton;
