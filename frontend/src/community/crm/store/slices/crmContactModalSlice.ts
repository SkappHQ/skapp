import { SetType } from "~community/common/types/CommonTypes";
import { CrmContactType } from "~community/crm/types/CommonTypes";
import { CrmModalTypes } from "~community/crm/types/ModalTypes";
import { CrmContactModalSliceTypes } from "~community/crm/types/SliceTypes";

const CrmContactModalSlice = (set: SetType<CrmContactModalSliceTypes>) => ({
  isContactModalOpen: false,
  contactModalType: CrmModalTypes.EDIT_CONTACT_MODAL,
  selectedContact: null,
  setIsContactModalOpen: (isContactModalOpen: boolean) =>
    set({ isContactModalOpen: isContactModalOpen }),
  setContactModalType: (contactModalType: CrmModalTypes) =>
    set({ contactModalType: contactModalType }),
  setSelectedContact: (selectedContact: CrmContactType | null) =>
    set({ selectedContact: selectedContact })
});

export default CrmContactModalSlice;
