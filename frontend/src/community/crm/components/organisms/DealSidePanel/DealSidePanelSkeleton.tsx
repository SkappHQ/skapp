import { FC } from "react";

import SkeletonShape from "~community/crm/components/atoms/SkeletonShape/SkeletonShape";
import TaskRowSkeleton from "~community/crm/components/molecules/TaskRow/TaskRowSkeleton";

const DealSidePanelSkeleton: FC = () => (
  <div role="status" aria-busy={true} aria-live="polite" className="w-full">
    <div className="flex w-full flex-col gap-6" aria-hidden="true">
      <SkeletonShape className="h-5 w-48" />

      <div className="flex items-start gap-6">
        <div className="flex min-w-0 flex-1 flex-col gap-6">
          <div className="flex flex-col gap-1">
            <SkeletonShape className="h-2.5 w-20" />
            <SkeletonShape className="h-px w-full" />
            <SkeletonShape className="h-2.5 w-12" />
          </div>

          <div className="flex flex-col gap-3">
            <SkeletonShape className="h-2.5 w-10" />
            <hr className="border-secondary-accent" />
            <div className="divide-y divide-secondary-accent overflow-hidden rounded-lg border border-secondary-accent">
              {Array.from({ length: 4 }).map((_, index) => (
                <TaskRowSkeleton key={index} />
              ))}
            </div>
            <div className="flex items-center gap-2">
              <SkeletonShape className="h-4 w-16" />
              <SkeletonShape className="h-4 w-4" />
            </div>
          </div>
        </div>

        <div className="flex w-1/3 shrink-0 flex-col gap-4">
          <div className="flex w-full max-w-[13.688rem] items-center justify-between rounded-lg border border-secondary-accent px-3 py-2">
            <div className="flex items-center gap-2">
              <SkeletonShape circle className="h-2 w-2 shrink-0" />
              <SkeletonShape className="h-2.5 w-20" />
            </div>
            <SkeletonShape className="h-4 w-4" />
          </div>

          <div className="flex flex-col gap-3 rounded-lg border border-secondary-accent p-3">
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
  </div>
);

export default DealSidePanelSkeleton;
