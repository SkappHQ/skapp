import { NextPage } from "next";

import ContentLayout from "~community/common/components/templates/ContentLayout/ContentLayout";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { IconName } from "~community/common/types/IconTypes";
import DealsSidePanelController from "~community/crm/components/organisms/DealsSidePanelController/DealsSidePanelController";
import DealsSection from "~community/crm/components/organisms/DealsSection/DealsSection";
import { DealSidePanelTypes } from "~community/crm/enums/common";
import { useCrmStore } from "~community/crm/store/store";

const Deals: NextPage = () => {
  const translateText = useTranslator("crmModule", "deals");

  const { setIsCrmSidePanelOpen, setSelectedDealId, setActiveDealSidePanel } = useCrmStore((store) => ({
    setIsCrmSidePanelOpen: store.setIsCrmSidePanelOpen,
    setSelectedDealId: store.setSelectedDealId,
    setActiveDealSidePanel: store.setActiveDealSidePanel
  }));

  const handleAddDealClick = () => {
    setSelectedDealId(null);
    setActiveDealSidePanel(DealSidePanelTypes.ADD_DEAL);
    setIsCrmSidePanelOpen(true);
  };

  return (
    <ContentLayout
      pageHead={translateText(["pageHead"])}
      title={translateText(["title"])}
      primaryButtonText={translateText(["addDealBtn"])}
      primaryBtnIconName={IconName.ADD_ICON}
      onPrimaryButtonClick={handleAddDealClick}
    >
      <>
        <DealsSidePanelController />
        <DealsSection />
      </>
    </ContentLayout>
  );
};

export default Deals;
