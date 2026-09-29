import { FC } from "react";

import SkeletonShape from "~community/crm/components/atoms/SkeletonShape/SkeletonShape";
import SidePanelHeaderActionsSkeleton from "~community/crm/components/molecules/SidePanelSkeleton/SidePanelHeaderActionsSkeleton";

const DealDetailPageSkeleton: FC = () => (
  <div className="flex items-start justify-between gap-4">
    <div className="flex items-center gap-2" aria-hidden="true">
      <SkeletonShape circle className="h-6 w-6 shrink-0" />
      <SkeletonShape className="h-2.5 w-10" />
    </div>

    <SidePanelHeaderActionsSkeleton count={2} />
  </div>
);

export default DealDetailPageSkeleton;
