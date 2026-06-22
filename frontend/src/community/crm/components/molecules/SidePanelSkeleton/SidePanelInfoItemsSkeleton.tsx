import { FC } from "react";

import SkeletonShape from "~community/crm/components/atoms/SkeletonShape/SkeletonShape";

interface Props {
  itemCount: number;
  endIconItemIndex?: number;
}

const SidePanelInfoItemsSkeleton: FC<Props> = ({
  itemCount,
  endIconItemIndex
}) => (
  <div
    className="flex items-center justify-between max-w-157.25 w-full"
    aria-hidden="true"
  >
    {Array.from({ length: itemCount }).map((_, i) => (
      <div key={i} className="flex items-center gap-3">
        <SkeletonShape circle className="h-5 w-5 shrink-0" />
        <SkeletonShape className="h-2.5 w-20" />
        {endIconItemIndex === i && (
          <SkeletonShape className="h-4 w-4 shrink-0" />
        )}
      </div>
    ))}
  </div>
);

export default SidePanelInfoItemsSkeleton;
