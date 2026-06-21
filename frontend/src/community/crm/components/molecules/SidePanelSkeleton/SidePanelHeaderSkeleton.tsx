import { FC } from "react";

import SkeletonBlock from "./SkeletonBlock";

interface Props {
  isShowLastUpdate?: boolean;
}

const SidePanelHeaderSkeleton: FC<Props> = ({ isShowLastUpdate = true }) => (
  <div className="flex flex-col gap-2 pl-2" aria-hidden="true">
    <SkeletonBlock className="h-4 w-24" />
    {isShowLastUpdate && <SkeletonBlock className="h-2.5 w-32" />}
  </div>
);

export default SidePanelHeaderSkeleton;
