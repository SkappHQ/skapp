import { NextPage } from "next";

import ContentLayout from "~community/common/components/templates/ContentLayout/ContentLayout";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { ZIndexEnums } from "~community/common/enums/CommonEnums";
import { IconName } from "~community/common/types/IconTypes";
import AddDealSidePanel from "~community/crm/components/organisms/AddDealSidePanel/AddDealSidePanel";
import DealsSection from "~community/crm/components/organisms/DealsSection/DealsSection";
import { useCrmStore } from "~community/crm/store/store";

const Deals: NextPage = () => {
  const translateText = useTranslator("crmModule", "deals");

  const { setIsCrmSidePanelOpen } = useCrmStore((store) => ({
    setIsCrmSidePanelOpen: store.setIsCrmSidePanelOpen
  }));

  return (
    <ContentLayout
      pageHead={translateText(["pageHead"])}
      title={translateText(["title"])}
      primaryButtonText={translateText(["addDealBtn"])}
      primaryBtnIconName={IconName.ADD_ICON}
      containerStyles={{ zIndex: ZIndexEnums.CRM_CONTENT_LAYOUT }}
      onPrimaryButtonClick={() => setIsCrmSidePanelOpen(true)}
    >
      <>
        <AddDealSidePanel />
        <DealsSection />
      </>
    </ContentLayout>
  );
};

export default Deals;
