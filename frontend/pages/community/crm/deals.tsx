import { NextPage } from "next";

import ContentLayout from "~community/common/components/templates/ContentLayout/ContentLayout";
import { Modules } from "~community/common/enums/CommonEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { IconName } from "~community/common/types/IconTypes";
import AddDealSidePanelV2 from "~community/crm/v2/components/organisms/AddDealSidePanelV2/AddDealSidePanelV2";
import DealSidePanelV2 from "~community/crm/v2/components/organisms/DealSidePanelV2/DealSidePanelV2";
import DealsKanbanBoardSkeletonV2 from "~community/crm/v2/components/organisms/DealsKanbanBoardV2/DealsKanbanBoardSkeletonV2";
import DealsSectionV2 from "~community/crm/v2/components/organisms/DealsSectionV2/DealsSectionV2";
import TaskModalControllerV2 from "~community/crm/v2/components/organisms/TaskModalController/TaskModalController";
import SidePanelWrapperV2 from "~community/crm/v2/components/templates/SidePanelWrapper/SidePanelWrapper";
import { useInitializeCrmData } from "~community/crm/v2/hooks/useInitializeCrmData";
import { useCrmStoreV2 } from "~community/crm/v2/store/store";
import { CrmSidePanelTypes as CrmSidePanelTypesV2 } from "~community/crm/v2/types/CrmTypes";
import useCrmLimitGuard from "~enterprise/crm/hooks/useCrmLimitGuard";
import { CrmLimitResource } from "~enterprise/crm/types/CrmLimitTypes";

const Deals: NextPage = () => {
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
        <SidePanelWrapperV2 isOpen={isCrmSidePanelOpen}>
          {selectedDealId !== null && <DealSidePanelV2 />}
          <AddDealSidePanelV2 />
        </SidePanelWrapperV2>
        <TaskModalControllerV2 />
        {isCrmInitialDataLoading ? (
          <DealsKanbanBoardSkeletonV2 laneCount={4} cardCount={5} />
        ) : (
          <DealsSectionV2 />
        )}
      </>
    </ContentLayout>
  );
};

export default Deals;
