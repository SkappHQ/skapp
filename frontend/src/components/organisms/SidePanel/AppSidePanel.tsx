import { SidePanel } from "@rootcodelabs/skapp-ui";
import { FC } from "react";

import AddDealSidePanel from "~community/crm/components/organisms/AddDealSidePanel/AddDealSidePanel";
import { useAppStore } from "~store/store";

const AppSidePanel: FC = () => {
  const { isSidePanelOpen, panelItemId, closeSidePanel } = useAppStore(
    (state) => ({
      isSidePanelOpen: state.isSidePanelOpen,
      panelItemId: state.panelItemId,
      closeSidePanel: state.closeSidePanel
    })
  );

  if (isSidePanelOpen && panelItemId === null) {
    return <AddDealSidePanel />;
  }

  return (
    <div className="crm-deal-side-panel">
      <SidePanel
      isOpen={isSidePanelOpen && panelItemId !== null}
      closeOnBackdropClick
      onClose={closeSidePanel}
      width="xl"
    >
      <div key={panelItemId ?? "empty"} />
    </SidePanel>
    </div>
  );
};

export default AppSidePanel;
