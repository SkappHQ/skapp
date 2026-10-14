import { FC } from "react";

import SkeletonShape from "~community/crm/components/atoms/SkeletonShape/SkeletonShape";
import SidePanelTabsSkeleton from "~community/crm/components/molecules/SidePanelSkeleton/SidePanelTabsSkeleton";

const ContactSidePanelSkeleton: FC = () => (
  <div className="flex w-full flex-col gap-4" aria-hidden="true">
    <div className="flex w-full max-w-157.25 items-center justify-between">
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

    <div className="flex w-full gap-4">
      {[0, 1, 2, 3].map((card) => (
        <div
          key={card}
          className="flex flex-1 flex-col gap-1 rounded-lg border border-secondary-accent p-3"
        >
          <SkeletonShape className="h-2.5 w-14" />
          <SkeletonShape className="h-3 w-10" />
        </div>
      ))}
    </div>

    <SidePanelTabsSkeleton tabCount={2} />
  </div>
);

export default ContactSidePanelSkeleton;
