import { NextPage } from "next";
import { useEffect } from "react";

import ContentLayout from "~community/common/components/templates/ContentLayout/ContentLayout";
import { Modules } from "~community/common/enums/CommonEnums";
import { ToastType } from "~community/common/enums/ComponentEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import { IconName } from "~community/common/types/IconTypes";
import SidePanelWrapper from "~community/crm/components/atoms/SidePanelWrapper/SidePanelWrapper";
import AddDealSidePanel from "~community/crm/components/organisms/AddDealSidePanel/AddDealSidePanel";
import DealSidePanel from "~community/crm/components/organisms/DealSidePanel/DealSidePanel";
import DealsSection from "~community/crm/components/organisms/DealsSection/DealsSection";
import TaskModalController from "~community/crm/components/organisms/TaskModalController/TaskModalController";
import { useCrmStore } from "~community/crm/store/store";
import { CrmSidePanelTypes } from "~community/crm/types/SidePanelTypes";
import { useCrmSession } from "~community/crm/v2/hooks/useCrmSession";
import useCrmLimitGuard from "~enterprise/crm/hooks/useCrmLimitGuard";
import { CrmLimitResource } from "~enterprise/crm/types/CrmLimitTypes";

const Deals: NextPage = () => {
  const translateText = useTranslator("crmModule");
  const { guardCrmCreate, isCheckingCrmLimit } = useCrmLimitGuard();

  const { setToastMessage } = useToast();
  const { isError: isCrmSessionError } = useCrmSession();

  const { openCrmSidePanel, selectedDealId, isCrmSidePanelOpen } = useCrmStore(
    (store) => ({
      openCrmSidePanel: store.openCrmSidePanel,
      selectedDealId: store.selectedDealId,
      isCrmSidePanelOpen: store.isCrmSidePanelOpen
    })
  );

  const handleAddDeal = () => {
    guardCrmCreate(CrmLimitResource.DEALS, () =>
      openCrmSidePanel(CrmSidePanelTypes.ADD_DEAL_SIDE_PANEL)
    );
  };

  const crmSessionErrorTitle = translateText([
    "common",
    "initData",
    "errorTitle"
  ]);
  const crmSessionErrorDescription = translateText([
    "common",
    "initData",
    "errorDescription"
  ]);

  useEffect(() => {
    if (!isCrmSessionError) return;

    setToastMessage({
      open: true,
      toastType: ToastType.ERROR,
      title: crmSessionErrorTitle,
      description: crmSessionErrorDescription
    });
  }, [
    isCrmSessionError,
    crmSessionErrorTitle,
    crmSessionErrorDescription,
    setToastMessage
  ]);

  return (
    <ContentLayout
      breadcrumbs={[
        { label: translateText(["breadcrumbs", "crm"]) },
        { label: translateText(["deals", "title"]) }
      ]}
      pageHead={translateText(["deals", "pageHead"])}
      title={translateText(["deals", "title"])}
      primaryButtonText={translateText(["deals", "addDealBtn"])}
      primaryBtnIconName={IconName.ADD_ICON}
      isPrimaryBtnLoading={isCheckingCrmLimit}
      module={Modules.CRM}
      onPrimaryButtonClick={handleAddDeal}
    >
      <>
        <SidePanelWrapper isOpen={isCrmSidePanelOpen}>
          {selectedDealId !== null && <DealSidePanel />}
          <AddDealSidePanel />
        </SidePanelWrapper>
        <TaskModalController />
        <DealsSection />
      </>
    </ContentLayout>
  );
};

export default Deals;
