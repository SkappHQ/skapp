import { FC } from "react";

import SkeletonShape from "~community/crm/v2/components/atoms/SkeletonShape/SkeletonShape";

interface SidePanelHeaderSkeletonProps {
  isShowLastUpdate?: boolean;
}

const SidePanelHeaderSkeleton: FC<SidePanelHeaderSkeletonProps> = ({
  isShowLastUpdate = true
}) => (
  <div className="flex flex-col gap-2 pl-2" aria-hidden="true">
    <SkeletonShape className="h-4 w-24" />
    {isShowLastUpdate && <SkeletonShape className="h-2.5 w-32" />}
  </div>
);

export default SidePanelHeaderSkeleton;
