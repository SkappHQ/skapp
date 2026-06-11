import { SetType } from "~community/common/types/CommonTypes";
import { CrmContactMetricsType } from "~community/crm/types/CommonTypes";
import { CrmContactSidePanelSliceTypes } from "~community/crm/types/SliceTypes";

const CrmContactSidePanelSlice = (
  set: SetType<CrmContactSidePanelSliceTypes>
) => ({
  isContactSidePanelOpen: false,
  setIsContactSidePanelOpen: (isContactSidePanelOpen: boolean) =>
    set({ isContactSidePanelOpen }),
  selectedContact: null,
  setSelectedContact: (selectedContact: CrmContactMetricsType | null) =>
    set({ selectedContact })
});

export default CrmContactSidePanelSlice;
