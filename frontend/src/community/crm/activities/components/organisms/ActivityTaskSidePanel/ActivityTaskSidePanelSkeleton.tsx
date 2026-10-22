import { FC } from "react";

import ActivityRowSkeleton from "~community/crm/activities/components/molecules/ActivityRow/ActivityRowSkeleton";
import SkeletonShape from "~community/crm/components/atoms/SkeletonShape/SkeletonShape";

const INFO_ROW_COUNT = 4;

const ActivityTaskSidePanelSkeleton: FC = () => (
  <div className="flex gap-6 pb-4" aria-hidden="true">
    <div className="flex flex-col flex-1 gap-6">
      <div className="flex flex-col gap-1">
        <SkeletonShape className="h-3 w-12" />
        <SkeletonShape className="h-2.5 w-48" />
      </div>

      <div className="flex flex-col gap-3">
        <SkeletonShape className="h-3.5 w-10" />
        <hr className="border-secondary-accent" />
        <div className="border border-secondary-accent rounded-lg overflow-hidden">
          <ActivityRowSkeleton />
        </div>
      </div>
    </div>

    <div className="w-[18.438rem] shrink-0 flex flex-col gap-4">
      <SkeletonShape className="h-9 w-full" />

      <div className="flex flex-col border border-secondary-accent rounded-xl p-3">
        {Array.from({ length: INFO_ROW_COUNT }).map((_, index) => (
          <div key={index} className="flex w-full items-center gap-4 min-h-11">
            <div className="w-30 shrink-0">
              <SkeletonShape className="h-2.5 w-20" />
            </div>
            <div className="flex-1">
              <SkeletonShape className="h-2.5 w-20" />
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default ActivityTaskSidePanelSkeleton;
