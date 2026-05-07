import { CrmModalTypes } from "~community/crm/types/ModalTypes";
import { SetType } from "~community/common/types/CommonTypes";

const crmSlice = (set: SetType<any>) => ({
    isAddCompanyModalOpen: false,
    crmModalType: CrmModalTypes.NONE,

    setIsAddCompanyModalOpen: (isAddCompanyModalOpen: boolean) =>
        set({ isAddCompanyModalOpen: isAddCompanyModalOpen }),
    setCrmModalType: (crmModalType: CrmModalTypes) =>
        set({ crmModalType: crmModalType })
});

export default crmSlice;