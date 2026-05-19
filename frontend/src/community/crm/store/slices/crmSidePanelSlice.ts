import { SetType } from "~community/common/types/CommonTypes";
import { CrmSidePanelContact } from "~community/crm/types/StoreTypes";

const CrmSidePanelSlice = (set: SetType<any>) => ({
  isContactSidePanelOpen: false,
  selectedContactForPanel: null as CrmSidePanelContact | null,

  openContactSidePanel: (contact: CrmSidePanelContact) =>
    set({ isContactSidePanelOpen: true, selectedContactForPanel: contact }),

  closeContactSidePanel: () =>
    set({ isContactSidePanelOpen: false, selectedContactForPanel: null })
});

export default CrmSidePanelSlice;
