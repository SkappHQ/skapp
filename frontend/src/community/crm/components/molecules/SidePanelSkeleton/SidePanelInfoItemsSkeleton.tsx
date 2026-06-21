import { FC } from "react";

import SkeletonBlock from "./SkeletonBlock";
import SkeletonCircle from "./SkeletonCircle";

interface Props {
  itemCount: number;
  endIconItemIndex?: number;
}

const SidePanelInfoItemsSkeleton: FC<Props> = ({
  itemCount,
  endIconItemIndex
}) => (
  <div className="flex items-center justify-between max-w-[629px] w-full">
    {Array.from({ length: itemCount }).map((_, i) => (
      <div key={i} className="flex items-center gap-3">
        <SkeletonCircle className="h-5 w-5 shrink-0" />
        <SkeletonBlock className="h-2.5 w-20" />
        {endIconItemIndex === i && (
          <SkeletonBlock className="h-4 w-4 shrink-0" />
        )}
      </div>
    ))}
  </div>
);

export default SidePanelInfoItemsSkeleton;
