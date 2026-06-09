import { NextPage } from "next";
import { useState } from "react";

import HandshakeIcon from "~community/common/assets/Icons/HandshakeIcon";
import ContentLayout from "~community/common/components/templates/ContentLayout/ContentLayout";
import { ZIndexEnums } from "~community/common/enums/CommonEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { IconName } from "~community/common/types/IconTypes";
import DealDetailSidePanel from "~community/crm/components/organisms/DealDetailSidePanel/DealDetailSidePanel";
import DealModalController from "~community/crm/components/organisms/DealModalController/DealModalController";
import DealsSection from "~community/crm/components/organisms/DealsSection/DealsSection";
import { CrmDealListItem } from "~community/crm/types/CommonTypes";

const Deals: NextPage = () => {
  const translateText = useTranslator("crmModule", "deals");
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState<CrmDealListItem | null>(
    null
  );

  const handleDealClick = (deal: CrmDealListItem) => {
    setSelectedDeal(deal);
    setIsSidePanelOpen(true);
  };

  return (
    <ContentLayout
      pageHead={translateText(["pageHead"])}
      title={translateText(["title"])}
      primaryButtonText={translateText(["addDealBtn"])}
      primaryBtnIconName={IconName.ADD_ICON}
      containerStyles={{ zIndex: ZIndexEnums.CRM_CONTENT_LAYOUT }}
    >
      <>
        <DealsSection onDealClick={handleDealClick} />
        <DealDetailSidePanel
          isOpen={isSidePanelOpen}
          onClose={() => setIsSidePanelOpen(false)}
          deal={selectedDeal}
          dealIcon={
            <HandshakeIcon width="14" height="14" fill="var(--color-white)" />
          }
        />
        <DealModalController />
      </>
    </ContentLayout>
  );
};

export default Deals;
