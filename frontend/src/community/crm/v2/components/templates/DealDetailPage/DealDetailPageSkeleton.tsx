import { FC } from "react";

import SkeletonShape from "~community/crm/v2/components/atoms/SkeletonShape/SkeletonShape";
import DealSidePanelSkeleton from "~community/crm/v2/components/organisms/DealSidePanelV2/DealSidePanelSkeleton";

const DealDetailPageSkeleton: FC = () => (
  <div className="flex flex-col gap-4">
    <div className="flex items-start justify-between gap-4" aria-hidden="true">
      <div className="flex items-center gap-2">
        <SkeletonShape circle className="h-6 w-6 shrink-0" />
        <SkeletonShape className="h-2.5 w-10" />
      </div>
      <SkeletonShape className="h-9 w-9" />
    </div>

    <DealSidePanelSkeleton />
  </div>
);

export default DealDetailPageSkeleton;
