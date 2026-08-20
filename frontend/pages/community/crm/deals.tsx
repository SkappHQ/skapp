import { NextPage } from "next";

import ContentLayout from "~community/common/components/templates/ContentLayout/ContentLayout";
import { Modules } from "~community/common/enums/CommonEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { IconName } from "~community/common/types/IconTypes";
import SidePanelWrapper from "~community/crm/components/atoms/SidePanelWrapper/SidePanelWrapper";
import useCrmLimitGuard from "~enterprise/crm/hooks/useCrmLimitGuard";
import { CrmLimitResource } from "~enterprise/crm/types/CrmLimitTypes";

// --- v1 (legacy) deal surface — active until v2 go-live ---
import AddDealSidePanel from "~community/crm/components/organisms/AddDealSidePanel/AddDealSidePanel";
import DealSidePanel from "~community/crm/components/organisms/DealSidePanel/DealSidePanel";
import DealsSection from "~community/crm/components/organisms/DealsSection/DealsSection";
import TaskModalController from "~community/crm/components/organisms/TaskModalController/TaskModalController";
import { useCrmStore } from "~community/crm/store/store";
import { CrmSidePanelTypes } from "~community/crm/types/SidePanelTypes";

// --- v2 (normalized store) deal surface — GO-LIVE: uncomment this block, swap the
// active store/imports below to their v2 counterparts, and delete the v1 surface above ---
// import { useInitializeCrmData } from "~community/crm/v2/hooks/useInitializeCrmData";
// import AddDealSidePanelV2 from "~community/crm/v2/components/organisms/AddDealSidePanelV2/AddDealSidePanelV2";
// import DealSidePanelV2 from "~community/crm/v2/components/organisms/DealSidePanelV2/DealSidePanelV2";
// import DealsKanbanBoardSkeleton from "~community/crm/v2/components/organisms/DealsKanbanBoard/DealsKanbanBoardSkeleton";
// import DealsSectionV2 from "~community/crm/v2/components/organisms/DealsSectionV2/DealsSectionV2";
// import { useCrmStoreV2 } from "~community/crm/v2/store/store";
// import { CrmSidePanelTypes } from "~community/crm/v2/types/CrmTypes";

const Deals: NextPage = () => {
  const translateText = useTranslator("crmModule");
  const { guardCrmCreate, isCheckingCrmLimit } = useCrmLimitGuard();

  const { openCrmSidePanel, selectedDealId, isCrmSidePanelOpen } = useCrmStore(
    (store) => ({
      openCrmSidePanel: store.openCrmSidePanel,
      selectedDealId: store.selectedDealId,
      isCrmSidePanelOpen: store.isCrmSidePanelOpen
    })
  );

  // GO-LIVE: uncomment for the v2 board's initial data hydration.
  // const { isCrmInitialDataLoading } = useInitializeCrmData();

  const handleAddDeal = () => {
    guardCrmCreate(CrmLimitResource.DEALS, () =>
      openCrmSidePanel(CrmSidePanelTypes.ADD_DEAL_SIDE_PANEL)
    );
  };

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
      {/* --- v1 (legacy) deal surface — active until v2 go-live --- */}
      <>
        <SidePanelWrapper isOpen={isCrmSidePanelOpen}>
          {selectedDealId !== null && <DealSidePanel />}
          <AddDealSidePanel />
        </SidePanelWrapper>
        <TaskModalController />
        <DealsSection />
      </>

      {/* --- v2 (normalized store) deal surface — GO-LIVE: uncomment (and swap the
          store/imports above) to switch on, then remove the v1 surface ---
      <>
        <SidePanelWrapper isOpen={isCrmSidePanelOpen}>
          {selectedDealId !== null && <DealSidePanelV2 />}
          <AddDealSidePanelV2 />
        </SidePanelWrapper>
        {isCrmInitialDataLoading ? (
          <DealsKanbanBoardSkeleton laneCount={4} cardCount={5} />
        ) : (
          <DealsSectionV2 />
        )}
      </>
      */}
    </ContentLayout>
  );
};

export default Deals;
