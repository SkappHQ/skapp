import { NextPage } from "next";

import ContentLayout from "~community/common/components/templates/ContentLayout/ContentLayout";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { IconName } from "~community/common/types/IconTypes";
import AddDealSidePanel from "~community/crm/components/organisms/AddDealSidePanel/AddDealSidePanel";
import DealDetailSidePanel from "~community/crm/components/organisms/DealDetailSidePanel/DealDetailSidePanel";
import DealsSection from "~community/crm/components/organisms/DealsSection/DealsSection";
import { useCrmStore } from "~community/crm/store/store";

const Deals: NextPage = () => {
  const translateText = useTranslator("crmModule", "deals");

  const { setIsCrmSidePanelOpen, isCrmSidePanelOpen, selectedDealId, setSelectedDealId } =
    useCrmStore((store) => ({
      setIsCrmSidePanelOpen: store.setIsCrmSidePanelOpen,
      isCrmSidePanelOpen: store.isCrmSidePanelOpen,
      selectedDealId: store.selectedDealId,
      setSelectedDealId: store.setSelectedDealId
    }));

  const handleCloseDealDetail = () => {
    setSelectedDealId(null);
    setIsCrmSidePanelOpen(false);
  };

  const handleAddDealClick = () => {
    setSelectedDealId(null); 
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
        {selectedDealId ? (
          <DealDetailSidePanel
            isOpen={isCrmSidePanelOpen}
            onClose={handleCloseDealDetail}
          />
        ) : (
          <AddDealSidePanel />
        )}

        <DealsSection />
      </>
    </ContentLayout>
  );
};

export default Deals;
