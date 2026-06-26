import { FC } from "react";

import SidePanelWrapper from "~community/crm/components/atoms/SidePanelWrapper/SidePanelWrapper";
import AddDealSidePanel from "~community/crm/components/organisms/AddDealSidePanel/AddDealSidePanel";
import DealSidePanel from "~community/crm/components/organisms/DealSidePanel/DealSidePanel";
import { DealSidePanelTypes } from "~community/crm/enums/common";
import { useCrmStore } from "~community/crm/store/store";

const DealsSidePanelController: FC = () => {
  const { isCrmSidePanelOpen, setIsCrmSidePanelOpen, activeDealSidePanel } =
    useCrmStore((store) => ({
      isCrmSidePanelOpen: store.isCrmSidePanelOpen,
      setIsCrmSidePanelOpen: store.setIsCrmSidePanelOpen,
      activeDealSidePanel: store.activeDealSidePanel
    }));

  const handleClose = () => setIsCrmSidePanelOpen(false);

  return (
    <SidePanelWrapper>
      {activeDealSidePanel === DealSidePanelTypes.DEAL_DETAIL && (
        <DealSidePanel isOpen={isCrmSidePanelOpen} onClose={handleClose} />
      )}
      {activeDealSidePanel === DealSidePanelTypes.ADD_DEAL && (
        <AddDealSidePanel isOpen={isCrmSidePanelOpen} onClose={handleClose} />
      )}
    </SidePanelWrapper>
  );
};

export default DealsSidePanelController;
