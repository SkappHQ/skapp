import { FC } from "react";

import ContactMetricsSkeleton from "~community/crm/components/molecules/SidePanelSkeleton/ContactMetricsSkeleton";
import SidePanelInfoItemsSkeleton from "~community/crm/components/molecules/SidePanelSkeleton/SidePanelInfoItemsSkeleton";
import SidePanelTabsSkeleton from "~community/crm/components/molecules/SidePanelSkeleton/SidePanelTabsSkeleton";

const ContactSidePanelSkeleton: FC = () => (
  <div className="flex flex-col gap-4 w-full" aria-hidden="true">
    <SidePanelInfoItemsSkeleton itemCount={3} endIconItemIndex={2} />
    <ContactMetricsSkeleton />
    <SidePanelTabsSkeleton tabCount={2} />
  </div>
);

export default ContactSidePanelSkeleton;
