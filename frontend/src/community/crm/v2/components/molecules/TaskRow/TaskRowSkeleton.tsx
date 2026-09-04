import { FC } from "react";

import SkeletonShape from "~community/crm/v2/components/atoms/SkeletonShape/SkeletonShape";

const TaskRowSkeleton: FC = () => (
  <div className="flex items-center gap-4 p-3 min-h-[63px] bg-white">
    <SkeletonShape circle className="h-5 w-5 shrink-0" />
    <SkeletonShape circle className="h-5 w-5 shrink-0" />
    <div className="flex-1 min-w-0 flex flex-col gap-2">
      <SkeletonShape className="h-3 w-1/3" />
      <SkeletonShape className="h-2 w-1/4" />
    </div>
    <SkeletonShape circle className="h-6 w-6 shrink-0" />
    <SkeletonShape circle className="h-6 w-6 shrink-0" />
  </div>
);

export default TaskRowSkeleton;
