import { NextPage } from "next";
import { useEffect } from "react";

import ContentLayout from "~community/common/components/templates/ContentLayout/ContentLayout";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { IconName } from "~community/common/types/IconTypes";
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
      <></>
    </ContentLayout>
  );
};

export default Deals;
