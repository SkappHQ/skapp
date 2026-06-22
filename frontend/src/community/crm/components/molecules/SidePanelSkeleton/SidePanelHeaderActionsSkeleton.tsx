import { FC } from "react";

import SkeletonShape from "~community/crm/components/atoms/SkeletonShape/SkeletonShape";

interface Props {
  count?: number;
}

const SidePanelHeaderActionsSkeleton: FC<Props> = ({ count = 1 }) => (
  <div className="flex items-center gap-3" aria-hidden="true">
    {Array.from({ length: count }).map((_, i) => (
      <SkeletonShape key={i} circle className="h-9 w-9" />
    ))}
  </div>
);

export default SidePanelHeaderActionsSkeleton;
