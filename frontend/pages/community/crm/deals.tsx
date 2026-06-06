import { NextPage } from "next";

import ContentLayout from "~community/common/components/templates/ContentLayout/ContentLayout";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { IconName } from "~community/common/types/IconTypes";
import AddDealSidePanel from "~community/crm/components/organisms/AddDealSidePanel/AddDealSidePanel";
import DealsSection from "~community/crm/components/organisms/DealsSection/DealsSection";
import { useCrmStore } from "~community/crm/store/store";

const Deals: NextPage = () => {
  const translateText = useTranslator("crmModule", "deals");

  const { openSidePanel } = useCrmStore((store) => ({
    openSidePanel: store.openSidePanel
  }));

  return (
    <ContentLayout
      pageHead={translateText(["pageHead"])}
      title={translateText(["title"])}
      primaryButtonText={translateText(["addDealBtn"])}
      primaryBtnIconName={IconName.ADD_ICON}
      onPrimaryButtonClick={openSidePanel}
    >
      <>
        <AddDealSidePanel />
        <DealsSection />
      </>
    </ContentLayout>
  );
};

export default Deals;
