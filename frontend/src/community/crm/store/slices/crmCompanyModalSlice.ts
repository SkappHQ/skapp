import { SetType } from "~community/common/types/CommonTypes";
import { CrmCompanyMetricsType } from "~community/crm/types/CommonTypes";
import { CrmCompanyModalSliceTypes } from "~community/crm/types/SliceTypes";
import { CrmModalTypes } from "~community/crm/types/ModalTypes";

const CrmCompanyModalSlice = (set: SetType<CrmCompanyModalSliceTypes>) => ({
  isCompanyModalOpen: false,
  companyModalType: CrmModalTypes.ADD_COMPANY_MODAL,
  setIsCompanyModalOpen: (isCompanyModalOpen: boolean) =>
    set({ isCompanyModalOpen: isCompanyModalOpen }),
  setCompanyModalType: (companyModalType: CrmModalTypes) =>
    set({ companyModalType: companyModalType }),
  setSelectedCompany: (selectedCompany: CrmCompanyMetricsType | null) =>
    set({ selectedCompany: selectedCompany })
});

export default CrmCompanyModalSlice;
