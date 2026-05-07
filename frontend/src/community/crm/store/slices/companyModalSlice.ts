import { CrmModalTypes } from "~community/crm/types/ModalTypes";
import { SetType } from "~community/common/types/CommonTypes";

const companyModalSlice = (set: SetType<any>) => ({
    isAddCompanyModalOpen: false,
    companyModalType: CrmModalTypes.NONE,
    setIsAddCompanyModalOpen: (isAddCompanyModalOpen: boolean) =>
        set({ isAddCompanyModalOpen: isAddCompanyModalOpen }),
    setCompanyModalType: (companyModalType: CrmModalTypes) =>
        set({ companyModalType: companyModalType })
});

export default companyModalSlice;