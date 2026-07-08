import { SetType } from "~community/common/types/CommonTypes";
import {
  CrmCompanyMetricsType,
  CrmCompanyRelationsUpdate
} from "~community/crm/types/CommonTypes";
import { CrmModalTypes } from "~community/crm/types/ModalTypes";
import { CrmCompanySliceTypes } from "~community/crm/types/SliceTypes";
import { mergeCompanyUpdate } from "~community/crm/utils/companyUtil";

const CrmCompanySlice = (
  set: SetType<CrmCompanySliceTypes>,
  get: () => CrmCompanySliceTypes
) => ({
  isCompanyModalOpen: false,
  companyModalType: CrmModalTypes.ADD_COMPANY_MODAL,
  selectedCompanyId: null,
  companies: [],
  setIsCompanyModalOpen: (isCompanyModalOpen: boolean) =>
    set({ isCompanyModalOpen: isCompanyModalOpen }),
  setCompanyModalType: (companyModalType: CrmModalTypes) =>
    set({ companyModalType: companyModalType }),
  setSelectedCompanyId: (selectedCompanyId: number | null) =>
    set({ selectedCompanyId }),
  setCompanies: (companies: CrmCompanyMetricsType[]) => set({ companies }),
  updateCompany: (company: CrmCompanyRelationsUpdate) =>
    set({ companies: mergeCompanyUpdate(get().companies, company) }),
  getCompanyById: (id: number) =>
    get().companies.find((company) => company.id === id)
});

export default CrmCompanySlice;
