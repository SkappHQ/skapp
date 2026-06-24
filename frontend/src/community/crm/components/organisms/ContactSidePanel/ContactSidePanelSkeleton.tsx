import { FC } from "react";

import SkeletonShape from "~community/crm/components/atoms/SkeletonShape/SkeletonShape";
import SidePanelTabsSkeleton from "~community/crm/components/molecules/SidePanelSkeleton/SidePanelTabsSkeleton";

const ContactSidePanelSkeleton: FC = () => (
  <div className="flex flex-col gap-4 w-full" aria-hidden="true">
    <div className="flex items-center justify-between max-w-157.25 w-full">
      <div className="flex items-center gap-3">
        <SkeletonShape circle className="h-5 w-5 shrink-0" />
        <SkeletonShape className="h-2.5 w-20" />
      </div>
      <div className="flex items-center gap-3">
        <SkeletonShape circle className="h-5 w-5 shrink-0" />
        <SkeletonShape className="h-2.5 w-20" />
      </div>
      <div className="flex items-center gap-3">
        <SkeletonShape circle className="h-5 w-5 shrink-0" />
        <SkeletonShape className="h-2.5 w-20" />
        <SkeletonShape className="h-4 w-4 shrink-0" />
      </div>
    </div>

    <div className="flex gap-4 w-full">
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

    <SidePanelTabsSkeleton tabCount={2} />
  </div>
);

export default ContactSidePanelSkeleton;
