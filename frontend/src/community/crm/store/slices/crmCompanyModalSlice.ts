import { SetType } from "~community/common/types/CommonTypes";
import { CrmModalTypes } from "~community/crm/types/ModalTypes";
import { crmCompanyModalSliceTypes } from "~community/crm/types/SliceTypes";

const CrmCompanyModalSlice = (set: SetType<crmCompanyModalSliceTypes>) => ({
  isAddCompanyModalOpen: false,
  companyModalType: CrmModalTypes.NONE,
  setIsAddCompanyModalOpen: (isAddCompanyModalOpen: boolean) =>
    set({ isAddCompanyModalOpen: isAddCompanyModalOpen }),
  setCompanyModalType: (companyModalType: CrmModalTypes) =>
    set({ companyModalType: companyModalType })
});

export default CrmCompanyModalSlice;
