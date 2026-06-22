import { FC } from "react";

import SkeletonShape from "~community/crm/components/atoms/SkeletonShape/SkeletonShape";

const ContactMetricsSkeleton: FC = () => (
  <div className="flex gap-4 w-full" aria-hidden="true">
    <div className="flex-1 border border-secondary-accent rounded-lg p-3 flex flex-col gap-1">
      <SkeletonShape className="h-2.5 w-14" />
      <SkeletonShape className="h-3 w-10" />
    </div>

    <div className="flex-1 border border-secondary-accent rounded-lg p-3 flex flex-col gap-1">
      <SkeletonShape className="h-2.5 w-20" />
      <SkeletonShape className="h-3 w-10" />
    </div>

    <div className="flex-1 border border-secondary-accent rounded-lg p-3 flex flex-col gap-1">
      <SkeletonShape className="h-2.5 w-18.5" />
      <SkeletonShape className="h-3 w-2" />
    </div>

    <div className="flex-1 border border-secondary-accent rounded-lg p-3 flex flex-col gap-1">
      <SkeletonShape className="h-2.5 w-11" />
      <div className="flex items-center gap-3">
        <SkeletonShape className="h-3 w-3" />
        <SkeletonShape circle className="h-4 w-14.75" />
      </div>
    </div>
  </div>
);

export default ContactMetricsSkeleton;
