import { SetType } from "~community/common/types/CommonTypes";
import { CrmModalTypes } from "~community/crm/types/ModalTypes";
import { CrmContactModalSliceTypes } from "~community/crm/types/SliceTypes";
import { CrmContactMetricsType } from "~community/crm/types/CommonTypes";

const CrmContactSlice = (set: SetType<CrmContactModalSliceTypes>) => ({
  isAddContactModalOpen: false,
  contactModalType: CrmModalTypes.ADD_CONTACT_MODAL,
  selectedContact: null,
  setIsAddContactModalOpen: (isAddContactModalOpen: boolean) =>
    set({ isAddContactModalOpen: isAddContactModalOpen }),
  setContactModalType: (contactModalType: CrmModalTypes) =>
    set({ contactModalType: contactModalType }),
  setSelectedContact: (selectedContact: CrmContactMetricsType | null) =>
    set({ selectedContact })
});

export default CrmContactSlice;
