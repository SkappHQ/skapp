import { FC } from "react";

import SkeletonShape from "~community/crm/components/atoms/SkeletonShape/SkeletonShape";
import TaskRowSkeleton from "~community/crm/components/molecules/SidePanelSkeleton/TaskRowSkeleton";

const DealSidePanelSkeleton: FC = () => (
  <div className="flex flex-col gap-6 w-full" aria-hidden="true">
    <SkeletonShape className="h-5 w-48" />

    <div className="flex gap-6 items-start">
      <div className="flex-1 flex flex-col gap-6 min-w-0">
        <div className="flex gap-3">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="flex-1 border border-secondary-accent rounded-lg p-3 flex flex-col gap-1"
            >
              <SkeletonShape className="h-2.5 w-14" />
              <SkeletonShape className="h-3 w-10" />
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-1">
          <SkeletonShape className="h-2.5 w-20" />
          <SkeletonShape className="h-px w-full" />
          <SkeletonShape className="h-2.5 w-12" />
        </div>

        <div className="flex flex-col gap-3">
          <SkeletonShape className="h-2.5 w-10" />
          <hr className="border-secondary-accent" />
          <div className="border border-secondary-accent rounded-lg divide-y divide-secondary-accent overflow-hidden">
            <TaskRowSkeleton firstRow />
            <TaskRowSkeleton />
            <TaskRowSkeleton />
            <TaskRowSkeleton />
          </div>
          <div className="flex items-center gap-2">
            <SkeletonShape className="h-4 w-16" />
            <SkeletonShape className="h-4 w-4" />
          </div>
        </div>
      </div>

      <div className="w-1/3 flex flex-col gap-4 shrink-0">
        <div className="w-full max-w-[13.688rem] border border-secondary-accent rounded-lg px-3 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <SkeletonShape circle className="h-2 w-2 shrink-0" />
            <SkeletonShape className="h-2.5 w-20" />
          </div>
          <SkeletonShape className="h-4 w-4" />
        </div>

        <div className="border border-secondary-accent rounded-lg p-3 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <SkeletonShape className="h-2.5 w-10" />
            <SkeletonShape className="h-2.5 w-16" />
          </div>
          <div className="flex items-center justify-between">
            <SkeletonShape className="h-2.5 w-14" />
            <div className="flex items-center gap-1">
              <SkeletonShape className="h-3 w-3" />
              <SkeletonShape circle className="h-4 w-14.75" />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <SkeletonShape className="h-2.5 w-16" />
            <div className="flex items-center gap-2">
              <SkeletonShape circle className="h-5 w-5 shrink-0" />
              <SkeletonShape className="h-2.5 w-16" />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <SkeletonShape className="h-2.5 w-14" />
            <SkeletonShape className="h-2.5 w-20" />
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default DealSidePanelSkeleton;
