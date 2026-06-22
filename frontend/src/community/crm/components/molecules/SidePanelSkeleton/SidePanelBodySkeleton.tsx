import { FC, ReactNode } from "react";

import SidePanelInfoItemsSkeleton from "./SidePanelInfoItemsSkeleton";
import SidePanelTabsSkeleton from "./SidePanelTabsSkeleton";

interface Props {
  infoItemsCount: number;
  endIconItemIndex?: number;
  tabCount: number;
  metricsSlot?: ReactNode;
}

const SidePanelBodySkeleton: FC<Props> = ({
  infoItemsCount,
  endIconItemIndex,
  tabCount,
  metricsSlot
}) => (
  <div className="flex flex-col gap-4 w-full" aria-hidden="true">
    <SidePanelInfoItemsSkeleton
      itemCount={infoItemsCount}
      endIconItemIndex={endIconItemIndex}
    />
    {metricsSlot}
    <SidePanelTabsSkeleton tabCount={tabCount} />
  </div>
);

export default SidePanelBodySkeleton;
