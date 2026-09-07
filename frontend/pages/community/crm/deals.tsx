import { NextPage } from "next";
import { useShallow } from "zustand/react/shallow";

import ContentLayout from "~community/common/components/templates/ContentLayout/ContentLayout";
import { Modules } from "~community/common/enums/CommonEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { IconName } from "~community/common/types/IconTypes";
import SidePanelWrapper from "~community/crm/components/atoms/SidePanelWrapper/SidePanelWrapper";
import AddDealSidePanel from "~community/crm/components/organisms/AddDealSidePanel/AddDealSidePanel";
import DealSidePanel from "~community/crm/components/organisms/DealSidePanel/DealSidePanel";
import DealsSection from "~community/crm/components/organisms/DealsSection/DealsSection";
import TaskModalController from "~community/crm/components/organisms/TaskModalController/TaskModalController";
import { useCrmStore } from "~community/crm/store/store";
import { CrmSidePanelTypes } from "~community/crm/types/SidePanelTypes";
import AddDealSidePanelV2 from "~community/crm/v2/components/organisms/AddDealSidePanelV2/AddDealSidePanelV2";
import DealSidePanelV2 from "~community/crm/v2/components/organisms/DealSidePanelV2/DealSidePanelV2";
import DealsKanbanBoardSkeletonV2 from "~community/crm/v2/components/organisms/DealsKanbanBoardV2/DealsKanbanBoardSkeletonV2";
import DealsSectionV2 from "~community/crm/v2/components/organisms/DealsSectionV2/DealsSectionV2";
import { useInitializeCrmData } from "~community/crm/v2/hooks/useInitializeCrmData";
import { useCrmStoreV2 } from "~community/crm/v2/store/store";
import { CrmSidePanelTypes as CrmSidePanelTypesV2 } from "~community/crm/v2/types/CrmTypes";
import useCrmLimitGuard from "~enterprise/crm/hooks/useCrmLimitGuard";
import { CrmLimitResource } from "~enterprise/crm/types/CrmLimitTypes";

// Flip to true to serve the CRM Deals page from the normalized v2 store surface.
const isCrmDealsV2 = false;

const DealsV1 = () => {
  const translateText = useTranslator("crmModule");
  const { guardCrmCreate, isCheckingCrmLimit } = useCrmLimitGuard();

  const { openCrmSidePanel, selectedDealId, isCrmSidePanelOpen } = useCrmStore(
    useShallow((store) => ({
      openCrmSidePanel: store.openCrmSidePanel,
      selectedDealId: store.selectedDealId,
      isCrmSidePanelOpen: store.isCrmSidePanelOpen
    }))
  );

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

const DealsV2 = () => {
  const translateText = useTranslator("crmModule");
  const { guardCrmCreate, isCheckingCrmLimit } = useCrmLimitGuard();

  const openCrmSidePanel = useCrmStoreV2((store) => store.openCrmSidePanel);
  const selectedDealId = useCrmStoreV2((store) => store.selectedDealId);
  const isCrmSidePanelOpen = useCrmStoreV2((store) => store.isCrmSidePanelOpen);

  const { isCrmInitialDataLoading } = useInitializeCrmData();

  const handleAddDeal = () => {
    guardCrmCreate(CrmLimitResource.DEALS, () =>
      openCrmSidePanel(CrmSidePanelTypesV2.ADD_DEAL_SIDE_PANEL)
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
      <>
        <SidePanelWrapper isOpen={isCrmSidePanelOpen}>
          {selectedDealId !== null && <DealSidePanelV2 />}
          <AddDealSidePanelV2 />
        </SidePanelWrapper>
        {isCrmInitialDataLoading ? (
          <DealsKanbanBoardSkeletonV2 laneCount={4} cardCount={5} />
        ) : (
          <DealsSectionV2 />
        )}
      </>
    </ContentLayout>
  );
};

const Deals: NextPage = () => (isCrmDealsV2 ? <DealsV2 /> : <DealsV1 />);

export default Deals;
