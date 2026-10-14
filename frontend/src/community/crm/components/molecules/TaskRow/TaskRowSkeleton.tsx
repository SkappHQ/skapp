import { FC } from "react";

import SkeletonShape from "~community/crm/components/atoms/SkeletonShape/SkeletonShape";

const TaskRowSkeleton: FC = () => (
  <div className="flex min-h-[63px] items-center gap-4 bg-white p-3">
    <SkeletonShape circle className="h-5 w-5 shrink-0" />
    <SkeletonShape circle className="h-5 w-5 shrink-0" />
    <div className="flex min-w-0 flex-1 flex-col gap-2">
      <SkeletonShape className="h-3 w-1/3" />
      <SkeletonShape className="h-2 w-1/4" />
    </div>
    <SkeletonShape circle className="h-6 w-6 shrink-0" />
    <SkeletonShape circle className="h-6 w-6 shrink-0" />
  </div>
);

export default TaskRowSkeleton;
