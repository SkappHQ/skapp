import { SetType } from "~community/common/types/CommonTypes";
import { CrmContactMetricsType } from "~community/crm/types/CommonTypes";
import { CrmModalTypes } from "~community/crm/types/ModalTypes";
import { CrmContactSliceTypes } from "~community/crm/types/SliceTypes";

const CrmContactSlice = (set: SetType<CrmContactSliceTypes>) => ({
  isContactModalOpen: false,
  contactModalType: CrmModalTypes.ADD_CONTACT_MODAL,
  selectedContact: null,
  setIsContactModalOpen: (isContactModalOpen: boolean) =>
    set({ isContactModalOpen }),
  setContactModalType: (contactModalType: CrmModalTypes) =>
    set({ contactModalType: contactModalType }),
  setSelectedContact: (selectedContact: CrmContactMetricsType | null) =>
    set({ selectedContact })
});

export default CrmContactSlice;
