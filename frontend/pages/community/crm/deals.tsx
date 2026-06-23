import { NextPage } from "next";

import ContentLayout from "~community/common/components/templates/ContentLayout/ContentLayout";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { IconName } from "~community/common/types/IconTypes";
import SidePanelWrapper from "~community/crm/components/atoms/SidePanelWrapper/SidePanelWrapper";
import AddDealSidePanel from "~community/crm/components/organisms/AddDealSidePanel/AddDealSidePanel";
import DealDetailSidePanel from "~community/crm/components/organisms/DealDetailSidePanel/DealDetailSidePanel";
import DealsSection from "~community/crm/components/organisms/DealsSection/DealsSection";
import { useCrmStore } from "~community/crm/store/store";

const Deals: NextPage = () => {
  const translateText = useTranslator("crmModule", "deals");

  const { setIsCrmSidePanelOpen, isCrmSidePanelOpen, selectedDealId } =
    useCrmStore((store) => ({
      setIsCrmSidePanelOpen: store.setIsCrmSidePanelOpen,
      isCrmSidePanelOpen: store.isCrmSidePanelOpen,
      selectedDealId: store.selectedDealId
    }));

  return (
    <ContentLayout
      pageHead={translateText(["pageHead"])}
      title={translateText(["title"])}
      primaryButtonText={translateText(["addDealBtn"])}
      primaryBtnIconName={IconName.ADD_ICON}
      onPrimaryButtonClick={() => setIsCrmSidePanelOpen(true)}
    >
      <>
        <SidePanelWrapper>
          {selectedDealId ? (
            <DealDetailSidePanel isOpen={isCrmSidePanelOpen} onClose={() => {}} />
          ) : (
            <AddDealSidePanel />
          )}
        </SidePanelWrapper>

        <DealsSection />
      </>
    </ContentLayout>
  );
};

export default Deals;
