import { FC } from "react";

import CompanyMetricsSkeleton from "~community/crm/components/molecules/SidePanelSkeleton/CompanyMetricsSkeleton";
import SidePanelBodySkeleton from "~community/crm/components/molecules/SidePanelSkeleton/SidePanelBodySkeleton";

const CompanySidePanelSkeleton: FC = () => (
  <SidePanelBodySkeleton
    infoItemsCount={4}
    endIconItemIndex={0}
    tabCount={3}
    metricsSlot={<CompanyMetricsSkeleton />}
  />
);

export default CompanySidePanelSkeleton;
