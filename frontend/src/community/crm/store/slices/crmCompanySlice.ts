import { SetType } from "~community/common/types/CommonTypes";
import { CrmCompanyMetricsType } from "~community/crm/types/CommonTypes";
import { CrmModalTypes } from "~community/crm/types/ModalTypes";
import { CrmCompanyModalSliceTypes } from "~community/crm/types/SliceTypes";

const CrmCompanySlice = (set: SetType<CrmCompanyModalSliceTypes>) => ({
  isCompanyModalOpen: false,
  companyModalType: CrmModalTypes.ADD_COMPANY_MODAL,
  selectedCompany: null,
  setIsCompanyModalOpen: (isCompanyModalOpen: boolean) =>
    set({ isCompanyModalOpen: isCompanyModalOpen }),
  setCompanyModalType: (companyModalType: CrmModalTypes) =>
    set({ companyModalType: companyModalType }),
  setSelectedCompany: (selectedCompany: CrmCompanyMetricsType | null) =>
    set({ selectedCompany })
});

export default CrmCompanySlice;
