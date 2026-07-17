import { SetType } from "~community/common/types/CommonTypes";
import { CrmCompany } from "~community/crm/types/CommonTypes";
import { CrmModalTypes } from "~community/crm/types/ModalTypes";
import { CrmCompanySliceTypes } from "~community/crm/types/SliceTypes";
import { updateCompanyTaskCompletion } from "~community/crm/utils/companyUtil";
import { mergeById, mergeWithExisting } from "~community/crm/utils/crmUtil";

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
  setCompanies: (companies: CrmCompany[]) =>
    set({ companies: mergeWithExisting(get().companies, companies) }),
  updateCompany: (company: CrmCompany) =>
    set({ companies: mergeById(get().companies, company) }),
  updateCompanyTaskCompletion: (
    companyId: number,
    taskId: number,
    isCompleted: boolean
  ) =>
    set({
      companies: updateCompanyTaskCompletion(
        get().companies,
        companyId,
        taskId,
        isCompleted
      )
    }),
  removeCompany: (id: number) =>
    set({ companies: get().companies.filter((company) => company.id !== id) }),
  getCompanyById: (id: number) =>
    get().companies.find((company) => company.id === id)
});

export default CrmCompanySlice;
