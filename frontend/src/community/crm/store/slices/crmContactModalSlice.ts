import { SetType } from "~community/common/types/CommonTypes";
import { CrmModalTypes } from "~community/crm/types/ModalTypes";
import { CrmContactModalSliceTypes } from "~community/crm/types/SliceTypes";

const CrmContactModalSlice = (set: SetType<CrmContactModalSliceTypes>) => ({
  isAddContactModalOpen: false,
  contactModalType: CrmModalTypes.ADD_CONTACT_MODAL,
  setIsAddContactModalOpen: (isAddContactModalOpen: boolean) =>
    set({ isAddContactModalOpen: isAddContactModalOpen }),
  setContactModalType: (contactModalType: CrmModalTypes) =>
    set({ contactModalType: contactModalType })
});

export default CrmContactModalSlice;
