import { SetType } from "~community/common/types/CommonTypes";
import { CrmCompanyType } from "~community/crm/types/CommonTypes";
import { CrmModalTypes } from "~community/crm/types/ModalTypes";
import { CrmCompanyModalSliceTypes } from "~community/crm/types/SliceTypes";

const CrmCompanyModalSlice = (set: SetType<CrmCompanyModalSliceTypes>) => ({
  isCompanyModalOpen: false,
  companyModalType: CrmModalTypes.ADD_COMPANY_MODAL,
  selectedCompany: null,
  setIsCompanyModalOpen: (isCompanyModalOpen: boolean) =>
    set({ isCompanyModalOpen: isCompanyModalOpen }),
  setCompanyModalType: (companyModalType: CrmModalTypes) =>
    set({ companyModalType: companyModalType }),
  setSelectedCompany: (selectedCompany: CrmCompanyType | null) =>
    set({ selectedCompany: selectedCompany })
});

export default CrmCompanyModalSlice;
