import { SetType } from "~community/common/types/CommonTypes";
import { CrmCompanyDetailType } from "~community/crm/types/CommonTypes";
import { CrmModalTypes } from "~community/crm/types/ModalTypes";
import { CrmCompanySliceTypes } from "~community/crm/types/SliceTypes";

const CrmCompanySlice = (
  set: SetType<CrmCompanySliceTypes>,
  get: () => CrmCompanySliceTypes
) => ({
  isCompanyModalOpen: false,
  companyModalType: CrmModalTypes.ADD_COMPANY_MODAL,
  selectedCompanyId: null,
  companies: {},
  setIsCompanyModalOpen: (isCompanyModalOpen: boolean) =>
    set({ isCompanyModalOpen: isCompanyModalOpen }),
  setCompanyModalType: (companyModalType: CrmModalTypes) =>
    set({ companyModalType: companyModalType }),
  setSelectedCompanyId: (selectedCompanyId: number | null) =>
    set({ selectedCompanyId }),
  updateCompany: (company: Partial<CrmCompanyDetailType> & { id: number }) =>
    set((state) => ({
      companies: {
        ...state.companies,
        [company.id]: { ...state.companies[company.id], ...company }
      }
    })),
  getCompanyById: (id: number) => get().companies[id]
});

export default CrmCompanySlice;
