import { NextPage } from "next";
import { useEffect } from "react";

import ContentLayout from "~community/common/components/templates/ContentLayout/ContentLayout";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { IconName } from "~community/common/types/IconTypes";
import AddDealSidePanel from "~community/crm/components/organisms/AddDealSidePanel/AddDealSidePanel";
import { useCrmStore } from "~community/crm/store/store";

const Deals: NextPage = () => {
  const translateText = useTranslator("crmModule", "deals");

  const { setIsAddDealSidePanelOpen } = useCrmStore((state) => ({
    setIsAddDealSidePanelOpen: state.setIsAddDealSidePanelOpen
  }));

  useEffect(() => {
    setIsAddDealSidePanelOpen(false);
    return () => {
      setIsAddDealSidePanelOpen(false);
    };
  }, []);

  return (
    <ContentLayout
      pageHead={translateText(["pageHead"])}
      title={translateText(["title"])}
      primaryButtonText={translateText(["addDealBtn"])}
      primaryBtnIconName={IconName.ADD_ICON}
      onPrimaryButtonClick={() => setIsAddDealSidePanelOpen(true)}
    >
      <>
        <AddDealSidePanel />
      </>
    </ContentLayout>
  );
};

export default Deals;
