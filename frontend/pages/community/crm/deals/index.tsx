import { NextPage } from "next";

import ContentLayout from "~community/common/components/templates/ContentLayout/ContentLayout";
import { Modules } from "~community/common/enums/CommonEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { IconName } from "~community/common/types/IconTypes";
import AddDealSidePanel from "~community/crm/components/organisms/AddDealSidePanel/AddDealSidePanel";
import DealSidePanel from "~community/crm/components/organisms/DealSidePanel/DealSidePanel";
import DealsKanbanBoardSkeleton from "~community/crm/components/organisms/DealsKanbanBoard/DealsKanbanBoardSkeleton";
import DealsSection from "~community/crm/components/organisms/DealsSection/DealsSection";
import TaskModalController from "~community/crm/components/organisms/TaskModalController/TaskModalController";
import SidePanelWrapper from "~community/crm/components/templates/SidePanelWrapper/SidePanelWrapper";
import { useInitializeCrmData } from "~community/crm/hooks/useInitializeCrmData";
import { useCrmStore } from "~community/crm/store/store";
import { CrmSidePanelTypes } from "~community/crm/types/CrmTypes";
import useCrmLimitGuard from "~enterprise/crm/hooks/useCrmLimitGuard";
import { CrmLimitResource } from "~enterprise/crm/types/CrmLimitTypes";

const Deals: NextPage = () => {
  const translateText = useTranslator("crmModule");
  const { guardCrmCreate, isCheckingCrmLimit } = useCrmLimitGuard();

  const openCrmSidePanel = useCrmStore((store) => store.openCrmSidePanel);
  const selectedDealId = useCrmStore((store) => store.selectedDealId);
  const isCrmSidePanelOpen = useCrmStore((store) => store.isCrmSidePanelOpen);

  const { isCrmInitialDataLoading } = useInitializeCrmData();

  const handleAddDeal = () => {
    guardCrmCreate(CrmLimitResource.DEALS, () =>
      openCrmSidePanel(CrmSidePanelTypes.ADD_DEAL_SIDE_PANEL)
    );
  };

  return (
    <ContentLayout
      breadcrumbs={[
        { label: translateText(["breadcrumbs", "crm"]) },
        { label: translateText(["deals", "page", "title"]) }
      ]}
      pageHead={translateText(["deals", "page", "pageHead"])}
      title={translateText(["deals", "page", "title"])}
      primaryButtonText={translateText(["deals", "page", "addDealBtn"])}
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
        {isCrmInitialDataLoading ? (
          <DealsKanbanBoardSkeleton laneCount={4} cardCount={5} />
        ) : (
          <DealsSection />
        )}
      </>
    </ContentLayout>
  );
};

export default Deals;
