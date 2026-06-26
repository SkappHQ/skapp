import { NextPage } from "next";

import ContentLayout from "~community/common/components/templates/ContentLayout/ContentLayout";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { IconName } from "~community/common/types/IconTypes";
import SidePanelWrapper from "~community/crm/components/atoms/SidePanelWrapper/SidePanelWrapper";
import AddDealSidePanel from "~community/crm/components/organisms/AddDealSidePanel/AddDealSidePanel";
import DealsSection from "~community/crm/components/organisms/DealsSection/DealsSection";
import { useCrmStore } from "~community/crm/store/store";
import CrmLimitModalController from "~enterprise/crm/components/organisms/CrmLimitModalController/CrmLimitModalController";
import useCrmLimitGuard from "~enterprise/crm/hooks/useCrmLimitGuard";

const Deals: NextPage = () => {
  const translateText = useTranslator("crmModule", "deals");
  const { guardCrmCreate } = useCrmLimitGuard();

  const { setIsCrmSidePanelOpen } = useCrmStore((store) => ({
    setIsCrmSidePanelOpen: store.setIsCrmSidePanelOpen
  }));

  return (
    <ContentLayout
      pageHead={translateText(["pageHead"])}
      title={translateText(["title"])}
      primaryButtonText={translateText(["addDealBtn"])}
      primaryBtnIconName={IconName.ADD_ICON}
      onPrimaryButtonClick={() =>
        guardCrmCreate("deals", () => setIsCrmSidePanelOpen(true))
      }
    >
      <>
        <SidePanelWrapper>
          <AddDealSidePanel />
        </SidePanelWrapper>

        <CrmLimitModalController />
        <DealsSection />
      </>
    </ContentLayout>
  );
};

export default Deals;
