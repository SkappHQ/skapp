import { SetType } from "~community/common/types/CommonTypes";
import { CrmCompanyModalSliceTypes } from "~community/crm/types/SliceTypes";
import { CrmModalTypes } from "~community/crm/types/ModalTypes";
import { CrmCompanyMetricsType } from "~community/crm/types/CommonTypes";

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
