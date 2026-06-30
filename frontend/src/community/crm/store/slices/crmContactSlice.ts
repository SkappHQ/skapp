import { SetType } from "~community/common/types/CommonTypes";
import { CrmModalTypes } from "~community/crm/types/ModalTypes";
import { CrmContactSliceTypes } from "~community/crm/types/SliceTypes";

const CrmContactSlice = (set: SetType<CrmContactSliceTypes>) => ({
  isContactModalOpen: false,
  contactModalType: CrmModalTypes.ADD_CONTACT_MODAL,
  selectedContactId: null,
  setIsContactModalOpen: (isContactModalOpen: boolean) =>
    set({ isContactModalOpen: isContactModalOpen }),
  setContactModalType: (contactModalType: CrmModalTypes) =>
    set({ contactModalType: contactModalType }),
  setSelectedContactId: (selectedContactId: number | null) =>
    set({ selectedContactId: selectedContactId })
});

export default CrmContactSlice;
