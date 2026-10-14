import { FC } from "react";

import SkeletonShape from "~community/crm/components/atoms/SkeletonShape/SkeletonShape";

const DealAccordionItemSkeleton: FC = () => (
  <div
    className="border-secondary-accent flex w-full items-center justify-between rounded-lg border bg-white px-4 py-3"
    aria-hidden="true"
  >
    <div className="flex flex-1 flex-col gap-2 min-w-0">
      <SkeletonShape className="h-2.5 w-32" />
      <div className="flex items-center gap-2">
        <SkeletonShape className="h-2 w-20" />
        <SkeletonShape circle className="h-1 w-1" />
        <SkeletonShape className="h-2 w-12" />
      </div>
    </div>
    <div className="flex items-center gap-3 shrink-0">
      <SkeletonShape className="h-5 w-16 rounded-full" />
      <SkeletonShape className="h-3 w-3" />
    </div>
  </div>
);

export default DealAccordionItemSkeleton;
