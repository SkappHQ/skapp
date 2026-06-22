import { FC } from "react";

import ContactMetricsSkeleton from "~community/crm/components/molecules/SidePanelSkeleton/ContactMetricsSkeleton";
import SidePanelBodySkeleton from "~community/crm/components/molecules/SidePanelSkeleton/SidePanelBodySkeleton";

const ContactSidePanelSkeleton: FC = () => (
  <SidePanelBodySkeleton
    infoItemsCount={3}
    endIconItemIndex={2}
    tabCount={2}
    metricsSlot={<ContactMetricsSkeleton />}
  />
);

export default ContactSidePanelSkeleton;
