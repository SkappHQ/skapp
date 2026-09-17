import { SidePanel } from "@rootcodelabs/skapp-ui";
import { FC } from "react";
import { useShallow } from "zustand/react/shallow";

import { useCrmStoreV2 } from "~community/crm/v2/store/store";
import { CrmSidePanelTypes } from "~community/crm/v2/types/CrmTypes";

import DealDetailActions from "./DealDetailActions";
import DealDetailContent from "./DealDetailContent";
import DealDetailIdBadge from "./DealDetailIdBadge";

const DealSidePanelV2: FC = () => {
  const {
    isCrmSidePanelOpen,
    crmSidePanelType,
    selectedDealId,
    setSelectedDealId,
    closeCrmSidePanel
  } = useCrmStoreV2(
    useShallow((store) => ({
      isCrmSidePanelOpen: store.isCrmSidePanelOpen,
      crmSidePanelType: store.crmSidePanelType,
      selectedDealId: store.selectedDealId,
      setSelectedDealId: store.setSelectedDealId,
      closeCrmSidePanel: store.closeCrmSidePanel
    }))
  );

  const isOpen =
    isCrmSidePanelOpen &&
    crmSidePanelType === CrmSidePanelTypes.DEAL_DETAIL_SIDE_PANEL;

  const handleClose = () => {
    setSelectedDealId(null);
    closeCrmSidePanel();
  };

  if (selectedDealId == null) return null;

  return (
    <SidePanel
      isOpen={isOpen}
      onClose={handleClose}
      closeOnBackdropClick
      header={
        <div className="flex flex-col gap-3 pl-2">
          <DealDetailIdBadge dealId={selectedDealId} />
        </div>
      }
      headerActions={<DealDetailActions dealId={selectedDealId} />}
    >
      <DealDetailContent dealId={selectedDealId} />
    </SidePanel>
  );
};

export default DealSidePanelV2;
