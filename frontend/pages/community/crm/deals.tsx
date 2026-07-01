import { NextPage } from "next";

import CrmLayout from "~community/common/components/templates/CrmLayout/CrmLayout";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { IconName } from "~community/common/types/IconTypes";
import SidePanelWrapper from "~community/crm/components/atoms/SidePanelWrapper/SidePanelWrapper";
import AddDealSidePanel from "~community/crm/components/organisms/AddDealSidePanel/AddDealSidePanel";
import DealsSection from "~community/crm/components/organisms/DealsSection/DealsSection";
import { useCrmStore } from "~community/crm/store/store";
import useCrmLimitGuard from "~enterprise/crm/hooks/useCrmLimitGuard";
import { CrmLimitResource } from "~enterprise/crm/types/CrmLimitTypes";

const Deals: NextPage = () => {
  const translateText = useTranslator("crmModule", "deals");
  const { guardCrmCreate, isCheckingCrmLimit } = useCrmLimitGuard();

  const { setIsCrmSidePanelOpen } = useCrmStore((store) => ({
    setIsCrmSidePanelOpen: store.setIsCrmSidePanelOpen
  }));

  return (
    <CrmLayout
      pageHead={translateText(["pageHead"])}
      title={translateText(["title"])}
      primaryButtonText={translateText(["addDealBtn"])}
      primaryBtnIconName={IconName.ADD_ICON}
      onPrimaryButtonClick={() =>
        guardCrmCreate(CrmLimitResource.DEALS, () =>
          setIsCrmSidePanelOpen(true)
        )
      }
      isPrimaryBtnLoading={isCheckingCrmLimit}
    >
      <>
        <SidePanelWrapper>
          <AddDealSidePanel />
        </SidePanelWrapper>

        <DealsSection />
      </>
    </CrmLayout>
  );
};

export default Deals;
