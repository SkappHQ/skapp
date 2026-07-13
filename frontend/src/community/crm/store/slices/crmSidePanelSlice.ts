import { SetType } from "~community/common/types/CommonTypes";
import { CrmSidePanelTypes } from "~community/crm/types/SidePanelTypes";
import { CrmStore } from "~community/crm/types/StoreTypes";

const CrmSidePanelSlice = (set: SetType<CrmStore>) => ({
  isCrmSidePanelOpen: false,
  crmSidePanelType: null,
  openCrmSidePanel: (type: CrmSidePanelTypes) =>
    set({
      isCrmSidePanelOpen: true,
      crmSidePanelType: type
    }),
  closeCrmSidePanel: () =>
    set({
      isCrmSidePanelOpen: false,
      crmSidePanelType: null
    })
});

export default CrmSidePanelSlice;
