import { FC } from "react";

import SkeletonCircle from "./SkeletonCircle";

interface Props {
  count?: number;
}

const SidePanelHeaderActionsSkeleton: FC<Props> = ({ count = 1 }) => (
  <div className="flex items-center gap-3" aria-hidden="true">
    {Array.from({ length: count }).map((_, i) => (
      <SkeletonCircle key={i} className="h-9 w-9" />
    ))}
  </div>
);

export default SidePanelHeaderActionsSkeleton;
