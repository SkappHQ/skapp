import { useCrmStore } from "~community/crm/store/store";
import { CrmSidePanelTypes } from "~community/crm/types/SidePanelTypes";

const useDealDetailPanel = () => {
  const openDealDetail = (dealId: number) => {
    const { setSelectedDealId, openCrmSidePanel } = useCrmStore.getState();
    setSelectedDealId(dealId);
    openCrmSidePanel(CrmSidePanelTypes.DEAL_DETAIL_SIDE_PANEL);
  };

  const closeDealDetail = () => {
    const { setSelectedDealId, closeCrmSidePanel } = useCrmStore.getState();
    setSelectedDealId(null);
    closeCrmSidePanel();
  };

  return { openDealDetail, closeDealDetail };
};

export default useDealDetailPanel;
