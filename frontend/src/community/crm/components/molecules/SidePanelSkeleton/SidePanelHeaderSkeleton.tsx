import { FC } from "react";

import SkeletonShape from "~community/crm/components/atoms/SkeletonShape/SkeletonShape";

interface Props {
  isShowLastUpdate?: boolean;
}

const SidePanelHeaderSkeleton: FC<Props> = ({ isShowLastUpdate = true }) => (
  <div className="flex flex-col gap-2 pl-2" aria-hidden="true">
    <SkeletonShape className="h-4 w-24" />
    {isShowLastUpdate && <SkeletonShape className="h-2.5 w-32" />}
  </div>
);

export default SidePanelHeaderSkeleton;
