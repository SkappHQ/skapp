import { NextPage } from "next";
import { useEffect } from "react";



import ContentLayout from "~community/common/components/templates/ContentLayout/ContentLayout";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { IconName } from "~community/common/types/IconTypes";
import DealTable from "~community/crm/components/organisms/DealTable/DealTable";
import { useAppStore } from "~store/store";

const Deals: NextPage = () => {
  const translateText = useTranslator("crmModule", "deals");

  const { openCreatePanel, closeSidePanel } = useAppStore();

  useEffect(() => {
    // Close any leftover panel state when entering this page (e.g. a previous
    // route may have opened a different panel via the global AppSidePanel).
    closeSidePanel();
    return () => {
      closeSidePanel();
    };
  }, [closeSidePanel]);

  return (
    <ContentLayout
      pageHead={translateText(["pageHead"])}
      title={translateText(["title"])}
      primaryButtonText={translateText(["addDealBtn"])}
      primaryBtnIconName={IconName.ADD_ICON}
      onPrimaryButtonClick={() => openCreatePanel()}
    >
      <DealTable />
    </ContentLayout>
  );
};

export default Deals;
