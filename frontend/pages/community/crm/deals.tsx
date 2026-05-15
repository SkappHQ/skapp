import { NextPage } from "next";
import { useEffect } from "react";

import ContentLayout from "~community/common/components/templates/ContentLayout/ContentLayout";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { IconName } from "~community/common/types/IconTypes";
import AddDealSidePanel from "~community/crm/components/organisms/AddDealSidePanel/AddDealSidePanel";
import DealTable from "~community/crm/components/organisms/DealTable/DealTable";
import { useAppStore } from "../../../src/store/store";

const Deals: NextPage = () => {
  const translateText = useTranslator("crmModule", "deals");

  const { openCreatePanel, closeSidePanel } = useAppStore((state) => ({
    openCreatePanel: state.openCreatePanel,
    closeSidePanel: state.closeSidePanel
  }));

  useEffect(() => {
    closeSidePanel();
    return () => {
      closeSidePanel();
    };
  }, []);

  return (
    <ContentLayout
      pageHead={translateText(["pageHead"])}
      title={translateText(["title"])}
      primaryButtonText={translateText(["addDealBtn"])}
      primaryBtnIconName={IconName.ADD_ICON}
      onPrimaryButtonClick={() => openCreatePanel()}
    >
      <>
        <DealTable />
        <AddDealSidePanel />
      </>
    </ContentLayout>
  );
};

export default Deals;
