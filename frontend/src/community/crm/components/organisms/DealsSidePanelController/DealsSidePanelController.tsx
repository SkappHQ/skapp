import { FC } from "react";

import SidePanelWrapper from "~community/crm/components/atoms/SidePanelWrapper/SidePanelWrapper";
import AddDealSidePanel from "~community/crm/components/organisms/AddDealSidePanel/AddDealSidePanel";
import DealSidePanel from "~community/crm/components/organisms/DealSidePanel/DealSidePanel";
import { DealSidePanelTypes } from "~community/crm/enums/common";
import { useCrmStore } from "~community/crm/store/store";

const DealsSidePanelController: FC = () => {
  const { activeDealSidePanel, selectedDealId } = useCrmStore((store) => ({
    activeDealSidePanel: store.activeDealSidePanel,
    selectedDealId: store.selectedDealId
  }));

  return (
    <SidePanelWrapper>
      {activeDealSidePanel === DealSidePanelTypes.DEAL_DETAIL &&
        selectedDealId !== null && <DealSidePanel />}
      {activeDealSidePanel === DealSidePanelTypes.ADD_DEAL && (
        <AddDealSidePanel />
      )}
    </SidePanelWrapper>
  );
};

export default DealsSidePanelController;
