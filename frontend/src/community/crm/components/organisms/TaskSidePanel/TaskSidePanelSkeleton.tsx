import { FC } from "react";

import SkeletonShape from "~community/crm/components/atoms/SkeletonShape/SkeletonShape";
import TaskRowSkeleton from "~community/crm/components/molecules/TaskRow/TaskRowSkeleton";

const TaskSidePanelSkeleton: FC = () => (
  <div className="flex flex-col gap-[16px] pb-4" aria-hidden="true">
    <div className="flex gap-6 pb-4">
      <div className="flex flex-1 flex-col gap-6">
        <div className="flex flex-col gap-1">
          <SkeletonShape className="h-3 w-12" />
          <SkeletonShape className="h-2.5 w-48" />
        </div>

        <div className="flex flex-col gap-3">
          <SkeletonShape className="h-3.5 w-10" />
          <hr className="border-secondary-accent" />
          <div className="overflow-hidden rounded-lg border border-secondary-accent">
            <TaskRowSkeleton />
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <SkeletonShape className="h-3.5 w-24" />
          <hr className="border-secondary-accent" />
          <div className="divide-y divide-secondary-accent overflow-hidden rounded-lg border border-secondary-accent">
            {Array.from({ length: 4 }).map((_, index) => (
              <TaskRowSkeleton key={index} />
            ))}
          </div>
        </div>
      </div>

      <div className="flex w-[18.438rem] shrink-0 flex-col gap-4">
        <SkeletonShape className="h-9 w-full" />

        <div className="flex flex-col rounded-xl border border-secondary-accent p-3">
          <div className="flex min-h-11 w-full items-center gap-4">
            <div className="w-30 shrink-0">
              <SkeletonShape className="h-2.5 w-20" />
            </div>
            <div className="flex-1">
              <div className="flex w-fit items-center gap-2 rounded-full bg-secondary-background px-2 py-1">
                <SkeletonShape circle className="h-5 w-5 shrink-0" />
                <SkeletonShape className="h-2.5 w-20" />
              </div>
            </div>
          </div>

          <div className="flex min-h-11 w-full items-center gap-4">
            <div className="w-30 shrink-0">
              <SkeletonShape className="h-2.5 w-12" />
            </div>
            <div className="flex-1">
              <SkeletonShape circle className="h-5 w-16" />
            </div>
          </div>

          <div className="flex min-h-11 w-full items-center gap-4">
            <div className="w-30 shrink-0">
              <SkeletonShape className="h-2.5 w-20" />
            </div>
            <div className="flex-1">
              <SkeletonShape className="h-2.5 w-20" />
            </div>
          </div>

          <div className="flex min-h-11 w-full items-center gap-4">
            <div className="w-30 shrink-0">
              <SkeletonShape className="h-2.5 w-20" />
            </div>
            <div className="flex-1">
              <SkeletonShape className="h-2.5 w-20" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default TaskSidePanelSkeleton;
