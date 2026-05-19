import { SetType } from "~community/common/types/CommonTypes";
import { CrmContactDetailSliceTypes } from "~community/crm/types/SliceTypes";

const CrmContactDetailSlice = (set: SetType<CrmContactDetailSliceTypes>) => ({
  isContactDetailPanelOpen: false,
  selectedContactId: null as number | null,

  openContactDetailPanel: (id: number) =>
    set({ isContactDetailPanelOpen: true, selectedContactId: id }),
  closeContactDetailPanel: () =>
    set({ isContactDetailPanelOpen: false, selectedContactId: null })
});

export default CrmContactDetailSlice;
