import { FC } from "react";

import SkeletonShape from "~community/crm/components/atoms/SkeletonShape/SkeletonShape";

interface Props {
  firstRow?: boolean;
}

const TaskRowSkeleton: FC<Props> = ({ firstRow = false }) => (
  <div className="flex items-center justify-between px-3 py-3">
    <div className="flex items-center gap-4">
      <SkeletonShape circle={firstRow} className="h-6 w-6 shrink-0" />
      <div className="flex items-center gap-3">
        <SkeletonShape circle className="h-5 w-5 shrink-0" />
        <SkeletonShape className="h-2.5 w-32" />
      </div>
    </div>
    <div className="flex items-center gap-6">
      <SkeletonShape circle className="h-8 w-8" />
      <SkeletonShape className="h-6 w-6" />
    </div>
  </div>
);

export default TaskRowSkeleton;
