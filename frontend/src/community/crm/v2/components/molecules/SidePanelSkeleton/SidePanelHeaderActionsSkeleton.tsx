import { FC } from "react";

import SkeletonShape from "~community/crm/v2/components/atoms/SkeletonShape/SkeletonShape";

interface SidePanelHeaderActionsSkeletonProps {
  count?: number;
}

const SidePanelHeaderActionsSkeleton: FC<
  SidePanelHeaderActionsSkeletonProps
> = ({ count = 1 }) => (
  <div className="flex items-center gap-3" aria-hidden="true">
    {Array.from({ length: count }).map((_, i) => (
      <SkeletonShape key={i} circle className="h-9 w-9" />
    ))}
  </div>
);

export default SidePanelHeaderActionsSkeleton;
