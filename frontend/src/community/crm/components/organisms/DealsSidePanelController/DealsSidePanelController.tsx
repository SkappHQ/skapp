import { FC } from "react";

import SidePanelWrapper from "~community/crm/components/atoms/SidePanelWrapper/SidePanelWrapper";
import AddDealSidePanel from "~community/crm/components/organisms/AddDealSidePanel/AddDealSidePanel";
import DealDetailSidePanel from "~community/crm/components/organisms/DealDetailSidePanel/DealDetailSidePanel";
import { DealSidePanelTypes } from "~community/crm/enums/DealSidePanelTypes";
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
      <DealDetailSidePanel
        isOpen={isCrmSidePanelOpen && activeDealSidePanel === DealSidePanelTypes.DEAL_DETAIL}
        onClose={handleClose}
      />
      <AddDealSidePanel
        isOpen={isCrmSidePanelOpen && activeDealSidePanel === DealSidePanelTypes.ADD_DEAL}
        onClose={handleClose}
      />
    </SidePanelWrapper>
  );
};

export default DealsSidePanelController;
