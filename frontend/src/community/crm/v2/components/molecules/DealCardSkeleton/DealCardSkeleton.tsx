import { FC } from "react";

import SkeletonShape from "~community/crm/v2/components/atoms/SkeletonShape/SkeletonShape";

interface DealCardSkeletonProps {
  count?: number;
}

const DealCardSkeleton: FC<DealCardSkeletonProps> = ({ count = 1 }) => (
  <>
    {Array.from({ length: count }).map((_, index) => (
      <div
        key={index}
        aria-hidden="true"
        className="w-full rounded-lg bg-white p-3 outline outline-secondary-accent"
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <SkeletonShape circle className="h-8 w-8" />
            <SkeletonShape className="h-3 w-16" />
          </div>
          <SkeletonShape circle className="h-7 w-7" />
        </div>
        <div className="mt-3 space-y-1.5">
          <SkeletonShape className="h-3 w-full" />
          <SkeletonShape className="h-3 w-3/4" />
        </div>
        <SkeletonShape className="mt-3 h-3 w-2/3" />
        <div className="mt-3 flex items-center gap-1.5">
          <SkeletonShape className="h-4 w-4" />
          <SkeletonShape className="h-3 w-20" />
        </div>
        <div className="mt-3 flex items-center justify-end gap-2">
          <SkeletonShape circle className="h-6 w-14" />
          <SkeletonShape circle className="h-7 w-7" />
        </div>
      </div>
    ))}
  </>
);

export default DealCardSkeleton;
