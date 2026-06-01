import { SetType } from "~community/common/types/CommonTypes";
import { CrmModalTypes } from "~community/crm/types/ModalTypes";
import { CrmContactsModalSliceTypes } from "~community/crm/types/SliceTypes";

const CrmContactsModalSlice = (set: SetType<CrmContactsModalSliceTypes>) => ({
  isAddContactModalOpen: false,
  crmModalType: CrmModalTypes.ADD_CONTACT_MODAL,

  setIsAddContactModalOpen: (isAddContactModalOpen: boolean) =>
    set({ isAddContactModalOpen }),

  setCrmModalType: (crmModalType: CrmModalTypes) =>
    set({ crmModalType })
});

export default CrmContactsModalSlice;
