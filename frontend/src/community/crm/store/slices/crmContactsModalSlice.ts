import { SetType } from "~community/common/types/CommonTypes";
import { CrmModalTypes } from "~community/crm/types/ModalTypes";

const CrmContactsModalSlice = (set: SetType<any>) => ({
  isAddContactModalOpen: false,
  crmModalType: CrmModalTypes.ADD_CONTACT_MODAL,

  setIsAddContactModalOpen: (isAddContactModalOpen: boolean) =>
    set({ isAddContactModalOpen }),

  setCrmModalType: (crmModalType: CrmModalTypes) =>
    set({ crmModalType })
});

export default CrmContactsModalSlice;
