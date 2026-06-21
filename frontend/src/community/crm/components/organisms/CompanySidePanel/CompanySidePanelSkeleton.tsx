import { FC } from "react";

import CompanyMetricsSkeleton from "~community/crm/components/molecules/SidePanelSkeleton/CompanyMetricsSkeleton";
import SidePanelInfoItemsSkeleton from "~community/crm/components/molecules/SidePanelSkeleton/SidePanelInfoItemsSkeleton";
import SidePanelTabsSkeleton from "~community/crm/components/molecules/SidePanelSkeleton/SidePanelTabsSkeleton";

const CompanySidePanelSkeleton: FC = () => (
  <div className="flex flex-col gap-4 w-full" aria-hidden="true">
    <SidePanelInfoItemsSkeleton itemCount={4} endIconItemIndex={0} />
    <CompanyMetricsSkeleton />
    <SidePanelTabsSkeleton tabCount={3} />
  </div>
);

export default CompanySidePanelSkeleton;
