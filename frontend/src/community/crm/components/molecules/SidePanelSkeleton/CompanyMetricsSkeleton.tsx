import { FC } from "react";

import SkeletonBlock from "./SkeletonBlock";

const CompanyMetricsSkeleton: FC = () => (
  <div className="flex gap-4 w-full" aria-hidden="true">
    <div className="flex-1 border border-secondary-accent rounded-lg p-3 flex flex-col gap-1">
      <SkeletonBlock className="h-2.5 w-14" />
      <div className="flex items-center gap-2">
        <SkeletonBlock className="h-3 w-11" />
        <div className="flex items-center gap-1 bg-secondary-accent rounded-full px-3 py-1">
          <SkeletonBlock className="h-3 w-3" />
          <SkeletonBlock className="h-2 w-17" />
        </div>
      </div>
    </div>

    <div className="flex-1 border border-secondary-accent rounded-lg p-3 flex flex-col gap-1">
      <SkeletonBlock className="h-2.5 w-11" />
      <SkeletonBlock className="h-3 w-2" />
    </div>

    <div className="flex-1 border border-secondary-accent rounded-lg p-3 flex flex-col gap-1">
      <SkeletonBlock className="h-2.5 w-13" />
      <SkeletonBlock className="h-3 w-2" />
    </div>
  </div>
);

export default CompanyMetricsSkeleton;
