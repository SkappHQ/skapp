import { SidePanel } from "@rootcodelabs/skapp-ui";
import { FC, useState } from "react";
import { useShallow } from "zustand/react/shallow";

import DeleteDealModal from "~community/crm/components/molecules/DeleteDealModal/DeleteDealModal";
import { useCrmStore } from "~community/crm/store/store";
import { CrmSidePanelTypes } from "~community/crm/types/CrmTypes";

import DealDetailActions from "./DealDetailActions";
import DealDetailContent from "./DealDetailContent";
import DealDetailIdBadge from "./DealDetailIdBadge";

const DealSidePanel: FC = () => {
  const {
    isCrmSidePanelOpen,
    crmSidePanelType,
    selectedDealId,
    dealName,
    setSelectedDealId,
    closeCrmSidePanel
  } = useCrmStore(
    useShallow((store) => ({
      isCrmSidePanelOpen: store.isCrmSidePanelOpen,
      crmSidePanelType: store.crmSidePanelType,
      selectedDealId: store.selectedDealId,
      dealName:
        store.selectedDealId != null
          ? store.deals[store.selectedDealId]?.name
          : undefined,
      setSelectedDealId: store.setSelectedDealId,
      closeCrmSidePanel: store.closeCrmSidePanel
    }))
  );

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const isOpen =
    isCrmSidePanelOpen &&
    crmSidePanelType === CrmSidePanelTypes.DEAL_DETAIL_SIDE_PANEL;

  const handleClose = () => {
    setSelectedDealId(null);
    closeCrmSidePanel();
  };

  if (selectedDealId == null) return null;

  return (
    <>
      <SidePanel
        isOpen={isOpen}
        onClose={handleClose}
        closeOnBackdropClick
        header={
          <div className="flex flex-col gap-3 pl-2">
            <DealDetailIdBadge dealId={selectedDealId} />
          </div>
        }
        headerActions={
          <DealDetailActions
            dealId={selectedDealId}
            onDeleteClick={() => setIsDeleteModalOpen(true)}
          />
        }
      >
        <DealDetailContent dealId={selectedDealId} />
      </SidePanel>

      {dealName && (
        <DeleteDealModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          dealName={dealName}
        />
      )}
    </>
  );
};

export default DealSidePanel;
