import { SetType } from "~community/common/types/CommonTypes";
import { CrmCompanyTableDataType } from "~community/crm/types/CommonTypes";
import { CrmModalTypes } from "~community/crm/types/ModalTypes";
import { CrmCompanyModalSliceTypes } from "~community/crm/types/SliceTypes";

const CrmCompanyModalSlice = (set: SetType<CrmCompanyModalSliceTypes>) => ({
  isAddCompanyModalOpen: false,
  companyModalType: CrmModalTypes.ADD_COMPANY_MODAL,
  setIsAddCompanyModalOpen: (isAddCompanyModalOpen: boolean) =>
    set({ isAddCompanyModalOpen: isAddCompanyModalOpen }),
  isDeleteCompanyModalOpen: false,
  setIsDeleteCompanyModalOpen: (isDeleteCompanyModalOpen: boolean) =>
    set({ isDeleteCompanyModalOpen: isDeleteCompanyModalOpen }),
  setCompanyModalType: (companyModalType: CrmModalTypes) =>
    set({ companyModalType: companyModalType }),
  selectedCompany: null,
  setSelectedCompany: (selectedCompany: CrmCompanyTableDataType | null) =>
    set({ selectedCompany: selectedCompany }),
  isCompanyDetailDrawerOpen: false,
  setIsCompanyDetailDrawerOpen: (isCompanyDetailDrawerOpen: boolean) =>
    set({ isCompanyDetailDrawerOpen: isCompanyDetailDrawerOpen })
});

export default CrmCompanyModalSlice;
